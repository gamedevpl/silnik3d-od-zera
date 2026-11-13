#pragma once
#include <array>
#include <vector>

constexpr int tileSize = 128;
using RGB = std::array<unsigned char,3>;

inline RGB boardPixel(int x, int y, bool markers) {
    constexpr RGB dark{38,51,66}, light{204,209,186};
    if (markers) {
        constexpr RGB stamp[4] = {
            {237,112,75}, {83,199,164}, {106,146,220}, {239,203,101}
        };
        int dx = x < tileSize/2 ? x : tileSize-1-x;
        int dy = y < tileSize/2 ? y : tileSize-1-y;
        if (dx < 39 && dy < 39) {
            int corner = (x >= tileSize/2) + 2*(y >= tileSize/2);
            // One to four short bars make the corners distinct in grayscale too.
            if (dy >= 11 && dy < 27 && dx >= 6 && dx < 6+6*(corner+1)
                && (dx-6)%6 < 3) return dark;
            return stamp[corner];
        }
    }
    return ((x/8 + y/8) % 2) ? dark : light;
}

inline GLuint createBoard(bool markers) {
    std::vector<RGB> image(tileSize*tileSize);
    for (int y=0; y<tileSize; ++y)
        for (int x=0; x<tileSize; ++x)
            image[y*tileSize+x] = boardPixel(x,y,markers);
    GLuint id;
    glGenTextures(1,&id);
    glBindTexture(GL_TEXTURE_2D,id);
    glTexImage2D(GL_TEXTURE_2D,0,GL_RGB8,tileSize,tileSize,0,
                 GL_RGB,GL_UNSIGNED_BYTE,image.data());
    glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_S,GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_T,GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_LINEAR);
    glGenerateMipmap(GL_TEXTURE_2D);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    return id;
}
