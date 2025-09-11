import { TrueIdModule } from "./trueid/trueId.module";
import { SkipToContentModule } from "./skip-to-content/skip-to-content.module";
import { MouseBehaviourModule } from "./mouse/mouse.module";
import { ScreenModule } from "./screen/screen.module";
import { WebGLModule } from "./webGL/webGL.module";
import { AudioModule } from "./audio/audio.module";
import { FontModule } from "./font/font.module";
import { BrowserModule } from "./browser/browser.module";
import { NetworkModule } from "./network/netwrok.module";
import { DeviceOrientationModule } from "./device-orientation/device-orientation.module";
import { KeyboardModule } from "./keyboard/keyboard.module";
import { TimezoneAndLanguageModule } from "./timezone-language/timezone-language.module";
import { TouchModule } from "./touch/touch.module";
import { WebRTCIPModule } from "./webrtc/webrtc.module";
import { AdblockModule } from "./adblock/adblock.module";
import { PerformanceModule } from "./performance/performance.module";
import { MathModule } from "./math/math.module";
import { BrowserTypeModule } from "./browser-type/browser-type.module";
import { DeviceModule } from "./device/device.module";
import { PluginsModule } from "./plugins/plugins.module";
import { TimezoneModule } from "./timezone/timezone.module";
import { MalwareModule } from "./malware/malware.module";
import { MediaModule } from "./media/media.module";
import { ClientHintsModule } from "./client-hints/client-hints.module";
import { BrowserSpeechModule } from "./browser-speech/browser-speech.module";
import { BindingModule } from "./binding/binding.module";
import { PrivateBrowserModule } from "./private-browser/private-browser.module";
import { ReferrerUrlModule } from "./referrer-url/referrer-url.module";

export const featureModules = [
  TrueIdModule,
  SkipToContentModule,
  MouseBehaviourModule,
  ScreenModule,
  WebGLModule,
  AudioModule,
  FontModule,
  BrowserModule,
  NetworkModule,
  DeviceOrientationModule,
  KeyboardModule,
  TimezoneAndLanguageModule,
  TouchModule,
  WebRTCIPModule,
  AdblockModule,
  PerformanceModule,
  MathModule,
  BrowserTypeModule,
  DeviceModule,
  PluginsModule,
  TimezoneModule,
  MalwareModule,
  MediaModule,
  ClientHintsModule,
  BrowserSpeechModule,
  BindingModule,
  PrivateBrowserModule,
  ReferrerUrlModule,
];
