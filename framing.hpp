#pragma once
struct Frame {
    double yaw = .2, radius = 7.8;
    void remember(double angle, double distance) {
        yaw = angle;
        radius = distance;
    }
    void recall(double& angle, double& distance) const {
        angle = yaw;
        distance = radius;
    }
};
