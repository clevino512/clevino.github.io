// Variables globales
let currentLevel = 1;
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let startTime;
let timerInterval;
let currentQuestion = {};
let questionsAnswered = 0;
const QUESTIONS_PER_LEVEL = 10;
const PASSING_SCORE = 7;

// API de questions (Open Trivia DB)
async function getQuestions(level) {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&difficulty=${getDifficulty(level)}&type=multiple`);
        const data = await response.json();
        
        if (data.response_code === 0) {
            return data.results.map(q => ({
                question: decodeHtml(q.question),
                options: shuffleArray([...q.incorrect_answers, q.correct_answer].map(decodeHtml)),
                answer: decodeHtml(q.correct_answer)
            }));
        } else {
            console.error("Erreur API:", data);
            return getFallbackQuestions(level);
        }
    } catch (error) {
        console.error("Erreur de récupération des questions:", error);
        return getFallbackQuestions(level);
    }
}

function getDifficulty(level) {
    if (level <= 3) return 'easy';
    if (level <= 7) return 'medium';
    return 'hard';
}

function getFallbackQuestions(level) {
    // Questions de secours si l'API échoue
    const fallback = {
        easy: [
            {
                question: "Quelle est la capitale de la France?",
                options: ["Londres", "Berlin", "Paris", "Madrid"],
                answer: "Paris"
            }
        ],
        medium: [
            {
                question: "En quelle année a eu lieu la Révolution française?",
                options: ["1776", "1789", "1799", "1812"],
                answer: "1789"
            }
        ],
        hard: [
            {
                question: "Qui a peint la Joconde?",
                options: ["Pablo Picasso", "Vincent van Gogh", "Leonardo da Vinci", "Michelangelo"],
                answer: "Leonardo da Vinci"
            }
        ]
    };
    return fallback[getDifficulty(level)];
}

function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateProgressBullets(currentIndex) {
    const bullets = document.getElementById("progress-bullets");
    bullets.innerHTML = "";
    
    for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        if (i < currentIndex) {
            bullet.classList.add("answered");
        } else if (i === currentIndex) {
            bullet.classList.add("current");
        }
        bullets.appendChild(bullet);
    }
}

function showCompletionMessage(success) {
    const completionBox = document.createElement("div");
    completionBox.classList.add("completion-message");
    completionBox.innerHTML = `
        <div class="completion-content">
            <h2>${success ? 'Niveau Réussi!' : 'Niveau Échoué'}</h2>
            <p>Votre score: ${score}/10</p>
            <p>${success ? 'Le niveau suivant est débloqué!' : 'Vous devez obtenir au moins 7 bonnes réponses pour débloquer le niveau suivant.'}</p>
            <div class="completion-buttons">
                ${success ? '<button id="next-level-btn">Niveau Suivant</button>' : ''}
                <button id="replay-btn">Rejouer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(completionBox);
    
    if (success) {
        document.getElementById('next-level-btn').addEventListener('click', () => {
            if (currentLevel < 10) {
                // Débloquer le niveau suivant
                const nextLevelLink = document.querySelector(`.level-link[data-level="${currentLevel + 1}"]`);
                nextLevelLink.classList.remove('locked');
                changeLevel(currentLevel + 1);
            } else {
                alert('Félicitations! Vous avez terminé tous les niveaux!');
                changeLevel(1);
            }
            completionBox.remove();
        });
    }
    
    document.getElementById('replay-btn').addEventListener('click', () => {
        changeLevel(currentLevel);
        completionBox.remove();
    });
}

// Initialisation du jeu
async function initGame() {
    // Démarrer le timer
    startTimer();
    
    // // Charger les questions pour le niveau 1
    // await loadQuestion();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
}

function setupEventListeners() {
    // Options de question
    document.querySelectorAll('.question').forEach(option => {
        option.addEventListener('click', selectOption);
    });
    
    // Bouton suivant
    document.getElementById('next-btn').addEventListener('click', validateAnswer);
    
    // Bouton annuler
    document.getElementById('cancel-btn').addEventListener('click', annuler);
    
    // Boutons de niveau
    document.querySelectorAll('.level-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const level = parseInt(this.dataset.level);
            if (this.classList.contains('locked')) {
                alert("Vous devez terminer le niveau précédent pour continuer");
            } else {
                changeLevel(level);
            }
        });
    });
    
    // Boutons de statistiques
    document.getElementById('stats-btn').addEventListener('click', toggleStatistique);
    document.getElementById('close-stats-btn').addEventListener('click', toggleStatistique);
}

async function changeLevel(level) {
    currentLevel = level;
    score = 0;
    questionsAnswered = 0;
    
    // Mettre à jour l'affichage
    document.getElementById('current-level').textContent = `Niveau ${level}`;
    
    // Mettre à jour les liens des niveaux
    document.querySelectorAll('.level-link').forEach(link => {
        link.classList.remove('active');
        if (parseInt(link.dataset.level) === level) {
            link.classList.add('active');
        }
    });
    
    // Charger une nouvelle question
    await loadQuestion();
}

