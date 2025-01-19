Fire Detection System

This repository contains the code and documentation for a comprehensive fire detection system that integrates IoT devices, a mobile application, and a web application. The system is designed to monitor and report potential fire hazards in real-time using various sensors and communication technologies.

Features

Real-time Monitoring: Collects data from sensors like flame, gas, temperature, and humidity to detect fire hazards.

Long-Range Communication: Utilizes LoRa for reliable, long-range communication between devices.

Mobile App: Displays sensor data and alerts in real time.

Web App: Provides a dashboard for monitoring and managing the system.

MQTT Integration: Implements MQTT protocol for efficient message transmission.

Technologies Used

Hardware:

Arduino: Controls the sensors and processes data.

LoRa SX1278: Facilitates long-range communication between devices.

Sensors:

Flame sensor (digital output).

Gas sensor.

DHT11 (temperature and humidity sensor).

GPS module (for location data).

Software:

MQTT: Managed by HiveMQ broker for message queuing.

Mobile App: Built using Android Studio to visualize sensor data.

Web App: Developed with modern web technologies for an intuitive dashboard.

Wokwi: Used for simulation and testing of the Arduino setup.

System Architecture

IoT Device (Node 1):

Reads data from the flame, gas, DHT11, and GPS sensors.

Sends data to the second device via LoRa.

Communication Device (Node 2):

Receives sensor data from Node 1.

Publishes data to the MQTT broker.

HiveMQ MQTT Broker:

Routes messages to the mobile and web applications.

Mobile App:

Subscribes to MQTT topics to display real-time data and alerts.

Web App:

Provides a dashboard for viewing historical and real-time data.

Installation

Hardware Setup

Connect the sensors to the first ESP32 device (Node 1) as per the wiring diagram.

Configure the LoRa module for communication.

Set up the second ESP32 device (Node 2) to receive data from Node 1.

Usage

Power on the IoT devices.

Launch the mobile app and log in.

Open the web app dashboard.

Monitor real-time sensor data and alerts.

Contributions

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

Contact

For queries or support, please contact [a.hammami24193@pi.tn].
