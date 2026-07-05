# slam-car-rc-stage

Remote control stack for an ESP32-powered RC car. The project is split into two parts:

- `app/` - a React + Vite + Capacitor controller app for Bluetooth joystick control and emergency stop
- `firmware/` - an ESP32 PlatformIO firmware that receives Bluetooth Serial commands and drives the motors

The controller app can run in a browser simulation mode for UI testing, or on a native Capacitor build for real Bluetooth Classic communication.

## Features

- Joystick-based steering and throttle control
- Adjustable speed limit for safer driving
- Emergency stop that forces the command stream to neutral
- Live TX/RX log view in the controller UI
- ESP32 safety watchdog that stops the motors if commands stop arriving

## Repository Layout

```text
app/       React controller app
docs/      Protocol and wiring documentation
firmware/  ESP32 firmware and motor driver code
```

## Requirements

- Node.js 20 or newer
- npm
- PlatformIO for the ESP32 firmware
- An ESP32 board with Bluetooth Classic support
- L298N motor driver and the wiring described in `docs/pin-mapping.md`

## Controller App Setup

1. Open a terminal in `app/`.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the Vite URL shown in the terminal.

Useful scripts in `app/package.json`:

- `npm run dev` - start the dev server
- `npm run build` - type-check and build for production
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

### Native Bluetooth Build

The app uses `@e-is/capacitor-bluetooth-serial` for Bluetooth Classic support on native builds. Browser mode does not talk to hardware; it simulates scan/connect behavior so the UI can still be exercised on a desktop.

If you need an Android build, sync the Capacitor project after building the web app and follow the usual Android/Capacitor workflow for your environment.

## Firmware Setup

1. Open `firmware/` in PlatformIO or VS Code with the PlatformIO extension.
2. Build and upload the firmware to the ESP32.
3. Confirm the Bluetooth broadcast name is `SLAM_CAR_RC`.
4. Pair the controller device with the ESP32 and connect from the app.

The firmware reads newline-terminated packets over Bluetooth Serial, mixes joystick input into left and right motor speeds, and stops the motors if no valid packet arrives within 500 ms.

## Bluetooth Protocol

The controller sends joystick packets in this format:

```text
J:x,y\n
```

Where:

- `x` is steering from `-100` to `100`
- `y` is throttle from `-100` to `100`
- `J:0,0\n` is the neutral stop command

The app transmits commands every 50 ms while connected.

For the full packet and mixing rules, see [docs/ble-protocol.md](docs/ble-protocol.md).

## Motor Wiring

The ESP32 to L298N wiring used by the firmware is documented in [docs/pin-mapping.md](docs/pin-mapping.md).

## Safety Behavior

- The app defaults to a conservative speed limit of 65%.
- Emergency stop forces joystick output back to `0,0`.
- The firmware watchdog stops both motors after 500 ms without a valid packet.
- Keep the battery ground and ESP32 ground common.

## Development Notes

- The app has a browser simulation path, so UI work can be done without hardware attached.
- Bluetooth scanning and writing only happen on native Capacitor builds.
- The firmware uses Bluetooth Classic SPP, not BLE.

## Troubleshooting

- If the app shows no devices, confirm you are on a native build and Bluetooth permissions are granted.
- If the ESP32 does not respond, verify the board name, pairing state, and serial baud output in the firmware monitor.
- If the motors move in the wrong direction, check the L298N wiring and the pin mapping.
- If the car runs briefly and then stops, check the watchdog timeout and whether joystick packets are still arriving.

## Related Docs

- [Bluetooth protocol](docs/ble-protocol.md)
- [Pin mapping](docs/pin-mapping.md)
