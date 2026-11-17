#pragma once
#include "junction.hpp"

namespace neon {
struct CoursePoint {
    double x, y, z;
};
// Six-metre spans keep the ramp, island rails and catenary cables continuous.
template <class Quad, class Deck> void courseSpan(double z, Quad quad, Deck plate) {
    const double p = lapPosition(z), end = z + 6;
    auto signboard = [&](double x, double y, double tip, int ink) {
        quad({x - 2, y - .5, z}, {x + 2, y - .5, z}, {x + 2, y + .5, z}, {x - 2, y + .5, z}, 0x263744);
        quad({x + tip, y, z - .04}, {x - tip * .25, y + .46, z - .04}, {x - tip * .8, y + .46, z - .04},
             {x + tip * .35, y, z - .04}, ink);
        quad({x + tip * .35, y, z - .04}, {x - tip * .8, y - .46, z - .04}, {x - tip * .25, y - .46, z - .04},
             {x + tip, y, z - .04}, ink);
    };
    if (p == 252 || p == 270) {
        signboard(-8, 3.8, -1.7, 0xffc773);
        signboard(8, 3.8, 1.7, 0x64f3e0);
    }
    if (p >= 504 && p <= 1032 && int(p) % 24 == 0) {
        double side = (chicane(z+18)-2*chicane(z)+chicane(z-18))>0 ? -1 : 1;
        signboard(side * 18, 2.7, -side * 1.7, 0xffc773);
    }
    for(double lip:{firstLip,secondLip}){
        if(p>=lip-42 && p<lip && int(p)%12==0){
            for(double side:{-1.,1.}){
                const double x=side*9;
                quad({x, .11,z+4},{x+2,.11,z},{x+1.3,.11,z},{x,.11,z+2.5},0xffcb83);
                quad({x,.11,z+4},{x,.11,z+2.5},{x-1.3,.11,z},{x-2,.11,z},0xffcb83);
            }
        }
        if(p==lip+jumpSpan || p==lip+jumpSpan+12){
            const double lane=landingLane(lip);
            for(double x:{lane-3.3,lane+3.3}){
                quad({x-.3,0,z},{x+.3,0,z},{x+.3,5,z},{x-.3,5,z},0x88ffe5);
            }
        }
    }
    if (p < forkStart || p >= forkEnd)
        return;
    const double a = islandHalf(z), b = islandHalf(end), h = bridgeHeight(-10, z), j = bridgeHeight(-10, end);
    // Raised deck, fascia, illuminated parapet and expansion joints.
    plate({-19, h + .10, z}, {-a, h + .10, z}, {-b, j + .10, end}, {-19, j + .10, end},
         int(p) % 12 ? 0x354755 : 0x394a57);
    quad({-a, h + .10, z}, {-a, std::max(.04, h - .62), z}, {-b, std::max(.04, j - .62), end},
         {-b, j + .10, end}, 0x435465);
    if (h > 2 && j > 2) {
        quad({-19, h - .62, z}, {-a, h - .62, z}, {-b, j - .62, end}, {-19, j - .62, end}, 0x253244);
        if (int(p) % 18 == 0) {
            quad({-a - .4, .08, z}, {-a - .4, h - .4, z}, {-a - .4, h - .4, z + 1.4}, {-a - .4, .08, z + 1.4},
                 0x536576);
            quad({-a - .4, .08, z}, {-a - 1.5, .08, z}, {-a - 1.5, h - .4, z}, {-a - .4, h - .4, z},
                 0x354757);
        }
    }
    quad({-19, h + .17, z}, {-18.72, h + .17, z}, {-18.72, j + .17, end}, {-19, j + .17, end}, 0xfcba69);
    quad({-a - .41, h + .17, z}, {-a - .12, h + .17, z}, {-b - .12, j + .17, end}, {-b - .41, j + .17, end},
         0xf8ba69);
    if (int(p) % 12 == 0)
        quad({-18.6, h + .15, z}, {-a - .6, h + .15, z}, {-a - .6, h + .15, z + .18},
             {-18.6, h + .15, z + .18}, 0x7c8685);
    // Break the running surface into plates, with recessed strips and bolted edges.
    const double middle = (-19 - a) * .5, nextMiddle = (-19 - b) * .5;
    for (int side : {-1, 1}) {
        double x = middle + side * 2.7, xx = nextMiddle + side * 2.7;
        quad({x, h + .145, z}, {x + .14, h + .145, z}, {xx + .14, j + .145, end}, {xx, j + .145, end},
             0x253542);
    }
    if (int(p) % 12 == 0) {
        double y = h + .18, yy = bridgeHeight(-10, z + 2.2) + .18;
        for (int side : {-1, 1})
            quad({middle, yy, z + 2.2}, {middle + side * .96, y, z + .6}, {middle + side * .62, y, z + .6},
                 {middle, yy, z + 1.6}, 0x93abb1);
    }
    quad({-a - .15, h - .25, z}, {-a - .15, h - .48, z}, {-b - .15, j - .48, end}, {-b - .15, j - .25, end},
         0xc18257);
    if (h > 2 && int(p) % 18 == 0) {
        double depth = 2, outer = -a + .03;
        quad({outer, h - .15, z}, {outer, .5, z + depth}, {outer + .23, .5, z + depth},
             {outer + .23, h - .15, z}, 0x66818d);
    }
    // A low island has a lit cap and reflects in the lower channel.
    const double cap = .62 * a / 6.8, next = .62 * b / 6.8;
    quad({-a, cap, z}, {a, cap, z}, {b, next, end}, {-b, next, end}, 0x475065);
    quad({a, .02, z}, {a, cap, z}, {b, next, end}, {b, .02, end}, 0x293e4e);
    quad({a, cap + .05, z}, {a + .28, cap + .05, z}, {b + .28, next + .05, end}, {b, next + .05, end},
         0x57ddce);
    if (int(p) % 18 == 0) {
        double x = (19 + a) * .5;
        for (int s : {-1, 1})
            quad({x, .12, z + 3.4}, {x + s * 2.1, .12, z + 1.2}, {x + s * 2.1, .12, z + .6},
                 {x, .12, z + 2.8}, 0x55dbcc);
    }
    if (p < 318 || p >= 426)
        return;
    for (int edge : {0, 1}) {
        double x = edge ? -7.15 : -19.4;
        auto cable = [&](double zz) {
            double u = (lapPosition(zz) - 318) / 108;
            return 9. + 5.5 * (2 * u - 1) * (2 * u - 1);
        };
        double y = cable(z), ny = cable(end);
        quad({x - .10, y, z}, {x + .10, y, z}, {x + .10, ny, end}, {x - .10, ny, end}, 0xffce8a);
        quad({x, y - .11, z}, {x, y + .11, z}, {x, ny + .11, end}, {x, ny - .11, end}, 0xfadaab);
        if (int(p) % 12 == 6)
            quad({x - .055, h + .2, z}, {x + .055, h + .2, z}, {x + .055, y, z}, {x - .055, y, z}, 0x8dabb4);
        if (p == 318 || p == 420) {
            double zz = p == 318 ? z : end;
            quad({x - .44, 0, zz}, {x + .44, 0, zz}, {x + .44, 15.3, zz}, {x - .44, 15.3, zz}, 0x537082);
            quad({x + .44, 0, zz}, {x + .44, 0, zz + 1.3}, {x + .44, 15.3, zz + 1.3}, {x + .44, 15.3, zz},
                 0x314658);
            if (edge) {
                quad({-19.8, 14.25, zz}, {-6.7, 14.25, zz}, {-6.7, 15.25, zz}, {-19.8, 15.25, zz}, 0x425767);
                quad({-19.8, 14.3, zz - .025}, {-6.7, 14.3, zz - .025}, {-6.7, 14.42, zz - .025},
                     {-19.8, 14.42, zz - .025}, 0xffbd74);
                for (int side : {-1, 1}) {
                    double foot = side < 0 ? -19.35 : -7.2;
                    quad({foot, 12.25, zz}, {foot, 12.85, zz}, {foot - side * 2.38, 14.55, zz},
                         {foot - side * 2.95, 14.55, zz}, 0x76919a);
                }
            }
            quad({x - .35, 14.7, zz - .05}, {x + .35, 14.7, zz - .05}, {x + .35, 15.2, zz - .05},
                 {x - .35, 15.2, zz - .05}, 0xffcd88);
        }
    }
}
// Exhaust water from the lock pumps lands outside the navigable lane.
template <class Quad> void lockSpray(double z, double t, Quad quad) {
    double p = lapPosition(z);
    if (p != 336 && p != 384 && p != 432)
        return;
    for (int jet = 0; jet < 8; jet++) {
        double phase = t * 1.28 + jet / 8. + p * .013;
        double u = phase - std::floor(phase);
        double x = 20.3 - 2.7 * u, y = .24 + 6.8 * u * (1 - u);
        double zz = z + .6 * std::sin(jet * 2.4) + 1.6 * u;
        double width = .055 + .11 * u;
        quad({x - width, y, zz}, {x + width, y, zz}, {x + .25 + width, y + .68 * (2 * u - 1), zz - .13},
             {x + .25 - width, y + .68 * (2 * u - 1), zz - .13}, jet % 3 ? 0x8fc8ce : 0xd4f2e7);
    }
}
} // namespace neon
