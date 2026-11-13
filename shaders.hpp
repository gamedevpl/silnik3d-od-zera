#pragma once
inline constexpr char vertex[] = R"(
#version 330 core
layout(location=0) in vec4 position;
void main() {
    gl_Position = position;
}
)";
inline constexpr char fragment[] = R"(
#version 330 core
uniform vec3 ink;
out vec4 color;
void main() {
    color = vec4(ink, 1);
}
)";
