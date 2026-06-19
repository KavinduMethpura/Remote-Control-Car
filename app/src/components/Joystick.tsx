import React, { useRef, useState, useEffect, useCallback } from 'react';

interface JoystickProps {
  disabled?: boolean;
  onChange: (x: number, y: number) => void;
  onEnd: () => void;
}

export const Joystick: React.FC<JoystickProps> = ({
  disabled = false,
  onChange,
  onEnd
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const maxRadius = 80; // Maximum displacement in pixels

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || disabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Delta from center
    let dx = clientX - centerX;
    let dy = clientY - centerY;

    // Distance from center
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Constrain to maximum radius
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setKnobPosition({ x: dx, y: dy });

    // Map to -100 to 100 range. 
    // Invert Y axis so that dragging "up" maps to positive throttle (forward)
    const pctX = (dx / maxRadius) * 100;
    const pctY = -(dy / maxRadius) * 100;

    onChange(pctX, pctY);
  }, [disabled, onChange]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    handleMove(clientX, clientY);
  };

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap back to center
    setKnobPosition({ x: 0, y: 0 });
    onEnd();
  }, [isDragging, onEnd]);

  // Global mousemove and mouseup listeners to allow dragging outside the joystick ring boundary
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseUp = () => {
      handleEnd();
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Derived telemetry values for display
  const displayX = Math.round((knobPosition.x / maxRadius) * 100);
  const displayY = Math.round(-(knobPosition.y / maxRadius) * 100);

  return (
    <div style={styles.outerContainer}>
      {/* Telemetry Display */}
      <div style={styles.telemetryContainer}>
        <div style={styles.telemetryItem}>
          <span style={styles.telemetryLabel}>STEER (X):</span>
          <span style={{
            ...styles.telemetryValue, 
            color: displayX > 0 ? 'var(--neon-cyan)' : displayX < 0 ? 'var(--neon-pink)' : 'var(--text-muted)'
          }}>
            {displayX > 0 ? `+${displayX}` : displayX}%
          </span>
        </div>
        <div style={styles.telemetryItem}>
          <span style={styles.telemetryLabel}>THROTTLE (Y):</span>
          <span style={{
            ...styles.telemetryValue, 
            color: displayY > 0 ? 'var(--neon-green)' : displayY < 0 ? 'var(--neon-pink)' : 'var(--text-muted)'
          }}>
            {displayY > 0 ? `+${displayY}` : displayY}%
          </span>
        </div>
      </div>

      {/* Touch Ring */}
      <div
        ref={containerRef}
        style={{
          ...styles.joystickRing,
          opacity: disabled ? 0.35 : 1,
          cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
          borderColor: isDragging ? 'var(--neon-cyan)' : 'var(--border-neon)',
          boxShadow: isDragging ? 'var(--glow-cyan-strong)' : 'none',
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Ring Center Crosshairs */}
        <div style={styles.crosshairH} />
        <div style={styles.crosshairV} />
        <div style={styles.innerRingBorder} />

        {/* Joystick Knob */}
        <div
          style={{
            ...styles.joystickKnob,
            transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
            background: isDragging 
              ? 'radial-gradient(circle, #00f0ff 0%, #005a66 100%)' 
              : 'radial-gradient(circle, #2a2e45 0%, #111424 100%)',
            borderColor: isDragging ? '#ffffff' : 'var(--neon-cyan)',
            boxShadow: isDragging ? '0 0 15px #00f0ff' : '0 4px 10px rgba(0,0,0,0.5)'
          }}
        >
          {/* Inner details for futuristic aesthetic */}
          <div style={{
            ...styles.knobCore,
            backgroundColor: isDragging ? '#ffffff' : 'var(--neon-pink)',
            boxShadow: isDragging ? '0 0 8px #ffffff' : 'var(--glow-pink)',
          }} />
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '10px 0',
  },
  telemetryContainer: {
    display: 'flex',
    gap: '30px',
    background: 'rgba(5, 6, 11, 0.5)',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 240, 255, 0.1)',
  },
  telemetryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  telemetryLabel: {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  telemetryValue: {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    minWidth: '45px',
    textAlign: 'right',
  },
  joystickRing: {
    position: 'relative',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    backgroundColor: 'rgba(10, 14, 26, 0.8)',
    borderStyle: 'solid',
    borderWidth: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  innerRingBorder: {
    position: 'absolute',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '1px dashed rgba(189, 0, 255, 0.2)',
    pointerEvents: 'none',
  },
  crosshairH: {
    position: 'absolute',
    left: '10px',
    right: '10px',
    height: '1px',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    pointerEvents: 'none',
  },
  crosshairV: {
    position: 'absolute',
    top: '10px',
    bottom: '10px',
    width: '1px',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    pointerEvents: 'none',
  },
  joystickKnob: {
    position: 'absolute',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none', // Prevents touch hijacking
    transition: 'background 0.1s, border-color 0.1s, box-shadow 0.1s',
  },
  knobCore: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  }
};
