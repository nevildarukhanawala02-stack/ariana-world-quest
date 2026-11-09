"use strict";
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { Store } = require("./lib/store");
const C = require("./lib/content");
const M = require("./content/maths");
const AI = require("./lib/ai");

const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const ACCESS = process.env.ACCESS_CODE || "";          // optional family code for the whole app
const PARENT = process.env.PARENT_PASSCODE || "";      // required to open the parent area
const COACH_LIMIT = +process.env.COACH_DAILY_LIMIT || 60;

const store = new Store(DATA_DIR);
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "200kb" }));

/* ---------- helpers ---------- */
const INTERVALS = [0, 1, 3, 7, 14, 30];             // days until review, by Leitner box 1-5
const medal = box => (box >= 5 ? "gold" : box >= 3 ? "silver" : "bronze");
const num = (v, max) => Math.max(0, Math.min(max, Math.round(+v || 0)));
const clip = (s, n) => String(s == null ? "" : s).slice(0, n);
const httpErr = (status, message) => Object.assign(new Error(message), { status });

// two subjects share stars, badges and the streak; quests and review boxes are kept apart
const SUBJECTS = ["english", "maths"];
const subj = v => (v === "maths" ? "maths" : "english");
// each subject keeps its own stars, badges, streak and review boxes (English lives at the top level of the state)
function bag(st, sb) {
  if (sb === "maths") {
    const m = st.maths;
    if (typeof m.stars !== "number") m.stars = 0;
    if (!Array.isArray(m.badges)) m.badges = [];
    if (!m.streak) m.streak = { count: 0, last: null, freezes: 1, best: 0 };
    return m;
  }
  return st;
}
const questsOf = (st, s) => (s === "maths" ? M.quests : C.all(st));
const unitsOf = (st, s) => (s === "maths" ? st.maths.units : st.words);
const curOf = (st, s) => bag(st, s).currentQuest;
const recSubj = c => c.subject || "english";
const qBadgeId = (s, id) => (s === "maths" ? "mquest:" : "quest:") + id;
function unitMeta(st, s) {
  if (s === "maths") {
    const o = {};
    Object.keys(M.SKILLS).forEach(id => { const k = M.SKILLS[id]; o[id] = { label: k.name, mean: k.mean, emoji: k.emoji, say: "" }; });
    return o;
  }
  const idx = C.wordIndex(C.all(st)), o = {};
  Object.keys(idx).forEach(w => { o[w] = { label: w, mean: idx[w].mean, emoji: idx[w].emoji, say: idx[w].say }; });
  return o;
}

function validDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return isNaN(Date.parse(s + "T00:00:00Z")) ? null : s;
}
const isoToday = () => new Date().toISOString().slice(0, 10);
const dayNum = s => Math.floor(Date.parse(s + "T00:00:00Z") / 86400000);
const dayDiff = (a, b) => dayNum(b) - dayNum(a);
const addDays = (s, n) => new Date((dayNum(s) + n) * 86400000).toISOString().slice(0, 10);

