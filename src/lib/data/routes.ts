export const appRoutes = [
  "/",
  "/dashboard",
  "/explore",
  "/asset",
  "/analyze",
  "/portfolio",
  "/hype-check",
  "/simulator",
  "/learn",
  "/profile",
  "/login",
  "/signup",
] as const;

export type AppRoute = (typeof appRoutes)[number];
