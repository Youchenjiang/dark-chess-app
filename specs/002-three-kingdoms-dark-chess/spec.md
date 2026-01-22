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
- **45 intersection points** on a 5x9 grid (intersections of 4x8 grid lines)
- 13 empty intersection points (45 total - 32 pieces)
- Alliance-based gameplay with elimination victory
- No rank hierarchy (any piece captures any piece)
- Modified movement rules (Generals move like Rooks, Ministers jump freely)
- **Draw rule**: 60 consecutive moves without capture results in a draw

**Market Positioning**: This is our **unique selling proposition** - no other mobile Dark Chess app offers 3-player variants.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Between Classic and Three Kingdoms Modes (Priority: P1)

As a player, I want to **select between Classic (2-player) and Three Kingdoms (3-player) modes** so that I can choose my preferred game variant.

**Why this priority**: Mode selection is the entry point for all other Three Kingdoms features. Without it, users cannot access the new variant.

**Independent Test**: Can be tested by launching the app, accessing the mode selector UI, and verifying that selecting "Three Kingdoms" loads a 3-player game.

**Acceptance Scenarios**:

1. **Given** the app home screen, **When** I tap "Select Mode", **Then** I see options for "Classic Dark Chess (經典暗棋)" and "Three Kingdoms (三國暗棋)"
2. **Given** I selected "Three Kingdoms" mode, **When** the game starts, **Then** the board displays **32 face-down pieces on 45 intersection points** (5x9 grid) with 3-player turn indicators
3. **Given** I am in Three Kingdoms mode, **When** I view the board, **Then** I see **13 empty intersection points** clearly distinguished from occupied positions
4. **Given** I am in Three Kingdoms mode, **When** I return to home and select "Classic", **Then** the game switches to 2-player Classic rules with 8x4 grid cells

---

### User Story 2 - Play 3-Player Local Multiplayer (Priority: P1)

As a player, I want to **play Three Kingdoms Dark Chess with 2 other players locally** (pass-and-play), taking turns flipping, moving, and capturing pieces according to Three Kingdoms rules.

**Why this priority**: Core gameplay loop for Three Kingdoms. This is the heart of the feature.

**Independent Test**: Three players can complete a full game from setup to victory, with all rules enforced correctly.

**Acceptance Scenarios**:

1. **Given** a new Three Kingdoms match, **When** Player A flips the first piece, **Then** that piece is revealed, the draw counter is set to 60, and Player B takes the next turn
2. **Given** Player A controls a revealed Red Rook, **When** Player A moves it 3 steps straight along grid lines, **Then** the Rook moves successfully, the draw counter decrements by 1 (59 remaining), and Player B's turn begins
3. **Given** Player A's General is adjacent to Player B's Soldier along a grid line, **When** Player A captures with the General, **Then** the capture succeeds (no rank hierarchy), Player B's Soldier is eliminated, and the draw counter **resets to 60**
4. **Given** Player A's Cannon has exactly one piece between it and Player C's Horse along a straight line, **When** Player A uses Cannon to jump-capture, **Then** Player C's Horse is captured and the draw counter **resets to 60**
5. **Given** Player B has been eliminated, **When** Player A finishes their turn, **Then** the turn passes directly to Player C (Player B is **removed from turn rotation**)
6. **Given** 59 consecutive non-capture moves have occurred, **When** Player A makes a non-capture move, **Then** the draw counter reaches 0 and the game **ends immediately in a draw**
7. **Given** all of Team B and Team C pieces are eliminated, **When** only Team A has pieces remaining, **Then** Player A/Team A wins the game

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
- **FR-005**: Board MUST have **45 intersection points** arranged in a **5x9 grid** (5 points width × 9 points height = intersections of 4x8 grid lines)
- **FR-006**: System MUST place **32 pieces randomly** on these 45 intersections, leaving **13 empty spots**
- **FR-007**: System MUST shuffle pieces randomly before placement across all 45 positions
- **FR-008**: All 32 pieces MUST be placed face-down at game start
- **FR-009**: Empty intersection points MUST be visually distinguishable from occupied positions