function safeEq(a, b) {
  const A = Buffer.from(String(a)), B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

// tiny brute-force guard for the two passcodes
const fails = new Map();
function tooMany(ip) { const f = fails.get(ip); return f && f.n >= 10 && Date.now() - f.t < 15 * 60 * 1000; }
function noteFail(ip) { const f = fails.get(ip) || { n: 0, t: 0 }; f.n = Date.now() - f.t > 15 * 60 * 1000 ? 1 : f.n + 1; f.t = Date.now(); fails.set(ip, f); }

app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (ACCESS) {
    if (tooMany(req.ip)) return res.status(429).json({ error: "Too many tries. Please wait a bit." });
    if (!safeEq(req.get("x-access") || "", ACCESS)) { noteFail(req.ip); return res.status(401).json({ error: "access" }); }
  }
  next();
});
function parentOnly(req, res, next) {
  if (!PARENT) return res.status(503).json({ error: "Set PARENT_PASSCODE on the server to open the parent area." });
  if (tooMany(req.ip)) return res.status(429).json({ error: "Too many tries. Please wait a bit." });
  if (!safeEq(req.get("x-parent") || "", PARENT)) { noteFail(req.ip); return res.status(401).json({ error: "parent" }); }
  next();
}
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ---------- badges + ranks (separate for each subject) ---------- */
const SKILL = {
  warm:    { icon: "🔥", name: "Brain Warm-up",    desc: "Finish a warm-up" },
  drag:    { icon: "🎯", name: "Drag Master",      desc: "Drop every answer in place with at most 1 mistake" },
  eyes:    { icon: "👀", name: "Sharp Eyes",       desc: "Get every spot-the-mistake right first try" },
  sound:   { icon: "🎤", name: "Sound Check",      desc: "Say a word or sentence so well the mic hears it" },
  story:   { icon: "✍️", name: "Story Maker",      desc: "Build your own silly sentence" },
  builder: { icon: "🧩", name: "Sentence Builder", desc: "Unscramble sentences" },
  calc:    { icon: "🧮", name: "Number Cruncher",  desc: "Type in every answer right first try in a quest" },
  shopkeeper: { icon: "🛍️", name: "Shopkeeper",     desc: "Finish a shop challenge" },
  ace:     { icon: "💎", name: "Perfect Quest",    desc: "Finish a quest with no wrong answers" }
};
const SKILL_FOR = { english: ["warm", "drag", "eyes", "sound", "story", "builder", "ace"], maths: ["warm", "drag", "eyes", "calc", "shopkeeper", "ace"] };
const STREAKS = {
  streak3:  { icon: "🔥", name: "3-Day Streak",  desc: "Play 3 days in a row" },
  streak7:  { icon: "⚡", name: "7-Day Streak",  desc: "Play 7 days in a row" },
  streak14: { icon: "🌟", name: "14-Day Streak", desc: "Play 14 days in a row" },
  streak30: { icon: "👑", name: "30-Day Streak", desc: "Play 30 days in a row" }
};
const VAULT = {
  english: {
    words10:  { icon: "📚", name: "10 Words",      desc: "Collect 10 words in your vault" },
    words25:  { icon: "📖", name: "25 Words",      desc: "Collect 25 words in your vault" },
    words50:  { icon: "🏛️", name: "50 Words",      desc: "Collect 50 words in your vault" },
    gold1:    { icon: "🥇", name: "First Gold Word", desc: "Master a word so well it turns gold" }
  },
  maths: {
    skills8:  { icon: "🧮", name: "8 Money Skills",  desc: "Learn 8 Money Maths skills" },
    skills20: { icon: "💼", name: "20 Money Skills", desc: "Learn 20 Money Maths skills" },
    skills32: { icon: "🏦", name: "All 32 Money Skills", desc: "Learn every Money Maths skill" },
    gold1:    { icon: "🥇", name: "First Gold Skill", desc: "Master a skill so well it turns gold" }
  }
};
function catalog(st, sb) {
  const c = {};
  SKILL_FOR[sb].forEach(id => { c[id] = SKILL[id]; });
  if (sb === "maths") M.quests.forEach(q => { c["mquest:" + q.id] = { icon: q.badge.icon, name: q.badge.name, desc: "Quest " + q.id + ": " + q.title }; });
  else C.all(st).forEach(q => { c["quest:" + q.id] = { icon: q.badge.icon, name: q.badge.name, desc: "Quest " + q.id + ": " + q.title }; });
  return Object.assign(c, STREAKS, VAULT[sb]);
}
const RANKS = {
  english: [
    { at: 0,  icon: "🌱", title: "Word Sprout" },
    { at: 5,  icon: "🧭", title: "Word Ranger" },
    { at: 12, icon: "🧙", title: "Word Wizard" },
    { at: 20, icon: "🏆", title: "Word Champion" },
    { at: 30, icon: "👑", title: "Word Legend" }
  ],
  maths: [
    { at: 0,  icon: "🪙", title: "Coin Collector" },
    { at: 4,  icon: "🛍️", title: "Shopkeeper" },
    { at: 9,  icon: "📦", title: "Trader" },
    { at: 15, icon: "💼", title: "Manager" },
    { at: 22, icon: "🏢", title: "Business Boss" }
  ]
};
function rankFor(n, sb) {
  const R = RANKS[sb];
  let i = 0;
  R.forEach((r, k) => { if (n >= r.at) i = k; });
  const nx = R[i + 1];
  return { icon: R[i].icon, title: R[i].title, count: n, next: nx ? { title: nx.title, need: nx.at - n } : null };
}

