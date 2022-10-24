export const letterToInt = {
    'a': 0,
    'b': 1,
    'c': 2,
    'd': 3,
    'e': 4,
    'f': 5,
    'g': 6,
    'h': 7,
    "i": 8,
    "j": 9,
    "k": 10,
    "l": 11,
    "m": 12,
    "n": 13,
    "o": 14,
    "p": 15,
    "q": 16,
    "r": 17,
    "s": 18,
    "t": 19,
    "u": 20,
    "v": 21,
    "w": 22,
    "x": 23,
    "y": 24,
    "z": 25,
    "1": 26,
    "2": 27,
    "3": 28,
    "4": 29,
    "5": 30,
    "6": 31,
    "7": 32,
    "8": 33,
    "9": 34,
}

export var questionType = "multipleChoice";
export var currentLetterIndex = 0;
export var currentWord = "123";//"balls";
export var question = "What is a+b?";
export var answer = "two";
export var choice = null;

export function increaseCLI(byWhat){
    currentLetterIndex+=byWhat;
}

export function resetProgress(){
    currentLetterIndex = 0;
    console.log("resetted");
}

export function getCurrentLetter(){
    if (currentLetterIndex >= currentWord.length){
        return -1
    }else{
        return currentWord[currentLetterIndex]
    }
}

export function setChoice(data){
    choice = data;
}