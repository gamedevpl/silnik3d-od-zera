#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "scene_models.hpp"
#include "picking.hpp"
#include <filesystem>
#include <iostream>

namespace fs = std::filesystem;

struct Browser {
    fs::path directory;
    fs::path document;
    Models models;
    Layout nodes;
    WorkshopView view;
    int selected = -1;
    bool dragging = false;
    double initialX = 0, grabX = 0;
    double mouseX = 0, mouseY = 0;

    Vec3 handle() const { return offset(nodes.at(selected).position, {.78, .42, .45}); }
    static constexpr Vec3 handleSize{.95,.12,.12};

    void open(const fs::path& file) {
        std::ifstream in(file);
        auto fresh = readScene(in);
        for (const auto& node : fresh)
            if (!models.count(node.model)) throw std::runtime_error("Unknown model: " + node.model);
        document = file;
        nodes.swap(fresh);
        selected = -1;
        dragging = false;
    }
};

static Ray mouseRay(Browser& b, int width, int height) {
    return cursorRay(b.mouseX, b.mouseY, width, height, b.view.eye.yaw, b.view.eye.radius);
}

static double planeX(Ray ray, double z) {
    return ray.origin.x + (z - ray.origin.z) * ray.direction.x / ray.direction.z;
}

static void motion(GLFWwindow* w, double x, double y) {
    auto& b = *static_cast<Browser*>(glfwGetWindowUserPointer(w));
    b.mouseX = x;
    b.mouseY = y;
    int width, height;
    glfwGetWindowSize(w, &width, &height);
    if (!b.dragging || width <= 0 || height <= 0) return;
    auto ray = mouseRay(b, width, height);
    if (std::abs(ray.direction.z) < 1e-10) return;
    double delta = planeX(ray, b.handle().z) - b.grabX;
    b.nodes[b.selected].position.x = snapX(b.initialX + delta);
}

static void mouseButton(GLFWwindow* w, int button, int action, int) {
    if (button != GLFW_MOUSE_BUTTON_LEFT) return;
    auto& b = *static_cast<Browser*>(glfwGetWindowUserPointer(w));
    if (action == GLFW_RELEASE) { b.dragging = false; return; }
    int width, height;
    glfwGetWindowSize(w, &width, &height);
    if (width <= 0 || height <= 0) return;
    auto ray = mouseRay(b, width, height);
    if (b.selected >= 0 && boxHit(ray, b.handle(), b.handleSize) && std::abs(ray.direction.z) > 1e-10) {
        b.dragging = true;
        b.initialX = b.nodes[b.selected].position.x;
        b.grabX = planeX(ray, b.handle().z);
    } else {
        b.selected = pick(b.nodes, b.models, ray);
    }
    auto title = b.document.filename().string();
    if (b.selected >= 0) title += " | " + b.nodes[b.selected].model;
    glfwSetWindowTitle(w, title.c_str());
}

static void drawEditor(Browser& b, double aspect) {
    drawScene(b.nodes,b.models,b.view,aspect,b.selected);
    if (b.selected >= 0) {
        glDisable(GL_DEPTH_TEST);
        b.view.drawBlock(b.handle(),b.handleSize,{1.f,.30f,.18f},aspect);
        glEnable(GL_DEPTH_TEST);
    }
}

static void input(GLFWwindow* w, int key, int, int action, int) {
    if (action != GLFW_PRESS) return;
    auto& b = *static_cast<Browser*>(glfwGetWindowUserPointer(w));
    try {
        if (key == GLFW_KEY_1) b.open(b.directory / "workshop.scene");
        else if (key == GLFW_KEY_2) b.open(b.directory / "gallery.scene");
        else if (key == GLFW_KEY_3) b.open(b.directory / "reordered.scene");
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
    glfwGetCursorPos(w,&b.mouseX,&b.mouseY);
    glfwSetCursorPosCallback(w,motion);
    glfwSetMouseButtonCallback(w,mouseButton);
    while (!glfwWindowShouldClose(w)) {
        glfwPollEvents();
        int width,height;
        glfwGetFramebufferSize(w,&width,&height);
        if (width && height) {
            glViewport(0,0,width,height);
            drawEditor(b,double(width)/height);
            glfwSwapBuffers(w);
        }
    }
    glfwTerminate();
    return 0;
}
