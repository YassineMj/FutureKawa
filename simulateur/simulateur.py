import json, time, random, argparse
from datetime import datetime, timezone
import paho.mqtt.client as mqtt

# Conditions idéales Brésil : 29°C / 55%
IDEAL_TEMP, IDEAL_HUM = 29.0, 55.0

def payload(capteur_id, mode):
    if mode == "derive":            # hors plage -> déclenchera une alerte en Phase 4
        temp = round(random.uniform(36, 39), 2)
        hum  = round(random.uniform(70, 80), 2)
    else:                           # nominal : autour de l'idéal
        temp = round(IDEAL_TEMP + random.uniform(-1, 1), 2)
        hum  = round(IDEAL_HUM + random.uniform(-1, 1), 2)
    return {
        "capteurId": capteur_id,
        "temperature": temp,
        "humidite": hum,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--host", default="localhost")
    p.add_argument("--port", type=int, default=1883)
    p.add_argument("--entrepot", default="1")
    p.add_argument("--capteur", default="capteur-bresil-e1")
    p.add_argument("--mode", choices=["nominal", "derive"], default="nominal")
    p.add_argument("--interval", type=float, default=3.0)
    args = p.parse_args()

    topic = f"futurekawa/bresil/{args.entrepot}/mesures"
    client = mqtt.Client()
    client.connect(args.host, args.port, 60)
    print(f"Simulateur connecté -> {topic} (mode={args.mode})")
    try:
        while True:
            data = payload(args.capteur, args.mode)
            client.publish(topic, json.dumps(data), qos=1)
            print("publié:", data)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("arrêt")
        client.disconnect()

if __name__ == "__main__":
    main()