#pragma once
#include "bridge.hpp"
#include "race.hpp"

namespace neon {
// Effects are local to the contact point. Each shard has a fixed trajectory.
template <class Triangle> void damageMesh(int kind, double time, double age, Triangle tri) {
    if(kind==5 || kind==RocketImpact){
        const bool rocket=kind==RocketImpact;
        double u=std::clamp(age/(rocket?.78:.32),0.,1.);
        // The pressure front expands in three dimensions. Cannon splinters stay narrow.
        if(rocket && u<.68){
            double r=.35+6.6*(1-std::exp(-4*u)),w=.17*(1-u/.68);
            for(int i=0;i<32;i++){
                double a=tau*i/32,b=tau*(i+1)/32;
                auto ring=[&](double angle,double rad){
                    return CoursePoint{rad*std::cos(angle),1.7+.48*rad*std::sin(angle),.85*rad*std::sin(angle)};};
                if(i%5==2 && u>.30)continue;
                tri(ring(a,r),ring(b,r),ring(a,r-w),0xffc478);
                tri(ring(b,r),ring(b,r-w),ring(a,r-w),0xffe4a1);
            }
        }
        for(int i=0;i<(rocket?21:10);i++){
            double a=i*2.399963,dy=.20+std::sin(i*1.73),dx=std::cos(a),dz=std::sin(a);
            double r=(rocket?8.:3.3)*u*(.58+.1*(i%5)),w=(rocket?.12:.115)*(1-u);
            CoursePoint tip{r*dx,1.7+r*dy-u*u*1.6,r*dz};
            double tail=r*(rocket?.73:.38);
            tri(tip,{tail*dx-w,1.7+tail*dy-u*u*1.6,tail*dz},
                    {tail*dx+w,1.7+tail*dy+w-u*u*1.6,tail*dz},
                    u<.24?0xfff4bf:i%3?0xffae57:0x98ddec);
        }
    } else if (kind == Sparks) {
        const double side = age < 0 ? -1 : 1, intensity = std::clamp(std::abs(age), 0., 1.);
        for (int i = 0; i < 9; i++) {
            double u = std::fmod(time * 2.8 + i * .3819, 1.), x = -side * u * (.3 + .13 * (i % 4));
            double y = 1.12 + u * (1.1 + .25 * (i % 3)) - 1.6 * u * u, z = -1 - u * 4.5;
            tri({x, y, z}, {x + .055 * intensity, y + .08 * intensity, z},
                {x - side * .12, y - .08, z - .48 * intensity}, i % 3 ? 0xffb04c : 0xfff4b6);
        }
    } else if (kind == Fragments || kind == PlayerFragments) {
        // The two thruster housings separate first; their hot cores cool as they tumble.
        for (int side : {-1, 1}) {
            double spin = side * (.22 + 3.7 * age), cs = std::cos(spin), sn = std::sin(spin);
            double size = 1 - .65 * age, ox = side * (.72 + 1.8 * age),
                   oy = std::max(.28, 1.72 + 2.8 * age - 5 * age * age);
            auto ring = [&](int j, double radius, double dz) {
                double a = j * tau / 12, xx = radius * std::cos(a) * size, yy = radius * std::sin(a) * size;
                return CoursePoint{ox + xx * cs - dz * sn, oy + yy, -.68 - age + xx * sn + dz * cs};
            };
            for (int j = 0; j < 12; j++) {
                auto a = ring(j, .30, -.43), b = ring(j + 1, .30, -.43), c = ring(j + 1, .25, .41),
                     d = ring(j, .25, .41);
                int paint = j < 6 ? 0x8098a6 : 0x47596b;
                tri(a, b, c, paint);
                tri(a, c, d, paint);
                auto inner = ring(j, .18, -.435), next = ring(j + 1, .18, -.435);
                tri(a, inner, b, 0xb7cad2);
                tri(inner, next, b, 0x788b96);
                tri(inner, ring(0, 0, -.36), next, age < .48 ? 0xffcc86 : 0x544652);
            }
        }
        for (int i = 0; i < 16; i++) {
            double a = i * 2.39996, t = age, spread = .25 + (1.5 + (i % 4) * .38) * t;
            double x = std::cos(a) * spread, y = std::max(.14, 1.6 + t * (2 + i % 5) - 6 * t * t),
                   z = std::sin(a) * spread - t;
            double r = (1 - t) * (.26 + .09 * (i % 4)) + .025, angle = a + t * (3 + i % 4);
            auto v = [&](double u, double h, double d) {
                return CoursePoint{x + r * (u * std::cos(angle) - h * std::sin(angle)),
                                   y + r * (u * std::sin(angle) + h * std::cos(angle)), z + r * d};
            };
            // Broken skins have thickness, a torn edge, paint and exposed metal.
            auto nose = v(.7, .27, 1.15), left = v(-1, -.14, -.74), right = v(.76, -.24, -.56),
                 lip = v(-.22, .22, -.9);
            tri(nose, left, lip, i % 3 == 0 ? 0xe88f52 : i % 5 == 1 ? 0x80cdda : 0x849dae);
            tri(nose, lip, right, i % 3 == 0 ? 0xffc27a : 0x546574);
            tri(left, right, lip, 0x354353);
            tri(nose, right, left, 0x404c59);
        }
    }
}
struct Puff {
    CoursePoint center;
    double w, h, angle, opacity;
    int tile;
};

template <class Emit> void damagePuffs(int kind, double time, double age, Emit emit) {
    auto puff = [&](double x, double y, double z, double w, double h, double angle, double alpha, int tile) {
        emit(Puff{{x, y, z}, w, h, angle, std::clamp(alpha, 0., 1.), tile});
    };
    if (kind == Fragments || kind == PlayerFragments || kind == 5 || kind==RocketImpact) {
        if(kind==RocketImpact){puff(0,1.7,0,1.2+age*10,1.2+age*10,0,std::max(0.,1-age/.12),6);return;}
        if(kind==5){
            puff(0,1.7,0,.65+age,.48+age,0,std::max(0.,1-age/.16),6);
            return;
        }
        double u=std::clamp(age,0.,1.);
        double radius=.28+2.3*u;
        for (int i = 0; i < 12; i++) {
            double a = i * 2.39996, r = radius * (.45 + .16 * (i % 4)), size = .25 + .66 * u;
            puff(std::cos(a) * r, 1.7 + std::sin(a) * r * .6 + u * .9, std::sin(a * 1.6) * r, size,
                 size * (.9 + .1 * (i % 3)), a + .45 * u, (1 - u) * .85, i % 3 && u > .25 ? 4 : 5);
        }
        puff(0, 1.8, -.08, 1. + 2.8 * u, 1. + 2.8 * u, 0, std::max(0., 1 - 3 * u), 6);
        for (int i = 0; i < 18; i++) {
            double a = i * 2.39996, r = (1.8 + .4 * (i % 4)) * u;
            puff(r * std::cos(a), 1.7 + r * std::sin(a) - u * u, r * std::cos(a * 1.7), .06, .13 + .12 * u, a,
                 1 - u, 6);
        }
    } else if (kind == Sparks) {
        double side = age < 0 ? -1 : 1;
        for (int i = 0; i < 10; i++) {
            double u = std::fmod(time * 2.8 + i * .3819, 1.);
            puff(-side * u * (.3 + .13 * (i % 4)), 1.12 + u * (1.1 + .25 * (i % 3)) - 1.6 * u * u,
                 -1 - u * 4.5, .10, .18, side * u, std::abs(age) * (1 - u), 6);
        }
    }
}
} // namespace neon
