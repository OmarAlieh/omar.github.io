/**
 * =================================================================== 
 * AI Chat UI Controller
 * Manages chat interface, games, and user interactions
 * =================================================================== 
 */

class AIChatUI {
    constructor() {
        this.ai = new OmarAI();
        this.careerQuiz = new CareerQuiz();
        this.impactGame = new ImpactGame();
        this.currentMode = 'chat'; // chat, quiz, impact
        this.init();
    }

    init() {
        this.createChatButton();
        this.createChatModal();
        this.attachEventListeners();
        console.log('✅ AI Chat UI initialized');
    }

    createChatButton() {
        const button = document.createElement('div');
        button.className = 'ai-chat-button';
        button.innerHTML = `
            <i class="fa fa-comments"></i>
            <div class="ai-chat-badge">AI</div>
        `;
        button.onclick = () => this.openChat();
        document.body.appendChild(button);
    }

    createChatModal() {
        const modal = document.createElement('div');
        modal.className = 'ai-chat-modal';
        modal.id = 'ai-chat-modal';
        modal.innerHTML = `
            <div class="ai-chat-container">
                <div class="ai-chat-header">
                    <div class="ai-chat-header-content">
                        <div class="ai-avatar">🤖</div>
                        <div class="ai-chat-title">
                            <h3>Omar's AI Assistant</h3>
                            <p>Ask me anything about Omar!</p>
                        </div>
                    </div>
                    <button class="ai-chat-close" onclick="aiChatUI.closeChat()">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
                
                <div class="ai-chat-messages" id="ai-chat-messages">
                    <div class="ai-message">
                        👋 Hi! I'm Omar's AI assistant. I know everything about his experience, projects, and achievements. Ask me anything!
                        <br><br>
                        Try: "What AI projects have you built?" or "Tell me about your leadership experience"
                    </div>
                </div>
                
                <div class="ai-suggestions" id="ai-suggestions">
                    <!-- Suggestion chips will be added here -->
                </div>
                
                <div class="ai-chat-input-container">
                    <input 
                        type="text" 
                        class="ai-chat-input" 
                        id="ai-chat-input"
                        placeholder="Ask me anything about Omar..."
                        onkeypress="if(event.key==='Enter') aiChatUI.sendMessage()"
                    />
                    <button class="ai-send-button" onclick="aiChatUI.sendMessage()">
                        <i class="fa fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add suggested questions
        this.updateSuggestions();
    }

    updateSuggestions() {
        const suggestionsContainer = document.getElementById('ai-suggestions');
        const suggestions = this.ai.getSuggestedQuestions().slice(0, 4);
        
        suggestionsContainer.innerHTML = suggestions.map(q => 
            `<div class="ai-suggestion-chip" onclick="aiChatUI.askSuggestion('${q.replace(/'/g, "\\'")}')">${q}</div>`
        ).join('');
    }

    openChat() {
        document.getElementById('ai-chat-modal').classList.add('active');
        document.getElementById('ai-chat-input').focus();
    }

    closeChat() {
        document.getElementById('ai-chat-modal').classList.remove('active');
    }

    askSuggestion(question) {
        document.getElementById('ai-chat-input').value = question;
        this.sendMessage();
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Clear input
        input.value = '';

        // Add user message
        this.addMessage('user', message);

        // Show typing indicator
        this.showTyping();

        // Get AI response
        const response = await this.ai.chat(message);

        // Remove typing indicator
        this.removeTyping();

        // Add AI response
        if (response.success) {
            this.addMessage('ai', response.message);
        } else {
            this.addMessage('ai', response.message);
        }

        // Scroll to bottom
        this.scrollToBottom();
    }

    addMessage(type, text) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'user' ? 'user-message' : 'ai-message';
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTyping() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-typing';
        typingDiv.id = 'ai-typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTyping() {
        const typingIndicator = document.getElementById('ai-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    attachEventListeners() {
        // Close modal when clicking outside
        document.getElementById('ai-chat-modal').addEventListener('click', (e) => {
            if (e.target.id === 'ai-chat-modal') {
                this.closeChat();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeChat();
            }
        });
    }
}

