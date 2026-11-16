#pragma once
#import <MetalKit/MetalKit.h>
#import <simd/simd.h>
#include "../track_mesh.hpp"
#include "../materials.hpp"

class Graphics {
    struct Strip {
        id<MTLBuffer> buffer;
        std::vector<int> starts;
    };
    struct View {
        simd_float4 camera, lens, effects, visibility;
    };
    id<MTLDevice> device;
    id<MTLCommandQueue> queue;
    id<MTLRenderPipelineState> sky, solid, shadow;
    id<MTLDepthStencilState> depth, shadowDepth, background;
    Strip scenery[3];
    id<MTLTexture> maps[2];
    void makeStrip(Strip &strip, int simple) {
        neon::TrackMesh track(simple);
        strip.starts = std::move(track.sections);
        strip.buffer = [device newBufferWithBytes:track.data.data()
                                           length:track.data.size() * sizeof(Vertex)
                                          options:MTLResourceStorageModeShared];
    }

  public:
    bool setup(MTKView *view, NSError **error) {
        device = view.device;
        queue = [device newCommandQueue];
        NSURL *url = [NSBundle.mainBundle URLForResource:@"Canal" withExtension:@"metal"];
        NSString *src =
            [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:error];
        if (!src)
            return false;
        auto lib = [device newLibraryWithSource:src options:nil error:error];
        if (!lib)
            return false;
        auto pipeline = [&](NSString *vertex, NSString *fragment, bool blend) {
            auto d = [MTLRenderPipelineDescriptor new];
            d.vertexFunction = [lib newFunctionWithName:vertex];
            d.fragmentFunction = [lib newFunctionWithName:fragment];
            d.depthAttachmentPixelFormat = view.depthStencilPixelFormat;
            auto c = d.colorAttachments[0];
            c.pixelFormat = view.colorPixelFormat;
            c.blendingEnabled = blend;
            c.sourceRGBBlendFactor = MTLBlendFactorSourceAlpha;
            c.destinationRGBBlendFactor = MTLBlendFactorOneMinusSourceAlpha;
            return [device newRenderPipelineStateWithDescriptor:d error:error];
        };
        sky = pipeline(@"skyVertex", @"skyPixel", false);
        if (!sky)
            return false;
        solid = pipeline(@"worldVertex", @"worldPixel", true);
        if (!solid)
            return false;
        shadow = pipeline(@"worldVertex", @"worldPixel", true);
        if (!shadow)
            return false;
        auto state = [&](MTLCompareFunction func, bool write) {
            auto d = [MTLDepthStencilDescriptor new];
            d.depthCompareFunction = func;
            d.depthWriteEnabled = write;
            return [device newDepthStencilStateWithDescriptor:d];
        };
        background = state(MTLCompareFunctionAlways, false);
        depth = state(MTLCompareFunctionLessEqual, true);
        shadowDepth = state(MTLCompareFunctionLess, true);
        auto desc = [MTLTextureDescriptor texture2DDescriptorWithPixelFormat:MTLPixelFormatRGBA8Unorm
                                                                       width:64
                                                                      height:64
                                                                   mipmapped:YES];
        desc.storageMode = MTLStorageModeShared;
        auto upload = [queue commandBuffer];
        auto blit = [upload blitCommandEncoder];
        for (int i = 0; i < 2; i++) {
            maps[i] = [device newTextureWithDescriptor:desc];
            if (!maps[i])
                return false;
            [maps[i] replaceRegion:MTLRegionMake2D(0, 0, 64, 64)
                       mipmapLevel:0
                         withBytes:neon::materialTile(i).data()
                       bytesPerRow:256];
            [blit generateMipmapsForTexture:maps[i]];
        }
        [blit endEncoding];
        [upload commit];
        [upload waitUntilCompleted];
        if (upload.status != MTLCommandBufferStatusCompleted)
            return false;
        makeStrip(scenery[0], 0);
        makeStrip(scenery[1], 1);
        makeStrip(scenery[2], 2);
        return queue && scenery[0].buffer && scenery[1].buffer && scenery[2].buffer;
    }
    id<MTLCommandBuffer> paint(MTKView *view, const neon::Race &s) {
        auto pass = view.currentRenderPassDescriptor;
        auto drawable = view.currentDrawable;
        if (!pass || !drawable)
            return nil;
        double local = s.distance - s.laps * neon::lapLength, cz = local - 9.2;
        int n = neon::buildActors(s, s.elapsed);
        auto moving = [device newBufferWithBytes:vertices()
                                          length:n * sizeof(Vertex)
                                         options:MTLResourceStorageModeShared];
        auto cmd = [queue commandBuffer];
        float aspect = float(drawable.texture.width) / drawable.texture.height;
        float framing = std::min(1.f, aspect), f = framing * (1.55 - .12 * s.thrust);
        View u = {{float(s.x * .87 + neon::road(cz)), float(cz), float(neon::slope(cz)), float(s.lean * .15)},
                  {f / aspect, f, aspect, framing},
                  {float(fmod(s.elapsed, 180.)), 0, 0, float(neon::bridgeHeight(s.x, s.distance))},
                  {0, 0, 0, 0}};
        pass.colorAttachments[0].storeAction = MTLStoreActionStore;
        auto enc = [cmd renderCommandEncoderWithDescriptor:pass];
        auto uniforms = [&] {
            for (int i = 0; i < 2; i++)
                [enc setFragmentTexture:maps[i] atIndex:i];
            [enc setVertexBytes:&u length:sizeof(u) atIndex:1];
            [enc setFragmentBytes:&u length:sizeof(u) atIndex:1];
        };
        uniforms();
        [enc setRenderPipelineState:sky];
        [enc setDepthStencilState:background];
        [enc drawPrimitives:MTLPrimitiveTypeTriangle vertexStart:0 vertexCount:3];
        for (int mode : {1, 2, 0}) {
            if (mode == 2) {
                [enc endEncoding];
                pass.colorAttachments[0].loadAction = MTLLoadActionLoad;
                pass.depthAttachment.loadAction = MTLLoadActionClear;
                enc = [cmd renderCommandEncoderWithDescriptor:pass];
            }
            [enc setRenderPipelineState:mode == 0 ? solid : shadow];
            [enc setDepthStencilState:mode == 2 ? shadowDepth : depth];
            u.effects.y = mode;
            u.effects.z = 0;
            auto drawStrip = [&](int kind, int near, int fade, int far) {
                auto &strip = scenery[kind];
                int first = std::max(0, int(floor((cz + near) / 24)) + 1);
                int stop = std::min(int(strip.starts.size() - 1), int(ceil((cz + far) / 24)) + 1);
                u.visibility = {float(fade), float(far), 0, 0};
                uniforms();
                [enc setVertexBuffer:strip.buffer offset:0 atIndex:0];
                [enc drawPrimitives:MTLPrimitiveTypeTriangle
                        vertexStart:strip.starts[first]
                        vertexCount:strip.starts[stop] - strip.starts[first]];
            };
            if (mode == 0)
                drawStrip(2, 96, 236, 336);
            if (mode == 2)
                drawStrip(1, -12, 80, 198);
            else
                drawStrip(mode == 0 ? 0 : 1, -12, 112, 174);
            u.effects.z = 1;
            uniforms();
            [enc setVertexBuffer:moving offset:0 atIndex:0];
            [enc drawPrimitives:MTLPrimitiveTypeTriangle vertexStart:0 vertexCount:n];
        }
        [enc endEncoding];
        [cmd presentDrawable:drawable];
        [cmd commit];
        return cmd;
    }
};
