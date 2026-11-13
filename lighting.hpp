#pragma once
#include "camera.hpp"
#include "geometry.hpp"
#include <cstddef>

struct Material {
    float roughness;
    float metallic;
};

inline constexpr char litVertex[] = R"(
#version 330 core
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
uniform vec3 center;
uniform float scale, yaw, radius, aspect;
out vec3 worldNormal;
out vec3 worldPosition;
void main() {
    worldPosition = center + position*scale;
    worldNormal = normal;
    float c = cos(yaw), s = sin(yaw);
    vec3 p = worldPosition;
    p = vec3(c*p.x-s*p.z, p.y, s*p.x+c*p.z);
    float y = cos(.25)*p.y - sin(.25)*p.z;
    float z = sin(.25)*p.y + cos(.25)*p.z;
    float w = radius-z;
    const float nearZ=.1, farZ=40.;
    float clipZ=((farZ+nearZ)*w-2.*farZ*nearZ)/(farZ-nearZ);
    float focal=1./tan(radians(25.));
    gl_Position=vec4(focal*p.x/aspect, focal*y, clipZ, w);
}
)";
inline constexpr char litFragment[] = R"(
#version 330 core
in vec3 worldNormal;
in vec3 worldPosition;
uniform vec3 eye, lamp;
uniform float roughness, metallic;
out vec4 color;
void main() {
    vec3 N = normalize(worldNormal);
    vec3 L = normalize(lamp-worldPosition);
    vec3 V = normalize(eye-worldPosition);
    vec3 H = normalize(L+V);
    vec3 base = vec3(.075,.52,.46);
    float diffuse = max(dot(N,L),0.);
    float exponent = mix(180.,5.,roughness*roughness);
    float spec = diffuse>0. ? pow(max(dot(N,H),0.),exponent) : 0.;
    vec3 highlight = mix(vec3(1.,.95,.84),base,metallic);
    vec3 result = base*(.10+.69*diffuse*(1.-metallic)) + highlight*spec;
    color = vec4(pow(clamp(result,0.,1.),vec3(1./2.2)),1.);
}
)";

struct Lighting {
    Pipeline gpu{litVertex, litFragment};
    GLuint elements{};
    GLint roughness = glGetUniformLocation(gpu.program, "roughness");
    GLint metallic = glGetUniformLocation(gpu.program, "metallic");
    GLint center = glGetUniformLocation(gpu.program, "center");
    GLint scale = glGetUniformLocation(gpu.program, "scale");
    GLint yaw = glGetUniformLocation(gpu.program, "yaw");
    GLint radius = glGetUniformLocation(gpu.program, "radius");
    GLint aspect = glGetUniformLocation(gpu.program, "aspect");
    GLint lamp = glGetUniformLocation(gpu.program, "lamp");
    GLint eye = glGetUniformLocation(gpu.program, "eye");
    Lighting() {
        glVertexAttribPointer(0,3,GL_FLOAT,GL_FALSE,sizeof(Vertex),nullptr);
        glVertexAttribPointer(1,3,GL_FLOAT,GL_FALSE,sizeof(Vertex),
                              reinterpret_cast<void*>(offsetof(Vertex,nx)));
        glEnableVertexAttribArray(1);
        glGenBuffers(1,&elements);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER,elements);
    }
};
inline Lighting& lighting() { static Lighting light; return light; }

inline void drawLit(const Mesh& mesh, Vec3 center, float radius,
                    const Material& material, double time, double aspect) {
    if (mesh.vertices.empty() || mesh.indices.empty()) return;
    auto& light = lighting();
    light.gpu.upload(&mesh.vertices.front().x, mesh.vertices.size()*sizeof(Vertex));
    glBufferData(GL_ELEMENT_ARRAY_BUFFER,mesh.indices.size()*sizeof(std::uint32_t),
                 mesh.indices.data(),GL_STREAM_DRAW);
    glUniform1f(light.roughness, material.roughness);
    glUniform1f(light.metallic, material.metallic);
    glUniform3f(light.center,center.x,center.y,center.z);
    glUniform1f(light.scale,radius);
    glUniform1f(light.yaw,camera.yaw);
    glUniform1f(light.radius,camera.radius);
    glUniform1f(light.aspect,aspect);
    glUniform3f(light.lamp,3.8*std::sin(time),3.3,4.4);
    Vec3 eye = aboutY(aboutX({0,0,camera.radius},-.25),camera.yaw);
    glUniform3f(light.eye,eye.x,eye.y,eye.z);
    glDrawElements(GL_TRIANGLES,mesh.indices.size(),GL_UNSIGNED_INT,nullptr);
}
