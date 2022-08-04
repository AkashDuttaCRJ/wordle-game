// DOM Elements Declarations
const wordleContainer = document.querySelector('.wordle-container');
const keyboardContainer = document.querySelector('.keyboard-container');
const messageContainer = document.querySelector('.message-container');


// Game Variables
let wordlist = [];
let guessWord;
let wordle = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
];
const keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '&#9003'];
let activeSquareRow = 0;
let activeSquareCol = 0;
let isGameOver = false;


// Game Functions
const generateBoard = () => {
    for (let i = 0; i < wordle.length; i++) {
        for (let j = 0; j < wordle[i].length; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.setAttribute('id', `${i}-${j}`);
            square.innerHTML = wordle[i][j];
            wordleContainer.appendChild(square);
        }
    }
    fetchWordlist();
}

const generateKeyboard = () => {
    keys.forEach(key => {
        const button = document.createElement('button');
        button.classList.add('keyboard-button');
        button.setAttribute('id', key);
        if (key === 'ENTER' || key === '&#9003') {
            button.classList.add('long-key');
        }
        button.innerHTML = key;
        button.addEventListener('click', () => handleKeyPress(key))
        button.addEventListener('mousedown', () => {
            if (button.classList.contains('green-key')) {
                button.classList.add('pressed-green-key');
            } else if (button.classList.contains('yellow-key')) {
                button.classList.add('pressed-yellow-key');
            } else {
                button.classList.add('pressed')
            }
        })
        button.addEventListener('mouseup', () => {
            if (button.classList.contains('green-key')) {
                button.classList.remove('pressed-green-key');
            } else if (button.classList.contains('yellow-key')) {
                button.classList.remove('pressed-yellow-key');
            } else {
                button.classList.remove('pressed')
            }
        })
        keyboardContainer.appendChild(button);
    })
}

const fetchWordlist = () => {
    fetch('./words.json')
        .then(response => response.json())
        .then(data => {
            wordlist = data;
            guessWord = getRandomWord();
            console.log(guessWord);
        })
        .catch(error => console.error(error));
}

const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * wordlist.length);
    return wordlist[randomIndex].word;
}

const handleKeyPress = (key) => {
    if (!isGameOver) {
        if (key === 'ENTER') {
            handleEnter();
        } else if (key === '&#9003' || key === 'BACKSPACE') {
            handleBackspace();
        } else if (keys.includes(key)) {
            handleLetter(key);
        }
    } else {
        key == 'R' && resetGame();
    }
}

const displayMessage = (message, appendMessage = false, duration = 2000) => {
    const messageHTML = `<p class="message">${message}</p>`;
    if (appendMessage) {
        messageContainer.innerHTML += messageHTML;
    } else {
        messageContainer.innerHTML = messageHTML;
    }
    duration <=2000 && setTimeout(() => {
        messageContainer.innerHTML = '';
    }, duration);
}

const updateBoard = (row, col, type) => {
    const square = document.getElementById(`${row}-${col}`);
    square.innerHTML = wordle[row][col];
    if (type === 'add') {
        square.classList.add('active');
        addAnimation(row, col, 'zoom');
    } else if (type === 'remove') {
        square.classList.remove('active');
    }
}

const resetGame = () => {
    wordle = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ];
    activeSquareRow = 0;
    activeSquareCol = 0;
    isGameOver = false;
    wordleContainer.innerHTML = '';
    keyboardContainer.innerHTML = '';
    messageContainer.innerHTML = '';
    generateBoard();
    generateKeyboard();
}

const isValidWord = (word) => {
    for (let i = 0; i < wordlist.length; i++) {
        if (wordlist[i].word === word) {
            return true;
        }
    }
    return false;
}

const colorKey = (key, color) => {
    const button = document.getElementById(key);
    if (button?.classList?.contains('green-key') && color === 'yellow') return;
    if (button?.classList?.contains('yellow-key') && color === 'green'){
        button.classList.remove('yellow-key');
    }
    button?.classList?.add(`${color}-key`);
}

