class BrainTrainingGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.hints = 3;
        this.currentQuestionIndex = 0;
        this.shuffledQuestions = [];
        this.usedHint = false;
        this.streak = 0;

        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.hintsElement = document.getElementById('hints');
        this.questionTypeElement = document.getElementById('questionType');
        this.questionTextElement = document.getElementById('questionText');
        this.hintAreaElement = document.getElementById('hintArea');
        this.hintTextElement = document.getElementById('hintText');
        this.answerInputElement = document.getElementById('answerInput');
        this.submitBtnElement = document.getElementById('submitBtn');
        this.hintBtnElement = document.getElementById('hintBtn');
        this.skipBtnElement = document.getElementById('skipBtn');
        this.feedbackElement = document.getElementById('feedback');
        this.startScreenElement = document.getElementById('startScreen');
        this.gameAreaElement = document.querySelector('.game-area');
        this.resultScreenElement = document.getElementById('resultScreen');
        this.startBtnElement = document.getElementById('startBtn');
        this.restartBtnElement = document.getElementById('restartBtn');
        this.finalScoreElement = document.getElementById('finalScore');
        this.resultMessageElement = document.getElementById('resultMessage');
        this.restartGameBtnElement = document.getElementById('restartGameBtn');
        this.goHomeBtnElement = document.getElementById('goHomeBtn');
    }

    bindEvents() {
        this.startBtnElement.addEventListener('click', () => this.startGame());
        this.restartBtnElement.addEventListener('click', () => this.restartGame());
        this.submitBtnElement.addEventListener('click', () => this.submitAnswer());
        this.hintBtnElement.addEventListener('click', () => this.useHint());
        this.skipBtnElement.addEventListener('click', () => this.skipQuestion());
        this.restartGameBtnElement.addEventListener('click', () => this.restartGame());
        this.goHomeBtnElement.addEventListener('click', () => this.goHome());

        this.answerInputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
    }

    startGame() {
        this.score = 0;
        this.level = 1;
        this.hints = 3;
        this.currentQuestionIndex = 0;
        this.usedHint = false;
        this.streak = 0;
        this.shuffledQuestions = shuffleArray(questions);

        this.updateStats();
        this.startScreenElement.style.display = 'none';
        this.resultScreenElement.style.display = 'none';
        this.gameAreaElement.classList.add('active');
        this.showQuestion();
    }

    restartGame() {
        this.startGame();
    }

    goHome() {
        this.gameAreaElement.classList.remove('active');
        this.resultScreenElement.style.display = 'none';
        this.startScreenElement.style.display = 'block';
        this.score = 0;
        this.level = 1;
        this.hints = 3;
        this.updateStats();
    }

    updateStats() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.hintsElement.textContent = this.hints;
    }

    showQuestion() {
        if (this.currentQuestionIndex >= this.shuffledQuestions.length) {
            this.endGame();
            return;
        }

        const question = this.shuffledQuestions[this.currentQuestionIndex];
        this.questionTypeElement.textContent = question.type;
        this.questionTextElement.textContent = question.question;
        this.hintAreaElement.style.display = 'none';
        this.feedbackElement.style.display = 'none';
        this.answerInputElement.value = '';
        this.answerInputElement.disabled = false;
        this.submitBtnElement.disabled = false;
        this.hintBtnElement.disabled = this.hints <= 0;
        this.usedHint = false;

        this.level = Math.floor(this.currentQuestionIndex / 5) + 1;
        this.updateStats();

        this.answerInputElement.focus();
    }

    checkAnswer(userAnswer) {
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        const normalizedUserAnswer = userAnswer.trim().toLowerCase();
        
        return question.acceptableAnswers.some(answer => 
            normalizedUserAnswer.includes(answer.trim().toLowerCase())
        );
    }

    submitAnswer() {
        const userAnswer = this.answerInputElement.value.trim();
        
        if (!userAnswer) {
            this.showFeedback('请输入答案！', 'incorrect');
            return;
        }

        const isCorrect = this.checkAnswer(userAnswer);

        if (isCorrect) {
            let points = this.usedHint ? 5 : 10;
            this.streak++;
            
            if (this.streak >= 3) {
                points += 5;
                this.showFeedback(`🎉 正确！连击 ${this.streak} 次！奖励 +${points} 分`, 'correct');
            } else {
                this.showFeedback(`🎉 正确！+${points} 分`, 'correct');
            }
            
            this.score += points;
        } else {
            this.streak = 0;
            const question = this.shuffledQuestions[this.currentQuestionIndex];
            this.showFeedback(`❌ 不对哦！正确答案是：${question.answer}`, 'incorrect');
        }

        this.answerInputElement.disabled = true;
        this.submitBtnElement.disabled = true;
        this.updateStats();

        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showQuestion();
        }, 2000);
    }

    useHint() {
        if (this.hints <= 0 || this.usedHint) {
            return;
        }

        const question = this.shuffledQuestions[this.currentQuestionIndex];
        this.hintTextElement.textContent = question.hint;
        this.hintAreaElement.style.display = 'block';
        this.hints--;
        this.usedHint = true;
        this.hintBtnElement.disabled = true;
        this.updateStats();
    }

    skipQuestion() {
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        this.streak = 0;
        this.showFeedback(`跳过！正确答案是：${question.answer}`, 'incorrect');
        
        this.answerInputElement.disabled = true;
        this.submitBtnElement.disabled = true;

        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showQuestion();
        }, 2000);
    }

    showFeedback(message, type) {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = `feedback ${type}`;
    }

    endGame() {
        this.gameAreaElement.classList.remove('active');
        this.resultScreenElement.style.display = 'block';
        this.finalScoreElement.textContent = this.score;

        let message = '';
        if (this.score >= 250) {
            message = '🏆 太厉害了！你是脑力大师！';
        } else if (this.score >= 180) {
            message = '🌟 非常优秀！你的思维很敏捷！';
        } else if (this.score >= 120) {
            message = '👍 不错哦！继续加油！';
        } else if (this.score >= 60) {
            message = '💪 还可以，多练习会更好！';
        } else {
            message = '🌱 别灰心，跳出框框思考！';
        }

        this.resultMessageElement.textContent = message;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BrainTrainingGame();
});