// Trace the scissor rectangles cleared by the checkpoint's real frame().
#include <array>
#include <cstdio>
#include <set>
#include <vector>
constexpr unsigned GL_COLOR_BUFFER_BIT = 0x4000;
constexpr unsigned GL_SCISSOR_TEST = 0x0C11;
static void* glfwGetCurrentContext() { return nullptr; }
static bool clipped = false;
using Rect = std::array<int, 4>;
static Rect rectangle{};
static std::vector<Rect> writes;
static double glfwGetTime() { return 0.0; }
static void glfwGetFramebufferSize(void*, int* w, int* h) { *w = 640; *h = 360; }
static void glEnable(unsigned cap) { if (cap == GL_SCISSOR_TEST) clipped = true; }
static void glDisable(unsigned cap) { if (cap == GL_SCISSOR_TEST) clipped = false; }
static void glClearColor(float, float, float, float) {}
static void glScissor(int x, int y, int w, int h) { rectangle = {x, y, w, h}; }
static void glClear(unsigned mask) {
    if (clipped && (mask & GL_COLOR_BUFFER_BIT)) writes.push_back(rectangle);
}
#include <frame.hpp>
int main() {
    frame();
    std::set<Rect> unique(writes.begin(), writes.end());
    if (writes.empty()) return 1;
    std::printf("draw calls %zu   locations %zu   rectangle %d x %d\n",
                writes.size(), unique.size(), writes.front()[2], writes.front()[3]);
    for (const auto& r : writes) std::printf("  (%d, %d)\n", r[0], r[1]);
}
