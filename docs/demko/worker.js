importScripts('glow.js');
let engine;
async function loadEngine(){
    const response=await fetch('flight.wasm');
    if(!response.ok)throw Error('wasm '+response.status);
    const wasi={
        fd_close:()=>8, fd_seek:()=>8, fd_write:()=>8,
        clock_time_get:(id,precision,ptr)=>{
            new DataView(engine.memory.buffer).setBigUint64(ptr,BigInt(Math.floor(performance.now()*1e6)),true);
            return 0;
        }
    };
    const module=await WebAssembly.instantiate(await response.arrayBuffer(),{wasi_snapshot_preview1:wasi});
    engine=module.instance.exports;
    engine._initialize();
}
const loaded=loadEngine();
self.onmessage=async({data})=>{
    try{
        await loaded;
        const ptr=engine.fly(data.t,data.steer,data.shot);
        const rgb=new Uint8Array(engine.memory.buffer,ptr,480*300*3);
        const out=compositeNeon(rgb);
        self.postMessage({pixels:out},[out.buffer]);
    }catch(error){self.postMessage({error:String(error)});}
};
