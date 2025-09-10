import { BaseModule } from "@/modules/BaseModule";

export class PluginsModule extends BaseModule {
  public readonly moduleName: string = "plugins";

  /**
   * Initializes plugin collection by iterating through navigator.plugins.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const pluginsData = this.collectPlugins();
      this.eventManager.dispatch(this.moduleName, "plugins", {
        plugins: pluginsData,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "plugins.error", {
        error: "Plugin collection failed",
        errorCode: "PLUGIN_COLLECTION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Collects detailed information about all installed plugins.
   * @returns An array of plugin data objects.
   */
  private collectPlugins(): any[] {
    const plugins: any[] = [];
    if (navigator.plugins && navigator.plugins.length > 0) {
      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        const mimeTypes: any[] = [];

        // Collect MIME type data for each plugin
        for (let j = 0; j < plugin.length; j++) {
          const mimeType = plugin[j];
          mimeTypes.push({
            type: mimeType.type,
            description: mimeType.description,
            suffixes: mimeType.suffixes,
          });
        }

        plugins.push({
          name: plugin.name,
          description: plugin.description,
          filename: plugin.filename,
          mime: mimeTypes,
        });
      }
    }
    return plugins;
  }
}
