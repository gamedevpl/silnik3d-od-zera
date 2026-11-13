#pragma once
#include "camera.hpp"
#include "texture.hpp"
#include <cstddef>

struct TileVertex {
    ClipPoint clip;
    std::array<float,2> uv;
};

inline void texturedQuad(const std::array<ClipPoint,4>& corners, float repeats, GLuint texture) {
    static Pipeline gpu(R"(
        #version 330 core
        layout(location=0) in vec4 position;
        layout(location=1) in vec2 texcoord;
        out vec2 uv;
        void main() { gl_Position = position; uv = texcoord; }
    )", R"(
        #version 330 core
        in vec2 uv;
        uniform sampler2D board;
        out vec4 color;
        void main() { color = texture(board, uv); }
    )");
    const std::array<TileVertex,4> quad{{
        {corners[0],{0,0}}, {corners[1],{repeats,0}},
        {corners[2],{repeats,repeats}}, {corners[3],{0,repeats}}
    }};
    const std::array<TileVertex,6> points{quad[0],quad[1],quad[2],quad[0],quad[2],quad[3]};
    glUseProgram(gpu.program);
    glBindVertexArray(gpu.vao);
    glBindBuffer(GL_ARRAY_BUFFER,gpu.buffer);
    glBufferData(GL_ARRAY_BUFFER,sizeof(points),points.data(),GL_STREAM_DRAW);
    glVertexAttribPointer(0,4,GL_FLOAT,GL_FALSE,sizeof(TileVertex),nullptr);
    glVertexAttribPointer(1,2,GL_FLOAT,GL_FALSE,sizeof(TileVertex),
                          reinterpret_cast<const void*>(offsetof(TileVertex,uv)));
    glEnableVertexAttribArray(1);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D,texture);
    glDrawArrays(GL_TRIANGLES,0,6);
}

inline void drawFloor(double aspect) {
    static GLuint board = createBoard(false);
    constexpr Vec3 floor[] = {
        {-24,-2,24}, {24,-2,24}, {24,-2,-24}, {-24,-2,-24}
    };
    std::array<ClipPoint,4> points;
    for (int i=0; i<4; ++i) points[i] = camera.project(floor[i],aspect);
    texturedQuad(points,32,board);
}

inline void drawUVCard(double aspect) {
    static GLuint board = createBoard(true);
    float x = float(.79/aspect), y = .79f;
    const std::array<ClipPoint,4> card{{
        {-x,-y,0,1}, {x,-y,0,1}, {x,y,0,1}, {-x,y,0,1}
    }};
    texturedQuad(card,1,board);
}
