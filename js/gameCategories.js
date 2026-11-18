const tabletopGames = new Set(["bomba", "5-sekund", "wavelength", "hangman", "charades", "word-chain"]);

export function gameCategory(mode) {
  return tabletopGames.has(mode?.id) ? "board" : mode?.audience;
}
