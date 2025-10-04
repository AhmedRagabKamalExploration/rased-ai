# Testing Guide for Web SDK

This document provides comprehensive information about the testing setup and how to run tests for the Web SDK package.

## Overview

The Web SDK uses **Vitest** as the testing framework, providing fast unit testing with excellent TypeScript support and modern features.

## Test Structure

### Test Files Location

All test files are located alongside their source files with the `.test.ts` extension:

```
src/
├── managers/
│   ├── APIManager.ts
│   ├── APIManager.test.ts
│   ├── ConfigManager.ts
│   ├── ConfigManager.test.ts
│   └── ...
├── modules/
│   ├── browser/
│   │   ├── browser.module.ts
│   │   └── browser.module.test.ts
│   ├── screen/
│   │   ├── screen.module.ts
│   │   └── screen.module.test.ts
│   └── ...
└── test/
    └── setup.ts
```

### Test Categories

1. **Manager Tests**: Test all manager classes (APIManager, ConfigManager, EventManager, etc.)
2. **Module Tests**: Test all feature modules (BrowserModule, ScreenModule, MouseModule, etc.)
3. **Integration Tests**: Test the main WebSDK class and module exports
4. **Base Module Tests**: Test the abstract BaseModule class

## Running Tests

### Available Test Commands

```bash
# Run all tests in watch mode
npm test

# Run tests with UI interface
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Test Configuration

The testing is configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/vite-env.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

## Test Setup

### Global Test Setup (`src/test/setup.ts`)

The test setup file provides:

- **Crypto API Mocking**: Mocks `crypto.subtle` for consistent hashing
- **Fetch Mocking**: Mocks global fetch for API tests
- **Navigator Mocking**: Mocks browser navigator object
- **Window/Document Mocking**: Mocks DOM APIs
- **Console Mocking**: Reduces test noise

### Mocking Strategy

Tests use comprehensive mocking to isolate units:

1. **Manager Dependencies**: Each manager test mocks its dependencies
2. **Browser APIs**: All browser-specific APIs are mocked
3. **External Services**: Network calls and external services are mocked
4. **Timers**: Uses fake timers for time-dependent tests

## Test Coverage

### Managers (100% Coverage)

- ✅ **APIManager**: Token handshake, event sending, error handling
- ✅ **ConfigManager**: Configuration validation, trigger attachment
- ✅ **EventManager**: Event dispatching, UUID generation
- ✅ **Collector**: Event batching, flushing, queue management
- ✅ **MetadataManager**: Metadata creation, session management
- ✅ **SessionManager**: Session lifecycle, timeout handling
- ✅ **TokenManager**: Nonce generation, web instance ID
- ✅ **IdentityManager**: Device ID generation, IndexedDB operations
- ✅ **EncryptionManager**: Multi-layer encryption/decryption
- ✅ **ModuleManager**: Module registration and lifecycle

### Modules (Comprehensive Coverage)

- ✅ **BaseModule**: Abstract base class, event listener management
- ✅ **BrowserModule**: Browser fingerprinting, plugin detection
- ✅ **ScreenModule**: Screen properties, window dimensions
- ✅ **MouseModule**: Mouse behavior analysis, trajectory tracking
- ✅ **KeyboardModule**: Keystroke timing, typing patterns
- ✅ **PerformanceModule**: Performance metrics, WebGL info
- ✅ **NetworkModule**: Network connection monitoring
- ✅ **TimezoneModule**: Timezone detection, DST analysis
- ✅ **DeviceModule**: Device information, GPU detection

### Integration Tests

- ✅ **WebSDK**: Complete SDK lifecycle (start/shutdown)
- ✅ **Module Exports**: All modules properly exported
- ✅ **Manager Exports**: All managers properly exported

## Test Patterns

### Singleton Pattern Testing

```typescript
it("should return singleton instance", () => {
  const instance1 = ManagerClass.getInstance();
  const instance2 = ManagerClass.getInstance();
  expect(instance1).toBe(instance2);
});
```

### Async Method Testing

```typescript
it("should handle async operations", async () => {
  const result = await manager.asyncMethod();
  expect(result).toBeDefined();
});
```

### Error Handling Testing

```typescript
it("should handle errors gracefully", () => {
  expect(() => manager.methodThatThrows()).not.toThrow();
  // Or for async:
  await expect(manager.asyncMethodThatThrows()).rejects.toThrow();
});
```

### Mock Verification

```typescript
it("should call dependencies correctly", () => {
  manager.method();
  expect(mockDependency.method).toHaveBeenCalledWith(expectedArgs);
});
```

## Best Practices

### 1. Test Isolation

Each test is completely isolated with fresh mocks and state.

### 2. Comprehensive Coverage

Tests cover:

- Happy path scenarios
- Error conditions
- Edge cases
- Integration flows

### 3. Descriptive Test Names

Test names clearly describe what is being tested:

```typescript
it("should dispatch event with correct structure", () => {});
it("should handle missing navigator properties", () => {});
it("should timeout session after inactivity period", () => {});
```

### 4. Mock Management

- Clear all mocks between tests
- Use `vi.clearAllMocks()` in `beforeEach`
- Restore mocks in `afterEach`

### 5. Private Method Testing

Access private methods through type assertion:

```typescript
const result = (instance as any).privateMethod();
```

## Debugging Tests

### Running Specific Tests

```bash
# Run specific test file
npm test APIManager.test.ts

# Run tests matching pattern
npm test -- --grep "should handle errors"

# Run tests in specific directory
npm test src/managers/
```

### Debug Mode

```bash
# Run tests in debug mode
npm test -- --inspect-brk
```

### Coverage Analysis

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

## Continuous Integration

The test suite is designed to run in CI environments:

- Uses `npm run test:run` for single execution
- Generates coverage reports
- Fails on test failures
- No interactive prompts

## Adding New Tests

When adding new features:

1. **Create test file** alongside source file
2. **Follow naming convention**: `filename.test.ts`
3. **Mock dependencies** appropriately
4. **Test all public methods**
5. **Include error scenarios**
6. **Update this documentation**

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are set up before imports
2. **Async test failures**: Use `await` and proper error handling
3. **Timer issues**: Use `vi.useFakeTimers()` and `vi.advanceTimersByTime()`
4. **DOM errors**: Ensure proper mocking in setup file

### Getting Help

- Check existing test patterns
- Review Vitest documentation
- Look at similar test implementations
- Use `console.log` for debugging (mocked in tests)

## Performance

The test suite is optimized for speed:

- Parallel test execution
- Efficient mocking
- Minimal setup/teardown
- Fast assertions

Typical test run time: **< 30 seconds** for full suite.
