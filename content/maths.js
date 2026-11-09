"use strict";
/*
  Money Maths curriculum: maths for running a real business, building up from simple totals to margins, GST and break-even.
  Problems are generated fresh every time by public/maths.js (one generator per skill id below),
  so each replay has new numbers. Here we keep the teaching cards, the story and the "make it yours" mini-game.
*/

const SKILLS = {
  // Quest 1: The Lemonade Stand
  add2:      { name: "Adding prices", emoji: "🧾", mean: "adding two prices to get a total", title: "Total bill", text: "A bill is the total of everything a customer buys. Add the prices together.", ex: "Samosa ₹15 + chai ₹10 = ₹25" },
  add3:      { name: "Adding three prices", emoji: "🛒", mean: "adding up three or more prices", title: "Longer bills", text: "Add two prices first, then add the third. Easy numbers like 10s and 5s first make it quick.", ex: "₹20 + ₹15 + ₹10: 20 + 10 = 30, then 30 + 15 = ₹45" },
  mulq:      { name: "Price × quantity", emoji: "✖️", mean: "finding the cost of many items", title: "Many of the same", text: "When customers buy many of the same thing, multiply the price of one by how many.", ex: "6 glasses × ₹15 = ₹90" },
  change:    { name: "Giving change", emoji: "💵", mean: "finding what to give back", title: "Change", text: "Change is what you give back: the money paid minus the bill. Count up from the bill to the note.", ex: "Bill ₹35, pay ₹50 → ₹15 change" },
  // Quest 2: Market Day
  sub:       { name: "Price differences", emoji: "⚖️", mean: "finding how much more one thing costs", title: "How much more?", text: "To find the gap between two prices, subtract the smaller from the bigger.", ex: "Bag ₹150, cap ₹60 → ₹150 − ₹60 = ₹90 more" },
  unitprice: { name: "Price of one", emoji: "🏷️", mean: "dividing to find the price of one item", title: "Unit price", text: "The price of ONE item is the total divided by how many. Shopkeepers use it to compare deals.", ex: "5 pens for ₹45 → ₹45 ÷ 5 = ₹9 each" },
  add4:      { name: "A week of sales", emoji: "📒", mean: "adding up several days of sales", title: "Sales diary", text: "Shopkeepers add each day’s sales to see how much they earned in all.", ex: "₹200 + ₹150 + ₹300 + ₹250 = ₹900" },
  avg:       { name: "Average", emoji: "📊", mean: "the fair share if every day was the same", title: "Average", text: "The average is the total divided by the number of days. It tells you about a typical day.", ex: "Sales 10, 20, 30, 40: total 100 ÷ 4 = 25 a day" },
  // Quest 3: My First Profit
  profit:    { name: "Profit", emoji: "💰", mean: "selling price minus cost price", title: "Profit", text: "Cost price (CP) is what you pay to get an item. Selling price (SP) is what the customer pays you. Profit = SP − CP.", ex: "CP ₹40, SP ₹55 → profit ₹15" },
  loss:      { name: "Loss", emoji: "📉", mean: "when you sell for less than you paid", title: "Loss", text: "If the selling price is lower than the cost price, you make a loss. Loss = CP − SP.", ex: "CP ₹80, SP ₹65 → loss ₹15" },
  profitn:   { name: "Total profit", emoji: "🧮", mean: "profit per item times items sold", title: "Profit on many", text: "Total profit = profit on one item × number of items sold.", ex: "₹5 profit × 20 items = ₹100" },
  findcost:  { name: "Finding the cost", emoji: "🔎", mean: "working backwards from selling price and profit", title: "Work backwards", text: "If you know the selling price and the profit, the cost price is SP − profit.", ex: "SP ₹60, profit ₹15 → CP ₹45" },
  // Quest 4: Sale Season
  pct10:     { name: "10 percent", emoji: "🔟", mean: "one tenth of an amount", title: "10 percent", text: "Percent means “out of 100”. 10% is one tenth, so divide by 10.", ex: "10% of ₹250 = ₹25" },
  pct:       { name: "Easy percents", emoji: "➗", mean: "20, 25 and 50 percent of an amount", title: "Easy percents", text: "50% is half. 25% is a quarter. 20% is a fifth.", ex: "25% of ₹80 = ₹20" },
  discamt:   { name: "Discount amount", emoji: "🎁", mean: "how much a discount saves you", title: "Discount and MRP", text: "MRP is the Maximum Retail Price printed on a product. A discount takes some percent off the MRP. Work out that percent to see what you save.", ex: "MRP ₹500, 20% off → you save ₹100" },
  saleprice: { name: "Sale price", emoji: "🛍️", mean: "MRP minus the discount", title: "Price after discount", text: "Sale price = MRP − discount amount.", ex: "MRP ₹500, 20% off → ₹500 − ₹100 = ₹400" },
  // Quest 5: Percent Power
  pctof:     { name: "What percent?", emoji: "❓", mean: "turning a part of a whole into a percent", title: "What percent is it?", text: "To find what percent a part is of the whole, work out part ÷ whole × 100. Try “out of 100” first.", ex: "20 out of 80 → 20 ÷ 80 = 1/4 = 25%" },
  margin:    { name: "Profit percent", emoji: "📈", mean: "profit as a percent of cost", title: "Profit percent (margin)", text: "Profit percent = profit ÷ cost × 100. It tells you how hard your money is working.", ex: "Cost ₹40, profit ₹10 → 10 ÷ 40 = 25%" },
  spmargin:  { name: "Pricing for profit", emoji: "🎯", mean: "choosing a selling price for a target profit", title: "Pricing for profit", text: "To earn a profit percent, work out that percent of the cost and add it to the cost.", ex: "Cost ₹200, 25% profit → +₹50 → sell at ₹250" },
  discprofit:{ name: "Profit after discount", emoji: "🤔", mean: "checking you still profit after a sale", title: "Do you still profit?", text: "Before giving a discount, check: sale price − cost price. If it is above zero, you still make a profit.", ex: "Cost ₹80, MRP ₹120, 25% off → sale ₹90 → profit ₹10" },
  // Quest 6: Fixed Costs
  monthcost: { name: "Total cost", emoji: "🏭", mean: "fixed cost plus the cost of making things", title: "Fixed and variable costs", text: "Fixed costs (like rent) stay the same. Variable costs grow with how much you make. Total cost = fixed + variable.", ex: "Rent ₹1000 + 50 cakes × ₹10 = ₹1500" },
  breakeven: { name: "Break-even", emoji: "🚦", mean: "sales needed to cover your costs", title: "Break-even", text: "Break-even is when your sales just cover your costs. Sales needed = fixed cost ÷ profit on each item.", ex: "Cost ₹500, profit ₹25 each → 20 sales" },
  monthprofit:{ name: "Real profit", emoji: "🗓️", mean: "money earned minus money spent", title: "Real profit", text: "Real profit = everything you earned − everything you spent, including rent and supplies.", ex: "Earned ₹4000, spent ₹3000 → profit ₹1000" },
  perday:    { name: "Cost per day", emoji: "📆", mean: "dividing a monthly cost into days", title: "Cost per day", text: "Divide a monthly cost by the number of days to see what each day costs you.", ex: "Rent ₹900 ÷ 30 days = ₹30 a day" },
  // Quest 7: GST & Bills
  gstamt:    { name: "GST amount", emoji: "🏛️", mean: "the tax added to a bill", title: "GST", text: "GST is a tax added to what you buy. Find the percent of the price to see how much tax is added.", ex: "₹200 with 12% GST → tax ₹24" },
  gst:       { name: "Bill with GST", emoji: "💳", mean: "price plus GST", title: "The final bill", text: "Final bill = price + GST amount.", ex: "₹200 + ₹24 = ₹224" },
  bill2:     { name: "Bills with quantities", emoji: "📃", mean: "bills with different items and quantities", title: "Bills with quantities", text: "Multiply each item’s price by its quantity, then add the totals.", ex: "2 × ₹40 + 3 × ₹10 = ₹80 + ₹30 = ₹110" },
  est:       { name: "Estimating", emoji: "👀", mean: "rounding to add quickly", title: "Quick estimates", text: "Round each price to the nearest ₹10, then add. It gives a quick answer that is close.", ex: "₹47 + ₹32 + ₹58 ≈ 50 + 30 + 60 = ₹140" },
  // Quest 8: Budget Boss
  budget:    { name: "Budget", emoji: "👛", mean: "income minus expenses", title: "Budget", text: "A budget plans money in and money out. Money left = income − expenses.", ex: "Income ₹5000, rent ₹2000, supplies ₹1500 → ₹1500 left" },
  saveweeks: { name: "Saving goals", emoji: "🐷", mean: "how long to save for a goal", title: "Saving up", text: "Weeks needed = goal ÷ amount saved each week.", ex: "Goal ₹500, save ₹50 a week → 10 weeks" },
  share:     { name: "Sharing profit", emoji: "🤝", mean: "splitting profit fairly", title: "Fair shares", text: "To share equally, divide the profit by the number of people.", ex: "₹600 among 3 people → ₹200 each" },
  growth:    { name: "Growth percent", emoji: "🚀", mean: "how much sales grew, as a percent", title: "Growth", text: "Growth percent = increase ÷ old amount × 100.", ex: "₹400 → ₹500: +₹100 → 100 ÷ 400 = 25%" }
};

