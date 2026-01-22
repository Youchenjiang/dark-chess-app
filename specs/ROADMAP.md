# Dark Chess Variants Platform - Product Roadmap

**Project**: Dark Chess Variants Platform (暗棋變體平台)  
**Platform**: React Native + Expo (iOS/Android)  
**Created**: 2026-01-21  
**Last Updated**: 2026-01-22  
**Status**: Strategic Pivot Complete

---

## 🎯 Vision Statement (REVISED)

**Build a comprehensive Dark Chess VARIANTS platform** featuring multiple game modes:
- **Classic Dark Chess** (經典暗棋) - 2 players, traditional rules
- **Three Kingdoms Dark Chess** (三國暗棋) - 3 players, alliance-based gameplay ⭐ **CORE DIFFERENTIATOR**
- **Army Chess / Junqi** (軍棋) - Future variant
- Single-player AI (mode-specific)
- Online multiplayer (deprioritized for now)

**Key Pivot**: We are NOT just a "Classic Dark Chess" game. We are a **Dark Chess Variants Platform** with Three Kingdoms mode as our primary competitive advantage.

---

## 📋 Feature Overview (REVISED STRATEGY)

### ✅ Phase 1: Foundation (COMPLETE)
**001-banqi-game-rules** - Classic Dark Chess (2-player)  
**Status**: ✅ Complete (v1.0.0)  
**Priority**: P0 (Must Have)  
**Deliverables**: 
- 8x4 board, classic piece hierarchy
- King vs Pawn exception, Cannon jump capture
- Local 2-player gameplay
- Traditional Chinese UI with wooden aesthetic

---

### 🌟 Phase 2: Core Differentiator (HIGHEST PRIORITY)
**002-three-kingdoms-dark-chess** - 三國暗棋 (3-player variant) ⭐  
**Status**: 📋 **NEXT PRIORITY**  
**Priority**: P0 (Critical - Market Differentiator)  
**Dependencies**: 001 (refactor to support multiple rule sets)

**Why This is Critical**:
- ✅ Unique selling proposition (no other mobile apps have this)
- ✅ 3-player mechanics create deeper strategy
- ✅ Appeals to Chinese market (三國 cultural theme)
- ✅ Foundation for variant platform architecture

**Key Technical Changes**:
- Refactor GameEngine to support pluggable rule systems
- Abstract board topology (intersections vs cells)
- Support 3-faction gameplay
- Remove hardcoded rank hierarchy assumptions

**Deliverables**:
- 3-player local multiplayer
- Intersection-based board topology
- Three Kingdoms piece distribution (3 teams: 12+10+10 pieces)
- Alliance/elimination victory conditions
- Mode selector UI (Classic vs Three Kingdoms)

---

### 🎮 Phase 3: Army Chess Variant (Optional)
**003-army-chess-junqi** - 軍棋 / Luzhanqi  
**Status**: 💡 Future Idea  
**Priority**: P2 (Medium)  
**Dependencies**: 002 (variant architecture established)

**Rationale**: Third major variant completes the "Dark Chess Variants Platform" positioning.

---

### 🤖 Phase 4: AI Opponents (Mode-Specific)
**004-ai-opponent** - Single-player AI (per variant)  
**Status**: 📋 Planned  
**Priority**: P1 (High, but AFTER Three Kingdoms)  
**Dependencies**: 002 (AI must understand all rule sets)

**Deliverables**:
- AI for Classic mode (2-player)
- AI for Three Kingdoms mode (3-player, alliance logic)
- Difficulty levels (Easy, Medium, Hard)
- Local storage for AI settings

---

### 🎨 Phase 5: UX Enhancements
**005-animations** - Movement and capture animations  
**Status**: 📋 Planned  
**Priority**: P2 (Medium)  
**Dependencies**: 002

**006-sound-effects** - Audio feedback  
**Status**: 📋 Planned  
**Priority**: P3 (Low)  
**Dependencies**: 002

**007-themes** - Visual themes (boards, pieces)  
**Status**: 📋 Planned  
**Priority**: P3 (Low)  
**Dependencies**: 002

---

