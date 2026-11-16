#import <Cocoa/Cocoa.h>
#import <QuartzCore/QuartzCore.h>
#include "Graphics.hpp"
#include "Sound.hpp"

static bool polish() {
    return [[NSUserDefaults.standardUserDefaults stringForKey:@"gameLanguage"] isEqualToString:@"pl"];
}
static NSString *localized(NSString *english, NSString *pl) { return polish() ? pl : english; }

@interface RaceView : MTKView <MTKViewDelegate>
- (void)toggleRace;
- (void)pauseRace;
- (void)updateLanguage;
@end
@implementation RaceView {
    neon::Race race;
    Graphics graphics;
    Sound sound;
    bool keys[128], running, started, audioOK;
    CFTimeInterval lastDraw, lastHUD;
    double best;
    NSTextField *hud, *hint;
    NSButton *play;
}
- (instancetype)initWithFrame:(NSRect)frame device:(id<MTLDevice>)device {
    if (!(self = [super initWithFrame:frame device:device]))
        return nil;
    self.colorPixelFormat = MTLPixelFormatBGRA8Unorm;
    self.depthStencilPixelFormat = MTLPixelFormatDepth32Float;
    self.preferredFramesPerSecond = 60;
    self.autoResizeDrawable = NO;
    self.clearDepth = 1;
    self.layer.magnificationFilter = kCAFilterNearest;
    NSError *error = nil;
    if (!device || !graphics.setup(self, &error)) {
        NSAlert *alert = [NSAlert new];
        alert.messageText = localized(@"Metal could not start", @"Nie udało się uruchomić Metal");
        alert.informativeText = error.localizedDescription
                                    ?: localized(@"The game requires a Metal-capable GPU.",
                                                 @"Gra wymaga GPU obsługującego Metal.");
        [alert runModal];
        return nil;
    }
    best = [NSUserDefaults.standardUserDefaults doubleForKey:@"bestLapCircuit6"];
    hud = [self label:16];
    hint = [self label:16];
    hint.alignment = NSTextAlignmentCenter;
    play = [NSButton buttonWithTitle:@"Start   ↵" target:self action:@selector(toggleRace)];
    play.bezelStyle = NSBezelStyleRounded;
    play.controlSize = NSControlSizeLarge;
    [self addSubview:play];
    self.delegate = self;
    self.enableSetNeedsDisplay = YES;
    self.paused = YES;
    [self updateLanguage];
    return self;
}
- (NSTextField *)label:(CGFloat)size {
    auto t = [NSTextField labelWithString:@""];
    t.font = [NSFont monospacedDigitSystemFontOfSize:size weight:NSFontWeightSemibold];
    t.textColor = NSColor.whiteColor;
    t.drawsBackground = YES;
    t.backgroundColor = [NSColor colorWithWhite:.045 alpha:.83];
    t.maximumNumberOfLines = 0;
    [self addSubview:t];
    return t;
}
- (void)layout {
    [super layout];
    NSSize s = self.bounds.size;
    if (s.width < 1 || s.height < 1)
        return;
    double scale = std::min({1., 1024. / s.width, 680. / s.height});
    CGSize pixels = CGSizeMake(round(s.width * scale), round(s.height * scale));
    if (!CGSizeEqualToSize(self.drawableSize, pixels))
        self.drawableSize = pixels;
    hud.frame = NSMakeRect(12, s.height - 54, std::min(485., s.width - 24), 42);
    hint.frame = NSMakeRect((s.width - std::min(550., s.width - 24)) / 2, s.height * .34,
                            std::min(550., s.width - 24), 49);
    play.frame = NSMakeRect((s.width - 160) / 2, NSMaxY(hint.frame) + 10, 160, 38);
}
- (BOOL)acceptsFirstResponder {
    return YES;
}
- (void)updateLanguage {
    self.window.title = localized(@"Neon Canal", @"Neonowy kanał");
    hint.stringValue =
        localized(@"← →  steer     ↑  boost     ↓  airbrake\nSpace  cannon     R  rocket     M  sound  "
                  @"   P  pause",
                  @"← →  skręt     ↑  dopalacz     ↓  hamulec\nSpacja  działko     R  rakieta     "
                  @"M  dźwięk     P  pauza");
    play.title = started ? localized(@"Resume   ↵", @"Wznów   ↵") : @"Start   ↵";
    [self updateHUD];
}
- (void)updateHUD {
    NSString *time = best > 0 ? [NSString stringWithFormat:@"%.2f s", best] : @"—";
    const int route=neon::routeHint(race.x,race.distance);
    NSString *branch=route==1?localized(@"    ← Bridge · Canal →",@"    ← Most · Kanał →"):
        route==2?localized(@"    Bridge · tailwind",@"    Most · wiatr w plecy"):
        route==3?localized(@"    Canal · recharge",@"    Kanał · ładowanie"):@"";
    hud.stringValue = [NSString
        stringWithFormat:localized(@"  %d / 7     LAP %d     SHIELD %d / 3     ROCKETS %d\n  Boost "
                                   @"%.0f%%     Best lap %@%@%@%@",
                                   @"  %d / 7     OKR %d     OSŁONA %d / 3     RAKIETY %d\n  Dopalacz "
                                   @"%.0f%%     Rekord %@%@%@%@"),
                         race.rank, race.laps + 1, race.shield, race.rockets, race.energy, time, branch,
                         race.launchTime>0 ? localized(@"     Slingshot", @"     Wyrzut") :
                         race.wakeCharge>=1 ? localized(@"     Steer + boost", @"     Skręć + dopalacz") :
                         race.drafting ? localized(@"     Slipstream", @"     W smudze") : @"",
                         started && !audioOK
                             ? localized(@"     No audio output", @"     Brak wyjścia audio")
                         : sound.muted ? localized(@"     Muted", @"     Wyciszono")
                                       : @""];
}
- (void)toggleRace {
    if (running) {
        [self pauseRace];
        return;
    }
    started = true;
    running = true;
    hint.hidden = YES;
    play.hidden = YES;
    NSError *error = nil;
    audioOK = sound.play(&error);
    if (!audioOK)
        NSLog(@"Audio: %@", error);
    lastDraw = CACurrentMediaTime();
    self.enableSetNeedsDisplay = NO;
    self.paused = NO;
    [self.window makeFirstResponder:self];
    [self updateHUD];
}
- (void)pauseRace {
    if (!running)
        return;
    running = false;
    std::fill_n(keys, 128, false);
    sound.pause();
    play.title = localized(@"Resume   ↵", @"Wznów   ↵");
    hint.hidden = NO;
    play.hidden = NO;
    self.paused = YES;
    self.enableSetNeedsDisplay = YES;
    [self setNeedsDisplay:YES];
}
- (void)keyDown:(NSEvent *)event {
    auto k = event.keyCode;
    if (k >= 128)
        return;
    if (k == 46) {
        if (!event.isARepeat) {
            sound.toggle();
            [self updateHUD];
        }
        return;
    }
    if (k == 35 || k == 53 || k == 36 || (!started && k == 49)) {
        if (!event.isARepeat)
            [self toggleRace];
        return;
    }
    if (!running)
        return;
    if (k == 15 && !keys[k])
        race.shoot(true);
    keys[k] = true;
}
- (void)keyUp:(NSEvent *)event {
    if (event.keyCode < 128)
        keys[event.keyCode] = false;
}
- (void)mtkView:(MTKView *)view drawableSizeWillChange:(CGSize)size {
}
- (void)drawInMTKView:(MTKView *)view {
    auto now = CACurrentMediaTime();
    if (running) {
        double left = std::clamp(now - lastDraw, 0., .2);
        neon::Input input{int(keys[124] || keys[2]) - int(keys[123] || keys[0]), keys[126] || keys[13],
                          keys[125] || keys[1]};
        while (left > 0) {
            double step = std::min(1. / 90, left);
            if (keys[49])
                race.shoot(false);
            race.advance(step, input);
            left -= step;
        }
        for (auto c : race.cues) {
            sound.cue(c);
            if (c == neon::Cue::Lap && (best <= 0 || race.lastLap < best)) {
                best = race.lastLap;
                [NSUserDefaults.standardUserDefaults setDouble:best forKey:@"bestLapCircuit6"];
            }
        }
        race.cues.clear();
        sound.power(race.speed,race.thrust);
        if (now - lastHUD > .08) {
            [self updateHUD];
            lastHUD = now;
        }
    }
    lastDraw = now;
    graphics.paint(view, race);
}
@end