// Game UI Controllers
class GameUI {
    constructor() {
        this.currentGame = null;
    }

    initQuiz() {
        const container = document.getElementById('game-container');
        const quiz = window.careerQuiz || new CareerQuiz();
        
        // Wait for quiz to load
        setTimeout(() => {
            quiz.start();
            this.renderQuizQuestion(quiz);
        }, 500);
    }

    renderQuizQuestion(quiz) {
        const container = document.getElementById('game-container');
        const question = quiz.getCurrentQuestion();
        
        if (!question) {
            this.renderQuizResults(quiz);
            return;
        }

        container.innerHTML = `
            <div class="game-header">
                <h3>Career Path Quiz</h3>
                <p>Test your knowledge about Omar's journey!</p>
            </div>
            
            <div class="game-progress">
                <span>Question ${question.number} of ${question.total}</span>
                <span class="game-score">Score: ${quiz.score}/${quiz.currentQuestion}</span>
            </div>
            
            <div class="quiz-question">
                <h4>${question.question}</h4>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option" onclick="gameUI.submitQuizAnswer(${index})">
                            ${option}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    submitQuizAnswer(selectedIndex) {
        const quiz = window.careerQuiz || new CareerQuiz();
        const result = quiz.submitAnswer(selectedIndex);
        
        // Show feedback
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((opt, i) => {
            opt.style.pointerEvents = 'none';
            if (i === result.correct) {
                opt.classList.add('correct');
            }
            if (i === selectedIndex && !result.isCorrect) {
                opt.classList.add('incorrect');
            }
        });

        // Show explanation
        const container = document.getElementById('game-container');
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'ai-message';
        explanationDiv.style.marginTop = '2rem';
        explanationDiv.innerHTML = `<strong>${result.isCorrect ? '✅ Correct!' : '❌ Not quite!'}</strong><br><br>${result.explanation}`;
        container.querySelector('.quiz-question').appendChild(explanationDiv);

        // Next question button
        setTimeout(() => {
            const nextButton = document.createElement('button');
            nextButton.className = 'game-button game-button-primary';
            nextButton.textContent = 'Next Question →';
            nextButton.style.marginTop = '2rem';
            nextButton.onclick = () => this.renderQuizQuestion(quiz);
            container.querySelector('.quiz-question').appendChild(nextButton);
        }, 2000);
    }

    renderQuizResults(quiz) {
        const results = quiz.getResults();
        const container = document.getElementById('game-container');
        
        GameUtils.showConfetti();
        
        container.innerHTML = `
            <div class="game-results">
                <div style="font-size: 8rem;">${results.emoji}</div>
                <div class="game-results-score">${results.score}/${results.total}</div>
                <div class="game-results-message">${results.message}</div>
                <div class="game-results-detail">${results.percentage}% Correct</div>
                
                <div class="game-buttons">
                    <button class="game-button game-button-primary" onclick="gameUI.initQuiz()">
                        Play Again
                    </button>
                    <button class="game-button game-button-secondary" onclick="gameUI.switchToImpact()">
                        Try Impact Game
                    </button>
                </div>
            </div>
        `;
    }

    initImpact() {
        const container = document.getElementById('game-container');
        const game = window.impactGame || new ImpactGame();
        
        setTimeout(() => {
            game.start();
            this.renderImpactScenario(game);
        }, 500);
    }

    renderImpactScenario(game) {
        const container = document.getElementById('game-container');
        const scenario = game.getCurrentScenario();
        
        if (!scenario) {
            this.renderImpactResults(game);
            return;
        }

        container.innerHTML = `
            <div class="game-header">
                <h3>Guess the Impact</h3>
                <p>How well do you know Omar's achievements?</p>
            </div>
            
            <div class="game-progress">
                <span>Scenario ${scenario.number} of ${scenario.total}</span>
                <span class="game-score">Score: ${game.score}</span>
            </div>
            
            <div class="impact-scenario">
                <h4>${scenario.title}</h4>
                <p>${scenario.description}</p>
                
                <div class="impact-guess-input">
                    <input type="number" id="impact-guess" min="0" max="100" placeholder="0" />
                    <span>%</span>
                </div>
                
                <button class="game-button game-button-primary" onclick="gameUI.submitImpactGuess()" style="width: 100%; margin-top: 2rem;">
                    Submit Guess
                </button>
            </div>
        `;

        // Focus on input
        setTimeout(() => {
            document.getElementById('impact-guess').focus();
        }, 100);
    }

    submitImpactGuess() {
        const input = document.getElementById('impact-guess');
        const guess = parseInt(input.value);
        
        if (isNaN(guess) || guess < 0 || guess > 100) {
            alert('Please enter a number between 0 and 100');
            return;
        }

        const game = window.impactGame || new ImpactGame();
        const result = game.submitGuess(guess);
        const badge = GameUtils.getAccuracyBadge(result.difference);
        
        // Show result
        const container = document.getElementById('game-container');
        const scenarioDiv = container.querySelector('.impact-scenario');
        
        input.disabled = true;
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'ai-message';
        resultDiv.style.marginTop = '2rem';
        resultDiv.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">${badge.emoji}</div>
            <strong>${badge.text}</strong> You guessed ${guess}%, actual was ${result.actual}%<br><br>
            ${result.celebration}<br><br>
            <em>${result.story}</em><br><br>
            <strong>Points earned: ${result.points}/100</strong>
        `;
        scenarioDiv.appendChild(resultDiv);

        // Next button
        setTimeout(() => {
            const nextButton = document.createElement('button');
            nextButton.className = 'game-button game-button-primary';
            nextButton.textContent = 'Next Scenario →';
            nextButton.style.width = '100%';
            nextButton.style.marginTop = '2rem';
            nextButton.onclick = () => this.renderImpactScenario(game);
            scenarioDiv.appendChild(nextButton);
        }, 2000);
    }

