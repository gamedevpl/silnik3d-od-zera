// Report the vertices passed to paper.line by the checkpoint's real cube function.
#include <algorithm>
#include <array>
#include <cstdio>
#include <string_view>
#include <stdexcept>
#include <utility>
#include <vector>

// No framebuffer is needed to observe the endpoints.
constexpr unsigned GL_COLOR_BUFFER_BIT = 0x00004000;
static void glScissor(int, int, int, int) {}
static void glClear(unsigned) {}
static void glClearColor(float, float, float, float) {}

#include <wire.hpp>

struct Trace {
    std::vector<Pixel> vertices;
    std::vector<std::pair<int,int>> edges;
    int find(Pixel pixel) const {
        auto it = std::find_if(vertices.begin(), vertices.end(), [pixel](Pixel p) {
            return p.x == pixel.x && p.y == pixel.y;
        });
        if (it == vertices.end()) throw std::runtime_error("Unknown endpoint");
        return static_cast<int>(it - vertices.begin());
    }
};

struct RecordingPaper : Paper {
    Trace& trace;
    Pixel project(Vec3 p) const {
        Pixel result = Paper::project(p);
        if (std::any_of(trace.vertices.begin(),trace.vertices.end(),[result](Pixel v){return v.x==result.x && v.y==result.y;}))
            throw std::runtime_error("Overlapping vertex projection");
        trace.vertices.push_back(result);
        return result;
    }
    void line(Pixel a, Pixel b) const {
        trace.edges.emplace_back(trace.find(a),trace.find(b));
    }
};
#define Paper RecordingPaper
#include <mesh.hpp>
#undef Paper

int main(int argc, char** argv) {
    Trace trace;
    cube(RecordingPaper{{0,0,200,1},trace});
    if (trace.vertices.size() != 8) return 1;
    if (argc == 2 && std::string_view(argv[1]) == "--corner-six") {
        const Pixel corner = trace.vertices[6];
        std::printf("corner 6 relative to centre (scale 200): (%d, %d)\n", corner.x, corner.y);
        return 0;
    }
    std::printf("edges: %zu\nsides:",trace.edges.size());
    for (auto [a,b] : trace.edges) {
        if ((a<4) != (b<4)) std::printf(" %d->%d",a,b);
    }
    std::puts("");
}