async function loadQuestion() {
    try {
        // Désactiver le bouton continuer
        document.getElementById('next-btn').disabled = true;
        document.getElementById('next-btn').textContent = 'Valider';
        
        // Réinitialiser les options
        const options = document.querySelectorAll('.question');
        options.forEach(opt => {
            opt.classList.remove('selected', 'correct', 'wrong');
            opt.style.pointerEvents = 'auto';
            opt.removeAttribute('data-selected');
        });
        
        // Récupérer les questions pour le niveau actuel
        const questions = await getQuestions(currentLevel);
        
        // Sélectionner une question aléatoire
        const randomIndex = Math.floor(Math.random() * questions.length);
        currentQuestion = questions[randomIndex];
        
        // Afficher la question
        document.getElementById('question-text').textContent = currentQuestion.question;
        
        // Afficher les options
        const optionsContainer = document.querySelectorAll('.question');
        currentQuestion.options.forEach((option, index) => {
            if (optionsContainer[index]) {
                optionsContainer[index].textContent = option;
                optionsContainer[index].dataset.index = index;
            }
        });
        
        // Mettre à jour les indicateurs de progression
        updateProgressBullets(questionsAnswered);
        
    } catch (error) {
        console.error("Erreur lors du chargement de la question:", error);
        document.getElementById('question-text').textContent = "Erreur de chargement de la question";
    }
}

function selectOption(e) {
    // Enlever la sélection précédente
    document.querySelectorAll('.question').forEach(opt => {
        opt.classList.remove('selected');
        opt.removeAttribute('data-selected');
    });
    
    // Sélectionner la nouvelle option
    const selectedOption = e.currentTarget;
    selectedOption.classList.add('selected');
    selectedOption.dataset.selected = 'true';
    
    // Activer le bouton continuer
    document.getElementById('next-btn').disabled = false;
}

async function validateAnswer() {
    const selectedOption = document.querySelector('.question[data-selected="true"]');
    if (!selectedOption) return;
    
    const selectedIndex = parseInt(selectedOption.dataset.index);
    const isCorrect = currentQuestion.options[selectedIndex] === currentQuestion.answer;
    
    // Mettre à jour les statistiques
    questionsAnswered++;
    if (isCorrect) {
        correctAnswers++;
        score++;
        selectedOption.classList.add('correct');
    } else {
        wrongAnswers++;
        selectedOption.classList.add('wrong');
        // Afficher la bonne réponse
        document.querySelectorAll('.question').forEach(opt => {
            if (currentQuestion.options[parseInt(opt.dataset.index)] === currentQuestion.answer) {
                opt.classList.add('correct');
            }
        });

    }
    
    // Mettre à jour les statistiques affichées
    updateStats();
    
    // Désactiver les options
    document.querySelectorAll('.question').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
    
    // Vérifier si le niveau est terminé
    if (questionsAnswered >= QUESTIONS_PER_LEVEL) {
    await saveGameStats();  // Sauvegarder dans la base de données
    endLevel();             // Terminer le niveau

    } else {
        // Préparer le bouton pour la question suivante
        document.getElementById('next-btn').textContent = 'Question suivante';
        document.getElementById('next-btn').onclick = async () => {
            await loadQuestion();
        };
    }
}

function endLevel() {
    const nextBtn = document.getElementById('next-btn');
    
    if (score >= PASSING_SCORE) {
        // Niveau réussi - Afficher notification
        showCompletionMessage(true);
    } else {
        // Niveau échoué - Afficher notification
        showCompletionMessage(false);
    }
}

function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const now = new Date();
    const elapsed = new Date(now - startTime);
    const minutes = elapsed.getUTCMinutes().toString().padStart(2, '0');
    const seconds = elapsed.getUTCSeconds().toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

function updateStats() {
    document.getElementById('stats-level').textContent = currentLevel;
    document.getElementById('stats-correct').textContent = `${correctAnswers}/${questionsAnswered}`;
    document.getElementById('stats-wrong').textContent = `${wrongAnswers}/${questionsAnswered}`;
    
    const now = new Date();
    const elapsed = new Date(now - startTime);
    const minutes = elapsed.getUTCMinutes().toString().padStart(2, '0');
    const seconds = elapsed.getUTCSeconds().toString().padStart(2, '0');
    document.getElementById('stats-time').textContent = `${minutes}:${seconds}`;
}

function toggleStatistique() {
    const box = document.getElementById("statistiqueBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
    if (box.style.display === "block") {
        updateStats();
    }
}

function annuler() {
    const confirmation = confirm("Voulez-vous vraiment quitter cette session ?");
    if (confirmation) {
        clearInterval(timerInterval);
        window.location.href = "connexion.html";
    }
}

// Démarrer le jeu lorsque la page est chargée
document.addEventListener('DOMContentLoaded', initGame);


// Fonctions communes
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    element.textContent = '';
    element.style.display = 'none';
}


