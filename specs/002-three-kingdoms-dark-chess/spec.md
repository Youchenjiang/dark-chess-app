# Feature Specification: Three Kingdoms Dark Chess (三國暗棋)

**Feature Branch**: `002-three-kingdoms-dark-chess`  
**Created**: 2026-01-22  
**Status**: Draft  
**Priority**: P0 (Market Differentiator)  
**Dependencies**: 001-banqi-game-rules (Architecture refactoring required)

---

## Overview

**Three Kingdoms Dark Chess** (三國暗棋 / Sān Guó Àn Qí) is a **3-player variant** of Classic Dark Chess featuring:
- 3 factions/teams with asymmetric piece distribution (12+10+10 pieces)
- **Portrait-oriented board**: **5 columns × 9 rows** (45 intersection points) aligned with phone's long edge
- **"Four Corners" (四角) initial setup**: Pieces arranged in 4 clusters (2×4 blocks) at corners, leaving center aisle empty
- **Dynamic faction assignment**: Players receive faction based on **first flip rule** (not pre-assigned)
- **"Army Chess" (軍棋) style movement**: Ministers, Horses move along grid lines **without blocking** (no 馬腳/象眼 checks)
- No rank hierarchy (any piece captures any piece)
- Modified movement rules (Generals move infinite like Rooks, Ministers/Horses jump freely)
- **Draw rule**: 60 consecutive moves without capture results in a draw

**Market Positioning**: This is our **unique selling proposition** - no other mobile Dark Chess app offers 3-player variants with "Four Corners" Army Chess mechanics.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Between Classic and Three Kingdoms Modes (Priority: P1)

As a player, I want to **select between Classic (2-player) and Three Kingdoms (3-player) modes** so that I can choose my preferred game variant.

**Why this priority**: Mode selection is the entry point for all other Three Kingdoms features. Without it, users cannot access the new variant.

**Independent Test**: Can be tested by launching the app, accessing the mode selector UI, and verifying that selecting "Three Kingdoms" loads a 3-player game.

**Acceptance Scenarios**:

