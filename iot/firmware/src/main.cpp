// =============================================================================
//  FutureKawa -- Firmware de supervision d'entrepot de cafe
//  Carte : NodeMCU ESP8266 (board = nodemcuv2)
// -----------------------------------------------------------------------------
//  Role du programme :
//    1. Se connecter au Wi-Fi.
//    2. Se connecter au broker MQTT Mosquitto (local, port 1883).
//    3. Lire la temperature (C) et l'humidite (%) du capteur DHT22 toutes les 30 s.
//    4. Publier un JSON {"temperature": 28.5, "humidite": 60.2}
//       sur le topic futurekawa/BR/entrepot/1/mesures.
//    5. Afficher les valeurs sur un ecran OLED SSD1306 (si present, sinon on
//       continue quand meme).
//
//  Les identifiants (Wi-Fi, IP broker...) NE sont PAS dans ce fichier :
//  ils vivent dans include/config.h (ignore par git). Voir config.example.h.
// =============================================================================

#include <Arduino.h>
#include <ESP8266WiFi.h>     // pile Wi-Fi de l'ESP8266
#include <PubSubClient.h>    // client MQTT
#include <Wire.h>            // bus I2C (pour l'ecran OLED)
#include <Adafruit_GFX.h>    // primitives graphiques (requis par l'OLED)
#include <Adafruit_SSD1306.h>// pilote de l'ecran OLED
#include <DHT.h>             // capteur DHT22

#include "config.h"          // <-- VOS identifiants (cree a partir de config.example.h)

// -----------------------------------------------------------------------------
//  CONSTANTES DE CABLAGE / CONFIGURATION MATERIELLE
// -----------------------------------------------------------------------------

// Capteur DHT22 : broche DATA sur D4 (le core ESP8266 traduit "D4" en GPIO2).
#define DHT_PIN   D4
#define DHT_TYPE  DHT22

// Ecran OLED I2C SSD1306 0,96" : SCL sur D1, SDA sur D2, adresse I2C 0x3C.
#define OLED_LARGEUR  128   // pixels en largeur
#define OLED_HAUTEUR  64    // pixels en hauteur
#define OLED_ADRESSE  0x3C  // adresse I2C standard de ce module
#define OLED_SDA      D2    // broche SDA
#define OLED_SCL      D1    // broche SCL

// Intervalle entre deux mesures : 30 secondes (en millisecondes).
const unsigned long INTERVALLE_MESURE_MS = 30000UL;

// -----------------------------------------------------------------------------
//  OBJETS GLOBAUX
// -----------------------------------------------------------------------------

// Objet capteur DHT22.
DHT dht(DHT_PIN, DHT_TYPE);

// Le client MQTT s'appuie sur un client TCP Wi-Fi (couche reseau).
WiFiClient   clientWifi;
PubSubClient clientMqtt(clientWifi);

// Ecran OLED. Le "-1" indique qu'aucune broche RESET dediee n'est utilisee.
Adafruit_SSD1306 ecran(OLED_LARGEUR, OLED_HAUTEUR, &Wire, -1);

// Indique si l'ecran OLED a bien repondu a l'initialisation.
// Si false, on n'essaie plus de dessiner dessus (mais le reste tourne).
bool oledPresent = false;

// Horodatage de la derniere mesure (pour cadencer sans bloquer avec delay()).
unsigned long dernierMesureMs = 0;

// -----------------------------------------------------------------------------
//  DECLARATIONS DE FONCTIONS
// -----------------------------------------------------------------------------
void connecterWifi();
void assurerConnexionMqtt();
void initialiserOled();
void afficherSurOled(float temperature, float humidite);
void afficherMessageOled(const String& ligne1, const String& ligne2);
void lireEtPublier();