### 📊 Phase 6: Analytics & History
**008-game-history** - Match replay and history  
**Status**: 📋 Planned  
**Priority**: P2 (Medium)  
**Dependencies**: 002 (must support all variants)

**009-statistics** - Player stats per variant  
**Status**: 📋 Planned  
**Priority**: P2 (Medium)  
**Dependencies**: 008

---

### 🌐 Phase 7: Online Features (DEPRIORITIZED)
**010-online-multiplayer** - Real-time online matches  
**Status**: 📋 Deferred  
**Priority**: P2 (Medium, not immediate)  
**Dependencies**: 002, 004 (local experience must be solid first)

**Rationale for Deprioritization**:
- Requires significant backend infrastructure
- Local multiplayer + AI provide value without server costs
- Focus on unique variants first, then add online

**011-leaderboards** - Global rankings  
**Status**: 💡 Future  
**Priority**: P3 (Low)  
**Dependencies**: 010

---

### ❌ Removed Features
- ~~009-challenges~~ (merged into future roadmap)
- ~~008-leaderboards~~ (renumbered to 011, deprioritized)

---

## 🚀 NEW Implementation Order (Post-Pivot)

### Sprint 1: Three Kingdoms Mode (v1.1.0 - CRITICAL)
**Timeline**: 5-7 days  
**Priority**: P0 (Market Differentiator)

1. **002-three-kingdoms-dark-chess** (5-7 days)
   - **Why FIRST**: This is our competitive advantage
   - Refactor architecture to support multiple rule sets
   - Implement 3-player logic and intersection-based board
   - Create mode selector UI
   - **Deliverable**: Users can switch between Classic and Three Kingdoms modes

**Success Criteria**:
- ✅ 3-player local multiplayer working
- ✅ All Three Kingdoms rules implemented correctly
- ✅ Clean architecture supporting future variants
- ✅ Mode selector with clear UX

---

### Sprint 2: Army Chess (Optional) (v1.2.0)
**Timeline**: 4-5 days  
**Priority**: P2 (Optional, strengthens platform positioning)

2. **003-army-chess-junqi** (4-5 days)
   - **Why**: Completes "variant platform" story
   - Demonstrates scalability of architecture
   - Appeals to broader Chinese market
   - **Deliverable**: Third variant mode available

---

### Sprint 3: AI Opponents (v2.0.0)
**Timeline**: 6-8 days  
**Priority**: P1 (Essential for retention, but AFTER variants)

3. **004-ai-opponent** (6-8 days)
   - **Why**: Single-player is essential, but variants come first
   - AI must understand all rule sets (Classic + Three Kingdoms)
   - More complex with 3-player logic
   - **Deliverable**: AI opponents for all available modes

---

### Sprint 4: Polish & Engagement (v2.1.0)
**Timeline**: 5-6 days  
**Priority**: P2 (Improve UX after core features)

4. **005-animations** (2 days)
   - Movement and capture animations
   - Piece flip animations
   - Victory celebration

5. **008-game-history** (2-3 days)
   - Match replay (all variants)
   - Move history
   - Save/load games

6. **006-sound-effects** (1-2 days)
   - Piece movement sounds
   - Capture sounds
   - Victory/defeat sounds

---

### Sprint 5: Analytics (v2.2.0)
**Timeline**: 3-4 days  
**Priority**: P2

7. **009-statistics** (3-4 days)
   - Win/loss per variant
   - Favorite modes
   - Play time tracking

---

### Sprint 6: Advanced Features (v3.0.0+)
**Timeline**: TBD  
**Priority**: P2-P3 (Future)

8. **010-online-multiplayer** (7-10 days, backend required)
9. **011-leaderboards** (3-4 days, depends on 010)
10. **007-themes** (2-3 days, customization)

---

## 📊 Feature Comparison Matrix (REVISED)

