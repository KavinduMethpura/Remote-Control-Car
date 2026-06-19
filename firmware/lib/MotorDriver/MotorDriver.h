#ifndef MOTOR_DRIVER_H
#define MOTOR_DRIVER_H

#include <Arduino.h>
#include "pins.h"

class MotorDriver {
public:
    MotorDriver();
    void init();
    void drive(int leftSpeed, int rightSpeed);
    void stop();

private:
    void setLeftMotor(int speed);
    void setRightMotor(int speed);
};

#endif // MOTOR_DRIVER_H