// =============================================================================
//  SETUP  --  execute une seule fois au demarrage
// =============================================================================
void setup() {
  // Moniteur serie a 115200 bauds (a regler a l'identique dans le moniteur).
  Serial.begin(115200);
  delay(100);
  Serial.println();
  Serial.println(F("=== FutureKawa : demarrage du firmware ==="));

  // 1) Initialisation du capteur DHT22.
  dht.begin();

  // 2) Initialisation de l'ecran OLED (non bloquante : on continue meme en cas d'echec).
  initialiserOled();
  afficherMessageOled("FutureKawa", "Demarrage...");

  // 3) Connexion Wi-Fi.
  connecterWifi();

  // 4) Configuration du serveur MQTT (IP + port). La connexion elle-meme
  //    sera (re)tentee dans la boucle via assurerConnexionMqtt().
  clientMqtt.setServer(MQTT_BROKER_IP, MQTT_PORT);
}

// =============================================================================
//  LOOP  --  execute en boucle
// =============================================================================
void loop() {
  // a) Si le Wi-Fi est tombe, on le reconnecte.
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WIFI] Connexion perdue, nouvelle tentative..."));
    connecterWifi();
  }

  // b) On s'assure d'etre connecte au broker MQTT (reconnexion si besoin).
  assurerConnexionMqtt();

  // c) clientMqtt.loop() entretient la connexion MQTT (keep-alive, reception).
  //    A appeler regulierement.
  clientMqtt.loop();

  // d) Cadencement non bloquant : on mesure toutes les 30 s sans figer le
  //    programme (contrairement a delay(30000) qui bloquerait tout).
  unsigned long maintenant = millis();
  if (maintenant - dernierMesureMs >= INTERVALLE_MESURE_MS) {
    dernierMesureMs = maintenant;
    lireEtPublier();
  }
}

// =============================================================================
//  CONNEXION WI-FI
//  Boucle jusqu'a obtenir une connexion. Affiche l'avancement sur le serie.
// =============================================================================
void connecterWifi() {
  Serial.print(F("[WIFI] Connexion au reseau : "));
  Serial.println(WIFI_SSID);
  afficherMessageOled("WiFi...", WIFI_SSID);

  WiFi.mode(WIFI_STA);                 // mode station (client), pas point d'acces
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // On attend la connexion en affichant un point toutes les 500 ms.
  unsigned long debut = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(F("."));

    // Securite : si ca traine trop (15 s), on relance proprement begin().
    if (millis() - debut > 15000) {
      Serial.println(F("\n[WIFI] Toujours pas connecte, nouvelle tentative..."));
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      debut = millis();
    }
  }

  Serial.println();
  Serial.print(F("[WIFI] Connecte ! Adresse IP : "));
  Serial.println(WiFi.localIP());
  afficherMessageOled("WiFi OK", WiFi.localIP().toString());
}

// =============================================================================
//  CONNEXION / RECONNEXION MQTT
//  Si on n'est pas connecte au broker, on tente une reconnexion.
//  On ne bloque pas indefiniment : une tentative par appel, et on ressort.
// =============================================================================
void assurerConnexionMqtt() {
  // Deja connecte ? Rien a faire.
  if (clientMqtt.connected()) {
    return;
  }

  Serial.print(F("[MQTT] Connexion au broker "));
  Serial.print(MQTT_BROKER_IP);
  Serial.print(F(":"));
  Serial.print(MQTT_PORT);
  Serial.println(F(" ..."));

  // Identifiant client unique (utile si plusieurs capteurs partagent le broker).
  // On suffixe avec l'adresse MAC pour garantir l'unicite.
  String idClient = "futurekawa-entrepot1-" + String(WiFi.macAddress());

  // Tentative de connexion (broker Mosquitto sans authentification ici).
  if (clientMqtt.connect(idClient.c_str())) {
    Serial.println(F("[MQTT] Connecte au broker."));
    afficherMessageOled("MQTT OK", "Pret");
  } else {
    // clientMqtt.state() renvoie un code d'erreur (voir doc PubSubClient).
    Serial.print(F("[MQTT] Echec, code = "));
    Serial.print(clientMqtt.state());
    Serial.println(F(". Nouvel essai au prochain cycle."));
    afficherMessageOled("MQTT KO", "Reessai...");

    // Petite pause pour ne pas marteler le broker en cas d'echec repete.
    delay(2000);
  }
}