const colorSquare = (rowIndex, colIndex, color, key) => {
    const square = document.getElementById(`${rowIndex}-${colIndex}`);
    setTimeout(() => {
        addAnimation(rowIndex, colIndex, 'flip');
        square.classList.add(color);
        colorKey(key, color);
    }, 500 * colIndex);
}

const addAnimation = (rowIndex, colIndex, animation) => {
    const square = document.getElementById(`${rowIndex}-${colIndex}`);
    if (animation === 'flip') {
        square.classList.add('flip');
    } else if (animation === 'shake') {
        square.classList.add('shake');
        setTimeout(() => {
            square.classList.remove('shake');
        }, 1000);
    } else if (animation === 'bounce') {
        setTimeout(() => {
            square.classList.add('bounce');
        }, 150 * colIndex);
    } else if (animation === 'zoom') {
        square.classList.add('zoom');
        setTimeout(() => {
            square.classList.remove('zoom');
        }, 300);
    }
}

const getScore = (greens, yellows) => {
    const totalGreenPoints = greens * 2;
    const totalYellowPoints = yellows * 1;
    return totalGreenPoints + totalYellowPoints;
}


// Game Logics
const handleEnter = () => {
    if (activeSquareCol === 5) {
        const word = wordle[activeSquareRow].join('')
        if (!isValidWord(word)) {
            for (let i = 0; i < activeSquareCol; i++) {
                addAnimation(activeSquareRow, i, 'shake');
            }
            displayMessage('Not in Word List!');
            return
        }
        const counter = { greens: 0, yellows: 0 };
        if (word === guessWord) {
            for (let i = 0; i < activeSquareCol; i++) {
                colorSquare(activeSquareRow, i, 'green', word[i]);
                setTimeout(() => {
                    addAnimation(activeSquareRow, i, 'bounce');
                }, 2500);
            }
            displayMessage('🎊You win!🎊', false, 5000);
            displayMessage('Press R to play again!', true, 5000);
            isGameOver = true;
            return
        }
        wordle[activeSquareRow].forEach((letter, index) => {
            if (guessWord.includes(letter)) {
                if(letter === guessWord[index]) {
                    // color the square green
                    colorSquare(activeSquareRow, index, 'green', letter);
                    counter.greens++;
                } else {
                    // color the square yellow
                    colorSquare(activeSquareRow, index, 'yellow', letter);
                    counter.yellows++;
                }
            } else {
                // color the square gray
                colorSquare(activeSquareRow, index, 'gray', letter);
            }
        })
        if (word !== guessWord && activeSquareRow === 5) {
            displayMessage('👾Game Over!👾', false, 5000);
            displayMessage('Press R to play again!', true, 5000);
            isGameOver = true;
            return
        }
        const score = getScore(counter.greens, counter.yellows);
        if (score > 0) {
            if (0 < score && score <= 2) {
                displayMessage('Nice👏');
            }  else if (2 < score && score <= 5) {
                displayMessage('Great🌟');
            } else {
                displayMessage('Excellent🔥');
            }
        }
        activeSquareCol = 0;
        activeSquareRow++;
    }
}

const handleBackspace = () => {
    if (activeSquareCol > 0) {
        activeSquareCol--;
        wordle[activeSquareRow][activeSquareCol] = '';
        updateBoard(activeSquareRow, activeSquareCol, 'remove');
    }
}

const handleLetter = (key) => {
    // console.log(`${key} pressed!`);
    if (activeSquareCol < 5) {
        wordle[activeSquareRow][activeSquareCol] = key;
        updateBoard(activeSquareRow, activeSquareCol, 'add');
        activeSquareCol++;
    }
}


// Event Listeners
document.addEventListener('keyup', (e) => handleKeyPress(e.key.toUpperCase()));


// Game Init Calls
generateBoard();
generateKeyboard();
