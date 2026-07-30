import {
  globalTabRoutes,
  isContextualRoute,
  isGlobalTabRoute,
} from "../appShellRoutes";

describe("app shell routes", () => {
  it("declares the five global destinations in the expected order", () => {
    expect(globalTabRoutes.map((route) => route.name)).toEqual([
      "index",
      "summary",
      "history",
      "goals",
      "settings",
    ]);
    expect(globalTabRoutes.map((route) => route.title)).toEqual([
      "Inicio",
      "Resumen",
      "Historial",
      "Metas",
      "Ajustes",
    ]);
  });

  it("separates global destinations from contextual routes", () => {
    expect(isGlobalTabRoute("/")).toBe(true);
    expect(isGlobalTabRoute("/summary")).toBe(true);
    expect(isGlobalTabRoute("/history")).toBe(true);
    expect(isContextualRoute("/summary")).toBe(false);
    expect(isContextualRoute("/trip/edit")).toBe(true);
    expect(isContextualRoute("/goals")).toBe(false);
  });
});