@interface CanalApp : NSObject <NSApplicationDelegate, NSWindowDelegate>
@property(strong) NSWindow *window;
@end
@implementation CanalApp
- (void)refreshMenu {
    NSMenu *menu = NSApp.mainMenu.itemArray.firstObject.submenu;
    [menu removeAllItems];
    NSMenuItem *language = [menu addItemWithTitle:localized(@"Polski", @"English")
                                           action:@selector(switchLanguage:)
                                    keyEquivalent:@""];
    language.target = self;
    [menu addItem:[NSMenuItem separatorItem]];
    [menu addItemWithTitle:localized(@"Quit Neon Canal", @"Zakończ grę")
                    action:@selector(terminate:)
             keyEquivalent:@"q"];
}
- (void)switchLanguage:(id)sender {
    [NSUserDefaults.standardUserDefaults setObject:polish() ? @"en" : @"pl" forKey:@"gameLanguage"];
    [(RaceView *)self.window.contentView updateLanguage];
    [self refreshMenu];
}
- (void)applicationDidFinishLaunching:(NSNotification *)note {
    auto menu = [NSMenu new];
    auto appMenu = [NSMenu new];
    auto item = [NSMenuItem new];
    item.submenu = appMenu;
    [menu addItem:item];
    NSApp.mainMenu = menu;
    [self refreshMenu];
    NSRect rect = NSMakeRect(0, 0, 1024, 640);
    auto w = [[NSWindow alloc]
        initWithContentRect:rect
                  styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                            NSWindowStyleMaskResizable | NSWindowStyleMaskMiniaturizable
                    backing:NSBackingStoreBuffered
                      defer:NO];
    self.window = w;
    w.title = localized(@"Neon Canal", @"Neonowy kanał");
    w.contentMinSize = NSMakeSize(530, 320);
    w.delegate = self;
    w.releasedWhenClosed = NO;
    auto view = [[RaceView alloc] initWithFrame:rect device:MTLCreateSystemDefaultDevice()];
    if (!view) {
        [NSApp terminate:nil];
        return;
    }
    w.contentView = view;
    [w center];
    [w makeKeyAndOrderFront:nil];
    [w makeFirstResponder:view];
    [NSApp activateIgnoringOtherApps:YES];
}
- (void)windowDidResignKey:(NSNotification *)note {
    [(RaceView *)self.window.contentView pauseRace];
}
- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}
@end

int main() {
    @autoreleasepool {
        [NSApplication sharedApplication];
        [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
        CanalApp *__attribute__((objc_precise_lifetime)) delegate = [CanalApp new];
        NSApp.delegate = delegate;
        [NSApp run];
    }
    return 0;
}