/* ---------- streak ---------- */
function bumpStreak(o, today) {
  const s = o.streak;
  if (!s.last) s.count = 1;
  else {
    const d = dayDiff(s.last, today);
    if (d <= 0) return;
    if (d === 1) s.count++;
    else if (d === 2 && s.freezes > 0) { s.freezes--; s.count++; }   // one missed day is forgiven
    else s.count = 1;
  }
  s.last = today;
  s.best = Math.max(s.best || 0, s.count);
  if (s.count > 0 && s.count % 7 === 0) s.freezes = Math.min(2, s.freezes + 1);
}
function streakView(o, today) {
  const s = o.streak;
  if (!s.last) return { count: 0, playedToday: false, freezes: s.freezes, best: s.best || 0 };
  const d = dayDiff(s.last, today);
  const active = d <= 1 || (d === 2 && s.freezes > 0);
  return { count: active ? s.count : 0, playedToday: d === 0, freezes: s.freezes, best: s.best || 0 };
}

/* ---------- state for the client ---------- */
function overview(st, today) {
  const out = {};
  SUBJECTS.forEach(sb => {
    const qs = questsOf(st, sb), units = unitsOf(st, sb), o = bag(st, sb);
    const next = qs.find(q => q.id >= o.currentQuest) || null;
    const done = new Set(st.completed.filter(c => recSubj(c) === sb).map(c => c.quest));
    out[sb] = {
      next: next && { id: next.id, title: next.title, kind: next.kind, emoji: next.emoji },
      total: qs.length, done: done.size,
      due: Object.values(units).filter(v => v.due <= today).length,
      units: Object.keys(units).length,
      stars: o.stars, streak: streakView(o, today), rank: rankFor(o.badges.length, sb)
    };
  });
  return out;
}

function publicState(st, today, sb) {
  const quests = questsOf(st, sb);
  const meta = unitMeta(st, sb);
  const o = bag(st, sb);
  const done = new Set(st.completed.filter(c => recSubj(c) === sb).map(c => c.quest));
  const words = Object.entries(unitsOf(st, sb)).map(([w, v]) => ({
    w, label: (meta[w] && meta[w].label) || w, box: v.box, medal: medal(v.box), due: v.due, isDue: v.due <= today,
    seen: v.seen, right: v.right, wrong: v.wrong,
    mean: meta[w] && meta[w].mean, say: meta[w] && meta[w].say, emoji: meta[w] && meta[w].emoji
  }));
  const dueWords = words.filter(w => w.isDue && w.mean).sort((a, b) => (a.due < b.due ? -1 : 1)).slice(0, 8);
  const next = quests.find(q => q.id >= o.currentQuest) || null;
  const used = (st.coach.counts && st.coach.counts[today]) || 0;
  return {
    subject: sb,
    name: st.profile.name,
    stars: o.stars,
    badges: o.badges,
    badgeCatalog: catalog(st, sb),
    rank: rankFor(o.badges.length, sb),
    streak: streakView(o, today),
    quests: quests.map(q => ({ id: q.id, title: q.title, kind: q.kind, emoji: q.emoji, done: done.has(q.id) })),
    next: next && { id: next.id, title: next.title, kind: next.kind, emoji: next.emoji },
    currentQuest: o.currentQuest,
    words, dueWords,
    overview: overview(st, today),
    sessionsToday: st.completed.filter(c => c.date === today && recSubj(c) === sb).length,
    coach: { enabled: AI.enabled(), left: Math.max(0, COACH_LIMIT - used) }
  };
}

