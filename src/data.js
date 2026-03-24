export const mockQuizzes = [
    {
        id: 1,
        title: "Javascript Fundamentals",
        description: "Test your knowledge of core Javascript concepts including types, scoping, and modern features.",
        duration: 10,
        questions: [
            {
                id: 1,
                question: "What is the result of typeof null?",
                options: ["object", "null", "undefined", "number"],
                correctAnswer: 0
            },
            {
                id: 2,
                question: "Which keyword is used to declare a block-scoped variable?",
                options: ["var", "let", "const", "Both let and const"],
                correctAnswer: 3
            },
            {
                id: 3,
                question: "What does NaN stand for?",
                options: ["Not a Number", "Node and Network", "New and Next", "None"],
                correctAnswer: 0
            },
            {
                id: 4,
                question: "Which method converts a JSON string to a JavaScript object?",
                options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.toObject()"],
                correctAnswer: 1
            },
            {
                id: 5,
                question: "What is the output of: console.log(0.1 + 0.2 === 0.3)?",
                options: ["true", "false", "undefined", "Error"],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 2,
        title: "React Basics",
        description: "How well do you know React, JSX, hooks, and the component lifecycle?",
        duration: 8,
        questions: [
            {
                id: 1,
                question: "What is the virtual DOM?",
                options: ["A direct copy of the DOM", "A lightweight representation of the DOM", "A database for components", "None of these"],
                correctAnswer: 1
            },
            {
                id: 2,
                question: "What is a React Hook?",
                options: ["A way to call CSS", "A function that lets you use state and other features", "A performance tool", "An event listener"],
                correctAnswer: 1
            },
            {
                id: 3,
                question: "Which hook is used for side effects in functional components?",
                options: ["useState", "useEffect", "useContext", "useMemo"],
                correctAnswer: 1
            },
            {
                id: 4,
                question: "What does JSX stand for?",
                options: ["JavaScript XML", "Java Syntax Extension", "JSON XML Schema", "JavaScript Extra"],
                correctAnswer: 0
            },
            {
                id: 5,
                question: "How do you pass data from a parent to child component?",
                options: ["Using state", "Using props", "Using context only", "Using Redux only"],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 3,
        title: "Python Essentials",
        description: "Assess your understanding of Python syntax, data structures, and built-in functions.",
        duration: 10,
        questions: [
            {
                id: 1,
                question: "What is the output of: print(type([]))?",
                options: ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"],
                correctAnswer: 1
            },
            {
                id: 2,
                question: "Which keyword is used to define a function in Python?",
                options: ["function", "func", "def", "define"],
                correctAnswer: 2
            },
            {
                id: 3,
                question: "What does the 'self' keyword refer to in a Python class?",
                options: ["The class itself", "The current instance of the class", "A global variable", "The parent class"],
                correctAnswer: 1
            },
            {
                id: 4,
                question: "Which data structure uses key-value pairs in Python?",
                options: ["List", "Tuple", "Set", "Dictionary"],
                correctAnswer: 3
            },
            {
                id: 5,
                question: "What is the output of: len('Hello World')?",
                options: ["10", "11", "12", "Error"],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 4,
        title: "Data Structures & Algorithms",
        description: "Test your knowledge of arrays, linked lists, trees, sorting, and time complexity.",
        duration: 12,
        questions: [
            {
                id: 1,
                question: "What is the time complexity of binary search?",
                options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
                correctAnswer: 1
            },
            {
                id: 2,
                question: "Which data structure follows LIFO (Last In First Out)?",
                options: ["Queue", "Stack", "Array", "Linked List"],
                correctAnswer: 1
            },
            {
                id: 3,
                question: "What is the worst-case time complexity of Quick Sort?",
                options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
                correctAnswer: 2
            },
            {
                id: 4,
                question: "A binary tree where each node has at most two children is called?",
                options: ["Complete tree", "Binary tree", "AVL tree", "B-tree"],
                correctAnswer: 1
            },
            {
                id: 5,
                question: "Which traversal visits nodes in order: Left, Root, Right?",
                options: ["Pre-order", "Post-order", "In-order", "Level-order"],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 5,
        title: "Web Development Fundamentals",
        description: "Cover HTML, CSS, HTTP protocols, and browser fundamentals.",
        duration: 8,
        questions: [
            {
                id: 1,
                question: "What does CSS stand for?",
                options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
                correctAnswer: 1
            },
            {
                id: 2,
                question: "Which HTTP method is used to submit data to be processed?",
                options: ["GET", "POST", "PUT", "DELETE"],
                correctAnswer: 1
            },
            {
                id: 3,
                question: "What is the default display value of a <div> element?",
                options: ["inline", "block", "flex", "inline-block"],
                correctAnswer: 1
            },
            {
                id: 4,
                question: "Which HTML tag is used to define an internal stylesheet?",
                options: ["<css>", "<style>", "<script>", "<link>"],
                correctAnswer: 1
            },
            {
                id: 5,
                question: "What does the 'box-sizing: border-box' property do?",
                options: [
                    "Adds a border to the element",
                    "Includes padding and border in the element's total width and height",
                    "Makes the element a flexbox container",
                    "Removes all styling from the element"
                ],
                correctAnswer: 1
            }
        ]
    }
];

export const mockLeaderboard = [
    { name: "Alice", score: 95, date: "2026-02-28" },
    { name: "Bob", score: 88, date: "2026-02-27" },
    { name: "Charlie", score: 80, date: "2026-03-01" },
    { name: "Diana", score: 72, date: "2026-02-26" },
    { name: "Eve", score: 60, date: "2026-03-01" }
];
