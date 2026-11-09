(function () {
"use strict";

/* =====================================================================
   Ariana’s Word Quest: client app
   Screens: home, quest map, word vault, badges, quest runner, report
   ===================================================================== */

const $ = s => document.querySelector(s);
const stage = $("#stage");
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };
function today() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

let APP = { state: null };
let S = null;                    // current quest session
let SUBJECT = "english";
const META = {
  english: { name: "Love English", coach: "Hooty", emoji: "📚", quest: "Word quest" },
  maths:   { name: "Money Maths", coach: "Penny", emoji: "💰", quest: "Maths quest" }
};
const M = window.MATHS;
// how hard Money Maths numbers are for each skill (1-3). The server raises it after clean days and lowers it after a rough one.
const lvlOf = id => { const w = ((APP.state && APP.state.words) || []).filter(x => x.w === id)[0]; return (w && w.lvl) || 1; };
let sound = true;
let ACCESS = lsGet("wq_access") || "";

/* ---------- api ---------- */
async function api(path, opts) {
  opts = opts || {};
  const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
  if (ACCESS) headers["x-access"] = ACCESS;
  const r = await fetch(path, Object.assign({}, opts, { headers }));
  if (!r.ok) {
    let msg = "http " + r.status;
    try { const j = await r.json(); if (j && j.error) msg = j.error; } catch (e) { /* ignore */ }
    throw Object.assign(new Error(msg), { status: r.status, auth: r.status === 401 });
  }
  return r.json();
}
const pend = () => { try { return JSON.parse(lsGet("wq_pending") || "[]"); } catch (e) { return []; } };
const setPend = a => lsSet("wq_pending", JSON.stringify(a));
async function flushPending() {
  const a = pend(); if (!a.length) return;
  const left = [];
  for (const p of a) {
    try { await api("/api/session", { method: "POST", body: JSON.stringify(p) }); }
    catch (e) { if (e.auth) throw e; if (!(e.status >= 400 && e.status < 500 && e.status !== 429)) left.push(p); }
  }
  setPend(left);
}

/* ---------- sound + voice ---------- */
let ac = null;
function tone(freqs, dur) {
  if (!sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime;
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i * dur);
      g.gain.exponentialRampToValueAtTime(0.18, t + i * dur + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * dur + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(t + i * dur); o.stop(t + i * dur + dur + 0.05);
    });
  } catch (e) { /* ignore */ }
}
const good = () => tone([660, 880], 0.12);
const oops = () => tone([300, 240], 0.14);
const fanfare = () => tone([523, 659, 784, 1046], 0.14);

let voice = null;
function pickVoice() {
  try {
    const v = window.speechSynthesis.getVoices();
    voice = v.find(x => /en[-_]IN/i.test(x.lang)) || v.find(x => /^en[-_]GB/i.test(x.lang)) || v.find(x => /^en/i.test(x.lang)) || null;
  } catch (e) { /* ignore */ }
}
try { pickVoice(); window.speechSynthesis.onvoiceschanged = pickVoice; } catch (e) { /* ignore */ }
function speak(t, rate, twice) {
  try {
    const ss = window.speechSynthesis; ss.cancel();
    const mk = r => { const u = new SpeechSynthesisUtterance(t); if (voice) { u.voice = voice; u.lang = voice.lang; } u.rate = r; return u; };
    ss.speak(mk(rate || 0.92));
    if (twice) ss.speak(mk(1));
  } catch (e) { /* ignore */ }
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listen(cb) {
  if (!SR) { cb({ err: "unsupported" }); return; }
  const r = new SR(); let done = false;
  r.lang = "en-IN"; r.maxAlternatives = 5; r.interimResults = false;
  r.onresult = e => { done = true; const alts = []; for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript.toLowerCase()); cb({ heard: alts }); };
  r.onerror = e => { if (done) return; done = true; cb({ err: e.error || "error" }); };
  r.onend = () => { if (!done) { done = true; cb({ err: "nospeech" }); } };
  try { r.start(); } catch (e) { cb({ err: "error" }); }
}
const norm = t => t.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);
function heardMatch(target, alts) {
  const tw = norm(target);
  return alts.some(a => {
    const aw = norm(a);
    if (tw.length === 1) return aw.some(x => x.indexOf(tw[0]) > -1);
    let hit = 0; tw.forEach(w => { if (aw.indexOf(w) > -1) hit++; });
    return hit / tw.length >= 0.7;
  });
}

/* ---------- little UI helpers ---------- */
function shake(el) { if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
let tt;
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2800); }
function burst() {
  const em = ["⭐", "🎉", "✨", "🌟", "🦉"];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span"); s.className = "fx"; s.textContent = em[i % em.length];
    s.style.setProperty("--dx", (Math.random() * 320 - 160) + "px");
    s.style.setProperty("--dy", (-Math.random() * 260 - 40) + "px");
    s.style.setProperty("--r", (Math.random() * 360 - 180) + "deg");
    document.body.appendChild(s); setTimeout(() => s.remove(), 1200);
  }
}
function setStars(n) { $("#stars").textContent = "⭐ " + n; }
function addStars(n) { S.stars += n; setStars(S.stars); }
function badge(id) {
  if (!S || S.badges.includes(id)) return;
  S.badges.push(id);
  if (!APP.state.badges.includes(id)) {
    const b = APP.state.badgeCatalog[id] || { icon: "🏅", name: id };
    toast(b.icon + " New badge: " + b.name); fanfare();
  }
}

/* ---------- Hooty the coach ---------- */
let hintList = [], hintI = 0;
function say(msg, hints) {
  $("#bubbleText").textContent = msg;
  if (Array.isArray(hints)) { hintList = hints; hintI = 0; }
  $("#helpBtn").hidden = !hintList.length;
  const o = $("#mascot"); o.classList.remove("hop"); void o.offsetWidth; o.classList.add("hop");
}
$("#helpBtn").onclick = () => {
  if (!hintList.length) return;
  $("#bubbleText").textContent = hintList[Math.min(hintI, hintList.length - 1)];
  hintI++; if (S) S.hints++;
};
$("#hearBtn").onclick = () => speak($("#bubbleText").textContent);
$("#snd").onclick = function () { sound = !sound; this.textContent = sound ? "🔊" : "🔇"; };

const ASK_CHIPS = {
  english: ["What does it mean?", "Use it in a sentence", "Give me a hint", "How do I say it?"],
  maths: ["Explain it again", "Show me an example", "Give me a hint", "Is my method right?"]
};
function coachCtx() {
  if (!S) return { quest: "Home screen" };
  return {
    quest: S.q.title, activity: S.ctx, now: S.now || "",
    words: S.q.words ? S.q.words.map(w => ({ w: w.w, mean: w.mean })) : (S.q.units ? S.q.units.map(u => ({ w: u.name, mean: u.mean })) : []),
    rules: S.q.rules ? S.q.rules.map(r => r.t + ": " + r.ex) : (S.q.units ? S.q.units.map(u => u.title + ": " + u.text + " Example: " + u.ex) : [])
  };
}
function openAsk() {
  $("#sheet h3").textContent = "Ask " + META[SUBJECT].coach;
  $("#askChips").innerHTML = ASK_CHIPS[SUBJECT].map(c => '<button class="chip pick">' + esc(c) + "</button>").join("");
  [].forEach.call($("#askChips").querySelectorAll(".chip"), b => { b.onclick = () => { $("#askInput").value = b.textContent; sendAsk(); }; });
  $("#sheet").hidden = false;
  setTimeout(() => $("#askInput").focus(), 60);
}
async function sendAsk() {
  const q = $("#askInput").value.trim();
  if (!q) return;
  $("#sheet").hidden = true; $("#askInput").value = "";
  say(META[SUBJECT].coach + " is thinking…");
  try {
    const r = await api("/api/coach", { method: "POST", body: JSON.stringify({ question: q, today: today(), subject: SUBJECT, context: coachCtx() }) });
    say(r.reply || "My thinking cap slipped off! Try the 💡 Help me button.");
  } catch (e) {
    say(e.status === 429 ? e.message : "My thinking cap slipped off! Try the 💡 Help me button.");
  }
}
$("#askBtn").onclick = openAsk;
$("#askCancel").onclick = () => { $("#sheet").hidden = true; };
$("#askSend").onclick = sendAsk;
$("#askInput").onkeydown = e => { if (e.key === "Enter") sendAsk(); };
$("#sheet").onclick = e => { if (e.target.id === "sheet") $("#sheet").hidden = true; };