| Feature | Priority | Effort | Impact | Dependencies | Market Differentiator | User Value |
|---------|----------|--------|--------|--------------|----------------------|------------|
| 001 Classic Mode | P0 | High | Critical | None | ❌ Commodity | ⭐⭐⭐⭐ |
| **002 Three Kingdoms** | **P0** | **High** | **Critical** | 001 | **✅ UNIQUE** | **⭐⭐⭐⭐⭐** |
| 003 Army Chess | P2 | Medium | High | 002 | ✅ Rare | ⭐⭐⭐⭐ |
| 004 AI Opponent | P1 | Medium-High | High | 002 | ❌ Common | ⭐⭐⭐⭐⭐ |
| 005 Animations | P2 | Low | Medium | 002 | ❌ Common | ⭐⭐⭐ |
| 006 Sound | P3 | Low | Low | 002 | ❌ Common | ⭐⭐ |
| 007 Themes | P3 | Medium | Low | 002 | ❌ Common | ⭐⭐ |
| 008 History | P2 | Low | Medium | 002 | ❌ Common | ⭐⭐⭐⭐ |
| 009 Statistics | P2 | Medium | Medium | 008 | ❌ Common | ⭐⭐⭐ |
| 010 Online MP | P2 | High | High | 002, 004 | ❌ Common | ⭐⭐⭐⭐ |
| 011 Leaderboards | P3 | Medium | Medium | 010 | ❌ Common | ⭐⭐⭐ |

**Key Insight**: Three Kingdoms mode is the ONLY unique feature. Everything else is a commodity that other apps already have.

**Priority Legend**:
- P0: Must Have (blocking release)
- P1: High (essential for success)
- P2: Medium (valuable for retention)
- P3: Low (nice to have)

**Effort Legend**:
- Low: 1-2 days
- Medium: 2-4 days
- High: 5+ days

---

## 🎯 Milestone Goals (POST-PIVOT)

### v1.0.0 - Classic Mode ✅ COMPLETE
- [x] Classic Dark Chess rules
- [x] Local 2-player
- [x] 8x4 board, piece hierarchy
- [x] Traditional Chinese UI with wooden aesthetic
- [x] Toast error notifications
- [x] 100% test coverage

---

### v1.1.0 - Three Kingdoms Mode (CRITICAL MILESTONE) 🌟
**Target**: Sprint 1 (5-7 days)  
**Status**: 📋 Next Priority

- [ ] **Three Kingdoms Dark Chess** (3-player variant)
  - [ ] 3-faction gameplay (Team A/B/C)
  - [ ] Intersection-based board topology (authentic rules)
  - [ ] Piece distribution: 12+10+10 pieces (3 teams)
  - [ ] No rank hierarchy (any piece eats any piece)
  - [ ] New movement rules (King=Rook, Minister jumps, etc.)
  - [ ] Elimination victory condition
- [ ] **Architecture Refactor**
  - [ ] Abstract `GameEngine` to support pluggable rules
  - [ ] Create `ClassicRules` and `ThreeKingdomsRules` classes
  - [ ] Refactor `BoardView` for different board layouts
  - [ ] Remove hardcoded rank assumptions
- [ ] **UI Updates**
  - [ ] Mode selector (Classic vs Three Kingdoms)
  - [ ] 3-player UI layout
  - [ ] Faction indicators (Team A/B/C)
  - [ ] Intersection-based cell rendering

**Success Criteria**:
- ✅ Users can switch between Classic and Three Kingdoms modes
- ✅ 3-player local multiplayer fully functional
- ✅ All Three Kingdoms rules correctly implemented
- ✅ Architecture supports future variants without major refactoring

---

### v1.2.0 - Army Chess (Optional)
**Target**: Sprint 2 (4-5 days)  
**Status**: 💡 Optional (if Three Kingdoms successful)

- [ ] Army Chess / Junqi variant
- [ ] Demonstrates variant platform scalability
- [ ] Third mode selector option

---

### v2.0.0 - AI Opponents
**Target**: Sprint 3 (6-8 days)  
**Status**: 📋 High Priority (AFTER variants)

- [ ] AI for Classic mode (2-player)
- [ ] AI for Three Kingdoms mode (3-player, alliance logic)
- [ ] Difficulty levels (Easy, Medium, Hard)
- [ ] AI strategy per rule set

---

### v2.1.0 - Polish & Engagement
**Target**: Sprint 4 (5-6 days)

- [ ] Movement animations (React Native Reanimated)
- [ ] Game history and replay
- [ ] Sound effects
- [ ] Better visual feedback

---

### v2.2.0 - Analytics
**Target**: Sprint 5 (3-4 days)

