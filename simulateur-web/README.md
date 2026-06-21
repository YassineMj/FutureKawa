# Module de simulation FutureKawa (web)

Outil de démonstration : génère des mesures (température / humidité) et les publie
en MQTT comme un capteur réel. Interface web avec sélection en cascade
**pays → entrepôt → capteur**, mode normal/anomalie, fréquence réglable, et
affichage live (valeurs + graphe).

## Prérequis (à lancer AVANT)
- L'infra Docker (Mosquitto + bases) : `docker compose up -d` dans `infra/`
- Les back-ends pays (8080/8081/8082) et le **central (8090)**
  (le simulateur lit les référentiels via le central et publie sur Mosquitto)

## Installation
```bash
cd simulateur-web
python -m venv .venv
# Windows :
.venv\Scripts\activate
# (Linux/Mac : source .venv/bin/activate)
pip install -r requirements.txt
```

## Lancement
```bash
uvicorn app:app --port 8050
```
Puis ouvre **http://localhost:8050**

## Utilisation
1. Choisis un **pays**, une **exploitation**, un **entrepôt**, un **capteur** (menus en cascade).
2. Choisis le **mode** (Normal = dans la plage du pays / Anomalie = hors plage → déclenche une alerte).
3. Règle la **fréquence** (ex. 5 s).
4. **Démarrer** : les mesures partent en MQTT ; les valeurs et le graphe s'actualisent en direct.
5. Le voyant passe au **rouge** quand les valeurs sortent de la plage (= une alerte va se lever côté back-end).
6. **Arrêter** quand tu veux.

> Le back-end ne sait pas que la donnée est simulée : on publie sur
> `futurekawa/{pays}/{entrepot}/mesures`, exactement comme le ferait un ESP32.
> Le jour où le capteur réel arrive, rien ne change côté back-end.

## Configuration
Dans `app.py` : `CENTRAL_URL` (défaut http://localhost:8090), `MQTT_HOST`/`MQTT_PORT`.
