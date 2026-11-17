#pragma once
#include "race.hpp"
#include "circuit.hpp"
#include "bridge.hpp"
#include "damage_fx.hpp"
#include "racer.hpp"
#include "flame.hpp"
#include "race_lights.hpp"
#include "thermal.hpp"

namespace neon {
// Canvas command stream: a positive vertex count draws a polygon; other commands use Op.
class CanvasScene {
    using Point = std::array<double, 2>;
    enum Op { Ellipse = -1, Rect = -2, ClipBelow = -3, Restore = -4, Opacity = -5, Sprite = -6, LightPool = -7, HeatLens = -8 };
    double width, focal, horizon, camZ, camX, heading, turbineAngle, cameraLift;
    std::vector<float> &out;

    Point project(double x, double y, double z) const {
        double d = std::max(.4, z - camZ);
        return {width * .5 + focal * (x + road(z) - camX - d * heading) / d,
                horizon - focal * (y - 4.15 - cameraLift) / d};
    }
    void emit(std::initializer_list<double> values) {
        out.insert(out.end(), values.begin(), values.end());
    }
    void polygon(int rgb, std::initializer_list<Point> points) {
        emit({double(points.size()), double(rgb), 0});
        for (auto p : points)
            emit({p[0], p[1]});
    }
    void structures(bool mirror) {
        double sign = mirror ? -1 : 1;
        int far = int(std::floor((camZ + (mirror ? 174 : 336)) / 12));
        for (int k = far; k * 12 > camZ + 1; --k) {
            double z = k * 12;
            double d = z - camZ;
            emit({Opacity, 1 - ramp((d - (mirror ? 112 : 236)) / (mirror ? 62 : 100))});
            // Use the same footprints as the collision world in the low-detail renderer.
            if(k%2==0)citySolids(k/2,[&](Building b){
                auto front=[&](double x,double y){return project(x,sign*y,b.z);};
                int face=mirror?0x252c40:0x343953;
                polygon(face,{front(b.x,b.y),front(b.x+b.w,b.y),front(b.x+b.w,b.y+b.h),front(b.x,b.y+b.h)});
                double edge=b.x<0?b.x+b.w:b.x;
                polygon(mirror?0x22273b:0x282d44,{front(edge,b.y),project(edge,sign*b.y,b.z+b.d),
                    project(edge,sign*(b.y+b.h),b.z+b.d),front(edge,b.y+b.h)});
                if(b.h>5)for(double y=2;y<b.h-1;y+=3)
                    polygon(mirror?0x535368:0x927b84,{front(b.x+.35,y),front(b.x+b.w-.45,y),
                        front(b.x+b.w-.45,y+.20),front(b.x+.35,y+.20)});
            });
            if (d >= 174)
                continue;
            auto surface = [&](double x, double y, double zz) {
                return project(x, y + sign * viaductHeight(zz), zz);
            };
            if (viaductHeight(z + 6) > .01) {
                polygon(mirror ? 0x222b43 : 0x38465b,
                        {surface(-18.5,0,z), surface(18.5,0,z), surface(18.5,0,z+12), surface(-18.5,0,z+12)});
                for (double x : {-9., 9.})
                    polygon(0x596772, {surface(x,0,z), surface(x+.09,0,z), surface(x+.09,0,z+12), surface(x,0,z+12)});
            }
            emit({Opacity, 1 - ramp((d - 112) / 62)});
            for (int offset : {6, 0}) {
                auto face = [&](CoursePoint a, CoursePoint b, CoursePoint c, CoursePoint d, int rgb) {
                    auto q = [&](CoursePoint p) { return surface(p.x, sign * p.y, p.z); };
                    polygon(mirror ? (((rgb >> 1) & 0x7f7f7f) + 0x080c10) : rgb, {q(a), q(b), q(c), q(d)});
                };
                courseSpan(z + offset, face, face);
                if (!mirror)
                    lockSpray(z + offset, turbineAngle / .85, face);
            }
            if (!mirror)
                for (int lane = -2; lane <= 2; lane++) {
                    double x = lane * 7;
                    if (islandHalf(z + 2) > 0 && x < islandHalf(z + 2) + .2)
                        continue;
                    polygon(0x84a9af, {surface(x - .12, .08, z), surface(x + .12, .08, z),
                                       surface(x + .12, .08, z + 4), surface(x - .12, .08, z + 4)});
                }
            int section = circuitIndex(int(std::floor(z / 24)));
            if (!mirror) {
                int edge = district(section) == District::Shipyard ? 0xffb24f : 0x64ddda;
                for (int side : {-1, 1}) {
                    double x = side * 18.4;
                    polygon(edge, {surface(x - .13, .09, z), surface(x + .13, .09, z),
                                   surface(x + .13, .09, z + 12), surface(x - .13, .09, z + 12)});
                }
            }
            if (k % 2 == 1 && (section == 0 || section == 7 || section == 16)) {
                double gate = z + 3, top = sign * (section ? 12 : 9);
                auto beam = [&](double x, double y, double w, double h, int rgb) {
                    polygon(mirror ? ((rgb >> 1) & 0x7f7f7f) : rgb,
                            {surface(x, sign * y, gate), surface(x + w, sign * y, gate),
                             surface(x + w, sign * (y + h), gate), surface(x, sign * (y + h), gate)});
                };
                for (int side : {-1, 1})
                    beam(side * 19.4 - 1, 0, 2, section ? 15 : 9, 0x42516b);
                beam(-20, std::abs(top), 40, 1.2, 0x47596e);
                if (section) {
                    beam(-20, 15, 40, .65, 0x47596e);
                    for (int j = 0; j < 8; j++) {
                        double x = -19 + j * 4.7;
                        polygon(mirror ? 0x33404e : 0x50657b,
                                {surface(x, top, gate), surface(x + .5, top, gate),
                                 surface(x + 4.9, sign * 15, gate), surface(x + 4.4, sign * 15, gate)});
                    }
                    beam(-19, 12, 38, .21, 0x64ddda);
                } else
                    for (int j = 0; j < 24; j++)
                        beam(-12 + j, 9, 1, .6, j % 2 ? 0x243044 : 0xdce7d7);
            }
            if (!mirror && k % 2 == 1 && section == 7) {
                double zz = z + 1;
                auto blade = [&](double a, double r) {
                    return surface(-20.6 + r * std::cos(a), 11.7 + r * std::sin(a), zz);
                };
                for (int i = 0; i < 6; i++) {
                    double a = i * tau / 6 + turbineAngle;
                    polygon(0xe69d56, {blade(a, .52), blade(a + .34, .52), blade(a + .72, 3.9),
                                       blade(a + .43, 4)});
                }
            }
            if (viaductHeight(z) < 6 && k % 8 == 1 && district(section) == District::Shipyard) {
                int side = section % 8 == 0 ? 1 : -1;
                polygon(0x56677e, {surface(side * 22, 0, z), surface(side * 24, 0, z),
                                   surface(side * 24, sign * 21, z), surface(side * 22, sign * 21, z)});
                polygon(0xf4a456,
                        {surface(side * 22, sign * 20, z), surface(side * 6, sign * 15, z),
                         surface(side * 6, sign * 14.5, z), surface(side * 22, sign * 19, z)});
            }
            if (viaductHeight(z) < 3 && k % 2 == 0 && section % 2 && district(section) == District::Quay) {
                emit({12, double(mirror ? 0x645265 : 0xe7aa87),
                      std::max(1., focal * (mirror ? .12 : .17) / (z - camZ))});
                for (int i = 0; i < 12; i++) {
                    auto p = surface(22 * std::cos(i * tau / 12),
                                     sign * (4 + 7 * std::sin(i * tau / 12)), z);
                    emit({p[0], p[1]});
                }
            }
        }
        emit({Opacity, 1});
    }
    void ship(int team,double x,double z,double bank,int damage,double speed,double noseSteer=0) {
        struct Face { Point a,b,c; double depth; int color; };
        std::vector<Face> faces;
        const auto &hull=racerBody(team,true);
        faces.reserve(hull.size());
        const double cs=std::cos(bank),sn=std::sin(bank);
        auto projected=[&](BodyVertex p) {
            return project(x+p.x+p.z*noseSteer,1.85+p.y+Race::deckAt(x,z+p.z),z+p.z);
        };
        for(int side:{-1,1}){
            auto jet=[&](double offset,double length) {
                auto v=posedVertex({float(side*(1.06+.06*(team%2))+offset),.07f,float(-1.9-length),0,0,0},cs,sn,damage);
                return projected(v);
            };
            polygon(0x62dafa,{jet(-.16,0),jet(.16,0),jet(0,.5+speed/65.)});
        }
        for(const auto &f:hull){
            auto a=posedVertex(f.a,cs,sn,damage),b=posedVertex(f.b,cs,sn,damage),c=posedVertex(f.c,cs,sn,damage);
            int rgb=bodyColors[f.finish-TeamPaint];double light=(a.light+b.light+c.light)/3;
            if(f.finish==HotCore)light=1;
            int color=0;
            for(int shift:{16,8,0})color|=int(((rgb>>shift)&255)*light)<<shift;
            faces.push_back({projected(a),projected(b),projected(c),a.z+b.z+c.z-.4*(a.y+b.y+c.y),color});
        }
        std::stable_sort(faces.begin(),faces.end(),[](const Face &a,const Face &b){return a.depth>b.depth;});
        for(const auto &f:faces)polygon(f.color,{f.a,f.b,f.c});
    }
    void actor(const Object &o) {
        auto [x, z, kind, age, speed, rise] = o;
        if (z <= camZ + 1)
            return;
        if(int(kind)==ColdGas || int(kind)==HotGas || int(kind)==IonGas){
            if(z-camZ<1+1.7*speed)return;
            const auto center=project(x,rise,z);double r=focal*speed/(z-camZ);
            if(int(kind)==IonGas){
                emit({LightPool,center[0],center[1],r*1.45,r*1.45,.74*(1-ramp(age))});
                return;
            }
            bool burning=int(kind)==HotGas && age<.36;
            emit({Sprite,burning?5.:4.,center[0],center[1],r,r*(burning?1.15:.94),age*1.4,
                (1-ramp(age))*(burning?.89:.56)});
            return;
        }
        double deck = bridgeHeight(x, z) + viaductHeight(z) + ((kind==5 || int(kind)==RocketImpact)?rise:0);
        auto [cx, cy] = project(x, 1.85 + deck, z);
        double r = focal / (z - camZ);
        if (int(kind) >= Sparks || kind == 5) {
            damagePuffs(int(kind),turbineAngle/.85,age,[&](const Puff &p){
                double zz=z+p.center.z;if(zz<=camZ+.8)return;
                auto center=project(x+p.center.x,deck+p.center.y,zz);
                double scale = focal / (zz - camZ);
                emit({Sprite, double(p.tile), center[0], center[1], p.w * scale, p.h * scale, -p.angle,
                      p.opacity});
            });
            damageMesh(int(kind), turbineAngle / .85, age,
                       [&](CoursePoint a, CoursePoint b, CoursePoint c, int rgb) {
                           auto q = [&](CoursePoint p) { return project(x + p.x, deck + p.y, z + p.z); };
                           polygon(rgb, {q(a), q(b), q(c)});
                       });
        } else if(kind==coreObject || kind==gateObject){
            relayArt(int(kind),int(age),turbineAngle/.85,[&](CoursePoint a,CoursePoint b,CoursePoint c,int rgb){
                auto point=[&](CoursePoint q){return project(x+q.x,deck+q.y,z+q.z);};
                polygon(rgb,{point(a),point(b),point(c)});
            });
        } else if (kind == -2) {
            for(int side:{-1,1}){
                double edge=x+side*(1.55+age);
                polygon(0xff4569,{project(edge,deck+.22,z-1.8),project(edge+side*.24,deck+.22,z-1.8),
                                  project(edge+side*.24,deck+.22,z+1.8),project(edge,deck+.22,z+1.8)});
            }
        } else if (kind == 12) {
            for (int j = 0; j < 5; j++)
                for (int side : {-1, 1}) {
                    double ox = x + side * (1.3 + j * .14), zz = z - 4 - j * 2.6;
                    polygon(0x65ddd0, {project(ox, deck + .32, zz + 1.4),
                                       project(ox + side * .22, deck + .32, zz + 1.4),
                                       project(ox + side * .48, deck + .32, zz),
                                       project(ox + side * .17, deck + .32, zz)});
                }
        } else if (kind == 13) {
            auto aim=project(x,age,z);
            emit({Rect,0xffeead,aim[0]-1,aim[1]-1,2,2});
            for(int side:{-1,1})polygon(0x9bf8de,{{aim[0]+side*.65*r,aim[1]+.14*r},
                {aim[0]+side*.28*r,aim[1]},{aim[0]+side*.28*r,aim[1]-1.3},{aim[0]+side*.65*r,aim[1]-1.}});
        } else if (kind == 14) {
            emit({Ellipse, 0xffdc93, std::max(1., age * r * .24), cx, cy, (2.1 + (1 - age) * 1.5) * r,
                  (1.6 + (1 - age)) * r, 0});
        } else if (kind >= 6 && z-camZ < 42) {
            ship(int(kind)-5,x,z,age,0,speed);
        } else if (kind >= 6) {
            constexpr int colors[] = {0x34e4d0, 0xf96198, 0xf6c547, 0x7d91ff, 0xd372f8, 0x88e26b};
            int color = colors[int(kind) - 6];
            auto p = [&](double dx, double dy, double dz) {
                return project(x + dx, deck + 1.85 + dy + dx * age, z + dz);
            };
            for (int s : {-1, 1}) {
                polygon(0xc4ddd9, {p(0, .12, 2.4), p(s * .58, .32, .1), p(0, .38, -1.3)});
                polygon(color, {p(s * .58, .32, .1), p(s * 1.75, 0, -1.2), p(s * .7, .1, -1.4),
                                p(0, .15, -1.3)});
                polygon(color, {p(s * .6, .08, -1.3), p(s * .86, .08, -1.3), p(s * .72, .06, -3.5)});
            }
        } else if (kind == 0) {
            for (int j = 0; j < 3; j++)
                for (int s : {-1, 1}) {
                    double zz = z - 2 + j * 1.9;
                    polygon(age>0?0xd577ff:0x50f6b7,
                            {project(x, deck + .14, zz + 1.8), project(x + s * 2.9, deck + .14, zz),
                             project(x + s * 2.9, deck + .14, zz - .65), project(x, deck + .14, zz + 1.1)});
                }
        } else if(kind==4){
            emit({Rect,0x50546c,cx-2.6*r,cy-.2*r,5.2*r,.85*r});
            for(int j=-2;j<=2;j++)emit({Rect,0xffb241,cx+(j-.24)*r,cy,.42*r,.48*r});
            emit({Rect,0xff7760,cx+(age>=0?2.17:-2.53)*r,cy-.56*r,.36*r,.45*r});
        } else if(kind==-1 || kind==2 || kind==3){
            const double shaft=kind==3?2.:kind==-1?1.6/std::sqrt(1.+speed*speed+rise*rise):2.7;
            auto nose=project(x,age,z);
            auto tail=project(x+road(z)-road(z-shaft)-shaft*speed,age-rise*shaft,z-shaft);
            const double w=std::max(1.,r*(kind==2?.11:.22));
            if(kind==3){
                polygon(0x9acdcf,{{nose[0],nose[1]-.4*w},{tail[0]+2.3*w,tail[1]+w},{tail[0]-2.3*w,tail[1]+w}});
                emit({Ellipse,0xffad54,0,tail[0],tail[1],w,.85*w,0});
            }else polygon(kind==-1?0xff476c:0xffdc86,{{nose[0]-w,nose[1]},{nose[0]+w,nose[1]},{tail[0]+w,tail[1]},{tail[0]-w,tail[1]}});
        } else if (kind == 1) {
            polygon(0xff664e, {{cx, cy - r}, {cx + r, cy}, {cx, cy + r}, {cx - r, cy}});
        } else {
            emit({Rect, 0xffc875, cx, cy, std::max(2., r * .19), std::max(3., r)});
        }
    }