/* ---------- routes ---------- */
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/state", wrap(async (req, res) => {
  const today = validDate(req.query.today) || isoToday();
  res.json(publicState(await store.read(), today, subj(req.query.subject)));
}));

app.get("/api/quest/:id", wrap(async (req, res) => {
  const st = await store.read();
  const sb = subj(req.query.subject);
  const q = questsOf(st, sb).find(x => x.id === +req.params.id);
  if (!q) throw httpErr(404, "No such quest");
  res.json(sb === "maths" ? M.withUnits(q) : q);
}));

function applyWord(map, w, r, today, changed) {
  const right = num(r && r.right, 50), wrong = num(r && r.wrong, 50);
  let rec = map[w];
  const isNew = !rec;
  if (isNew) rec = map[w] = { box: wrong === 0 ? 2 : 1, due: "", seen: 0, right: 0, wrong: 0, first: today, last: "" };
  else if (rec.last !== today) {                      // box moves at most once per day, so replaying can't farm gold
    if (wrong === 0 && right > 0) rec.box = Math.min(5, rec.box + 1);
    else if (wrong >= 2) rec.box = 1;
  }
  rec.seen++; rec.right += right; rec.wrong += wrong;
  rec.last = today;
  rec.due = addDays(today, INTERVALS[rec.box]);
  changed.push({ w, box: rec.box, medal: medal(rec.box), isNew });
}

app.post("/api/session", wrap(async (req, res) => {
  const b = req.body || {};
  const today = validDate(b.today) || isoToday();
  const sid = clip(b.sid, 40);
  const out = await store.update(st => {
    const sb = subj(b.subject);
    const quests = questsOf(st, sb);
    const quest = quests.find(q => q.id === +b.quest);
    if (!quest) throw httpErr(400, "Unknown quest");
    if (sid) { const prev = st.completed.find(c => c.sid === sid); if (prev) return prev.result; }
    const units = unitsOf(st, sb);
    const o = bag(st, sb);

    const changed = [];
    const wordRes = b.wordRes && typeof b.wordRes === "object" ? b.wordRes : {};
    const reviewRes = b.reviewRes && typeof b.reviewRes === "object" ? b.reviewRes : {};
    if (quest.kind === "words") quest.words.forEach(w => applyWord(units, w.w, wordRes[w.w] || { right: 0, wrong: 0 }, today, changed));
    if (quest.kind === "maths") quest.skills.forEach(id => applyWord(units, id, wordRes[id] || { right: 0, wrong: 0 }, today, changed));
    Object.keys(reviewRes).forEach(w => {
      if (units[w] && !changed.some(c => c.w === w)) applyWord(units, w, reviewRes[w], today, changed);
    });

    const stars = num(b.stars, 200), seconds = num(b.seconds, 7200), hints = num(b.hints, 200), wrong = num(b.wrong, 200);
    o.stars += stars;
    bumpStreak(o, today);

    const newBadges = [];
    const give = id => { if (!o.badges.includes(id)) { o.badges.push(id); newBadges.push(id); } };
    (Array.isArray(b.badges) ? b.badges : []).forEach(id => { if (SKILL_FOR[sb].includes(id) && id !== "ace") give(id); });
    give(qBadgeId(sb, quest.id));
    if (wrong === 0) give("ace");
    [[3, "streak3"], [7, "streak7"], [14, "streak14"], [30, "streak30"]].forEach(([n, id]) => { if (o.streak.count >= n) give(id); });
    const nu = Object.keys(units).length;
    (sb === "maths" ? [[8, "skills8"], [20, "skills20"], [32, "skills32"]] : [[10, "words10"], [25, "words25"], [50, "words50"]]).forEach(([n, id]) => { if (nu >= n) give(id); });
    if (Object.values(units).some(v => v.box >= 5)) give("gold1");

    (Array.isArray(b.created) ? b.created : []).slice(0, 6).forEach(c => {
      if (c && c.text) st.sentences.push({ word: clip(c.word, 30), text: clip(c.text, 160), date: today, quest: quest.id });
    });
    if (st.sentences.length > 200) st.sentences = st.sentences.slice(-200);

    if (!b.replay && quest.id >= o.currentQuest) o.currentQuest = quest.id + 1;

    const ratings = {};
    if (b.ratings && typeof b.ratings === "object") Object.keys(b.ratings).slice(0, 8).forEach(k => { ratings[clip(k, 20)] = clip(b.ratings[k], 8); });
    let log = {};
    try { const s = JSON.stringify(b.log || {}); if (s.length < 3000) log = JSON.parse(s); } catch (e) { /* ignore */ }

    const result = { newBadges, changed, stars: o.stars, streak: streakView(o, today), rank: rankFor(o.badges.length, sb) };
    st.completed.push({ sid, subject: sb, quest: quest.id, date: today, ts: Date.now(), seconds, stars, hints, wrong, replay: !!b.replay, ratings, log, result });
    if (st.completed.length > 400) st.completed = st.completed.slice(-400);
    return result;
  });
  res.json(out);
}));

