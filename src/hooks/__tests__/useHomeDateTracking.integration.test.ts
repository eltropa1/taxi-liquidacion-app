type HookRuntime = {
  stateValues: unknown[];
  refValues: { current: unknown }[];
  focusEffect: (() => void) | null;
  appStateListener: ((nextState: string) => void) | null;
  effectCleanups: (() => void)[];
};

type HomeDateTrackingHook = {
  mode: "live" | "historical";
  setHistoricalDate: (date: Date) => void;
};

function createHookRuntime(): HookRuntime {
  return {
    stateValues: [],
    refValues: [],
    focusEffect: null,
    appStateListener: null,
    effectCleanups: [],
  };
}

function installHookMocks(runtime: HookRuntime) {
  jest.doMock("react", () => ({
    useState: (initialValue: unknown) => {
      const index = runtime.stateValues.length;
      if (typeof runtime.stateValues[index] === "undefined") {
        runtime.stateValues[index] =
          typeof initialValue === "function"
            ? (initialValue as () => unknown)()
            : initialValue;
      }

      const setState = (nextValue: unknown) => {
        const currentValue = runtime.stateValues[index];
        runtime.stateValues[index] =
          typeof nextValue === "function"
            ? (nextValue as (current: unknown) => unknown)(currentValue)
            : nextValue;
      };

      return [runtime.stateValues[index], setState];
    },
    useRef: (initialValue: unknown) => {
      const index = runtime.refValues.length;
      if (typeof runtime.refValues[index] === "undefined") {
        runtime.refValues[index] = { current: initialValue };
      }

      return runtime.refValues[index];
    },
    useEffect: (effect: () => void | (() => void)) => {
      const cleanup = effect();
      if (typeof cleanup === "function") {
        runtime.effectCleanups.push(cleanup);
      }
    },
    useCallback: <T extends (...args: unknown[]) => unknown>(callback: T) => callback,
  }));

  jest.doMock("expo-router", () => ({
    useFocusEffect: (effect: () => void | (() => void)) => {
      runtime.focusEffect = effect;
    },
  }));

  jest.doMock("react-native", () => ({
    AppState: {
      addEventListener: jest.fn((_eventName, listener) => {
        runtime.appStateListener = listener;
        return {
          remove: jest.fn(),
        };
      }),
    },
  }));
}

async function loadHook(runtime: HookRuntime): Promise<HomeDateTrackingHook> {
  let hookResult: HomeDateTrackingHook | null = null;

  await jest.isolateModulesAsync(async () => {
    installHookMocks(runtime);
    const { useHomeDateTracking } = await import("../useHomeDateTracking");
    hookResult = useHomeDateTracking();
  });

  if (!hookResult) {
    throw new Error("useHomeDateTracking did not return a hook result");
  }

  return hookResult;
}

describe("useHomeDateTracking integration", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 19, 23, 59, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("reanchors live Home when the day changes through AppState or focus", async () => {
    const runtime = createHookRuntime();
    const hook = await loadHook(runtime);

    expect(hook.mode).toBe("live");
    expect(runtime.stateValues[0]).toMatchObject({
      mode: "live",
      selectedDate: new Date(2026, 6, 19, 23, 59, 0, 0),
    });

    jest.setSystemTime(new Date(2026, 6, 20, 2, 16, 0, 0));
    runtime.appStateListener?.("active");
    runtime.focusEffect?.();

    expect(runtime.stateValues[0]).toMatchObject({
      mode: "live",
      selectedDate: new Date(2026, 6, 20, 2, 16, 0, 0),
    });
  });

  it("keeps historical Home pinned when focus or AppState returns after midnight", async () => {
    const runtime = createHookRuntime();
    const hook = await loadHook(runtime);

    hook.setHistoricalDate(new Date(2026, 6, 19, 12, 0, 0, 0));

    expect(runtime.stateValues[0]).toMatchObject({
      mode: "historical",
      selectedDate: new Date(2026, 6, 19, 12, 0, 0, 0),
    });

    jest.setSystemTime(new Date(2026, 6, 20, 2, 16, 0, 0));
    runtime.appStateListener?.("active");
    runtime.focusEffect?.();

    expect(runtime.stateValues[0]).toMatchObject({
      mode: "historical",
      selectedDate: new Date(2026, 6, 19, 12, 0, 0, 0),
    });
  });
});
