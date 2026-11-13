#pragma once
inline constexpr char vertex[] = R"(
#version 330 core
layout(location=0) in vec2 position;
void main() {
    gl_Position = vec4(position, 0, 1);
}
)";

inline constexpr char fragment[] = R"(
#version 330 core
out vec4 color;
void main() {
    color = vec4(0.27, 0.68, 0.57, 1);
}
)";