/* ---------- chrome ---------- */
const PH = ["Warm-up", "Meet", "Play", "Create", "Report"];
function renderTrack() {
  const p = S ? S.phase : -1;
  $("#track").innerHTML = PH.map((n, i) => '<li class="' + (i < p ? "done" : i === p ? "now" : "") + '">' + (i < p ? "✓ " : "") + n + "</li>").join("");
}
function tick() {
  if (!S) return;
  S.elapsed = Math.floor((Date.now() - S.t0) / 1000);
  $("#clock").textContent = fmt(S.elapsed);
  $("#timebar").style.width = Math.min(100, S.elapsed / 9) + "%";
}
function chrome(inQuest) {
  $("#questChrome").hidden = !inQuest;
  $("#clock").hidden = !inQuest;
  $("#askBtn").hidden = !(APP.state && APP.state.coach && APP.state.coach.enabled) || !S;
  $("#askBtn").textContent = "💬 Ask " + META[SUBJECT].coach;
  $("#stars").hidden = !inQuest && !document.documentElement.dataset.subject;
  if (!inQuest && APP.state && document.documentElement.dataset.subject) setStars(APP.state.stars);
  if (!inQuest) { $("#timebar").style.width = "0"; }
}
function setSubject(sb) {
  SUBJECT = sb || "english";
  document.documentElement.dataset.subject = sb || "";
  const pig = SUBJECT === "maths" && !!sb;
  $("#owl").toggleAttribute("hidden", pig);          // SVG elements have no .hidden property, so use the attribute
  $("#pig").toggleAttribute("hidden", !pig);
  $(".brand").textContent = sb ? META[sb].name : "Ariana’s Quests";
}
function nextBtn(label, fn) {
  const a = $("#act"); a.innerHTML = '<button class="btn" id="nx">' + label + "</button>";
  $("#nx").onclick = fn;
}
function endSession() { if (S && S.timer) clearInterval(S.timer); S = null; }
$("#homeBtn").onclick = () => {
  if (S && S.phase >= 0 && S.phase < 4 && !confirm("Leave this quest? Your progress in this quest won’t be saved.")) return;
  top();
};

/* ---------- access gate + offline ---------- */
function gate(msg) {
  endSession(); chrome(false);
  stage.innerHTML = '<div class="card center"><h2>Family code</h2><p class="tiny">' + esc(msg || "Ask Mum or Dad for the code.") + '</p><input class="field" id="code" type="password" autocomplete="current-password" placeholder="Family code"><div class="actions" style="margin-top:12px"><button class="btn" id="codeGo">Open</button></div></div>';
  say("Psst! What’s the secret family code?", []);
  const go = () => { ACCESS = $("#code").value.trim(); lsSet("wq_access", ACCESS); init(); };
  $("#codeGo").onclick = go; $("#code").onkeydown = e => { if (e.key === "Enter") go(); };
}
function offline() {
  endSession(); chrome(false);
  stage.innerHTML = '<div class="card center"><h2>Can’t reach the quest server</h2><p class="tiny">Check the internet and try again.</p><div class="actions" style="margin-top:12px"><button class="btn" id="retry">Try again</button></div></div>';
  say("Hoo-hoo! I can’t find the quest server right now.", []);
  $("#retry").onclick = init;
}
async function refresh() { APP.state = await api("/api/state?today=" + today() + "&subject=" + SUBJECT); }

/* =====================================================================
   HOME / MAP / VAULT / BADGES
   ===================================================================== */
function top() {
  endSession(); setSubject(null); chrome(false); renderTrack(); window.scrollTo(0, 0);
  const st = APP.state, ov = st.overview;
  say("Hi " + st.name + "! What shall we play today?", []);
  const sub = sb => {
    const o = ov[sb];
    const line1 = o.next ? "Next: " + o.next.emoji + " " + o.next.title : "All quests done!";
    const line2 = o.due ? " · 🔁 " + o.due + (sb === "maths" ? " skill" : " word") + (o.due > 1 ? "s" : "") + " to review" : "";
    return esc(line1) + "<br>" + o.done + " of " + o.total + " quests done" + esc(line2) +
      "<br>⭐ " + o.stars + " · 🔥 " + o.streak.count + "-day streak · " + esc(o.rank.icon + " " + o.rank.title);
  };
  stage.innerHTML =
    '<div class="subjgrid"><button class="subj eng" id="sEng"><span class="big" aria-hidden="true">📚</span><span><b>Love English</b><small>' + sub("english") + '</small></span></button>' +
    '<button class="subj mth" id="sMath"><span class="big" aria-hidden="true">💰</span><span><b>Money Maths</b><small>' + sub("maths") + '</small></span></button></div>' +
    '<p class="tiny center"><a href="/parent">Parent area</a></p>';
  $("#sEng").onclick = () => enter("english");
  $("#sMath").onclick = () => enter("maths");
}
async function enter(sb) {
  setSubject(sb);
  try { await refresh(); } catch (e) { if (e.auth) { gate(); return; } offline(); return; }
  home();
}

function home() {
  endSession(); chrome(false); renderTrack(); window.scrollTo(0, 0);
  const st = APP.state, n = st.next, mt = META[SUBJECT];
  const due = (st.dueWords || []).length;
  const unit = SUBJECT === "maths" ? "skill" : "word";
  let greet;
  if (SUBJECT === "maths") greet = st.streak.playedToday ? "Back for more money maths? I’m Penny, and I’m ready!" : "Hi " + st.name + "! I’m Penny the piggy bank. Ready to learn how real shops make money?";
  else greet = st.streak.playedToday ? "Great to see you again, " + st.name + "! Want another quest?" : st.streak.count > 0 ? "Welcome back, " + st.name + "! You’re on a " + st.streak.count + "-day streak. Ready?" : "Hi " + st.name + "! I’m Hooty, your word coach. Ready for a 15-minute quest?";
  say(greet, []);

  let main;
  if (n) {
    main = '<div class="card center"><div class="small">' + esc(mt.name) + ' · Quest ' + n.id + '</div><div class="scene" aria-hidden="true">' + esc(n.emoji) + '</div><h2>' + esc(n.title) + '</h2><p class="tiny">' +
      (n.kind === "grammar" ? "Grammar quest" : mt.quest) + ' · about 15 minutes</p>' +
      (due ? '<div class="meanbox">🔁 ' + due + " " + unit + (due > 1 ? "s are" : " is") + ' ready for review in your warm-up</div>' : "") +
      '<button class="btn wide" id="go">Start the quest</button></div>';
  } else {
    main = '<div class="card center"><div class="scene" aria-hidden="true">🎉</div><h2>You finished every quest!</h2><p class="tiny">Ask Mum or Dad to add new ones. Meanwhile, replay your favourites from the map.</p><button class="btn wide" id="map2">Open the quest map</button></div>';
  }
  const prac = st.practice && st.practice.available
    ? '<div class="card center"><div class="small">Optional · about 10 minutes</div><h3>🎯 Practice time</h3><p class="tiny">Some ' + (SUBJECT === "maths" ? "skills" : "words") + ' need another go: ' + esc(st.practice.labels.join(", ")) + '.</p><button class="btn alt wide" id="prac">Practise the tricky ones</button></div>' : "";
  stage.innerHTML = main + prac +
    '<div class="card"><div class="stats"><div><b>⭐ ' + st.stars + '</b>stars</div><div><b>🔥 ' + st.streak.count + '</b>day streak</div><div><b>' + esc(st.rank.icon) + '</b>' + esc(st.rank.title) + '</div></div>' +
    (st.rank.next ? '<p class="tiny" style="margin:10px 0 0">' + st.rank.next.need + " more badge" + (st.rank.next.need > 1 ? "s" : "") + " to become a " + esc(st.rank.next.title) + "</p>" : "") + '</div>' +
    '<div class="menu"><button id="mMap"><span>🗺️</span>Quest map</button><button id="mVault"><span>' + (SUBJECT === "maths" ? "🧮" : "📚") + '</span>' + (SUBJECT === "maths" ? "Skill vault" : "Word vault") + '</button><button id="mBadges"><span>🏅</span>Badges</button></div>' +
    '<p class="tiny center"><button class="mini" id="toTop">← Switch subject</button></p>';
  if (n) $("#go").onclick = () => startQuest(n.id, false);
  else $("#map2").onclick = questMap;
  if ($("#prac")) $("#prac").onclick = startPractice;
  $("#mMap").onclick = questMap; $("#mVault").onclick = vault; $("#mBadges").onclick = () => badgesScreen(home);
  $("#toTop").onclick = top;
}

