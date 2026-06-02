const validScreens = new Set(["platform", "lobby", "shop", "room", "game", "solo"]);
let current = "platform";
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
};
