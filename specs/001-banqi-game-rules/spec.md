# Feature Specification: Classic Dark Chess (Banqi) Core Gameplay Rules

**Feature Branch**: `001-banqi-game-rules`  
**Created**: 2026-01-21  
**Status**: Draft  
**Input**: User description: "Define the complete ruleset for Classic Dark Chess (Banqi): pieces, setup, turn
actions (flip/move/capture), critical capture logic (rank hierarchy, King vs Pawn, Cannon jump capture), and
winning conditions (capture all pieces or stalemate)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a New Match (Priority: P1)

As a player, I want to start a new Banqi match with a random face-down setup so that each match is fair and
unpredictable.

**Why this priority**: Without correct setup and side assignment, the rest of gameplay cannot proceed.

**Independent Test**: A match can be verified by starting a new game, confirming the board is 4x8 with 32
face-down pieces, and flipping the first piece to assign the first player’s side.

**Acceptance Scenarios**:

1. **Given** a new match is created, **When** the board is initialized, **Then** the board is a 4x8 grid
   containing 32 face-down pieces placed randomly (no empty squares).
2. **Given** it is the very first turn and no side is assigned, **When** the first player flips one
   face-down piece, **Then** that piece becomes revealed and the flipped piece’s color becomes the first
   player’s side (the opponent becomes the other side).
3. **Given** the first flip assigned sides, **When** the turn ends, **Then** the next player takes their
   turn with the assigned sides preserved.

---

### User Story 2 - Play Turns (Flip, Move, Capture) (Priority: P2)

As a player, I want to take turns performing valid actions (flip, move, capture) so that the game is
playable end-to-end under the official rules.

**Why this priority**: This is the core gameplay loop.

**Independent Test**: From an in-progress match, a tester can alternate turns and verify that:
flip reveals, move follows adjacency rules, and capture follows rank/cannon rules; illegal actions are
rejected without changing the board.

**Acceptance Scenarios**:

1. **Given** it is a player’s turn and there exists at least one face-down piece, **When** the player
   chooses Flip and selects a face-down piece, **Then** that piece becomes revealed and the turn ends.
2. **Given** it is a player’s turn and they select a face-up piece they control, **When** they choose Move
   to an orthogonally adjacent empty square, **Then** the piece moves exactly 1 step and the turn ends.
3. **Given** a player selects a face-up piece they control and an orthogonally adjacent square contains an
   opponent face-up piece, **When** they choose Capture, **Then** the capture is allowed only if it follows
   the capture rules (including special King/Pawn and Cannon rules); if allowed, the target is removed and
   the attacker occupies the target square.
4. **Given** a player attempts an illegal flip/move/capture, **When** the action is confirmed, **Then** the
   action is rejected and the board state remains unchanged.

---

### User Story 3 - Determine Game End (Win / Stalemate) (Priority: P3)

As a player, I want the game to correctly detect victory conditions so that the match ends fairly and
clearly.

**Why this priority**: A match must have a definitive and correct ending.

**Independent Test**: Force situations where one side has no pieces or no legal moves, and verify the
winner is declared and no further actions are allowed.

**Acceptance Scenarios**:

1. **Given** one player has captured all opponent pieces, **When** the capture is completed, **Then** the
   capturing player wins immediately and the match ends.
2. **Given** it is a player’s turn and they have no legal moves available, **When** the game evaluates
   legal moves, **Then** the opponent wins by stalemate and the match ends.
3. **Given** the match has ended, **When** any player attempts to flip/move/capture, **Then** the action is
   rejected and the final state remains unchanged.

---

### Edge Cases

- What happens when the first few flips reveal only one color repeatedly (side assignment remains based on
  the first flipped piece only)?
- What happens when a player attempts to move onto a square occupied by their own piece (must be rejected)?
- What happens when a player attempts to capture a face-down piece (must be rejected; capture requires the
  target to be revealed)?
- What happens when a player attempts a non-adjacent move or capture (must be rejected)?
- What happens when a Cannon has 0 screens or 2+ screens between it and the target (Cannon capture must be
  rejected)?