  public:
    CanvasScene(const Race &race, int w, int h, double pan, std::vector<float> &commands)
        : width(w), focal(std::min(w, h) * .76), horizon(h * .43),
          camZ(race.distance - race.laps * lapLength - 9.2), camX(race.x * .87 + road(camZ) + pan),
          heading(slope(camZ) - pan / 48), turbineAngle(race.elapsed * .85),
          cameraLift(bridgeHeight(race.x, race.distance) + viaductHeight(camZ)), out(commands) {
        horizon += focal * cameraGrade(camZ);
        out.clear();
        const double bearing=tau*camZ/lapLength+std::atan(heading),delta=.34-bearing;
        const bool planetInFront=std::cos(delta)>.05;
        double span = std::min(w, h), sunX = w * .5 + focal*std::tan(delta),
               skyY = horizon - span * .17, waterY = horizon + span * .17;
        if(planetInFront)emit({Ellipse, 0xffdc9f, 0, sunX, skyY, span * .065, span * .065, 0});
        if(planetInFront)emit({Ellipse, 0xffcd96, 2, sunX, skyY, span * .13, span * .018, -.2});
        // A distant shore softens the meeting of the skyline and its reflection.
        for (int i = 0; i < 24; i++) {
            auto ridge = [&](int j) {
                return horizon - span * (.023 + .011 * std::sin(j * .9 + bearing * 8) +
                                         .006 * std::cos(j * 1.9 + bearing * 19));
            };
            double a = width * i / 24, b = width * (i + 1) / 24;
            polygon(0x705469, {{a, horizon}, {a, ridge(i)}, {b, ridge(i + 1)}, {b, horizon}});
        }
        emit({ClipBelow, horizon});
        if(planetInFront)emit({Ellipse, 0x88715f, 0, sunX, waterY, span * .063, span * .061, 0});
        if(planetInFront)emit({Ellipse, 0xa88c73, 2, sunX, waterY, span * .128, span * .014, .2});
        structures(true);
        emit({Restore});
        structures(false);
        for(const auto &lamp : raceLights(race)){
            if(lamp[3]==0)break;
            const double z=lamp[2], d=z-camZ, lane=lamp[0]-road(z);
            const double floor=Race::deckAt(lane,z), height=lamp[1]-floor;
            if(d<1.5 || height<0 || height>=12)continue;
            const auto center=project(lane,floor,z);
            const double radius=focal*4.8/d;
            const double alpha=std::min(.86,std::abs(lamp[3])/(1+.42*height*height));
            emit({LightPool,center[0],center[1],radius,radius*bound((4.15+cameraLift-floor)/d,.05,1),
                  lamp[3]>0?alpha:-alpha});
        }
        auto visible = race.visible();
        if(race.recovery<=0)visible.push_back({float(race.x),float(race.distance-race.laps*lapLength),canvasPlayer,0,0,0});
        std::stable_sort(visible.begin(), visible.end(), [](auto &a, auto &b) { return a[1] > b[1]; });
        struct Face { Vertex a,b,c,d; };
        std::vector<Face> fire;
        flameSkin(race,race.elapsed,[&](Vertex a,Vertex b,Vertex c,Vertex d){
            if(a.z>camZ+1 && c.z>camZ+1)fire.push_back({a,b,c,d});
        });
        std::stable_sort(fire.begin(),fire.end(),[](const Face &a,const Face &b){return a.a.z>b.a.z;});
        struct Lens { double depth,x,y,rx,ry,power; };
        std::vector<Lens> lenses;
        thermalFields(race,[&](HeatPoint a,HeatPoint b,double power,bool fire){
            if(std::min(a.z,b.z)<camZ+1)return;
            auto p=project(a.x-road(a.z),a.y,a.z),q=project(b.x-road(b.z),b.y,b.z);
            double radius=focal*(a.radius+b.radius)/(a.z+b.z-2*camZ);
            lenses.push_back({(a.z+b.z)*.5,(p[0]+q[0])*.5,(p[1]+q[1])*.5,
                              radius,std::max(1.,std::abs(p[1]-q[1])*.5),fire?-power:power});
        });
        std::sort(lenses.begin(),lenses.end(),[](auto a,auto b){return a.depth>b.depth;});
        size_t nextLens=0;
        auto refractTo=[&](double z){
            while(nextLens<lenses.size() && lenses[nextLens].depth>z){
                const auto &l=lenses[nextLens++];
                emit({HeatLens,l.x,l.y,l.rx,l.ry,l.power,race.elapsed});
            }
        };
        size_t i=0;
        auto burnTo=[&](double z){
            for(;i<fire.size() && fire[i].a.z>z;++i){
                auto &f=fire[i];double heat=double(f.a.r)/255;heat*=heat;
                auto point=[&](Vertex v){return project(v.x-road(v.z),v.y,v.z);};
                int rgb=0xfc0000+(int(48+195*heat)<<8)+int(8+165*heat);
                emit({Opacity,.68*f.a.g/255});
                polygon(rgb,{point(f.a),point(f.b),point(f.c),point(f.d)});
            }
            emit({Opacity,1});
        };
        for(auto &o:visible){
            burnTo(o[1]);refractTo(o[1]);
            if(o[2]==canvasPlayer)ship(0,race.x,o[1],race.lean,(3-race.shield)*race.damagedSide,race.speed,race.noseSteer());
            else actor(o);
        }
        burnTo(camZ);refractTo(camZ);
    }
};
} // namespace neon
