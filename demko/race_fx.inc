// Raceway lighting and the arcade encounter, in the same world coordinates as the ship.
void lightBays(){
    if(stage<6)return;
    static const NeonCavity lightmap;
    int first=int(cz/24)-1;
    for(int k=first;k<first+9;k++){
        double z=24*k+23;
        int side=(k%2==0)?1:-1;
        double x=side*7.8*widthFactor;
        box(x-.22,0,z,.44,7.5,.6,{59,63,88},{38,42,68});
        double start=x-side*3.4;
        box(std::min(start,x),6.85,z,3.4,.30,.63,{54,56,78},{35,36,56});
        box(std::min(start,x)+.10,6.90,z-.025,3.2,.055,.045,{134,164,167},{62,83,93});
        for(int j=0;j<4;j++)box(start+side*(.2+j*.85),6.78,z-.04,.12,.42,.73,{69,68,88},{43,43,63});
        if(stage<7)continue;
        // Back-lit recessed bay and two ceiling emitters. The black ribs break up the spill.
        box(x-3.17,0,z+1,6.34,7.03,2.5,{32,33,54},{64,65,84});
        for(int y=0;y<NeonCavity::rows;y++)for(int c=0;c<NeonCavity::cols;c++){
            double l=x-3+c*6./NeonCavity::cols,b=2.92+y*4./NeonCavity::rows;
            double r=l+6./NeonCavity::cols,top=b+4./NeonCavity::rows;
            quad({l,b,z+.98},{r,b,z+.98},{r,top,z+.98},{l,top,z+.98},haze(lightmap.tex[y][c],z));
        }
        for(int sign:{-1,1}){
            C hot=sign<0?C{113,254,253}:C{255,99,155};
            double xx=x+sign*2.15;
            box(xx-.66,6.66,z+.74,1.32,.16,.2,hot,hot);
        }
        for(int j=0;j<5;j++){
            double xx=x-2.95+j*1.20;
            quad({xx,2.92,z+.76},{xx+.40,2.92,z+.76},{xx+1.30,5.85,z+.76},{xx+1.16,5.88,z+.76},{40,46,64});
        }
        box(x-3.14,2.76,z+.68,6.27,.22,.50,{85,83,104},{50,53,68});
        for(int j=0;j<4;j++)box(x-2.82+j*1.40,1.86,z+.85,.75,.07,.21,{147,155,165},{48,52,68});
    }
}
void atmosphere(){
    if(stage<8)return;
    // Integrate the shaft cross-section along each view ray up to the opaque surface.
    // World-space emitters stay stationary as the camera passes between them.
    int first=int(std::floor((cz-27)/24));
    for(int k=first;k<=first+5;k++){
        if(k%3!=0 && stage<14)continue;
        int side=k%2==0?1:-1;
        double fixture=24*k+23.8,rel=fixture-cz;
        double reach=1-ease((rel-64)/32);
        if(rel< -5 || reach<=0)continue;
        double bx=cx-bend(fixture)-side*(7.8*widthFactor-1.26*(6.82-cy));
        double bz=-rel-.29*(6.82-cy);
        for(int y=0;y<H;y+=2)for(int x=0;x<W;x+=2){
            double sx=(x-W*.5)/focus,sy=(H*.43-y)/focus;
            double dy=(sy+roll*sx)/(1+roll*roll),dx=(sx-roll*sy)/(1+roll*roll)-side*1.26*dy;
            double dz=1+.29*dy;
            double aa=dx*dx+.43*dz*dz;
            double mid=-(bx*dx+.43*bz*dz)/aa;
            double drop=6.82-cy-mid*dy;
            double radius=.84+.68*reveal(13,.22)+.20*std::clamp(drop,0.,6.82);
            double ex=bx+dx*mid,ez=bz+dz*mid;
            double mass=1-(ex*ex+.43*ez*ez)/(radius*radius);
            if(mass<=0)continue;
            double half=radius*std::sqrt(mass/aa);
            double low=std::max(.8,mid-half),high=mid+half;
            if(std::abs(dy)>.0001){
                double p=-cy/dy,q=(6.82-cy)/dy;
                low=std::max(low,std::min(p,q));high=std::min(high,std::max(p,q));
            }
            if(high<=low)continue;
            auto integral=[&](double z){double u=std::clamp((z-mid)/half,-1.,1.);return u-u*u*u/3.;};
            // Visibility at the densest part of the shaft, traced back to its lamp.
            double q=std::clamp(mid,low,high);
            V sample{cx+(sx-roll*sy)*q/(1+roll*roll)-bend(cz+q),cy+dy*q,cz+q};
            V ray=V{side*7.8*widthFactor,6.82,fixture}-sample;
            double shade=1;
            double divisor=bankCos*ray.y-bankSin*ray.x;
            if(std::abs(divisor)>.01){
                double syShip=1.95+.18*std::sin(t*pi/2);
                double u=(bankCos*(syShip-sample.y)+bankSin*(sample.x-shipCenter(t)))/divisor;
                if(u>0 && u<1){
                    V at=sample+ray*u;
                    double zz=at.z-(cz+chaseLag+6.4);
                    if(zz>-.91 && zz<2.35)
                        shade*=1-.72*ease(((2.35-zz)*.47-std::abs((at.x-shipCenter(t))/bankCos))/.24);
                }
            }
            if(ray.y>.01 && sample.y<6.75){
                double u=(6.75-sample.y)/ray.y;
                double strike=sample.x+u*ray.x;
                double rib=std::abs(std::remainder(strike-side*7.8*widthFactor,.85));
                shade*=.52+.48*ease((rib-.055)/.13);
            }
            double base=integral(low);
            for(int yy=y;yy<y+2;yy++)for(int xx=x;xx<x+2;xx++){
                int i=yy*W+xx;
                double stop=depths[i]?std::min(high,1./depths[i]):high;
                if(stop<=low)continue;
                double light=(integral(stop)-base)*mass*half*(.17+.085*reveal(13,.30))*reach*shade;
                C color=side>0?C{169,47,118}:C{35,147,156};
                for(int j=0;j<3;j++)rgb[3*i+j]=std::min(255.,rgb[3*i+j]+light*color[j]);
            }
        }
    }
}
void glowOrb(V p,double r,C hot){
    auto v=[&](int i,double scale){double a=i*pi/6;return V{p.x+scale*r*std::cos(a),p.y+scale*r*std::sin(a),p.z};};
    for(int i=0;i<12;i++)tri(p,v(i,1),v(i+1,1),hot);
}
void boltTrails(){
    for(int i=0;i<3;i++){
        double u=(t-cue.bolts[i])/.52;
        if(u<0 || u>1)continue;
        for(int side:{-1,1}){
            auto pos=[&](double f){double bankX=shipCenter(cue.bolts[i]);
                return V{bankX+side*(1.18+.22*f),1.82+2.75*f,route(cue.bolts[i]+.52*f)+6.2+26*f};};
            V head=pos(u),tail=pos(std::max(0.,u-.15));C hot=side<0?C{87,248,255}:C{255,123,205};
            tri(head+V{-.12,0,0},head+V{.12,0,0},tail,hot);
            glowOrb(head,.17,hot);glowOrb(head+V{0,0,-.045},.075,{255,255,238});
        }
    }
}
double shipCenter(double time) const{
    return pilot+2.15*std::sin(time/cue.duration*6*pi)+.65*std::sin(time*pi/4)-3.05*dodge(time);
}
void pulseTarget(){
    if(stage<10 || t<cue.end[9] || t>cue.impact+1.55)return;
    V target{shipCenter(cue.impact)+.35,4.52,route(cue.impact)+18};
    C amber={255,167,61},teal={98,254,246},magenta={251,92,171};
    double age=t-cue.impact;
    if(age<0){
        glowOrb(target,.58+.08*std::sin(t*9),amber);
        for(int j=0;j<6;j++){
            auto v=[&](double a,double r){return target+V{r*std::cos(a),r*std::sin(a),-.09};};
            double a=j*pi/3+t*.72;
            quad(v(a,1.95),v(a+.83,1.95),v(a+.83,1.39),v(a,1.39),j%2?amber:magenta);
            quad(v(a,1.38),v(a+.40,1.38),v(a+.40,1.25),v(a,1.25),{255,232,154});
        }
    }
    double u=(t-cue.launch)/(cue.impact-cue.launch);
    auto pos=[&](double f){
        V barrel{shipCenter(cue.launch)+.99,1.87,route(cue.launch)+6.1};
        V point=barrel+(target-barrel)*(f*(.67+.33*f));
        point.z=route(cue.launch+(cue.impact-cue.launch)*f)+6.1+11.9*f;
        return point+
            V{1.08*std::sin(pi*f),1.28*std::sin(pi*f),0};
    };
    if(u>=0 && u<=1){
        for(int j=15;j>=0;j--){
            double v=u-j*.011;if(v<0)continue;
            double fade=1-j/16.;
            V p=pos(v);p.y+=.10*std::sin(v*37)*j/16.;
            glowOrb(p,.065+.125*(1-fade),mix({74,82,143},amber,fade));
        }
        V p=pos(u);
        V nose=p+V{-.10,.14,.88},engine=p+V{0,0,-.58};
        tri(nose,p+V{-.21,.08,-.32},engine,{222,230,205});
        tri(nose,engine,p+V{.21,.08,-.32},{116,146,171});
        for(int side:{-1,1})tri(p+V{0,.08,.5},p+V{side*.46,-.12,-.65},p+V{0,-.15,-.16},magenta);
        glowOrb(engine,.14,{255,231,135});
    }
    if(age>=0){
        double r=.45+8.4*age;
        for(int j=0;j<40;j++){
            auto arc=[&](int k,double rad){double a=k*pi/20;return target+V{rad*std::cos(a),.78*rad*std::sin(a),-.7+.39*rad*std::sin(a)};};
            if(age<.72)quad(arc(j,r),arc(j+1,r),arc(j+1,r-.18),arc(j,r-.18),age<.18?C{255,242,199}:teal);
            double az=2*pi*random01(j+293),vel=2.8+6*random01(j+371);
            V p=target+V{std::cos(az)*age*vel,std::sin(az)*age*vel-1.8*age*age,-age*(1+random01(j+103)*4)};
            double h=.09+.16*(1-ease(age/1.55));
            tri(p+V{-h,h,0},p+V{h,h*.5,0},p+V{h*std::cos(az+age*4),-h,0},j%3?amber:magenta);
        }
        if(age<.21)glowOrb(target+V{0,0,-.28},1.44*(1-age/.21),{255,245,197});
    }
}
void motionBlur(){
    if(boost<=.002)return;
    const auto source=rgb;
    const Point ahead=project({cx,cy,cz+108});
    const double travel=route(t)-route(t-.017);
    for(int y=0;y<H;y++)for(int x=0;x<W;x++){
        int i=y*W+x;
        double exposure=std::min(.095,travel*depths[i])*boost;
        double dx=(ahead.x-x)*exposure,dy=(ahead.y-y)*exposure;
        double length=std::hypot(dx,dy);
        if(length<1)continue;
        double limit=std::min(1.,(H*.043)/length);
        dx*=limit;dy*=limit;
        int samples=std::clamp(int(std::ceil(length*limit)),3,28);
        int sum[3]={0,0,0};
        for(int k=0;k<samples;k++){
            double u=(k+.5)/samples;
            int xx=std::clamp(int(std::lround(x+dx*u)),0,W-1);
            int yy=std::clamp(int(std::lround(y+dy*u)),0,H-1);
            for(int c=0;c<3;c++)sum[c]+=source[3*(yy*W+xx)+c];
        }
        for(int c=0;c<3;c++)rgb[3*i+c]=(source[3*i+c]+4*sum[c]/samples)/5;
    }
}