- What happens when a Cannon attempts to capture by moving 1 step directly onto an adjacent enemy piece
  (must be rejected)?
- What happens when a King attempts to capture a Pawn (must be rejected), and when a Pawn captures a King
  (must be allowed)?
- What happens when all pieces are revealed (Flip is no longer available; the player must Move/Capture if
  possible, otherwise stalemate applies)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST use a 4x8 grid board.
- **FR-002**: The game MUST include 32 pieces total (16 Red, 16 Black) using half of a Chinese Chess set.
- **FR-003**: At match start, all 32 pieces MUST be shuffled and placed face-down randomly on the board.
- **FR-004**: The first player’s first action MUST be a Flip, and the flipped piece’s color MUST assign
  the first player’s side (the opponent becomes the other side).
- **FR-005**: On each turn, a player MUST be able to choose exactly one action: Flip OR Move OR Capture.
- **FR-006**: Flip MUST reveal a selected face-down piece and end the turn.
- **FR-007**: Move MUST allow a face-up piece to move exactly 1 step orthogonally to an empty adjacent
  square.
- **FR-008**: Standard Capture MUST allow a face-up piece to capture an orthogonally adjacent opponent
  face-up piece only when the attacker’s rank is equal to or higher than the target’s rank.
- **FR-009**: King vs Pawn rule MUST apply:
  - A King MUST NOT be allowed to capture a Pawn.
  - A Pawn MUST be allowed to capture a King (when adjacent and capturing is chosen).
- **FR-010**: Cannon capture rule MUST apply:
  - A Cannon MUST NOT capture by moving 1 step directly onto an adjacent enemy piece.
  - A Cannon MUST be able to capture an opponent piece by jumping over exactly one intervening piece
    (“screen”) in a straight orthogonal line to a target beyond the screen.
  - Cannon capture MUST allow capturing a target of any rank as long as the screen rule is satisfied.
- **FR-011**: The game MUST prevent illegal actions (including illegal moves/captures) and MUST NOT change
  game state when an action is rejected.
- **FR-012**: The game MUST end when either:
  - One player has captured all opponent pieces, OR
  - The current player has no legal moves (stalemate), in which case the opponent wins.

### Piece Definitions (Reference)

- **King (將/帥)**: 1 each, Rank 7 (highest)
- **Guard (士/仕)**: 2 each, Rank 6
- **Minister (象/相)**: 2 each, Rank 5
- **Rook (車/俥)**: 2 each, Rank 4
- **Horse (馬/傌)**: 2 each, Rank 3
- **Cannon (包/炮)**: 2 each, Rank 2 (special capture rule)
- **Pawn (卒/兵)**: 5 each, Rank 1 (lowest; special King interaction)

### Assumptions

- Pieces must be revealed (face-up) to move or be captured.
- Players can only move/capture with pieces matching their assigned color.

### Out of Scope

- Online matchmaking, ranking, chat, or spectator mode.
- Timers, undo/redo, move history, or AI opponent.

### Key Entities *(include if feature involves data)*

- **Match**: Current game session, including status (in-progress/ended) and winner (if any).
- **Board**: A 4x8 grid of squares, each containing exactly one piece or being empty after captures.
- **Piece**: Attributes include color (Red/Black), type (King/Guard/Minister/Rook/Horse/Cannon/Pawn),
  rank, and visibility (face-down/face-up).
- **Player**: Represents a participant and their assigned side (Red or Black).
- **Action**: One of Flip, Move, or Capture (exactly one per turn).
- **Legal Move Set**: The collection of actions available for a player at a given state (used for stalemate).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can start a new match and perform the first flip to assign sides in under 30 seconds.
- **SC-002**: For a suite of acceptance scenarios covering all listed rules, 100% of scenarios produce the
  expected board state transitions (no incorrect legal/illegal decisions).
- **SC-003**: From any mid-game position, the game correctly rejects illegal actions without altering the
  board state in 100% of tested cases.
- **SC-004**: The game reliably detects both win-by-capture and win-by-stalemate in 100% of tested cases.