const quests = [
  {
    id: 1, kind: "maths", title: "The Lemonade Stand", emoji: "🍋", theme: "Money Maths",
    intro: "You’re opening your very first lemonade stand! Let’s work out the bills before customers arrive.",
    badge: { icon: "🍋", name: "Stand Starter" },
    skills: ["add2", "add3", "mulq", "change"],
    warm: [["7 × 8", "56"], ["9 + 6", "15"], ["50 − 20", "30"], ["6 × 5", "30"]],
    create: { type: "budget", prompt: "A customer has ₹100 to spend. Tap items to fill the basket as close to ₹100 as you can, without going over.", target: 100,
      items: [{ n: "Lemonade", e: "🍋", p: 20 }, { n: "Samosa", e: "🥟", p: 15 }, { n: "Chai", e: "☕", p: 10 }, { n: "Cookie", e: "🍪", p: 5 }, { n: "Sandwich", e: "🥪", p: 30 }, { n: "Juice", e: "🧃", p: 25 }] }
  },
  {
    id: 2, kind: "maths", title: "Market Day", emoji: "🛒", theme: "Money Maths",
    intro: "It’s market day and your stall is busy. Time to compare prices and add up your sales diary!",
    badge: { icon: "🛒", name: "Market Pro" },
    skills: ["sub", "unitprice", "add4", "avg"],
    warm: [["8 × 7", "56"], ["72 ÷ 8", "9"], ["25 + 35", "60"], ["90 − 45", "45"]],
    create: { type: "budget", prompt: "A school has ₹150 to spend on supplies. Tap items to fill the basket as close to ₹150 as you can, without going over.", target: 150,
      items: [{ n: "Notebook", e: "📓", p: 40 }, { n: "Pen pack", e: "🖊️", p: 25 }, { n: "School bag", e: "🎒", p: 90 }, { n: "Bottle", e: "🧴", p: 60 }, { n: "Eraser", e: "🧽", p: 5 }, { n: "Ruler", e: "📏", p: 15 }] }
  },
  {
    id: 3, kind: "maths", title: "My First Profit", emoji: "💰", theme: "Money Maths",
    intro: "Every shopkeeper has a secret: they sell for more than they paid. Let’s learn about profit and loss!",
    badge: { icon: "💰", name: "Profit Pioneer" },
    skills: ["profit", "loss", "profitn", "findcost"],
    warm: [["12 × 5", "60"], ["80 − 35", "45"], ["15 + 27", "42"], ["6 × 9", "54"]],
    create: { type: "price", prompt: "You make bracelets. Customers won’t pay more than ₹60 for one. Pick a price that earns you the most profit.", item: "bracelets", e: "📿", cost: 30, qty: 10, fixed: 0, market: 60, options: [35, 45, 60, 80] }
  },
  {
    id: 4, kind: "maths", title: "Sale Season", emoji: "🏷️", theme: "Money Maths",
    intro: "Big SALE signs are everywhere! Let’s learn percents, the MRP and discounts the way real shops use them.",
    badge: { icon: "🏷️", name: "Sale Star" },
    skills: ["pct10", "pct", "discamt", "saleprice"],
    warm: [["9 × 6", "54"], ["100 − 40", "60"], ["45 + 28", "73"], ["84 ÷ 7", "12"]],
    create: { type: "sale", prompt: "Your T-shirts cost you ₹300 and the MRP is ₹600. Choose a discount big enough to attract customers, but one that still earns a profit.", item: "T-shirt", e: "👕", cost: 300, mrp: 600, options: [10, 25, 40, 60] }
  },
  {
    id: 5, kind: "maths", title: "Percent Power", emoji: "📈", theme: "Money Maths",
    intro: "Smart business owners think in percents. Let’s see how well your money is working!",
    badge: { icon: "📈", name: "Percent Pro" },
    skills: ["pctof", "margin", "spmargin", "discprofit"],
    warm: [["11 × 4", "44"], ["150 ÷ 3", "50"], ["37 + 25", "62"], ["200 − 85", "115"]],
    create: { type: "price", prompt: "You bake cakes that cost ₹40 each and you made 20. Customers won’t pay more than ₹100. Pick the price that earns the most profit.", item: "cakes", e: "🎂", cost: 40, qty: 20, fixed: 0, market: 100, options: [50, 70, 100, 130] }
  },
  {
    id: 6, kind: "maths", title: "Fixed Costs", emoji: "🏠", theme: "Money Maths",
    intro: "Rent, power, helpers: costs keep coming even on slow days. Let’s find out how many sales you need to break even!",
    badge: { icon: "🏠", name: "Cost Controller" },
    skills: ["monthcost", "breakeven", "monthprofit", "perday"],
    warm: [["13 × 3", "39"], ["240 ÷ 6", "40"], ["68 + 17", "85"], ["300 − 125", "175"]],
    create: { type: "price", prompt: "You sell cups of chai at ₹5 cost each and made 200. Rent for the stall is ₹600. Customers won’t pay more than ₹20. Pick the price that earns the most profit after rent.", item: "chai cups", e: "☕", cost: 5, qty: 200, fixed: 600, market: 20, options: [8, 12, 20, 25] }
  },
  {
    id: 7, kind: "maths", title: "GST & Bills", emoji: "🧾", theme: "Money Maths",
    intro: "Real shops add tax to bills. Let’s learn GST, and how to make quick estimates in your head.",
    badge: { icon: "🧾", name: "Bill Boss" },
    skills: ["gstamt", "gst", "bill2", "est"],
    warm: [["14 × 5", "70"], ["96 ÷ 8", "12"], ["129 + 71", "200"], ["500 − 175", "325"]],
    create: { type: "budget", prompt: "Your shop has ₹500 for new stock. Tap items to fill the basket as close to ₹500 as you can, without going over.", target: 500,
      items: [{ n: "Pen box", e: "🖊️", p: 120 }, { n: "Notebook set", e: "📓", p: 80 }, { n: "Calculator", e: "🧮", p: 250 }, { n: "Stapler", e: "📎", p: 90 }, { n: "Folder", e: "📁", p: 45 }, { n: "Tape", e: "🖇️", p: 35 }] }
  },
  {
    id: 8, kind: "maths", title: "Budget Boss", emoji: "👛", theme: "Money Maths",
    intro: "You’re running a real business now! Time to plan your budget, set saving goals and share profits fairly.",
    badge: { icon: "💼", name: "Business Brain" },
    skills: ["budget", "saveweeks", "share", "growth"],
    warm: [["15 × 6", "90"], ["144 ÷ 12", "12"], ["256 + 44", "300"], ["1000 − 350", "650"]],
    create: { type: "price", prompt: "You paint mugs that cost ₹60 each and made 50. Your workshop costs ₹1000. Customers won’t pay more than ₹200. Pick the price that earns the most profit.", item: "painted mugs", e: "🎨", cost: 60, qty: 50, fixed: 1000, market: 200, options: [90, 120, 200, 260] }
  }
];

