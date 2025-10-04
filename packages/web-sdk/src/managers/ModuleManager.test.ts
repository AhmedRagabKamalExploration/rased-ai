import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ModuleManager } from "./ModuleManager";
import { BaseModule } from "@/modules/BaseModule";

// Mock BaseModule
class MockModule extends BaseModule {
  public readonly moduleName: string = "mock-module";
  public initCalled = false;
  public destroyCalled = false;

  public init(): void {
    this.initCalled = true;
  }

  public destroy(): void {
    this.destroyCalled = true;
  }
}

class AnotherMockModule extends BaseModule {
  public readonly moduleName: string = "another-mock-module";
  public initCalled = false;
  public destroyCalled = false;

  public init(): void {
    this.initCalled = true;
  }

  public destroy(): void {
    this.destroyCalled = true;
  }
}

describe("ModuleManager", () => {
  let moduleManager: ModuleManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
    };

    moduleManager = ModuleManager.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = ModuleManager.getInstance();
      const instance2 = ModuleManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("registerAndInit", () => {
    it("should register and initialize single module", () => {
      const moduleClasses = [MockModule];

      moduleManager.registerAndInit(moduleClasses);

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Registering 1 modules..."
      );

      // Access private property through any type
      const privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(1);
      expect(privateProps.moduleInstances[0]).toBeInstanceOf(MockModule);
      expect(privateProps.moduleInstances[0].initCalled).toBe(true);
    });

    it("should register and initialize multiple modules", () => {
      const moduleClasses = [MockModule, AnotherMockModule];

      moduleManager.registerAndInit(moduleClasses);

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Registering 2 modules..."
      );

      // Access private property through any type
      const privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(2);
      expect(privateProps.moduleInstances[0]).toBeInstanceOf(MockModule);
      expect(privateProps.moduleInstances[1]).toBeInstanceOf(AnotherMockModule);
      expect(privateProps.moduleInstances[0].initCalled).toBe(true);
      expect(privateProps.moduleInstances[1].initCalled).toBe(true);
    });

    it("should handle empty module array", () => {
      const moduleClasses: (new () => BaseModule)[] = [];

      moduleManager.registerAndInit(moduleClasses);

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Registering 0 modules..."
      );

      // Access private property through any type
      const privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(0);
    });

    it("should replace existing modules when registering new ones", () => {
      // First registration
      moduleManager.registerAndInit([MockModule]);

      // Access private property through any type
      let privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(1);

      // Second registration
      moduleManager.registerAndInit([AnotherMockModule]);

      privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(1);
      expect(privateProps.moduleInstances[0]).toBeInstanceOf(AnotherMockModule);
    });

    it("should initialize modules in order", () => {
      const initOrder: string[] = [];

      class OrderedMockModule extends BaseModule {
        public readonly moduleName: string = "ordered-module";

        public init(): void {
          initOrder.push(this.moduleName);
        }

        public destroy(): void {}
      }

      class AnotherOrderedMockModule extends BaseModule {
        public readonly moduleName: string = "another-ordered-module";

        public init(): void {
          initOrder.push(this.moduleName);
        }

        public destroy(): void {}
      }

      const moduleClasses = [OrderedMockModule, AnotherOrderedMockModule];
      moduleManager.registerAndInit(moduleClasses);

      expect(initOrder).toEqual(["ordered-module", "another-ordered-module"]);
    });
  });

  describe("destroyAll", () => {
    it("should destroy all registered modules", () => {
      const moduleClasses = [MockModule, AnotherMockModule];
      moduleManager.registerAndInit(moduleClasses);

      // Access private property through any type
      let privateProps = moduleManager as any;
      const module1 = privateProps.moduleInstances[0] as MockModule;
      const module2 = privateProps.moduleInstances[1] as AnotherMockModule;

      expect(module1.destroyCalled).toBe(false);
      expect(module2.destroyCalled).toBe(false);

      moduleManager.destroyAll();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Destroying 2 modules..."
      );

      expect(module1.destroyCalled).toBe(true);
      expect(module2.destroyCalled).toBe(true);

      // Modules should be cleared
      privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(0);
    });

    it("should handle destroy when no modules are registered", () => {
      moduleManager.destroyAll();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Destroying 0 modules..."
      );
    });

    it("should clear module instances after destroy", () => {
      moduleManager.registerAndInit([MockModule]);

      // Access private property through any type
      let privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(1);

      moduleManager.destroyAll();

      privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(0);
    });
  });

  describe("integration", () => {
    it("should handle complete module lifecycle", () => {
      const moduleClasses = [MockModule, AnotherMockModule];

      // Register and initialize
      moduleManager.registerAndInit(moduleClasses);

      // Access private property through any type
      let privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(2);

      const module1 = privateProps.moduleInstances[0] as MockModule;
      const module2 = privateProps.moduleInstances[1] as AnotherMockModule;

      expect(module1.initCalled).toBe(true);
      expect(module2.initCalled).toBe(true);
      expect(module1.destroyCalled).toBe(false);
      expect(module2.destroyCalled).toBe(false);

      // Destroy all
      moduleManager.destroyAll();

      expect(module1.destroyCalled).toBe(true);
      expect(module2.destroyCalled).toBe(true);

      privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(0);
    });

    it("should handle multiple register-destroy cycles", () => {
      // First cycle
      moduleManager.registerAndInit([MockModule]);
      moduleManager.destroyAll();

      // Second cycle
      moduleManager.registerAndInit([AnotherMockModule]);

      // Access private property through any type
      let privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(1);
      expect(privateProps.moduleInstances[0]).toBeInstanceOf(AnotherMockModule);

      moduleManager.destroyAll();

      privateProps = moduleManager as any;
      expect(privateProps.moduleInstances).toHaveLength(0);
    });

    it("should handle modules with errors during init", () => {
      class ErrorModule extends BaseModule {
        public readonly moduleName: string = "error-module";

        public init(): void {
          throw new Error("Init error");
        }

        public destroy(): void {}
      }

      // Should not throw even if module init fails
      expect(() => moduleManager.registerAndInit([ErrorModule])).not.toThrow();
    });

    it("should handle modules with errors during destroy", () => {
      class ErrorModule extends BaseModule {
        public readonly moduleName: string = "error-module";

        public init(): void {}

        public destroy(): void {
          throw new Error("Destroy error");
        }
      }

      moduleManager.registerAndInit([ErrorModule]);

      // Should not throw even if module destroy fails
      expect(() => moduleManager.destroyAll()).not.toThrow();
    });
  });
});
