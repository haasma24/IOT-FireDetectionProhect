#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>  // Bibliothèque pour MQTT

#include <SPI.h>
#include <LoRa.h>

// Définir les broches LoRa
#define SCK 5
#define MISO 19
#define MOSI 27
#define SS 18
#define RST 14
#define DIO0 26

// Paramètres du réseau Wi-Fi
const char* ssid = "sou";                      // Nom de votre réseau Wi-Fi
const char* password = "asma2001";             // Mot de passe de votre réseau Wi-Fi

// Paramètres du broker MQTT
const char* mqttServer = "broker.hivemq.com";  // Broker MQTT public
const int mqttPort = 1883;

// Topics MQTT
const char* temp_topic = "iot/sensor/temperature"; // Topic pour la température
const char* hum_topic = "iot/sensor/humidity";    // Topic pour l'humidité
const char* flam_topic = "iot/sensor/flamme";     // Topic pour la flamme
const char* gaz_topic = "iot/sensor/gaz";         // Topic pour le gaz

// Firebase
const char* firebaseHost = "https://firedetectionapp-f9127-default-rtdb.firebaseio.com/"; // URL de la base Firebase
const char* apiKey = "AIzaSyD932po7oLpGLsysd-QUizW-LyFIFMuxuY";  // Clé API Firebase

WiFiClient espClient;
PubSubClient client(espClient);

// Variables pour stocker les dernières mesures reçues
String lastTemperature = "N/A";
String lastHumidity = "N/A";
String lastFlame = "N/A";
String lastGas = "N/A";

// Callback appelée lorsqu'un message MQTT est reçu
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  if (strcmp(topic, temp_topic) == 0) {
    lastTemperature = message;
    Serial.println("Température mise à jour : " + lastTemperature);
  } else if (strcmp(topic, hum_topic) == 0) {
    lastHumidity = message;
    Serial.println("Humidité mise à jour : " + lastHumidity);
  } else if (strcmp(topic, flam_topic) == 0) {
    lastFlame = message;
    Serial.println("Valeur de la flamme mise à jour : " + lastFlame);
  } else if (strcmp(topic, gaz_topic) == 0) {
    lastGas = message;
    Serial.println("Valeur du gaz mise à jour : " + lastGas);
  }

  // Envoyer les données mises à jour vers Firebase
  sendToFirebase();
}

void setup() {
  Serial.begin(115200);

  while (!Serial);

  Serial.println("LoRa Receiver");

  // Initialisation SPI manuelle
  SPI.begin(SCK, MISO, MOSI, SS);

  // Initialisation de LoRa
  LoRa.setPins(SS, RST, DIO0);
  if (!LoRa.begin(433E6)) {  // Fréquence LoRa (433 MHz par défaut)
    Serial.println("Erreur de démarrage LoRa !");
    while (1);
  }

  Serial.println("LoRa démarré avec succès !");

  // Connexion au Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Configurer le client MQTT
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  // Se connecter au broker MQTT
  reconnectMQTT();
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();  // Garder la connexion MQTT active

  // Envoyer les données périodiquement
  static unsigned long lastSendTime = 0;
  if (millis() - lastSendTime > 10000) {  // Toutes les 10 secondes
    sendToFirebase();
    lastSendTime = millis();
  }

    // Vérifier si un paquet est reçu
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    Serial.println("Paquet reçu :");

    // Lire le contenu du paquet
    while (LoRa.available()) {
      String message = LoRa.readString();
      Serial.print(message);
    }
    Serial.println();

    // Afficher la force du signal (RSSI)
    Serial.print("RSSI : ");
    Serial.println(LoRa.packetRssi());
  }
}

// Fonction pour reconnecter le client MQTT
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Subscriber")) { // Identifiant unique pour le client
      Serial.println("connected");

      // S'abonner aux topics
      client.subscribe(temp_topic);
      client.subscribe(hum_topic);
      client.subscribe(flam_topic);
      client.subscribe(gaz_topic);

      Serial.println("Abonné aux topics MQTT");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);  // Attendre avant de réessayer
    }
  }
}

// Fonction pour envoyer les données vers Firebase
void sendToFirebase() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Construire l'URL Firebase
    String url = String(firebaseHost) + "/data.json?auth=" + apiKey;

    // Construire le JSON des données
    String jsonPayload = "{";
    jsonPayload += "\"temperature\":\"" + lastTemperature + "\",";
    jsonPayload += "\"humidity\":\"" + lastHumidity + "\",";
    jsonPayload += "\"flame\":\"" + lastFlame + "\",";
    jsonPayload += "\"gaz\":\"" + lastGas + "\"";
    jsonPayload += "}";

    // Envoyer la requête HTTP POST
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.PUT(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.println("Données envoyées à Firebase avec succès !");
      Serial.println("Code réponse : " + String(httpResponseCode));
    } else {
      Serial.println("Erreur lors de l'envoi vers Firebase.");
      Serial.println("Code erreur : " + String(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi non connecté. Impossible d'envoyer les données.");
  }
}