- [ ] Statistics per variant
- [ ] Win/loss tracking
- [ ] Favorite modes
- [ ] Play time analytics

---

### v3.0.0+ - Online & Advanced (Future)
**Target**: TBD (Deferred)

- [ ] Online multiplayer (requires backend)
- [ ] Leaderboards
- [ ] Custom themes
- [ ] Social features

---

## 🔧 Technical Considerations

### Backend Requirements (DEFERRED)
- **010-online-multiplayer**: Firebase/Supabase for real-time sync
- **011-leaderboards**: Database for scores and rankings

### State Management
- **Current**: Zustand (local state)
- **Future**: Zustand + variant-specific stores

### Data Persistence
- **004-ai-opponent**: Local storage for AI settings
- **008-game-history**: AsyncStorage or SQLite (per variant)
- **009-statistics**: Aggregated local data per mode

### Performance
- **005-animations**: React Native Reanimated 2
- **002-three-kingdoms**: Optimize for 3-player rendering

---

## 💡 Strategic Decision: Why Three Kingdoms FIRST?

### ❌ OLD Strategy (REJECTED): AI/Online First
```
001 Classic → 002 AI → 003 Online → ...
```

**Why this is WRONG**:
- ❌ AI and Online are **commodity features** (every chess app has them)
- ❌ No differentiation from competitors
- ❌ Classic Dark Chess alone is not unique
- ❌ Hard to market ("another Dark Chess app")

---

### ✅ NEW Strategy (APPROVED): Variants First
```
001 Classic → 002 Three Kingdoms → 003 Army Chess → 004 AI → ...
```

**Why this is CORRECT**:
1. ✅ **Unique Selling Proposition**: Three Kingdoms mode is RARE/UNIQUE
2. ✅ **Market Differentiation**: "The ONLY mobile Dark Chess Variants Platform"
3. ✅ **Cultural Appeal**: 三國 theme resonates with Chinese market
4. ✅ **Technical Foundation**: Refactoring now prevents major rewrites later
5. ✅ **Product Positioning**: Platform vs single-game app

---

### Competitive Analysis

| Feature | Our App | Competitor A | Competitor B | Competitor C |
|---------|---------|--------------|--------------|--------------|
| Classic Dark Chess | ✅ | ✅ | ✅ | ✅ |
| **Three Kingdoms Mode** | **✅ UNIQUE** | ❌ | ❌ | ❌ |
| Army Chess | 🔜 | ❌ | ⚠️ Rare | ❌ |
| AI Opponent | 🔜 | ✅ | ✅ | ✅ |
| Online Multiplayer | 🔜 | ✅ | ✅ | ✅ |

**Insight**: Three Kingdoms is our ONLY differentiator. Build it FIRST.

---

### Marketing Angle

**OLD Pitch** (WEAK):
> "Play Classic Dark Chess on your phone with AI and friends"

**NEW Pitch** (STRONG):
> "The First Dark Chess Variants Platform: Play Classic, Three Kingdoms, and Army Chess modes. 2-player or 3-player alliance battles!"

---

### Risk Mitigation

**Risk**: "What if Three Kingdoms is too complex?"
- **Mitigation**: Keep Classic mode available. Power users get variants, casual users stay on Classic.

**Risk**: "What if users don't like 3-player?"
- **Mitigation**: Analytics will tell us. If adoption is low, deprioritize Army Chess and focus on polish.

**Risk**: "Refactoring delays everything"
- **Mitigation**: Do it now while codebase is small. Refactoring after AI/Online would be 10x harder.

---

## 📅 Estimated Timeline (POST-PIVOT)

| Phase | Duration | Target Release | Priority |
|-------|----------|----------------|----------|
| v1.0.0 (Complete) | 1 day | ✅ 2026-01-21 | P0 |
| **v1.1.0 (Three Kingdoms)** | **5-7 days** | **2026-01-28** | **P0 🌟** |
| v1.2.0 (Army Chess) | 4-5 days | 2026-02-02 | P2 (Optional) |
| v2.0.0 (AI for all modes) | 6-8 days | 2026-02-10 | P1 |
| v2.1.0 (Polish + History) | 5-6 days | 2026-02-16 | P2 |
| v2.2.0 (Analytics) | 3-4 days | 2026-02-20 | P2 |
| v3.0.0+ (Online) | 7-10 days | TBD | P2 (Deferred) |