// Rival craft enter from opposite shoulders, settle into lanes, then get passed.
std::vector<V> jetLights;
void fleet(bool lightsOnly=false){
    if(!mirror && !casting)jetLights.clear();
    if(stage<13)return;
    double pass=reveal(16,.85),warp=reveal(17,.30);
    int count=stage>=16?5:2;
    for(int j=0;j<count;j++){
        int side=j%2?1:-1;
        double age=t<.72?t+cue.duration:t;
        double arrive=ease((age-cue.end[j<2?12:15]-.09*(j%3))/.72);
        if(arrive<=0)continue;
        double lane=(j<2?2.0:1.10+.5*(j%3))*side;
        double base=11.5+j*3.15;
        double z=base*arrive+4.6-5*(1-arrive)-pass*(16.5-j*1.3);
        if(z<1.5)continue;
        double drift=.43*std::sin(2.4*age+j*2);
        double x=cx+lane*arrive+side*(3.6-1.5*arrive)*(1-arrive)+drift;
        double y=(j==0?3.1:j==1?4.05:2.85+.65*(j-2))+.21*std::sin(2.7*age+j);
        if(!mirror && !casting)jetLights.push_back({x,y-.13,z-1.3});
        if(lightsOnly)continue;
        double lean=-turnBank*.76-.22*std::cos(2.4*age+j*2);
        double cs=std::cos(lean),sn=std::sin(lean);
        auto p=[&](double u,double v,double w){return V{x+1.2*(u*cs-v*sn),y+1.2*(u*sn+v*cs),cz+z+w};};
        const C paints[]={{56,222,165},{215,71,152},{239,177,62},{99,146,248},{165,106,228}};
        C paint=paints[j],light=mix(paint,{227,255,245},.57);
        V nose=p(0,.13,1.6),canopy=p(0,.48,.05),keel=p(0,-.14,-1.03);
        for(int flank:{-1,1}){
            V root=p(flank*.37,.12,.20),tip=p(flank*(j%2?.94:1.15),-.02,-.58),jet=p(flank*.52,.04,-1.13);
            tri(nose,root,canopy,flank<0?C{43,56,75}:C{88,103,122});tri(root,tip,jet,paint);
            tri(root,jet,keel,{43,52,75});tri(root,canopy,keel,{52,65,81});
            tri(tip,p(flank*.93,.46,-.78),jet,light);
            V intake=p(flank*.65,.14,.62),exhaust=p(flank*.65,.24,-.88);
            tri(intake,p(flank*.87,.10,-.75),exhaust,{54,65,89});
            tri(intake,exhaust,p(flank*.50,.10,-.85),paint);
            tri(p(flank*.69,.21,-.33),p(flank*.74,.19,-.46),p(flank*.62,.22,-.46),{246,222,152});
            if(casting)continue;
            tri(p(flank*.52-.10,.08,-1.14),p(flank*.52+.1,.08,-1.14),p(flank*.52,.04,-1.8),{231,255,246});
            double trail=reveal(14,.24);
            if(trail<=0)continue;
            for(int n=0;n<13;n++){
                auto ribbon=[&](int step,double border){
                    double u=step/13.;
                    double wave=.31*u*std::sin(t*5-u*6+j);
                    return p(flank*.52+wave+border*(1-u)*.065,.07-.32*u,-1.19-6*u*trail);
                };
                quad(ribbon(n,-1),ribbon(n,1),ribbon(n+1,1),ribbon(n+1,-1),mix(paint,{48,76,109},.13+.6*n/13.));
            }
        }
        tri(p(-.20,.29,.06),p(.20,.29,.06),p(0,.40,.82),{25,42,63});
    }
    if(casting || lightsOnly || warp<=0 || t<cue.end[17])return;
    // The finish aperture has a fixed world position. Its layers sweep over the camera.
    double z=route(cue.room-.23)+6.4;
    for(int layer=0;layer<5;layer++){
        double zz=z+layer*3.4,rad=5.1+layer*.37;
        for(int k=0;k<32;k++){
            auto v=[&](int n,double r){
                double a=n*2*pi/32+layer*.065;
                return V{1.1+r*std::cos(a),4+r*std::sin(a),zz};
            };
            C tint=layer%2?C{95,243,225}:C{185,114,242};
            quad(v(k,rad),v(k+1,rad),v(k+1,rad-.14),v(k,rad-.14),tint);
            if(k%4==0)quad(v(k,rad+.44),v(k+1,rad+.44),v(k+1,rad+.32),v(k,rad+.32),{251,224,157});
        }
    }
}


