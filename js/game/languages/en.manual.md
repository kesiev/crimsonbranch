# Dungeons of Crimsonbranch

You will find what you need to play and much more on the [project homepage]({{gamePlayUrl}}).

## Preparation
 - Fill the _Stats_ boxes starting values as described by the box header
 - Place a pawn aside: the hero is now outside the dungeons
 - Keep 2 dice and a bunch of tokens aside
 - Take a look at the **General Rules** at the end of this guide
 - Go to the **EXPLORE phase**

## Play

### EXPLORE phase
 1. Clear the _Enemies_ section and place the 2 dice and all of the tokens aside
 2. If you've any filled box in the _Items_ sections, you may RE-EQUIP that item
 3. Check if there is at least one {glyph pearl} symbol on the tree with no markings on it
     - If yes: go to the next step
     - Else: you may decide to challenge The Great Evil, tick the topmost empty checkbox on the _Time_ section if any and skip to step 9 evaluating the whole tree
 4. Decide the next node to visit:
     - If the pawn is outside the tree, on a {glyph stairs} node, or a {glyph door} node: you may select one of the {glyph door} nodes
     - If the pawn is in any other node: you may select any other connected node
 5. Move the pawn to the selected node
 6. Tick the topmost empty checkbox on the _Time_ section if any
 7. Find the small grid on the lowest _Time_ section segment with at least one ticked checkbox
 8. Using the pawn position as the top-left corner, evaluate the nodes falling inside the grid. Do not evaluate the squares outside the tree
 9. Find regions of orthogonally adjacent nodes with the same {glyph attack}, {glyph range}, {glyph defense}, and {glyph heal} symbol inside the evaluated area. Ignore branches and regions may overlap
 10. For every region containing at least one node with a single valid symbol:
     - Pick an empty block under the _Enemy_ section
     - Tick the box matching the region symbol
     - Write the region's nodes count in the _HP_ and _Strength_ boxes
 11. Sum the _Strength_ value of all {glyph defense} enemies and write that number on all non-{glyph defense} enemies _Shield_ boxes. Leave it empty if the sum is 0
 12. Go to the **PREPARE phase**

### PREPARE phase
 1. Roll the first dice and place it under the _Neutral_ space. It's the active dice
 2. You may decide to go to the **FIGHT phase** now
 3. Decide the next node to activate
    - If there are no tokens on the tree: you can select one of the {glyph door} nodes only
    - Else: you can select any node without a token connected to another node with a token by a marked branch
 4. Activate the node
    - You must activate at least 1 valid symbol on the node:
      - {glyph defense}/{glyph attack}/{glyph range}/{glyph heal}:
        - If the active dice is under the matching space: raise the dice value by 1
        - Else: move the active dice under the matching space
      - {glyph special}:
        - If there is a 6 dice under the {glyph defense}/{glyph attack}/{glyph range}/{glyph heal} spaces: follow the space instructions and put the 6 dice aside
        - Else: do nothing
    - Place a token on that node
 5. If the active dice is a 6 and it's not under the _Neutral_ space:
    - If there is another dice aside: roll it and place it under the _Neutral_ space. It's the new active dice
    - Else: go to the **FIGHT phase**
 6. Go back to step 2

### FIGHT phase
 1. Put any dice under the _Neutral_ space and all of the tokens aside
 2. You may decide to go to the **ENEMIES phase** now
 3. Enemies with a number on the _HP_ box are alive
 4. Select one alive enemy:
    - If there is a number in its _Shield_ box:
      - Select a {glyph attack} or {glyph range} slot and decrease the values of the dice by that number
      - Clear that enemy _Shield_ box
    - Else:
      - {glyph attack} enemy: decrease the {glyph attack} slot dices values by 1 or the {glyph range} one by 2 to reduce its _HP_ box value by 1
      - {glyph range} enemy: decrease the {glyph range} slot dices values by 1 or the {glyph attack} one by 2 to reduce its _HP_ box value by 1
      - {glyph heal}/{glyph defense} enemy: select a {glyph attack} or {glyph range} slot and decrease its dices values by 1 to reduce the enemy _HP_ box value by 1
 5. When an enemy _HP_ box reaches 0, leave that box empty
 6. Go back to step 2

### ENEMY phase
 1. Sum the _Strength_ of all alive enemies
 2. Subtract the dice values under the {glyph defense} area
 3. Find the _HP_ box under the _Stats_ section and decrease its number by that value
    - If it is less than or equal to 0: copy the _HP/XP Max_ value on the _HP_ box, put the pawn aside, and go to the **EXPLORE phase**
    - Else: sum the dice values under the {glyph heal} area, limit it to _HP/XP Max_ value, and replace the _HP_ box number
 4. Sum the _Strength_ value of all {glyph defense} alive enemies and write that number on all non-{glyph defense} alive enemies _Shield_ box. Clear it instead if the sum is 0
 5. Sum the _Strength_ value of all {glyph heal} alive enemies and sum that number to all alive enemies' _HP_ box, limiting it to its _Strength_ value
 6. Put all the dice aside
 7. Check the alive enemies:
    - If there is at least 1 left: go back to the **PREPARE phase**
    - Else: go to the **LOOT phase**
  
### LOOT phase
 1. If you've any filled box in the _Items_ sections, you may RE-EQUIP that item
 2. If there is a {glyph pearl} with no markings on the pawn node you may:
    - Cross it and raise the _Stats_ section _XP_ box by the number of nodes evaluated for this battle
    - Copy it over any {glyph defense}/{glyph attack}/{glyph range}/{glyph heal} symbol inside the nodes evaluated for this battle
 3. If there is a _Strength_ value filled in the _Enemies_ spaces you may clear it and:
    - Raise the _Stats_ section _XP_ box by the _Strength_ value
    - EQUIP an item of _Type_ matching the enemy (see the _by_ map on the _Item_ sections) and _Quality_ as the enemy _Strength_
 4. Check if you can do anything more:
    - If yes: go back to step 1
    - If no:
      - If you've challenged The Great Evil: **you won!** Sum the empty cells count in the _Time_ section and the empty large boxes count in the _Level/Skill points_ section to get your final score
      - Else: go to the **EXPLORE phase**

## General Rules

### Leveling up
 - If the _Stats_ section _XP_ box value is equal to or greater than the _HP/XP Max_ value: follow the _Level/Skill points_ header instructions to level up
 - Anytime, if you've any unticked small box on the left of a large ticked box in the _Level/Skill points_ section: you may tick one of them to cross out any branch connected to a {glyph door} node or to any other node already connected by a crossed-out branch
  
### EQUIP an item
 1. Roll 2 dice. These are the _Dice 1_ and _Dice 2_ values
 2. Find the small grid on the _Time_ section segment matching the item _Quality_
 3. Using _Dice 1_ and _Dice 2_ values in both orders as the node coordinates of the top-left corner, evaluate all the nodes falling inside the two grids. Do not evaluate the nodes outside the tree
 4. You may:
    - Discard the item: raise the _Stats_ section _XP_ box by 1
    - If there is an unmarked branch of the same item _Type_ connecting 2 nodes inside the evaluated area: circle that branch, clear any other circle on the same item _Type_ branches, and replace the _Dice 1_, _Dice 2_, and _Quality_ box values under that item _Type_ _Item_ section
 
### RE-EQUIP an item
 - Follow the EQUIP procedure from step 2, using the _Dice 1_ and _Dice 2_ values in the item boxes instead rolling the dice
 - During step 4: if you decide to discard the item, you've also to clear any circle on that item _Type_ branches and clear all that _Item_ section boxes