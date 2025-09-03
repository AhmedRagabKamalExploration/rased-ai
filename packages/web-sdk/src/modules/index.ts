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
];
