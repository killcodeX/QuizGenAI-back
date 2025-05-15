export const jsQuizData = [
  {
    text: "Which keyword is used to declare a variable with block scope?",
    options: JSON.stringify(["var", "let", "const", "scope"]),
    correctAnswer: "1",
    explanation: "The `let` keyword declares a variable with block scope.",
    orderIndex: 0,
  },
  {
    text: "What will `console.log(2 + '2')` output in JavaScript?",
    options: JSON.stringify(["4", "22", "Error", "undefined"]),
    correctAnswer: "1",
    explanation:
      "JavaScript performs string concatenation when a number is added to a string.",
    orderIndex: 1,
  },
  {
    text: "What is the purpose of the `typeof` operator?",
    options: JSON.stringify([
      "To check if a variable is defined",
      "To determine the data type of a variable",
      "To convert a variable to a specific type",
      "To compare the values of two variables",
    ]),
    correctAnswer: "1",
    explanation:
      "The `typeof` operator returns a string indicating the data type of the operand.",
    orderIndex: 2,
  },
  {
    text: "Which of the following is NOT a primitive data type in JavaScript?",
    options: JSON.stringify(["string", "number", "boolean", "object"]),
    correctAnswer: "3",
    explanation:
      "`object` is a reference data type in JavaScript. The primitive types are string, number, boolean, null, undefined, symbol, and bigint.",
    orderIndex: 3,
  },
  {
    text: "What does the `===` operator do in JavaScript?",
    options: JSON.stringify([
      "Assigns a value to a variable",
      "Compares values for equality (with type coercion)",
      "Compares values for equality (without type coercion)",
      "Checks if a variable is strictly not equal to another",
    ]),
    correctAnswer: "2",
    explanation:
      "The strict equality operator (`===`) compares both the value and the type of the operands.",
    orderIndex: 4,
  },
];

export const dmvQuizData = [
  {
    text: "What is the legal blood alcohol content (BAC) limit for drivers over 21 in Pennsylvania?",
    options: JSON.stringify(["0.05%", "0.08%", "0.10%", "0.02%"]),
    correctAnswer: "1",
    explanation:
      "In Pennsylvania, the legal BAC limit for drivers 21 and over is 0.08%.",
    orderIndex: 0,
  },
  {
    text: "What does a flashing yellow light mean?",
    options: JSON.stringify([
      "Stop and wait for the light to turn green",
      "Proceed with caution",
      "Yield the right-of-way",
      "Speed up to clear the intersection",
    ]),
    correctAnswer: "1",
    explanation: "A flashing yellow light means proceed with caution.",
    orderIndex: 1,
  },
  {
    text: "When must you use your headlights in Pennsylvania?",
    options: JSON.stringify([
      "Only at night",
      "When visibility is poor (less than 500 feet) or during adverse weather",
      "Only when driving on the highway",
      "Between sunset and sunrise only",
    ]),
    correctAnswer: "1",
    explanation:
      "Headlights must be used anytime visibility is poor (less than 500 feet) or during adverse weather conditions, as well as between sunset and sunrise.",
    orderIndex: 2,
  },
  {
    text: "What is the minimum following distance you should maintain under ideal conditions?",
    options: JSON.stringify([
      "One car length",
      "Two-second rule",
      "Three-second rule",
      "Five-second rule",
    ]),
    correctAnswer: "2",
    explanation:
      "Under ideal conditions, the three-second rule is a good way to maintain a safe following distance.",
    orderIndex: 3,
  },
  {
    text: "What should you do if you miss your exit on the highway?",
    options: JSON.stringify([
      "Stop on the shoulder and back up",
      "Make a U-turn in the median",
      "Continue to the next exit",
      "Slow down and try to merge back",
    ]),
    correctAnswer: "2",
    explanation:
      "If you miss your exit, you should continue to the next exit and turn around there.",
    orderIndex: 4,
  },
];

