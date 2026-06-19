#ifndef PINS_H
#define PINS_H

#include <Arduino.h>

// Left Motor (A) Connections
#define PIN_ENA 18  // PWM pin for speed control
#define PIN_IN1 14  // Direction control 1
#define PIN_IN2 5   // Direction control 2

// Right Motor (B) Connections
#define PIN_ENB 23  // PWM pin for speed control
#define PIN_IN3 2   // Direction control 1
#define PIN_IN4 4   // Direction control 2

// PWM Configuration Parameters
#define PWM_FREQ       20000 // 20 kHz frequency (above human hearing range)
#define PWM_RESOLUTION 8     // 8-bit resolution (0 - 255)
#define PWM_CH_LEFT    0     // LEDC channel for Left Motor
#define PWM_CH_RIGHT   1     // LEDC channel for Right Motor

// Safety Configurations
#define SAFETY_TIMEOUT_MS 500 // Stop motors if no Bluetooth command is received for 500ms

#endif // PINS_H