**Critical Path**: v1.0 → **v1.1 (Three Kingdoms)** → v2.0 (AI)  
**Total Time to Market Differentiator**: 5-7 days from now

---

## 📖 Three Kingdoms Dark Chess Rules (三國暗棋)

### Overview
**Players**: 3 players (or 2 players controlling multiple factions)  
**Board**: Intersection-based (corners of 4x8 grid = 32 intersection points)  
**Pieces**: 32 total (distributed among 3 teams)

---

### Team Distribution

| Team | Pieces | Count | Total |
|------|--------|-------|-------|
| **Team 1: The General's Army** (將軍軍) | 帥 (Shuai/General Red) | 1 | 12 |
| | 將 (Jiang/General Black) | 1 | |
| | 兵 (Bing/Red Soldier) | 5 | |
| | 卒 (Zu/Black Soldier) | 5 | |
| **Team 2: Red Advisors** (紅方輔臣) | 仕 (Red Advisor) | 2 | 10 |
| | 相 (Red Minister) | 2 | |
| | 俥 (Red Rook) | 2 | |
| | 傌 (Red Horse) | 2 | |
| | 炮 (Red Cannon) | 2 | |
| **Team 3: Black Advisors** (黑方輔臣) | 士 (Black Advisor) | 2 | 10 |
| | 象 (Black Minister) | 2 | |
| | 車 (Black Rook) | 2 | |
| | 馬 (Black Horse) | 2 | |
| | 包 (Black Cannon) | 2 | |

---

### Setup
1. All 32 pieces placed **face-down** on intersection points
2. Pieces are **randomly shuffled** before placement
3. First player flips any piece to start

---

### Movement Rules (KEY CHANGES FROM CLASSIC)

| Piece | Classic Movement | Three Kingdoms Movement |
|-------|------------------|-------------------------|
| **General** (帥/將) | 1 step orthogonal | ⭐ **Infinite straight** (like Rook) |
| **Soldier** (兵/卒) | 1 step orthogonal | ✅ Same: 1 step straight |
| **Advisor** (仕/士) | 1 step diagonal | ✅ Same: 1 step diagonal |
| **Minister** (相/象) | 2 steps diagonal (blocked) | ⭐ **Field jump** (田字, NOT blocked) |
| **Horse** (傌/馬) | Knight L-shape (blocked) | ⭐ **Knight L-shape** (NOT blocked) |
| **Rook** (俥/車) | Infinite straight | ✅ Same: Infinite straight |
| **Cannon** (炮/包) | Jump 1 to capture | ✅ Same: Jump 1 to capture |

---

### Capture Rules (CRITICAL DIFFERENCE)

**Classic Dark Chess**: Strict rank hierarchy (King > Guard > Minister > Rook > Horse > Cannon > Pawn)

**Three Kingdoms**: ⭐ **NO RANK HIERARCHY**
- ✅ **Any piece can capture any piece** (except same team)
- ✅ Soldiers can eat Generals
- ✅ Advisors can eat Rooks
- ✅ No special King vs Pawn rule

**Exception**: Pieces CANNOT capture their own team members.

---

### Turn Order
1. **Turn sequence**: Player A → Player B → Player C → Player A ...
2. Each player controls one team
3. Players can **only move/capture pieces of their own team**

---

### Winning Conditions

**Elimination Victory**:
- Win by **eliminating all pieces of the other TWO teams**
- If Team A has pieces remaining and Teams B & C are eliminated → Team A wins

**Alliance Dynamics** (Advanced):
- Players can form temporary alliances (verbal agreement)
- No formal alliance mechanics in v1.1 (keep simple)

---

### Example Scenario

```
Setup: 32 pieces face-down on intersections

Turn 1 (Player A): Flips piece at position 5 → reveals 帥 (Red General, Team 1)
Turn 2 (Player B): Flips piece at position 12 → reveals 俥 (Red Rook, Team 2)
Turn 3 (Player C): Flips piece at position 20 → reveals 車 (Black Rook, Team 3)

Turn 4 (Player A): Moves 帥 from position 5 to position 9 (straight line)
Turn 5 (Player B): Player B's 俥 at position 12 captures Player C's piece at position 13
Turn 6 (Player C): ...

Game continues until only one team has pieces remaining.
```

