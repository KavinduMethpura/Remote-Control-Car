/**
 * Formats joystick coordinates into the target command protocol:
 * "J:x,y\n"
 * 
 * @param x Steering coordinate (-100 to 100)
 * @param y Throttle coordinate (-100 to 100)
 * @returns Formatted command string
 */
export const formatJoystickCommand = (x: number, y: number): string => {
  const roundX = Math.round(x);
  const roundY = Math.round(y);
  return `J:${roundX},${roundY}\n`;
};