1. **Given** the app home screen, **When** I tap "Select Mode", **Then** I see options for "Classic Dark Chess (經典暗棋)" and "Three Kingdoms (三國暗棋)"
2. **Given** I selected "Three Kingdoms" mode, **When** the game starts, **Then** the board displays:
   - **Portrait-oriented 5×9 grid** (aligned with phone's long edge)
   - **32 face-down pieces** arranged in **4 corner clusters** (2×4 blocks)
   - **13 empty intersection points** forming a central "cross" aisle
   - Turn indicator showing "Player 1's Turn" (no pre-assigned factions)
3. **Given** I am in Three Kingdoms mode, **When** I view the board, **Then** I see pieces clustered at **four corners** with the center clearly empty
4. **Given** I am in Three Kingdoms mode, **When** I return to home and select "Classic", **Then** the game switches to 2-player Classic rules with 8x4 grid cells

---

### User Story 2 - Play 3-Player Local Multiplayer (Priority: P1)

As a player, I want to **play Three Kingdoms Dark Chess with 2 other players locally** (pass-and-play), taking turns flipping, moving, and capturing pieces according to Three Kingdoms rules.

**Why this priority**: Core gameplay loop for Three Kingdoms. This is the heart of the feature.

**Independent Test**: Three players can complete a full game from setup to victory, with all rules enforced correctly.

**Acceptance Scenarios**:

1. **Given** a new Three Kingdoms match (pieces in four corners), **When** Player 1 flips the first piece (e.g., Red Rook), **Then**:
   - That piece is revealed with RED color
   - Player 1 is **assigned to Red faction** (dynamic assignment complete)
   - Draw counter is set to 60
   - Turn indicator changes to "Player 2's Turn" (not yet assigned)
2. **Given** Player 1 (Red faction) controls a revealed Rook, **When** Player 1 moves it 3 steps straight along grid lines (Army Chess style), **Then** the Rook slides successfully (no blocking), draw counter decrements to 59, and Player 2's turn begins
3. **Given** Player 2 flips a BLACK Minister, **When** the piece is revealed, **Then** Player 2 is **assigned to Black faction**, and turn passes to Player 3 (not yet assigned)
4. **Given** Player 1's General is adjacent to Player 2's Soldier along a grid line, **When** Player 1 captures with the General, **Then** the capture succeeds (no rank hierarchy), Player 2's Soldier is eliminated, and the draw counter **resets to 60**
5. **Given** Player 3 flips a GREEN General (Team 1 - Generals' Army), **When** the piece is revealed, **Then** Player 3 is **assigned to Green faction** (all 3 factions now assigned)
6. **Given** Player 2 (Black faction) has been eliminated, **When** Player 1 finishes their turn, **Then** the turn passes directly to Player 3 (Player 2 is **removed from turn rotation**)
7. **Given** 59 consecutive non-capture moves have occurred, **When** Player 1 makes a non-capture move, **Then** the draw counter reaches 0 and the game **ends immediately in a draw**
8. **Given** all Black and Green pieces are eliminated, **When** only Red faction has pieces remaining, **Then** Player 1 (Red) wins the game

---

### User Story 3 - Understand Three Kingdoms Rules (Priority: P2)

As a new player, I want to **access a rules guide for Three Kingdoms** mode so that I understand the differences from Classic (3 teams, no rank hierarchy, modified movement, draw rule).

**Why this priority**: Three Kingdoms has complex rules. Players need clear guidance.

**Independent Test**: Rules screen displays all team compositions, movement rules, capture rules, and draw rule with Traditional Chinese text.

**Acceptance Scenarios**:

1. **Given** I am on the mode selection screen, **When** I tap "Three Kingdoms Rules", **Then** I see a screen explaining team distribution (12+10+10 pieces) and board topology (45 intersections)
2. **Given** the rules screen, **When** I scroll through movement rules, **Then** I see that Generals move infinitely (like Rooks) and Ministers jump freely (no blocking)
3. **Given** the rules screen, **When** I read capture rules, **Then** I see "No rank hierarchy - any piece captures any piece (except same team)"
4. **Given** the rules screen, **When** I read win conditions, **Then** I see "Draw occurs after 60 consecutive moves without capture"

---

### User Story 4 - Visualize 3 Teams Clearly (Priority: P2)

As a player, I want to **distinguish between the 3 teams visually** (Team 1: Generals' Army, Team 2: Red Advisors, Team 3: Black Advisors) so that I can quickly identify which pieces belong to which faction.

**Why this priority**: 3-team gameplay requires clear visual distinction to avoid confusion.

**Independent Test**: All revealed pieces display team indicators (colors, borders) that are immediately recognizable.

**Acceptance Scenarios**:

1. **Given** a piece from Team 1 (Generals' Army) is revealed, **When** I view the board, **Then** it displays with **GREEN** font/border color
2. **Given** a piece from Team 2 (Red Advisors) is revealed, **When** I view the board, **Then** it displays with **RED** font/border color
3. **Given** a piece from Team 3 (Black Advisors) is revealed, **When** I view the board, **Then** it displays with **BLACK** font/border color
4. **Given** pieces from all 3 teams are revealed, **When** I view the board, **Then** I can instantly distinguish teams by color (Green vs Red vs Black)
5. **Given** the game info panel, **When** I check the current turn, **Then** I see "Team A's Turn" with **GREEN** team color indicator (for Team 1)
6. **Given** the game info panel, **When** I view the draw counter, **Then** I see "Moves Until Draw: 45" (or current countdown value from 60 to 0)

---

## Requirements *(mandatory)*

### Functional Requirements

**Architecture & Mode System**:
- **FR-001**: System MUST support multiple game modes (Classic, Three Kingdoms) via a pluggable rule system
- **FR-002**: System MUST allow users to select game mode before starting a new match
- **FR-003**: System MUST persist selected mode in local storage (AsyncStorage)
- **FR-004**: System MUST NOT mix rules between modes (strict separation of Classic vs Three Kingdoms logic)

**Three Kingdoms Board & Setup**:
- **FR-005**: Board MUST have **45 intersection points** arranged in a **Portrait 5×9 grid** (5 columns wide × 9 rows tall) aligned with phone's **long edge** (vertical orientation)
- **FR-006**: System MUST place **32 pieces in "Four Corners" (四角) layout**:
  - **Top-Left corner**: 2×4 block (8 pieces)
  - **Top-Right corner**: 2×4 block (8 pieces)
  - **Bottom-Left corner**: 2×4 block (8 pieces)
  - **Bottom-Right corner**: 2×4 block (8 pieces)
  - **Center aisle**: 13 empty intersections forming a "cross" pattern (central row 4 + central column 2)
- **FR-007**: System MUST **shuffle the 32 pieces** before distributing them into the 4 corner blocks (randomize piece assignment within corners)
- **FR-008**: All 32 pieces MUST be placed face-down at game start
- **FR-009**: Empty intersection points (13 central positions) MUST be visually distinguishable as empty dots or grid markers

**Three Kingdoms Players & Turns (Dynamic Faction Assignment)**:
- **FR-010**: System MUST support **3 players with dynamic faction assignment**:
  - Game starts with "Player 1", "Player 2", "Player 3" (no pre-assigned factions)
  - **First Flip Rule**: When a player flips their first piece, they are **assigned to that piece's faction** (Red/Black/Green)
  - If Player 2 flips a piece from the same faction as Player 1, turn passes but Player 2 is **NOT assigned yet** (retry on next turn)
  - Continue until all 3 players are assigned to distinct factions
- **FR-011**: System MUST rotate turns in sequence: Player 1 → Player 2 → Player 3 → Player 1
- **FR-012**: When a player's faction is eliminated, system MUST **immediately remove them from turn rotation** (e.g., P1 → P3 → P1 if P2 eliminated)
- **FR-013**: System MUST distribute pieces correctly across the 3 factions: **Green/Team 1 (12 pieces), Red/Team 2 (10 pieces), Black/Team 3 (10 pieces)**, shuffled into 4 corner blocks

**Draw Counter (Mandatory)**:
- **FR-014**: System MUST initialize a "moves without capture" counter to **60** at game start
- **FR-015**: System MUST decrement the counter by 1 after each non-capture move (flip or move)
- **FR-016**: System MUST **reset the counter to 60** immediately when ANY capture occurs
- **FR-017**: System MUST **end the game as a draw** when the counter reaches 0
- **FR-018**: UI MUST display the current counter value prominently (e.g., "Moves Until Draw: 45")

**Piece Movement (Army Chess / 軍棋 Style - No Blocking)**:
- **FR-019**: Generals (帥/將) MUST move **infinite steps** along straight lines (like Rooks/Rails), NOT limited to 1 step
- **FR-020**: Ministers (相/象) MUST jump 2 steps diagonally (田字 pattern) **WITHOUT blocking checks** - no "Elephant Eye" (象眼) blocking (Army Chess style)
- **FR-021**: Horses (傌/馬) MUST move in Knight L-shape **WITHOUT blocking checks** - no "Horse Leg" (馬腳) blocking (Army Chess style)
- **FR-022**: Rooks (俥/車) MUST move infinite steps along straight lines (rail movement) but **ARE blocked** by obstacles (cannot jump)
- **FR-023**: Cannons (炮/包) MUST move infinite steps along straight lines (rail movement) but **ARE blocked** by obstacles; capture by jumping exactly one piece
- **FR-024**: Soldiers (兵/卒) and Advisors (仕/士) MUST move 1 step (orthogonal for Soldiers, diagonal for Advisors)
- **FR-025**: All pieces MUST move along grid lines connecting adjacent intersection points
- **FR-026**: Pieces CAN move to any empty intersection point (13 central empty spots are valid destinations)

**Capture Rules (No Rank Hierarchy)**:
- **FR-027**: System MUST allow **ANY piece** to capture **ANY opponent piece** (no rank hierarchy)
- **FR-028**: System MUST prevent pieces from capturing their own faction members
- **FR-029**: Cannon MUST capture by jumping over exactly one piece (any faction) along a straight line
- **FR-030**: System MUST NOT apply King vs Pawn exception (does not exist in Three Kingdoms)

**Win Conditions**:
- **FR-031**: System MUST detect elimination victory: when a player's faction is the ONLY faction with pieces remaining
- **FR-032**: System MUST end the game when 2 factions are eliminated, declaring the remaining faction's player the winner
- **FR-033**: System MUST detect draw condition: when 60 consecutive moves pass without any capture
- **FR-034**: System MUST support stalemate detection: if a player has no legal moves, they are eliminated (removed from turn rotation)

**UI/UX (Portrait Mode)**:
- **FR-035**: UI MUST display mode selector with "Classic (經典暗棋)" and "Three Kingdoms (三國暗棋)" options
- **FR-036**: UI MUST display turn indicator showing:
  - Before faction assignment: "Player 1's Turn", "Player 2's Turn", "Player 3's Turn"
  - After faction assignment: "Red's Turn" (with color), "Black's Turn", "Green's Turn"
- **FR-037**: UI MUST use **GREEN (#4CAF50 or similar)** color for Team 1 (Generals' Army) pieces - text, borders, and backgrounds
- **FR-038**: UI MUST use **RED (#C62828 or similar)** color for Team 2 (Red Advisors) pieces
- **FR-039**: UI MUST use **BLACK (#1A1A1A or similar)** color for Team 3 (Black Advisors) pieces
- **FR-040**: UI MUST render board as **Portrait 5×9 grid** (5 columns × 9 rows) aligned with phone's long edge
- **FR-041**: UI MUST render **grid lines** (horizontal and vertical) with pieces positioned at **intersection points**
- **FR-042**: UI MUST visually show **Four Corners layout** at game start (4 clusters of pieces with center empty)
- **FR-043**: UI MUST distinguish empty intersections (13 central positions) with small dots or subtle markers
- **FR-044**: UI MUST display captured pieces per faction (3 separate capture counts with faction colors)
- **FR-045**: UI MUST display "Moves Until Draw" counter prominently (countdown from 60 to 0)
- **FR-046**: UI MUST update the draw counter in real-time after each move
- **FR-047**: UI MUST show eliminated factions as grayed out or removed from turn indicator

**UI Safety & Responsiveness (Portrait)**:
- **FR-048**: UI MUST use **SafeAreaView** to handle device notches and safe area insets (iOS/Android)
- **FR-049**: UI MUST **dynamically scale cell/intersection size** if board height exceeds available screen space (prevent overflow)
- **FR-050**: UI MUST ensure entire game (Header + Mode Selector + Board + Footer) fits within phone screen without scrolling
- **FR-051**: UI MUST lock screen orientation to **Portrait mode** (no landscape support for Three Kingdoms)
- **FR-052**: UI MUST provide "Back/Exit" button to return to mode selection screen

**Testing**:
- **FR-053**: Core Three Kingdoms logic MUST have 100% unit test coverage
- **FR-054**: Integration tests MUST verify **dynamic faction assignment** (first flip rule)
- **FR-055**: Integration tests MUST verify **Four Corners layout** generation (2×4 blocks at corners, 13 center empty)
- **FR-056**: Integration tests MUST verify **Army Chess movement** (Ministers/Horses move without blocking)
- **FR-057**: Integration tests MUST verify 3-player turn rotation with elimination skipping
- **FR-058**: Integration tests MUST verify elimination victory condition
- **FR-059**: Integration tests MUST verify draw condition (60 moves without capture)
- **FR-060**: Integration tests MUST verify counter reset on capture

---

### Non-Functional Requirements

- **NFR-001**: Three Kingdoms match MUST load in < 2 seconds
- **NFR-002**: UI MUST remain responsive with 3 players (no lag)
- **NFR-003**: Code MUST follow Clean Architecture (pluggable rule system)
- **NFR-004**: All UI text MUST be in Traditional Chinese
- **NFR-005**: Code comments and commits MUST be in English

---

### Key Entities

**GameMode** (NEW):
- `id`: "classic" | "three-kingdoms" | "army-chess"
- `name`: Display name (e.g., "三國暗棋")
- `playerCount`: Number of players (2 or 3)
- `boardSize`: Number of positions (32 for Classic, 45 for Three Kingdoms)
- `ruleSet`: Reference to rule implementation (ClassicRules | ThreeKingdomsRules)

**Faction** (NEW for Three Kingdoms):
- `id`: "team-a" | "team-b" | "team-c"
- `name`: "Generals' Army" | "Red Advisors" | "Black Advisors"
- `color`: "green" | "red" | "black" (UI color for team identification)
- `pieceCount`: 12, 10, or 10
- `isEliminated`: boolean (for turn rotation)

**Piece** (MODIFIED):
- Add `faction`: Reference to Faction (replaces simple `color: 'red' | 'black'`)
- `type`: PieceType (same as Classic)
- `isRevealed`: boolean
- `isDead`: boolean

**Match** (MODIFIED):
- Add `mode`: GameMode reference
- Add `factions`: Array of Faction (length 2 for Classic, 3 for Three Kingdoms)
- Add `currentFactionIndex`: number (0, 1, or 2)
- `board`: Array of `Piece | null` (size **32 for Classic, 45 for Three Kingdoms**)
- `capturedByFaction`: Map of faction ID to captured pieces array
- Add `movesWithoutCapture`: number (countdown from 60, resets to 60 on capture)
- Add `activeFactions`: Array of active faction IDs (updated when factions are eliminated)

**RuleSet** (NEW - Abstract Interface):
- `validateMove(match, fromIndex, toIndex): ValidationResult`
- `validateCapture(match, fromIndex, toIndex): ValidationResult`
- `checkWinCondition(match): WinResult`
- `checkDrawCondition(match): boolean`
- `getLegalMoves(match, pieceIndex): number[]`

**ClassicRules** (EXTRACTED from current GameEngine):
- Implements RuleSet interface
- 2-player logic with rank hierarchy
- No draw counter

**ThreeKingdomsRules** (NEW):
- Implements RuleSet interface
- 3-player logic with no rank hierarchy
- Modified movement rules (General, Minister, Horse)
- Draw counter management (60 moves)

---

## Edge Cases

**Mode Switching**:
- What happens if user switches mode mid-game? → Prompt confirmation, discard current match
- What if saved game is in Three Kingdoms mode but user selects Classic? → Ignore saved game, start fresh

**Board & Topology**:
- How many total positions? → **45 intersection points** (5 columns × 9 rows, Portrait orientation)
- How many empty spots at start? → **13 empty intersections** (central row 4 + central column 2 = "cross" aisle)
- Do pieces move on grid lines? → YES, pieces move along lines connecting intersections (Army Chess / 軍棋 style)
- What is the initial layout? → **Four Corners (四角)** - 4 blocks of 2×4 pieces at each corner (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
- Can pieces occupy any of the 45 intersections? → YES, including the 13 central empty spots

**3-Player Turn Logic (Dynamic Faction Assignment)**:
- What if Player 2 flips a piece from Player 1's faction? → Turn passes, but Player 2 is **NOT assigned yet** (retry on next turn until distinct faction found)
- How long until all 3 factions are assigned? → Depends on flips; typically within first 3-6 turns (as long as 3 distinct factions exist)
- What if Player 1 flips Green, Player 2 flips Red, Player 3 flips Black? → All 3 assigned, game proceeds normally
- What if Player B's faction is eliminated mid-game? → Player B is immediately removed from turn rotation (P1 → P3 → P1)
- What if 2 factions are both eliminated? → Game ends immediately, remaining faction's player wins
- What if only 1 active player remains mid-turn? → Current turn completes, then victory declared
- Are eliminated factions visible in UI? → YES, shown as grayed out or marked "Eliminated"

**Draw Counter**:
- When does counter decrement? → After each non-capture move (flip without capture, move without capture)
- When does counter reset? → **Immediately to 60** when ANY capture occurs
- What if counter reaches 0? → Game **ends immediately in a draw**
- Does flipping a piece count as a move? → YES, decrements counter if no subsequent capture on that turn
- What if 60th move is a capture? → Counter resets to 60, game continues
- What if draw occurs with all 3 teams active? → Draw declared, no winner

**Piece Distribution (Four Corners)**:
- How are pieces shuffled? → All 32 pieces are shuffled, then distributed into 4 corner blocks (8 pieces per corner)
- What if shuffle places all Green pieces in one corner? → Accept it (random is random)
- Can same-faction pieces be adjacent at start? → YES, valid if they end up in same corner block
- Are pieces placed randomly or in "Four Corners"? → **Four Corners layout** (not random across all 45 positions)

**Movement Edge Cases (Army Chess / 軍棋 Style)**:
- Can General move across entire board in one turn? → YES (infinite rail movement along straight lines), but **blocked by obstacles** (cannot jump)
- Can Minister jump over occupied intersections? → YES (no "Elephant Eye" / 象眼 blocking in Three Kingdoms - **Army Chess style**)
- Can Horse jump over pieces? → YES (no "Horse Leg" / 馬腳 blocking in Three Kingdoms - **Army Chess style**)
- Are Rooks and Cannons blocked? → YES, Rooks/Cannons move along rails but **cannot jump** (blocked by obstacles)
- Can pieces move to empty central intersections? → YES, 13 empty spots are valid destinations (central aisle)
- Can pieces move diagonally across the grid? → Only Advisors (1 step diagonal) and Ministers (2 steps diagonal, no blocking)

**Capture Edge Cases**:
- Can Soldier capture General? → YES (no rank hierarchy)
- Can Cannon capture without jumping? → NO (Cannon must jump to capture, same as Classic)
- Can Team A piece capture another Team A piece? → NO (friendly fire disabled)
- Does capturing reset the draw counter? → YES, **always resets to 60**

**Victory Edge Cases**:
- What if Team A has 1 piece, Teams B and C have 0? → Team A wins (elimination victory)
- What if all teams have pieces but one player has no legal moves? → That player is eliminated (stalemate = elimination), removed from turn rotation
- What if draw counter reaches 0 with all 3 teams active? → Draw (no winner)
- What if last 2 teams are eliminated simultaneously? → Impossible (turns are sequential)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully complete a 3-player Three Kingdoms match from setup to victory or draw
- **SC-002**: Mode selector UI allows switching between Classic and Three Kingdoms in < 3 taps
- **SC-003**: 100% of Three Kingdoms rules are correctly enforced (verified by unit tests)
- **SC-004**: 3-player turn rotation with elimination skipping works correctly in 100% of test cases
- **SC-005**: Elimination victory is correctly detected in 100% of test scenarios
- **SC-006**: Draw condition (60 moves without capture) is correctly enforced in 100% of test scenarios
- **SC-007**: UI clearly distinguishes 3 teams with GREEN/RED/BLACK colors (validated by user testing)
- **SC-008**: Architecture supports adding future variants (e.g., Army Chess) without major refactoring
- **SC-009**: No performance degradation with 3 players and 45-position board (frame rate stays > 50 FPS)

---

## Technical Constraints

**Architecture Refactoring** (CRITICAL):
- Current `GameEngine.ts` has hardcoded Classic rules
- MUST refactor to abstract `RuleSet` interface
- MUST extract Classic logic into `ClassicRules` class
- MUST implement `ThreeKingdomsRules` class

**Board Topology** (CLARIFIED):
- **Classic**: 8x4 grid **CELLS** (32 cells, pieces occupy cells)
- **Three Kingdoms**: 5x9 grid **INTERSECTIONS** (45 intersections = corners of 4x8 grid, pieces occupy intersections)
- Board array size: 32 for Classic, 45 for Three Kingdoms
- **Decision**: Use different board sizes for different modes; intersection-based coordinate system for Three Kingdoms

**State Management**:
- Current Zustand store assumes 2 players (red/black)
- MUST extend to support 2-N players with factions
- MUST add draw counter state (movesWithoutCapture)
- MUST add activeFactions state for turn rotation

**UI Adaptation**:
- Current `BoardView` assumes 8x4 grid cells (32 positions)
- MUST adapt for 5x9 intersection grid (45 positions)
- MUST render grid lines and intersection points
- MUST visually distinguish empty intersections (13 spots)
- MUST support 3 team colors (GREEN, RED, BLACK)

---

## Three Kingdoms Rules Reference (完整規則)

### Board Topology (棋盤拓撲)

**Classic Dark Chess**:
- 8 rows × 4 columns = 32 **grid cells**
- Pieces occupy the cells themselves
- No empty spaces at start

**Three Kingdoms Dark Chess** (Portrait Orientation):
- **Portrait 5×9 grid** (5 columns × 9 rows) aligned with phone's long edge
- Pieces occupy the **intersection points** (where grid lines cross)
- **Four Corners (四角) layout**: 32 pieces arranged in 4 clusters (2×4 blocks) at corners
- **13 empty intersection points** in center (forming a "cross" aisle)
- Pieces move along grid lines between adjacent intersections (Army Chess / 軍棋 style)

**Visual Representation (Portrait View)**:
```
Classic (8x4 cells):          Three Kingdoms (5×9 intersections, Portrait):
┌─┬─┬─┬─┐                     ◆ ◆ ○ ◆ ◆  ← Row 0 (Top)
├─┼─┼─┼─┤                     ◆ ◆ ○ ◆ ◆  ← Row 1
├─┼─┼─┼─┤                     ◆ ◆ ○ ◆ ◆  ← Row 2
├─┼─┼─┼─┤                     ◆ ◆ ○ ◆ ◆  ← Row 3
├─┼─┼─┼─┤                     ○ ○ ○ ○ ○  ← Row 4 (Center - Empty)
├─┼─┼─┼─┤                     ◆ ◆ ○ ◆ ◆  ← Row 5
├─┼─┼─┼─┤                     ◆ ◆ ○ ◆ ◆  ← Row 6
├─┼─┼─┼─┤                     ◆ ◆ ○ ◆ ◆  ← Row 7
└─┴─┴─┴─┘                     ◆ ◆ ○ ◆ ◆  ← Row 8 (Bottom)
32 cells                      ↑ ↑ ↑ ↑ ↑
                              C C C C C
                              o o | o o
                              l l 2 l l
                              0 1   3 4

◆ = Piece (face-down at start)
○ = Empty intersection (13 total)
"Four Corners": 
  - Top-Left: Cols 0-1, Rows 0-3 (8 pieces)
  - Top-Right: Cols 3-4, Rows 0-3 (8 pieces)
  - Bottom-Left: Cols 0-1, Rows 5-8 (8 pieces)
  - Bottom-Right: Cols 3-4, Rows 5-8 (8 pieces)
  - Center: Col 2 (all rows) + Row 4 (all cols) = 13 empty
```

---

### Team Distribution (隊伍分配)

| Team | Chinese Name | Color | Pieces | Count |
|------|--------------|-------|--------|-------|
| **Team 1** | 將軍軍 | **GREEN** | 帥 (Red General) | 1 |
| | | | 將 (Black General) | 1 |
| | | | 兵 (Red Soldier) | 5 |
| | | | 卒 (Black Soldier) | 5 |
| | **Total** | | | **12** |
| **Team 2** | 紅方輔臣 | **RED** | 仕 (Red Advisor) | 2 |
| | | | 相 (Red Minister) | 2 |
| | | | 俥 (Red Rook) | 2 |
| | | | 傌 (Red Horse) | 2 |
| | | | 炮 (Red Cannon) | 2 |
| | **Total** | | | **10** |
| **Team 3** | 黑方輔臣 | **BLACK** | 士 (Black Advisor) | 2 |
| | | | 象 (Black Minister) | 2 |
| | | | 車 (Black Rook) | 2 |
| | | | 馬 (Black Horse) | 2 |
| | | | 包 (Black Cannon) | 2 |
| | **Total** | | | **10** |

**TOTAL: 32 pieces** placed on **45 intersection points** (13 empty)

**Color Coding** (NEW):
- **Team 1 (Generals' Army)**: GREEN color for text/borders
- **Team 2 (Red Advisors)**: RED color for text/borders
- **Team 3 (Black Advisors)**: BLACK color for text/borders

---

### Movement Rules (移動規則 - Army Chess / 軍棋 Style)

| Piece | Classic Movement | Three Kingdoms Movement | Blocking? | Change |
|-------|------------------|-------------------------|-----------|--------|
| General (帥/將) | 1 step orthogonal | **Infinite rail** (like Rook, along straight lines) | ✅ YES (blocked by obstacles) | ⭐ MAJOR |
| Soldier (兵/卒) | 1 step orthogonal | 1 step along grid lines | N/A | Same |
| Advisor (仕/士) | 1 step diagonal | 1 step diagonal along grid lines | N/A | Same |
| Minister (相/象) | 2 steps diagonal (BLOCKED by 象眼) | **2 steps diagonal (NOT blocked)** - Army Chess style | ❌ NO blocking | ⭐ CHANGED |
| Horse (傌/馬) | Knight L-shape (BLOCKED by 馬腳) | **Knight L-shape (NOT blocked)** - Army Chess style | ❌ NO blocking | ⭐ CHANGED |
| Rook (俥/車) | Infinite straight | **Infinite rail** along straight lines | ✅ YES (blocked by obstacles) | Same |
| Cannon (炮/包) | Move straight, jump to capture | **Rail movement**, jump exactly 1 piece to capture | ✅ YES (blocked, but jumps to capture) | Same |

**Critical Rules**:
- **"Army Chess" (軍棋) Style**: Ministers and Horses move **without blocking checks** (no 象眼/馬腳)
- **Rail Movement**: Generals, Rooks, Cannons slide along straight lines but **are blocked** by obstacles (cannot jump, except Cannon when capturing)
- **All movements** are along grid lines connecting adjacent intersection points

---

### Capture Rules (吃子規則)

**Classic Dark Chess**: Strict rank hierarchy (King > Guard > Minister > Rook > Horse > Cannon > Pawn)

**Three Kingdoms**: ⭐ **NO RANK HIERARCHY**
- ✅ **ANY piece can capture ANY opponent piece**
- ❌ **CANNOT capture same-team pieces**
- ✅ Cannon still requires jumping over exactly one piece to capture
- ❌ No King vs Pawn exception

---

### Victory Conditions (勝利條件)

**Elimination Victory**:
- Win by eliminating all pieces of the OTHER TWO teams
- If Team A has pieces and Teams B & C are eliminated → Team A wins

**Draw**:
- **60 consecutive moves without any capture** → Game ends in a draw
- Counter resets to 60 immediately when ANY capture occurs

**Stalemate**:
- If a player has no legal moves → that player is eliminated (removed from turn rotation)

---

## Open Questions

### ✅ RESOLVED: Board Topology (Decision Made)
- **Decision**: 5x9 grid (45 intersection points)
- Board array size: 45 positions (32 pieces + 13 empty)
- Pieces occupy intersections, not grid cells

### ✅ RESOLVED: Team Color Identification (Decision Made)
- **Decision**: Team 1 uses **GREEN** color
- Team 2 uses RED color
- Team 3 uses BLACK color
- FactionColor type: 'green' | 'red' | 'black'

### ✅ RESOLVED: Eliminated Player Behavior (Decision Made)
- **Decision**: Eliminated players are **immediately removed from turn rotation**
- Turn sequence automatically skips eliminated players
- UI shows eliminated teams as grayed out or marked "Eliminated"

### ⚠️ NEEDS CLARIFICATION: Alliance System (Deferred)
- v1.1: No formal alliances (every faction for themselves)
- v1.2+: Add alliance mechanics?
- **Decision**: [DEFERRED to v1.2 - out of scope for MVP]

### ⚠️ NEEDS CLARIFICATION: Recover Army Rule (Deferred)
- Advanced rule: If all Team 1 Generals are captured, Team 2 or 3 can "recover" them
- **Decision**: [DEFER to v1.2 - too complex for MVP]

---

## Dependencies

**Blocking Dependencies** (MUST resolve before implementation):
- 001-banqi-game-rules (COMPLETE) - provides foundation
- Architecture refactoring (RuleSet abstraction) - MUST design first

**Technical Dependencies**:
- React Native: ^0.74.x
- Zustand: ^4.5.x
- Jest: ^29.x
- TypeScript: ^5.3.x

---

## Out of Scope (v1.1)

- ❌ AI opponent for Three Kingdoms (defer to 004-ai-opponent)
- ❌ Online multiplayer (defer to 010-online-multiplayer)
- ❌ Alliance system (defer to v1.2)
- ❌ Recover Army rule (defer to v1.2)
- ❌ Animated piece movement (defer to 005-animations)
- ❌ Sound effects (defer to 006-sound-effects)

---

## Assumptions

1. **Portrait Orientation**: Three Kingdoms mode locks screen to Portrait (5 columns × 9 rows aligned with phone's long edge)
2. **Four Corners Layout**: Initial board setup uses deterministic "Four Corners" (四角) pattern (4 blocks of 2×4 pieces), NOT random scatter
3. **Dynamic Faction Assignment**: Players are NOT pre-assigned factions; they receive factions based on their **first flipped piece** (First Flip Rule)
4. **Army Chess Mechanics**: Ministers and Horses move **without blocking** (no 象眼/馬腳 checks), following "Army Chess" (軍棋) style
5. **Board Rendering**: We will render grid lines (horizontal/vertical) with pieces positioned at **intersection points**, visually resembling a Go board or Junqi board
6. **Empty Intersection Display**: 13 central empty intersections (forming a "cross" aisle) will be marked with subtle dots
7. **Draw Counter Persistence**: Draw counter is not persisted across app restarts (resets on new match)
8. **Color Accessibility**: GREEN/RED/BLACK colors are chosen for sufficient contrast and color-blind accessibility
9. **Turn Indicators**: Before faction assignment, display "Player 1/2/3's Turn"; after assignment, display faction color with name
10. **SafeAreaView**: UI will use SafeAreaView to handle notches and dynamically scale to fit screen without scrolling

---

## Next Steps

1. ✅ Create this specification (DONE)
2. ✅ Incorporate 3 critical decisions (DONE)
3. 🔜 Run `/speckit.plan` to generate technical design
4. 🔜 Design RuleSet abstraction architecture
5. 🔜 Create data model for GameMode, Faction, and refactored Match
6. 🔜 Generate implementation tasks with `/speckit.tasks`
7. 🔜 Begin TDD implementation following Clean Architecture

---

**Status**: Ready for technical planning  
**Last Updated**: 2026-01-22  
**Approved By**: Strategic Pivot (ROADMAP.md) + Critical User Decisions
