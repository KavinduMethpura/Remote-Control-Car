import React from 'react';

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const SpeedSlider: React.FC<SpeedSliderProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const getPresetLabel = (val: number) => {
    if (val <= 35) return { name: 'ECO / INDOOR', color: 'var(--neon-green)' };
    if (val <= 75) return { name: 'NORMAL DRIVE', color: 'var(--neon-cyan)' };
    return { name: 'SPORT MODE', color: 'var(--neon-pink)' };
  };

  const currentPreset = getPresetLabel(value);

  return (
    <div className="cyber-card" style={styles.container}>
      <div style={styles.header}>
        <span className="font-tech" style={styles.title}>SPEED LIMITER</span>
        <span 
          className="font-tech" 
          style={{ ...styles.valueDisplay, color: currentPreset.color, textShadow: `0 0 8px ${currentPreset.color}` }}
        >
          {value}%
        </span>
      </div>

      <div style={styles.sliderWrapper}>
        <input
          type="range"
          min="10" // Prevent setting speed limit to 0 so the car can always move at least a bit
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="cyber-slider"
          style={{ opacity: disabled ? 0.4 : 1 }}
        />
      </div>

      <div style={styles.footer}>
        <span style={{ ...styles.presetLabel, color: currentPreset.color }}>
          ⚡ {currentPreset.name}
        </span>
        <div style={styles.presetButtons}>
          <button 
            disabled={disabled} 
            onClick={() => onChange(30)}
            style={{ 
              ...styles.presetBtn, 
              borderColor: value === 30 ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)',
              color: value === 30 ? 'var(--neon-green)' : 'var(--text-muted)'
            }}
          >
            30%
          </button>
          <button 
            disabled={disabled} 
            onClick={() => onChange(65)}
            style={{ 
              ...styles.presetBtn, 
              borderColor: value === 65 ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)',
              color: value === 65 ? 'var(--neon-cyan)' : 'var(--text-muted)'
            }}
          >
            65%
          </button>
          <button 
            disabled={disabled} 
            onClick={() => onChange(100)}
            style={{ 
              ...styles.presetBtn, 
              borderColor: value === 100 ? 'var(--neon-pink)' : 'rgba(255,255,255,0.05)',
              color: value === 100 ? 'var(--neon-pink)' : 'var(--text-muted)'
            }}
          >
            100%
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    padding: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
  },
  valueDisplay: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    fontFamily: 'Orbitron, sans-serif',
  },
  sliderWrapper: {
    padding: '8px 0',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.7rem',
    marginTop: '4px',
  },
  presetLabel: {
    fontFamily: 'Orbitron, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.05em',
    transition: 'color 0.2s',
  },
  presetButtons: {
    display: 'flex',
    gap: '6px',
  },
  presetBtn: {
    background: 'rgba(5, 6, 11, 0.4)',
    border: '1px solid',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.65rem',
    fontFamily: 'Orbitron, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
