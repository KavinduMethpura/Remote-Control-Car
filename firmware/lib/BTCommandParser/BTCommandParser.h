#ifndef BT_COMMAND_PARSER_H
#define BT_COMMAND_PARSER_H

#include <Arduino.h>

class BTCommandParser {
public:
    /**
     * Parses a joystick packet of format "J:x,y" and calculates differential motor speeds.
     * 
     * @param packet The raw command string (e.g., "J:-50,80\n")
     * @param leftSpeed Output parameter for Left Motor speed (-255 to 255)
     * @param rightSpeed Output parameter for Right Motor speed (-255 to 255)
     * @return true if parsed successfully, false otherwise
     */
    static bool parseAndMix(const String& packet, int& leftSpeed, int& rightSpeed);
};

#endif // BT_COMMAND_PARSER_H
