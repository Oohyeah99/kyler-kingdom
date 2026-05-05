# Kyler Kingdom - Bug Handoff Document

**Date:** 2026-05-05
**Live URL:** https://kylerkingdom.com
**Vercel deployment URLs:** https://kyler-kingdom-o9dv7qlyg-kl-2167s-projects.vercel.app (latest)
**Repo:** D:\Projects\KylerKingdom

---

## POTENTIAL ROOT CAUSE (NOT YET INVESTIGATED)

The wildcard DNS record `*.kreativeland.com` in Cloudflare points to `20.255.60.68` (Azure VM), NOT to Vercel. This means `kyler.kreativeland.com` may be resolving to the Azure VM instead of Vercel's servers. If so, the API route `/api/generate-text` and even the latest static files would never be served because the Azure VM doesn't host this project.

**Action needed:** Check if `kyler.kreativeland.com` has a specific CNAME or A record pointing to Vercel, or if it's being caught by the wildcard. If caught by the wildcard, add a CNAME record for `kyler` pointing to `cname.vercel-dns.com`.

---

## Bug 1: Pattern Phonics - Sounds Not Loading on Initial Page Refresh

### Symptoms
- User opens Pattern Phonics page, clicks the Settings gear icon
- The slide-out panel shows **no sounds** (empty)
- If user switches difficulty level (e.g., Easy to Medium), sounds immediately appear and persist
- After switching difficulty once, sounds stay loaded even when switching back

### Architecture
- Pattern Phonics is a standalone HTML file at `public/pattern-phonics.html`
- It's embedded in the React app via an iframe in `src/pages/PatternPhonicsPage.tsx`
- The iframe points to `/pattern-phonics.html`

### Code Flow (init)
```
init() → loadState() → applyDifficulty(level) → renderSettingsPanel() → updateUI()
```

- `applyDifficulty()` sets `state.activeOnsets`, `state.activeVowels`, `state.activeCodas` from `PHONICS_DATA`
- `renderSettingsPanel()` reads those Sets and builds chip HTML into `#settingsPanelBody`
- The panel is populated but NOT visible (it slides in only when user clicks the gear icon)

### What's Been Tried (None of these fixed it)

1. **`DOMContentLoaded` event listener** - Original fix. Changed from bare `init()` call to wrapping in `DOMContentLoaded`. Didn't help because in iframe context the event may have already fired.

2. **`document.readyState` check** - Current approach:
   ```javascript
   if (document.readyState === 'loading') {
     document.addEventListener('DOMContentLoaded', init);
   } else {
     init();
   }
   ```
   Still doesn't work.

3. **Vercel routing fix** - Discovered that `vercel.json` catch-all route was serving the React app's `index.html` instead of the static `pattern-phonics.html`. Added explicit route:
   ```json
   { "src": "/pattern-phonics.html", "dest": "/pattern-phonics.html" }
   ```
   This fixed the file being served correctly (verified with curl), but didn't fix the sounds issue.

### What HAS NOT Been Investigated

- **Is `init()` actually being called?** No console.log was added to confirm.
- **Is `#settingsPanelBody` element present when `renderSettingsPanel()` runs?** Never verified at runtime.
- **Is `state.activeOnsets` etc. actually populated after `applyDifficulty()`?** Never verified at runtime.
- **Are the chips being rendered but invisible (CSS issue)?** Never checked.
- **Is localStorage conflicting?** If `phonics_state_v2` exists with empty arrays, `loadState()` would set the Sets but with sizes > 0 check passing (line 548), so `applyDifficulty` wouldn't be called again. Wait - actually line 548 says:
  ```javascript
  if (state.activeOnsets.size === 0 && state.activeVowels.size === 0 && state.activeCodas.size === 0) {
    applyDifficulty(state.difficulty);
  }
  ```
  This means if localStorage has EMPTY arrays saved for activeOnsets/activeVowels/activeCodas, the condition IS true and `applyDifficulty` would run. But if localStorage has ANY values, it WOULDN'T call `applyDifficulty` and would just use the loaded values.

- **POSSIBLE BUG:** `loadState()` does `state.activeOnsets = new Set(p.activeOnsets || [])`. If `p.activeOnsets` was serialized as an empty array `[]`, then the Set is empty, size is 0, and `applyDifficulty` would run (correct behavior). But what if the saved state has some other issue?

