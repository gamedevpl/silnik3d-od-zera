// Observe real back-buffer submissions. The driver requests closure at swap eight.
#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include <cstdio>
#include <cstdlib>
#include <vector>
static int swaps = 0;
static const char* output = nullptr;
static GLFWwindow* hidden(int w, int h, const char* title, GLFWmonitor* monitor, GLFWwindow* share) {
    glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);
    return glfwCreateWindow(w,h,title,monitor,share);
}
static void recordSwap(GLFWwindow* window) {
    unsigned char pixel[4];
    glReadPixels(0,0,1,1,GL_RGBA,GL_UNSIGNED_BYTE,pixel);
    ++swaps;
    std::printf("swap %d RGB %d %d %d\n",swaps,pixel[0],pixel[1],pixel[2]);
    if (output && swaps==1) {
        int w,h;
        glfwGetFramebufferSize(window,&w,&h);
        std::vector<unsigned char> pixels(w*h*4);
        glReadPixels(0,0,w,h,GL_RGBA,GL_UNSIGNED_BYTE,pixels.data());
        FILE* file=std::fopen(output,"wb");
        if (!file) std::exit(3);
        std::fprintf(file,"P6\n%d %d\n255\n",w,h);
        for (int y=h-1;y>=0;--y)
            for (int x=0;x<w;++x)
                if (std::fwrite(&pixels[4*(y*w+x)],1,3,file)!=3) std::exit(4);
        if (std::fclose(file)!=0) std::exit(4);
    }
    glfwSwapBuffers(window);
    if (swaps==8) glfwSetWindowShouldClose(window,GLFW_TRUE);
    if (swaps>8) std::exit(5);
}
#define glfwCreateWindow hidden
#define glfwSwapBuffers recordSwap
#define main sceneMain
#include <main.cpp>
#undef main
int main(int argc,char** argv) {
    if (argc>2) return 2;
    if (argc==2) output=argv[1];
    int status=sceneMain();
    std::printf("swaps = %d\nexit %d\n",swaps,status);
    return status;
}