---

### Key Design Challenges for 002

1. **Board Topology**:
   - Classic: 8x4 grid cells (32 cells)
   - Three Kingdoms: Should use intersection points (corners of grid)
   - **Decision**: Use same 8x4 grid, but interpret positions as intersections?

2. **3-Player UI**:
   - How to display 3 players' info on mobile screen?
   - Turn indicator for 3 players?
   - Faction colors (Team 1: Purple? Team 2: Red, Team 3: Black?)

3. **Piece Identification**:
   - 帥 and 將 both belong to Team 1 (not opposing teams)
   - Need clear visual distinction for 3 teams

4. **AI Complexity**:
   - 3-player FFA (Free-For-All) AI is significantly harder than 2-player
   - Need to defer AI until 004, focus on local multiplayer first

---

## 🎬 Immediate Next Steps

### ✅ Decision Made: Three Kingdoms First

1. ✅ **Strategic Pivot Complete**: From "Classic Game" to "Variants Platform"
2. ✅ **Roadmap Updated**: Three Kingdoms is now 002 (P0 priority)
3. 🔜 **Create Spec for 002**: Three Kingdoms Dark Chess detailed specification
4. 🔜 **Architecture Planning**: Design pluggable rule system
5. 🔜 **Begin Implementation**: Following `/speckit` workflow

---

## 📝 Technical Debt & Refactoring

### Required for 002 (Three Kingdoms):

**1. GameEngine Refactoring**:
```
Current: Hardcoded Classic rules in GameEngine.ts
Target:  Abstract RuleSet interface with ClassicRules and ThreeKingdomsRules
```

**2. Board Topology**:
```
Current: Grid cells (8x4 squares)
Target:  Support intersection-based placement OR adapt grid to simulate intersections
```

**3. Player Logic**:
```
Current: 2 players (red/black)
Target:  Support 2-N players with configurable factions
```

**4. Win Conditions**:
```
Current: Eliminate all opponent pieces OR stalemate
Target:  Pluggable win condition system (elimination, alliance, scoring, etc.)
```

**5. UI Abstraction**:
```
Current: BoardView assumes 8x4 grid
Target:  BoardView adapts to different board sizes and topologies
```

---

## ❓ Key Questions for 002 Spec

These will be addressed in `/speckit.specify`:

1. **Board Topology**: Intersections (authentic) vs Grid (simpler MVP)?
2. **Alliance System**: Fixed teams or dynamic alliances?
3. **Piece Distribution**: Method 1 (balanced 12+10+10) or Method 2 (random)?
4. **"Recover Army" Rule**: Include in MVP or defer to v1.2?
5. **UI Layout**: How to display 3 players' info on mobile screen?

---

## 🎯 Success Metrics for 002

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Mode Adoption | >40% users try Three Kingdoms | Analytics: mode_selected event |
| 3-Player Engagement | Avg 5+ games per user | Analytics: game_completed event |
| Architecture Quality | Zero breaking changes for 003 | Code review: clean abstraction |
| Test Coverage | 100% for ThreeKingdomsRules | Jest coverage report |
| Performance | No lag with 3 players | Manual testing on low-end devices |

---

## 📚 References for 002

- **Three Kingdoms Dark Chess Rules**: [Provided in user input]
- **Board Topology Research**: Intersection-based placement (Go/Xiangqi style)
- **3-Player Game Design**: Alliance mechanics, balance considerations
- **Clean Architecture**: Pluggable rule systems, strategy pattern

---

## 📝 Notes

- **Strategic Clarity**: Three Kingdoms mode is our market differentiator
- **Technical Discipline**: Refactor now, avoid technical debt later
- **User Validation**: Ship quickly, measure engagement, iterate
- **Maintain Quality**: 100% test coverage, Clean Architecture principles

**Last Updated**: 2026-01-22  
**Status**: ✅ Strategic pivot complete, ready for 002 spec creation  
**Next Command**: `/speckit.specify` for 002-three-kingdoms-dark-chess
