#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "scene_models.hpp"
#include <filesystem>
#include <iostream>

namespace fs = std::filesystem;

struct Browser {
    fs::path directory;
    fs::path document;
    Models models;
    Layout nodes;
    WorkshopView view;
    void open(const fs::path& file) {
        std::ifstream in(file);
        auto fresh = readScene(in);
        for (const auto& node : fresh)
            if (!models.count(node.model)) throw std::runtime_error("Unknown model: " + node.model);
        document = file;
        nodes.swap(fresh);
    }
};

static void input(GLFWwindow* w, int key, int, int action, int) {
    if (action != GLFW_PRESS) return;
    auto& b = *static_cast<Browser*>(glfwGetWindowUserPointer(w));
    try {
        if (key == GLFW_KEY_1) b.open(b.directory / "workshop.scene");
        else if (key == GLFW_KEY_2) b.open(b.directory / "gallery.scene");
        else if (key == GLFW_KEY_R) b.open(b.document);
        else if (key == GLFW_KEY_S) {
            std::ofstream out("copy.scene");
            writeScene(out, b.nodes);
            out.close();
            if (!out) throw std::runtime_error("Cannot save copy.scene");
            b.open("copy.scene");
        } else if (key == GLFW_KEY_ESCAPE) glfwSetWindowShouldClose(w,1);
        glfwSetWindowTitle(w,b.document.filename().string().c_str());
    } catch (const std::exception& e) {
        glfwSetWindowTitle(w,e.what());
        std::cerr << e.what() << '\n';
    }
}

int main(int argc, char** argv) {
    Browser b;
    b.directory = fs::path(ENGINE_ASSET_DIR) / "scenes";
    try {
        std::ifstream models(b.directory / "models.boxes");
        b.models = readModels(models);
        b.open(argc > 1 ? fs::path(argv[1]) : b.directory / "workshop.scene");
    } catch (const std::exception& e) { std::cerr << e.what() << '\n'; return 1; }
    if (!glfwInit()) return 1;
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR,3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR,3);
    glfwWindowHint(GLFW_OPENGL_PROFILE,GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT,GLFW_TRUE);
    auto* w = glfwCreateWindow(960,540,b.document.filename().string().c_str(),nullptr,nullptr);
    if (!w) { glfwTerminate(); return 1; }
    glfwMakeContextCurrent(w);
    if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 1; }
    glfwSwapInterval(1);
    glfwSetWindowUserPointer(w,&b);
    glfwSetKeyCallback(w,input);
    while (!glfwWindowShouldClose(w)) {
        glfwPollEvents();
        int width,height;
        glfwGetFramebufferSize(w,&width,&height);
        if (width && height) {
            glViewport(0,0,width,height);
            drawScene(b.nodes,b.models,b.view,double(width)/height);
            glfwSwapBuffers(w);
        }
    }
    glfwTerminate();
}
