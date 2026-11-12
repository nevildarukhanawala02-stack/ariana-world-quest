"use strict";
const base = require("../content/quests.js");
const DISCOVER = require("../content/discover.js");
const CATS = ["history", "geography", "didyouknow"];
base.forEach(q => { if (q.kind !== "maths" && DISCOVER[q.id]) q.discover = DISCOVER[q.id]; });

const str = (v, n) => typeof v === "string" && v.trim().length > 0 && v.length <= n;
const optsOk = (o, min, max) => Array.isArray(o) && o.length >= min && o.length <= max && o.every(x => str(x, 140));
const idxOk = (v, len) => Number.isInteger(v) && v >= 0 && v < len;

function validateDiscover(d) {
  const e = [];
  if (!d || typeof d !== "object") return ["discover is not an object"];
  if (!CATS.includes(d.cat)) e.push("discover.cat");
  if (!str(d.title, 60)) e.push("discover.title");
  if (!str(d.emoji, 12)) e.push("discover.emoji");
  if (d.place != null && !str(d.place, 80)) e.push("discover.place");
  if (!Array.isArray(d.text) || d.text.length < 3 || d.text.length > 5 || d.text.some(t => !str(t, 220))) e.push("discover.text (3-5 short sentences)");
  if (!str(d.fact, 200)) e.push("discover.fact");
  if (!Array.isArray(d.quiz) || d.quiz.length !== 2 || d.quiz.some(x => !x || !str(x.q, 140) || !optsOk(x.opts, 3, 3) || !idxOk(x.ans, 3) || !str(x.why, 200))) e.push("discover.quiz (2 questions with 3 options)");
  return e;
}

function validateQuest(q) {
  const e = [];
  if (!q || typeof q !== "object") return ["quest is not an object"];
  if (!str(q.title, 60)) e.push("title");
  if (!str(q.emoji, 12)) e.push("emoji");
  if (!str(q.intro, 220)) e.push("intro");
  if (!q.badge || !str(q.badge.name, 40) || !str(q.badge.icon, 12)) e.push("badge");
  if (!Array.isArray(q.warm) || q.warm.length !== 4 ||
      q.warm.some(p => !Array.isArray(p) || p.length !== 2 || !str(p[0], 30) || !str(p[1], 30))) e.push("warm (needs 4 word pairs)");

  if (q.kind === "words") {
    if (!Array.isArray(q.words) || q.words.length !== 4) { e.push("words (needs exactly 4)"); return e; }
    q.words.forEach((w, i) => {
      const p = `words[${i}]`;
      if (!w || typeof w !== "object") { e.push(p); return; }
      if (!/^[a-z]+$/.test(w.w || "")) e.push(p + ".w must be one lowercase word");
      ["say", "tip", "mean"].forEach(k => { if (!str(w[k], 120)) e.push(`${p}.${k}`); });
      if (!str(w.emoji, 12)) e.push(p + ".emoji");
      if (!str(w.line, 200) || !new RegExp("\\b" + w.w + "\\b").test(w.line)) e.push(p + ".line must contain the exact word");
      if (!str(w.gap, 200) || (w.gap.match(/___/g) || []).length !== 1) e.push(p + ".gap needs exactly one ___");
      if (!w.quiz || !str(w.quiz.q, 160) || !optsOk(w.quiz.opts, 3, 3) || !idxOk(w.quiz.ans, 3) || !str(w.quiz.why, 200)) e.push(p + ".quiz");
      if (!w.silly || !optsOk(w.silly.opts, 3, 3) || !idxOk(w.silly.ans, 3) || !str(w.silly.why, 200)) e.push(p + ".silly");
      if (!w.build || !optsOk(w.build.a, 3, 3) || !optsOk(w.build.b, 3, 3)) e.push(p + ".build (3 starters + 3 endings)");
    });
    if (!Array.isArray(q.say) || q.say.length !== 2 || !idxOk(q.say[0], 4) || !idxOk(q.say[1], 4) || q.say[0] === q.say[1]) e.push("say (two different word positions 0-3)");
    const names = q.words.map(w => w && w.w);
    if (new Set(names).size !== 4) e.push("duplicate words");
  } else if (q.kind === "grammar") {
    if (!str(q.tip, 200)) e.push("tip");
    if (!Array.isArray(q.rules) || q.rules.length < 2 || q.rules.length > 4 ||
        q.rules.some(r => !r || !str(r.t, 80) || !str(r.ex, 140) || !str(r.emoji, 12))) e.push("rules (2-4)");
    if (!Array.isArray(q.gaps) || q.gaps.length !== 4 ||
        q.gaps.some(g => !g || !str(g.s, 160) || (g.s.match(/___/g) || []).length !== 1 || !optsOk(g.opts, 2, 3) || !idxOk(g.ans, g.opts && g.opts.length) || !str(g.why, 200))) e.push("gaps (4)");
    if (!Array.isArray(q.spot) || q.spot.length !== 2 ||
        q.spot.some(s => !s || !str(s.q, 120) || !optsOk(s.opts, 2, 3) || !idxOk(s.ans, s.opts && s.opts.length) || !str(s.why, 200))) e.push("spot (2)");
    if (!Array.isArray(q.build) || q.build.length !== 2 || q.build.some(s => !str(s, 120) || s.split(" ").length < 4 || s.split(" ").length > 12)) e.push("build (2 sentences of 4-12 words)");
    if (!Array.isArray(q.say) || q.say.length !== 2 || q.say.some(s => !str(s, 120))) e.push("say (2 sentences)");
  } else e.push("kind must be words or grammar");
  if (q.discover != null) validateDiscover(q.discover).forEach(x => e.push(x));
  return e;
}

function all(st) {
  const gen = (st && st.generated) || [];
  return base.concat(gen).sort((a, b) => a.id - b.id);
}

function wordIndex(quests) {
  const idx = {};
  quests.forEach(q => {
    if (q.kind !== "words") return;
    q.words.forEach(w => { idx[w.w] = { w: w.w, mean: w.mean, say: w.say, emoji: w.emoji, quest: q.id }; });
  });
  return idx;
}

module.exports = { validateQuest, validateDiscover, all, wordIndex, base, CATS };
