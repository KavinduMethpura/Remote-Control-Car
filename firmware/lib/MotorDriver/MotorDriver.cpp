#include "MotorDriver.h"

MotorDriver::MotorDriver() {}

void MotorDriver::init() {
    // Set motor direction pins as outputs
    pinMode(PIN_IN1, OUTPUT);
    pinMode(PIN_IN2, OUTPUT);
    pinMode(PIN_IN3, OUTPUT);
    pinMode(PIN_IN4, OUTPUT);

    // Initialize PWM pins using LEDC
#if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
    ledcAttach(PIN_ENA, PWM_FREQ, PWM_RESOLUTION);
    ledcAttach(PIN_ENB, PWM_FREQ, PWM_RESOLUTION);
#else
    ledcSetup(PWM_CH_LEFT, PWM_FREQ, PWM_RESOLUTION);
    ledcAttachPin(PIN_ENA, PWM_CH_LEFT);
    ledcSetup(PWM_CH_RIGHT, PWM_FREQ, PWM_RESOLUTION);
    ledcAttachPin(PIN_ENB, PWM_CH_RIGHT);
#endif

    // Ensure motor stops initially
    stop();
}

void MotorDriver::drive(int leftSpeed, int rightSpeed) {
    // Constrain speeds to PWM range
    leftSpeed = constrain(leftSpeed, -255, 255);
    rightSpeed = constrain(rightSpeed, -255, 255);

    setLeftMotor(leftSpeed);
    setRightMotor(rightSpeed);
}

void MotorDriver::stop() {
    drive(0, 0);
}

void MotorDriver::setLeftMotor(int speed) {
    int duty = abs(speed);
    
    if (speed > 0) {
        digitalWrite(PIN_IN1, HIGH);
        digitalWrite(PIN_IN2, LOW);
    } else if (speed < 0) {
        digitalWrite(PIN_IN1, LOW);
        digitalWrite(PIN_IN2, HIGH);
    } else {
        digitalWrite(PIN_IN1, LOW);
        digitalWrite(PIN_IN2, LOW);
        duty = 0;
    }

#if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
    ledcWrite(PIN_ENA, duty);
#else
    ledcWrite(PWM_CH_LEFT, duty);
#endif
}

void MotorDriver::setRightMotor(int speed) {
    int duty = abs(speed);
    
    if (speed > 0) {
        digitalWrite(PIN_IN3, HIGH);
        digitalWrite(PIN_IN4, LOW);
    } else if (speed < 0) {
        digitalWrite(PIN_IN3, LOW);
        digitalWrite(PIN_IN4, HIGH);
    } else {
        digitalWrite(PIN_IN3, LOW);
        digitalWrite(PIN_IN4, LOW);
        duty = 0;
    }

#if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)
    ledcWrite(PIN_ENB, duty);
#else
    ledcWrite(PWM_CH_RIGHT, duty);
#endif
}
