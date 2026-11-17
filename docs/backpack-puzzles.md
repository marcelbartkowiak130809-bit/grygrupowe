# Ostatni plecak — handcrafted campaign

The original three challenges and their recipes/resource budgets are unchanged.
Twenty-seven additions follow them in a fixed progression:

| Stage | Distinct mechanic | Completion gate |
| --- | --- | --- |
| 4. Ostatnie nasiona | Water, reusable hoe, then planting | Three irrigated and tilled plots planted |
| 5. Ekspres do skrzyni | Rail type, adjacent power, launch | Complete route, powered section, cart launched |
| 6. Grawitacja nie wybacza | Falling sand/gravel | Three two-deep columns filled from the bottom |
| 7. Woda za drzwiami | Furnace inputs, bucket recipe, collecting water | Three ores smelted using coal; bucket drains the water |
| 8. Czytelnia zaklęć | Spacing and enchantment preparation | Four bookshelves at distance two, lapis and book supplied |
| 9. Dziesięć sztuk obsydianu | Frame geometry, limited blocks, ignition | Ten-block frame without corners; inner area ignited |
| 10. Droga po diament | Tool tiers and resource transformation | Wooden → stone → iron pickaxe, smelting, diamond mining |
| 11. Trzy cele, jedna cięciwa | Bow and arrow recipes, reusable bow | Three different targets hit while carrying a bow |
| 12. Miód bez pościgu | Smoke before collecting honey | Campfire below each hive before using a bottle |
| 13. Jedna gąbka na cały zalew | Absorption radius and drying/reuse | Both six-cell water chambers dry using one sponge |
| 14. Paczka z zakrętem | Rotating hopper outlets and tracing delivery | All six hoppers lead the ingot to the chest |
| 15. Alchemia w dobrej kolejności | Bottling, fuel, ordered ingredients and melon recipe | Water → awkward potion → healing potion, with fuel |
| 16. Strażnik wioski | T-shaped structure with head placed last | Four iron blocks in the correct T and carved pumpkin |
| 17. Wyburz mur, ocal skarb | Visible blast radius, limited TNT | All three wall cells demolished without hitting the chest |
| 18. Dwie jasne, jedna ciemna | Three switches, XOR and AND conditions | All levers installed; top/middle lamps on, bottom off |
| 19. Niebieski sygnał ratunkowy | Foundation, beacon recipe and color filter | Full nine-block base, beacon and blue glass filter |
| 20. Serce zatopionej świątyni | Ring geometry, conduit recipe and water | Sixteen-block frame, central conduit and water |
| 21. Przesyłka na tłokach | Crafting a piston and directional cargo movement | Three installed pistons push cargo around two corners to its plate |
| 22. Skarb pod piaskiem | Brush recipe, repeated excavation, pot recipe | Four two-pass finds supply bricks for a pot on its pedestal |
| 23. Barwy po strzyżeniu | Reusable shears, wool dyeing, matching samples | Red, blue and yellow wool in their respective positions |
| 24. Mapa do ukrytej skrzyni | Compass/map recipes and orthogonal navigation | Reveal the route and walk the diamond marker to the chest |
| 25. Urodziny przy pochodniach | Cake recipe with container returns and ordered assembly | Cake, candle, then ignition; three empty buckets refunded |
| 26. Z odpadków do korony drzewa | Slab/composter recipes, compost collection and growth | Four seeds per fertilizer; three fertilizers grow a planted oak |
| 27. Zbroja godna wyprawy | Two smithing operations with distinct templates/materials | Upgrade diamond armor using netherite, then trim using emerald |
| 28. Melodia otwiera drzwi | Wrapping note controls and explicit lock check | Four installed blocks tuned RE–SOL–DO–MI and checked with a lever |
| 29. Patyna pod kontrolą | Scraping oxidation to three different depths, waxing | Clean, exposed and weathered copper waxed at their target stages |
| 30. Ostatni krok: End | Eye recipe, partially filled frame and final entry | Six missing eyes installed, then the opened portal entered |

This is a puzzle abstraction, not a Minecraft simulator: furnace output is instant,
the enchantment does not claim to be level 30, water has one designated reservoir,
and no real-time mob or fire simulation runs. Incorrect prerequisite attempts do
not consume items. A misplaced portal block consumes stock until removed/undone.
Removing a lower falling block is blocked while it supports another block.
Sponge absorption and TNT explosions deliberately use a visible 3×3 area;
the logic stage evaluates explicit switch conditions rather than redstone ticks.
The conduit is a top-down 5×5 cross-section with a designated water input.
Beacon foundations occupy a separate lower layer; removing the beacon refunds
its glass filter as well. Hopper outlets rotate clockwise on click.
Pistons move a single block one tile per activation on a constrained route.
Archaeology uses two brush passes and guaranteed brick finds. Wool sources are
symbolic tufts, not simulated sheep. Composting needs exactly four seeds per
fertilizer, oak growth takes three uses, and note blocks cycle five labeled notes.
These deterministic rules are explained in the respective in-game hints.
Smithing returns the upgraded item to inventory between its two operations.
The cake recipe returns three buckets; removing a candle-topped cake also refunds
the candle. The End frame is a top-down twelve-block frame with six existing eyes.

`scripts/backpackTestSolutions.mjs` contains reproducible resource-valid solutions.
`testBackpackPuzzles.mjs` checks each addition separately, the full campaign,
undo/reload, missing prerequisites, shaped recipes and local PNG availability.
`testBackpackExpedition.mjs` checks stage-specific failed prerequisites,
resource conservation, intermediate visual assets and twenty-stage save migration.
`verifyBackpackUI.mjs` exercises all thirty through the actual component markup.
These are not browser/device visual tests.

Saves remain action-log version 1. A completed former three-stage save replays
to the beginning of stage 4 with fresh stage stock; no existing progress is erased.
A completed ten-stage save similarly continues at stage 11, preserving moves
and starting time. Undo includes all per-puzzle state and can reverse a win.
A completed twenty-stage save continues at stage 21 with the same action history.
Inventories show a fixed, stage-specific selection, including decoys and possible
recipe outputs, instead of flooding every stage with all campaign items.

## Quality review

See `backpack-quality-review.md` for the individual evaluation of all 30 stages,
including similarities and the five weakest designs. The review does not claim
that passing tests makes every stage as engaging as the original three.
New UI placements record `free:true` to support reversible off-target construction
without changing the meaning of historical rejected actions during save replay.
Rail checks now follow connectivity and adjacent power. Library power requires
clear gaps. Construction stages show anchors instead of complete solution outlines.
Optional batch actions shorten repeated crafting and compost filling.
