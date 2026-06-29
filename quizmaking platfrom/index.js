const quizQuestions = [
    {
    id:1,
    question:"Which of the is the correct syntax for a JavaScript Rest Parameter?",
    options :[
        "myFunc(x, y)............",
        "function myFunc(...args)",
        "function myFunc(args...)",
        "function myFunc(args...)"
    ],
    correctAnswerIndex: 1
    },    
    {
        id: 2,
        question: "Which HTML5 element is used to display a scalar measurement within a known range?",
        options: [
            "<progress>",
            "<slider>",
            "<meter>",
            "<measure>"
        ],
        correctAnswerIndex: 2
    },
    {
        id: 3,
        question: "Which CSS display property utility creates a flexible responsive grid layout grid container?",
        options: [
            "display: inline-block;",
            "display: flex;",
            "display: grid;",
            "display: block-flex;"
        ],
        correctAnswerIndex: 2
    },
    {
        id: 4,
        question: "Which JavaScript array method executes a reducer function on each element, resulting in a single output value?",
        options: [
            "reduce()",
            "map()",
            "filter()",
            "every()"
        ],
        correctAnswerIndex: 0
    },
    {
        id: 5,
        question: "In Bootstrap 5, which class configuration forces an element to take up full available width?",
        options: [
            "w-max",
            "w-70",
            "w-100",
            "width-full"
        ],
        correctAnswerIndex: 2
    },
    {
        id: 6,
        question: "Which of the following statements is true regarding a JavaScript Arrow Function?",
        options: [
            "It has its own 'this' context binding.",
            "It cannot be used as a constructor with the 'new' keyword.",
            "It does not support implicit return values.",
            "It requires the function keyword declaration."
        ],
        correctAnswerIndex: 1
    },
    {
        id: 7,
        question: "Which HTTP request method is typically used to update an existing resource completely on a server?",
        options: [
            "GET",
            "POST",
            "PATCH",
            "PUT"
        ],
        correctAnswerIndex: 3
    }
];

let prgscore = 0;      
let correctCount = 0;  // Holds total correct answers
let i = 1;             // Question position controller (starts on question index 0)
let answeredCount = 0; // Tracks actual completed questions for progress bar tracking

// Set initial screen state progress bar string text on load to show 0
document.addEventListener("DOMContentLoaded", function() {
    let progreesbar = document.querySelector("#prgsbar");
    if (progreesbar) {
        progreesbar.innerHTML = `PROGRESS: ${answeredCount} / ${quizQuestions.length} | CORRECT: ${correctCount}`;
    }
});

// ==========================================
// BLOCK 1: ANSWER CLICK INTERACTION HANDLER
// ==========================================
document.querySelector("#answ").addEventListener('click', function(e) {
    let clcikedpos = e.target.closest('button');
    if (!clcikedpos) return; 

    if (clcikedpos.disabled) return;

    let answ = clcikedpos.firstElementChild.textContent;
    let correctansw = quizQuestions[i - 1].options[quizQuestions[i - 1].correctAnswerIndex];
    let allbutns = document.querySelectorAll("button");
    
    if (answ == correctansw) {
        clcikedpos.className = "btn btn-success w-100 py-3 rounded-pill text-start px-4 shadow-sm fw-medium d-flex align-items-center";
        
        allbutns.forEach(element => {
            if (element.id != "btn") {
                element.disabled = true;
            }
        });
        
        let feedback = document.querySelector("#fdbk");
        if (feedback) {
            feedback.textContent = "Correct";
            feedback.style.color = "green";
        }
        
        prgscore = 1;
        correctCount++; 
    } 
    else {
        clcikedpos.className = "btn btn-danger w-100 py-3 rounded-pill text-start px-4 shadow-sm fw-medium d-flex align-items-center";
        
        allbutns.forEach(element => {
            if (element.id != "btn") {
                element.disabled = true;
                
                if(element.firstElementChild && element.firstElementChild.textContent == correctansw) {
                    element.className = "btn btn-success w-100 py-3 rounded-pill text-start px-4 shadow-sm fw-medium d-flex align-items-center";
                }
            }
        });
        
        let feedback = document.querySelector("#fdbk");
        if (feedback) {
            feedback.textContent = "Incorrect";
            feedback.style.color = "red";
        }
        
        prgscore = 0;
    }
});

// ==========================================
// BLOCK 2: NEXT BUTTON NAVIGATION HANDLER
// ==========================================
document.querySelector("#btn").addEventListener('click', function(e) {
    
    // Increment total answered question count when moving off a card
    answeredCount++;

    // Update textual scorecard layout markers immediately
    let progreesbar = document.querySelector("#prgsbar");
    if (progreesbar) {
         progreesbar.innerHTML = `PROGRESS: ${answeredCount} / ${quizQuestions.length} | CORRECT: ${correctCount}`;
    }

    // Target visual fill bar using matching DOM id selectors
    let percentage = (answeredCount / quizQuestions.length) * 100;
    let visualBarElement = document.querySelector("#bar");
    if (visualBarElement) {
        visualBarElement.style.width = `${percentage}%`;
        visualBarElement.setAttribute("aria-valuenow", percentage);
    }

    if (i < quizQuestions.length) {
        let feedback = document.querySelector("#fdbk");
        if (feedback) feedback.textContent = "Waiting!";
        if (feedback) feedback.style.color = "";

        let question = document.querySelector("#ques");
        if (question) question.textContent = quizQuestions[i].question;
        
        let allbutns = document.querySelectorAll("button");
        let ind = 0;
        allbutns.forEach(function(elm) {
            if (elm.id != "btn") {
                elm.className = "btn btn-outline-secondary w-100 py-3 rounded-pill text-start px-4 shadow-sm fw-medium d-flex align-items-center";
                elm.style.backgroundColor = "";
                elm.disabled = false;

                if (elm.firstElementChild) {
                    elm.firstElementChild.textContent = `${quizQuestions[i].options[ind]}`;
                }
                ind++;
            }
        });
        
        i++;
    } 
    else {
        let question = document.querySelector("#ques");
        if (question) {
            question.innerHTML = `Quiz Complete! 🎉 <br><span class="fs-5 text-muted">Final score calculation: You answered ${correctCount} questions correctly out of ${quizQuestions.length}.</span>`;
        }
        
        document.querySelector("#answ").style.display = "none";
        document.querySelector("#btn").style.display = "none";
    }
});