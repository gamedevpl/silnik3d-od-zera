#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "scene_models.hpp"
#include "picking.hpp"
#include "history.hpp"
#include "preview.hpp"
#include "floor_map.hpp"
#include "framing.hpp"
#include "instances_edit.hpp"
#include <filesystem>
#include <iostream>

namespace fs = std::filesystem;

struct Browser {
    fs::path directory;
    fs::path document;
    Models models;
    Layout nodes;
    WorkshopView view;
    Frame frame;
    FloorMap floorMap;
    fs::path resources, lastPack;
    Preview preview;
    History history;
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
        worldLayout(fresh);
        document = file;
        nodes.swap(fresh);
        history = {};
        preview.stop();
        selected = -1;
        dragging = false;
    }
};

static void openPackage(Browser& b, const fs::path& folder) {
    std::ifstream in(folder/"models.boxes"), camera(folder/"camera.txt");
    Models models=readModels(in);
    auto eye=b.view.eye;
    if (!(camera>>eye.yaw>>eye.radius) || !std::isfinite(eye.yaw) || eye.radius<3.2 || eye.radius>14)
        throw std::runtime_error("Invalid package camera");
    Browser fresh;
    fresh.models=std::move(models);
    fresh.open(folder/"exhibit.scene");
    fresh.floorMap.load(folder);
    if(b.floorMap.texture) glDeleteTextures(1,&b.floorMap.texture);
    b.models=std::move(fresh.models); b.nodes=std::move(fresh.nodes); b.document=fresh.document;
    b.floorMap=fresh.floorMap; b.resources=folder; b.view.eye=eye; b.frame.remember(eye.yaw,eye.radius);
    b.selected=-1; b.dragging=false; b.history={}; b.preview.stop();
}

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
    if (b.preview.running || !b.dragging || width <= 0 || height <= 0) return;
    auto ray = mouseRay(b, width, height);
    if (std::abs(ray.direction.z) < 1e-10) return;
    double delta = planeX(ray, b.handle().z) - b.grabX;
    b.nodes[b.selected].position.x = snapX(b.initialX + delta);
    b.history.sample(b.nodes[b.selected].position.x);
}

static void mouseButton(GLFWwindow* w, int button, int action, int) {
    if (button != GLFW_MOUSE_BUTTON_LEFT) return;
    auto& b = *static_cast<Browser*>(glfwGetWindowUserPointer(w));
    if (b.preview.running) return;
    if (action == GLFW_RELEASE) { b.history.release(); b.dragging = false; return; }
    int width, height;
    glfwGetWindowSize(w, &width, &height);
    if (width <= 0 || height <= 0) return;
    auto ray = mouseRay(b, width, height);
    if (b.selected >= 0 && !b.nodes[b.selected].parent && boxHit(ray, b.handle(), b.handleSize) && std::abs(ray.direction.z) > 1e-10) {
        b.dragging = true;
        b.initialX = b.nodes[b.selected].position.x;
        b.history.begin(b.selected, b.initialX);
        b.grabX = planeX(ray, b.handle().z);
    } else {
        b.selected = pick(worldLayout(b.nodes), b.models, ray);
    }
    auto title = b.document.filename().string();
    if (b.selected >= 0) title += " | " + b.nodes[b.selected].model;
    glfwSetWindowTitle(w, title.c_str());
}

static void drawEditor(Browser& b, double aspect) {
    b.preview.tick(b.nodes,glfwGetTime());
    drawScene(worldLayout(b.preview.active(b.nodes)),b.models,b.view,aspect,b.selected);
    for (const auto& n : b.nodes) if (n.model == "gallery") { b.floorMap.draw(b.view.eye,aspect); break; }
    if (b.selected >= 0 && !b.nodes[b.selected].parent) {
        glDisable(GL_DEPTH_TEST);
        b.view.drawBlock(b.handle(),b.handleSize,{1.f,.30f,.18f},aspect);
        glEnable(GL_DEPTH_TEST);
    }
}

