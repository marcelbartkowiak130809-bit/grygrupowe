# Ostatni plecak — handcrafted campaign

The original three challenges and their recipes/resource budgets are unchanged.
Seven additions follow them in a fixed progression:

| Stage | Distinct mechanic | Completion gate |
| --- | --- | --- |
| 4. Ostatnie nasiona | Water, reusable hoe, then planting | Three irrigated and tilled plots planted |
| 5. Ekspres do skrzyni | Rail type, adjacent power, launch | Complete route, powered section, cart launched |
| 6. Grawitacja nie wybacza | Falling sand/gravel | Three two-deep columns filled from the bottom |
| 7. Woda za drzwiami | Furnace inputs, bucket recipe, collecting water | Three ores smelted using coal; bucket drains the water |
| 8. Czytelnia zaklęć | Spacing and enchantment preparation | Four bookshelves at distance two, lapis and book supplied |
| 9. Dziesięć sztuk obsydianu | Frame geometry, limited blocks, ignition | Ten-block frame without corners; inner area ignited |
| 10. Droga po diament | Tool tiers and resource transformation | Wooden → stone → iron pickaxe, smelting, diamond mining |

This is a puzzle abstraction, not a Minecraft simulator: furnace output is instant,
the enchantment does not claim to be level 30, water has one designated reservoir,
and no real-time mob or fire simulation runs. Incorrect prerequisite attempts do
not consume items. A misplaced portal block consumes stock until removed/undone.
Removing a lower falling block is blocked while it supports another block.

`scripts/backpackTestSolutions.mjs` contains reproducible resource-valid solutions.
`testBackpackPuzzles.mjs` checks each addition separately, the full campaign,
undo/reload, missing prerequisites, shaped recipes and local PNG availability.
`verifyBackpackUI.mjs` exercises all ten through the actual component markup.
These are not browser/device visual tests.

Saves remain action-log version 1. A completed former three-stage save replays
to the beginning of stage 4 with fresh stage stock; no existing progress is erased.
Inventories show a fixed, stage-specific selection, including decoys and possible
recipe outputs, instead of flooding every stage with all campaign items.
