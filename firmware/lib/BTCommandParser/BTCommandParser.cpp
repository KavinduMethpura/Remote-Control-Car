#include "BTCommandParser.h"

bool BTCommandParser::parseAndMix(const String& packet, int& leftSpeed, int& rightSpeed) {
    // 1. Clean the packet input
    String cleanPacket = packet;
    cleanPacket.trim();

    // 2. Validate prefix
    if (!cleanPacket.startsWith("J:")) {
        return false;
    }

    // 3. Locate the separator comma
    int commaIndex = cleanPacket.indexOf(',');
    if (commaIndex == -1) {
        return false;
    }

    // 4. Extract substrings
    String xStr = cleanPacket.substring(2, commaIndex);
    String yStr = cleanPacket.substring(commaIndex + 1);

    // Validate that substrings are not empty
    if (xStr.length() == 0 || yStr.length() == 0) {
        return false;
    }

    // 5. Convert to integers and constrain to protocol bounds [-100, 100]
    int x = constrain(xStr.toInt(), -100, 100);
    int y = constrain(yStr.toInt(), -100, 100);

    // 6. Differential Mixing Math
    // rawLeft = Throttle + Steering
    // rawRight = Throttle - Steering
    int rawLeft = y + x;
    int rawRight = y - x;

    // 7. Prevent saturation while preserving the steering angle/ratio.
    // If either motor speed exceeds |100|, scale both down proportionally.
    int maxVal = max(abs(rawLeft), abs(rawRight));
    double leftScaled = rawLeft;
    double rightScaled = rawRight;

    if (maxVal > 100) {
        leftScaled = (double)rawLeft * 100.0 / maxVal;
        rightScaled = (double)rawRight * 100.0 / maxVal;
    }

    // 8. Scale to full 8-bit PWM speed range [-255, 255]
    leftSpeed = round(leftScaled * 2.55);
    rightSpeed = round(rightScaled * 2.55);

    return true;
}