**Three Kingdoms Players & Turns**:
- **FR-010**: System MUST support 3 players/factions (Team A, Team B, Team C)
- **FR-011**: System MUST rotate turns in sequence: Player A → Player B → Player C → Player A
- **FR-012**: When a player is eliminated, system MUST **immediately remove them from turn rotation** (e.g., A → C → A if B eliminated)
- **FR-013**: System MUST distribute pieces correctly: Team 1 (12 pieces), Team 2 (10 pieces), Team 3 (10 pieces)

**Draw Counter (Mandatory)**:
- **FR-014**: System MUST initialize a "moves without capture" counter to **60** at game start
- **FR-015**: System MUST decrement the counter by 1 after each non-capture move (flip or move)
- **FR-016**: System MUST **reset the counter to 60** immediately when ANY capture occurs
- **FR-017**: System MUST **end the game as a draw** when the counter reaches 0
- **FR-018**: UI MUST display the current counter value prominently (e.g., "Moves Until Draw: 45")

**Piece Movement (Three Kingdoms Specific)**:
- **FR-019**: Generals (帥/將) MUST move infinite steps along straight lines (like Rooks), NOT 1 step
- **FR-020**: Ministers (相/象) MUST jump 2 steps diagonally (田字 pattern) WITHOUT blocking checks
- **FR-021**: Horses (傌/馬) MUST move in Knight L-shape WITHOUT blocking checks
- **FR-022**: Soldiers, Advisors, Rooks, Cannons MUST move as in Classic rules
- **FR-023**: All pieces MUST move along grid lines between intersection points
- **FR-024**: Pieces CAN move to any empty intersection point (13 empty spots are valid destinations)

**Capture Rules (Three Kingdoms Specific)**:
- **FR-025**: System MUST allow ANY piece to capture ANY opponent piece (no rank hierarchy)
- **FR-026**: System MUST prevent pieces from capturing their own team members
- **FR-027**: Cannon MUST capture by jumping over exactly one piece (any team)
- **FR-028**: System MUST NOT apply King vs Pawn exception (does not exist in Three Kingdoms)

**Win Conditions**:
- **FR-029**: System MUST detect elimination victory: when a player's team is the ONLY team with pieces remaining
- **FR-030**: System MUST end the game when Teams B and C are eliminated, declaring Team A the winner
- **FR-031**: System MUST detect draw condition: when 60 consecutive moves pass without any capture
- **FR-032**: System MUST support stalemate detection: if a player has no legal moves, they are eliminated (removed from turn rotation)