// =============================================================================
//  LECTURE DU DHT22 + PUBLICATION MQTT
// =============================================================================
void lireEtPublier() {
  // Lecture des deux grandeurs. En cas de probleme, le DHT renvoie NaN.
  float humidite    = dht.readHumidity();
  float temperature = dht.readTemperature();   // par defaut en degres Celsius

  // Garde-fou : si l'une des lectures a echoue (NaN), on n'publie PAS et on
  // sort proprement. isnan() teste la valeur "Not a Number".
  if (isnan(humidite) || isnan(temperature)) {
    Serial.println(F("[DHT22] Echec de lecture (NaN) -> publication ignoree."));
    afficherMessageOled("DHT22", "Erreur lecture");
    return;
  }

  // Trace serie des valeurs lues.
  Serial.print(F("[DHT22] Temperature = "));
  Serial.print(temperature, 1);   // 1 chiffre apres la virgule
  Serial.print(F(" C, Humidite = "));
  Serial.print(humidite, 1);
  Serial.println(F(" %"));

  // Mise a jour de l'ecran OLED.
  afficherSurOled(temperature, humidite);

  // Construction du message JSON au format EXACT demande :
  //   {"temperature": 28.5, "humidite": 60.2}
  // snprintf evite tout debordement memoire (buffer de taille fixe).
  char charge[64];
  snprintf(charge, sizeof(charge),
           "{\"temperature\": %.1f, \"humidite\": %.1f}",
           temperature, humidite);

  // Publication. clientMqtt.publish() renvoie true si l'envoi a reussi.
  if (clientMqtt.publish(MQTT_TOPIC, charge)) {
    Serial.print(F("[MQTT] Publie sur "));
    Serial.print(MQTT_TOPIC);
    Serial.print(F(" : "));
    Serial.println(charge);
  } else {
    Serial.println(F("[MQTT] Echec de publication (broker injoignable ?)."));
  }
}

// =============================================================================
//  INITIALISATION DE L'ECRAN OLED (non bloquante)
//  Si l'ecran ne repond pas, oledPresent reste false et le programme continue.
// =============================================================================
void initialiserOled() {
  // On demarre le bus I2C sur les broches cablees (SDA=D2, SCL=D1).
  Wire.begin(OLED_SDA, OLED_SCL);

  // begin() renvoie false si l'ecran ne repond pas a son adresse I2C.
  if (ecran.begin(SSD1306_SWITCHCAPVCC, OLED_ADRESSE)) {
    oledPresent = true;
    Serial.println(F("[OLED] Ecran detecte et initialise."));
    ecran.clearDisplay();
    ecran.setTextColor(SSD1306_WHITE);
    ecran.display();
  } else {
    oledPresent = false;
    Serial.println(F("[OLED] Ecran absent ou non detecte -> on continue sans."));
  }
}

// =============================================================================
//  AFFICHAGE DES MESURES SUR L'OLED
//  Ne fait rien si l'ecran n'est pas present (securite anti-blocage).
// =============================================================================
void afficherSurOled(float temperature, float humidite) {
  if (!oledPresent) {
    return;
  }

  ecran.clearDisplay();

  // Titre.
  ecran.setTextSize(1);
  ecran.setCursor(0, 0);
  ecran.println(F("FutureKawa - Entrepot 1"));

  // Temperature en grand.
  ecran.setTextSize(2);
  ecran.setCursor(0, 20);
  ecran.print(temperature, 1);
  ecran.print((char)247);   // caractere degre
  ecran.println(F("C"));

  // Humidite en grand.
  ecran.setCursor(0, 44);
  ecran.print(humidite, 1);
  ecran.println(F(" %"));

  ecran.display();
}

// =============================================================================
//  AFFICHAGE D'UN MESSAGE TEXTE SIMPLE SUR L'OLED (etats : WiFi, MQTT...)
//  Ne fait rien si l'ecran n'est pas present.
// =============================================================================
void afficherMessageOled(const String& ligne1, const String& ligne2) {
  if (!oledPresent) {
    return;
  }

  ecran.clearDisplay();
  ecran.setTextSize(1);

  ecran.setCursor(0, 0);
  ecran.println(ligne1);

  ecran.setCursor(0, 16);
  ecran.println(ligne2);

  ecran.display();
}