app.post("/api/session/rate", wrap(async (req, res) => {
  const sid = clip(req.body && req.body.sid, 40);
  const r = (req.body && req.body.ratings) || {};
  await store.update(st => {
    const rec = st.completed.find(c => c.sid === sid);
    if (!rec) throw httpErr(404, "Unknown session");
    Object.keys(r).slice(0, 8).forEach(k => { rec.ratings[clip(k, 20)] = clip(r[k], 8); });
  });
  res.json({ ok: true });
}));

app.post("/api/coach", wrap(async (req, res) => {
  const q = clip(req.body && req.body.question, 300).trim();
  if (!q) throw httpErr(400, "Ask a question first");
  if (!AI.enabled()) return res.json({ reply: null, reason: "off" });
  const today = validDate(req.body.today) || isoToday();
  const entryId = crypto.randomBytes(4).toString("hex");
  await store.update(st => {
    const counts = st.coach.counts;
    if ((counts[today] || 0) >= COACH_LIMIT) throw httpErr(429, "Hooty is resting for today. Try again tomorrow!");
    counts[today] = (counts[today] || 0) + 1;
    Object.keys(counts).sort().slice(0, -7).forEach(k => delete counts[k]);
    st.coach.log.push({ id: entryId, date: today, t: Date.now(), q });
    if (st.coach.log.length > 100) st.coach.log = st.coach.log.slice(-100);
  });
  let reply = null;
  try { reply = await AI.coachReply(q, req.body.context, subj(req.body.subject)); } catch (e) { console.error("coach error:", e.message); }
  if (reply) await store.update(st => { const e = st.coach.log.find(x => x.id === entryId); if (e) e.a = reply; });
  res.json({ reply, reason: reply ? undefined : "error" });
}));