export const marvelQuizData = [
  {
    text: "What is the real name of Iron Man?",
    options: JSON.stringify([
      "Bruce Banner",
      "Peter Parker",
      "Tony Stark",
      "Steve Rogers",
    ]),
    correctAnswer: "2",
    explanation: "The real name of Iron Man is Anthony 'Tony' Stark.",
    orderIndex: 0,
  },
  {
    text: "What is the name of Thor's hammer?",
    options: JSON.stringify(["Stormbreaker", "Vanir", "Mjolnir", "Norn Stone"]),
    correctAnswer: "2",
    explanation: "The name of Thor's enchanted hammer is Mjolnir.",
    orderIndex: 1,
  },
  {
    text: "Who is Peter Parker?",
    options: JSON.stringify([
      "The Hulk",
      "Captain America",
      "Spider-Man",
      "Doctor Strange",
    ]),
    correctAnswer: "2",
    explanation: "Peter Parker is the civilian identity of Spider-Man.",
    orderIndex: 2,
  },
  {
    text: "What is the name of the powerful artifact that Thanos seeks in the Infinity Saga?",
    options: JSON.stringify([
      "The Tesseract",
      "The Eye of Agamotto",
      "The Infinity Gauntlet",
      "The Cosmic Cube",
    ]),
    correctAnswer: "2",
    explanation:
      "Thanos seeks the Infinity Gauntlet, powered by the Infinity Stones.",
    orderIndex: 3,
  },
  {
    text: "What is Captain America's shield made of?",
    options: JSON.stringify(["Adamantium", "Vibranium", "Uru", "Promethium"]),
    correctAnswer: "1",
    explanation: "Captain America's shield is made of Vibranium.",
    orderIndex: 4,
  },
];

export const webDevQuizData = [
  {
    text: "Which of the following is NOT a core technology for web development?",
    options: JSON.stringify(["HTML", "CSS", "JavaScript", "Python"]),
    correctAnswer: "3",
    explanation:
      "HTML, CSS, and JavaScript are the core front-end technologies. Python is often used for back-end development.",
    orderIndex: 0,
  },
  {
    text: "What does HTML stand for?",
    options: JSON.stringify([
      "Hyper Text Markup Language",
      "Highly Technical Modern Language",
      "Hyperlink and Text Management Language",
      "Home Tool Markup Language",
    ]),
    correctAnswer: "0",
    explanation: "HTML stands for Hyper Text Markup Language.",
    orderIndex: 1,
  },
  {
    text: "What is CSS primarily used for?",
    options: JSON.stringify([
      "Adding interactivity to a webpage",
      "Defining the structure of a webpage",
      "Styling the presentation of a webpage",
      "Managing server-side operations",
    ]),
    correctAnswer: "2",
    explanation:
      "CSS (Cascading Style Sheets) is primarily used for styling the look and formatting of a webpage.",
    orderIndex: 2,
  },
  {
    text: "Which HTML tag is used to create a hyperlink?",
    options: JSON.stringify(["<link>", "<href>", "<a>", "<hyper>"]),
    correctAnswer: "2",
    explanation: "The `<a>` tag (anchor tag) is used to create hyperlinks.",
    orderIndex: 3,
  },
  {
    text: "What is the purpose of JavaScript in web development?",
    options: JSON.stringify([
      "To define the structure of content",
      "To style the appearance of content",
      "To add interactivity and dynamic behavior",
      "To manage databases",
    ]),
    correctAnswer: "2",
    explanation:
      "JavaScript is used to add interactivity, dynamic content, and client-side logic to web pages.",
    orderIndex: 4,
  },
];

export const videoGamesQuizData = [
  {
    text: "What is the name of the main protagonist in the 'Legend of Zelda' series?",
    options: JSON.stringify(["Zelda", "Link", "Ganondorf", "Impa"]),
    correctAnswer: "1",
    explanation:
      "The main protagonist in the 'Legend of Zelda' series is typically Link.",
    orderIndex: 0,
  },
  {
    text: "Which popular battle royale game features the 'Storm' that shrinks the play area?",
    options: JSON.stringify([
      "Apex Legends",
      "Call of Duty: Warzone",
      "Fortnite",
      "PUBG: Battlegrounds",
    ]),
    correctAnswer: "2",
    explanation:
      "Fortnite features a 'Storm' that gradually shrinks the safe playing area.",
    orderIndex: 1,
  },
  {
    text: "What type of creature is Pac-Man famously known for eating?",
    options: JSON.stringify(["Apples", "Bananas", "Power Pellets", "Cherries"]),
    correctAnswer: "2",
    explanation:
      "Pac-Man eats Power Pellets to temporarily turn the ghosts vulnerable.",
    orderIndex: 2,
  },
  {
    text: "In the 'Mass Effect' trilogy, what is the name of Commander Shepard's ship?",
    options: JSON.stringify([
      "The Normandy",
      "The Enterprise",
      "The Millennium Falcon",
      "The Pillar of Autumn",
    ]),
    correctAnswer: "0",
    explanation: "Commander Shepard's iconic starship is the SSV Normandy.",
    orderIndex: 3,
  },
  {
    text: "Which company developed the 'Grand Theft Auto' series?",
    options: JSON.stringify(["Nintendo", "Sony", "Rockstar Games", "Ubisoft"]),
    correctAnswer: "2",
    explanation:
      "The 'Grand Theft Auto' series was primarily developed by Rockstar Games.",
    orderIndex: 4,
  },
];