function subScreen(title, html, msg, back) {
  endSession(); chrome(false); window.scrollTo(0, 0);
  stage.innerHTML = '<button class="btn alt back" id="back">Back</button><h2>' + esc(title) + "</h2>" + html;
  $("#back").onclick = back || home;
  if (msg) say(msg, []);
}

function questMap() {
  const st = APP.state;
  const rows = st.quests.map(q => {
    const isNext = st.next && q.id === st.next.id;
    const locked = !q.done && !isNext;
    const cls = isNext ? "now" : q.done ? "done" : "lock";
    const tag = isNext ? "Up next" : q.done ? "✓ Done. Tap to replay" : "Locked";
    const kind = q.kind === "grammar" ? "Grammar" : q.kind === "maths" ? "Maths" : "Words";
    return '<button class="node ' + cls + '" data-id="' + q.id + '" ' + (locked ? "disabled" : "") + '><span class="e">' + esc(q.emoji) + '</span><span>Quest ' + q.id + " · " + esc(q.title) + "<small>" + kind + " · " + tag + "</small></span></button>";
  }).join("");
  subScreen("Quest map", rows, "Here’s your adventure path. Tap a finished quest to play it again!");
  [].forEach.call(stage.querySelectorAll(".node"), b => {
    b.onclick = () => { const id = +b.dataset.id; startQuest(id, !(st.next && id === st.next.id)); };
  });
}

function vault() {
  const st = APP.state, maths = SUBJECT === "maths";
  const med = { bronze: "🥉 Bronze", silver: "🥈 Silver", gold: "🥇 Gold" };
  const words = st.words.slice().sort((a, b) => b.box - a.box || (a.label < b.label ? -1 : 1));
  const body = words.length
    ? '<p class="tiny">' + (maths ? "Skills" : "Words") + ' turn silver and gold when you get them right in your warm-ups. Tap a card to hear it.</p><div class="vgrid">' +
      words.map(w => '<button class="vcard ' + w.medal + '" data-w="' + esc(w.w) + '"><b>' + esc(w.emoji || "") + " " + esc(w.label) + "</b><span>" + esc(w.mean || "") + "</span><span>" + med[w.medal] + (maths ? " · Level " + (w.lvl || 1) : "") + "</span></button>").join("") + "</div>"
    : '<div class="card center"><div class="scene">' + (maths ? "🧮" : "📚") + '</div><p>Your vault is empty. Finish a quest to collect your first ' + (maths ? "skills" : "words") + '!</p></div>';
  subScreen((maths ? "Skill vault (" : "Word vault (") + words.length + ")", body, words.length ? "Look at everything you’ve learned! Tap one to hear it." : "Your vault is waiting for its first one.");
  [].forEach.call(stage.querySelectorAll(".vcard"), b => {
    const w = words.filter(x => x.w === b.dataset.w)[0];
    b.onclick = () => maths ? speak(w.label + ". " + w.mean) : speak(w.w, 0.7, true);
  });
}

function badgesScreen(back) {
  const st = APP.state, cat = st.badgeCatalog, have = new Set(st.badges);
  const ids = Object.keys(cat);
  const body = '<p class="tiny">' + st.badges.length + " of " + ids.length + " collected · " + esc(st.rank.icon + " " + st.rank.title) + "</p><div class=\"bgrid\">" +
    ids.map(id => '<div class="bd ' + (have.has(id) ? "" : "off") + '"><i>' + esc(cat[id].icon) + "</i>" + esc(cat[id].name) + "<br><span class=\"small\">" + esc(cat[id].desc) + "</span></div>").join("") + "</div>";
  subScreen("Badges", body, "Every badge you earn takes you closer to the next rank!", typeof back === "function" ? back : home);
}

/* =====================================================================
   QUEST RUNNER
   ===================================================================== */
async function startPractice() {
  let q;
  try { q = await api("/api/practice?subject=" + SUBJECT); } catch (e) { if (e.auth) { gate(); return; } toast("Nothing to practise right now."); return; }
  launch(q, false);
}
async function startQuest(id, replay) {
  let q;
  try { q = await api("/api/quest/" + id + "?subject=" + SUBJECT); } catch (e) { if (e.auth) { gate(); return; } toast("Could not load the quest. Try again."); return; }
  launch(q, replay);
}
function launch(q, replay) {
  endSession();
  S = { q, subject: SUBJECT, replay: !!replay, sid: Math.random().toString(36).slice(2) + Date.now().toString(36), t0: Date.now(), timer: null, elapsed: 0,
        stars: 0, hints: 0, wrong: 0, badges: [], created: [], rate: {}, log: {}, wordRes: {}, reviewRes: {}, ctx: "", now: "", phase: -1 };
  S.timer = setInterval(tick, 1000);
  setStars(0); $("#clock").textContent = "00:00";
  go(0);
}
function go(n) {
  S.phase = n; chrome(true); renderTrack(); stage.innerHTML = ""; window.scrollTo(0, 0);
  [warm, meet, play, create, report][n]();
}
function wr(w, ok) { const r = S.wordRes[w] = S.wordRes[w] || { right: 0, wrong: 0 }; if (ok) r.right++; else r.wrong++; }

/* ---------- 1. warm-up ---------- */
function warm() {
  const maths = S.subject === "maths";
  S.ctx = maths ? "Warm-up: matching sums with their answers" : "Warm-up: matching words with their twins or meanings";
  const own = maths ? (S.q.skills || []) : (S.q.words || []).map(w => w.w);
  const due = (APP.state.dueWords || []).filter(w => own.indexOf(w.w) < 0 && (!maths || M.has(w.w))).slice(0, 4);
  const pairs = [];
  due.forEach(w => {
    if (maths) {
      let pr, t = 0;
      do { pr = M.pair(w.w, lvlOf(w.w)); t++; } while (t < 8 && pairs.some(p => p.b === pr.b));
      pairs.push({ k: w.w, a: pr.a, b: pr.b, bad: 0 });
    } else pairs.push({ k: w.w, a: w.w, b: w.mean, bad: 0 });
  });
  S.q.warm.slice(0, 4 - pairs.length).forEach(p => pairs.push({ k: null, a: String(p[0]), b: String(p[1]), bad: 0 }));
  const R = shuffle(pairs.map((p, i) => ({ i, b: p.b })));
  const title = maths ? (due.length ? "Old skills, new numbers!" : "Warm up your number brain!") : (due.length ? "Old words, new tricks!" : "Wake up your brain!");
  const how = maths ? "Tap a sum, then tap its answer." : "Tap a word, then tap the one that matches it" + (due.length ? " or tells what it means" : "") + ".";
  stage.innerHTML = '<div class="card"><h3>' + title + '</h3><p class="tiny">' + how + '</p><div class="pairs"><div id="L">' +
    pairs.map((p, i) => '<button class="tile" data-i="' + i + '">' + esc(p.a) + "</button>").join("") + '</div><div id="R">' +
    R.map(r => '<button class="tile" data-i="' + r.i + '">' + esc(r.b) + "</button>").join("") + '</div></div></div><div class="actions" id="act"></div>';
  say(maths ? (due.length ? "Warm-up time! Some old skills want another go." : "Let’s warm up with some quick sums!") : (due.length ? "Warm-up time! Some of your old words want to say hello again." : "Let’s wake up your brain! Match each word with its twin."),
      maths ? ["Start with the sum you can do fastest.", "Work each sum out in your head, then look for the answer."] : ["Start with the pair you’re surest about.", "Say each word out loud. Which ones sound like they go together?"]);
  let selL = null, matched = 0;
  const L = [].slice.call(stage.querySelectorAll("#L .tile")), Rr = [].slice.call(stage.querySelectorAll("#R .tile"));
  L.forEach(b => { b.onclick = () => { if (b.classList.contains("done")) return; L.forEach(x => x.classList.remove("sel")); b.classList.add("sel"); selL = b; }; });
  Rr.forEach(b => { b.onclick = () => {
    if (b.classList.contains("done")) return;
    if (!selL) { say(maths ? "Pick a sum on the left first!" : "Pick a word on the left first!"); return; }
    const p = pairs[+selL.dataset.i];
    if (selL.dataset.i === b.dataset.i) {
      selL.classList.remove("sel"); selL.classList.add("done"); b.classList.add("done"); selL = null; matched++; good();
      if (p.k) S.reviewRes[p.k] = p.bad ? { right: 0, wrong: p.bad } : { right: 1, wrong: 0 };
      if (matched === pairs.length) { addStars(2); badge("warm"); burst(); say("Brain switched on! Let’s go.", []); nextBtn(S.q.kind === "grammar" ? "Learn the rules" : maths ? "Learn the skills" : "Meet the words", () => go(1)); }
      else say("Yes! Match found.");
    } else {
      p.bad++; S.wrong++; S.log.warm = S.log.warm || { wrong: 0 }; S.log.warm.wrong++;
      oops(); shake(b); shake(selL); say("Almost! Those two don’t go together. Try again.");
    }
  }; });
}

