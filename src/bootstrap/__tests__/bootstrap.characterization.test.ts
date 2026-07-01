import { bootstrapApp } from "../index";
import { createAppRuntime } from "../runtime/createAppRuntime";

jest.mock("../runtime/createAppRuntime", () => ({
  createAppRuntime: jest.fn().mockResolvedValue({
    initializedAt: "2026-07-01T00:00:00.000Z",
  }),
}));

const mockedCreateAppRuntime =
  createAppRuntime as jest.MockedFunction<typeof createAppRuntime>;

describe("bootstrapApp", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates the runtime only once and reuses the same promise", async () => {
    const first = bootstrapApp();
    const second = bootstrapApp();

    expect(first).toBe(second);

    await expect(first).resolves.toEqual({
      initializedAt: "2026-07-01T00:00:00.000Z",
    });
    await expect(second).resolves.toEqual({
      initializedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(mockedCreateAppRuntime).toHaveBeenCalledTimes(1);
  });
});
