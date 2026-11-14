#pragma once
#include "camera.hpp"
#include "depth.hpp"
#include "workshop.hpp"
#include <deque>

struct WorkshopView {
    OrbitCamera eye{.20, 7.8};
    std::deque<Vec3> trail;
    bool debugBoxes = false;

    void drawBlock(Vec3 low, Vec3 size, Tint color, double aspect) const {
        std::array<ClipPoint, 8> corners;
        for (int i = 0; i < 8; ++i) {
            corners[i] = eye.project({low.x + (i & 1 ? size.x : 0),
                                      low.y + (i & 2 ? size.y : 0),
                                      low.z + (i & 4 ? size.z : 0)}, aspect);
        }
        auto side = [&](int a, int b, int c, int d, float light) {
            quad({corners[a], corners[b], corners[c], corners[d]},
                 {color[0] * light, color[1] * light, color[2] * light});
        };
        side(2,3,7,6,1.00f);
        side(0,1,3,2,.72f);
        side(4,5,7,6,.82f);
        side(0,4,6,2,.67f);
        side(1,5,7,3,.77f);
    }

    void draw(Vec3 p, const Cell& cell, bool powered, double aspect) {
        glClearColor(powered ? .17f : .07f, powered ? .20f : .10f, powered ? .20f : .14f, 1.f);
        beginFrame();
        auto block = [&](Vec3 anchor, Vec3 size, Tint color) {
            drawBlock(anchor, size, color, aspect);
        };
        const Tint grid{.44f,.51f,.49f}, timber{.56f,.40f,.25f}, steel{.53f,.59f,.61f};
        const Tint floor = powered ? Tint{.44f,.45f,.36f} : Tint{.22f,.29f,.32f};
        block({-6,-.25,-5}, {12,.25,10}, floor);
        for (int i = -4; i <= 4; ++i) {
            block({-5,.003,double(i)}, {10,.003,.018}, grid);
            block({double(i),.003,-4}, {.018,.003,8}, grid);
        }
        for (Box bounds : shelves) {
            double shelf = bounds.x0;
            for (double x : {shelf, shelf + 1.65})
                for (double z : {-2.85, -2.22})
                    block({x,0,z}, {.08,1.30,.08}, steel);
            for (double y : {.15,.68,1.22})
                block({shelf,y,bounds.z0}, {bounds.x1-shelf,.07,bounds.z1-bounds.z0}, timber);
            const Tint crates[] = {{.27f,.44f,.48f},{.80f,.54f,.29f},{.27f,.44f,.48f}};
            for (int i = 0; i < 3; ++i)
                block({shelf + .10 + i * .50,.75,-2.72}, {.43,.28,.41}, crates[i]);
        }
        const Box rim = Socket::opening;
        const double lip = .08;
        const Tint ceramic{.29f,.40f,.44f}, rimColor{.95f,.77f,.26f};
        block({rim.x0-lip,.008,rim.z0-lip}, {rim.x1-rim.x0+2*lip,.008,rim.z1-rim.z0+2*lip}, ceramic);
        for (double x : {rim.x0-lip, rim.x1})
            block({x,.018,rim.z0-lip}, {lip,.08,rim.z1-rim.z0+2*lip}, rimColor);
        for (double z : {rim.z0-lip, rim.z1})
            block({rim.x0,.018,z}, {rim.x1-rim.x0,.08,lip}, rimColor);

        // Lift doorway and its two workshop lamps share the circuit state.
        const Tint frame{.38f,.44f,.47f}, panel{.32f,.48f,.52f};
        double left = liftGate.x0, right = liftGate.x1, front = liftGate.z1;
        block({left-.14,0,front-.16}, {right-left+.28,.06,1.0}, frame);
        for (double x : {left-.14,right})
            block({x,0,liftGate.z0}, {.14,1.90,.18}, frame);
        block({left-.14,1.83,liftGate.z0}, {right-left+.28,.14,.24}, frame);
        const double doorWidth = (right-left)/2;
        for (int side = 0; side != 2; ++side) {
            double x = left + side*doorWidth;
            if (powered) x += (side ? 1 : -1) * doorWidth;
            block({x,.065,liftGate.z0}, {doorWidth,1.73,front-liftGate.z0}, panel);
            block({x+.04,.81,front}, {doorWidth-.08,.10,.025}, {.83f,.63f,.28f});
        }
        for (double x : {-1.38,1.05}) {
            block({x,1.93,liftGate.z0}, {.36,.22,.18}, frame);
            const Tint bulb = powered ? Tint{1.f,.94f,.60f} : Tint{.30f,.26f,.19f};
            block({x+.03,1.96,front+.07}, {.30,.15,.04}, bulb);
        }
        if (trail.empty() || std::hypot(p.x-trail.back().x, p.z-trail.back().z) >= .15) {
            trail.push_back(p);
            if (trail.size() > 90) trail.pop_front();
        }
        for (auto mark : trail)
            block({mark.x-.035,.011,mark.z-.035}, {.07,.006,.07}, {1.f,.75f,.29f});
        auto part = [&](Vec3 offset, Vec3 size, Tint color) {
            block({p.x+offset.x, p.y+offset.y, p.z+offset.z}, size, color);
        };
        for (double x : {-.34,.23})
            for (double z : {-.23,.12})
                part({x,.03,z}, {.12,.18,.21}, {.12f,.15f,.18f});
        part({-.29,.15,-.26}, {.58,.26,.52}, {.86f,.58f,.24f});
        part({-.20,.41,-.19}, {.40,.20,.34}, {.27f,.66f,.63f});
        part({-.19,.47,.151}, {.38,.09,.014}, {.12f,.21f,.25f});
        for (double x : {-.13,.08})
            part({x,.49,.166}, {.07,.035,.012}, {.87f,.99f,.77f});
        part({.12,.61,-.11}, {.026,.12,.026}, {.67f,.72f,.69f});
        part({.096,.73,-.13}, {.075,.05,.07}, {1.f,.60f,.27f});
        Vec3 c = cell.position(p);
        const Tint enamel{.15f,.83f,.71f}, brass{1.f,.78f,.22f};
        block({c.x-Cell::halfWidth,c.y,c.z-Cell::halfDepth}, {2*Cell::halfWidth,.09,2*Cell::halfDepth}, brass);
        block({c.x-.15,c.y+.09,c.z-.12}, {.30,.39,.24}, enamel);
        block({c.x-Cell::halfWidth,c.y+.48,c.z-Cell::halfDepth}, {2*Cell::halfWidth,.07,2*Cell::halfDepth}, brass);
        block({c.x-.06,c.y+.55,c.z-.07}, {.12,.06,.14}, brass);
        block({c.x-.08,c.y+.20,c.z+.122}, {.16,.07,.012}, {.86f,1.f,.62f});
        if (cell.carried || cell.inReach(p)) {
            Vec3 sign{c.x-.14,c.y+.75,c.z+.14};
            block({sign.x-.04,sign.y-.04,sign.z-.018}, {.37,.43,.025}, {.07f,.18f,.19f});
            block(sign, {.065,.35,.025}, brass);
            for (double dy : {0., .145, .29})
                block({sign.x,sign.y+dy,sign.z}, {.26,.06,.025}, brass);
        }
        if (debugBoxes) {
            auto outline = [&](Box b, Tint tint) {
                constexpr double edge = .035, y = .025;
                for (double x : {b.x0, b.x1-edge})
                    block({x,y,b.z0}, {edge,.012,b.z1-b.z0}, tint);
                for (double z : {b.z0, b.z1-edge})
                    block({b.x0,y,z}, {b.x1-b.x0,.012,edge}, tint);
            };
            glDisable(GL_DEPTH_TEST);
            for (Box shelf : shelves) outline(shelf, {.38f,.87f,1.f});
            outline(robotBox(p), blocked(p) ? Tint{1.f,.28f,.25f}
                                            : Tint{1.f,.90f,.39f});
            glEnable(GL_DEPTH_TEST);
        }
    }
};
