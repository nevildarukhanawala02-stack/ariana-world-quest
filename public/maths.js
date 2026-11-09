/* Money Maths problem generators: one per skill id (see content/maths.js).
   Every call makes fresh numbers, so replays never repeat. All answers are whole numbers. */
(function (root) {
"use strict";
const R = (a, b, s) => { s = s || 1; return a + s * Math.floor(Math.random() * (Math.floor((b - a) / s) + 1)); };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const inr = n => "₹" + Number(n).toLocaleString("en-IN");
// Real-world settings. Every question happens somewhere a kid actually shops or sees money change hands.
const I = (n, lo, hi) => ({ n, lo, hi });
const SC = {
  super:      { at: "At the supermarket",     phys: true,  pool: [I("packet of biscuits", 10, 40), I("bottle of juice", 20, 60), I("loaf of bread", 30, 50), I("tub of curd", 30, 70), I("packet of noodles", 10, 30), I("box of cereal", 60, 95)] },
  stationery: { at: "At the stationery shop", phys: true,  pool: [I("notebook", 20, 60), I("geometry box", 40, 90), I("sketch pad", 30, 80), I("pack of pens", 20, 60), I("school bag", 60, 95)] },
  canteen:    { at: "At the school canteen",  phys: true,  pool: [I("samosa", 10, 25), I("sandwich", 30, 60), I("juice box", 15, 40), I("plate of idli", 30, 60), I("veg roll", 20, 50)] },
  cinema:     { at: "At the cinema",          phys: true,  pool: [I("movie ticket", 120, 200), I("popcorn tub", 80, 150), I("cold drink", 40, 80)] },
  toys:       { at: "At the toy store",       phys: true,  pool: [I("board game", 150, 400), I("puzzle", 100, 250), I("toy car", 50, 150), I("colour kit", 80, 200)] },
  online:     { at: "On an online shop",      phys: false, pool: [I("phone cover", 100, 300), I("water bottle", 150, 400), I("backpack", 400, 900), I("board game", 200, 500), I("pair of earphones", 300, 800), I("notebook set", 100, 250)] },
  app:        { at: "On a food delivery app", phys: false, pool: [I("pizza", 200, 400), I("burger", 100, 250), I("pasta", 150, 300), I("wrap", 100, 200)] }
};
const price = it => R(it.lo, it.hi, 5);
const scAny = () => pick(Object.keys(SC).map(k => SC[k]));
const scPhys = () => pick(Object.keys(SC).map(k => SC[k]).filter(x => x.phys));
const some = (sc, n) => shuffle(sc.pool).slice(0, n);
const SELL = ["school bag", "water bottle", "kurta", "football", "clock", "lunch box", "torch"];
const PACK = ["pen", "pencil", "eraser", "chocolate", "notebook", "sticker sheet"];
const BIZ = ["uncle’s kirana store", "mother’s boutique", "cousin’s online shop", "school fair stall", "neighbour’s bakery"];

function fmt(ans, unit) {
  if (unit === "₹") return inr(ans);
  if (unit === "%") return ans + "%";
  if (!unit) return String(ans);
  return ans + " " + unit;
}
const P = (expr, q, ans, unit, why, hint) => ({ expr, q, ans, unit, why, hint });

const G = {
  add2() { const sc = scAny(); let a, b, q;
    if (sc === SC.online && Math.random() < 0.6) { a = R(200, 900, 50); b = pick([30, 40, 50, 60]); q = `${sc.at}, your cart total is ${inr(a)} and the delivery fee is ${inr(b)}. How much do you pay in all?`; }
    else { const [X, Y] = some(sc, 2); a = price(X); b = price(Y); q = `${sc.at}, a ${X.n} costs ${inr(a)} and a ${Y.n} costs ${inr(b)}. What is the total for both?`; }
    return P(`${inr(a)} + ${inr(b)}`, q, a + b, "₹", `${a} + ${b} = ${a + b}.`, ["Add the two amounts.", "Add the tens first, then the ones."]); },
  add3() { const sc = scAny(), [X, Y, Z] = some(sc, 3), a = price(X), b = price(Y), c = price(Z);
    return P(`${inr(a)} + ${inr(b)} + ${inr(c)}`, `${sc.at}, you pick a ${X.n} (${inr(a)}), a ${Y.n} (${inr(b)}) and a ${Z.n} (${inr(c)}). What is the total bill?`, a + b + c, "₹", `${a} + ${b} + ${c} = ${a + b + c}.`, ["Add two prices, then add the third.", "Add the easy numbers first."]); },
  mulq() { const sc = scAny(), [X] = some(sc, 1), p = price(X), n = p > 100 ? R(2, 4) : R(3, 9);
    return P(`${n} × ${inr(p)}`, `${sc.at}, one ${X.n} costs ${inr(p)}. You buy ${n} of them for a party. How much do you pay?`, p * n, "₹", `${n} × ${p} = ${p * n}.`, ["Multiply the price of one by how many.", `Think of ${p} added ${n} times.`]); },
  change() { const note = pick([50, 100, 200, 500]), bill = R(1, note / 5 - 1) * 5, sc = scPhys();
    return P(`${inr(note)} − ${inr(bill)}`, `${sc.at}, your bill is ${inr(bill)}. You hand over a ${inr(note)} note. How much change should the shopkeeper give back?`, note - bill, "₹", `${note} − ${bill} = ${note - bill}.`, ["Change = money paid − bill.", "Count up from the bill to the note."]); },
  sub() { const sc = scAny(); let X, Y, a, b, t = 0;
    do { [X, Y] = some(sc, 2); a = price(X); b = price(Y); t++; } while (a <= b && t < 20);
    if (a <= b) { a = b + 5 * R(2, 8); }
    return P(`${inr(a)} − ${inr(b)}`, `${sc.at}, a ${X.n} costs ${inr(a)} and a ${Y.n} costs ${inr(b)}. How much more does the ${X.n} cost than the ${Y.n}?`, a - b, "₹", `${a} − ${b} = ${a - b}.`, ["Subtract the smaller price from the bigger one."]); },
  unitprice() { const u = R(3, 20), n = R(3, 9), sc = pick([SC.super, SC.stationery, SC.online]), x = pick(PACK);
    return P(`${inr(u * n)} ÷ ${n}`, `${sc.at}, ${n} ${x}s are sold together in one pack for ${inr(u * n)}. What is the price of one ${x}?`, u, "₹", `${u * n} ÷ ${n} = ${u}.`, ["Divide the pack price by how many are inside.", `What number times ${n} makes ${u * n}?`]); },
  add4() { const a = R(100, 500, 50), b = R(100, 500, 50), c = R(100, 500, 50), d = R(100, 500, 50), biz = pick(BIZ);
    return P(`${a} + ${b} + ${c} + ${d}`, `You help at your ${biz}. Sales this week were Mon ${inr(a)}, Tue ${inr(b)}, Wed ${inr(c)} and Thu ${inr(d)}. What are the total sales for these four days?`, a + b + c + d, "₹", `${a} + ${b} + ${c} + ${d} = ${a + b + c + d}.`, ["Add the days two at a time.", "Add the hundreds first."]); },
  avg() { const m = R(30, 90, 10), o = shuffle([20, -10, -20, 10]), v = o.map(x => m + x), w = pick(["glasses of juice at the school fair", "cakes at the bakery", "parcels from the online shop"]);
    return P(`Average of ${v.join(", ")}`, `Over four days, a shop sold ${v[0]}, ${v[1]}, ${v[2]} and ${v[3]} ${w}. What is the average sold per day?`, m, "", `Total ${v.reduce((s, x) => s + x, 0)} ÷ 4 = ${m}.`, ["Add all four, then divide by 4.", "The answer is somewhere in the middle of the numbers."]); },
  profit() { const cp = R(10, 90, 5), p = R(5, 40, 5), x = pick(SELL), t = pick([0, 1, 2]);
    const q = t === 0 ? `Your uncle buys a ${x} from a wholesaler for ${inr(cp)} and sells it in his shop for ${inr(cp + p)}. What is his profit on one?`
      : t === 1 ? `You buy a ${x} for ${inr(cp)} and resell it on an online marketplace for ${inr(cp + p)}. What is your profit?`
      : `A shopkeeper pays ${inr(cp)} for a ${x} and sells it for ${inr(cp + p)}. How much profit does she make?`;
    return P(`Bought ${inr(cp)}, sold ${inr(cp + p)}: profit`, q, p, "₹", `Profit = SP − CP = ${cp + p} − ${cp} = ${p}.`, ["Profit = selling price − cost price."]); },
  loss() { const cp = R(30, 100, 5), l = R(5, 25, 5), x = pick(SELL);
    return P(`Bought ${inr(cp)}, sold ${inr(cp - l)}: loss`, `At an end-of-season clearance, a shopkeeper bought a ${x} for ${inr(cp)} but had to sell it for ${inr(cp - l)}. How much is the loss?`, l, "₹", `Loss = CP − SP = ${cp} − ${cp - l} = ${l}.`, ["He sold for less than he paid. Loss = cost price − selling price."]); },
  profitn() { const p = R(2, 12), n = R(5, 20, 5), x = pick(SELL), biz = pick(["Your online shop", "Your school fair stall", "Your mother’s boutique"]);
    return P(`${n} items × ${inr(p)} profit each: total profit`, `${biz} makes ${inr(p)} profit on each ${x} sold. This week it sold ${n}. What is the total profit?`, p * n, "₹", `${n} × ${p} = ${p * n}.`, ["Total profit = profit on one × how many sold."]); },
  findcost() { const sp = R(40, 150, 5), p = R(5, 30, 5), x = pick(SELL);
    return P(`Sold ${inr(sp)} with ${inr(p)} profit: cost`, `A shopkeeper sold a ${x} for ${inr(sp)} and made ${inr(p)} profit. How much did he pay for it?`, sp - p, "₹", `Cost = SP − profit = ${sp} − ${p} = ${sp - p}.`, ["Work backwards: cost = selling price − profit."]); },
  pct10() { const a = R(50, 500, 10), t = pick([0, 1]);
    const q = t === 0 ? `Your family eats at a restaurant and the bill is ${inr(a)}. You leave a 10% tip. How much is the tip?` : `An online shop gives 10% cashback on a ${inr(a)} order. How much cashback do you get?`;
    return P(`10% of ${inr(a)}`, q, a / 10, "₹", `10% is one tenth: ${a} ÷ 10 = ${a / 10}.`, ["10% means one tenth. Divide by 10."]); },
  pct() { const p = pick([20, 25, 50]), a = pick([40, 60, 80, 100, 120, 200, 400, 500]), h = { 20: "20% is a fifth: divide by 5.", 25: "25% is a quarter: divide by 4.", 50: "50% is half: divide by 2." }, t = pick([0, 1]);
    const q = t === 0 ? `You have a coupon for ${p}% off on a ${inr(a)} shopping order. How much do you save?` : `A shopping app gives ${p}% cashback on a ${inr(a)} order. How much cashback do you get?`;
    return P(`${p}% of ${inr(a)}`, q, a * p / 100, "₹", `${h[p]} ${a} → ${a * p / 100}.`, [h[p]]); },
  discamt() { const m = pick([100, 200, 400, 500, 800, 1000]), d = pick([10, 20, 25, 50]), x = pick(SELL), sc = pick(["On an online shop", "At a shop"]);
    return P(`${d}% off MRP ${inr(m)}: you save`, `${sc}, a ${x} has an MRP of ${inr(m)} and is on sale at ${d}% off. How much do you save?`, m * d / 100, "₹", `${d}% of ${m} = ${m * d / 100}.`, [`Find ${d}% of the MRP.`, "Discount amount = percent × MRP."]); },
  saleprice() { const m = pick([100, 200, 400, 500, 800, 1000]), d = pick([10, 20, 25, 50]), s = m * d / 100, x = pick(SELL), sc = pick(["On an online shop", "At a shop"]);
    return P(`MRP ${inr(m)} with ${d}% off: you pay`, `${sc}, a ${x} has an MRP of ${inr(m)} and is on sale at ${d}% off. How much do you actually pay?`, m - s, "₹", `${d}% of ${m} = ${s}, so ${m} − ${s} = ${m - s}.`, ["First find the discount, then subtract it from the MRP."]); },
  pctof() { const w = pick([20, 40, 80, 100, 200]), p = pick([10, 20, 25, 50]), part = w * p / 100, t = pick([0, 1]);
    const q = t === 0 ? `You list ${w} products on your online shop and ${part} get sold this month. What percent of your products sold?` : `A bakery baked ${w} cakes for a festival and sold ${part}. What percent were sold?`;
    return P(`${part} out of ${w}`, q, p, "%", `${part} ÷ ${w} × 100 = ${p}%.`, ["Part ÷ whole × 100.", "Try: how many of these fit in 100?"]); },
  margin() { const cp = pick([40, 80, 100, 200, 400]), p = pick([10, 20, 25, 50]), pr = cp * p / 100, x = pick(SELL);
    return P(`Bought ${inr(cp)}, sold ${inr(cp + pr)}: profit %`, `A shopkeeper buys a ${x} for ${inr(cp)} and sells it for ${inr(cp + pr)}. What is her profit percent?`, p, "%", `Profit ${pr} ÷ cost ${cp} × 100 = ${p}%.`, ["First find the profit, then do profit ÷ cost × 100."]); },
  spmargin() { const cp = pick([40, 80, 100, 200, 400]), p = pick([10, 20, 25, 50]), pr = cp * p / 100, x = pick(SELL);
    return P(`Cost ${inr(cp)} + ${p}% profit: sell at`, `You buy a ${x} for ${inr(cp)} to sell in your shop and you want ${p}% profit. What should your selling price be?`, cp + pr, "₹", `${p}% of ${cp} = ${pr}, so ${cp} + ${pr} = ${cp + pr}.`, [`Find ${p}% of the cost, then add it to the cost.`]); },
  discprofit() { const m = pick([100, 200, 400, 500]), d = pick([10, 20, 25, 50]), sale = m - m * d / 100, extra = pick([10, 20, 30]), cost = sale - extra, x = pick(SELL);
    return P(`Cost ${inr(cost)}, MRP ${inr(m)}, ${d}% off: profit`, `Your shop buys a ${x} for ${inr(cost)}. Its MRP is ${inr(m)}, but during a festival sale you give ${d}% off. What is your profit now?`, extra, "₹", `Sale price = ${m} − ${m * d / 100} = ${sale}. Profit = ${sale} − ${cost} = ${extra}.`, ["Find the sale price first.", "Then profit = sale price − cost."]); },
  monthcost() { const f = pick([500, 1000, 2000, 3000]), v = R(5, 20, 5), n = pick([20, 50, 100]);
    return P(`${inr(f)} + ${n} × ${inr(v)}: total cost`, `You run a small bakery. The shop rent is ${inr(f)} a month and each cake costs ${inr(v)} to make. You make ${n} cakes this month. What is your total cost?`, f + n * v, "₹", `${n} × ${v} = ${n * v}, then ${f} + ${n * v} = ${f + n * v}.`, ["Find the cost of making the cakes first.", "Then add the rent."]); },
  breakeven() { const f = pick([200, 300, 500, 600, 1000]), p = pick([5, 10, 20, 25, 50]);
    return P(`${inr(f)} ÷ ${inr(p)} profit each: sales to break even`, `Your food stall costs ${inr(f)} a day to run. You earn ${inr(p)} profit on each plate sold. How many sales do you need just to cover the day’s cost?`, f / p, "sales", `${f} ÷ ${p} = ${f / p}.`, ["Sales needed = cost ÷ profit on each sale."]); },
  monthprofit() { const rev = R(4, 12) * 500, cost = rev - pick([500, 1000, 1500]);
    return P(`Earned ${inr(rev)}, spent ${inr(cost)}: profit`, `Your online shop earned ${inr(rev)} this month. After paying for stock, packing and delivery you spent ${inr(cost)}. What is your profit?`, rev - cost, "₹", `${rev} − ${cost} = ${rev - cost}.`, ["Profit = money earned − money spent."]); },
  perday() { const r = pick([600, 900, 1200, 1500, 3000]);
    return P(`${inr(r)} ÷ 30 days: rent per day`, `Your shop’s rent is ${inr(r)} for a 30-day month. What does the rent cost for one day?`, r / 30, "₹", `${r} ÷ 30 = ${r / 30}.`, ["Divide the monthly rent by 30.", "Try dividing by 3 first, then by 10."]); },
  gstamt() { const a = pick([100, 200, 400, 500, 1000]), g = pick([5, 12, 18]), t = pick([0, 1]);
    const q = t === 0 ? `Your family’s restaurant bill is ${inr(a)} before tax. GST is ${g}%. How much GST is added?` : `You buy a gadget online for ${inr(a)} before tax. GST is ${g}%. How much GST is added?`;
    return P(`${g}% GST on ${inr(a)}`, q, a * g / 100, "₹", `${g}% of ${a} = ${a * g / 100}.`, [`Find ${g}% of the price.`]); },
  gst() { const a = pick([100, 200, 400, 500, 1000]), g = pick([5, 12, 18]), t = a * g / 100, x = pick(["pair of headphones", "school bag", "water bottle", "backpack"]);
    return P(`${inr(a)} + ${g}% GST: final bill`, `On an online shop, a ${x} is priced at ${inr(a)} before tax. GST is ${g}%. What is the final price at checkout?`, a + t, "₹", `GST = ${t}, so ${a} + ${t} = ${a + t}.`, ["Find the GST first, then add it to the price."]); },
  bill2() { const sc = scAny(), [X, Y] = some(sc, 2), q1 = R(2, 4), q2 = R(2, 4), p1 = price(X), p2 = price(Y);
    return P(`${q1} × ${inr(p1)} + ${q2} × ${inr(p2)}`, `${sc.at}, your basket has: ${X.n} at ${inr(p1)} each, quantity ${q1}; and ${Y.n} at ${inr(p2)} each, quantity ${q2}. What is the bill?`, q1 * p1 + q2 * p2, "₹", `${q1 * p1} + ${q2 * p2} = ${q1 * p1 + q2 * p2}.`, ["Work out each item’s cost first.", "Then add the two totals."]); },
  est() { const f = () => { let n = R(11, 99); while (n % 10 === 5) n = R(11, 99); return n; }, a = f(), b = f(), c = f(), r = n => Math.round(n / 10) * 10;
    return P(`Round and add ${a}, ${b}, ${c}`, `At the supermarket you want a quick idea of your bill. Your three items cost ${inr(a)}, ${inr(b)} and ${inr(c)}. Estimate the total by rounding each price to the nearest ₹10.`, r(a) + r(b) + r(c), "₹", `${r(a)} + ${r(b)} + ${r(c)} = ${r(a) + r(b) + r(c)}.`, ["Round each price to the nearest 10 first, then add."]); },
  budget() { const inc = R(30, 80, 10) * 100, r = R(5, 12) * 100, s = R(5, 12) * 100;
    return P(`${inr(inc)} − ${inr(r)} − ${inr(s)}`, `Your small shop earns ${inr(inc)} this month. Rent is ${inr(r)} and stock is ${inr(s)}. How much money is left?`, inc - r - s, "₹", `${r} + ${s} = ${r + s}, so ${inc} − ${r + s} = ${inc - r - s}.`, ["Add the expenses first.", "Then subtract them from the income."]); },
  saveweeks() { const t = pick([200, 300, 500, 600, 1000]), p = pick([20, 25, 50, 100]), x = pick(["a new bicycle", "a tablet for your stall’s accounts", "a stall for the school fair"]);
    return P(`${inr(t)} ÷ ${inr(p)} a week: weeks`, `You want to save ${inr(t)} for ${x}. You put ${inr(p)} into your piggy bank every week. How many weeks will it take?`, t / p, "weeks", `${t} ÷ ${p} = ${t / p}.`, ["Weeks = goal ÷ saved each week."]); },
  share() { const n = pick([2, 3, 4, 5]), each = R(5, 40, 5) * 10, total = each * n;
    return P(`${inr(total)} ÷ ${n} people`, `You and ${n - 1} friend${n > 2 ? "s" : ""} run a stall at the school fair and make ${inr(total)} profit together. You share it equally. How much does each person get?`, each, "₹", `${total} ÷ ${n} = ${each}.`, ["Divide the profit by the number of people."]); },
  growth() { const old = pick([50, 100, 200, 400, 500]), p = pick([10, 20, 25, 50]), nw = old + old * p / 100;
    return P(`Grew from ${inr(old)} to ${inr(nw)}: growth %`, `Your online shop’s sales grew from ${inr(old)} last month to ${inr(nw)} this month. By what percent did they grow?`, p, "%", `Increase ${nw - old} ÷ old ${old} × 100 = ${p}%.`, ["Find the increase first.", "Then increase ÷ old amount × 100."]); }
};

// three answer choices, one correct
function options(p) {
  const a = p.ans, base = Math.max(1, Math.round(a * 0.1));
  let c = [a + 5, a - 5, a + 10, a - 10, a + base, a - base, a * 2, Math.round(a / 2), a + 1, a - 1, a + 20, a - 20];
  c = shuffle(c.filter((v, i) => v > 0 && v !== a && c.indexOf(v) === i));
  const picks = c.slice(0, 2);
  const all = shuffle([a].concat(picks));
  return { opts: all.map(v => fmt(v, p.unit)), ans: all.indexOf(a) };
}

// "which calculation is wrong?": two correct statements and one wrong
function spot(id) {
  const ps = [];
  while (ps.length < 3) { const p = G[id](); if (!ps.some(x => x.expr === p.expr)) ps.push(p); }
  const wrongSet = options(ps[2]);
  const wrongStr = wrongSet.opts.filter((o, i) => i !== wrongSet.ans)[0];
  const st = [
    { t: `${ps[0].expr} = ${fmt(ps[0].ans, ps[0].unit)}`, bad: false },
    { t: `${ps[1].expr} = ${fmt(ps[1].ans, ps[1].unit)}`, bad: false },
    { t: `${ps[2].expr} = ${wrongStr}`, bad: true }
  ];
  const order = shuffle(st);
  return { opts: order.map(s => s.t), ans: order.findIndex(s => s.bad),
           why: `The right answer is ${fmt(ps[2].ans, ps[2].unit)}. ${ps[2].why}`, hint: ps[2].hint };
}

root.MATHS = {
  has: id => typeof G[id] === "function",
  gen: id => G[id](),
  options, spot, fmt, inr,
  pair(id) { const p = G[id](); return { a: p.expr, b: fmt(p.ans, p.unit) }; }
};
if (typeof module !== "undefined" && module.exports) module.exports = root.MATHS;
})(typeof window !== "undefined" ? window : globalThis);
