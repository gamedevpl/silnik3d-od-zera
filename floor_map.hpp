#pragma once
#include "package.hpp"
#include "workshop_view.hpp"

struct FloorMap {
    GLuint texture=0;
    void load(const files::path& dir) {
        std::ifstream in(dir/mapName(dir/"floor.mat"));
        std::string magic;
        int w=0,h=0,maxval=0;
        if (!(in>>magic>>w>>h>>maxval)) { if(texture) glDeleteTextures(1,&texture); texture=0; return; }
        if (magic!="P3" || w<1 || w>256 || h<1 || h>256 || maxval!=255)
            throw std::runtime_error("Invalid floor bitmap");
        std::vector<unsigned char> rgb(w*h*3);
        for(auto& channel:rgb) {
            int v; if(!(in>>v) || v<0 || v>255) throw std::runtime_error("Invalid pixel");
            channel=static_cast<unsigned char>(v);
        }
        if(!texture) glGenTextures(1,&texture);
        glBindTexture(GL_TEXTURE_2D,texture);
        glPixelStorei(GL_UNPACK_ALIGNMENT,1);
        glTexImage2D(GL_TEXTURE_2D,0,GL_RGB8,w,h,0,GL_RGB,GL_UNSIGNED_BYTE,rgb.data());
        glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_NEAREST);
    }
    void draw(const OrbitCamera& eye,double aspect) const {
        if(!texture) return;
        static Pipeline gpu(R"(
#version 330 core
layout(location=0) in vec4 position;
out vec2 uv;
void main(){
  vec2 corners[6]=vec2[6](vec2(0,0),vec2(8,0),vec2(8,6),vec2(0,0),vec2(8,6),vec2(0,6));
  uv=corners[gl_VertexID]; gl_Position=position;
})",R"(
#version 330 core
in vec2 uv; uniform sampler2D tile; out vec4 color;
void main(){color=texture(tile,uv);}
)");
        const Vec3 floor[]={{-4,.008,-3},{4,.008,-3},{4,.008,3},{-4,.008,-3},{4,.008,3},{-4,.008,3}};
        std::array<ClipPoint,6> points;
        for(int i=0;i<6;++i) points[i]=eye.project(floor[i],aspect);
        gpu.upload(points.front().data(),sizeof(points));
        glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D,texture);
        glDrawArrays(GL_TRIANGLES,0,6);
    }
};
