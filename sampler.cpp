// Capture adapter. The scene and simulation both come from the filmed main.cpp.
#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include <cstdio>
#include <cstdlib>
#include <vector>
static int n=0, hz=60, limit=1;
static FILE* sink=nullptr;
static double measured=0, previousY=0, landing=-1;
static bool sampleColor=false;
static double originSeconds=0;
static double movieTime(){return originSeconds+double(n)/hz;}
static double probeArgument(double value) {
    if(n==0 || n==hz) std::printf("t=%.1f s   arg=%.3f\n",movieTime(),value);
    return value;
}

static GLFWwindow* movieWindow(int w,int h,const char* title,GLFWmonitor* m,GLFWwindow* other){
    glfwWindowHint(GLFW_VISIBLE,GLFW_FALSE);
    return glfwCreateWindow(w,h,title,m,other);
}
static int done(GLFWwindow*){return n>=limit;}
static void present(GLFWwindow* w);
#define glfwCreateWindow movieWindow
#define glfwGetTime movieTime
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
    if (previousY>0 && player.height==0 && landing<0) landing=movieTime();
    previousY=player.height;
#endif
    if(sampleColor && (n==0 || n==hz)) {
        unsigned char pixel[4]={};glReadPixels(0,0,1,1,GL_RGBA,GL_UNSIGNED_BYTE,pixel);
        std::printf("t = %.1f s    RGB %d %d %d\n",movieTime(),pixel[0],pixel[1],pixel[2]);
    }
    if(sink){
        int width,height;glfwGetFramebufferSize(w,&width,&height);
        static std::vector<unsigned char> rgb,small(192*108*3);
        rgb.resize(width*height*4);
        glReadPixels(0,0,width,height,GL_RGBA,GL_UNSIGNED_BYTE,rgb.data());
        for(int y=0;y<108;++y)for(int x=0;x<192;++x)for(int c=0;c<3;++c)
            small[(y*192+x)*3+c]=rgb[((height-1-y*height/108)*width+x*width/192)*4+c];
        if(std::fwrite(small.data(),1,small.size(),sink)!=small.size())std::exit(4);
    }
    ++n;
}
int main(int argc,char** argv){
    if(argc!=4 && argc!=5)return 2;
    if(argc==5)originSeconds=std::atof(argv[4]);
    hz=std::atoi(argv[1]);limit=std::atoi(argv[2]);
    sampleColor=argv[3][0]=='@';
    if(!sampleColor && argv[3][0]!='-'){sink=std::fopen(argv[3],"wb");if(!sink)return 3;}
    int status=sceneMain();if(sink)std::fclose(sink);
    if(!status && !sampleColor)std::printf("%3d   %5.2f    %.3f s\n",hz,measured,landing);
    return status;
}
