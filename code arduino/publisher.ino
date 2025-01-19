

#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

// LoRa pins
#define SCK 5
#define MISO 19
#define MOSI 27
#define SS 18
#define RST 14
#define DIO0 26

// Sensor pins
#define FLAME_SENSOR_PIN 34
#define BUZZER_PIN 2
#define MQ2_PIN 32

// DHT configuration
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Wi-Fi configuration
const char* ssid = "sou";
const char* password = "asma2001";

// MQTT configuration
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* temp_topic = "iot/sensor/temperature";
const char* hum_topic = "iot/sensor/humidity";
const char* flam_topic = "iot/sensor/flamme";
const char* gaz_topic = "iot/sensor/gaz";

WiFiClient espClient;
PubSubClient client(espClient);

// Timers
unsigned long previousMQTTMillis = 0;
const long mqttInterval = 5000; // Publish MQTT data every 5 seconds
unsigned long previousLoRaMillis = 0;
const long loRaInterval = 5000; // Send LoRa data every 5 seconds

// Thresholds
const int FLAME_THRESHOLD = 600;  // Flame detection threshold (adjust based on your sensor)
const int MQ2_THRESHOLD = 2500;   // Gas detection threshold (adjust based on your sensor)

// Debounce settings
unsigned long lastFlameDetection = 0;
unsigned long flameDebounceDelay = 3000;  // 3 seconds debounce delay for flame detection

unsigned long lastGasDetection = 0;
unsigned long gasDebounceDelay = 3000;  // 3 seconds debounce delay for gas detection

void setup() {
  Serial.begin(115200);

  // Initialize SPI and LoRa
  SPI.begin(SCK, MISO, MOSI, SS);
  LoRa.setPins(SS, RST, DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("Failed to start LoRa!");
    while (1);
  }
  Serial.println("LoRa initialized!");

  // Connect to Wi-Fi
  connectWiFi();

  // Initialize MQTT
  client.setServer(mqttServer, mqttPort);

  // Initialize DHT
  dht.begin();

  // Configure pins
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  pinMode(MQ2_PIN, INPUT);
  pinMode(FLAME_SENSOR_PIN, INPUT);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  unsigned long currentMillis = millis();

  // Publish MQTT data every mqttInterval milliseconds
  if (currentMillis - previousMQTTMillis >= mqttInterval) {
    previousMQTTMillis = currentMillis;
    publishMQTTData();
  }

  // Send LoRa data every loRaInterval milliseconds
  if (currentMillis - previousLoRaMillis >= loRaInterval) {
    previousLoRaMillis = currentMillis;
    sendLoRaData();
  }

  // Check flame and gas levels
  checkFlameAndGas();
}

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32Publisher")) {
      Serial.println("Connected to MQTT!");
    } else {
      Serial.print("Failed, rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void publishMQTTData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int flameValue = analogRead(FLAME_SENSOR_PIN);
  int mq2Value = analogRead(MQ2_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read DHT sensor!");
    return;
  }

  char tempString[8], humString[8], flamString[8], gazString[8];
  dtostrf(temperature, 6, 2, tempString);
  dtostrf(humidity, 6, 2, humString);
  dtostrf(flameValue, 6, 2, flamString);
  dtostrf(mq2Value, 6, 2, gazString);

  client.publish(temp_topic, tempString);
  client.publish(hum_topic, humString);
  client.publish(flam_topic, flamString);
  client.publish(gaz_topic, gazString);

  Serial.println("MQTT Data Published:");
  Serial.printf("Temperature: %s °C, Humidity: %s %%, Flame: %s, Gas: %s\n", tempString, humString, flamString, gazString);
}

void sendLoRaData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int flameValue = analogRead(FLAME_SENSOR_PIN);
  int mq2Value = analogRead(MQ2_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read DHT sensor for LoRa!");
    return;
  }

  char tempString[8], humString[8], flamString[8], gazString[8];
  dtostrf(temperature, 6, 2, tempString);
  dtostrf(humidity, 6, 2, humString);
  dtostrf(flameValue, 6, 2, flamString);
  dtostrf(mq2Value, 6, 2, gazString);

  LoRa.beginPacket();
  LoRa.print("Temp: ");
  LoRa.print(tempString);
  LoRa.print(" C, Hum: ");
  LoRa.print(humString);
  LoRa.print(" %, Flame: ");
  LoRa.print(flamString);
  LoRa.print(", Gas: ");
  LoRa.print(gazString);
  LoRa.endPacket();

  Serial.println("LoRa Data Sent:");
  Serial.printf("Temperature: %s °C, Humidity: %s %%, Flame: %s, Gas: %s\n", tempString, humString, flamString, gazString);
}

void checkFlameAndGas() {
  int flameValue = analogRead(FLAME_SENSOR_PIN);
  int mq2Value = analogRead(MQ2_PIN);
  unsigned long currentMillis = millis();

  // Condition for flame
  if (flameValue > 500 && currentMillis - lastFlameDetection > flameDebounceDelay) {
    Serial.println("Alert! Flame detected!");
    digitalWrite(BUZZER_PIN, HIGH); // Activate the buzzer
    delay(100);                    // Keep the buzzer active for 1 second
    digitalWrite(BUZZER_PIN, LOW);  // Deactivate the buzzer
    lastFlameDetection = currentMillis; // Update last flame detection time
  }

  // Condition for gas
  if (mq2Value > 2500 ) {
    Serial.println("Alert! High gas level detected!");
    digitalWrite(BUZZER_PIN, HIGH); // Activate the buzzer
    delay(1000);                    // Keep the buzzer active for 1 second
    digitalWrite(BUZZER_PIN, LOW);  // Deactivate the buzzer
    lastGasDetection = currentMillis; // Update last gas detection time
  }
}