- **Why does switching difficulty fix it?** `setDifficulty()` calls `applyDifficulty(level)` then `renderSettingsPanel()`. This is the exact same flow as `init()`. The only difference is timing - maybe the DOM element isn't ready when init runs? But `document.readyState` check should handle that.

### Key Files
- `public/pattern-phonics.html` - Line 525 (`init`), Line 848 (`renderSettingsPanel`), Line 977 (initialization)
- `src/pages/PatternPhonicsPage.tsx` - iframe embedding

---

## Bug 2: Pattern Phonics - Audio/Speak Button Not Working

### Symptoms
- User generates a word, clicks the speaker button - no sound plays
- This is on a tablet (likely Chrome on Android/iPad)

### Architecture
- Uses Web Speech API (`speechSynthesis`)
- The `speakWord()` function at line 799 in `pattern-phonics.html`

### Code
```javascript
function speakWord() {
  if (!state.currentWord) return;
  const loadVoices = () => {
    const u = new SpeechSynthesisUtterance(state.currentWord.full);
    u.rate = 0.8; u.pitch = 1.0; u.lang = 'en-GB';
    const voices = speechSynthesis.getVoices();
    const v = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
    if (v) u.voice = v;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = loadVoices;
    speechSynthesis.getVoices();
    setTimeout(loadVoices, 100);
  } else {
    loadVoices();
  }
}
```

### What's Been Tried
1. Added Chrome voice-loading delay handling (current code above)
2. Added `allow="autoplay; microphone; speaker"` to iframe

### What HAS NOT Been Investigated
- **Chrome requires user gesture for first speech** - `speechSynthesis.speak()` may be blocked in iframes without user interaction on the parent page. This is a known Chrome policy.
- **`speaker` is not a valid iframe allow attribute** - The correct permission feature is `autoplay`. But even `autoplay` may not help with speechSynthesis.
- **iframe sandbox restrictions** - The iframe doesn't have a `sandbox` attribute, so this shouldn't be an issue.
- **The word being spoken is nonsense** - `state.currentWord.full` is a generated phonics pattern (e.g., "blat", "greem") which may not be pronounceable by TTS.
- **No error handling** - If `speechSynthesis.speak()` fails silently, there's no user feedback.
- **iPad/tablet TTS differences** - iOS Safari requires a user gesture on the SAME page (not iframe) to activate audio context.

### Possible Solution
- Replace `speechSynthesis` with a server-side TTS API or audio file approach
- Or: move the speak button OUT of the iframe into the parent React component and use a `postMessage` bridge
- Or: ensure the iframe has proper permissions and test on target device with DevTools

---

## Bug 3: Picture Story - "Oops, failed to fetch"

### Symptoms
- User clicks "Generate Picture" button
- Gets error: "Oops! Something went wrong" or "Oops! failed to fetch"

### Architecture
The flow is:
1. `generatePicturePrompt()` → calls `/api/generate-text` (Vercel serverless function → DeepSeek API)
2. `generateImage(prompt)` → calls Pollinations.ai free image API (URL-based, no key needed)

### API Route
- File: `api/generate-text.ts` - Vercel serverless function
- Proxies to DeepSeek API (`https://api.deepseek.com/v1/chat/completions`)
- Key: `sk-a67cd9cfc09d480f897265d5dbe8c146`

### What's Been Tried

1. **Switched from Gemini to DeepSeek for text** - Gemini text models (`gemini-2.0-flash`, `gemini-2.0-flash-exp`, `gemini-2.0-flash-lite`) all return 404. Switched to DeepSeek which works.

2. **Created Vercel serverless API route** - Browser can't call DeepSeek directly (CORS). Created `api/generate-text.ts` as a proxy. Works when tested with curl:
   ```
   curl -s https://kyler-kingdom-o9dv7qlyg-kl-2167s-projects.vercel.app/api/generate-text -X POST ...
   → {"text":"Hello! How can I help you today?"}
   ```

3. **Switched from Gemini Imagen to Pollinations.ai** - Gemini `imagen-3.0-generate-002` returns 404. Switched to Pollinations.ai which returns images via URL (no API key needed). Works when tested with curl.

