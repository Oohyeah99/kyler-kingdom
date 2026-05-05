# Spec: Pattern Phonics 5-Level Difficulty Progression

**Project:** Kyler Kingdom
**Workspace:** `D:\Projects\KylerKingdom\`
**Target file:** `public/pattern-phonics.html`
**Date:** 2026-05-05

---

## Objective

Expand the Pattern Phonics difficulty selector from 3 levels (Easy/Medium/Hard) to 5 levels (Easy/Medium/Hard/Expert/Master) with more granular progression.

---

## Changes Required

### 1. Update `PHONICS_DATA` object

Replace the current 3-level data structure with 5 levels. The Easy level stays exactly the same. Medium is split into two levels (basic blends + long vowels, then digraphs + r-controlled vowels). Hard is split into two levels (3-letter clusters + complex patterns, then rare patterns).

**Current (3 levels):**
```javascript
onsets: {
  easy: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','z'],
  medium: ['bl','br','cl','cr','dr','fl','fr','gl','gr','pl','pr','sc','sk','sl','sm','sn','sp','st','sw','tr','tw'],
  hard: ['ch','ph','qu','sh','th','wh','wr','scr','shr','spl','spr','squ','str','thr']
},
vowels: {
  easy: ['a','e','i','o','u'],
  medium: ['ai','ay','ee','ea','ie','oa','oo','ou','ow','ue','ar','er','ir','or','ur'],
  hard: ['air','are','ear','eer','igh','ire','oor','ore','oi','oy','aw','au','ew','ure']
},
codas: {
  easy: ['b','d','g','k','l','m','n','p','s','t','x'],
  medium: ['ch','ck','ff','ll','nd','ng','nk','nt','mp','sh','ss','th','lk','lt','lp','ft','sk','sp','st'],
  hard: ['dge','tch','nch','ght','lth','nce','nge','nse','rch','rse','rth','sce']
}
```

**New (5 levels):**
```javascript
onsets: {
  easy: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','z'],
  medium: ['bl','br','cl','cr','dr','fl','fr','gl','gr','pl','pr'],
  hard: ['sc','sk','sl','sm','sn','sp','st','sw','tr','tw','sh','th','ch','qu','wh'],
  expert: ['scr','shr','spl','spr','squ','str','thr','ph','wr'],
  master: []  // no master-only onsets
},
vowels: {
  easy: ['a','e','i','o','u'],
  medium: ['ai','ay','ee','ea','ie','oa','oo'],
  hard: ['ou','ow','ue','ar','er','ir','or','ur'],
  expert: ['air','ear','eer','igh','ire','ore','oi','oy','aw','au','ew'],
  master: ['are','oor','ure']
},
codas: {
  easy: ['b','d','g','k','l','m','n','p','s','t','x'],
  medium: ['ch','ck','ff','ll','nd','ng','nk','nt','mp'],
  hard: ['sh','ss','th','lk','lt','lp','ft','sk','sp','st'],
  expert: ['dge','tch','nch','ght','nce','nge','nse','rch','rth'],
  master: ['lth','rse','sce']
}
```

### 2. Update the difficulty pills UI

Change the pill buttons in the HTML from 3 to 5:

```html
<!-- Replace lines ~410-413 -->
<div class="pills" id="difficultyPills">
  <button class="pill active" data-level="easy" onclick="setDifficulty('easy')">Easy</button>
  <button class="pill" data-level="medium" onclick="setDifficulty('medium')">Medium</button>
  <button class="pill" data-level="hard" onclick="setDifficulty('hard')">Hard</button>
  <button class="pill" data-level="expert" onclick="setDifficulty('expert')">Expert</button>
  <button class="pill" data-level="master" onclick="setDifficulty('master')">Master</button>
</div>
```

**Note:** If 5 pills don't fit on narrow screens, consider making the pill container scrollable or reducing padding.

### 3. Update `getSoundsForLevel()` function

The current `getSoundsForLevel(type, level)` function cumulatively includes sounds from all easier levels. It needs to handle the new 5-level chain:

```javascript
function getSoundsForLevel(type, level) {
  const d = PHONICS_DATA[type];
  let s = [...d.easy];
  if (level === 'medium' || level === 'hard' || level === 'expert' || level === 'master')
    s = s.concat(d.medium);
  if (level === 'hard' || level === 'expert' || level === 'master')
    s = s.concat(d.hard);
  if (level === 'expert' || level === 'master')
    s = s.concat(d.expert);
  if (level === 'master')
    s = s.concat(d.master);
  return s;
}
```

This ensures that selecting "Expert" includes Easy + Medium + Hard + Expert sounds, and "Master" includes everything.

### 4. Handle localStorage migration

Users may have saved state with the old 3-level system. Update `loadState()` to handle the old difficulty values gracefully:

```javascript
// In loadState(), after parsing saved state:
// Map old difficulty names to new ones
if (state.difficulty === 'medium') state.difficulty = 'hard'; // old medium → new hard (closest match)
if (state.difficulty === 'hard') state.difficulty = 'expert'; // old hard → new expert
```

**Actually**, a better approach: keep the old names valid by having the mapping only for saved state, but let new users start at the correct new level. Or just reset saved difficulty to 'easy' if it's invalid:

```javascript
const validLevels = ['easy', 'medium', 'hard', 'expert', 'master'];
if (!validLevels.includes(state.difficulty)) state.difficulty = 'easy';
```

### 5. Consider CSS for 5 pills

With 5 pills, the header may get crowded on mobile. Check `@media (max-width: 640px)` styles. The current responsive CSS already handles the pills with `flex-wrap` and `order: 3` which moves them to a new row on small screens — this should still work.

---

## Summary of Sound Progression

| Level | Onset | Vowel | Coda |
|-------|-------|-------|------|
| **Easy** | Single consonants (b,c,d...) | Short vowels (a,e,i,o,u) | Single consonants (b,d,g...) |
| **Medium** | L/R blends (bl,br,cl,cr...) | Long vowels (ai,ee,oa,oo...) | Common endings (ch,ck,ng,nk...) |
| **Hard** | S blends (sn,sp,st...) + digraphs (sh,th,ch,qu...) | Other digraphs + r-controlled (ar,er,or,ur...) | Remaining 2-letter (sh,ss,sk,sp...) |
| **Expert** | 3-letter clusters (scr,spr,str...) + rare (ph,wr) | Complex (igh,ore,oy,aw,ew...) | 3-letter endings (dge,ght,nce...) |
| **Master** | — | Rare (are,oor,ure) | Rare (lth,rse,sce) |

---

## Files to Modify

| File | Changes |
|------|---------|
| `public/pattern-phonics.html` | Lines ~410 (pills), ~497-513 (PHONICS_DATA), ~568-574 (getSoundsForLevel), ~533 (loadState validation) |

---

## After Making Changes

1. Test locally: `npm run dev` and open `http://localhost:5173/pattern-phonics.html`
2. Verify all 5 levels show in the pills
3. Verify each level produces appropriate words (e.g., Easy should give simple words like "bat", Master should give complex words)
4. Commit, push, and deploy:
   ```
   git add .
   git commit -m "Expand Pattern Phonics to 5 difficulty levels"
   git push
   npx vercel --prod --yes
   ```
