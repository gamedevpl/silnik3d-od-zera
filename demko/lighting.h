// A small diffuse lightmap for the recessed neon panels along the raceway.
// Sample on the back wall of a real cavity. The open front faces the canal.
struct NeonCavity {
    static constexpr int cols=16,rows=12;
    C tex[rows][cols];
    struct Hit { V point,normal; int wall; };
    static Hit hit(V p,V d){
        double nearest=1e9; Hit h{};
        auto wall=[&](double distance,V n,int face){
            if(distance>.0001 && distance<nearest){nearest=distance;h={p+d*distance,n,face};}
        };
        if(d.x>0)wall((3-p.x)/d.x,{-1,0,0},1);
        if(d.x<0)wall((-3-p.x)/d.x,{1,0,0},0);
        if(d.y>0)wall((4-p.y)/d.y,{0,-1,0},3);
        if(d.y<0)wall(-p.y/d.y,{0,1,0},2);
        if(d.z>0)wall((2-p.z)/d.z,{0,0,-1},5);
        if(d.z<0)wall(-p.z/d.z,{0,0,1},4);
        return h;
    }
    static V radiance(V p,V d,int depth,int seed){
        auto h=hit(p,d);
        if(h.wall==4)return {.075,.095,.14};
        if(h.wall==3 && std::abs(h.point.x)>1.55 && h.point.z>.3)
            return h.point.x<0?V{.12,3.8,5.2}:V{5.1,.48,1.5};
        if(depth==0)return {.035,.03,.052};
        double r=std::sqrt(random01(seed+2)),a=2*pi*random01(seed+6);
        V side=h.normal.x!=0?V{0,1,0}:V{1,0,0};
        V tangent={h.normal.y*side.z-h.normal.z*side.y,h.normal.z*side.x-h.normal.x*side.z,h.normal.x*side.y-h.normal.y*side.x};
        V ray=side*(r*std::cos(a))+tangent*(r*std::sin(a))+h.normal*std::sqrt(1-r*r);
        return radiance(h.point+h.normal*.001,ray,depth-1,seed+891)*.72;
    }
    NeonCavity(){
        for(int y=0;y<rows;y++)for(int x=0;x<cols;x++){
            V sum{}; V start={-3+6*(x+.5)/cols,4*(y+.5)/rows,1.998};
            for(int i=0;i<768;i++){
                int seed=(y*cols+x)*3001+i*37;
                double r=std::sqrt(random01(seed)),a=2*pi*random01(seed+1);
                sum=sum+radiance(start,{r*std::cos(a),r*std::sin(a),-std::sqrt(1-r*r)},2,seed);
            }
            auto expose=[](double value){return int(255*std::sqrt(1-std::exp(-value/768*1.65)));};
            tex[y][x]={expose(sum.x),expose(sum.y),expose(sum.z)};
        }
    }
};
