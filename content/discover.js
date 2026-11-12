"use strict";
/*
  Discovery lessons: short History, Geography and Did-you-know readings woven into the Love English quests.
  Each one is matched to its quest, reuses that quest's words where it reads naturally, and ends with two comprehension questions.
  Everything is bundled here: no internet and no live data. Facts are well-established ones only.
  cat: "history" | "geography" | "didyouknow"
*/
const D = {
  1: {
    cat: "history", title: "The Spice Route", emoji: "🌶️", place: "Kozhikode (Calicut), Kerala",
    text: [
      "Long ago, ships sailed across oceans just to buy India’s spices.",
      "Pepper, cardamom and cinnamon were so valuable that the ports of the Kerala coast were bustling with traders.",
      "In 1498, a Portuguese sailor named Vasco da Gama reached Calicut, now called Kozhikode, after a very long voyage.",
      "He had found a sea route from Europe to India, and trade around the world changed for ever."
    ],
    fact: "Black pepper was once so precious that people called it “black gold”.",
    quiz: [
      { q: "Where did Vasco da Gama land in India in 1498?", opts: ["Calicut (Kozhikode)", "Delhi", "Mumbai"], ans: 0, why: "Yes! He reached Calicut on the coast of Kerala." },
      { q: "Why did ships travel so far to reach India?", opts: ["To watch cricket matches", "To buy valuable spices", "To catch fish"], ans: 1, why: "Right! Spices like pepper and cardamom were worth a fortune." }
    ]
  },
  2: {
    cat: "didyouknow", title: "A Very Long Pitch", emoji: "🏏", place: "Lord’s, London and Wankhede, Mumbai",
    text: [
      "A cricket pitch is exactly 22 yards long. That is about 20 metres.",
      "Cricket began in England hundreds of years ago, but India fell in love with it.",
      "In 1983, India won the World Cup at Lord’s in London. It was a spectacular surprise, and millions of children wanted to play.",
      "In 2011, India won again, and the final was played right here in Mumbai."
    ],
    fact: "The very first Cricket World Cup was played in 1975.",
    quiz: [
      { q: "How long is a cricket pitch?", opts: ["22 yards", "100 yards", "10 yards"], ans: 0, why: "Yes! 22 yards, which is about 20 metres." },
      { q: "In which year did India first win the Cricket World Cup?", opts: ["1975", "1983", "2011"], ans: 1, why: "Right! India’s first win was in 1983, at Lord’s." }
    ]
  },
  3: {
    cat: "geography", title: "Why Does It Rain So Much?", emoji: "🌧️", place: "Western Ghats and Meghalaya, India",
    text: [
      "In summer, the hot land pulls in wet winds from the Indian Ocean. These winds are called the monsoon.",
      "The word “monsoon” comes from an Arabic word that means “season”.",
      "When the clouds reach the Western Ghats, the mountains push them upwards, and the rain pours down until everyone is drenched.",
      "Mawsynram, a village in Meghalaya, is one of the wettest places on Earth."
    ],
    fact: "Farmers wait for the monsoon every year because their crops need its water.",
    quiz: [
      { q: "What does the word “monsoon” mean?", opts: ["Umbrella", "Mountain", "Season"], ans: 2, why: "Yes! It comes from an Arabic word meaning “season”." },
      { q: "Which village is one of the wettest places on Earth?", opts: ["Jaipur", "Mawsynram", "Mumbai"], ans: 1, why: "Right! Mawsynram in Meghalaya gets enormous amounts of rain." }
    ]
  },
  4: {
    cat: "didyouknow", title: "The Talking Parrot", emoji: "🦜", place: "India and all over the world",
    text: [
      "Parrots can learn to copy human words, and some learn dozens of them.",
      "The Indian ringneck parrot, with its green feathers and red beak, is famous for copying voices.",
      "Many parrots copy sounds without knowing what they mean. It’s a clever trick!",
      "A parrot uses its strong curved beak to crack nuts and even to climb trees."
    ],
    fact: "Some big parrots can live for more than 50 years.",
    quiz: [
      { q: "What can parrots copy?", opts: ["Cricket scores", "Human words and sounds", "Train timetables"], ans: 1, why: "Yes! Many parrots copy the sounds they hear." },
      { q: "What does a parrot use its beak for?", opts: ["Cracking nuts and climbing", "Reading books", "Swimming"], ans: 0, why: "Right! Its strong beak helps it crack nuts and climb." }
    ]
  },
  5: {
    cat: "history", title: "The First Star-Gazer", emoji: "🔭", place: "Ancient India",
    text: [
      "More than 1,500 years ago, an Indian scholar named Aryabhata studied the night sky.",
      "He wrote that the Earth spins on its axis, which is why we have day and night.",
      "He was ingenious with numbers too, and wrote clever rules for maths.",
      "In 1975, India named its very first satellite “Aryabhata” to honour him."
    ],
    fact: "Ancient Indian mathematicians were among the first to use zero as a real number.",
    quiz: [
      { q: "What did Aryabhata say spins on its axis?", opts: ["The Sun", "The Earth", "The Moon"], ans: 1, why: "Yes! He said the Earth spins, which gives us day and night." },
      { q: "What was India’s first satellite called?", opts: ["Aryabhata", "Chandrayaan", "Bhaskara"], ans: 0, why: "Right! It was named in honour of Aryabhata." }
    ]
  },
  6: {
    cat: "geography", title: "Foods With Long Journeys", emoji: "🍅", place: "The Americas to India",
    text: [
      "Many foods we think of as very Indian actually came from far away.",
      "Chillies, potatoes and tomatoes all began in the Americas.",
      "Traders and sailors carried them across the oceans about 500 years ago.",
      "Today it is hard to imagine an Indian kitchen without them. Just think of the aroma of a tomato curry left to simmer."
    ],
    fact: "Mangoes, on the other hand, began right here in South Asia.",
    quiz: [
      { q: "Where did chillies and tomatoes begin?", opts: ["Australia", "Africa", "The Americas"], ans: 2, why: "Yes! They started in the Americas and travelled by ship." },
      { q: "Which of these began in South Asia?", opts: ["Mango", "Potato", "Tomato"], ans: 0, why: "Right! Mangoes grew here first." }
    ]
  },
  7: {
    cat: "history", title: "The First Train in India", emoji: "🚂", place: "Bombay to Thane, 1853",
    text: [
      "On 16 April 1853, India’s first passenger train left Bombay for Thane.",
      "It travelled about 34 kilometres, and a big crowd came to watch this amazing new invention.",
      "The journey took about 57 minutes, with fields and scenery rolling past the windows.",
      "Today the Indian Railways network is vast. It is one of the biggest in the world, and it connects villages to faraway cities."
    ],
    fact: "That very first journey was only 34 kilometres long.",
    quiz: [
      { q: "In which year did India’s first passenger train run?", opts: ["1990", "1947", "1853"], ans: 2, why: "Yes! It was on 16 April 1853." },
      { q: "Between which two places did it run?", opts: ["Bombay and Thane", "Delhi and Agra", "Madras and Pune"], ans: 0, why: "Right! From Bombay to Thane." }
    ]
  },
  8: {
    cat: "geography", title: "The Mighty Ganga", emoji: "🏞️", place: "Gangotri to the Bay of Bengal",
    text: [
      "The Ganga begins as tiny streams of melted ice high in the Himalayas, near a place called Gangotri.",
      "It flows for about 2,500 kilometres across northern India. Many towns stand there on its banks.",
      "Millions of people live near it, and their farms need its water. They’re grateful for it every day.",
      "At last the river reaches the Bay of Bengal, and joins the sea."
    ],
    fact: "The Himalayas, where the Ganga is born, are the highest mountains in the world.",
    quiz: [
      { q: "Where does the Ganga begin?", opts: ["In the desert", "In the Himalayas", "In the sea"], ans: 1, why: "Yes! It starts from melting ice high in the Himalayas." },
      { q: "Where does the Ganga end?", opts: ["Arabian Sea", "Thar Desert", "Bay of Bengal"], ans: 2, why: "Right! It joins the sea at the Bay of Bengal." }
    ]
  },
  9: {
    cat: "geography", title: "Diwali Around the World", emoji: "🌏", place: "India, Nepal, Singapore, Fiji and more",
    text: [
      "Diwali is celebrated in India, but also in many other countries.",
      "In Nepal the festival is called Tihar. In Sri Lanka, Singapore, Malaysia, Fiji and Mauritius, many families light lamps too.",
      "Wherever it is celebrated, the dazzling lights stand for good winning over darkness.",
      "Families have kept this tradition alive for hundreds of years, and they teach it to their children."
    ],
    fact: "“Deepavali”, the full name, comes from Sanskrit and means “a row of lights”.",
    quiz: [
      { q: "What does “Deepavali” mean?", opts: ["A long journey", "A big feast", "A row of lights"], ans: 2, why: "Yes! It means a row of lights, or lamps." },
      { q: "In which country, besides India, is Diwali a public holiday?", opts: ["Singapore", "Iceland", "Brazil"], ans: 0, why: "Right! Singapore is one of several countries that celebrate it." }
    ]
  },
  10: {
    cat: "history", title: "The Oldest Book About Theatre", emoji: "🎭", place: "Ancient India",
    text: [
      "India has loved stories on stage for more than two thousand years.",
      "An ancient book called the Natya Shastra explains how to act, dance and make music for a play.",
      "A great writer named Kalidasa wrote a famous play called Shakuntala, and people still perform it today.",
      "Actors back then, just like actors now, had to rehearse a lot. A kind audience’s applause was their reward."
    ],
    fact: "In Sanskrit, the word “natya” means drama or theatre.",
    quiz: [
      { q: "What is the Natya Shastra?", opts: ["A famous cricket team", "An ancient book about acting, dance and music", "A kind of sweet"], ans: 1, why: "Yes! It is an ancient guide to the performing arts." },
      { q: "Who wrote the play Shakuntala?", opts: ["Kalidasa", "Aryabhata", "Tagore"], ans: 0, why: "Right! Kalidasa wrote it long, long ago." }
    ]
  },
  11: {
    cat: "didyouknow", title: "Bigger Than Any Dinosaur", emoji: "🐋", place: "Oceans all over the world",
    text: [
      "The blue whale is the biggest animal that has ever lived on Earth.",
      "It is bigger than any dinosaur we have found, and it can be about 30 metres long.",
      "Its tongue alone can weigh as much as an elephant.",
      "Even though it is huge, it eats tiny shrimp-like animals called krill. Then it eats millions more!"
    ],
    fact: "A baby blue whale can drink over a hundred litres of milk every day.",
    quiz: [
      { q: "How does the blue whale compare with dinosaurs?", opts: ["It is smaller", "It is bigger than any dinosaur found", "It is exactly the same size"], ans: 1, why: "Yes! It is bigger than any dinosaur we have found." },
      { q: "What does a blue whale eat?", opts: ["Tiny krill", "Big sharks", "Coconuts"], ans: 0, why: "Right! It eats enormous amounts of tiny krill." }
    ]
  }
};

module.exports = D;
