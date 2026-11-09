"use strict";
const fs = require("fs");
const path = require("path");

function defaults() {
  return {
    v: 1,
    profile: { name: "Ariana", created: Date.now() },
    stars: 0,
    badges: [],
    words: {},
    completed: [],
    sentences: [],
    currentQuest: 1,
    streak: { count: 0, last: null, freezes: 1, best: 0 },
    coach: { counts: {}, log: [] },
    generated: [],
    maths: { currentQuest: 1, units: {} }
  };
}

class Store {
  constructor(dir) {
    this.dir = dir;
    fs.mkdirSync(dir, { recursive: true });
    this.file = path.join(dir, "state.json");
    this.cache = null;
    this.q = Promise.resolve();
  }
  _load() {
    if (this.cache) return this.cache;
    let st = null;
    try { st = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch (e) { /* first run */ }
    this.cache = Object.assign(defaults(), st || {});
    return this.cache;
  }
  _save() {
    const tmp = this.file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(this.cache));
    fs.renameSync(tmp, this.file);
  }
  // read-only snapshot
  read() {
    const p = this.q.then(() => JSON.parse(JSON.stringify(this._load())));
    this.q = p.catch(() => {});
    return p;
  }
  // serialised read-modify-write; if fn throws, changes are rolled back
  update(fn) {
    const p = this.q.then(async () => {
      const st = this._load();
      const backup = JSON.stringify(st);
      try {
        const out = await fn(st);
        this._save();
        return out;
      } catch (e) {
        this.cache = JSON.parse(backup);
        throw e;
      }
    });
    this.q = p.catch(() => {});
    return p;
  }
}

module.exports = { Store, defaults };