/* ---------- 2. meet ---------- */
function meet() {
  S.ctx = "Learning the " + (S.q.kind === "grammar" ? "rules" : S.q.kind === "maths" ? "skills" : "words");
  (S.q.kind === "grammar" ? meetGrammar : S.q.kind === "maths" ? meetMaths : meetWords)();
}
const spoken = t => String(t).replace(/₹/g, "rupees ").replace(/×/g, " times ").replace(/÷/g, " divided by ").replace(/−/g, " minus ").replace(/→/g, " gives ").replace(/≈/g, " is about ");
function meetMaths() {
  let i = 0;
  const U = S.q.units;
  function show() {
    const u = U[i];
    stage.innerHTML = '<div class="card center"><div class="small">' + esc(S.q.title) + " · skill " + (i + 1) + " of " + U.length + '</div><div class="scene" aria-hidden="true">' + esc(u.emoji) +
      '</div><div class="rulet">' + esc(u.title) + '</div><p class="story">' + esc(u.text) + '</p><div class="meanbox">Example: ' + esc(u.ex) + '</div><div class="row"><button class="btn alt" id="hx">🔊 Hear it</button></div></div><div class="actions"><button class="btn" id="nx">' + (i < U.length - 1 ? "Next skill" : "Let’s play!") + "</button></div>";
    S.now = "Learning: " + u.title;
    say(i === 0 ? S.q.intro : "Here’s the next skill.", []);
    $("#hx").onclick = () => speak(spoken(u.text + " For example: " + u.ex));
    $("#nx").onclick = () => { i++; if (i < U.length) show(); else go(2); };
  }
  show();
}

function meetWords() {
  let i = 0;
  const W = S.q.words;
  function show() {
    const x = W[i];
    const line = esc(x.line).replace(x.w, '<button class="hl" id="hl">' + esc(x.w) + "</button>");
    stage.innerHTML = '<div class="card center"><div class="small">' + esc(S.q.title) + " · word " + (i + 1) + " of " + W.length + '</div><div class="scene" aria-hidden="true">' + esc(x.emoji) +
      '</div><p class="story">' + line + '</p><div class="meanbox" id="mean">👆 Tap the glowing word to find out what it means.</div><div class="small">Say it like</div><div class="resp">' + esc(x.say) + '</div><p class="tiny">' + esc(x.tip) +
      '</p><div class="row"><button class="btn alt" id="hw">🔊 Hear the word</button><button class="btn alt" id="hs">🔊 Hear the line</button></div></div><div class="actions"><button class="btn" id="nx">' + (i < W.length - 1 ? "Next word" : "Let’s play!") + "</button></div>";
    S.now = "Looking at the word " + x.w;
    say(i === 0 ? S.q.intro : "Next word! Tap the glowing one.", []);
    $("#hl").onclick = () => { $("#mean").innerHTML = "<b>" + esc(x.w) + "</b> means <b>" + esc(x.mean) + "</b>."; speak(x.w, 0.65, true); };
    $("#hw").onclick = () => speak(x.w, 0.65, true);
    $("#hs").onclick = () => speak(x.line);
    $("#nx").onclick = () => { i++; if (i < W.length) show(); else go(2); };
  }
  show();
}

function meetGrammar() {
  let i = 0;
  const R = S.q.rules;
  function show() {
    const r = R[i];
    stage.innerHTML = '<div class="card center"><div class="small">' + esc(S.q.title) + " · rule " + (i + 1) + " of " + R.length + '</div><div class="scene" aria-hidden="true">' + esc(r.emoji) +
      '</div><div class="rulet">' + esc(r.t) + '</div><p class="story">' + esc(r.ex) + '</p><div class="row"><button class="btn alt" id="hx">🔊 Hear it</button></div></div><div class="actions"><button class="btn" id="nx">' + (i < R.length - 1 ? "Next" : "Let’s play!") + "</button></div>";
    S.now = "Reading the rule: " + r.t;
    say(i === 0 ? S.q.intro : i === R.length - 1 ? "Memory trick: " + S.q.tip : "Got it? Here’s the next one.", []);
    $("#hx").onclick = () => speak(r.ex);
    $("#nx").onclick = () => { i++; if (i < R.length) show(); else go(2); };
  }
  show();
}

/* ---------- 3. play ---------- */
function play() {
  const games = S.q.kind === "grammar" ? [gGaps, gSpot, gSayLines] : S.q.kind === "maths" ? [mDrag, mQuiz, mSpot, mCalc] : S.q.practice ? [gMean, gSilly, gSayWords] : [gDrag, gMean, gSilly, gSayWords];
  let i = 0;
  const nxt = () => { if (i >= games.length) { go(3); return; } const n = ++i; games[n - 1](nxt, n, games.length); };
  nxt();
}

function quiz(title, items, key, done) {
  S.log[key] = { first: 0, total: items.length, wrong: 0 };
  let q = 0;
  function show() {
    const it = items[q]; let tries = 0;
    const order = shuffle(it.opts.map((t, i) => ({ t, i })));
    S.now = it.q + (it.pre ? " " + it.pre.replace(/<[^>]+>/g, "") : "");
    stage.innerHTML = '<div class="card"><div class="small">' + esc(title) + " · question " + (q + 1) + " of " + items.length + "</div><h3>" + esc(it.q) + "</h3>" +
      (it.pre ? '<span class="sentq">' + it.pre + "</span>" : "") + '<div id="opts">' +
      order.map((o, k) => '<button class="opt" data-i="' + o.i + '"><b>' + "ABC"[k] + "</b><span>" + esc(o.t) + "</span></button>").join("") + '</div></div><div class="actions" id="act"></div>';
    say("Take your time. Tap Help me if you’d like a hint!", it.hints);
    [].forEach.call(stage.querySelectorAll(".opt"), b => { b.onclick = () => {
      if (b.disabled) return;
      if (+b.dataset.i === it.ans) {
        b.classList.add("ok");
        [].forEach.call(stage.querySelectorAll(".opt"), x => { x.disabled = true; });
        good();
        if (tries === 0) { S.log[key].first++; addStars(2); if (it.w) wr(it.w, true); } else addStars(1);
        say(it.why, []);
        nextBtn(q < items.length - 1 ? "Next" : "Continue", () => {
          q++;
          if (q < items.length) show();
          else { if (key === "silly" || key === "spot") { if (S.log[key].first === items.length) badge("eyes"); } done(); }
        });
      } else {
        tries++; S.wrong++; S.log[key].wrong++; if (it.w) wr(it.w, false);
        b.classList.add("no"); b.disabled = true; oops();
        say(tries >= 2 && it.remind ? it.remind : "Hmm, not that one. Have another look!");
      }
    }; });
  }
  show();
}

