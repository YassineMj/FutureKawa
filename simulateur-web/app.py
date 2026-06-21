"""
Module de simulation FutureKawa (FastAPI).

Rôle :
- Sert une page web (menus en cascade pays -> entrepôt -> capteur).
- Lit les référentiels via le back-end CENTRAL (un seul interlocuteur).
- Publie des mesures simulées en MQTT (même topic/format que le vrai capteur).
- Gère plusieurs simulations en parallèle (une par capteur) dans des threads.
- Expose l'état live (dernières valeurs) pour l'affichage temps réel.

Le back-end métier ne sait pas que la donnée est simulée : on publie sur
futurekawa/{pays}/{entrepot}/mesures, exactement comme le ferait un ESP32.
"""

import json
import random
import threading
import time
from datetime import datetime, timezone

import httpx
import paho.mqtt.client as mqtt
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
CENTRAL_URL = "http://localhost:8090"     # back-end central (annuaire + référentiels)
MQTT_HOST = "localhost"
MQTT_PORT = 1883

SIM_EMAIL = "simulateur@futurekawa.example"
SIM_PASSWORD = "Admin123!"

# Conditions idéales par pays (température °C, humidité %) — alignées sur le back-end
IDEAUX = {
    "BRESIL":   (29.0, 55.0),
    "EQUATEUR": (31.0, 60.0),
    "COLOMBIE": (26.0, 80.0),
}

app = FastAPI(title="FutureKawa - Simulateur de capteurs")

# ---------------------------------------------------------------------------
# Gestion des simulations en cours
# ---------------------------------------------------------------------------
# clé = identifiant capteur ; valeur = dict avec thread, stop_event, état live
_simulations: dict[str, dict] = {}
_lock = threading.Lock()


def _payload(ideal_temp: float, ideal_hum: float, mode: str) -> dict:
    if mode == "anomalie":
        temp = round(ideal_temp + random.choice([-1, 1]) * random.uniform(6, 9), 2)
        hum = round(ideal_hum + random.choice([-1, 1]) * random.uniform(8, 15), 2)
    else:  # normal
        temp = round(ideal_temp + random.uniform(-1, 1), 2)
        hum = round(ideal_hum + random.uniform(-1, 1), 2)
    return {
        "temperature": temp,
        "humidite": max(0.0, min(100.0, hum)),
    }


