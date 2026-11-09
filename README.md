# Ariana’s Quests

Two game-like 15-minute daily subjects behind one home screen (she picks whichever she feels like):

- **📚 Love English** (coach: Hooty the owl): vocabulary, pronunciation and grammar. 8 word quests (32 words) and 3 grammar quests.
- **💰 Money Maths** (coach: Penny the piggy bank): maths for running a real business, from adding bills to profit, percents, discounts and MRP, GST, break-even and budgets. 8 quests, 32 skills. Every problem is generated fresh, so replays never repeat the same numbers.

Each quest follows the same loop: warm-up, learn, games, make-it-yours, report. Words and skills come back for review
(bronze → silver → gold). The two subjects are completely separate: each has its own quests, review boxes, stars, badges, ranks and daily streak, and neither unlocks the other.

## How the app adapts to her
The path itself is fixed: finishing a quest always unlocks the next one, and nothing is ever locked behind a score.
Around the path the app adapts:
- **Review:** words and skills she gets wrong come back tomorrow; right ones come back after 3, 7, 14 and 30 days (bronze → silver → gold).
- **Practice time:** when three or more words or skills are shaky, an optional 10-minute practice quest appears on that subject’s home screen, built only from those.
- **Maths difficulty:** each Money Maths skill has a level from 1 to 3. Two clean days in a row raise it (bigger numbers, more realistic amounts); a rough day lowers it. Replays on the same day can’t change levels.
- **Parent area:** shows her tricky words and skills, and a **Use her tricky words** button that pre-fills the next English quest request.

## Run it on your computer
```
npm install
npm start          # http://localhost:3000
npm test           # server smoke test
```

## Deploy on Railway
1. Put this folder in a GitHub repo (the `.gitignore` is already set up).
2. Railway → **New Project → Deploy from GitHub repo**. It detects Node and runs `npm start`.
3. **Add a Volume** to the service and mount it at `/data`. Without this, progress is lost on every deploy.
4. Open **Variables** and add (see `.env.example`):
   - `DATA_DIR` = `/data`
   - `PARENT_PASSCODE` = a code only you know
   - `ANTHROPIC_API_KEY` = your key (optional, for live Hooty and new quests)
   - `ACCESS_CODE` = optional family code that locks the whole app
5. **Settings → Networking → Generate Domain**, then open the link.

## Put it on the iPad or phone
Open the link in Safari (iPad/iPhone) or Chrome (Android) → Share → **Add to Home Screen**.
It opens full screen like an app. Use the 🔊 button for sound; the mic game needs microphone permission (there is an “I said it out loud” fallback).

## Parent area (`/parent`)
Streak, time per session, her emoji ratings, words and skills that need another look, sentences and shop results she made,
what she asked Hooty and Penny, and **Add a new quest** for Love English (needs `ANTHROPIC_API_KEY`). Reset progress lives here too,
so you can clear the test runs before she starts for real.

## Adding quests
- **Love English:** use the parent area, or append to `content/quests.js`.
- **Money Maths:** append to `content/maths.js` using the existing skills, or add a new skill (teaching card in `content/maths.js` plus a generator with the same id in `public/maths.js`). `npm test` validates every quest.

## Notes
- One child profile; progress lives in `DATA_DIR/state.json`. Back it up by downloading that file.
- Voice uses the browser’s built-in speech, so quality depends on the device.
- Hooty and Penny only help with their own subject, give hints instead of answers, and are capped per day. Their replies are visible in the parent area.