// Fonction pour vérifier l'authentification
async function checkAuth() {
    const token = localStorage.getItem('quizToken');
    if (!token) {
        window.location.href = 'connexion.html';
        return;
    }
    
    try {
        const response = await fetch('api/check-auth.php', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        if (!response.ok) {
            window.location.href = 'connexion.html';
        }
    } catch (error) {
        window.location.href = 'connexion.html';
    }
}

// Gestion de l'inscription
document.addEventListener('DOMContentLoaded', function() {
    // Vérification des mots de passe pour l'inscription
    const inscriptionForm = document.getElementById('inscriptionForm');
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', function(e) {
            const pass1 = document.getElementById('pass1').value;
            const pass2 = document.getElementById('pass2').value;
            
            if (pass1 !== pass2) {
                e.preventDefault();
                showError('passwordError', 'Les mots de passe ne correspondent pas');
            } else {
                hideError('passwordError');
                // Ici, vous pourriez ajouter une redirection ou un traitement AJAX
                alert('Inscription réussie !');
                window.location.href = 'connexion.html';
            }
        });
    }

    // Gestion de la connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Ici, vous devriez vérifier les identifiants avec votre backend
            // Pour l'exemple, nous simulons une connexion réussie
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                // Redirection vers la page d'accueil après connexion
                window.location.href = 'index.html';
            } else {
                showError('loginError', 'Veuillez remplir tous les champs');
            }
        });
    }
});

// Gestion de la récupération de mot de passe
function continuer() {
    const dateInput = document.getElementById('dateInput');
    const passDiv = document.getElementById('passDiv');
    const btn = document.getElementById('btn');
    
    if (!dateInput.value) {
        document.getElementById('notification').classList.remove('hidden');
        return;
                 
    }
    
    document.getElementById('notification').classList.add('hidden');
    
    if (passDiv.classList.contains('hidden')) {
        passDiv.classList.remove('hidden');
        btn.textContent = 'Réinitialiser';
    } else {
        // Vérification des mots de passe
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showError('recoveryError', 'Les mots de passe ne correspondent pas');
            return;
        }
        
        if (password.length < 6) {
            showError('recoveryError', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        
        // Ici, vous devriez envoyer les données au serveur
        alert('Mot de passe réinitialisé avec succès !');
        window.location.href = 'connexion.html';
    }
}

function annuler() {
    window.location.href = 'connexion.html';
}

async function saveGameStats() {
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // durée en secondes

    const stats = {
        level: currentLevel,
        score: score,
        correctAnswers: correctAnswers,
        wrongAnswers: wrongAnswers,
        duration: duration,
        date: endTime.toISOString()
    };

    try {
        const response = await fetch('https://votre-serveur.com/api/saveStats.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stats)
        });

        if (!response.ok) {
            throw new Error("Échec de l'enregistrement des données.");
        }

        const result = await response.json();
        console.log("Statistiques enregistrées avec succès :", result);
    } catch (error) {
        console.error("Erreur lors de la sauvegarde des statistiques :", error);
    }
}


// let currentQuestionIndex = 0;
// let questions = []; // À remplir avec tes questions
// let timerInterval;

// // Cette fonction initialise le quiz (appelée après le clic sur "Commencer")
// function startQuiz() {
//     document.getElementById("welcome-screen").style.display = "none";
//     document.querySelector(".quiz").style.display = "block";
//     currentQuestionIndex = 0;
//     loadQuestion(currentQuestionIndex);
//     startTimer();
// }

// // Exemple de fonction de chargement d’une question
// function loadQuestion(index) {
//     const questionText = document.getElementById("question-text");
//     // Exemple si tu as un tableau d’objets {question: "", options: [...]}
//     if (questions.length > 0) {
//         const q = questions[index];
//         questionText.textContent = q.question;
//         const options = document.querySelectorAll(".question");
//         options.forEach((opt, i) => {
//             opt.textContent = q.options[i];
//         });
//     } else {
//         questionText.textContent = "Aucune question chargée.";
//     }
// }

// // Timer qui commence uniquement après le clic
// function startTimer() {
//     let timeLeft = 30; // Exemple : 30 secondes
//     timerInterval = setInterval(() => {
//         console.log("Temps restant :", timeLeft);
//         timeLeft--;
//         if (timeLeft < 0) {
//             clearInterval(timerInterval);
//             alert("Temps écoulé !");
//             // Tu peux passer à la question suivante ici
//         }
//     }, 1000);
// }

// document.addEventListener("DOMContentLoaded", () => {
//     const startBtn = document.getElementById("start-btn");
//     startBtn.addEventListener("click", startQuiz);
// });
