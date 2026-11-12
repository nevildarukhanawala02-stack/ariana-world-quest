"use strict";
// Smoke test: boots the server on a temp folder and walks through a whole session.
const os = require("os"), fs = require("fs"), path = require("path");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wq-"));
process.env.DATA_DIR = dir;
process.env.PARENT_PASSCODE = "pp";
process.env.ACCESS_CODE = "fam";
delete process.env.ANTHROPIC_API_KEY;
const { app } = require("../server");
const C = require("../lib/content");
const MM = require("../content/maths");

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL:", m); } else console.log("ok  :", m); };

const srv = app.listen(0, async () => {
  const base = "http://127.0.0.1:" + srv.address().port;
  const call = async (p, o = {}, h = {}) => {
    const r = await fetch(base + p, Object.assign({}, o, { headers: Object.assign({ "content-type": "application/json", "x-access": "fam" }, h) }));
    return { status: r.status, body: await r.json().catch(() => ({})) };
  };
  try {
    ok((await call("/api/state", {}, { "x-access": "bad" })).status === 401, "wrong family code is rejected");
    let r = await call("/api/state?today=2026-11-09");
    ok(r.status === 200 && r.body.next.id === 1, "fresh state starts at quest 1");
    ok(r.body.quests.length === 11, "11 quests listed");

    r = await call("/api/quest/1");
    ok(r.body.words.length === 4, "quest 1 has 4 words");

    const post = (day, extra) => call("/api/session", { method: "POST", body: JSON.stringify(Object.assign({
      sid: "s" + day, quest: 1, today: day, seconds: 700, stars: 15, hints: 1, wrong: 0,
      badges: ["warm", "drag", "story", "hacker"],
      wordRes: { bustling: { right: 2, wrong: 0 }, gleaming: { right: 2, wrong: 0 }, reluctant: { right: 1, wrong: 1 }, mischievous: { right: 2, wrong: 0 } },
      created: [{ word: "gleaming", text: "The gleaming grandma danced." }]
    }, extra)) });

    r = await post("2026-11-09");
    ok(r.status === 200 && r.body.newBadges.includes("quest:1") && r.body.newBadges.includes("warm"), "session awards quest + skill badges");
    ok(!r.body.newBadges.includes("hacker"), "unknown badge ids are ignored");
    ok(r.body.streak.count === 1, "streak starts at 1");
    const dup = await post("2026-11-09");
    ok(JSON.stringify(dup.body) === JSON.stringify(r.body), "same session id is idempotent");

    r = await call("/api/state?today=2026-11-09");
    ok(r.body.next.id === 2 && r.body.stars === 15, "next quest unlocked, stars saved");
    const rel = r.body.words.find(w => w.w === "reluctant"), bus = r.body.words.find(w => w.w === "bustling");
    ok(rel.box === 1 && bus.box === 2, "Leitner boxes: shaky word box 1, clean word box 2");
    ok(r.body.dueWords.length === 0, "nothing due on the day it was learned");

    r = await call("/api/state?today=2026-11-10");
    ok(r.body.dueWords.some(w => w.w === "reluctant"), "reluctant is due the next day");
    ok(r.body.streak.count === 1 && !r.body.streak.playedToday, "streak still alive next day");

    // replay on the same day must not promote boxes again
    await post("2026-11-09", { sid: "replay1", replay: true });
    r = await call("/api/state?today=2026-11-09");
    ok(r.body.words.find(w => w.w === "bustling").box === 2, "replay the same day does not farm boxes");
    ok(r.body.next.id === 2, "replay does not change the next quest");

    // next day review: clean answers promote
    await call("/api/session", { method: "POST", body: JSON.stringify({ sid: "s2", quest: 2, today: "2026-11-10", seconds: 600, stars: 10, wrong: 1, hints: 0,
      wordRes: { eager: { right: 1, wrong: 0 } }, reviewRes: { reluctant: { right: 1, wrong: 0 }, bustling: { right: 1, wrong: 0 } } }) });
    r = await call("/api/state?today=2026-11-10");
    ok(r.body.words.find(w => w.w === "bustling").box === 3, "review promotes bustling to box 3 (silver)");
    ok(r.body.words.find(w => w.w === "reluctant").box === 2, "review promotes reluctant to box 2");
    ok(r.body.streak.count === 2, "streak is 2 after consecutive days");

    // one missed day is forgiven, two are not
    await call("/api/session", { method: "POST", body: JSON.stringify({ sid: "s3", quest: 3, today: "2026-11-12", seconds: 600, stars: 5, wrong: 0, hints: 0 }) });
    r = await call("/api/state?today=2026-11-12");
    ok(r.body.streak.count === 3, "one missed day is forgiven by a streak freeze");
    await call("/api/session", { method: "POST", body: JSON.stringify({ sid: "s4", quest: 4, today: "2026-11-16", seconds: 600, stars: 5, wrong: 0, hints: 0 }) });
    r = await call("/api/state?today=2026-11-16");
    ok(r.body.streak.count === 1, "a longer gap restarts the streak");

    // ---- Money Maths: separate quests and skills, shared stars, badges and streak ----
    r = await call("/api/state?today=2026-11-16&subject=maths");
    ok(r.body.subject === "maths" && r.body.next.id === 1 && r.body.quests.length === 8, "maths starts at quest 1 of 8");
    ok(r.body.overview.english.next.id === 5 && r.body.overview.maths.done === 0, "overview shows both subjects");
    const starsBefore = r.body.stars;
    const engBefore = (await call("/api/state?today=2026-11-16&subject=english")).body;
    ok(starsBefore === 0 && r.body.streak.count === 0 && r.body.badges.length === 0, "maths starts with its own empty stars, streak and badges");
    r = await call("/api/quest/1?subject=maths");
    ok(r.body.units.length === 4 && r.body.units[0].id === "add2" && r.body.create.type === "budget", "maths quest comes with skill cards");
    r = await call("/api/session", { method: "POST", body: JSON.stringify({ sid: "m1", subject: "maths", quest: 1, today: "2026-11-16", seconds: 800, stars: 12, wrong: 0, hints: 0,
      badges: ["warm", "calc", "shopkeeper"], wordRes: { add2: { right: 1, wrong: 0 }, add3: { right: 1, wrong: 0 }, mulq: { right: 1, wrong: 1 }, change: { right: 1, wrong: 0 } } }) });
    ok(r.status === 200 && r.body.newBadges.includes("mquest:1") && r.body.newBadges.includes("calc") && !r.body.newBadges.includes("quest:1"), "maths session awards maths quest badge");
    r = await call("/api/state?today=2026-11-16&subject=maths");
    ok(r.body.next.id === 2 && r.body.stars === 12 && r.body.streak.count === 1, "maths advances with its own stars and streak");
    ok(Object.keys(r.body.badgeCatalog).includes("mquest:1") && !Object.keys(r.body.badgeCatalog).includes("quest:1") && !r.body.badgeCatalog.story, "maths badge shelf is its own");
    ok(r.body.words.length === 4 && r.body.words.find(w => w.w === "add2").box === 2 && r.body.words.find(w => w.w === "mulq").box === 1, "maths skills use review boxes");
    ok(r.body.words[0].label && r.body.words[0].mean, "skills have names for the vault");
    r = await call("/api/state?today=2026-11-16&subject=english");
    ok(r.body.next.id === 5 && r.body.words.every(w => !MM.SKILLS[w.w]), "english progress and vault are untouched by maths");
    ok(r.body.stars === engBefore.stars && r.body.badges.length === engBefore.badges.length && r.body.streak.count === engBefore.streak.count && !r.body.badges.includes("mquest:1") && !r.body.badgeCatalog.calc, "english stars, badges and streak are untouched by maths");
    r = await call("/api/state?today=2026-11-17&subject=maths");
    ok(r.body.dueWords.some(w => w.w === "mulq"), "shaky maths skill is due next day");

    // ---- discoveries (History, Geography, Did you know) ----
    r = await call("/api/state?today=2026-11-16&subject=english");
    ok(r.body.discoveries.length >= 3 && r.body.discoveries.every(d => d.title && d.text.length >= 3 && d.fact), "english state lists the discoveries she has unlocked, with their text");
    ok(r.body.discoveryTotals.history === 4 && r.body.discoveryTotals.geography === 4 && r.body.discoveryTotals.didyouknow === 3, "discovery totals: 4 history, 4 geography, 3 did-you-know");
    ok(r.body.badges.includes("disc3") && r.body.badgeCatalog.explorer && r.body.badgeCatalog.disc7, "three discoveries earns the 3 Discoveries badge; explorer badge exists");
    const mst = await call("/api/state?today=2026-11-16&subject=maths");
    ok(mst.body.discoveries.length === 0 && !mst.body.badgeCatalog.disc3 && !mst.body.badgeCatalog.explorer, "maths has no discoveries and none of those badges");
    const bad = JSON.parse(JSON.stringify(C.base[0])); bad.discover.quiz[0].ans = 7;
    ok(C.validateQuest(bad).length > 0, "a malformed discovery is rejected by validation");
    r = await call("/api/parent", {}, { "x-parent": "pp" });
    ok(r.body.progress.english.questsDone >= 3 && r.body.progress.english.questsTotal === 11 && r.body.progress.maths.questsTotal === 8 && r.body.progress.discoveries.cats.history.total === 4, "parent progress shows lessons finished and discovery totals");
    ok(typeof r.body.progress.discoveries.asked === "number" && r.body.progress.english.minutes >= 0 && "lastPlayed" in r.body.progress.english, "parent progress includes minutes, last played and discovery accuracy");

    // ---- adaptive: maths levels ----
    const mday = (d, sid, quest, extra) => call("/api/session", { method: "POST", body: JSON.stringify(Object.assign({ sid, subject: "maths", quest, today: d, seconds: 600, stars: 5, wrong: 0, hints: 0 }, extra)) });
    r = await call("/api/state?today=2026-11-16&subject=maths");
    ok(r.body.words.every(w => w.lvl === 1), "new maths skills start at level 1");
    await mday("2026-11-17", "lv1", 1, { replay: true, wordRes: { add2: { right: 1, wrong: 0 } } });
    r = await call("/api/state?today=2026-11-17&subject=maths");
    ok(r.body.words.find(w => w.w === "add2").lvl === 2, "two clean days raise a skill to level 2");
    await mday("2026-11-17", "lv1b", 1, { replay: true, wordRes: { add2: { right: 1, wrong: 0 } } });
    r = await call("/api/state?today=2026-11-17&subject=maths");
    ok(r.body.words.find(w => w.w === "add2").lvl === 2, "same-day replays cannot farm levels");
    await mday("2026-11-18", "lv2", 1, { replay: true, wordRes: { add2: { right: 0, wrong: 2 } } });
    r = await call("/api/state?today=2026-11-18&subject=maths");
    ok(r.body.words.find(w => w.w === "add2").lvl === 1 && r.body.words.find(w => w.w === "add2").box === 1, "a rough day lowers the level and resets the box");

    // ---- adaptive: practice quests ----
    r = await call("/api/state?today=2026-11-20&subject=english");
    ok(r.body.practice.available === false, "no practice offered when only a couple of words are shaky");
    r = await call("/api/practice?subject=english");
    ok(r.status === 404, "practice endpoint says nothing to practise yet");
    const q5 = C.base.find(q => q.id === 5), wr5 = {};
    q5.words.forEach(x => { wr5[x.w] = { right: 1, wrong: 2 }; });
    r = await call("/api/session", { method: "POST", body: JSON.stringify({ sid: "e5", quest: 5, today: "2026-11-20", seconds: 700, stars: 5, wrong: 8, hints: 3, wordRes: wr5 }) });
    r = await call("/api/state?today=2026-11-20&subject=english");
    ok(r.body.practice.available && r.body.practice.labels.length === 4, "practice appears once three or more words are shaky");
    const doneBefore = r.body.overview.english.done, nextBefore = r.body.next.id, starsBefore2 = r.body.stars;
    r = await call("/api/practice?subject=english");
    ok(r.status === 200 && r.body.practice === true && r.body.words.length === 4 && r.body.words.every(w => w.quiz && w.silly && w.build && w.gap), "english practice quest has full word data");
    const pw = r.body.words.map(w => w.w);
    const wrP = {}; pw.forEach(w => { wrP[w] = { right: 1, wrong: 0 }; });
    r = await call("/api/session", { method: "POST", body: JSON.stringify({ sid: "p1", practice: true, quest: 0, today: "2026-11-21", seconds: 500, stars: 9, wrong: 0, hints: 0, wordRes: wrP }) });
    ok(r.status === 200 && r.body.newBadges.includes("practice") && !r.body.newBadges.some(b => b.startsWith("quest:")), "practice session awards the practice badge, not a quest badge");
    r = await call("/api/state?today=2026-11-21&subject=english");
    ok(r.body.next.id === nextBefore && r.body.overview.english.done === doneBefore && r.body.stars === starsBefore2 + 9, "practice keeps the path as is, adds stars, and is not counted as a quest");
    ok(pw.every(w => r.body.words.find(x => x.w === w).box >= 2), "practised words move up a review box");
    r = await call("/api/parent", {}, { "x-parent": "pp" });
    ok(r.body.sessions.some(x => x.title === "Practice Time") && Array.isArray(r.body.weak.english), "parent area lists practice sessions and weak words");

    r = await call("/api/practice?subject=maths");
    ok(r.status === 404, "maths practice not offered with only one shaky skill");
    const wrM = {}; MM.quests.find(q => q.id === 2).skills.forEach(id => { wrM[id] = { right: 0, wrong: 2 }; });
    await mday("2026-11-21", "m2", 2, { wordRes: wrM });
    r = await call("/api/practice?subject=maths");
    ok(r.status === 200 && r.body.kind === "maths" && r.body.skills.length === 4 && r.body.units.length === 4 && r.body.create && r.body.warm.length === 4, "maths practice quest is built from shaky skills");

    await call("/api/session/rate", { method: "POST", body: JSON.stringify({ sid: "s4", ratings: { play: "😍" } }) });

    ok((await call("/api/parent")).status === 401, "parent area needs the passcode");
    r = await call("/api/parent", {}, { "x-parent": "pp" });
    ok(r.status === 200 && r.body.sessions.length >= 4 && r.body.sentences.length >= 1, "parent dashboard returns sessions and sentences");
    ok(r.body.subjects.maths.sessions >= 1 && r.body.subjects.maths.stars >= 12 && r.body.quests.some(q => q.subject === "maths") && r.body.words.some(w => w.subject === "maths"), "parent dashboard covers maths too");
    ok(r.body.sessions.some(x => x.ratings && x.ratings.play === "😍"), "ratings are saved");

    r = await call("/api/coach", { method: "POST", body: JSON.stringify({ question: "what does eager mean?" }) });
    ok(r.status === 200 && r.body.reply === null, "coach falls back cleanly with no API key");
    r = await call("/api/parent/generate", { method: "POST", body: JSON.stringify({ kind: "words" }) }, { "x-parent": "pp" });
    ok(r.status === 503, "generator explains it needs an API key");

    r = await call("/api/parent/reset", { method: "POST", body: JSON.stringify({ confirm: "RESET" }) }, { "x-parent": "pp" });
    r = await call("/api/state?today=2026-11-16");
    ok(r.body.stars === 0 && r.body.next.id === 1, "reset clears progress");
    r = await call("/api/state?today=2026-11-16&subject=maths");
    ok(r.body.next.id === 1 && r.body.words.length === 0, "reset also clears maths");

    MM.quests.forEach(q => { const e = MM.validateMaths(q); if (e.length) { fails++; console.log("FAIL: maths quest", q.id, e); } });
    C.base.forEach(q => { const e = C.validateQuest(q); if (e.length) { fails++; console.log("FAIL: quest", q.id, e); } });
    ok(true, "all starter quests validate");
  } catch (e) { fails++; console.log("ERROR", e); }
  srv.close();
  console.log(fails ? `\n${fails} FAILED` : "\nAll good");
  process.exit(fails ? 1 : 0);
});
