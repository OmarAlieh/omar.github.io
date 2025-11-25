/**
 * =================================================================== 
 * Interactive Games for Omar's Website
 * Game 1: Career Path Quiz
 * Game 2: Guess the Impact
 * =================================================================== 
 */

class CareerQuiz {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.init();
    }

    async init() {
        try {
            const response = await fetch('data/omar-knowledge-base.json');
            const data = await response.json();
            this.questions = data.quiz_questions;
            console.log('✅ Quiz questions loaded');
        } catch (error) {
            console.error('❌ Failed to load quiz:', error);
        }
    }

    start() {
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        return this.getCurrentQuestion();
    }

    getCurrentQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            return null;
        }
        return {
            ...this.questions[this.currentQuestion],
            number: this.currentQuestion + 1,
            total: this.questions.length
        };
    }

    submitAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const isCorrect = selectedIndex === question.correct;
        
        if (isCorrect) {
            this.score++;
        }

        this.answers.push({
            question: question.question,
            selected: selectedIndex,
            correct: question.correct,
            isCorrect: isCorrect,
            explanation: question.explanation
        });

        this.currentQuestion++;

        return {
            isCorrect: isCorrect,
            correctAnswer: question.options[question.correct],
            explanation: question.explanation,
            score: this.score,
            total: this.currentQuestion
        };
    }

    getResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        
        let message = '';
        let emoji = '';
        
        if (percentage >= 90) {
            emoji = '🏆';
            message = 'Outstanding! You really know Omar well!';
        } else if (percentage >= 70) {
            emoji = '🎉';
            message = 'Great job! You have a solid understanding of Omar\'s journey!';
        } else if (percentage >= 50) {
            emoji = '👍';
            message = 'Not bad! You learned something about Omar today!';
        } else {
            emoji = '📚';
            message = 'Thanks for playing! Now you know more about Omar!';
        }

        return {
            score: this.score,
            total: this.questions.length,
            percentage: percentage,
            message: message,
            emoji: emoji,
            answers: this.answers
        };
    }

    reset() {
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
    }
}

class ImpactGame {
    constructor() {
        this.scenarios = [];
        this.currentScenario = 0;
        this.score = 0;
        this.results = [];
        this.init();
    }

    async init() {
        try {
            const response = await fetch('data/omar-knowledge-base.json');
            const data = await response.json();
            this.scenarios = data.impact_scenarios;
            console.log('✅ Impact scenarios loaded');
        } catch (error) {
            console.error('❌ Failed to load impact game:', error);
        }
    }

    start() {
        this.currentScenario = 0;
        this.score = 0;
        this.results = [];
        return this.getCurrentScenario();
    }

    getCurrentScenario() {
        if (this.currentScenario >= this.scenarios.length) {
            return null;
        }
        return {
            ...this.scenarios[this.currentScenario],
            number: this.currentScenario + 1,
            total: this.scenarios.length
        };
    }

    submitGuess(guess) {
        const scenario = this.scenarios[this.currentScenario];
        const difference = Math.abs(guess - scenario.percentage);
        
        // Scoring: Perfect = 100, within 5% = 80, within 10% = 60, within 20% = 40, else 20
        let points = 20;
        if (difference === 0) {
            points = 100;
        } else if (difference <= 5) {
            points = 80;
        } else if (difference <= 10) {
            points = 60;
        } else if (difference <= 20) {
            points = 40;
        }

        this.score += points;

        const result = {
            title: scenario.title,
            guess: guess,
            actual: scenario.percentage,
            difference: difference,
            points: points,
            celebration: scenario.celebration,
            story: scenario.story
        };

        this.results.push(result);
        this.currentScenario++;

        return result;
    }

    getResults() {
        const maxPossibleScore = this.scenarios.length * 100;
        const percentage = Math.round((this.score / maxPossibleScore) * 100);
        
        let message = '';
        let emoji = '';
        
        if (percentage >= 80) {
            emoji = '🎯';
            message = 'Incredible! You have a great sense for impact!';
        } else if (percentage >= 60) {
            emoji = '👏';
            message = 'Well done! You understand Omar\'s achievements!';
        } else if (percentage >= 40) {
            emoji = '💪';
            message = 'Good effort! Now you know the real numbers!';
        } else {
            emoji = '📊';
            message = 'Thanks for playing! Omar\'s impact is impressive, right?';
        }

        return {
            score: this.score,
            maxScore: maxPossibleScore,
            percentage: percentage,
            message: message,
            emoji: emoji,
            results: this.results
        };
    }

    reset() {
        this.currentScenario = 0;
        this.score = 0;
        this.results = [];
    }
}

// Utility functions for UI interactions
const GameUtils = {
    /**
     * Animate number counting
     */
    animateNumber(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    },

    /**
     * Show confetti animation
     */
    showConfetti() {
        // Simple confetti effect using emoji
        const emojis = ['🎉', '✨', '⭐', '🌟', '💫', '🎊'];
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(container);

        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: -50px;
                font-size: ${20 + Math.random() * 20}px;
                animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
            `;
            container.appendChild(confetti);
        }

        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(container);
        }, 4000);
    },

    /**
     * Create share text for social media
     */
    getShareText(gameType, results) {
        if (gameType === 'quiz') {
            return `I scored ${results.score}/${results.total} (${results.percentage}%) on the Omar Alieh Career Quiz! 🎯 Check out his impressive journey: [your-website-url]`;
        } else if (gameType === 'impact') {
            return `I guessed Omar's impact metrics with ${results.percentage}% accuracy! His achievements are incredible. 📊 Learn more: [your-website-url]`;
        }
    },

    /**
     * Format percentage for display
     */
    formatPercentage(value) {
        return value + '%';
    },

    /**
     * Calculate accuracy badge
     */
    getAccuracyBadge(difference) {
        if (difference === 0) return { text: 'Perfect!', class: 'badge-perfect', emoji: '🎯' };
        if (difference <= 5) return { text: 'Excellent!', class: 'badge-excellent', emoji: '⭐' };
        if (difference <= 10) return { text: 'Great!', class: 'badge-great', emoji: '👍' };
        if (difference <= 20) return { text: 'Good!', class: 'badge-good', emoji: '👏' };
        return { text: 'Nice try!', class: 'badge-try', emoji: '💪' };
    }
};

// Add confetti animation CSS
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
@keyframes confetti-fall {
    to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}
`;
document.head.appendChild(confettiStyle);

// Export for use in other files
window.CareerQuiz = CareerQuiz;
window.ImpactGame = ImpactGame;
window.GameUtils = GameUtils;