static void input(GLFWwindow* w, int key, int, int action, int) {
    if (action != GLFW_PRESS) return;
    auto& b = *static_cast<Browser*>(glfwGetWindowUserPointer(w));
    try {
        if (!b.preview.running && key>=GLFW_KEY_1 && key<=GLFW_KEY_5 && b.resources!=b.directory) {
            std::ifstream lib(b.directory/"models.boxes"); b.models=readModels(lib);
            b.floorMap.load(b.directory); b.resources=b.directory;
        }
        if (key == GLFW_KEY_P) {
            if (b.preview.running) b.preview.stop();
            else if (!b.dragging) { b.selected=-1; b.preview.play(b.nodes,glfwGetTime()); }
        } else if (b.preview.running) return;
        else if (key == GLFW_KEY_N) {
            b.nodes.clear(); b.selected=-1; b.history={}; b.dragging=false; b.document="untitled.scene";
        } else if (key == GLFW_KEY_G || key == GLFW_KEY_A || key == GLFW_KEY_L || key == GLFW_KEY_B) {
            const char* model=key==GLFW_KEY_G ? "gallery" : key==GLFW_KEY_A ? "sculpture" : key==GLFW_KEY_L ? "lamp" : "plinth";
            b.nodes.push_back({model,{0,0,0},nextId(b.nodes),key==GLFW_KEY_L ? 1 : 0});
            b.selected=int(b.nodes.size())-1;
        } else if (key == GLFW_KEY_V) b.frame.remember(b.view.eye.yaw,b.view.eye.radius);
        else if (key == GLFW_KEY_H) b.frame.recall(b.view.eye.yaw,b.view.eye.radius);
        else if (key == GLFW_KEY_EQUAL || key == GLFW_KEY_MINUS) b.view.eye.move(0,key==GLFW_KEY_EQUAL ? -.6 : .6);
        else if (b.selected>=0 && (key==GLFW_KEY_COMMA || key==GLFW_KEY_PERIOD ||
                 key==GLFW_KEY_LEFT_BRACKET || key==GLFW_KEY_RIGHT_BRACKET || key==GLFW_KEY_UP || key==GLFW_KEY_DOWN)) {
            auto& p=b.nodes[b.selected].position;
            if(key==GLFW_KEY_COMMA || key==GLFW_KEY_PERIOD) {
                b.history.begin(b.selected,p.x); p.x+=key==GLFW_KEY_COMMA ? -.5 : .5;
                b.history.sample(p.x); b.history.release();
            } else if(key==GLFW_KEY_UP || key==GLFW_KEY_DOWN) p.y+=key==GLFW_KEY_UP ? .25 : -.25;
            else p.z+=key==GLFW_KEY_LEFT_BRACKET ? -.5 : .5;
        } else if (key == GLFW_KEY_E) {
            b.lastPack=exportGallery(b.nodes,b.view.eye.yaw,b.view.eye.radius,b.resources,fs::current_path());
            glfwSetWindowTitle(w,("Export: "+b.lastPack.filename().string()).c_str()); return;
        } else if (key == GLFW_KEY_F && !b.lastPack.empty()) openPackage(b,b.lastPack);
        else if (key == GLFW_KEY_LEFT) b.view.eye.move(-.1,0);
        else if (key == GLFW_KEY_RIGHT) b.view.eye.move(.1,0);
        else if (key == GLFW_KEY_1) b.open(b.directory / "workshop.scene");
        else if (key == GLFW_KEY_2) b.open(b.directory / "gallery.scene");
        else if (key == GLFW_KEY_3) b.open(b.directory / "reordered.scene");
        else if (key == GLFW_KEY_5) b.open(b.directory / "arm.scene");
        else if (key == GLFW_KEY_T && b.selected >= 0) ++b.nodes[b.selected].turns;
        else if (key == GLFW_KEY_4) b.open(b.directory / "lamps.scene");
        else if (key == GLFW_KEY_D && b.selected >= 0) b.selected = duplicate(b.nodes,b.selected);
        else if (key == GLFW_KEY_C && b.selected >= 0) changeLight(b.nodes,b.nodes[b.selected].id);
        else if (key == GLFW_KEY_U) b.history.undo(b.nodes);
        else if (key == GLFW_KEY_Y) b.history.redo(b.nodes);
        else if (key == GLFW_KEY_R) b.open(b.document);
        else if (key == GLFW_KEY_S) {
            std::ofstream out("copy.scene");
            writeScene(out, b.nodes);
            out.close();
            if (!out) throw std::runtime_error("Cannot save copy.scene");
            b.open("copy.scene");
        } else if (key == GLFW_KEY_ESCAPE) glfwSetWindowShouldClose(w,1);
        glfwSetWindowTitle(w,(b.document.filename().string() + (b.preview.running ? " | PLAY" : " | EDIT")).c_str());
    } catch (const std::exception& e) {
        glfwSetWindowTitle(w,e.what());
        std::cerr << e.what() << '\n';
    }
}

int main(int argc, char** argv) {
    Browser b;
    b.directory = fs::path(ENGINE_ASSET_DIR) / "scenes";
    b.resources=b.directory;
    const bool package=argc>1 && fs::is_directory(argv[1]);
    if (package) b.directory=b.resources=fs::path(argv[1]);
    try {
        std::ifstream models(b.directory / "models.boxes");
        b.models = readModels(models);
        b.open(package ? b.directory/"exhibit.scene" : argc > 1 ? fs::path(argv[1]) : b.directory / "workshop.scene");
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
    try {
        if (package) openPackage(b,b.directory);
        else b.floorMap.load(b.resources);
    } catch(const std::exception& e) { std::cerr<<e.what()<<'\n'; glfwTerminate(); return 1; }
    glfwSwapInterval(1);
    glfwSetWindowUserPointer(w,&b);
    if (argc==1) { b.nodes.clear(); b.document="untitled.scene"; }
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
