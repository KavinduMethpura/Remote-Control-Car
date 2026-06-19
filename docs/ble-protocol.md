# Bluetooth Control Protocol

This document defines the communication protocol between the React mobile controller app and the ESP32 firmware over Classic Bluetooth Serial (SPP).

## Command Format

The mobile app continuously streams text packets terminated by a newline (`\n`):

```
J:x,y\n
```

### Parameters
- **`J`**: Header character indicating a Joystick coordinate packet.
- **`x`**: Integer value from `-100` to `100` representing steering (horizontal axis).
  - `-100` = Full Left
  - `0` = Neutral (Center)
  - `100` = Full Right
- **`y`**: Integer value from `-100` to `100` representing throttle (vertical axis).
  - `-100` = Full Reverse
  - `0` = Neutral (Stop)
  - `100` = Full Forward

### Transmission Frequency
- Packets are transmitted at approximately **50ms intervals** (20 Hz) while the joystick is active.
- If the joystick returns to neutral (0,0), a final `J:0,0\n` packet is transmitted, and the stream pauses until further interaction.

---

## ESP32 Mixing Algorithm

The firmware receives the `x` and `y` coordinates and mixes them into left and right motor speeds:

1. **Calculate raw speeds**:
   $$\text{rawLeft} = y + x$$
   $$\text{rawRight} = y - x$$

2. **Scale dynamically**:
   To preserve steering intent and prevent saturation when driving at high speeds, if either speed exceeds the $[-100, 100]$ range, we scale both proportionally:
   $$\text{maxVal} = \max(|\text{rawLeft}|, |\text{rawRight}|)$$
   $$\text{if } \text{maxVal} > 100:$$
   $$\quad \text{leftScaled} = \text{rawLeft} \times \frac{100}{\text{maxVal}}$$
   $$\quad \text{rightScaled} = \text{rawRight} \times \frac{100}{\text{maxVal}}$$
   $$\text{else}:$$
   $$\quad \text{leftScaled} = \text{rawLeft}$$
   $$\quad \text{rightScaled} = \text{rawRight}$$

3. **Map to 8-bit PWM**:
   Map the scaled left and right values from the range $[-100, 100]$ to 8-bit PWM speed outputs $[-255, 255]$:
   $$\text{leftPWM} = \text{leftScaled} \times 2.55$$
   $$\text{rightPWM} = \text{rightScaled} \times 2.55$$

---

## Safety Timeout (Keepalive)

- The firmware implements a **500ms safety timer**.
- Every time a valid `J:x,y\n` command is successfully parsed, the timer resets.
- If no valid packet is received for 500ms (e.g., app crash, connection loss, or out of range), the firmware automatically cuts power to both motors (`leftPWM = 0`, `rightPWM = 0`) to prevent runaways.