**UI/UX**:
- **FR-033**: UI MUST display mode selector with "Classic (經典暗棋)" and "Three Kingdoms (三國暗棋)" options
- **FR-034**: UI MUST display 3-player turn indicator (e.g., "Team A's Turn", "Team B's Turn", "Team C's Turn") with team color
- **FR-035**: UI MUST use **GREEN (#4CAF50 or similar)** color for Team 1 (Generals' Army) pieces - text, borders, and backgrounds
- **FR-036**: UI MUST use **RED (#C62828 or similar)** color for Team 2 (Red Advisors) pieces
- **FR-037**: UI MUST use **BLACK (#1A1A1A or similar)** color for Team 3 (Black Advisors) pieces
- **FR-038**: UI MUST render board as 5x9 grid with 45 intersection points
- **FR-039**: UI MUST visually distinguish empty intersections from occupied ones (e.g., small dots or grid markers)
- **FR-040**: UI MUST display captured pieces per team (3 separate capture counts with team colors)
- **FR-041**: UI MUST display "Moves Until Draw" counter prominently (countdown from 60 to 0)
- **FR-042**: UI MUST update the draw counter in real-time after each move
- **FR-043**: UI MUST show eliminated teams as grayed out or removed from turn indicator

**Testing**:
- **FR-044**: Core Three Kingdoms logic MUST have 100% unit test coverage
- **FR-045**: Integration tests MUST verify 3-player turn rotation with elimination skipping
- **FR-046**: Integration tests MUST verify elimination victory condition
- **FR-047**: Integration tests MUST verify draw condition (60 moves without capture)
- **FR-048**: Integration tests MUST verify counter reset on capture

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
- How many total positions? → **45 intersection points** (5 width × 9 height)
- How many empty spots at start? → **13 empty spots** (45 - 32 pieces)
- Do pieces move on grid lines? → YES, pieces move along lines connecting intersections
- Can pieces occupy any of the 45 intersections? → YES, including the 13 empty spots

**3-Player Turn Logic**:
- What if Player B is eliminated mid-game? → Immediately skip their turn in rotation (A → C → A)
- What if Players B and C are both eliminated? → Game ends immediately, Player A wins
- What if only 1 active player remains mid-turn? → Current turn completes, then victory declared
- Are eliminated players visible in UI? → YES, shown as grayed out or marked "Eliminated"

**Draw Counter**:
- When does counter decrement? → After each non-capture move (flip without capture, move without capture)
- When does counter reset? → **Immediately to 60** when ANY capture occurs
- What if counter reaches 0? → Game **ends immediately in a draw**
- Does flipping a piece count as a move? → YES, decrements counter if no subsequent capture on that turn
- What if 60th move is a capture? → Counter resets to 60, game continues
- What if draw occurs with all 3 teams active? → Draw declared, no winner

**Piece Distribution**:
- What if shuffle places all Team A pieces together? → Accept it (random is random)
- What if Team 1's Generals (帥 and 將) are adjacent? → Valid, they belong to same team
- Can pieces be placed on any of the 45 intersections? → YES, random distribution across all 45

**Movement Edge Cases**:
- Can General move across entire board in one turn? → YES (infinite straight movement along grid lines)
- Can Minister jump over occupied intersections? → YES (no blocking in Three Kingdoms)
- Can Horse jump over pieces? → YES (no blocking in Three Kingdoms)
- Can pieces move to empty intersections? → YES, 13 empty spots are valid destinations
- Can pieces move diagonally across the grid? → Only Advisors and Ministers (based on piece rules)

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

**Three Kingdoms Dark Chess**:
- 4 horizontal lines × 8 vertical lines = **5×9 = 45 intersection points**
- Pieces occupy the **intersections** (corners where lines meet)
- 32 pieces placed randomly on 45 intersections
- **13 empty intersection points** remain at start
- Pieces move along grid lines between adjacent intersections

**Visual Representation**:
```
Classic (8x4 cells):          Three Kingdoms (5x9 intersections):
┌─┬─┬─┬─┐                     ●─●─●─●─●
├─┼─┼─┼─┤                     │ │ │ │ │
├─┼─┼─┼─┤                     ●─●─●─●─●
├─┼─┼─┼─┤                     │ │ │ │ │
├─┼─┼─┼─┤                     ●─●─●─●─●
├─┼─┼─┼─┤                     │ │ │ │ │
├─┼─┼─┼─┤                     ... (9 rows total)
├─┼─┼─┼─┤                     
└─┴─┴─┴─┘                     ● = intersection point (45 total)
32 cells                      32 pieces + 13 empty
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

### Movement Rules (移動規則)

| Piece | Classic Movement | Three Kingdoms Movement | Change |
|-------|------------------|-------------------------|--------|
| General (帥/將) | 1 step orthogonal | **Infinite straight along grid lines** (like Rook) | ⭐ MAJOR |
| Soldier (兵/卒) | 1 step orthogonal | 1 step along grid lines | Same |
| Advisor (仕/士) | 1 step diagonal | 1 step diagonal along grid lines | Same |
| Minister (相/象) | 2 steps diagonal (BLOCKED) | **2 steps diagonal (NOT blocked)** | ⭐ CHANGED |
| Horse (傌/馬) | Knight L-shape (BLOCKED) | **Knight L-shape (NOT blocked)** | ⭐ CHANGED |
| Rook (俥/車) | Infinite straight | Infinite straight along grid lines | Same |
| Cannon (炮/包) | Move straight, jump to capture | Move straight along grid lines, jump to capture | Same |

**Note**: All movements are along grid lines connecting intersection points.

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

1. **Board Rendering**: We will render a 5x9 grid visually, showing grid lines and intersection points clearly
2. **Empty Intersection Display**: Empty intersections will be marked with subtle dots or grid markers
3. **Draw Counter Persistence**: Draw counter is not persisted across app restarts (resets on new match)
4. **Color Accessibility**: GREEN/RED/BLACK colors are chosen for sufficient contrast and color-blind accessibility
5. **Turn Indicators**: Current turn will be displayed prominently with team color highlighting

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
