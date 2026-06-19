import type { BluetoothDevice } from '@e-is/capacitor-bluetooth-serial';

interface BluetoothConnectProps {
  devices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  isScanning: boolean;
  isSimulation: boolean;
  onScan: () => void;
  onConnect: (device: BluetoothDevice) => void;
  onDisconnect: () => void;
}

export const BluetoothConnect: React.FC<BluetoothConnectProps> = ({
  devices,
  connectedDevice,
  isScanning,
  isSimulation,
  onScan,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="cyber-card" style={styles.container}>
      {/* Header with Connection Status Indicator */}
      <div style={styles.header}>
        <span className="font-tech" style={styles.title}>COMMUNICATIONS</span>
        <div style={styles.statusBadge}>
          <div 
            style={{
              ...styles.statusDot,
              backgroundColor: connectedDevice ? 'var(--neon-green)' : 'var(--neon-pink)',
              boxShadow: connectedDevice 
                ? '0 0 8px var(--neon-green)' 
                : '0 0 8px var(--neon-pink)'
            }}
          />
          <span 
            className="font-tech" 
            style={{ 
              ...styles.statusText,
              color: connectedDevice ? 'var(--neon-green)' : 'var(--neon-pink)' 
            }}
          >
            {connectedDevice ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Connected Device Info */}
      {connectedDevice ? (
        <div style={styles.activeConnectionBox}>
          <div style={styles.deviceDetails}>
            <span style={styles.activeDeviceName}>{connectedDevice.name || 'Unknown Device'}</span>
            <span style={styles.activeDeviceAddress}>{connectedDevice.address}</span>
            {isSimulation && <span style={styles.simTag}>WEB SIMULATION</span>}
          </div>
          <button 
            className="cyber-btn cyber-btn-pink"
            onClick={onDisconnect}
            style={styles.disconnectBtn}
          >
            DISCONNECT
          </button>
        </div>
      ) : (
        /* Scanning and Device Listing */
        <div style={styles.scanSection}>
          <button 
            className="cyber-btn cyber-btn-cyan"
            onClick={onScan}
            disabled={isScanning}
            style={styles.scanBtn}
          >
            {isScanning ? 'SCANNING CHANNEL...' : 'SCAN CHANNELS'}
          </button>

          {isScanning && (
            <div style={styles.loaderBox}>
              <div style={styles.spinner} />
              <span style={styles.scanningText}>SURVEYING SPECTRUM...</span>
            </div>
          )}

          {!isScanning && devices.length > 0 && (
            <div style={styles.deviceListContainer}>
              <span style={styles.listHeader}>AVAILABLE DEVISES ({devices.length}):</span>
              <div style={styles.list}>
                {devices.map((device) => (
                  <div 
                    key={device.address || device.id} 
                    onClick={() => onConnect(device)}
                    style={styles.deviceItem}
                  >
                    <div style={styles.deviceItemDetails}>
                      <span style={styles.deviceName}>{device.name || 'Unnamed Node'}</span>
                      <span style={styles.deviceAddress}>{device.address}</span>
                    </div>
                    <div style={styles.deviceItemAction}>
                      <span className="font-tech" style={styles.connectLabel}>LINK 📡</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isScanning && devices.length === 0 && (
            <div style={styles.emptyState}>
              <span>NO ACTIVE HARDWARE NODES LOCATED</span>
              <span style={styles.emptySub}>Ensure ESP32 is powered on and broadcasting.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
    padding: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
    paddingBottom: '10px',
  },
  title: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  statusText: {
    fontSize: '0.65rem',
    fontWeight: 'bold',
  },
  activeConnectionBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: 'rgba(0, 240, 255, 0.03)',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    borderRadius: '8px',
    padding: '12px',
  },
  deviceDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  activeDeviceName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  activeDeviceAddress: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  simTag: {
    fontSize: '0.6rem',
    color: 'var(--neon-yellow)',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
    marginTop: '3px',
  },
  disconnectBtn: {
    width: '100%',
    padding: '8px 16px',
    fontSize: '0.75rem',
  },
  scanSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  scanBtn: {
    width: '100%',
    padding: '10px 16px',
    fontSize: '0.75rem',
  },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 0',
  },
  spinner: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid rgba(0, 240, 255, 0.1)',
    borderTopColor: 'var(--neon-cyan)',
    animation: 'spin 1s linear infinite',
  },
  scanningText: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontFamily: 'Orbitron, sans-serif',
    letterSpacing: '0.05em',
  },
  deviceListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listHeader: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '180px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  deviceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deviceItemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  deviceName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  deviceAddress: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  connectLabel: {
    fontSize: '0.6rem',
    color: 'var(--neon-cyan)',
    fontWeight: 'bold',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 0',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    textAlign: 'center',
    gap: '4px',
  },
  emptySub: {
    fontSize: '0.65rem',
    color: 'rgba(255, 255, 255, 0.15)',
  }
};

// Add standard spinner animation dynamically via inline style if needed,
// but it is also handled cleanly in browser runtime.
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
