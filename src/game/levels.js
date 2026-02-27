const level1AssetMap = {
  instagram: "assets/INSTAGRAM.png",
  youtube: "assets/YOUTUBE.png",
  chatgpt: "assets/CHATGPT.png",
  tiktok: "assets/TIKTOK.png"
};

const levels = [
  {
    title: "level 1: 101 ways to not pay attention to my gf",
    counterLabel: "evil apps caught",
    description: "collect all your evil apps before i delete them all muahhahahaha",
    timeLimit: 35,
    itemIcons: ["instagram", "youtube", "chatgpt", "tiktok"],
    start: { x: 1, y: 1 },
    itemSpots: [
      { x: 4, y: 2 },
      { x: 7, y: 1 },
      { x: 10, y: 4 },
      { x: 12, y: 8 }
    ],
    walls: [
      [3, 3], [4, 3], [5, 3], [8, 3], [9, 3], [10, 3],
      [2, 6], [3, 6], [4, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [6, 8], [7, 8], [8, 8]
    ]
  },
  {
    title: "level 2: favorite places to be stinky",
    counterLabel: "stink zones",
    description: "how many places can you be stinky in before its stinkiness overload?",
    timeLimit: 20,
    itemIcons: ["🛌", "🖥️", "🚽", "🎮", "🛏️"],
    start: { x: 1, y: 8 },
    itemSpots: [
      { x: 3, y: 2 },
      { x: 5, y: 5 },
      { x: 9, y: 2 },
      { x: 12, y: 7 },
      { x: 11, y: 1 }
    ],
    walls: [
      [2, 4], [3, 4], [4, 4], [5, 4], [7, 4], [8, 4], [9, 4], [10, 4],
      [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
      [3, 7], [4, 7], [5, 7], [8, 7], [9, 7], [10, 7]
    ]
  },
  {
    title: "level 3: its time for a snack run!",
    counterLabel: "snacks collected",
    description: "collect all your favourite snacks before snack time ends. OR ELSE.",
    timeLimit: 15,
    itemIcons: ["🍞", "🍳", "🧀", "🥪", "🥓", "🌭"],
    start: { x: 1, y: 1 },
    itemSpots: [
      { x: 2, y: 8 },
      { x: 4, y: 1 },
      { x: 6, y: 8 },
      { x: 8, y: 1 },
      { x: 10, y: 8 },
      { x: 12, y: 1 }
    ],
    walls: [
      [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
      [8, 3], [9, 3], [10, 3], [11, 3],
      [2, 6], [3, 6], [4, 6], [5, 6],
      [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [7, 1], [7, 2], [7, 3], [7, 4], [7, 5]
    ]
  }
];

export { levels, level1AssetMap };


