type HookRuntime = {
  stateValues: unknown[];
  refValues: { current: unknown }[];
  focusEffect: (() => void) | null;
  effectCleanups: (() => void)[];
};

function createHookRuntime(): HookRuntime {
  return {
    stateValues: [],
    refValues: [],
    focusEffect: null,
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
}

describe("useHistoryScreen", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads the selected historical week and refreshes on subsequent focus", async () => {
    const runtime = createHookRuntime();
    const selection = {
      periodType: "week" as const,
      anchorDate: new Date(2026, 6, 21, 12, 0, 0, 0),
    };
    const dataset = {
      period: {
        periodType: "week",
        startDate: new Date(2026, 6, 20, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 26, 23, 59, 59, 999),
        label: "Semana actual · 20 jul - 26 jul",
        isCurrent: true,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: false,
        previousSelection: {
          periodType: "week",
          anchorDate: new Date(2026, 6, 13, 0, 0, 0, 0),
        },
        nextSelection: null,
      },
      summary: {
        servicesTotal: 1,
        servicesTaxi: 1,
        servicesUber: 0,
        servicesCabify: 0,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 12,
        taxi: 12,
        uber: 0,
        cabify: 0,
        freeNow: 0,
        efectivo: 12,
        tarjeta: 0,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      breakdown: [],
      workdays: [],
      records: [],
      goalContext: {
        status: "unknown",
        reason: "no_evidence",
      },
    } as any;

    const loadHistoryScreenData = jest.fn().mockResolvedValue(dataset);

    await jest.isolateModulesAsync(async () => {
      installHookMocks(runtime);
      jest.doMock("../historyScreenLoaders", () => ({
        loadHistoryScreenData,
      }));

      const { useHistoryScreen } = await import("../useHistoryScreen");
      useHistoryScreen(selection);
    });

    await Promise.resolve();

    expect(loadHistoryScreenData).toHaveBeenCalledWith(selection);
    expect(runtime.stateValues[0]).toEqual(dataset);

    runtime.focusEffect?.();
    await Promise.resolve();
    expect(loadHistoryScreenData).toHaveBeenCalledTimes(1);

    runtime.focusEffect?.();
    await Promise.resolve();
    expect(loadHistoryScreenData).toHaveBeenCalledTimes(2);
  });

  it("loads the selected historical month when the scale changes", async () => {
    const runtime = createHookRuntime();
    const selection = {
      periodType: "month" as const,
      anchorDate: new Date(2026, 6, 21, 12, 0, 0, 0),
    };
    const dataset = {
      period: {
        periodType: "month",
        startDate: new Date(2026, 6, 1, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 31, 23, 59, 59, 999),
        label: "Mes actual · julio 2026",
        isCurrent: true,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: false,
        previousSelection: {
          periodType: "month",
          anchorDate: new Date(2026, 5, 1, 12, 0, 0, 0),
        },
        nextSelection: null,
      },
      summary: {
        servicesTotal: 0,
        servicesTaxi: 0,
        servicesUber: 0,
        servicesCabify: 0,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 0,
        taxi: 0,
        uber: 0,
        cabify: 0,
        freeNow: 0,
        efectivo: 0,
        tarjeta: 0,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      periodBreakdown: [],
      breakdown: [],
      workdays: [],
      records: [],
      goalContext: {
        status: "unknown",
        reason: "no_evidence",
      },
    } as any;

    const loadHistoryScreenData = jest.fn().mockResolvedValue(dataset);

    await jest.isolateModulesAsync(async () => {
      installHookMocks(runtime);
      jest.doMock("../historyScreenLoaders", () => ({
        loadHistoryScreenData,
      }));

      const { useHistoryScreen } = await import("../useHistoryScreen");
      useHistoryScreen(selection);
    });

    await Promise.resolve();

    expect(loadHistoryScreenData).toHaveBeenCalledWith(selection);
    expect(runtime.stateValues[0]).toEqual(dataset);
  });

  it("loads an explicit custom historical range", async () => {
    const runtime = createHookRuntime();
    const selection = {
      periodType: "custom" as const,
      startDate: new Date(2026, 5, 29, 12, 0, 0, 0),
      endDate: new Date(2026, 6, 5, 12, 0, 0, 0),
    };
    const dataset = {
      period: {
        periodType: "custom",
        startDate: new Date(2026, 5, 29, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 5, 23, 59, 59, 999),
        label: "Rango personalizado · 29 jun - 5 jul 2026",
        isCurrent: false,
        isEmpty: false,
        canNavigatePrevious: false,
        canNavigateNext: false,
        previousSelection: null,
        nextSelection: null,
      },
      summary: {
        servicesTotal: 0,
        servicesTaxi: 0,
        servicesUber: 0,
        servicesCabify: 0,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 0,
        taxi: 0,
        uber: 0,
        cabify: 0,
        freeNow: 0,
        efectivo: 0,
        tarjeta: 0,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      periodBreakdown: [],
      breakdown: [],
      workdays: [],
      records: [],
      goalContext: {
        status: "unknown",
        reason: "no_evidence",
      },
    } as any;

    const loadHistoryScreenData = jest.fn().mockResolvedValue(dataset);

    await jest.isolateModulesAsync(async () => {
      installHookMocks(runtime);
      jest.doMock("../historyScreenLoaders", () => ({
        loadHistoryScreenData,
      }));

      const { useHistoryScreen } = await import("../useHistoryScreen");
      useHistoryScreen(selection);
    });

    await Promise.resolve();

    expect(loadHistoryScreenData).toHaveBeenCalledWith(selection);
    expect(runtime.stateValues[0]).toEqual(dataset);
  });
});