const str = (v, n) => typeof v === "string" && v.trim().length > 0 && v.length <= n;

function validateMaths(q) {
  const e = [];
  if (!q || q.kind !== "maths") return ["kind must be maths"];
  if (!str(q.title, 60)) e.push("title");
  if (!str(q.emoji, 12)) e.push("emoji");
  if (!str(q.intro, 240)) e.push("intro");
  if (!q.badge || !str(q.badge.name, 40) || !str(q.badge.icon, 12)) e.push("badge");
  if (!Array.isArray(q.skills) || q.skills.length !== 4 || q.skills.some(s => !SKILLS[s]) || new Set(q.skills).size !== 4) e.push("skills (4 known skill ids)");
  if (!Array.isArray(q.warm) || q.warm.length !== 4 || q.warm.some(p => !Array.isArray(p) || p.length !== 2 || !str(p[0], 30) || !str(String(p[1]), 30))) e.push("warm (4 pairs)");
  const c = q.create;
  if (!c || !str(c.prompt, 300)) e.push("create.prompt");
  else if (c.type === "budget") {
    if (!(c.target > 0) || !Array.isArray(c.items) || c.items.length < 5 || c.items.length > 8 || c.items.some(i => !str(i.n, 20) || !str(i.e, 12) || !(i.p > 0))) e.push("create budget");
  } else if (c.type === "price") {
    if (!str(c.item, 30) || !str(c.e, 12) || !(c.cost > 0) || !(c.qty > 0) || !(c.market > 0) || !(c.fixed >= 0) || !Array.isArray(c.options) || c.options.length < 3 || c.options.length > 5 || c.options.some(o => !(o > 0))) e.push("create price");
  } else if (c.type === "sale") {
    if (!str(c.item, 30) || !str(c.e, 12) || !(c.cost > 0) || !(c.mrp > c.cost) || !Array.isArray(c.options) || c.options.length < 3 || c.options.length > 5 || c.options.some(o => !(o > 0 && o < 100))) e.push("create sale");
  } else e.push("create.type");
  return e;
}

// attach the teaching info so the client gets everything in one call
function withUnits(q) {
  return Object.assign({}, q, { units: q.skills.map(id => Object.assign({ id }, SKILLS[id])) });
}

module.exports = { SKILLS, quests, validateMaths, withUnits };
