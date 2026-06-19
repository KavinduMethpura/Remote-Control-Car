import { useState, useEffect, useRef, useCallback } from 'react';
import { useBluetoothSerial } from './hooks/useBluetoothSerial';
import { Joystick } from './components/Joystick';
import { SpeedSlider } from './components/SpeedSlider';
import { BluetoothConnect } from './components/BluetoothConnect';
import { formatJoystickCommand } from './services/btCommands';

export default function App() {
  const {
    devices,
    connectedDevice,
    isScanning,
    logs,
    isSimulation,
    scanDevices,
    connectDevice,
    disconnectDevice,
    sendCommand,
    clearLogs
  } = useBluetoothSerial();

  const [speedLimit, setSpeedLimit] = useState(65); // Default speed limit to 65% for safety
  const [estop, setEstop] = useState(false);
  
  // Refs to store active joystick coordinates (avoiding state rebuild overhead in 50ms loops)
  const coordsRef = useRef({ x: 0, y: 0 });

  // Track active joystick movements
  const handleJoystickChange = useCallback((x: number, y: number) => {
    coordsRef.current = { x, y };
  }, []);

  const handleJoystickEnd = useCallback(() => {
    coordsRef.current = { x: 0, y: 0 };
  }, []);

  // Emergency stop toggle
  const triggerEmergencyStop = useCallback(() => {
    setEstop(true);
    coordsRef.current = { x: 0, y: 0 };
    if (connectedDevice) {
      sendCommand(formatJoystickCommand(0, 0));
    }
  }, [connectedDevice, sendCommand]);

  const disarmEmergencyStop = useCallback(() => {
    setEstop(false);
  }, []);

  // Periodic transmission loop (runs at 50ms intervals while connected)
  useEffect(() => {
    if (!connectedDevice) return;

    const interval = setInterval(() => {
      // 1. Force 0 speed if Emergency Stop is active
      const targetCoords = estop ? { x: 0, y: 0 } : coordsRef.current;

      // 2. Scale coordinate deflection by the speed limit
      const scaledX = (targetCoords.x * speedLimit) / 100;
      const scaledY = (targetCoords.y * speedLimit) / 100;

      // 3. Format command packet
      const cmd = formatJoystickCommand(scaledX, scaledY);

      // 4. Send command to the car
      sendCommand(cmd);

    }, 50); // 20 Hz transmission rate

    return () => clearInterval(interval);
  }, [connectedDevice, speedLimit, estop, sendCommand]);

  return (
    <div className="cyber-container">
      {/* HUD Header */}
      <header className="cyber-header">
        <div>
          <h1 className="glow-cyan-text" style={styles.hudTitle}>SLAM-CAR COMMAND HUD</h1>
          <span style={styles.hudSub}>SYSTEM VERSION: 1.0.0 // SPP PROTOCOL ACTIVE</span>
        </div>
        <div style={styles.connectionBadge}>
          {isSimulation && <span style={styles.simBadge}>SIMULATOR</span>}
          <span style={styles.pingText}>LINK STATE:</span>
          <span style={{
            ...styles.pingVal,
            color: connectedDevice ? 'var(--neon-green)' : 'var(--neon-pink)'
          }}>
            {connectedDevice ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Main Control Deck */}
      <main className="cyber-grid">
        {/* Left Control Deck */}
        <section style={styles.leftDeck}>
          {/* Bluetooth Settings */}
          <BluetoothConnect
            devices={devices}
            connectedDevice={connectedDevice}
            isScanning={isScanning}
            isSimulation={isSimulation}
            onScan={scanDevices}
            onConnect={connectDevice}
            onDisconnect={disconnectDevice}
          />

          {/* Speed Limit Controls */}
          <SpeedSlider
            value={speedLimit}
            onChange={setSpeedLimit}
            disabled={!connectedDevice || estop}
          />

          {/* Emergency Stop Panel */}
          <div className="cyber-card" style={styles.estopCard}>
            <span className="font-tech" style={styles.estopTitle}>SAFETY SYSTEMS</span>
            {estop ? (
              <button 
                className="cyber-btn cyber-btn-cyan"
                onClick={disarmEmergencyStop}
                style={styles.estopBtnDisarm}
              >
                ⚠️ DISARM SAFETY SHUTDOWN
              </button>
            ) : (
              <button 
                className="cyber-btn cyber-btn-pink"
                onClick={triggerEmergencyStop}
                disabled={!connectedDevice}
                style={{
                  ...styles.estopBtnTrigger,
                  boxShadow: connectedDevice ? '0 0 15px rgba(255, 0, 127, 0.4)' : 'none'
                }}
              >
                🚨 EMERGENCY STOP (E-STOP)
              </button>
            )}
          </div>
        </section>

        {/* Right Navigation Deck */}
        <section style={styles.rightDeck}>
          {/* Joystick Dashboard */}
          <div className="cyber-card" style={styles.joystickCard}>
            <div style={styles.cardHeader}>
              <span className="font-tech" style={styles.cardTitle}>TACTILE NAVIGATION STEERING</span>
              {estop && <span style={styles.estopActiveWarning}>E-STOP ACTIVE</span>}
            </div>
            <Joystick
              disabled={!connectedDevice || estop}
              onChange={handleJoystickChange}
              onEnd={handleJoystickEnd}
            />
          </div>

          {/* Terminal Console log */}
          <div className="cyber-card" style={styles.terminalCard}>
            <div style={styles.terminalHeader}>
              <span className="font-tech" style={styles.terminalTitle}>TELEMETRY STREAM LOGS</span>
              <button 
                onClick={clearLogs}
                style={styles.clearBtn}
              >
                CLEAR RX/TX
              </button>
            </div>
            <div style={styles.consoleBox}>
              {logs.length === 0 ? (
                <div style={styles.consoleEmpty}>AWAITING TELEMETRY DATA CHANNEL CONNECTION...</div>
              ) : (
                logs.map((log, index) => {
                  let logColor = 'var(--text-muted)';
                  if (log.includes('TX: J:0,0')) logColor = 'rgba(255, 255, 255, 0.2)';
                  else if (log.includes('TX:')) logColor = 'var(--neon-cyan)';
                  else if (log.includes('Connected')) logColor = 'var(--neon-green)';
                  else if (log.includes('Error') || log.includes('Failed')) logColor = 'var(--neon-pink)';
                  else if (log.includes('SAFETY')) logColor = 'var(--neon-yellow)';

                  return (
                    <div 
                      key={index} 
                      style={{ ...styles.consoleLine, color: logColor }}
                    >
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  hudTitle: {
    fontSize: '1.25rem',
    fontWeight: 900,
    letterSpacing: '0.15em',
  },
  hudSub: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  connectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  simBadge: {
    fontSize: '0.55rem',
    background: 'rgba(255, 230, 0, 0.1)',
    color: 'var(--neon-yellow)',
    border: '1px solid var(--neon-yellow)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  pingText: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
  },
  pingVal: {
    fontSize: '0.65rem',
    fontWeight: 'bold',
    fontFamily: 'Orbitron, sans-serif',
  },
  leftDeck: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  rightDeck: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  estopCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
  },
  estopTitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
  },
  estopBtnTrigger: {
    width: '100%',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  estopBtnDisarm: {
    width: '100%',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    border: '1px solid var(--neon-yellow)',
    color: 'var(--neon-yellow)',
    background: 'rgba(255, 230, 0, 0.05)',
  },
  joystickCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '15px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
    paddingBottom: '8px',
  },
  cardTitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
  },
  estopActiveWarning: {
    fontSize: '0.65rem',
    color: 'var(--neon-pink)',
    fontWeight: 'bold',
    fontFamily: 'Orbitron, sans-serif',
    animation: 'pulse 1s infinite alternate',
  },
  terminalCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    flexGrow: 1,
  },
  terminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  terminalTitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--neon-cyan)',
    fontSize: '0.65rem',
    fontFamily: 'Orbitron, sans-serif',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  consoleBox: {
    background: 'rgba(5, 6, 11, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    height: '140px',
    overflowY: 'auto',
    padding: '10px',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    display: 'flex',
    flexDirection: 'column-reverse', // Keeps recent logs at the top
    gap: '4px',
  },
  consoleEmpty: {
    color: 'rgba(255, 255, 255, 0.15)',
    textAlign: 'center',
    paddingTop: '45px',
    fontSize: '0.7rem',
  },
  consoleLine: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.2',
    letterSpacing: '0.02em',
  }
};
