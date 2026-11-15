// Quarter-resolution bright pass. Keep the sharp pixel underneath the neon halo.
function compositeNeon(rgb){
    const w=480,h=300,small=w/4,rows=h/4;
    const bright=new Float32Array(small*rows*3),blur=new Float32Array(bright.length);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const i=3*(y*w+x),k=3*((y>>2)*small+(x>>2));
        for(let c=0;c<3;c++)bright[k+c]+=Math.max(0,rgb[i+c]-126)/8;
    }
    for(let y=0;y<rows;y++)for(let x=0;x<small;x++){
        const k=3*(y*small+x),l=x? k-3:k,r=x+1<small?k+3:k;
        for(let c=0;c<3;c++)blur[k+c]=(bright[l+c]+2*bright[k+c]+bright[r+c])*.25;
    }
    const out=new Uint8ClampedArray(w*h*4);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const i=y*w+x,k=3*((y>>2)*small+(x>>2)),up=y>=4?k-3*small:k,down=y<h-4?k+3*small:k;
        for(let c=0;c<3;c++)out[4*i+c]=rgb[3*i+c]+.25*(blur[up+c]+2*blur[k+c]+blur[down+c]);
        out[4*i+3]=255;
    }
    return out;
}
