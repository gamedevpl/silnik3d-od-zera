// Raceway lighting and the arcade encounter, in the same world coordinates as the ship.
void lightBays(){
    if(stage<6)return;
    static const NeonCavity lightmap;
    int first=int(cz/24)-1;
    for(int k=first;k<first+9;k++){
        double z=24*k+23;
        int side=(k%2==0)?1:-1;
        double x=side*7.8;
        box(x-.22,0,z,.44,7.5,.6,{59,63,88},{38,42,68});
        box(std::min(x,0.),6.85,z,std::abs(x),.4,.63,{93,89,107},{49,54,73});
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
double castShadow(double wx,double wz,int gate,double shipX,double shipY) const{
    // Trace from the water toward the key light. Intersect the wing plane and the gantry.
    double delta=shipY;
    double x=wx+.52*delta-shipX,z=wz-.88*delta-(cz+chaseLag+6.4);
    if(z>=-1.35 && z<2.35 && std::abs(x)<(2.35-z)*.45)return .56;
    const double gz=24*gate+23, travel=(wz-gz)/.88;
    if(travel<=0 || travel>7.5)return 0;
    double gx=(gate%2==0?7.8:-7.8),hitX=wx+travel*.52;
    if(std::abs(hitX-gx)<.25 || (travel>6.85 && travel<7.25 && hitX*gx>0 && std::abs(hitX)<7.8))return .71;
    return 0;
}
void atmosphere(){
    if(stage<8)return;
    // Integrate the shaft cross-section along each view ray up to the opaque surface.
    // World-space emitters stay stationary as the camera passes between them.
    int first=int(std::floor((cz-27)/24));
    for(int k=first;k<=first+5;k++){
        if(k%3!=0)continue;
        int side=k%2==0?1:-1;
        double fixture=24*k+23.8,rel=fixture-cz;
        double reach=1-ease((rel-64)/32);
        if(rel< -5 || reach<=0)continue;
        double bx=cx-bend(fixture)-side*(7.8-1.26*(6.82-cy));
        double bz=-rel-.29*(6.82-cy);
        for(int y=0;y<H;y+=2)for(int x=0;x<W;x+=2){
            double sx=(x-W*.5)/focus,sy=(H*.43-y)/focus;
            double dy=(sy+roll*sx)/(1+roll*roll),dx=(sx-roll*sy)/(1+roll*roll)-side*1.26*dy;
            double dz=1+.29*dy;
            double aa=dx*dx+.43*dz*dz;
            double mid=-(bx*dx+.43*bz*dz)/aa;
            double drop=6.82-cy-mid*dy;
            double radius=.76+.20*std::clamp(drop,0.,6.82);
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
            double base=integral(low);
            for(int yy=y;yy<y+2;yy++)for(int xx=x;xx<x+2;xx++){
                int i=yy*W+xx;
                double stop=depths[i]?std::min(high,1./depths[i]):high;
                if(stop<=low)continue;
                double light=(integral(stop)-base)*mass*half*.095*reach;
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
void boltTrials(){
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
    if(stage<9 || t<cue.end[8] || t>cue.impact+1.55)return;
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
    double strength=ease((t-cue.end[10])/.83)*(1-ease((t-cue.room)/1.25));
    if(strength<=0)return;
    auto source=rgb;
    double travel=route(t)-route(t-.04);
    for(int y=0;y<H;y++)for(int x=0;x<W;x++){
        int i=y*W+x;double exposure=std::min(.16,travel*depths[i])*strength;
        if(exposure<.003)continue;
        for(int c=0;c<3;c++){
            int sum=0;
            for(int j=1;j<=4;j++){
                double u=j*.25*exposure;
                int xx=std::clamp(int(x+(W*.5-x)*u),0,W-1);
                int yy=std::clamp(int(y+(H*.43-y)*u),0,H-1);
                sum+=source[3*(yy*W+xx)+c];
            }
            rgb[3*i+c]=(3*source[3*i+c]+sum)/7;
        }
    }
}
