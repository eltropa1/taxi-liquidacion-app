export type GlobalTabRouteName = "index" | "summary" | "history" | "goals" | "settings";

export type GlobalTabRoute = Readonly<{
  name: GlobalTabRouteName;
  title: string;
  icon: "home" | "summarize" | "history" | "flag" | "settings";
}>;

export const globalTabRoutes: readonly GlobalTabRoute[] = [
  { name: "index", title: "Inicio", icon: "home" },
  { name: "summary", title: "Resumen", icon: "summarize" },
  { name: "history", title: "Historial", icon: "history" },
  { name: "goals", title: "Metas", icon: "flag" },
  { name: "settings", title: "Ajustes", icon: "settings" },
];

export function isGlobalTabRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/summary" ||
    pathname === "/history" ||
    pathname === "/goals" ||
    pathname === "/settings"
  );
}

export function isContextualRoute(pathname: string) {
  return pathname === "/trip/edit";
}
