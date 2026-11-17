# Ostatni plecak — handcrafted campaign

The original three challenges and their recipes/resource budgets are unchanged.
Seventeen additions follow them in a fixed progression:

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

`scripts/backpackTestSolutions.mjs` contains reproducible resource-valid solutions.
`testBackpackPuzzles.mjs` checks each addition separately, the full campaign,
undo/reload, missing prerequisites, shaped recipes and local PNG availability.
`verifyBackpackUI.mjs` exercises all twenty through the actual component markup.
These are not browser/device visual tests.

Saves remain action-log version 1. A completed former three-stage save replays
to the beginning of stage 4 with fresh stage stock; no existing progress is erased.
A completed ten-stage save similarly continues at stage 11, preserving moves
and starting time. Undo includes all per-puzzle state and can reverse a win.
Inventories show a fixed, stage-specific selection, including decoys and possible
recipe outputs, instead of flooding every stage with all campaign items.
