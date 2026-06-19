import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { BluetoothSerial, type BluetoothDevice } from '@e-is/capacitor-bluetooth-serial';

export const useBluetoothSerial = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const isNative = Capacitor.isNativePlatform();
  const connectedDeviceRef = useRef<BluetoothDevice | null>(null);

  // Keep ref up to date to prevent closure issues in intervals/callbacks
  useEffect(() => {
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  // Log message helper
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]); // Keep last 50 logs
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Initialize
  useEffect(() => {
    addLog(`System initialized in ${isNative ? 'NATIVE' : 'BROWSER SIMULATION'} mode.`);
    if (!isNative) {
      addLog("Tip: Click 'SCAN' to view simulated Bluetooth devices.");
    }
  }, [isNative, addLog]);

  // Scan Devices
  const scanDevices = useCallback(async () => {
    if (isScanning) return;
    setIsScanning(true);
    addLog("Scanning for Bluetooth Classic devices...");

    if (!isNative) {
      // Simulate scan delay
      setTimeout(() => {
        const mockDevices: BluetoothDevice[] = [
          {
            name: "SLAM_CAR_RC (Simulated)",
            address: "AA:BB:CC:11:22:33",
            id: "AA:BB:CC:11:22:33",
            class: 0,
            uuid: "00001101-0000-1000-8000-00805f9b34fb",
            rssi: -45
          },
          {
            name: "CyberOBD2_Sensor",
            address: "44:55:66:77:88:99",
            id: "44:55:66:77:88:99",
            class: 0,
            uuid: "00001101-0000-1000-8000-00805f9b34fb",
            rssi: -72
          }
        ];
        setDevices(mockDevices);
        setIsScanning(false);
        addLog(`Scan complete. Found ${mockDevices.length} devices.`);
      }, 1500);
      return;
    }

    try {
      // Check/enable bluetooth
      const status = await BluetoothSerial.isEnabled();
      if (!status.enabled) {
        addLog("Bluetooth is disabled. Requesting enabling...");
        await BluetoothSerial.enable();
      }

      const scanResult = await BluetoothSerial.scan();
      setDevices(scanResult.devices || []);
      addLog(`Scan complete. Found ${(scanResult.devices || []).length} devices.`);
    } catch (err: any) {
      addLog(`Scan Error: ${err.message || err}`);
    } finally {
      setIsScanning(false);
    }
  }, [isNative, isScanning, addLog]);

  // Connect to Device
  const connectDevice = useCallback(async (device: BluetoothDevice) => {
    addLog(`Connecting to ${device.name} [${device.address}]...`);
    
    if (!isNative) {
      // Simulate connection delay
      setTimeout(() => {
        setConnectedDevice(device);
        addLog(`Connected to ${device.name} (Simulated). Ready for joystick inputs.`);
      }, 1000);
      return;
    }

    try {
      // Connect classic SPP
      await BluetoothSerial.connect({ address: device.address });
      setConnectedDevice(device);
      addLog(`Successfully connected to ${device.name}!`);
    } catch (err: any) {
      addLog(`Connection Failed: ${err.message || err}`);
    }
  }, [isNative, addLog]);

  // Disconnect Device
  const disconnectDevice = useCallback(async () => {
    const device = connectedDeviceRef.current;
    if (!device) return;

    addLog(`Disconnecting from ${device.name}...`);

    if (!isNative) {
      setTimeout(() => {
        setConnectedDevice(null);
        addLog("Disconnected (Simulated).");
      }, 500);
      return;
    }

    try {
      await BluetoothSerial.disconnect({ address: device.address });
      setConnectedDevice(null);
      addLog("Successfully disconnected.");
    } catch (err: any) {
      addLog(`Disconnection Error: ${err.message || err}`);
    }
  }, [isNative, addLog]);

  // Send Command
  const sendCommand = useCallback(async (cmd: string) => {
    const device = connectedDeviceRef.current;
    if (!device) return;

    // Log the transmission in console
    addLog(`TX: ${cmd.replace('\n', '\\n')}`);

    if (!isNative) {
      // Browser simulation just logs (already logged above)
      return;
    }

    try {
      await BluetoothSerial.write({
        address: device.address,
        value: cmd
      });
    } catch (err: any) {
      addLog(`Write Error: ${err.message || err}`);
      // If writing failed due to connection break, trigger disconnect locally
      disconnectDevice();
    }
  }, [isNative, addLog, disconnectDevice]);

  return {
    devices,
    connectedDevice,
    isScanning,
    logs,
    isSimulation: !isNative,
    scanDevices,
    connectDevice,
    disconnectDevice,
    sendCommand,
    clearLogs
  };
};