function dragCore(done, n, total, heading, items, hints) {
  S.ctx = "Game: dragging answers into gaps";
  stage.innerHTML = '<div class="card"><div class="small">Game ' + n + " of " + total + ' · Drag it in</div><h3>' + esc(heading) + '</h3><p class="tiny">Or tap one, then tap a gap.</p>' +
    items.map(it => '<p class="sent">' + esc(it.s).replace("___", '<span class="gap" tabindex="0" data-ans="' + esc(it.ans) + '" data-key="' + esc(it.key) + '"></span>') + "</p>").join("") +
    '<div class="bank" id="bank">' + shuffle(items.map(i => i.ans)).map(a => '<button class="chip" data-w="' + esc(a) + '">' + esc(a) + "</button>").join("") + '</div></div><div class="actions" id="act"></div>';
  S.now = "Dragging answers into gaps";
  say(heading, hints);
  let sel = null, filled = 0, firstTry = 0;
  const bank = $("#bank");
  function select(ch) {
    if (sel === ch) { ch.classList.remove("sel"); sel = null; return; }
    [].forEach.call(bank.querySelectorAll(".chip"), c => c.classList.remove("sel"));
    ch.classList.add("sel"); sel = ch;
  }
  function place(ch, g) {
    if (g.classList.contains("filled") || ch.classList.contains("used")) return;
    const word = ch.dataset.w, tries = +(g.dataset.t || 0);
    if (word === g.dataset.ans) {
      g.textContent = word; g.classList.add("filled"); ch.classList.add("used"); ch.disabled = true; ch.classList.remove("sel"); sel = null; good(); filled++;
      if (tries === 0) { firstTry++; addStars(1); wr(g.dataset.key, true); }
      say("Yes! That fits perfectly.");
      if (filled === items.length) {
        S.log.drag = { first: firstTry, total: items.length, wrong: S.log.drag ? S.log.drag.wrong : 0 };
        if (S.log.drag.wrong <= 1) badge("drag");
        burst(); say("All in place. Nice work!", []); nextBtn("Next game", done);
      }
    } else {
      g.dataset.t = tries + 1; S.wrong++; S.log.drag = S.log.drag || { first: 0, total: items.length, wrong: 0 }; S.log.drag.wrong++;
      wr(g.dataset.key, false); oops(); shake(g); say("Hmm, “" + word + "” doesn’t fit there. Have another look!");
    }
  }
  [].forEach.call(stage.querySelectorAll(".gap"), g => {
    g.onclick = () => { if (sel) place(sel, g); };
    g.onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && sel) { e.preventDefault(); place(sel, g); } };
  });
  [].forEach.call(bank.querySelectorAll(".chip"), ch => {
    ch.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!ch.classList.contains("used")) select(ch); } };
    ch.addEventListener("pointerdown", e => {
      if (ch.classList.contains("used")) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY; let ghost = null;
      const mv = ev => {
        if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) { ghost = ch.cloneNode(true); ghost.classList.add("ghost"); document.body.appendChild(ghost); ch.classList.add("lift"); }
        if (ghost) { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; }
      };
      const up = ev => {
        window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
        if (ghost) {
          ghost.remove(); ch.classList.remove("lift");
          const t = document.elementFromPoint(ev.clientX, ev.clientY), g = t && t.closest ? t.closest(".gap") : null;
          if (g) place(ch, g);
        } else select(ch);
      };
      window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    });
  });
}

function gDrag(done, n, total) {
  const W = S.q.words;
  dragCore(done, n, total, "Drag each word into the right gap.", W.map(w => ({ s: w.gap, ans: w.w, key: w.w })),
    ["Read each sentence and ask: which word fits the feeling?"].concat(W.map(w => "“" + w.w + "” means " + w.mean + ".")));
}

/* ---------- Money Maths games ---------- */
function mProblems(ids) {
  const used = {}, out = [];
  ids.forEach(id => {
    let p, t = 0, a;
    do { p = M.gen(id, lvlOf(id)); a = M.fmt(p.ans, p.unit); t++; } while (t < 12 && used[a]);
    used[a] = 1; out.push(Object.assign({ id, ansS: a }, p));
  });
  return out;
}
function mDrag(done, n, total) {
  S.ctx = "Game: dragging answers into the right sums";
  const ps = mProblems(S.q.skills);
  dragCore(done, n, total, "Drag each answer into the right sum.", ps.map(p => ({ s: p.expr + " = ___", ans: p.ansS, key: p.id })),
    ["Work out each sum in your head first.", "Start with the easiest one.", "Try the smallest numbers first."]);
}
function mQuiz(done, n, total) {
  S.ctx = "Game: picking the right answer to a business problem";
  const items = shuffle(S.q.skills).slice(0, 3).map(id => {
    const p = M.gen(id, lvlOf(id)), o = M.options(p);
    return { q: p.q, opts: o.opts, ans: o.ans, why: "Yes! " + p.why, w: id, hints: p.hint, remind: p.hint[0] };
  });
  quiz("Game " + n + " of " + total + " · Pick the answer", items, "mean", done);
}
function mSpot(done, n, total) {
  S.ctx = "Game: spotting the calculation that is wrong";
  const items = shuffle(S.q.skills).slice(0, 2).map(id => {
    const sp = M.spot(id, lvlOf(id));
    return { q: "One of these calculations is wrong. Which one?", opts: sp.opts, ans: sp.ans, why: "Spotted it! " + sp.why, w: id, hints: ["Work each one out yourself and compare."].concat(sp.hint), remind: "Work each one out yourself and compare." };
  });
  quiz("Game " + n + " of " + total + " · Spot the mistake", items, "spot", done);
}
function mCalc(done, n, total) {
  S.ctx = "Game: working out answers and tapping them in on the number pad";
  const ids = shuffle(S.q.skills).slice(0, 3);
  S.log.calc = { first: 0, total: ids.length, wrong: 0 };
  let i = 0;
  function show() {
    const id = ids[i], p = M.gen(id, lvlOf(id)); let val = "", tries = 0, fin = false;
    if (lsGet("wq_debug") === "1") window.__wqAns = p.ans;
    const pre = p.unit === "₹" ? "₹ " : "", suf = p.unit === "%" ? " %" : (p.unit && p.unit !== "₹" ? " " + p.unit : "");
    stage.innerHTML = '<div class="card"><div class="small">Game ' + n + " of " + total + " · Crunch the number · " + (i + 1) + " of " + ids.length + "</div><h3>" + esc(p.q) + '</h3><div class="answer" id="disp" aria-live="polite"></div><div class="pad" id="pad">' +
      [7, 8, 9, 4, 5, 6, 1, 2, 3].map(d => '<button data-k="' + d + '">' + d + "</button>").join("") + '<button data-k="back" aria-label="Delete">⌫</button><button data-k="0">0</button><button class="go" data-k="ok" aria-label="Check">✓</button></div></div><div class="actions" id="act"></div>';
    S.now = p.q;
    say("Work it out, then tap the number in. Tap Help me if you’re stuck!", p.hint);
    const draw = () => { $("#disp").textContent = pre + (val || "?") + (val ? suf : ""); };
    draw();
    [].forEach.call($("#pad").querySelectorAll("button"), b => { b.onclick = () => {
      if (fin) return;
      const k = b.dataset.k;
      if (k === "back") { val = val.slice(0, -1); draw(); return; }
      if (k !== "ok") { if (val.length < 7) val += k; draw(); return; }
      if (!val) { say("Tap some digits first."); return; }
      if (+val === p.ans) {
        fin = true; good();
        if (tries === 0) { S.log.calc.first++; addStars(3); wr(id, true); } else addStars(1);
        $("#disp").classList.add("ok"); say("Yes! " + p.why, []);
        nextBtn(i < ids.length - 1 ? "Next" : "Finish the games", () => { i++; if (i < ids.length) show(); else { if (S.log.calc.first === ids.length) badge("calc"); done(); } });
      } else {
        tries++; S.wrong++; S.log.calc.wrong++; wr(id, false); oops(); shake($("#disp")); val = ""; draw();
        if (tries >= 3) {
          fin = true; say("The answer is " + M.fmt(p.ans, p.unit) + ". " + p.why, []);
          nextBtn(i < ids.length - 1 ? "Next" : "Finish the games", () => { i++; if (i < ids.length) show(); else done(); });
        } else say("Not quite. " + p.hint[Math.min(tries - 1, p.hint.length - 1)]);
      }
    }; });
  }
  show();
}

