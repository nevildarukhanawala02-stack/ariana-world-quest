(function () {
"use strict";
const $ = s => document.querySelector(s);
const root = $("#root");
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
let PASS = (function () { try { return sessionStorage.getItem("wq_parent") || ""; } catch (e) { return ""; } })();
let tt;
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 3000); }

async function api(path, opts) {
  opts = opts || {};
  const headers = Object.assign({ "Content-Type": "application/json", "x-parent": PASS }, opts.headers || {});
  const access = lsGet("wq_access"); if (access) headers["x-access"] = access;
  const r = await fetch(path, Object.assign({}, opts, { headers }));
  let j = {}; try { j = await r.json(); } catch (e) { /* ignore */ }
  if (!r.ok) throw Object.assign(new Error(j.error || "Error " + r.status), { status: r.status });
  return j;
}

function login(msg) {
  root.innerHTML = '<div class="card"><p class="tiny">' + esc(msg || "Enter the parent passcode.") + '</p><input class="field" id="pp" type="password" placeholder="Parent passcode" autocomplete="current-password"><div class="actions" style="margin-top:12px"><button class="btn" id="go">Open</button></div></div>';
  const go = () => { PASS = $("#pp").value; try { sessionStorage.setItem("wq_parent", PASS); } catch (e) { /* ignore */ } load(); };
  $("#go").onclick = go; $("#pp").onkeydown = e => { if (e.key === "Enter") go(); };
}

const medalIcon = { bronze: "🥉", silver: "🥈", gold: "🥇" };
const mins = s => (s / 60).toFixed(1) + " min";

