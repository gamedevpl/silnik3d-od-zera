// Sample the engine at deterministic times.
#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include <cstdio>
#include <cstdlib>
static int n=0, hz=60, limit=1;
static double measured=0, previousY=0, landing=-1;
static bool sampleColor=false;
#ifdef COUNT_STEPS
static int stepCount=0;
#endif
static double originSeconds=0;
static double simulationTime(){return originSeconds+double(n)/hz;}
static double probeArgument(double value) {
    if(n==0 || n==hz) std::printf("t=%.1f s   arg=%.3f\n",simulationTime(),value);
    return value;
}

static double probePulse(double value, double elapsed) {
    if(elapsed>=0 && (n==0 || n==hz))
        std::printf("elapsed=%.3f s   ",elapsed);
    return probeArgument(value);
}

static GLFWwindow* hiddenWindow(int w,int h,const char* title,GLFWmonitor* m,GLFWwindow* other){
    glfwWindowHint(GLFW_VISIBLE,GLFW_FALSE);
    return glfwCreateWindow(w,h,title,m,other);
}
static int done(GLFWwindow*){return n>=limit;}
static void present(GLFWwindow* w);
#define glfwCreateWindow hiddenWindow
#define glfwGetTime simulationTime
#define glfwWindowShouldClose done
#define glfwSwapBuffers present
#define main sceneMain
#include "main.cpp"
#undef main
#undef glfwSwapBuffers
static void present(GLFWwindow* w){
#ifdef HAS_PLAYER
#ifdef HAS_PEAK
    measured=player.peak;
#else
    if(player.height>measured) measured=player.height;
#endif
    if (previousY>0 && player.height==0 && landing<0) landing=simulationTime();
    previousY=player.height;
#endif
    if(sampleColor && (n==0 || n==hz)) {
        unsigned char pixel[4]={};glReadPixels(0,0,1,1,GL_RGBA,GL_UNSIGNED_BYTE,pixel);
        std::printf("t = %.1f s    RGB %d %d %d\n",simulationTime(),pixel[0],pixel[1],pixel[2]);
    }
#ifdef COUNT_STEPS
    if(n==1 || n==2 || n==hz/3 || n==2*hz/3) {
        std::printf("%3d FPS   %6.3f s   %3d steps   height %6.2f\n",hz,simulationTime(),stepCount,player.height);
    }
#endif
    ++n;
}
int main(int argc,char** argv){
    if(argc!=4 && argc!=5)return 2;
    if(argc==5)originSeconds=std::atof(argv[4]);
    hz=std::atoi(argv[1]);limit=std::atoi(argv[2]);
    sampleColor=argv[3][0]=='@';
    int status=sceneMain();
    if(!status && !sampleColor)std::printf("%3d   %5.2f    %.3f s\n",hz,measured,landing);
    return status;
}
