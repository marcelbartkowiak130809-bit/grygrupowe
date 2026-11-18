const tabletopGames = new Set(["bomba", "5-sekund", "wavelength", "hangman", "charades", "word-chain", "kim-jestem"]);

export const libraryCategories = [
  { id:"music", name:"Muzyka", symbol:"♫", path:"/muzyka", screen:"music-select" },
  { id:"tiktok", name:"Hity TikToka", symbol:"♪", path:"/hity-tiktoka", screen:"tiktok-select" },
  { id:"minecraft", name:"Minecraft", symbol:"⛏️", path:"/minecraft", screen:"minecraft-select" },
  { id:"board", name:"Planszówki", symbol:"🎲", path:"/planszowki", screen:"board-select" },
  { id:"pokemon", name:"Pokémon", symbol:"⚡", path:"/pokemony", screen:"pokemon-select" },
  { id:"knowledge", name:"Wiedza", symbol:"💡", path:"/wiedza", screen:"knowledge-select" },
  { id:"other", name:"Inne", symbol:"✦", path:"/inne", screen:"other-select" },
];

const categoryById = new Map(libraryCategories.map(category => [category.id, category]));

export function gameCategory(mode) {
  if (tabletopGames.has(mode?.id)) return "board";
  if (categoryById.has(mode?.audience)) return mode.audience;
  return mode?.collections?.find(id => categoryById.has(id)) || "other";
}

export function libraryModeCategory(mode) {
  return categoryById.get(gameCategory(mode));
}

export function libraryModesFor(games, category) {
  return games.filter(mode => !mode.hiddenFromLibrary &&
    (gameCategory(mode) === category || mode.collections?.includes(category)));
}

const normalize = value => String(value || "").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").trim();
export function libraryGameTags(mode) {
  const audience = ["crew","everyone"].includes(mode.audience)
    ? mode.audience
    : mode.supportsSolo && !mode.supportsLobby ? "" : "everyone";
  return [audience, ...(mode.supportsSolo || mode.soloModeId ? ["solo"] : []), ...(mode.badges || [])].filter(Boolean);
}

export function filterLibraryGames(games, filter, input) {
  const query = normalize(input);
  if (filter === "category" || (filter === "main" && !query)) return [];
  return games.filter(mode => {
    if (mode.hiddenFromLibrary || (!["all","main"].includes(filter) && !libraryGameTags(mode).includes(filter))) return false;
    if (!query) return true;
    const categories = libraryCategories
      .filter(category => gameCategory(mode) === category.id || mode.collections?.includes(category.id))
      .map(category => category.name);
    return normalize([mode.name, mode.description, ...categories].join(" ")).includes(query);
  });
}