function gMean(done, n, total) {
  S.ctx = "Game: picking the right meaning";
  const W = S.q.words;
  const items = shuffle(W).slice(0, 3).map(w => ({
    q: w.quiz.q, opts: w.quiz.opts, ans: w.quiz.ans, why: w.quiz.why, w: w.w,
    hints: ["Remember: “" + w.w + "” means " + w.mean + ".", "Cross out the answers that can’t be right."],
    remind: "Remember, “" + w.w + "” means " + w.mean + "."
  }));
  quiz("Game " + n + " of " + total + " · Pick the meaning", items, "mean", done);
}
function gSilly(done, n, total) {
  S.ctx = "Game: spotting the silly sentence that uses a word wrongly";
  const items = shuffle(S.q.words).slice(0, 2).map(w => ({
    q: "One sentence uses “" + w.w + "” in a silly way. Which one?", opts: w.silly.opts, ans: w.silly.ans, why: w.silly.why, w: w.w,
    hints: ["“" + w.w + "” means " + w.mean + ". Which sentence doesn’t match that?"],
    remind: "Remember, “" + w.w + "” means " + w.mean + "."
  }));
  quiz("Game " + n + " of " + total + " · Spot the silly one", items, "silly", done);
}
function gGaps(done, n, total) {
  S.ctx = "Game: choosing the right word to fill each gap";
  const items = S.q.gaps.map(g => ({
    q: "Fill the gap", pre: esc(g.s).replace("___", "<b>_____</b>"), opts: g.opts, ans: g.ans, why: g.why,
    hints: [S.q.tip, "Read the sentence out loud with each choice. Which one sounds right?"], remind: S.q.tip
  }));
  quiz("Game " + n + " of " + total + " · Fill the gap", items, "gaps", done);
}
function gSpot(done, n, total) {
  S.ctx = "Game: spotting the correct sentence";
  const items = S.q.spot.map(s => ({ q: s.q, opts: s.opts, ans: s.ans, why: s.why, hints: [S.q.tip, "Read each choice out loud, one at a time."], remind: S.q.tip }));
  quiz("Game " + n + " of " + total + " · Spot the right one", items, "spot", done);
}

function sayGame(n, total, targets, done, isWords) {
  S.ctx = "Game: saying " + (isWords ? "words" : "sentences") + " aloud";
  S.log.say = { ok: 0, self: 0, total: targets.length };
  let k = 0;
  function show() {
    const x = targets[k]; let got = false;
    stage.innerHTML = '<div class="card center"><div class="small">Game ' + n + " of " + total + " · Say it aloud · " + (k + 1) + " of " + targets.length + "</div>" +
      (isWords ? '<div class="bigword">' + esc(x.text) + '</div><div class="resp">' + esc(x.say) + '</div><p class="tiny">' + esc(x.tip) + "</p>" : '<div class="sayline">' + esc(x.text) + "</div>") +
      '<div class="row"><button class="btn alt" id="ls">🔊 Listen</button><button class="btn" id="mic">🎤 Say it</button></div><p class="stat" id="stat" aria-live="polite"></p><button class="mini" id="self">I said it out loud</button></div><div class="actions" id="act"></div>';
    S.now = "Saying " + x.text;
    say(isWords ? "Listen first, then say “" + x.text + "” like me. " + x.tip : "Listen to me read it, then you read it. Take it slowly!",
        isWords ? ["Break it into parts: " + x.say + ".", "Say it slowly first, then a bit faster."] : ["Read it in small chunks, then say the whole thing.", "Listen again, then copy the rhythm."]);
    const win = self => {
      if (got) return; got = true;
      if (self) { S.log.say.self++; addStars(1); } else { S.log.say.ok++; addStars(3); }
      good(); burst(); $("#stat").textContent = "⭐ Great job!"; say("Lovely! That sounded really good.", []);
      nextBtn(k < targets.length - 1 ? "Next one" : "Finish the games", () => { k++; if (k < targets.length) show(); else { if (S.log.say.ok >= 1) badge("sound"); done(); } });
    };
    $("#ls").onclick = () => speak(x.text, isWords ? 0.65 : 0.85, isWords);
    $("#self").onclick = () => win(true);
    $("#mic").onclick = () => {
      $("#stat").textContent = "🎤 Listening… say it now!";
      listen(r => {
        if (got) return;
        if (r.heard) {
          if (heardMatch(x.text, r.heard)) win(false);
          else { $("#stat").textContent = "I heard “" + r.heard[0] + "”. Try again!"; say("Close! Listen once more, then try again." + (x.tip ? " " + x.tip : "")); }
        } else $("#stat").textContent = "The mic isn’t working here. Say it out loud, then tap “I said it out loud”.";
      });
    };
  }
  show();
}
function gSayWords(done, n, total) {
  const W = S.q.words, idx = S.q.say || [0, 1];
  sayGame(n, total, idx.map(i => ({ text: W[i].w, say: W[i].say, tip: W[i].tip })), done, true);
}
function gSayLines(done, n, total) {
  sayGame(n, total, S.q.say.map(t => ({ text: t })), done, false);
}

/* ---------- 4. create ---------- */
function create() {
  S.ctx = S.q.kind === "grammar" ? "Building sentences from scrambled words" : S.q.kind === "maths" ? "A shop challenge" : "Making a silly sentence of her own";
  if (S.q.kind === "grammar") unscramble(S.q.build, () => nextBtn("Finish the quest", () => go(4)));
  else if (S.q.kind === "maths") createMaths();
  else createWords();
}

function createWords() {
  const W = S.q.words;
  let pick = { w: null, a: null, b: null }, made = false;
  stage.innerHTML = '<div class="card"><div class="small">Make your own</div><h3>Build a silly sentence!</h3><p class="tiny">Pick one from each row.</p><div class="lbl">Pick a word</div><div class="chips" id="g1"></div>' +
    '<div id="more" hidden><div class="lbl">Pick how it starts</div><div class="chips" id="g2"></div><div class="lbl">Pick how it ends</div><div class="chips" id="g3"></div></div>' +
    '<div class="preview" id="pv">Pick a word to begin.</div><div class="row"><button class="btn alt" id="rd" disabled>🔊 Read it aloud</button><button class="btn" id="ok" disabled>I love it!</button></div></div><div class="actions" id="act"></div>';
  S.now = "Building a silly sentence";
  say("Now it’s your turn! Build the silliest sentence you can.", ["Try a word you’re not so sure about. A silly sentence helps you remember it."]);
  const sentence = () => pick.a + " " + pick.w + " " + pick.b;
  const ready = () => pick.w && pick.a && pick.b;
  function upd() {
    $("#pv").innerHTML = pick.w ? esc(pick.a || "…") + " <b>" + esc(pick.w) + "</b> " + esc(pick.b || "…") : "Pick a word to begin.";
    $("#rd").disabled = !ready(); $("#ok").disabled = !ready();
  }
  function grp(id, arr, key, onPick) {
    const box = $(id);
    box.innerHTML = arr.map(a => '<button class="chip pick" data-v="' + esc(a) + '">' + esc(a) + "</button>").join("");
    [].forEach.call(box.querySelectorAll(".chip"), b => { b.onclick = () => {
      [].forEach.call(box.querySelectorAll(".chip"), c => c.classList.remove("sel"));
      b.classList.add("sel"); pick[key] = b.dataset.v; if (onPick) onPick(); upd();
    }; });
  }
  grp("#g1", W.map(x => x.w), "w", () => {
    const x = W.filter(v => v.w === pick.w)[0]; pick.a = null; pick.b = null;
    $("#more").hidden = false; grp("#g2", x.build.a, "a"); grp("#g3", x.build.b, "b");
  });
  upd();
  $("#rd").onclick = () => { if (ready()) speak(sentence()); };
  $("#ok").onclick = () => {
    if (!ready()) return;
    const text = sentence();
    if (!S.created.some(c => c.text === text)) S.created.push({ word: pick.w, text });
    if (!made) { made = true; addStars(3); badge("story"); burst(); say("Ha! That’s a great sentence. Press the speaker to hear it, or build another!", []); nextBtn("Finish the quest", () => go(4)); }
    else say("Even better! Build more, or finish the quest.");
  };
}

