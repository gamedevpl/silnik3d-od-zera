#pragma once
#include "wire.hpp"
#include "corners.hpp"

inline void cube(Paper paper) {
    paper.dot(paper.project(corners[6]),paper.pen+2);
}