async function load() {
  let d;
  try { d = await api("/api/parent"); }
  catch (e) { if (e.status === 401) { login(PASS ? "That passcode didn’t work." : null); return; } if (e.status === 503) { root.innerHTML = '<div class="card"><p>' + esc(e.message) + "</p></div>"; return; } root.innerHTML = '<div class="card"><p>' + esc(e.message) + "</p></div>"; return; }

  const struggling = d.words.filter(w => w.wrong > w.right || (w.box === 1 && w.seen > 1)).sort((a, b) => b.wrong - a.wrong);
  const counts = { bronze: 0, silver: 0, gold: 0 }; d.words.forEach(w => counts[w.medal]++);
  const ico = sb => (sb === "maths" ? "💰" : "📚");

  const pr = d.progress, bar = (a, b) => '<div class="bar" style="margin:6px 0 8px"><i style="width:' + Math.round(100 * a / Math.max(1, b)) + '%"></i></div>';
  const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
  const CATN = { history: "📜 History", geography: "🌍 Geography", didyouknow: "💡 Did you know" };
  const dc = pr.discoveries, pct = dc.asked ? Math.round(100 * dc.firstTryRight / dc.asked) : null;
  const progressCard = '<div class="card"><h3>Lessons finished</h3>' +
    ['english', 'maths'].map(sb => { const p = pr[sb]; return '<div class="qa"><b>' + (sb === "maths" ? "💰 Money Maths" : "📚 Love English") + '</b><br>' + '<b>' + p.questsDone + ' of ' + p.questsTotal + '</b> lessons finished' + bar(p.questsDone, p.questsTotal) +
      'This week: ' + plural(p.daysThisWeek, "day") + ', ' + p.minutesThisWeek + ' min<br>All time: ' + plural(p.sessions, "session") + ', ' + p.minutes + ' min' + (p.practice ? ' (' + p.practice + ' practice)' : '') + '<br>Last played: ' + esc(p.lastPlayed ? new Date(p.lastPlayed + "T12:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : 'not yet') + '</div>'; }).join('') +
    '<p style="margin:12px 0 4px"><b>🔭 Discoveries in Love English</b></p>' +
    Object.keys(CATN).map(k => '<div>' + CATN[k] + ': <b>' + dc.cats[k].done + ' of ' + dc.cats[k].total + '</b>' + bar(dc.cats[k].done, dc.cats[k].total) + '</div>').join('') +
    '<p class="tiny" style="margin:6px 0 0">Discovery questions right on the first try: ' + (pct === null ? 'none yet' : dc.firstTryRight + ' of ' + dc.asked + ' (' + pct + '%)') + '</p></div>';
  root.innerHTML = progressCard +
    '<div class="card"><h3>' + esc(d.name) + ' at a glance</h3><p class="tiny">Each subject keeps its own stars, streak, rank and badges. Average session: ' + d.avgMinutes + ' min.</p>' +
    ['english', 'maths'].map(sb => { const x = d.subjects[sb]; return '<div class="qa"><b>' + (sb === "maths" ? "💰 Money Maths" : "📚 Love English") + '</b><br>' + x.sessions + ' sessions · ⭐ ' + x.stars + ' · 🔥 ' + x.streak.count + '-day streak (best ' + x.streak.best + ', ' + x.streak.freezes + ' freeze' + (x.streak.freezes === 1 ? '' : 's') + ' left) · ' + esc(x.rank.icon + ' ' + x.rank.title) + ' · ' + x.badges + ' badges</div>'; }).join('') +
    '<p class="tiny" style="margin-top:10px">' + d.words.length + ' words and skills collected (' + counts.gold + ' gold, ' + counts.silver + ' silver, ' + counts.bronze + ' bronze)</p></div>' +

    '<div class="card"><h3>Words and skills that need another look</h3>' + (struggling.length
      ? '<div class="scroll"><table><tr><th>Word or skill</th><th>Right</th><th>Wrong</th><th>Next review</th></tr>' + struggling.map(w => "<tr><td>" + ico(w.subject) + " <b>" + esc(w.label || w.w) + "</b>" + (w.subject === "maths" ? " <span class=\"small\">Level " + (w.lvl || 1) + "</span>" : "") + "<br><span class=\"small\">" + esc(w.mean || "") + "</span></td><td>" + w.right + '</td><td class="warn">' + w.wrong + "</td><td>" + esc(w.due) + "</td></tr>").join("") + "</table></div>"
      : '<p class="tiny">Nothing yet. Words show up here when she gets them wrong more often than right.</p>') + "</div>" +

    '<div class="card"><h3>Recent sessions</h3>' + (d.sessions.length
      ? '<div class="scroll"><table><tr><th>Date</th><th>Quest</th><th>Time</th><th>⭐</th><th>Hints</th><th>Wrong</th><th>Her ratings</th></tr>' + d.sessions.map(s => "<tr><td>" + esc(s.date) + "</td><td>" + ico(s.subject) + " " + s.quest + " · " + esc(s.title) + (s.replay ? " (replay)" : "") + "</td><td>" + mins(s.seconds) + "</td><td>" + s.stars + "</td><td>" + s.hints + "</td><td>" + s.wrong + "</td><td>" + esc(Object.keys(s.ratings || {}).map(k => k + " " + s.ratings[k]).join("  ")) + "</td></tr>").join("") + "</table></div>"
      : '<p class="tiny">No sessions yet.</p>') + "</div>" +

    '<div class="card"><h3>Sentences and shop results she made</h3>' + (d.sentences.length ? d.sentences.map(s => "<p>“" + esc(s.text) + "” <span class=\"small\">(" + esc(s.word) + ", " + esc(s.date) + ")</span></p>").join("") : '<p class="tiny">None yet.</p>') + "</div>" +

    '<div class="card"><h3>Questions she asked Hooty</h3>' + (d.coachLog.length ? d.coachLog.map(c => '<div class="qa"><b>' + esc(c.q) + '</b><br><span class="small">' + esc(c.date) + "</span><br>" + esc(c.a || "(no answer)") + "</div>").join("") : '<p class="tiny">' + (d.ai.enabled ? "None yet." : "Live Hooty is off. Add ANTHROPIC_API_KEY on the server to switch it on.") + "</p>") + "</div>" +

    '<div class="card"><h3>Quests (' + d.quests.length + ')</h3>' + d.quests.map(q => '<p>' + (q.done ? "✓ " : "") + ico(q.subject) + " <b>" + q.id + " · " + esc(q.title) + "</b> <span class=\"small\">" + (q.kind === "grammar" ? "grammar" : esc((q.words || []).join(", "))) + "</span>" +
      (q.generated ? ' <button class="mini" data-del="' + q.id + '">Remove</button>' : "") + "</p>").join("") + "</div>" +

    '<div class="card"><h3>Add a new quest</h3>' + (d.ai.enabled
      ? '<p class="tiny">Claude writes a fresh quest in the same format. It takes about a minute. The new quest goes to the end of the map.</p><label class="small" for="gk">Type</label><select class="field" id="gk"><option value="words">Word quest (4 new words)</option><option value="grammar">Grammar quest</option></select>' +
        '<label class="small" for="gd" style="display:block;margin-top:10px">Discovery to include</label><select class="field" id="gd"><option value="none">None</option><option value="history">History</option><option value="geography">Geography</option><option value="didyouknow">Did you know?</option></select>' +
        '<label class="small" for="gt" style="display:block;margin-top:10px">Theme or setting (optional)</label><input class="field" id="gt" maxlength="120" placeholder="e.g. a trip to the zoo, Holi, a rainy cricket match">' +
        '<label class="small" for="gf" style="display:block;margin-top:10px">Anything to focus on (optional)</label><input class="field" id="gf" maxlength="200" placeholder="e.g. words about feelings, or the past tense">' +
        (d.weak.english.length ? '<p style="margin:8px 0 0"><button class="mini" id="useWeak">Use her tricky words</button></p>' : '') + '<div class="actions" style="margin-top:12px"><button class="btn" id="gen">Create quest</button></div><p class="tiny" id="genMsg" aria-live="polite"></p>'
      : '<p class="tiny">Add ANTHROPIC_API_KEY on the server to create new quests with Claude.</p>') + "</div>" +

    '<div class="card"><h3>Settings</h3><p class="tiny">Live Hooty: ' + (d.ai.enabled ? "on (" + esc(d.ai.coachModel) + ", up to " + d.ai.coachLimit + " questions a day)" : "off") + '<br>Data folder: ' + esc(d.dataDir) + '</p>' +
    '<label class="small" for="rs">Reset all progress (stars, words, badges). Type RESET:</label><input class="field" id="rs" placeholder="RESET"><div class="actions" style="margin-top:12px"><button class="btn alt" id="rsGo">Reset progress</button></div></div>';

  [].forEach.call(root.querySelectorAll("[data-del]"), b => { b.onclick = async () => {
    if (!confirm("Remove this quest?")) return;
    try { await api("/api/parent/quest/" + b.dataset.del, { method: "DELETE" }); toast("Removed"); load(); } catch (e) { toast(e.message); }
  }; });
  const uw = $("#useWeak");
  if (uw) uw.onclick = () => { $("#gk").value = "words"; $("#gf").value = "She finds these words tricky: " + d.weak.english.join(", ") + ". Choose new words of a similar kind, in everyday situations, so those ideas get more practice."; };
  const gen = $("#gen");
  if (gen) gen.onclick = async () => {
    gen.disabled = true; $("#genMsg").textContent = "Writing your quest… this takes up to a minute.";
    try {
      const r = await api("/api/parent/generate", { method: "POST", body: JSON.stringify({ kind: $("#gk").value, theme: $("#gt").value, focus: $("#gf").value, discover: $("#gd").value }) });
      toast("Added: " + r.quest.title); load();
    } catch (e) { $("#genMsg").textContent = e.message; gen.disabled = false; }
  };
  $("#rsGo").onclick = async () => {
    try { await api("/api/parent/reset", { method: "POST", body: JSON.stringify({ confirm: $("#rs").value }) }); toast("Progress reset"); load(); } catch (e) { toast(e.message); }
  };
}

load();
})();
