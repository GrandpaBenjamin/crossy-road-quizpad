import { questions } from "../assets/questions/question_data.js";

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

export var QUESTION_DATA = questions.data;
var numberOfQuestions = QUESTION_DATA.questions.length;
export var currentQuestion = 0;

export var questionType = "multipleChoice";
export var currentLetterIndex = 0;
export var currentWord = "1234";//"phil";
export var question = "What is a+b?";
export var answer = "two";
export var choice = null;


export function getAnswerAtID(id){
    let answers = getCurrentQuestionAnswers();
    //console.log(answers);
    //console.log(answers[id]);
    return answers[id];
}

export function getCorrectAnswer(){
    let answers = getCurrentQuestionAnswers();
    for (let i = 0; i < answers.length; i++){
        if (answers[i].isCorrect == true){
            return answers[i];
        }
    }
};

export function getCurrentQuestion(){
    return QUESTION_DATA.questions[currentQuestion];
};

export function nextQuestion(){
    if (currentQuestion+1 >= numberOfQuestions){
        currentQuestion = -1;
    }else{
        currentQuestion += 1;
    }
};

export function getCurrentQuestionAnswers(){
    return QUESTION_DATA.questions[currentQuestion].answers;
};

export function increaseCLI(byWhat){
    currentLetterIndex+=byWhat;
};

export function resetProgress(){
    currentLetterIndex = 0;
    currentQuestion = 0;
    console.log("resetted");
};

export function getCurrentLetter(){
    if (currentLetterIndex >= currentWord.length){
        return -1
    }else{
        return currentWord[currentLetterIndex]
    }
};

export function setChoice(data){
    choice = data;
};

export var score = 0;
export var letterDetected = false;

export function setLetterDetected(state){
    letterDetected = state;
}

export var returningScore = false;
export function returningScoreToBefore(state){
    returningScore = state;
}

export function setScore(value){
    score = value;
}

export var answersVisible = false;
export function setAnswersVisible(state){
    answersVisible = state;
}

export var displayQuestion = true;
export function hideQuestion(){
    displayQuestion = false;
}