def _boucle_simulation(sim: dict):
    """Boucle exécutée dans un thread : publie en MQTT jusqu'à l'arrêt."""
    client = mqtt.Client()
    try:
        client.connect(MQTT_HOST, MQTT_PORT, 60)
        client.loop_start()
    except Exception as e:  # broker injoignable
        sim["erreur"] = f"Connexion MQTT impossible : {e}"
        sim["actif"] = False
        return

    topic = f"futurekawa/{sim['pays'].lower()}/{sim['entrepotId']}/mesures"
    ideal_temp, ideal_hum = IDEAUX.get(sim["pays"], (29.0, 55.0))

    while not sim["stop"].is_set():
        valeurs = _payload(ideal_temp, ideal_hum, sim["mode"])
        message = {
            "capteurId": sim["capteurId"],
            "temperature": valeurs["temperature"],
            "humidite": valeurs["humidite"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        client.publish(topic, json.dumps(message), qos=1)

        # bande acceptable du pays (±3 °C / ±2 %) pour le voyant live
        hors_plage = (
            abs(valeurs["temperature"] - ideal_temp) > 3
            or abs(valeurs["humidite"] - ideal_hum) > 2
        )
        sim["dernier"] = {**message, "horsPlage": hors_plage, "topic": topic}
        sim["compteur"] += 1

        sim["stop"].wait(sim["frequence"])

    client.loop_stop()
    client.disconnect()
    sim["actif"] = False


# ---------------------------------------------------------------------------
# Modèles d'entrée
# ---------------------------------------------------------------------------
class DemarrerRequest(BaseModel):
    pays: str
    entrepotId: int
    capteurId: str
    mode: str = "normal"        # "normal" ou "anomalie"
    frequence: float = 5.0      # secondes


# ---------------------------------------------------------------------------
# Endpoints "référentiel" (proxy vers le central) pour alimenter les menus
# ---------------------------------------------------------------------------
# jeton courant (rempli au 1er appel, renouvelé si expiré)
_token = {"value": None}


def _login_central() -> str:
    """Se connecte au central avec le compte technique et renvoie un JWT."""
    r = httpx.post(
        f"{CENTRAL_URL}/auth/login",
        json={"email": SIM_EMAIL, "motDePasse": SIM_PASSWORD},
        timeout=5.0,
    )
    r.raise_for_status()
    return r.json()["accessToken"]

def _get_central(path: str):
    """GET authentifié vers le central. Re-login auto si jeton manquant/expiré (401)."""
    if _token["value"] is None:
        _token["value"] = _login_central()

    def _call():
        return httpx.get(
            f"{CENTRAL_URL}{path}",
            headers={"Authorization": f"Bearer {_token['value']}"},
            timeout=5.0,
        )

    try:
        resp = _call()
        if resp.status_code == 401:           # jeton expiré -> on se reconnecte
            _token["value"] = _login_central()
            resp = _call()
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Central injoignable ou refus : {e}")

@app.get("/api/pays")
def pays():
    # ne garder que les pays disponibles
    return [p for p in _get_central("/api/pays") if p.get("disponible")]


@app.get("/api/pays/{code}/exploitations")
def exploitations(code: str):
    return _get_central(f"/api/pays/{code}/exploitations")


@app.get("/api/pays/{code}/exploitations/{exp_id}/entrepots")
def entrepots(code: str, exp_id: int):
    return _get_central(f"/api/pays/{code}/exploitations/{exp_id}/entrepots")


@app.get("/api/pays/{code}/entrepots/{entrepot_id}/capteurs")
def capteurs(code: str, entrepot_id: int):
    return _get_central(f"/api/pays/{code}/entrepots/{entrepot_id}/capteurs")


# ---------------------------------------------------------------------------
# Endpoints de pilotage de la simulation
# ---------------------------------------------------------------------------
@app.post("/api/simulation/demarrer")
def demarrer(req: DemarrerRequest):
    with _lock:
        existante = _simulations.get(req.capteurId)
        if existante and existante.get("actif"):
            raise HTTPException(status_code=409,
                                detail="Une simulation tourne déjà pour ce capteur")

        sim = {
            "pays": req.pays,
            "entrepotId": req.entrepotId,
            "capteurId": req.capteurId,
            "mode": req.mode,
            "frequence": max(1.0, req.frequence),
            "stop": threading.Event(),
            "actif": True,
            "compteur": 0,
            "dernier": None,
            "erreur": None,
        }
        t = threading.Thread(target=_boucle_simulation, args=(sim,), daemon=True)
        sim["thread"] = t
        _simulations[req.capteurId] = sim
        t.start()
    return {"statut": "demarree", "capteurId": req.capteurId}


@app.post("/api/simulation/arreter/{capteur_id}")
def arreter(capteur_id: str):
    with _lock:
        sim = _simulations.get(capteur_id)
        if not sim:
            raise HTTPException(status_code=404, detail="Aucune simulation pour ce capteur")
        sim["stop"].set()
        sim["actif"] = False
    return {"statut": "arretee", "capteurId": capteur_id}


@app.get("/api/simulation/etat")
def etat():
    """État live de toutes les simulations (pour l'affichage temps réel)."""
    with _lock:
        return [
            {
                "capteurId": cid,
                "pays": s["pays"],
                "entrepotId": s["entrepotId"],
                "mode": s["mode"],
                "frequence": s["frequence"],
                "actif": s["actif"],
                "compteur": s["compteur"],
                "dernier": s["dernier"],
                "erreur": s["erreur"],
            }
            for cid, s in _simulations.items()
        ]


# ---------------------------------------------------------------------------
# Page web
# ---------------------------------------------------------------------------
@app.get("/")
def index():
    return FileResponse("static/index.html")


app.mount("/static", StaticFiles(directory="static"), name="static")
