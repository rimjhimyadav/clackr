// grouped by topic so it's easy to add more
const PEOPLE = ["friend", "mother", "father", "sister", "brother", "child", "teacher", "doctor", "player", "driver", "family", "people", "person", "group", "team"];
const PLACES = ["house", "school", "city", "road", "river", "garden", "market", "office", "station", "village", "kitchen", "room", "street", "beach", "hill"];
const THINGS = ["water", "paper", "phone", "table", "window", "door", "light", "money", "music", "story", "letter", "picture", "book", "chair", "train", "bottle", "clock", "bridge", "screen", "glass"];
const NATURE = ["tree", "flower", "stone", "cloud", "rain", "storm", "wind", "fire", "snow", "ocean", "forest", "grass", "sky", "moon", "star", "field", "island", "desert"];
const TIME = ["today", "night", "morning", "evening", "minute", "hour", "week", "month", "year", "season", "moment", "later", "early", "soon", "never", "always", "again", "often"];
const ACTIONS = [
  "make", "take", "give", "keep", "find", "think", "know", "write", "read", "learn", "build", "start", "open", "close", "move", "carry", "bring", "follow",
  "change", "laugh", "listen", "speak", "travel", "wonder", "choose", "climb", "cook", "dance", "jump", "quiet", "fix", "mix", "zip", "zoom", "quit", "join",
];
const DESCRIBE = [
  "quick", "slow", "bright", "dark", "small", "large", "happy", "brave", "gentle", "simple", "clever", "honest", "fresh", "warm", "cold", "heavy", "empty",
  "full", "young", "ancient", "lazy", "fuzzy", "jolly", "vivid", "exact", "quaint", "zesty", "wavy", "boxy", "jazzy",
];
const SMALL = ["the", "and", "with", "from", "into", "over", "under", "about", "after", "before", "while", "where", "which", "there", "every", "other", "just", "only", "also", "some"];

export const WORDS = [...PEOPLE, ...PLACES, ...THINGS, ...NATURE, ...TIME, ...ACTIONS, ...DESCRIBE, ...SMALL];
