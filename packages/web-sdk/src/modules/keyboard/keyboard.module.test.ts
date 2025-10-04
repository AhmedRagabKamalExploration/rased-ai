import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { KeyboardModule } from "./keyboard.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(),
  },
}));

describe("KeyboardModule", () => {
  let keyboardModule: KeyboardModule;
  let mockEventManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock event manager
    mockEventManager = {
      dispatch: vi.fn(),
    };

    // Mock EventManager.getInstance to return our mock
    vi.mocked(EventManager.getInstance).mockReturnValue(mockEventManager);

    // Mock document
    global.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
    };

    // Mock Date.now
    vi.spyOn(Date, "now").mockReturnValue(1000);

    keyboardModule = new KeyboardModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(keyboardModule.moduleName).toBe("keyboard");
    });
  });

  describe("init", () => {
    it("should initialize and add event listeners", () => {
      keyboardModule.init();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] keyboard: Initializing..."
      );

      expect(global.document.addEventListener).toHaveBeenCalledTimes(3);
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
        { capture: true }
      );
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function),
        { capture: true }
      );
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "focusout",
        expect.any(Function),
        { capture: true }
      );
    });
  });

  describe("handleKeyDown", () => {
    it("should track key press start time", () => {
      keyboardModule.init();

      // Access private method through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );

      const keyEvent = {
        code: "KeyA",
        target: { tagName: "INPUT", type: "text" },
      } as any;

      handleKeyDown(keyEvent);

      // Access private property through any type
      const privateProps = keyboardModule as any;
      expect(privateProps.keyPressMap.has("KeyA")).toBe(true);
      expect(privateProps.keyPressMap.get("KeyA")).toEqual({
        downTime: 1000,
        upTime: 0,
      });
    });

    it("should not overwrite existing key press data", () => {
      keyboardModule.init();

      // Access private method through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );

      const keyEvent = {
        code: "KeyA",
        target: { tagName: "INPUT", type: "text" },
      } as any;

      // First keydown
      handleKeyDown(keyEvent);

      // Second keydown (should not overwrite)
      vi.spyOn(Date, "now").mockReturnValue(2000);
      handleKeyDown(keyEvent);

      // Access private property through any type
      const privateProps = keyboardModule as any;
      expect(privateProps.keyPressMap.get("KeyA").downTime).toBe(1000); // Original time
    });
  });

  describe("handleKeyUp", () => {
    let mockInputElement: HTMLInputElement;

    beforeEach(() => {
      mockInputElement = {
        tagName: "INPUT",
        type: "text",
        id: "test-input",
        name: "test-field",
      } as any;
    });

    it("should track key press data for trackable elements", () => {
      keyboardModule.init();

      // Access private methods through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );
      const handleKeyUp = (keyboardModule as any).handleKeyUp.bind(
        keyboardModule
      );

      const keyDownEvent = {
        code: "KeyA",
        target: mockInputElement,
      } as any;

      const keyUpEvent = {
        code: "KeyA",
        target: mockInputElement,
      } as any;

      // Simulate keydown then keyup
      vi.spyOn(Date, "now").mockReturnValue(1000);
      handleKeyDown(keyDownEvent);

      vi.spyOn(Date, "now").mockReturnValue(1100);
      handleKeyUp(keyUpEvent);

      // Access private property through any type
      const privateProps = keyboardModule as any;
      expect(privateProps.analysisData.has(mockInputElement)).toBe(true);
      expect(privateProps.analysisData.get(mockInputElement)).toHaveLength(1);
      expect(privateProps.analysisData.get(mockInputElement)[0]).toEqual({
        key: "KeyA",
        dwellTime: 100, // 1100 - 1000
        flightTime: 0, // First key, no previous keyup
      });
    });

    it("should calculate flight time between keys", () => {
      keyboardModule.init();

      // Access private methods through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );
      const handleKeyUp = (keyboardModule as any).handleKeyUp.bind(
        keyboardModule
      );

      const keyDownEvent1 = { code: "KeyA", target: mockInputElement } as any;
      const keyUpEvent1 = { code: "KeyA", target: mockInputElement } as any;
      const keyDownEvent2 = { code: "KeyB", target: mockInputElement } as any;
      const keyUpEvent2 = { code: "KeyB", target: mockInputElement } as any;

      // First key sequence
      vi.spyOn(Date, "now").mockReturnValue(1000);
      handleKeyDown(keyDownEvent1);
      vi.spyOn(Date, "now").mockReturnValue(1100);
      handleKeyUp(keyUpEvent1);

      // Second key sequence
      vi.spyOn(Date, "now").mockReturnValue(1200); // 100ms flight time
      handleKeyDown(keyDownEvent2);
      vi.spyOn(Date, "now").mockReturnValue(1300);
      handleKeyUp(keyUpEvent2);

      // Access private property through any type
      const privateProps = keyboardModule as any;
      const data = privateProps.analysisData.get(mockInputElement);
      expect(data[1].flightTime).toBe(100); // 1200 - 1100
    });

    it("should not track non-trackable elements", () => {
      keyboardModule.init();

      // Access private methods through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );
      const handleKeyUp = (keyboardModule as any).handleKeyUp.bind(
        keyboardModule
      );

      const nonTrackableElement = { tagName: "DIV" } as any;

      const keyDownEvent = { code: "KeyA", target: nonTrackableElement } as any;
      const keyUpEvent = { code: "KeyA", target: nonTrackableElement } as any;

      handleKeyDown(keyDownEvent);
      handleKeyUp(keyUpEvent);

      // Access private property through any type
      const privateProps = keyboardModule as any;
      expect(privateProps.analysisData.has(nonTrackableElement)).toBe(false);
    });

    it("should remove key from press map after keyup", () => {
      keyboardModule.init();

      // Access private methods through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );
      const handleKeyUp = (keyboardModule as any).handleKeyUp.bind(
        keyboardModule
      );

      const keyDownEvent = { code: "KeyA", target: mockInputElement } as any;
      const keyUpEvent = { code: "KeyA", target: mockInputElement } as any;

      handleKeyDown(keyDownEvent);

      // Access private property through any type
      let privateProps = keyboardModule as any;
      expect(privateProps.keyPressMap.has("KeyA")).toBe(true);

      handleKeyUp(keyUpEvent);

      privateProps = keyboardModule as any;
      expect(privateProps.keyPressMap.has("KeyA")).toBe(false);
    });
  });

  describe("handleFocusOut", () => {
    let mockInputElement: HTMLInputElement;

    beforeEach(() => {
      mockInputElement = {
        tagName: "INPUT",
        type: "text",
        id: "test-input",
        name: "test-field",
      } as any;
    });

    it("should dispatch keyboard analysis when focusout with sufficient data", () => {
      keyboardModule.init();

      // Access private methods through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );
      const handleKeyUp = (keyboardModule as any).handleKeyUp.bind(
        keyboardModule
      );
      const handleFocusOut = (keyboardModule as any).handleFocusOut.bind(
        keyboardModule
      );

      // Simulate typing session
      const keys = ["KeyA", "KeyB", "KeyC"];

      keys.forEach((key, index) => {
        const keyDownEvent = { code: key, target: mockInputElement } as any;
        const keyUpEvent = { code: key, target: mockInputElement } as any;

        vi.spyOn(Date, "now").mockReturnValue(1000 + index * 100);
        handleKeyDown(keyDownEvent);
        vi.spyOn(Date, "now").mockReturnValue(1050 + index * 100);
        handleKeyUp(keyUpEvent);
      });

      // Focus out
      const focusOutEvent = { target: mockInputElement } as any;
      handleFocusOut(focusOutEvent);

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "keyboard",
        "keyboard",
        expect.objectContaining({
          target: {
            tag: "INPUT",
            id: "test-input",
            name: "test-field",
          },
          metrics: {
            totalKeyPresses: 3,
            typingDuration: expect.any(Number),
            avgDwellTime: expect.any(Number),
            avgFlightTime: expect.any(Number),
            typingSpeed: expect.any(Number),
          },
          specialKeys: {
            backspaceCount: 0,
            deleteCount: 0,
            tabCount: 0,
            arrowKeyCount: 0,
          },
        })
      );
    });

    it("should not dispatch for insufficient data", () => {
      keyboardModule.init();

      // Access private methods through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );
      const handleKeyUp = (keyboardModule as any).handleKeyUp.bind(
        keyboardModule
      );
      const handleFocusOut = (keyboardModule as any).handleFocusOut.bind(
        keyboardModule
      );

      // Simulate only 2 key presses (insufficient)
      const keyDownEvent = { code: "KeyA", target: mockInputElement } as any;
      const keyUpEvent = { code: "KeyA", target: mockInputElement } as any;

      handleKeyDown(keyDownEvent);
      handleKeyUp(keyUpEvent);

      const keyDownEvent2 = { code: "KeyB", target: mockInputElement } as any;
      const keyUpEvent2 = { code: "KeyB", target: mockInputElement } as any;

      handleKeyDown(keyDownEvent2);
      handleKeyUp(keyUpEvent2);

      // Focus out
      const focusOutEvent = { target: mockInputElement } as any;
      handleFocusOut(focusOutEvent);

      expect(mockEventManager.dispatch).not.toHaveBeenCalled();
    });

    it("should not dispatch for non-trackable elements", () => {
      keyboardModule.init();

      // Access private method through any type
      const handleFocusOut = (keyboardModule as any).handleFocusOut.bind(
        keyboardModule
      );

      const nonTrackableElement = { tagName: "DIV" } as any;
      const focusOutEvent = { target: nonTrackableElement } as any;

      handleFocusOut(focusOutEvent);

      expect(mockEventManager.dispatch).not.toHaveBeenCalled();
    });

    it("should clear analysis data after dispatch", () => {
      keyboardModule.init();

      // Access private methods through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );
      const handleKeyUp = (keyboardModule as any).handleKeyUp.bind(
        keyboardModule
      );
      const handleFocusOut = (keyboardModule as any).handleFocusOut.bind(
        keyboardModule
      );

      // Simulate typing session
      const keys = ["KeyA", "KeyB", "KeyC", "KeyD"];

      keys.forEach((key, index) => {
        const keyDownEvent = { code: key, target: mockInputElement } as any;
        const keyUpEvent = { code: key, target: mockInputElement } as any;

        vi.spyOn(Date, "now").mockReturnValue(1000 + index * 100);
        handleKeyDown(keyDownEvent);
        vi.spyOn(Date, "now").mockReturnValue(1050 + index * 100);
        handleKeyUp(keyUpEvent);
      });

      // Focus out
      const focusOutEvent = { target: mockInputElement } as any;
      handleFocusOut(focusOutEvent);

      // Access private property through any type
      const privateProps = keyboardModule as any;
      expect(privateProps.analysisData.has(mockInputElement)).toBe(false);
    });
  });

  describe("isTrackable", () => {
    it("should identify trackable input types", () => {
      // Access private method through any type
      const isTrackable = (keyboardModule as any).isTrackable.bind(
        keyboardModule
      );

      const trackableTypes = [
        "text",
        "password",
        "email",
        "tel",
        "search",
        "url",
        "number",
      ];

      trackableTypes.forEach((type) => {
        const element = { tagName: "INPUT", type } as any;
        expect(isTrackable(element)).toBe(true);
      });
    });

    it("should identify trackable textarea elements", () => {
      // Access private method through any type
      const isTrackable = (keyboardModule as any).isTrackable.bind(
        keyboardModule
      );

      const textareaElement = { tagName: "TEXTAREA" } as any;
      expect(isTrackable(textareaElement)).toBe(true);
    });

    it("should reject non-trackable input types", () => {
      // Access private method through any type
      const isTrackable = (keyboardModule as any).isTrackable.bind(
        keyboardModule
      );

      const nonTrackableTypes = [
        "checkbox",
        "radio",
        "submit",
        "button",
        "file",
      ];

      nonTrackableTypes.forEach((type) => {
        const element = { tagName: "INPUT", type } as any;
        expect(isTrackable(element)).toBe(false);
      });
    });

    it("should reject non-input elements", () => {
      // Access private method through any type
      const isTrackable = (keyboardModule as any).isTrackable.bind(
        keyboardModule
      );

      const nonInputElements = [
        { tagName: "DIV" },
        { tagName: "SPAN" },
        { tagName: "BUTTON" },
        { tagName: "SELECT" },
      ];

      nonInputElements.forEach((element) => {
        expect(isTrackable(element)).toBe(false);
      });
    });
  });

  describe("integration", () => {
    it("should handle complete typing session", () => {
      keyboardModule.init();

      // Access private methods through any type
      const handleKeyDown = (keyboardModule as any).handleKeyDown.bind(
        keyboardModule
      );
      const handleKeyUp = (keyboardModule as any).handleKeyUp.bind(
        keyboardModule
      );
      const handleFocusOut = (keyboardModule as any).handleFocusOut.bind(
        keyboardModule
      );

      const mockInputElement = {
        tagName: "INPUT",
        type: "text",
        id: "test-input",
        name: "test-field",
      } as any;

      // Simulate typing "hello" with some special keys
      const keys = [
        { code: "KeyH", time: 1000 },
        { code: "KeyE", time: 1100 },
        { code: "KeyL", time: 1200 },
        { code: "KeyL", time: 1300 },
        { code: "KeyO", time: 1400 },
        { code: "Backspace", time: 1500 },
        { code: "KeyO", time: 1600 },
      ];

      keys.forEach((key, index) => {
        const keyDownEvent = {
          code: key.code,
          target: mockInputElement,
        } as any;
        const keyUpEvent = { code: key.code, target: mockInputElement } as any;

        vi.spyOn(Date, "now").mockReturnValue(key.time);
        handleKeyDown(keyDownEvent);
        vi.spyOn(Date, "now").mockReturnValue(key.time + 50);
        handleKeyUp(keyUpEvent);
      });

      // Focus out
      const focusOutEvent = { target: mockInputElement } as any;
      handleFocusOut(focusOutEvent);

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "keyboard",
        "keyboard",
        expect.objectContaining({
          target: {
            tag: "INPUT",
            id: "test-input",
            name: "test-field",
          },
          metrics: {
            totalKeyPresses: 7,
            typingDuration: expect.any(Number),
            avgDwellTime: expect.any(Number),
            avgFlightTime: expect.any(Number),
            typingSpeed: expect.any(Number),
          },
          specialKeys: {
            backspaceCount: 1,
            deleteCount: 0,
            tabCount: 0,
            arrowKeyCount: 0,
          },
        })
      );
    });
  });
});
