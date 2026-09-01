export const publicRoutes = {
  "/o-grze":"public:o-grze",
  "/jak-grac":"public:jak-grac",
  "/tryby-gry":"public:tryby-gry",
  "/regulamin":"public:regulamin",
  "/polityka-prywatnosci":"public:polityka-prywatnosci",
  "/kontakt":"public:kontakt",
};
const appRoutes = { "/pokemony":"pokemon-select", "/planszowki":"board-select", "/minecraft":"minecraft-select" };
const publicScreens = new Set(Object.values(publicRoutes));
const validScreens = new Set(["platform", "pokemon-select", "board-select", "minecraft-select", "lobby", "room", "game", "quiz-select", "shop", "solo", ...publicScreens]);
let current = appRoutes[globalThis.window?.location?.pathname || "/"] || publicRoutes[globalThis.window?.location?.pathname || "/"] || "platform";
let listener = () => {};

export const Router = {
  init(onChange) {
    listener = onChange;
  },
  go(screen) {
    current = validScreens.has(screen) ? screen : "platform";
    listener(current);
  },
  get current() {
    return current;
  },
  publicScreenFromPath(pathname = window.location.pathname) {
    return publicRoutes[pathname] || "";
  },
  appScreenFromPath(pathname = window.location.pathname) {
    return appRoutes[pathname] || "";
  },
  pathForPublicScreen(screen) {
    return Object.entries(publicRoutes).find(([, item]) => item === screen)?.[0] || "/";
  },
};
