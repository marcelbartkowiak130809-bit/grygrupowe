const tabletopGames = new Set(["bomba", "5-sekund", "wavelength", "hangman", "charades", "word-chain"]);

export function gameCategory(mode) {
  return tabletopGames.has(mode?.id) ? "board" : mode?.audience;
}

export const libraryCategories = [
  { id:"music", name:"Muzyka", symbol:"♫", path:"/muzyka", screen:"music-select" },
  { id:"tiktok", name:"Hity TikToka", symbol:"♪", path:"/hity-tiktoka", screen:"tiktok-select" },
  { id:"minecraft", name:"Minecraft", symbol:"⛏️", path:"/minecraft", screen:"minecraft-select" },
  { id:"board", name:"Planszówki", symbol:"🎲", path:"/planszowki", screen:"board-select" },
  { id:"pokemon", name:"Pokémon", symbol:"⚡", path:"/pokemony", screen:"pokemon-select" },
  { id:"knowledge", name:"Wiedza", symbol:"💡", path:"/wiedza", screen:"knowledge-select" },
];

const categoryById = new Map(libraryCategories.map(category => [category.id, category]));
export function libraryModeCategory(mode) {
  return categoryById.get(gameCategory(mode)) || categoryById.get(mode.collections?.[0]);
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
  if (filter === "category") return [];
  const query = normalize(input);
  if (filter === "main" && !query) return games.filter(mode => !mode.hiddenFromLibrary && !libraryModeCategory(mode));
  return games.filter(mode => {
    if (mode.hiddenFromLibrary || (!["all","main"].includes(filter) && !libraryGameTags(mode).includes(filter))) return false;
    if (!query) return true;
    const categories = libraryCategories
      .filter(category => gameCategory(mode) === category.id || mode.collections?.includes(category.id))
      .map(category => category.name);
    return normalize([mode.name, mode.description, ...categories].join(" ")).includes(query);
  });
}