function shopDone(text, stars, msg) {
  S.created.push({ word: "shop", text });
  addStars(stars); badge("shopkeeper"); burst(); say(msg, []);
  nextBtn("Finish the quest", () => go(4));
}
function createMaths() {
  const c = S.q.create, inr = M.inr;
  S.now = c.prompt;
  if (c.type === "budget") {
    let basket = [];
    stage.innerHTML = '<div class="card"><div class="small">Shop challenge</div><h3>Fill the basket</h3><p class="tiny">' + esc(c.prompt) + '</p><div class="shopgrid" id="items">' +
      c.items.map((it, i) => '<button class="shopitem" data-i="' + i + '"><span>' + esc(it.e) + "</span><b>" + esc(it.n) + "</b><small>" + inr(it.p) + "</small></button>").join("") +
      '</div><div class="lbl">Your basket <span class="small">(tap an item to take it out)</span></div><div class="chips" id="basket"></div><div class="totalbar" id="tot"></div><div class="row"><button class="btn" id="ok" disabled>I’m done!</button></div></div><div class="actions" id="act"></div>';
    say("Tap items to add them to the basket. Try to hit the target exactly!", ["Start with the biggest item that fits.", "Then fill the gap with smaller items.", "Add up as you go. Tap an item in the basket if you go over."]);
    const total = () => basket.reduce((s, i) => s + c.items[i].p, 0);
    const draw = () => {
      const t = total(), over = t > c.target;
      $("#basket").innerHTML = basket.map((ix, k) => '<button class="chip pick" data-k="' + k + '">' + esc(c.items[ix].e + " " + inr(c.items[ix].p)) + "</button>").join("") || '<span class="tiny" style="margin:0">Empty so far.</span>';
      $("#tot").className = "totalbar" + (over ? " over" : t === c.target ? " exact" : "");
      $("#tot").textContent = "Total " + inr(t) + " of " + inr(c.target) + (over ? " · over by " + inr(t - c.target) : t === c.target ? " · perfect!" : "");
      $("#ok").disabled = t === 0 || over;
      [].forEach.call($("#basket").querySelectorAll(".chip"), b => { b.onclick = () => { basket.splice(+b.dataset.k, 1); draw(); }; });
    };
    [].forEach.call($("#items").querySelectorAll(".shopitem"), b => { b.onclick = () => { basket.push(+b.dataset.i); good(); draw(); }; });
    draw();
    $("#ok").onclick = () => {
      const t = total(), diff = c.target - t;
      const names = basket.map(ix => c.items[ix].n).join(", ");
      const text = "Basket of " + inr(t) + " for a " + inr(c.target) + " budget: " + names;
      $("#ok").disabled = true; [].forEach.call(stage.querySelectorAll(".shopitem,#basket .chip"), x => { x.disabled = true; });
      if (diff === 0) shopDone(text, 3, "Exactly " + inr(c.target) + "! A perfect basket.");
      else if (diff <= 10) shopDone(text, 2, "So close! Only " + inr(diff) + " short of the target. Great shopping.");
      else shopDone(text, 1, "Good try! You still had " + inr(diff) + " left to spend.");
    };
  } else if (c.type === "price") {
    const profitAt = p => { const rev = p <= c.market ? p * c.qty : 0; return rev - (c.cost * c.qty + (c.fixed || 0)); };
    const best = Math.max.apply(null, c.options.map(profitAt));
    let pick = null;
    stage.innerHTML = '<div class="card"><div class="small">Shop challenge</div><h3>Set your price</h3><p class="tiny">' + esc(c.prompt) + '</p><div class="meanbox">' + esc(c.e) + " Each costs you " + inr(c.cost) + " · you made " + c.qty + (c.fixed ? " · fixed costs " + inr(c.fixed) : "") + " · customers pay up to " + inr(c.market) + '</div>' +
      '<div class="lbl">Pick a price</div><div class="chips" id="opts2">' + c.options.map(o => '<button class="chip pick" data-p="' + o + '">' + inr(o) + "</button>").join("") + '</div><div class="preview" id="pv">Pick a price to see what happens.</div><div class="row"><button class="btn" id="ok" disabled>Lock in this price</button></div></div><div class="actions" id="act"></div>';
    say("Pick a price and I’ll show you what happens to your money.", ["Profit = money in − money out.", "If the price is too high, nobody buys.", "Compare a few prices before you lock one in."]);
    [].forEach.call($("#opts2").querySelectorAll(".chip"), b => { b.onclick = () => {
      [].forEach.call($("#opts2").querySelectorAll(".chip"), x => x.classList.remove("sel")); b.classList.add("sel"); pick = +b.dataset.p;
      const sells = pick <= c.market, rev = sells ? pick * c.qty : 0, out = c.cost * c.qty + (c.fixed || 0), pr = rev - out;
      $("#pv").innerHTML = (sells ? "Money in: " + c.qty + " × " + inr(pick) + " = <b>" + inr(rev) + "</b>" : "<b>Too expensive!</b> Nobody buys at " + inr(pick) + ", so money in is <b>₹0</b>") +
        "<br>Money out: " + c.qty + " × " + inr(c.cost) + (c.fixed ? " + " + inr(c.fixed) : "") + " = <b>" + inr(out) + "</b><br>Profit: <b class=\"" + (pr > 0 ? "good" : "warn") + "\">" + (pr < 0 ? "−" + inr(-pr) + " (a loss)" : inr(pr)) + "</b>";
      $("#ok").disabled = false;
    }; });
    $("#ok").onclick = () => {
      const pr = profitAt(pick), out = c.cost * c.qty + (c.fixed || 0);
      const text = "Priced " + c.item + " at " + inr(pick) + ": profit " + (pr < 0 ? "−" + inr(-pr) : inr(pr));
      $("#ok").disabled = true; [].forEach.call($("#opts2").querySelectorAll(".chip"), x => { x.disabled = true; });
      if (pr === best) shopDone(text, 3, "The best price! Customers still buy and you earn the most: " + inr(pr) + ".");
      else if (pr > 0) shopDone(text, 2, "A profit of " + inr(pr) + ". But customers would still pay more. Could you earn more?");
      else shopDone(text, 1, "That price loses money. Remember: money in has to beat money out (" + inr(out) + ").");
    };
  } else {   // sale
    const saleAt = d => c.mrp - c.mrp * d / 100;
    const goodOnes = c.options.filter(d => saleAt(d) - c.cost > 0), bestD = Math.max.apply(null, goodOnes.length ? goodOnes : [0]);
    let pick = null;
    stage.innerHTML = '<div class="card"><div class="small">Shop challenge</div><h3>Choose your sale</h3><p class="tiny">' + esc(c.prompt) + '</p><div class="meanbox">' + esc(c.e) + " " + esc(c.item) + ": cost " + inr(c.cost) + ", MRP " + inr(c.mrp) + '</div>' +
      '<div class="lbl">Pick a discount</div><div class="chips" id="opts2">' + c.options.map(o => '<button class="chip pick" data-p="' + o + '">' + o + "% off</button>").join("") + '</div><div class="preview" id="pv">Pick a discount to see your profit.</div><div class="row"><button class="btn" id="ok" disabled>Start the sale</button></div></div><div class="actions" id="act"></div>';
    say("Bigger discounts bring more customers, but watch your profit!", ["Sale price = MRP − discount.", "Profit = sale price − cost.", "Which is the biggest discount that still makes a profit?"]);
    [].forEach.call($("#opts2").querySelectorAll(".chip"), b => { b.onclick = () => {
      [].forEach.call($("#opts2").querySelectorAll(".chip"), x => x.classList.remove("sel")); b.classList.add("sel"); pick = +b.dataset.p;
      const sp = saleAt(pick), pr = sp - c.cost;
      $("#pv").innerHTML = pick + "% of " + inr(c.mrp) + " = " + inr(c.mrp * pick / 100) + " off<br>Sale price: <b>" + inr(sp) + "</b><br>Profit on each: <b class=\"" + (pr > 0 ? "good" : "warn") + "\">" + (pr < 0 ? "−" + inr(-pr) + " (a loss)" : inr(pr)) + "</b>";
      $("#ok").disabled = false;
    }; });
    $("#ok").onclick = () => {
      const pr = saleAt(pick) - c.cost;
      const text = pick + "% off " + c.item + ": sale price " + inr(saleAt(pick)) + ", profit " + (pr < 0 ? "−" + inr(-pr) : inr(pr)) + " each";
      $("#ok").disabled = true; [].forEach.call($("#opts2").querySelectorAll(".chip"), x => { x.disabled = true; });
      if (pick === bestD) shopDone(text, 3, "Smart! " + pick + "% off is the biggest sale that still earns a profit.");
      else if (pr > 0) shopDone(text, 2, "You still profit " + inr(pr) + " each. Could you afford a bigger discount?");
      else shopDone(text, 1, "That sale makes a loss on every item. Check sale price − cost first!");
    };
  }
}

