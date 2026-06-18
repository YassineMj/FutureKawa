import json, time, random, argparse
from datetime import datetime, timezone
import paho.mqtt.client as mqtt

# Conditions idéales par pays (temp °C, humidité %)
IDEAUX = {
    "bresil":   (29.0, 55.0),
    "equateur": (31.0, 60.0),
    "colombie": (26.0, 80.0),
}

def payload(capteur_id, ideal_temp, ideal_hum, mode):
    if mode == "derive":            # hors plage -> déclenche une alerte CONDITION
        temp = round(ideal_temp + random.choice([-1, 1]) * random.uniform(6, 9), 2)
        hum  = round(ideal_hum  + random.choice([-1, 1]) * random.uniform(8, 15), 2)
    else:                           # nominal : autour de l'idéal du pays
        temp = round(ideal_temp + random.uniform(-1, 1), 2)
        hum  = round(ideal_hum  + random.uniform(-1, 1), 2)
    return {
        "capteurId": capteur_id,
        "temperature": temp,
        "humidite": max(0, min(100, hum)),   # borne l'humidité dans [0,100]
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--pays", choices=["bresil", "equateur", "colombie"], default="bresil")
    p.add_argument("--host", default="localhost")
    p.add_argument("--port", type=int, default=1883)
    p.add_argument("--entrepot", default="1")
    p.add_argument("--capteur", default=None)   # par défaut : capteur-<pays>-e<entrepot>
    p.add_argument("--mode", choices=["nominal", "derive"], default="nominal")
    p.add_argument("--interval", type=float, default=3.0)
    args = p.parse_args()

    ideal_temp, ideal_hum = IDEAUX[args.pays]
    capteur = args.capteur or f"capteur-{args.pays}-e{args.entrepot}"
    topic = f"futurekawa/{args.pays}/{args.entrepot}/mesures"

    client = mqtt.Client()
    client.connect(args.host, args.port, 60)
    print(f"Simulateur {args.pays} -> {topic} (capteur={capteur}, mode={args.mode}, ideal={ideal_temp}/{ideal_hum})")
    try:
        while True:
            data = payload(capteur, ideal_temp, ideal_hum, args.mode)
            client.publish(topic, json.dumps(data), qos=1)
            print("publié:", data)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("arrêt")
        client.disconnect()

if __name__ == "__main__":
    main()