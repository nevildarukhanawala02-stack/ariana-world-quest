"use strict";
/*
  Starter curriculum. Each quest is plain data, so the app builds every game from it.
  Word quest:    4 words, each with story line, gap sentence, meaning quiz, silly-sentence check, sentence-builder pieces.
  Grammar quest: rule cards, fill-the-gap, spot-the-mistake, unscramble, read-aloud sentences.
  More quests can be added by the parent area (AI-generated) or by appending to this file.
*/

// helper: w(word, respelling, pronunciation tip, meaning, emoji, story line, gap sentence,
//          [quiz question, [3 options], answer index, explanation],
//          [[3 sentences], index of the silly one, explanation],
//          startersForBuilder, endingsForBuilder)
const w = (word, say, tip, mean, emoji, line, gap, quiz, silly, a, b) => ({
  w: word, say, tip, mean, emoji, line, gap,
  quiz: { q: quiz[0], opts: quiz[1], ans: quiz[2], why: quiz[3] },
  silly: { opts: silly[0], ans: silly[1], why: silly[2] },
  build: { a, b }
});

module.exports = [
  {
    id: 1, kind: "words", title: "The Busy Market", emoji: "🧺", theme: "Word Quest",
    intro: "Today’s story takes us to a busy market with Tara. Four new words are hiding in it!",
    badge: { icon: "🏅", name: "Market Explorer" },
    warm: [["quick", "fast"], ["glad", "happy"], ["begin", "start"], ["shout", "yell"]],
    say: [0, 3],
    words: [
      w("bustling", "BUS-ling", "The t is silent, just like in “castle”.", "full of busy people and lots of noise", "🧺",
        "Tara walked into the bustling market. Everyone was buying, selling and calling out prices.",
        "The ___ market was full of noise and people.",
        ["Which place is usually bustling?", ["A busy railway station", "A quiet library at midnight", "An empty playground"], 0, "Yes! Bustling places are full of busy people, just like Tara’s market."],
        [["The bustling market was full of busy shoppers.", "The bustling market was completely empty and silent.", "Shoppers hurried through the bustling market."], 1, "Ha! A bustling place can’t be empty and silent."],
        ["The", "Our town’s", "Saturday’s"], ["market smelled of samosas.", "station never sleeps.", "street was full of music."]),
      w("gleaming", "GLEE-ming", "The “ea” says “ee”, like in “dream”.", "shining brightly", "✨",
        "At one stall, golden bangles were gleaming in the sunlight.",
        "The ___ gold ring sparkled in the sun.",
        ["A gleaming floor looks…", ["dirty and dull", "shiny and bright", "old and broken"], 1, "Yes! Gleaming means shining brightly, like polished gold."],
        [["The gleaming mirror was covered in thick, black mud.", "The gleaming mirror shone in the morning light.", "Ria polished the mirror until it was gleaming."], 0, "Ha! A mirror covered in mud can’t be gleaming."],
        ["The", "Grandma’s", "Our"], ["bangles flashed in the sun.", "steel bowl sat on the shelf.", "bicycle stood by the gate."]),
      w("reluctant", "ri-LUK-tunt", "Push the middle part: ri-LUK-tunt.", "not really wanting to do something", "🍬",
        "Tara’s little brother was reluctant to leave without a toffee.",
        "Rohan was ___ to try the spicy chutney.",
        ["What does “reluctant” mean?", ["Very excited to start", "Not really wanting to do something", "Super tired and sleepy"], 1, "Yes! If you’re reluctant, you hesitate because you don’t really want to."],
        [["Ravi was reluctant to eat the bitter gourd, so he pushed his plate away.", "Ravi was reluctant to eat his favourite ice cream, so he gobbled it up in one second.", "Meena was reluctant to jump into the freezing pool."], 1, "Right! You wouldn’t be reluctant about your favourite ice cream."],
        ["The", "My", "Our"], ["brother refused to leave the toffee shop.", "friend stood still at the edge of the pool.", "cousin hid behind the door at the dance."]),
      w("mischievous", "MIS-chuh-vus", "Only three parts! Not “mis-CHEE-vee-us”.", "playfully naughty, always up to small tricks", "🐒",
        "Suddenly, a mischievous monkey grabbed a banana and ran away!",
        "The ___ puppy chewed my slipper and ran off giggling.",
        ["Which of these is mischievous behaviour?", ["Hiding your friend’s shoe as a joke", "Doing homework quietly", "Sleeping through a movie"], 0, "Yes! Mischievous people love playing small tricks."],
        [["The mischievous monkey hid my hat and giggled.", "The mischievous monkey sat perfectly still and never played any tricks.", "My mischievous cousin loves harmless pranks."], 1, "Right! A mischievous monkey is full of tricks. It wouldn’t play none."],
        ["The", "My", "Our"], ["puppy hid my slipper again.", "cousin giggled and swapped the salt and sugar.", "monkey stole a banana and ran."])
    ]
  },
  {
    id: 2, kind: "words", title: "Cricket on the Terrace", emoji: "🏏", theme: "Word Quest",
    intro: "Dev and Meera are playing cricket on the terrace. Let’s see which new words come flying our way!",
    badge: { icon: "🏏", name: "Terrace Champion" },
    warm: [["big", "huge"], ["stop", "halt"], ["tiny", "small"], ["clever", "smart"]],
    say: [2, 3],
    words: [
      w("eager", "EE-gur", "The g is hard, like in “go”: EE-gur.", "very keen and excited to do something", "🙌",
        "Dev and his cousins were eager to start the terrace cricket match.",
        "Meera was ___ to open the batting; she could not wait.",
        ["If you are eager to go on a trip, you feel…", ["excited and ready", "bored and sleepy", "scared and angry"], 0, "Yes! Eager means very keen and excited."],
        [["Rita was eager to open her birthday present.", "Rita was eager to see the dentist because she was terrified of him.", "The eager kids ran to the ice-cream van."], 1, "Ha! You can’t be eager about something you’re terrified of."],
        ["The", "My little", "Our"], ["brother was first in the queue.", "cousin ran to the gate at six.", "class cheered when the bell rang."]),
      w("fumble", "FUM-bul", "The b is soft: FUM-bul.", "to drop something or handle it clumsily", "🧤",
        "Dev jumped for the catch, but his hands were nervous and he began to fumble the ball.",
        "Don’t ___ the glass, it is slippery.",
        ["Which could make you fumble?", ["Catching a slippery ball with wet hands", "Reading a quiet book", "Eating a warm roti"], 0, "Yes! Wet, slippery things are easy to fumble."],
        [["Ria fumbled the glass and it slid out of her hands.", "Ria never fumbled the glass; she dropped it clumsily four times.", "Nervous hands can fumble the simplest things."], 1, "Ha! If she dropped it clumsily four times, she did fumble it."],
        ["Don’t", "I might", "He tends to"], ["the ball when it’s raining.", "the keys in the dark.", "the glass when it’s slippery."]),
      w("spectacular", "spek-TAK-yuh-lur", "Push the TAK: spek-TAK-yuh-lur.", "amazing to see, really impressive", "🎆",
        "Then Meera hit a spectacular six that sailed over the water tank!",
        "The fireworks were ___, lighting up the whole sky.",
        ["Which could be described as spectacular?", ["A huge rainbow across the sky", "A plain white sheet of paper", "A tiny pebble on the road"], 0, "Yes! Spectacular things make you say “wow!”"],
        [["The spectacular sunset painted the whole sky orange and pink.", "The spectacular show was so boring and ordinary that we yawned.", "We watched a spectacular fireworks display."], 1, "Ha! A boring, ordinary show can’t be spectacular."],
        ["The", "Our team’s", "Last night’s"], ["goal made everyone scream.", "sunset lit up the whole sky.", "fireworks were the best we’d seen."]),
      w("rival", "RYE-vul", "Starts like “rye bread”: RYE-vul.", "a person or team you compete against", "🏆",
        "At the end, Dev shook hands with his biggest rival, the team from the next building.",
        "In the final we played our biggest ___, the team from the next building.",
        ["In a chess match, your rival is…", ["the player you are competing against", "your best friend cheering for you", "the person who made the board"], 0, "Yes! A rival is someone you compete against."],
        [["The two rival teams both wanted to win the cup.", "Her rival was her teammate, so they happily passed the ball and won together.", "He shook hands with his old rival after the match."], 1, "Right! Rivals compete against each other, teammates play together."],
        ["The", "Our", "His"], ["team had a very strong bowler.", "captain smiled and shook hands.", "school wanted the trophy badly."])
    ]
  },
  {
    id: 3, kind: "words", title: "A Monsoon Day", emoji: "☔", theme: "Word Quest",
    intro: "The monsoon has arrived! Follow Anaya’s rainy day and collect four new words.",
    badge: { icon: "☔", name: "Rain Ranger" },
    warm: [["cold", "chilly"], ["wet", "damp"], ["dark", "dim"], ["fast", "speedy"]],
    say: [2, 3],
    words: [
      w("gloomy", "GLOO-mee", "Rhymes with “roomy”: GLOO-mee.", "dark, dull and a little sad", "☁️",
        "The sky turned gloomy, with thick grey clouds hiding the sun.",
        "The sky was dark and grey, and everyone felt a bit sad. It was a ___ morning.",
        ["A gloomy day is usually…", ["dark and grey", "bright and sunny", "hot and dusty"], 0, "Yes! Gloomy means dark, dull and a little sad."],
        [["The gloomy room felt dark and sad.", "The sunny beach was bright and warm, so everyone called it gloomy.", "A gloomy sky hung over the hills."], 1, "Ha! A bright, sunny beach is the opposite of gloomy."],
        ["The", "That", "A"], ["sky made us want to stay in bed.", "evening felt long and quiet.", "corner of the room needed a lamp."]),
      w("sprint", "SPRINT", "Say both the s and the p: SPRINT.", "to run as fast as you can for a short distance", "🏃‍♀️",
        "When the first drops fell, Anaya had to sprint to the bus stop.",
        "I had to ___ to catch the school bus.",
        ["When would you sprint?", ["When the bus is about to leave", "When you are reading in bed", "When you are eating soup"], 0, "Yes! You sprint when you need to run fast."],
        [["She had to sprint, so she walked very slowly and took a nap.", "He had to sprint to catch the train.", "The athlete will sprint at the start of the race."], 0, "Ha! You can’t sprint by walking slowly and napping."],
        ["I have to", "Anaya can", "We always"], ["to the gate before it closes.", "across the road in the rain.", "home when it starts to thunder."]),
      w("drenched", "DRENCHT", "It ends with a “t” sound: DRENCHT.", "completely soaked with water", "🌧️",
        "But she was still drenched by the time she got home.",
        "After the downpour, we were ___ from head to toe.",
        ["Which would make you drenched?", ["Standing in heavy rain with no umbrella", "Washing one finger", "Smelling a flower"], 0, "Yes! Drenched means completely soaked."],
        [["She was drenched, with water dripping from her hair and clothes.", "He stood in bright sunshine, perfectly dry, and said, “I’m drenched!”", "The drenched puppy shook water everywhere."], 1, "Ha! You can’t be drenched if you’re perfectly dry."],
        ["The", "My", "Our"], ["puppy shook water all over the floor.", "cousin hung his shirt to dry.", "class ran inside, laughing."]),
      w("cozy", "KOH-zee", "It starts with a K sound: KOH-zee.", "warm, soft and comfortable", "🛋️",
        "At home, Anaya curled up in a cozy blanket with hot chai.",
        "We curled up in the ___ corner, warm under soft blankets.",
        ["Which feels cozy?", ["A warm blanket on a rainy day", "An icy cold floor", "A noisy crowded bus"], 0, "Yes! Cozy things feel warm, soft and comfortable."],
        [["A cozy blanket kept me warm.", "The cozy room was freezing, hard and uncomfortable.", "We read in a cozy corner of the library."], 1, "Ha! A freezing, hard room is not cozy."],
        ["The", "Our", "My"], ["room smelled of chai and rain.", "blanket was soft and warm.", "bed felt perfect after the storm."])
    ]
  },
  {
    id: 4, kind: "grammar", title: "Its or It’s?", emoji: "🦜", theme: "Grammar Quest",
    intro: "Two tiny words cause big mix-ups: its and it’s. Let’s crack the case together!",
    badge: { icon: "🕵️", name: "Its Detective" },
    tip: "Try saying “it is” in the gap. If it works, use it’s.",
    warm: [["small", "little"], ["happy", "cheerful"], ["big", "large"], ["tidy", "neat"]],
    rules: [
      { t: "its = belongs to it", ex: "The parrot cleaned its feathers.", emoji: "🦜" },
      { t: "it’s = it is (or it has)", ex: "It’s a sunny day today.", emoji: "☀️" },
      { t: "Quick test: say “it is”", ex: "If “it is” fits, write it’s. If not, write its.", emoji: "🧪" }
    ],
    gaps: [
      { s: "The parrot cleaned ___ feathers.", opts: ["its", "it’s"], ans: 0, why: "“It is feathers” makes no sense, so we use its: the feathers belong to the parrot." },
      { s: "___ a lovely sunny day.", opts: ["Its", "It’s"], ans: 1, why: "“It is a lovely sunny day” works, so we use it’s." },
      { s: "The cat licked ___ paw.", opts: ["its", "it’s"], ans: 0, why: "The paw belongs to the cat, so we use its." },
      { s: "I think ___ going to rain.", opts: ["its", "it’s"], ans: 1, why: "“I think it is going to rain” works, so we use it’s." }
    ],
    spot: [
      { q: "Which sentence is correct?", opts: ["The dog wagged it’s tail.", "The dog wagged its tail.", "The dog wagged its’ tail."], ans: 1, why: "The tail belongs to the dog, so we write its, with no apostrophe." },
      { q: "Which sentence is correct?", opts: ["Its time to go home.", "Its’ time to go home.", "It’s time to go home."], ans: 2, why: "“It is time to go home” works, so we write it’s." }
    ],
    build: ["The elephant lifted its trunk.", "It’s a perfect day for cricket."],
    say: ["The parrot cleaned its feathers.", "It’s time to read a story."]
  },
  {
    id: 5, kind: "words", title: "The Science Fair", emoji: "🔬", theme: "Word Quest",
    intro: "Kabir is building a volcano for the science fair. Which words will he need?",
    badge: { icon: "🔬", name: "Science Star" },
    warm: [["look", "watch"], ["idea", "thought"], ["problem", "puzzle"], ["try", "attempt"]],
    say: [1, 2],
    words: [
      w("curious", "KYUR-ee-us", "Say it in three parts: KYUR-ee-us.", "wanting to know or learn about things", "🧐",
        "Kabir was curious about how a volcano model would work.",
        "A ___ child asks lots of questions about everything.",
        ["Which question shows someone is curious?", ["Why does the moon change shape?", "What time is it?", "Where did I put my pencil?"], 0, "Yes! Curious people love asking “why” and “how”."],
        [["The curious cat wanted to know what was inside the box.", "She was curious about the answer, so she covered her ears and never asked.", "I am curious about how rockets fly."], 1, "Ha! Curious people ask. They don’t cover their ears."],
        ["The", "My", "Our"], ["cat peeked inside the box.", "sister asked a hundred questions.", "class had so many questions about space."]),
      w("observe", "ub-ZURV", "Push the end: ub-ZURV.", "to watch something carefully and notice details", "🔍",
        "The students had to observe the baking soda each minute and write down every change.",
        "Scientists ___ closely before they make notes.",
        ["To observe a plant, you should…", ["watch it carefully and notice changes", "throw it away", "ignore it for a month"], 0, "Yes! To observe is to watch carefully."],
        [["She closed her eyes tightly to observe the butterfly’s colourful wings.", "He used a magnifying glass to observe the ant.", "We observe the weather every morning."], 0, "Ha! You can’t observe with your eyes tightly closed."],
        ["We will", "I like to", "Please"], ["the ants carefully.", "how the plant grows.", "the clouds for ten minutes."]),
      w("ingenious", "in-JEEN-yus", "Say JEEN like “jean”: in-JEEN-yus.", "very clever and full of new ideas", "💡",
        "Her ingenious machine could water the plants all by itself.",
        "What an ___ idea! You turned a bottle into a lamp.",
        ["An ingenious person is…", ["very clever at solving problems", "very slow at everything", "always late"], 0, "Yes! Ingenious means clever and inventive."],
        [["His ingenious invention solved the problem in a clever new way.", "The plan was ingenious because it was the dullest, most boring idea ever.", "She made an ingenious toy out of old boxes."], 1, "Ha! A dull, boring idea can’t be ingenious."],
        ["Her", "The", "What an"], ["idea saved the whole project.", "machine watered the plants by itself.", "invention made the judges smile."]),
      w("persist", "per-SIST", "Push the end: per-SIST.", "to keep trying even when it is hard", "💪",
        "The first volcano failed, but Kabir chose to persist and try again.",
        "Even when the experiment keeps failing, you must ___ and not give up.",
        ["If you persist at a hard puzzle, you…", ["keep trying until you solve it", "give up at once", "throw the puzzle away"], 0, "Yes! To persist is to keep going."],
        [["He wanted to persist, so he quit after one try and never tried again.", "Great artists persist even when it is hard.", "Persist, and you will get better."], 0, "Ha! Quitting after one try is the opposite of persisting."],
        ["If you", "Kabir will", "We must"], ["when things get difficult.", "until the experiment works.", "even after three failed tries."])
    ]
  },
  {
    id: 6, kind: "words", title: "Grandma’s Kitchen", emoji: "🍲", theme: "Word Quest",
    intro: "Something smells wonderful in Grandma’s kitchen! Let’s taste four new words.",
    badge: { icon: "🍲", name: "Kitchen Chef" },
    warm: [["tasty", "delicious"], ["smell", "scent"], ["warm", "hot"], ["give", "donate"]],
    say: [0, 3],
    words: [
      w("aroma", "uh-ROH-muh", "Push the middle: uh-ROH-muh.", "a strong, pleasant smell", "👃",
        "The aroma of cardamom chai floated out of the kitchen.",
        "The ___ of fresh bread made my tummy rumble.",
        ["Which has a lovely aroma?", ["Freshly baked cookies", "A dusty old sock", "A pile of rubbish"], 0, "Yes! An aroma is a pleasant smell."],
        [["The aroma of fresh jalebis made everyone hungry.", "The aroma of rotten eggs was so lovely that we all held our noses.", "We loved the aroma of roasted peanuts."], 1, "Ha! An aroma is a nice smell, so nobody would hold their nose."],
        ["The", "That", "Her kitchen’s"], ["of fresh rotis filled the house.", "of cardamom made me smile.", "of frying onions drifted outside."]),
      w("simmer", "SIM-ur", "Rhymes with “swimmer”: SIM-ur.", "to cook gently, just below boiling", "🥘",
        "Grandma let the dal simmer on a low flame for an hour.",
        "Let the soup ___ slowly on a small flame.",
        ["When you simmer soup, you…", ["cook it gently on low heat", "freeze it solid", "throw it in the bin"], 0, "Yes! Simmering is slow, gentle cooking."],
        [["Let the curry simmer gently for twenty minutes.", "To simmer the milk, put it in the freezer for an hour.", "Grandma lets the dal simmer on low heat."], 1, "Ha! Simmering needs heat, not a freezer."],
        ["Let the dal", "I like to let the soup", "Please let the curry"], ["on a low flame.", "while we set the table.", "until it smells wonderful."]),
      w("savour", "SAY-vur", "Rhymes with “flavour”: SAY-vur.", "to enjoy something slowly and fully", "😋",
        "Ananya took small bites to savour every spoonful of the kheer.",
        "Don’t rush your dessert. Try to ___ every bite.",
        ["To savour a mango, you…", ["eat it slowly and enjoy it", "gulp it down in one second", "refuse to taste it"], 0, "Yes! To savour is to enjoy slowly."],
        [["She gulped it down in one second to savour the taste for a long time.", "I like to savour my ice cream slowly.", "We savour the last few bites of the sweet."], 0, "Ha! You can’t savour something you gulp down in a second."],
        ["I like to", "Let’s", "We should"], ["every bite of the kheer.", "the last piece of cake.", "the taste of fresh mangoes."]),
      w("generous", "JEN-ur-us", "Three parts: JEN-ur-us.", "happy to give or share more than is needed", "🎁",
        "Grandma was generous and always packed extra laddoos for everyone.",
        "Our ___ neighbour shared her mangoes with the whole street.",
        ["A generous person…", ["happily shares what they have", "keeps everything for themselves", "never smiles"], 0, "Yes! Generous people love to share."],
        [["The generous boy refused to share even one biscuit and hid them all.", "The generous girl gave her friend half her lunch.", "He is generous with his time and helps everyone."], 0, "Ha! Refusing to share is the opposite of generous."],
        ["My", "The", "Our"], ["neighbour shared her mangoes.", "teacher gave us extra time.", "uncle bought sweets for everyone."])
    ]
  },
  {
    id: 7, kind: "words", title: "Train to Nani’s Village", emoji: "🚂", theme: "Word Quest",
    intro: "All aboard! Isha is taking the train to her Nani’s village. Four new words are waiting at the window.",
    badge: { icon: "🚂", name: "Train Traveller" },
    warm: [["huge", "giant"], ["sleepy", "tired"], ["view", "sight"], ["leave", "depart"]],
    say: [0, 1],
    words: [
      w("scenery", "SEE-nuh-ree", "Three parts: SEE-nuh-ree.", "the natural views you see, like hills and fields", "🏞️",
        "Through the window, the scenery changed from city to green fields.",
        "The mountain ___ was so beautiful that we stopped to take photos.",
        ["Scenery means…", ["the views of nature around you", "a type of train ticket", "a loud noise"], 0, "Yes! Scenery is the view of hills, fields, rivers and so on."],
        [["The scenery of green hills and rivers made us gasp.", "The scenery was a bag of stale bread.", "We enjoyed the scenery from the window."], 1, "Ha! Scenery is a view, not a bag of bread."],
        ["The", "Kerala’s", "The village"], ["was green as far as we could see.", "took my breath away.", "changed with every mile."]),
      w("drowsy", "DROW-zee", "“drow” rhymes with “cow”: DROW-zee.", "sleepy and slow", "😴",
        "The rocking of the train made Isha drowsy, and her eyes began to close.",
        "The warm afternoon made everyone feel ___.",
        ["When might you feel drowsy?", ["After a long day, near bedtime", "In the middle of a fast race", "During an exciting cricket final"], 0, "Yes! Drowsy means sleepy."],
        [["He felt drowsy, so he yawned and rubbed his eyes.", "The drowsy boy was wide awake, jumping and shouting with energy.", "A warm blanket can make you drowsy."], 1, "Ha! Someone wide awake and full of energy isn’t drowsy."],
        ["The", "My", "Our"], ["puppy yawned and curled up.", "brother nodded off on the seat.", "class felt sleepy after lunch."]),
      w("vast", "VAST", "Rhymes with “fast”: VAST.", "extremely large and wide", "🌾",
        "Outside, vast fields of golden wheat stretched to the horizon.",
        "The desert was a ___ stretch of sand as far as we could see.",
        ["Which is vast?", ["The ocean", "A coin", "A matchbox"], 0, "Yes! Vast means huge and wide."],
        [["The vast ocean stretched beyond the horizon.", "The vast ant fitted easily on the tip of a pin.", "The sky above the plains felt vast."], 1, "Ha! An ant that fits on a pin is tiny, not vast."],
        ["The", "A", "That"], ["field stretched to the horizon.", "sky was full of stars.", "ocean looked endless from the ship."]),
      w("farewell", "fair-WELL", "Push the end: fair-WELL.", "saying goodbye", "👋",
        "On the last day, Isha waved a sad farewell to Nani.",
        "We hugged and said a tearful ___ at the station.",
        ["A farewell is…", ["saying goodbye", "a kind of fruit", "a loud song"], 0, "Yes! A farewell is a goodbye."],
        [["We said a sad farewell and waved until the train was gone.", "He shouted “farewell!” when he arrived and met his friends for the first time.", "The farewell party was for our teacher who was leaving."], 1, "Ha! You say farewell when leaving, not when arriving."],
        ["It was a sad", "Isha gave a", "We shared a"], ["to everyone at the station.", "that made us all cry.", "that we will never forget."])
    ]
  },
  {
    id: 8, kind: "grammar", title: "Their, There, They’re", emoji: "🧭", theme: "Grammar Quest",
    intro: "Three words that sound exactly the same but mean different things. Let’s tell them apart!",
    badge: { icon: "🧭", name: "There Tracker" },
    tip: "Can you say “they are”? Use they’re. Is it a place? Use there. Does it belong to them? Use their.",
    warm: [["quiet", "silent"], ["near", "close"], ["finish", "complete"], ["glad", "pleased"]],
    rules: [
      { t: "their = belongs to them", ex: "The children packed their bags.", emoji: "🎒" },
      { t: "there = a place", ex: "Your book is over there.", emoji: "📍" },
      { t: "they’re = they are", ex: "They’re waiting at the gate.", emoji: "🚪" }
    ],
    gaps: [
      { s: "___ going to the museum today.", opts: ["Their", "There", "They’re"], ans: 2, why: "“They are going to the museum” works, so we use They’re." },
      { s: "Please put the books over ___.", opts: ["their", "there", "they’re"], ans: 1, why: "It tells us the place, so we use there." },
      { s: "The students packed ___ bags.", opts: ["their", "there", "they’re"], ans: 0, why: "The bags belong to the students, so we use their." },
      { s: "I think ___ happy with the result.", opts: ["their", "there", "they’re"], ans: 2, why: "“They are happy” works, so we use they’re." }
    ],
    spot: [
      { q: "Which sentence is correct?", opts: ["Their going to be late.", "They’re going to be late.", "There going to be late."], ans: 1, why: "“They are going to be late” works, so we use They’re." },
      { q: "Which sentence is correct?", opts: ["The team lost there match.", "The team lost they’re match.", "The team lost their match."], ans: 2, why: "The match belongs to the team, so we use their." }
    ],
    build: ["They’re putting their bags over there.", "Their dog is sitting over there."],
    say: ["They’re putting their bags over there.", "Their dog is sitting over there."]
  },
  {
    id: 9, kind: "words", title: "Diwali Night", emoji: "🪔", theme: "Word Quest",
    intro: "The lamps are lit and the street is glowing. Four new words are sparkling in the Diwali night!",
    badge: { icon: "🪔", name: "Festival Star" },
    warm: [["bright", "shiny"], ["festival", "celebration"], ["custom", "habit"], ["expect", "await"]],
    say: [3, 1],
    words: [
      w("tradition", "truh-DISH-un", "Push the DISH: truh-DISH-un.", "a custom passed down in a family or community", "📿",
        "It is a family tradition to light the first diya together.",
        "Making rangoli is a ___ in our family.",
        ["A family tradition is…", ["something your family does year after year", "something you do once by accident", "a type of weather"], 0, "Yes! Traditions are passed down and repeated."],
        [["Our tradition is to eat sweets together every Diwali.", "It’s our tradition, so we have never, ever done it before and will never do it again.", "Visiting grandparents is a happy tradition for us."], 1, "Ha! A tradition is something you do again and again."],
        ["It is a", "This is a", "That is a"], ["we have followed for years.", "that we love.", "that began with my great-grandmother."]),
      w("dazzling", "DAZ-ling", "Like “sizzling” but with D: DAZ-ling.", "so bright or beautiful that it amazes you", "🎇",
        "Rows of diyas made the whole street look dazzling.",
        "The ___ lights of the festival lit up every house.",
        ["Which is dazzling?", ["A sky full of sparkling fireworks", "A dull grey wall", "A plain brown box"], 0, "Yes! Dazzling things shine and amaze you."],
        [["The dazzling lights sparkled and amazed us.", "The dazzling room was so dull and dark that nobody noticed it.", "Her dazzling smile lit up the stage."], 1, "Ha! A dull, dark room can’t be dazzling."],
        ["The", "Our", "Her"], ["rangoli won first prize.", "street looked like a river of lights.", "dress sparkled in the lamplight."]),
      w("grateful", "GRAYT-ful", "“grate” like a cheese grater: GRAYT-ful.", "thankful for something kind or good", "🙏",
        "Meher was grateful for the sweets her neighbours sent over.",
        "I am so ___ to you for helping me.",
        ["If you are grateful, you feel…", ["thankful", "angry", "bored"], 0, "Yes! Grateful means thankful."],
        [["He was grateful for the gift, so he said thank you with a smile.", "She was grateful, so she shouted at her friend and called her unkind names.", "We are grateful for our teachers."], 1, "Ha! Grateful people say thank you, not unkind things."],
        ["I am", "We are", "She was"], ["for all your help.", "for the lovely gift.", "for this wonderful night."]),
      w("anticipate", "an-TIS-uh-pate", "Push the TIS: an-TIS-uh-pate.", "to look forward to something that is going to happen", "⏳",
        "All week, the children anticipate the first firecracker of Diwali night.",
        "We ___ a big crowd at the fair, so we will leave early.",
        ["If you anticipate rain, you…", ["expect it and carry an umbrella", "are surprised when it comes", "forget what rain is"], 0, "Yes! To anticipate is to expect or look forward to something."],
        [["We anticipate a fun day tomorrow, so we are packing our bags.", "She anticipated the party that finished two days ago.", "I anticipate the sweets we will eat tonight."], 1, "Ha! You anticipate things that haven’t happened yet."],
        ["We", "The children", "I"], ["a big crowd at the fair.", "the fireworks all week.", "a very sweet surprise."])
    ]
  },
  {
    id: 10, kind: "words", title: "The School Play", emoji: "🎭", theme: "Word Quest",
    intro: "The school play is tonight! Zoya has four new words to learn before the curtain goes up.",
    badge: { icon: "🎭", name: "Stage Star" },
    warm: [["scared", "afraid"], ["clap", "cheer"], ["practise", "train"], ["sure", "certain"]],
    say: [0, 3],
    words: [
      w("rehearse", "ri-HURS", "The e at the end is silent: ri-HURS.", "to practise something many times before doing it for real", "🎬",
        "The class had to rehearse the play every afternoon for two weeks.",
        "We need to ___ our dance again before the show.",
        ["Why do actors rehearse?", ["To practise before the real show", "To forget their lines", "To avoid the stage"], 0, "Yes! Rehearsing is practising before the real thing."],
        [["We rehearse every day so we know our lines.", "We rehearse the play after it is over, to practise before the show.", "The band will rehearse before the concert."], 1, "Ha! You rehearse before the show, not after it is over."],
        ["We must", "Let’s", "They will"], ["our lines again tonight.", "the dance one more time.", "the song before the big day."]),
      w("nervous", "NUR-vus", "Two parts: NUR-vus.", "a little scared or worried about something", "😬",
        "Backstage, Zoya felt nervous, and her hands were cold.",
        "Aryan’s hands were shaking and his heart was racing. He felt ___ before his first speech.",
        ["When might you feel nervous?", ["Before going on a big stage", "When eating a favourite snack", "When sleeping peacefully"], 0, "Yes! Nervous means worried about something coming up."],
        [["She felt nervous, so her hands shook and her heart raced.", "He felt so nervous that he did a calm, relaxed dance, humming happily with no worry at all.", "Exams can make some people nervous."], 1, "Ha! Someone calm and relaxed isn’t nervous."],
        ["I felt", "Zoya was", "We were all"], ["before the curtain went up.", "on the first day of rehearsal.", "when the lights went off."]),
      w("confident", "KON-fi-dunt", "Push the start: KON-fi-dunt.", "sure that you can do something well", "😎",
        "On stage, Zoya stood tall and spoke in a confident voice.",
        "Practice made her feel ___ about the big speech: she knew she would do well.",
        ["A confident speaker…", ["believes they can do it well", "is afraid to say anything", "forgets everything"], 0, "Yes! Confident means sure of yourself."],
        [["Because she was confident, she was sure she would do well.", "He felt confident that he would fail, because he had no belief in himself at all.", "A confident player walks onto the field smiling."], 1, "Ha! Feeling sure you’ll fail is not being confident."],
        ["She was", "I feel", "We are"], ["about the school play.", "that we will do well.", "because we rehearsed a lot."]),
      w("applause", "uh-PLAWZ", "It ends with a z sound: uh-PLAWZ.", "clapping to show you enjoyed something", "👏",
        "When the curtain fell, the hall burst into loud applause.",
        "The crowd gave a big round of ___ after the song.",
        ["Applause is…", ["clapping to show you liked something", "a kind of costume", "a quiet whisper"], 0, "Yes! Applause is clapping to show you enjoyed it."],
        [["The audience burst into applause and clapped for a full minute.", "The audience sat silently in applause and nobody clapped or moved.", "Loud applause followed her speech."], 1, "Ha! Applause means clapping, so sitting silently can’t be applause."],
        ["The", "Our", "Loud"], ["from the audience made us smile.", "filled the hall after the last scene.", "lasted for a whole minute."])
    ]
  },
  {
    id: 11, kind: "grammar", title: "Than or Then?", emoji: "⚖️", theme: "Grammar Quest",
    intro: "Than and then look almost the same, but they do very different jobs. Let’s sort them out!",
    badge: { icon: "⚖️", name: "Than Tamer" },
    tip: "Comparing two things? Use than. Saying what happens next? Use then.",
    warm: [["start", "begin"], ["sad", "unhappy"], ["fix", "repair"], ["calm", "peaceful"]],
    rules: [
      { t: "than = compares two things", ex: "My sister is taller than me.", emoji: "📏" },
      { t: "then = what happens next", ex: "First we ate lunch, then we played cricket.", emoji: "⏭️" }
    ],
    gaps: [
      { s: "My sister is taller ___ me.", opts: ["than", "then"], ans: 0, why: "We are comparing two people, so we use than." },
      { s: "First we ate lunch, ___ we played cricket.", opts: ["than", "then"], ans: 1, why: "It tells us what happened next, so we use then." },
      { s: "Nothing is better ___ hot jalebis!", opts: ["than", "then"], ans: 0, why: "We are comparing, so we use than." },
      { s: "I finished my homework and ___ went to sleep.", opts: ["than", "then"], ans: 1, why: "It tells us what happened next, so we use then." }
    ],
    spot: [
      { q: "Which sentence is correct?", opts: ["She runs faster then me.", "She runs faster than me."], ans: 1, why: "We are comparing two runners, so we use than." },
      { q: "Which sentence is correct?", opts: ["Wash your hands, than eat.", "Wash your hands, then eat."], ans: 1, why: "It tells us what to do next, so we use then." }
    ],
    build: ["Nothing is better than a mango on a hot day.", "First we stretched, then we ran."],
    say: ["She runs faster than me.", "First we ate, then we played."]
  }
];
