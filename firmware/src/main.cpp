#include <Arduino.h>
#include <BluetoothSerial.h>
#include "pins.h"
#include "MotorDriver.h"
#include "BTCommandParser.h"

// Check if Bluetooth is enabled in the configuration
#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to enable it
#endif

BluetoothSerial SerialBT;
MotorDriver motor;

unsigned long lastCommandTime = 0;
bool motorsActive = false;
String rxBuffer = "";

void setup() {
    // Initialize USB Serial for debugging
    Serial.begin(115200);
    delay(500);
    Serial.println("=== SLAM Car RC Firmware Starting ===");

    // Initialize Motor Driver
    motor.init();
    Serial.println("Motor Driver initialized.");

    // Initialize Bluetooth Classic Serial (SPP)
    if (SerialBT.begin("SLAM_CAR_RC")) {
        Serial.println("Bluetooth Serial started! Broadcast name: SLAM_CAR_RC");
    } else {
        Serial.println("An error occurred initializing Bluetooth Serial");
    }

    lastCommandTime = millis();
}

void loop() {
    // 1. Read Bluetooth Serial using a non-blocking character accumulator
    while (SerialBT.available() > 0) {
        char c = (char)SerialBT.read();
        
        if (c == '\n') {
            // Process the completed packet
            int leftSpeed = 0;
            int rightSpeed = 0;
            
            if (BTCommandParser::parseAndMix(rxBuffer, leftSpeed, rightSpeed)) {
                // Apply the calculated wheel speeds
                motor.drive(leftSpeed, rightSpeed);
                lastCommandTime = millis();
                
                // Track if motors are running
                motorsActive = (leftSpeed != 0 || rightSpeed != 0);
                
                Serial.printf("Parsed Cmd: \"%s\" -> Left: %d, Right: %d\n", rxBuffer.c_str(), leftSpeed, rightSpeed);
            } else {
                Serial.printf("Failed to parse cmd: \"%s\"\n", rxBuffer.c_str());
            }
            
            // Reset buffer for the next packet
            rxBuffer = "";
        } else {
            // Avoid overflow: ignore carriage returns or control characters, buffer rest
            if (c != '\r') {
                if (rxBuffer.length() < 64) {
                    rxBuffer += c;
                } else {
                    // Reset buffer if overflowed to prevent memory exhaustion
                    rxBuffer = "";
                }
            }
        }
    }

    // 2. Safety Timeout: Stop motors if no Bluetooth packets received in 500ms
    if (motorsActive && (millis() - lastCommandTime > SAFETY_TIMEOUT_MS)) {
        motor.stop();
        motorsActive = false;
        Serial.printf("SAFETY WATCHDOG: Timeout (no commands for %dms). Stopping motors.\n", SAFETY_TIMEOUT_MS);
    }

    // Yield control to support ESP32 background tasks
    delay(1);
}