    renderImpactResults(game) {
        const results = game.getResults();
        const container = document.getElementById('game-container');
        
        GameUtils.showConfetti();
        
        container.innerHTML = `
            <div class="game-results">
                <div style="font-size: 8rem;">${results.emoji}</div>
                <div class="game-results-score">${results.score}</div>
                <div class="game-results-message">${results.message}</div>
                <div class="game-results-detail">${results.percentage}% Accuracy Score</div>
                
                <div class="game-buttons">
                    <button class="game-button game-button-primary" onclick="gameUI.initImpact()">
                        Play Again
                    </button>
                    <button class="game-button game-button-secondary" onclick="gameUI.switchToQuiz()">
                        Try Career Quiz
                    </button>
                </div>
            </div>
        `;
    }

    switchToQuiz() {
        document.querySelector('[data-mode="quiz"]').click();
    }

    switchToImpact() {
        document.querySelector('[data-mode="impact"]').click();
    }
}

// Initialize on page load
let aiChatUI;
let gameUI;
let careerQuiz;
let impactGame;

document.addEventListener('DOMContentLoaded', () => {
    aiChatUI = new AIChatUI();
    gameUI = new GameUI();
    careerQuiz = new CareerQuiz();
    impactGame = new ImpactGame();
    
    // Setup AI Playground mode switching
    setupAIPlayground();
    
    console.log('🚀 All systems ready!');
});

function setupAIPlayground() {
    const modeButtons = document.querySelectorAll('.ai-mode-button');
    
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            
            // Update active state
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Switch mode
            const container = document.getElementById('game-container');
            
            if (mode === 'chat') {
                aiChatUI.openChat();
            } else if (mode === 'quiz') {
                container.innerHTML = '<div class="game-header"><h3>Loading Quiz...</h3></div>';
                setTimeout(() => gameUI.initQuiz(), 300);
            } else if (mode === 'impact') {
                container.innerHTML = '<div class="game-header"><h3>Loading Game...</h3></div>';
                setTimeout(() => gameUI.initImpact(), 300);
            }
        });
    });
}
