// =============================================================================
//  config.example.h  --  MODELE de configuration (committable, sans secret)
// -----------------------------------------------------------------------------
//  Ce fichier sert d'exemple. Procedure :
//    1. Copiez-le sous le nom "config.h" dans ce meme dossier (include/).
//    2. Remplacez les valeurs d'exemple par vos vraies valeurs.
//    3. config.h est ignore par git (.gitignore) : vos secrets ne partent JAMAIS
//       sur le depot. Seul ce config.example.h est versionne.
// =============================================================================

#ifndef CONFIG_H
#define CONFIG_H

// --- Wi-Fi ---
#define WIFI_SSID       "NOM_DU_WIFI"        // ex: "Livebox-1234"
#define WIFI_PASSWORD   "MOT_DE_PASSE_WIFI"  // ex: "monMotDePasse"

// --- Broker MQTT (Mosquitto en local) ---
#define MQTT_BROKER_IP  "192.168.1.10"       // adresse IP de la machine qui heberge Mosquitto
#define MQTT_PORT       1883                  // port MQTT par defaut (non chiffre)

// --- Topic de publication ---
#define MQTT_TOPIC      "futurekawa/BR/entrepot/1/mesures"

#endif // CONFIG_H