// Integrate a low bank of moving mist. Propulsion leaves a turbulent clear channel down its centre.
void canalMist(){
    if(stage<14)return;
    double amount=reveal(13,.34);
    const double phase=std::fmod(cz,144.)*pi/72;
    for(int y=int(.35*H);y<H;y+=2)for(int x=0;x<W;x+=2){
        double sx=(x-W*.5)/focus,sy=(H*.43-y)/focus;
        double dx=(sx-roll*sy)/(1+roll*roll),dy=(sy+roll*sx)/(1+roll*roll);
        double cyan=0,pink=0;
        int i=y*W+x;
        double end=depths[i]?std::min(52.,1./depths[i]):52.;
        for(double z=3;z<end;z+=4){
            double xx=cx+dx*z-bend(cz+z), yy=cy+dy*z;
            if(yy<.12 || yy>3.1 || std::abs(xx)>13)continue;
            double drift=std::sin(phase+z*pi/72+xx*.39+t*.28);
            double centre=1.55+.54*drift;
            double layer=std::max(0.,1-std::abs(yy-centre)/.9);
            double lane=ease((std::abs(xx-shipCenter(t))-.8)/2.5);
            double mass=layer*layer*lane*(.6+.34*drift);
            (xx>0?pink:cyan)+=mass;
            for(size_t j=0;j<jetLights.size();j++){
                V delta=V{xx,yy,z}-jetLights[j];
                double d=delta.x*delta.x+delta.y*delta.y+.22*delta.z*delta.z;
                if(d<14)(j%2?pink:cyan)+=mass*1.9*(1-d/14);
            }
        }
        double opacity=std::min(.48,(cyan+pink)*.09*amount);
        if(opacity<.004)continue;
        C fog=mix({78,183,194},{173,107,183},pink/(cyan+pink));
        for(int yy=y;yy<std::min(H,y+2);yy++)for(int xx=x;xx<x+2;xx++){
            int at=3*(yy*W+xx);
            for(int c=0;c<3;c++)rgb[at+c]=int(rgb[at+c]*(1-opacity)+fog[c]*opacity);
        }
    }
}

// Longitudinal strips sweep around the flight path. Leave the exit open at the horizon.
void warpTube(){
    if(stage<18 || t<cue.end[17] || t>cue.room+.4)return;
    double iris=ease((t-cue.end[17])/.25)*(1-ease((t-cue.room)/.4));
    if(iris<=0)return;
    int first=int(std::floor(cz/9));
    for(int k=first;k<first+14;k++)for(int j=0;j<14;j++){
        auto wall=[&](int step,double edge){
            double z=9.*step,twist=(z-route(cue.end[17]))*.009;
            double a=j*2*pi/14+twist+edge;
            double rad=7.3+(1-iris)*20;
            return V{rad*std::cos(a),4.1+rad*.77*std::sin(a),z};
        };
        double stripe=.014+.035*iris;
        C color=j%3?C{95,213,213}:C{225,116,188};
        quad(wall(k,-stripe),wall(k,stripe),wall(k+1,stripe),wall(k+1,-stripe),color);
        if(j%2==0)quad(wall(k,.08),wall(k,.115),wall(k+1,.115),wall(k+1,.08),{79,85,135});
    }
}