function unscramble(sentences, done) {
  S.log.build = { first: 0, total: sentences.length, wrong: 0 };
  let i = 0;
  function show() {
    const target = sentences[i], toks = target.split(" ");
    const order = shuffle(toks.map((t, k) => ({ t, k })));
    let ans = [], tries = 0, solved = false;
    stage.innerHTML = '<div class="card"><div class="small">Build it · sentence ' + (i + 1) + " of " + sentences.length + '</div><h3>Put the words in order.</h3><p class="tiny">Tap a word to add it. Tap it again to take it back.</p><div class="dropline" id="ans"></div><div class="bank" id="pool"></div></div><div class="actions" id="act"></div>';
    S.now = "Unscrambling a sentence";
    say("Tap the words to build a sentence that makes sense.", ["Which word usually starts a sentence?", "Say it out loud and listen to how it sounds."]);
    function draw() {
      const line = $("#ans");
      line.innerHTML = ans.map(o => '<button class="chip pick placed" data-k="' + o.k + '">' + esc(o.t) + "</button>").join("") || '<span class="tiny" style="margin:0">Your sentence goes here.</span>';
      $("#pool").innerHTML = order.filter(o => ans.indexOf(o) < 0).map(o => '<button class="chip" data-k="' + o.k + '">' + esc(o.t) + "</button>").join("");
      if (solved) return;
      [].forEach.call($("#pool").querySelectorAll(".chip"), b => { b.onclick = () => { ans.push(order.filter(o => o.k === +b.dataset.k)[0]); draw(); check(); }; });
      [].forEach.call(line.querySelectorAll(".chip"), b => { b.onclick = () => { ans = ans.filter(o => o.k !== +b.dataset.k); draw(); }; });
    }
    function check() {
      if (ans.length !== toks.length) return;
      if (ans.map(o => o.t).join(" ") === target) {
        solved = true; $("#ans").classList.add("good"); good();
        if (tries === 0) { S.log.build.first++; addStars(3); } else addStars(1);
        speak(target); say("Perfect! “" + target + "”", []);
        nextBtn(i < sentences.length - 1 ? "Next sentence" : "Continue", () => {
          i++;
          if (i < sentences.length) show(); else { if (S.log.build.first === sentences.length) badge("builder"); done(); }
        });
      } else {
        tries++; S.wrong++; S.log.build.wrong++; oops(); shake($("#ans")); say("Not quite. Tap a word to take it back and try a new order.");
      }
    }
    draw();
  }
  show();
}

/* ---------- 5. report ---------- */
async function report() {
  clearInterval(S.timer); tick();
  S.ctx = "Quest report";
  stage.innerHTML = '<div class="card center"><div class="medal">⏳</div><p>Saving your quest…</p></div>';
  const payload = { sid: S.sid, subject: S.subject, practice: !!S.q.practice, quest: S.q.id, today: today(), replay: S.replay, seconds: S.elapsed, stars: S.stars, hints: S.hints, wrong: S.wrong,
                    badges: S.badges, ratings: S.rate, log: S.log, created: S.created, wordRes: S.wordRes, reviewRes: S.reviewRes };
  let res = null, synced = true;
  try { res = await api("/api/session", { method: "POST", body: JSON.stringify(payload) }); }
  catch (e) { if (e.auth) { gate(); return; } synced = false; const p = pend(); p.push(payload); setPend(p); }
  try { await refresh(); } catch (e) { /* keep old state */ }
  const st = APP.state, cat = st.badgeCatalog;
  const maths = S.subject === "maths";
  const prac = !!S.q.practice;
  const qb = prac ? (cat.practice || { icon: "💪", name: "Practice Pro" }) : (cat[(maths ? "mquest:" : "quest:") + S.q.id] || { icon: "🏅", name: "Quest complete" });
  const newB = res ? res.newBadges : S.badges;
  const med = { bronze: "🥉", silver: "🥈", gold: "🥇" };
  const RATE = maths
    ? [["warm", "Quick-sums warm-up"], ["meet", "Learning the skills"], ["play", "The games"], ["create", "My shop challenge"]]
    : [["warm", "Warm-up match"], ["meet", S.q.kind === "grammar" ? "Learning the rules" : "Story cards"], ["play", "The games"], ["create", S.q.kind === "grammar" ? "Building sentences" : "Making my own sentence"]];
  const EM = [["😍", "Loved it"], ["🙂", "It was okay"], ["😴", "Boring"]];
  const words = S.q.kind === "words" ? S.q.words.map(x => ({ id: x.w, emoji: x.emoji, label: x.w, mean: x.mean }))
    : maths ? S.q.units.map(u => ({ id: u.id, emoji: u.emoji, label: u.name, mean: u.mean })) : [];
  const changed = res ? res.changed : [];

  stage.innerHTML =
    '<div class="card hero"><div class="medal">' + esc(qb.icon) + '</div><h2>' + (prac ? "Practice complete!" : "Quest complete!") + '</h2><p>' + (prac ? "Those tricky ones are getting stronger." + (newB.indexOf("practice") > -1 ? " You earned the <b>Practice Pro</b> badge." : "") : "You earned the <b>" + esc(qb.name) + "</b> badge.") + '</p>' +
    (synced ? "" : '<p class="tiny">Saved on this device. It will sync when you’re back online.</p>') + '</div>' +
    '<div class="card"><div class="stats"><div><b>' + S.stars + '</b>stars</div><div><b>' + fmt(S.elapsed) + '</b>time</div><div><b>🔥 ' + st.streak.count + '</b>day streak</div></div></div>' +
    (newB.length ? '<div class="card"><h3>New badges</h3><div class="shelf">' + newB.map(id => "<span>" + esc((cat[id] || { icon: "🏅" }).icon) + " " + esc((cat[id] || { name: id }).name) + "</span>").join("") + "</div></div>" : "") +
    (words.length ? '<div class="card"><h3>Today you learned</h3><div class="vgrid">' + words.map(x => {
      const c = changed.filter(z => z.w === x.id)[0];
      return '<div class="vcard ' + (c ? c.medal : "bronze") + '"><b>' + esc(x.emoji) + " " + esc(x.label) + "</b><span>" + esc(x.mean) + "</span><span>" + (c ? med[c.medal] + (c.isNew ? " · new in your vault" : "") + (maths && c.lvl ? " · Level " + c.lvl : "") : "🥉") + "</span></div>";
    }).join("") + '</div><p class="tiny" style="margin-top:10px">These ' + (maths ? "skills" : "words") + ' will come back in your warm-ups. Get them right to turn them silver and gold!</p></div>'
      : '<div class="card"><h3>Today you learned</h3><p>' + esc(S.q.rules.map(r => r.t).join(" · ")) + "</p></div>") +
    (S.created.length ? '<div class="card"><h3>' + (maths ? "Your shop result" : "Your sentence") + '</h3><p class="story">' + esc(S.created[S.created.length - 1].text) + '</p><button class="btn alt" id="hs">🔊 Hear it</button></div>' : "") +
    '<div class="card"><p>' + esc(st.rank.icon) + " <b>" + esc(st.rank.title) + "</b>" + (st.rank.next ? " · " + st.rank.next.need + " more badge" + (st.rank.next.need > 1 ? "s" : "") + " to become a " + esc(st.rank.next.title) : "") + "</p></div>" +
    '<div class="card"><h3>How was it, ' + esc(st.name) + '?</h3>' +
    RATE.map(r => '<div class="rate"><span>' + esc(r[1]) + '</span><div data-k="' + r[0] + '">' + EM.map(e => '<button data-e="' + e[0] + '" aria-label="' + e[1] + '">' + e[0] + "</button>").join("") + "</div></div>").join("") + "</div>" +
    '<div class="actions"><button class="btn alt" id="bk">Menu</button>' + (st.next && !S.replay ? '<button class="btn" id="nq">Next quest</button>' : "") + "</div>";

  const hs = $("#hs"); if (hs) hs.onclick = () => speak(S.created[S.created.length - 1].text);
  [].forEach.call(stage.querySelectorAll(".rate div"), d => {
    [].forEach.call(d.querySelectorAll("button"), b => { b.onclick = () => {
      [].forEach.call(d.querySelectorAll("button"), x => x.classList.remove("sel")); b.classList.add("sel");
      S.rate[d.dataset.k] = b.dataset.e;
      const o = {}; o[d.dataset.k] = b.dataset.e;
      api("/api/session/rate", { method: "POST", body: JSON.stringify({ sid: S.sid, ratings: o }) }).catch(() => {});
    }; });
  });
  $("#bk").onclick = top;
  const nq = $("#nq"); if (nq) nq.onclick = () => startQuest(st.next.id, false);
  chrome(true); setStars(S.stars);
  fanfare(); burst();
  say("You did it, " + st.name + "! Look at all those stars. Tell Dad which part was your favourite!", []);
  speak("You did it " + st.name + "! Great quest.");
}

/* ---------- boot ---------- */
async function init() {
  try { await flushPending(); await refresh(); }
  catch (e) { if (e.auth) { gate(e.message === "access" && ACCESS ? "That code didn’t work. Try again." : null); return; } offline(); return; }
  top();
}
if ("serviceWorker" in navigator) { window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {})); }
say("Hoo-hoo! Waking up…", []);
init();
})();
