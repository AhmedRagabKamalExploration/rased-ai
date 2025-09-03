import { BaseModule } from "@/modules/BaseModule";

export class TimezoneAndLanguageModule extends BaseModule {
  public readonly moduleName: string = "timezone-language";

  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      const languages = [...navigator.languages];

      this.eventManager.dispatch(this.moduleName, "localization", {
        timezone,
        language,
        languages,
      });
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Failed to collect data.`, error);
    }
  }
}
