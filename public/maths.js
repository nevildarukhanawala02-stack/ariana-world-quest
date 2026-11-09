/* Money Maths problem generators: one per skill id (see content/maths.js).
   Every call makes fresh numbers, so replays never repeat. All answers are whole numbers. */
(function (root) {
"use strict";
const R = (a, b, s) => { s = s || 1; return a + s * Math.floor(Math.random() * (Math.floor((b - a) / s) + 1)); };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const inr = n => "₹" + Number(n).toLocaleString("en-IN");
const ITEMS = ["samosa", "notebook", "toy", "mango", "cap", "bangle", "kite", "ball", "pencil box", "sandwich"];
const two = () => { const a = pick(ITEMS); let b = pick(ITEMS); while (b === a) b = pick(ITEMS); return [a, b]; };

function fmt(ans, unit) {
  if (unit === "₹") return inr(ans);
  if (unit === "%") return ans + "%";
  if (!unit) return String(ans);
  return ans + " " + unit;
}
const P = (expr, q, ans, unit, why, hint) => ({ expr, q, ans, unit, why, hint });

const G = {
  add2() { const a = R(10, 95, 5), b = R(10, 95, 5), [x, y] = two();
    return P(`${inr(a)} + ${inr(b)}`, `A ${x} costs ${inr(a)} and a ${y} costs ${inr(b)}. What is the total?`, a + b, "₹", `${a} + ${b} = ${a + b}.`, ["Add the two prices.", "Add the tens first, then the ones."]); },
  add3() { const a = R(10, 60, 5), b = R(10, 60, 5), c = R(10, 60, 5);
    return P(`${inr(a)} + ${inr(b)} + ${inr(c)}`, `Three items cost ${inr(a)}, ${inr(b)} and ${inr(c)}. What is the bill?`, a + b + c, "₹", `${a} + ${b} + ${c} = ${a + b + c}.`, ["Add two prices, then add the third.", "Add the easy numbers first."]); },
  mulq() { const p = R(5, 25, 5), n = R(3, 9), [x] = two();
    return P(`${n} × ${inr(p)}`, `One ${x} costs ${inr(p)}. How much do ${n} cost?`, p * n, "₹", `${n} × ${p} = ${p * n}.`, ["Multiply the price of one by how many.", `Think of ${p} added ${n} times.`]); },
  change() { const note = pick([50, 100, 200, 500]), bill = R(1, note / 5 - 1) * 5;
    return P(`${inr(note)} − ${inr(bill)}`, `Your bill is ${inr(bill)}. You pay with a ${inr(note)} note. How much change do you get?`, note - bill, "₹", `${note} − ${bill} = ${note - bill}.`, ["Change = money paid − bill.", "Count up from the bill to the note."]); },
  sub() { const a = R(40, 200, 5), b = R(10, a - 10, 5), [x, y] = two();
    return P(`${inr(a)} − ${inr(b)}`, `A ${x} costs ${inr(a)} and a ${y} costs ${inr(b)}. How much more does the ${x} cost?`, a - b, "₹", `${a} − ${b} = ${a - b}.`, ["Subtract the smaller price from the bigger one."]); },
  unitprice() { const u = R(3, 20), n = R(3, 9), [x] = two();
    return P(`${inr(u * n)} ÷ ${n}`, `${n} ${x}s cost ${inr(u * n)} together. What does 1 ${x} cost?`, u, "₹", `${u * n} ÷ ${n} = ${u}.`, ["Divide the total by how many there are.", `What number times ${n} makes ${u * n}?`]); },
  add4() { const a = R(100, 500, 50), b = R(100, 500, 50), c = R(100, 500, 50), d = R(100, 500, 50);
    return P(`${a} + ${b} + ${c} + ${d}`, `Sales this week: Mon ${inr(a)}, Tue ${inr(b)}, Wed ${inr(c)}, Thu ${inr(d)}. What are the total sales?`, a + b + c + d, "₹", `${a} + ${b} + ${c} + ${d} = ${a + b + c + d}.`, ["Add the days two at a time.", "Add the hundreds first."]); },
  avg() { const m = R(30, 90, 10), o = shuffle([20, -10, -20, 10]), v = o.map(x => m + x);
    return P(`Average of ${v.join(", ")}`, `A stall sold ${v[0]}, ${v[1]}, ${v[2]} and ${v[3]} glasses on four days. What is the average per day?`, m, "", `Total ${v.reduce((s, x) => s + x, 0)} ÷ 4 = ${m}.`, ["Add all four, then divide by 4.", "The answer is somewhere in the middle of the numbers."]); },
  profit() { const cp = R(10, 90, 5), p = R(5, 40, 5), [x] = two();
    return P(`Bought ${inr(cp)}, sold ${inr(cp + p)}: profit`, `You buy a ${x} for ${inr(cp)} and sell it for ${inr(cp + p)}. What is your profit?`, p, "₹", `Profit = SP − CP = ${cp + p} − ${cp} = ${p}.`, ["Profit = selling price − cost price."]); },
  loss() { const cp = R(30, 100, 5), l = R(5, 25, 5), [x] = two();
    return P(`Bought ${inr(cp)}, sold ${inr(cp - l)}: loss`, `You buy a ${x} for ${inr(cp)} but sell it for only ${inr(cp - l)}. How much is your loss?`, l, "₹", `Loss = CP − SP = ${cp} − ${cp - l} = ${l}.`, ["You sold for less than you paid. Loss = cost price − selling price."]); },
  profitn() { const p = R(2, 12), n = R(5, 20, 5), [x] = two();
    return P(`${n} items × ${inr(p)} profit each: total profit`, `You make ${inr(p)} profit on each ${x}. You sell ${n}. What is your total profit?`, p * n, "₹", `${n} × ${p} = ${p * n}.`, ["Total profit = profit on one × how many sold."]); },
  findcost() { const sp = R(40, 150, 5), p = R(5, 30, 5), [x] = two();
    return P(`Sold ${inr(sp)} with ${inr(p)} profit: cost`, `You sold a ${x} for ${inr(sp)} and made ${inr(p)} profit. What did it cost you?`, sp - p, "₹", `Cost = SP − profit = ${sp} − ${p} = ${sp - p}.`, ["Work backwards: cost = selling price − profit."]); },
  pct10() { const a = R(50, 500, 10);
    return P(`10% of ${inr(a)}`, `What is 10% of ${inr(a)}?`, a / 10, "₹", `10% is one tenth: ${a} ÷ 10 = ${a / 10}.`, ["10% means one tenth. Divide by 10."]); },
  pct() { const p = pick([20, 25, 50]), a = pick([40, 60, 80, 100, 120, 200, 400, 500]), h = { 20: "20% is a fifth: divide by 5.", 25: "25% is a quarter: divide by 4.", 50: "50% is half: divide by 2." };
    return P(`${p}% of ${inr(a)}`, `What is ${p}% of ${inr(a)}?`, a * p / 100, "₹", `${h[p]} ${a} → ${a * p / 100}.`, [h[p]]); },
  discamt() { const m = pick([100, 200, 400, 500, 800, 1000]), d = pick([10, 20, 25, 50]);
    return P(`${d}% off MRP ${inr(m)}: you save`, `A shirt has an MRP of ${inr(m)} and a ${d}% discount. How much do you save?`, m * d / 100, "₹", `${d}% of ${m} = ${m * d / 100}.`, [`Find ${d}% of the MRP.`, "Discount amount = percent × MRP."]); },
  saleprice() { const m = pick([100, 200, 400, 500, 800, 1000]), d = pick([10, 20, 25, 50]), s = m * d / 100;
    return P(`MRP ${inr(m)} with ${d}% off: you pay`, `A bag has an MRP of ${inr(m)} and a ${d}% discount. How much do you pay?`, m - s, "₹", `${d}% of ${m} = ${s}, so ${m} − ${s} = ${m - s}.`, ["First find the discount, then subtract it from the MRP."]); },
  pctof() { const w = pick([20, 40, 80, 100, 200]), p = pick([10, 20, 25, 50]), part = w * p / 100;
    return P(`${part} out of ${w}`, `You sold ${part} of your ${w} cakes. What percent did you sell?`, p, "%", `${part} ÷ ${w} × 100 = ${p}%.`, ["Part ÷ whole × 100.", "Try: how many of these fit in 100?"]); },
  margin() { const cp = pick([40, 80, 100, 200, 400]), p = pick([10, 20, 25, 50]), pr = cp * p / 100;
    return P(`Bought ${inr(cp)}, sold ${inr(cp + pr)}: profit %`, `You buy for ${inr(cp)} and sell for ${inr(cp + pr)}. What is your profit percent?`, p, "%", `Profit ${pr} ÷ cost ${cp} × 100 = ${p}%.`, ["First find the profit, then do profit ÷ cost × 100."]); },
  spmargin() { const cp = pick([40, 80, 100, 200, 400]), p = pick([10, 20, 25, 50]), pr = cp * p / 100;
    return P(`Cost ${inr(cp)} + ${p}% profit: sell at`, `You buy for ${inr(cp)} and want ${p}% profit. What should your selling price be?`, cp + pr, "₹", `${p}% of ${cp} = ${pr}, so ${cp} + ${pr} = ${cp + pr}.`, [`Find ${p}% of the cost, then add it to the cost.`]); },
  discprofit() { const m = pick([100, 200, 400, 500]), d = pick([10, 20, 25, 50]), sale = m - m * d / 100, extra = pick([10, 20, 30]), cost = sale - extra;
    return P(`Cost ${inr(cost)}, MRP ${inr(m)}, ${d}% off: profit`, `A toy costs you ${inr(cost)}. Its MRP is ${inr(m)} but you give ${d}% off. What is your profit now?`, extra, "₹", `Sale price = ${m} − ${m * d / 100} = ${sale}. Profit = ${sale} − ${cost} = ${extra}.`, ["Find the sale price first.", "Then profit = sale price − cost."]); },
  monthcost() { const f = pick([500, 1000, 2000, 3000]), v = R(5, 20, 5), n = pick([20, 50, 100]);
    return P(`${inr(f)} + ${n} × ${inr(v)}: total cost`, `Rent is ${inr(f)} a month. Each cake costs ${inr(v)} to make and you make ${n}. What is your total cost?`, f + n * v, "₹", `${n} × ${v} = ${n * v}, then ${f} + ${n * v} = ${f + n * v}.`, ["Find the cost of making the cakes first.", "Then add the rent."]); },
  breakeven() { const f = pick([200, 300, 500, 600, 1000]), p = pick([5, 10, 20, 25, 50]);
    return P(`${inr(f)} ÷ ${inr(p)} profit each: sales to break even`, `Your stall costs ${inr(f)} a day. You earn ${inr(p)} profit on each sale. How many sales do you need to cover the cost?`, f / p, "sales", `${f} ÷ ${p} = ${f / p}.`, ["Sales needed = cost ÷ profit on each sale."]); },
  monthprofit() { const rev = R(4, 12) * 500, cost = rev - pick([500, 1000, 1500]);
    return P(`Earned ${inr(rev)}, spent ${inr(cost)}: profit`, `In a month you earn ${inr(rev)} and spend ${inr(cost)} on everything. What is your profit?`, rev - cost, "₹", `${rev} − ${cost} = ${rev - cost}.`, ["Profit = money earned − money spent."]); },
  perday() { const r = pick([600, 900, 1200, 1500, 3000]);
    return P(`${inr(r)} ÷ 30 days: rent per day`, `Shop rent is ${inr(r)} for 30 days. What is the rent for one day?`, r / 30, "₹", `${r} ÷ 30 = ${r / 30}.`, ["Divide the monthly rent by 30.", "Try dividing by 3 first, then by 10."]); },
  gstamt() { const a = pick([100, 200, 400, 500, 1000]), g = pick([5, 12, 18]);
    return P(`${g}% GST on ${inr(a)}`, `A bill is ${inr(a)} before tax. GST is ${g}%. How much GST is added?`, a * g / 100, "₹", `${g}% of ${a} = ${a * g / 100}.`, [`Find ${g}% of the price.`]); },
  gst() { const a = pick([100, 200, 400, 500, 1000]), g = pick([5, 12, 18]), t = a * g / 100;
    return P(`${inr(a)} + ${g}% GST: final bill`, `A bill is ${inr(a)} before tax. GST is ${g}%. What is the final bill?`, a + t, "₹", `GST = ${t}, so ${a} + ${t} = ${a + t}.`, ["Find the GST first, then add it to the price."]); },
  bill2() { const q1 = R(2, 5), p1 = R(10, 50, 10), q2 = R(2, 5), p2 = R(5, 25, 5), [x, y] = two();
    return P(`${q1} × ${inr(p1)} + ${q2} × ${inr(p2)}`, `${q1} ${x}s at ${inr(p1)} each and ${q2} ${y}s at ${inr(p2)} each. What is the bill?`, q1 * p1 + q2 * p2, "₹", `${q1 * p1} + ${q2 * p2} = ${q1 * p1 + q2 * p2}.`, ["Work out each item’s cost first.", "Then add the two totals."]); },
  est() { const f = () => { let n = R(11, 99); while (n % 10 === 5) n = R(11, 99); return n; }, a = f(), b = f(), c = f(), r = n => Math.round(n / 10) * 10;
    return P(`Round and add ${a}, ${b}, ${c}`, `Estimate the total of ${inr(a)}, ${inr(b)} and ${inr(c)} by rounding each price to the nearest ₹10.`, r(a) + r(b) + r(c), "₹", `${r(a)} + ${r(b)} + ${r(c)} = ${r(a) + r(b) + r(c)}.`, ["Round each price to the nearest 10 first, then add."]); },
  budget() { const inc = R(30, 80, 10) * 100, r = R(5, 15) * 100, s = R(5, 15) * 100;
    return P(`${inr(inc)} − ${inr(r)} − ${inr(s)}`, `You earn ${inr(inc)} this month. Rent is ${inr(r)} and supplies are ${inr(s)}. How much is left?`, inc - r - s, "₹", `${r} + ${s} = ${r + s}, so ${inc} − ${r + s} = ${inc - r - s}.`, ["Add the expenses first.", "Then subtract them from the income."]); },
  saveweeks() { const t = pick([200, 300, 500, 600, 1000]), p = pick([20, 25, 50, 100]);
    return P(`${inr(t)} ÷ ${inr(p)} a week: weeks`, `You want to save ${inr(t)} for a new stall. You save ${inr(p)} each week. How many weeks will it take?`, t / p, "weeks", `${t} ÷ ${p} = ${t / p}.`, ["Weeks = goal ÷ saved each week."]); },
  share() { const n = pick([2, 3, 4, 5]), each = R(5, 40, 5) * 10, total = each * n;
    return P(`${inr(total)} ÷ ${n} people`, `You and ${n - 1} friend${n > 2 ? "s" : ""} make a profit of ${inr(total)} together and share it equally. How much does each person get?`, each, "₹", `${total} ÷ ${n} = ${each}.`, ["Divide the profit by the number of people."]); },
  growth() { const old = pick([50, 100, 200, 400, 500]), p = pick([10, 20, 25, 50]), nw = old + old * p / 100;
    return P(`Grew from ${inr(old)} to ${inr(nw)}: growth %`, `Sales grew from ${inr(old)} to ${inr(nw)}. By what percent did they grow?`, p, "%", `Increase ${nw - old} ÷ old ${old} × 100 = ${p}%.`, ["Find the increase first.", "Then increase ÷ old amount × 100."]); }
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