/* ---------- parent area ---------- */
app.get("/api/parent", parentOnly, wrap(async (req, res) => {
  const st = await store.read();
  const quests = C.all(st);
  const today = isoToday();
  const eMeta = unitMeta(st, "english"), mMeta = unitMeta(st, "maths");
  const qTitle = (sb, id) => { const q = questsOf(st, sb).find(x => x.id === id); return q ? q.title : "Quest " + id; };
  const listUnits = (map, meta, sb) => Object.entries(map).map(([w, v]) => ({ subject: sb, w, label: (meta[w] && meta[w].label) || w, box: v.box, medal: medal(v.box), seen: v.seen, right: v.right, wrong: v.wrong, due: v.due, mean: meta[w] && meta[w].mean }));
  const words = listUnits(st.words, eMeta, "english").concat(listUnits(st.maths.units, mMeta, "maths"));
  const sessions = st.completed.slice(-30).reverse().map(c => ({ subject: recSubj(c), date: c.date, quest: c.quest, title: qTitle(recSubj(c), c.quest), seconds: c.seconds, stars: c.stars, hints: c.hints, wrong: c.wrong, ratings: c.ratings, replay: c.replay }));
  const real = st.completed.filter(c => !c.replay);
  res.json({
    name: st.profile.name,
    subjects: SUBJECTS.reduce((acc, sb) => { const o = bag(st, sb); acc[sb] = { stars: o.stars, badges: o.badges.length, streak: streakView(o, today), rank: rankFor(o.badges.length, sb), sessions: st.completed.filter(c => recSubj(c) === sb).length }; return acc; }, {}),
    sessionsTotal: st.completed.length,
    avgMinutes: real.length ? Math.round(real.reduce((a, c) => a + c.seconds, 0) / real.length / 60 * 10) / 10 : 0,
    words, sessions,
    sentences: st.sentences.slice(-30).reverse(),
    coachLog: st.coach.log.slice(-30).reverse(),
    quests: quests.map(q => ({ subject: "english", id: q.id, title: q.title, kind: q.kind, generated: (st.generated || []).some(g => g.id === q.id), done: st.completed.some(c => recSubj(c) === "english" && c.quest === q.id), words: q.words ? q.words.map(w => w.w) : undefined }))
      .concat(M.quests.map(q => ({ subject: "maths", id: q.id, title: q.title, kind: "maths", generated: false, done: st.completed.some(c => recSubj(c) === "maths" && c.quest === q.id), words: q.skills.map(id => M.SKILLS[id].name) }))),
    currentQuest: st.currentQuest, mathsCurrentQuest: st.maths.currentQuest,
    ai: { enabled: AI.enabled(), coachModel: process.env.COACH_MODEL || "claude-haiku-5-5", genModel: process.env.GEN_MODEL || "claude-sonnet-5-5", coachLimit: COACH_LIMIT },
    dataDir: DATA_DIR
  });
}));

app.post("/api/parent/generate", parentOnly, wrap(async (req, res) => {
  if (!AI.enabled()) throw httpErr(503, "Set ANTHROPIC_API_KEY on the server to create new quests.");
  const kind = req.body && req.body.kind === "grammar" ? "grammar" : "words";
  const theme = clip(req.body && req.body.theme, 120);
  const focus = clip(req.body && req.body.focus, 200);
  const st = await store.read();
  const quests = C.all(st);
  const taught = Object.keys(C.wordIndex(quests));
  const example = quests.find(x => x.kind === kind);
  const q = await AI.generateQuest({ kind, theme, focus, taught, example, validate: C.validateQuest });
  await store.update(s => {
    q.id = Math.max(0, ...C.all(s).map(x => x.id)) + 1;
    s.generated.push(q);
  });
  res.json({ ok: true, quest: { id: q.id, title: q.title, kind: q.kind, words: q.words ? q.words.map(w => w.w) : undefined } });
}));

app.delete("/api/parent/quest/:id", parentOnly, wrap(async (req, res) => {
  const id = +req.params.id;
  await store.update(st => {
    const i = (st.generated || []).findIndex(g => g.id === id);
    if (i < 0) throw httpErr(404, "Only quests you added can be removed");
    st.generated.splice(i, 1);
  });
  res.json({ ok: true });
}));

app.post("/api/parent/reset", parentOnly, wrap(async (req, res) => {
  if (!req.body || req.body.confirm !== "RESET") throw httpErr(400, "Type RESET to confirm");
  await store.update(st => {
    const keep = st.generated || [];
    const fresh = require("./lib/store").defaults();
    Object.keys(st).forEach(k => delete st[k]);
    Object.assign(st, fresh, { generated: keep });
  });
  res.json({ ok: true });
}));

/* ---------- static app ---------- */
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  setHeaders(res, file) {
    if (/sw\.js$/.test(file) || /\.html$/.test(file)) res.setHeader("Cache-Control", "no-cache");
  }
}));
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {          // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  if (!err.status) console.error(err);
  res.status(status).json({ error: status >= 500 ? "Something went wrong" : err.message });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Word Quest running on port ${PORT} (data: ${DATA_DIR})`));
}
module.exports = { app, store };
