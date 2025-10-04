// src/managers/ModuleManager.ts
import { BaseModule } from "@/modules/BaseModule";

export class ModuleManager {
  private static instance: ModuleManager;
  private moduleInstances: BaseModule[] = [];

  private constructor() {}

  public static getInstance(): ModuleManager {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
    }
    return ModuleManager.instance;
  }

  public registerAndInit(moduleClasses: (new () => BaseModule)[]): void {
    console.log(`[SDK] Registering ${moduleClasses.length} modules...`);
    this.moduleInstances = moduleClasses.map(
      (ModuleClass) => new ModuleClass()
    );
    this.moduleInstances.forEach((module) => {
      try {
        module.init();
      } catch (error) {
        console.error(`[SDK] Module initialization failed:`, error);
      }
    });
  }

  public destroyAll(): void {
    console.log(`[SDK] Destroying ${this.moduleInstances.length} modules...`);
    this.moduleInstances.forEach((module) => {
      try {
        module.destroy();
      } catch (error) {
        console.error(`[SDK] Module destruction failed:`, error);
      }
    });
    this.moduleInstances = [];
  }
}