4. **Disabled Vercel SSO Protection** - Site was returning 401. Used Vercel API to disable: `{"ssoProtection": null}`. Fixed the 401.

### What WORKS (confirmed with curl from command line)
- `POST https://kyler-kingdom-o9dv7qlyg-kl-2167s-projects.vercel.app/api/generate-text` → returns text ✓
- `GET https://image.pollinations.ai/prompt/...` → returns image (200, ~78KB) ✓
- Pattern phonics HTML file served correctly ✓

### What HAS NOT Been Investigated

- **DNS ISSUE (LIKELY ROOT CAUSE):** The domain `kyler.kreativeland.com` might be resolving to the Azure VM (20.255.60.68) via the wildcard DNS `*.kreativeland.com` instead of Vercel. If so, the browser would hit the Azure VM which has NO `/api/generate-text` endpoint, causing "failed to fetch". The curl tests used the Vercel deployment URL directly, not the custom domain.

- **Is the user accessing `kyler.kreativeland.com` or the Vercel URL?** If the custom domain DNS isn't configured, the user would get the wrong server.

- **CORS on Pollinations.ai from the user's browser** - Never tested in an actual browser, only curl. Pollinations.ai may block cross-origin requests from some domains.

- **Vercel function cold start timeout** - The serverless function might timeout on first call.

- **The `fetch()` call in `generateImage()` might be blocked** - The current code does a `fetch(imageUrl)` to "verify" the image loads, but this fetch from the browser to Pollinations.ai might be blocked by CORS. The image would load fine in an `<img>` tag (img tags don't have CORS restrictions) but `fetch()` does.

### LIKELY FIX FOR BUG 3
1. **Fix DNS:** Add CNAME record `kyler → cname.vercel-dns.com` in Cloudflare
2. **Remove the verification fetch in `generateImage()`** - Just return the URL without fetching it. The `<img>` tag will load it fine without CORS issues:
   ```typescript
   export async function generateImage(prompt: string): Promise<string> {
     const encodedPrompt = encodeURIComponent(prompt + ', cartoon style, colorful, kid-friendly')
     return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 100000)}`
   }
   ```

---

## Current File State

### `src/services/gemini.ts`
- Text generation: Calls `/api/generate-text` (Vercel serverless → DeepSeek)
- Image generation: Calls Pollinations.ai URL + verification fetch (may be CORS blocked)

### `api/generate-text.ts`
- Vercel serverless function proxying to DeepSeek
- Works when hit directly on Vercel deployment URL

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/pattern-phonics.html", "dest": "/pattern-phonics.html" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### `public/pattern-phonics.html`
- Init uses `document.readyState` check (line 977-984)
- `speakWord()` uses Web Speech API with Chrome voice-loading workaround (line 799-820)

### `src/pages/PatternPhonicsPage.tsx`
- Embeds iframe with `src="/pattern-phonics.html"` and `allow="autoplay; microphone; speaker"`

---

## Summary of Likely Root Causes

| Bug | Most Likely Root Cause |
|-----|----------------------|
| Sounds not loading | Unknown - all logical fixes failed. Needs browser DevTools debugging to see if `init()` runs, if DOM elements exist, if `renderSettingsPanel()` produces HTML |
| Audio not working | speechSynthesis blocked in iframe context on tablet/mobile browsers |
| Failed to fetch | DNS misconfiguration (wildcard catching kyler subdomain) AND/OR CORS on the verification fetch in `generateImage()` |

---

## Recommended Next Steps

1. **Check DNS first** - `nslookup kyler.kreativeland.com` or `dig kyler.kreativeland.com` - if it resolves to 20.255.60.68, that's the problem for Bug 3. Add a specific CNAME record.

2. **Add console.log debugging to Pattern Phonics** - Add logs to `init()`, `renderSettingsPanel()`, check if `#settingsPanelBody` has innerHTML after render.

3. **Remove the verification fetch** in `generateImage()` - img tags don't need CORS, but fetch() does.

4. **Test with browser DevTools** on the actual tablet device - check console for errors.

5. **For audio** - consider whether speechSynthesis works in iframes on the target device. May need to use a different approach entirely.
