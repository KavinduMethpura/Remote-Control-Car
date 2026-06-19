# Hardware Pin Mapping

This document lists the hardware connections between the ESP32 development board and the L298N Motor Driver.

## Motor Control Pins

| ESP32 Pin | Function | L298N Driver Pin | Description |
|-----------|----------|------------------|-------------|
| **GPIO 18** (D18) | PWM Enable A | `ENA` | Left Motor Speed Control |
| **GPIO 14** (D14) | Input 1 | `IN1` | Left Motor Direction Control 1 |
| **GPIO 5**  (D5)  | Input 2 | `IN2` | Left Motor Direction Control 2 |
| **GPIO 23** (D23) | PWM Enable B | `ENB` | Right Motor Speed Control |
| **GPIO 2**  (D2)  | Input 3 | `IN3` | Right Motor Direction Control 1 |
| **GPIO 4**  (D4)  | Input 4 | `IN4` | Right Motor Direction Control 2 |

*Note: Make sure that the ESP32 and L298N share a common ground (GND).*

## Power Connections
- **L298N VS**: 7V - 12V Battery Pack positive terminal
- **L298N GND**: Battery negative terminal & ESP32 GND
- **L298N 5V**: Can power the ESP32 Vin if the L298N onboard regulator is enabled (jumpers placed). Ensure the battery input is high enough (>7V) for the regulator to operate.
