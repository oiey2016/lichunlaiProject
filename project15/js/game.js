const Game = {
    state: {
        mode: null,
        score: 0,
        level: 1,
        currentQuestion: 0,
        correctCount: 0,
        wrongCount: 0,
        streak: 0,
        maxStreak: 0,
        usedIdioms: [],
        usedQuizQuestions: [],
        currentIdiom: null,
        currentQuiz: null,
        timer: null,
        timeLeft: 30,
        totalTime: 0,
        hintsUsed: 0,
        
        wordle: {
            answer: '',
            currentRow: 0,
            currentCol: 0,
            attempts: 6,
            guesses: [],
            keyboardStatus: {},
            gameOver: false
        }
    },

    start(mode) {
        this.resetState();
        this.state.mode = mode;
        this.showScreen(`${mode}-screen`);
        
        switch(mode) {
            case 'guess':
                this.startGuessMode();
                break;
            case 'quiz':
                this.startQuizMode();
                break;
            case 'wordle':
                this.startWordleMode();
                break;
        }
    },

    resetState() {
        this.state.score = 0;
        this.state.level = 1;
        this.state.currentQuestion = 0;
        this.state.correctCount = 0;
        this.state.wrongCount = 0;
        this.state.streak = 0;
        this.state.maxStreak = 0;
        this.state.usedIdioms = [];
        this.state.usedQuizQuestions = [];
        this.state.hintsUsed = 0;
        this.state.totalTime = 0;
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
        this.updateHeader();
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    },

    back() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
        this.showScreen('start-screen');
    },

    restart() {
        this.start(this.state.mode);
    },

    updateHeader() {
        document.getElementById('score').textContent = this.state.score;
        document.getElementById('level').textContent = this.state.level;
    },

    getRandomIdiom() {
        const available = GameData.idioms.filter((_, index) => 
            !this.state.usedIdioms.includes(index)
        );
        
        if (available.length === 0) {
            this.state.usedIdioms = [];
            return this.getRandomIdiom();
        }
        
        const randomIndex = Math.floor(Math.random() * available.length);
        const idiom = available[randomIndex];
        const originalIndex = GameData.idioms.indexOf(idiom);
        this.state.usedIdioms.push(originalIndex);
        
        return idiom;
    },

    getRandomQuizQuestion() {
        const available = GameData.quizQuestions.filter((_, index) => 
            !this.state.usedQuizQuestions.includes(index)
        );
        
        if (available.length === 0) {
            this.state.usedQuizQuestions = [];
            return this.getRandomQuizQuestion();
        }
        
        const randomIndex = Math.floor(Math.random() * available.length);
        const question = available[randomIndex];
        const originalIndex = GameData.quizQuestions.indexOf(question);
        this.state.usedQuizQuestions.push(originalIndex);
        
        return question;
    },

    startGuessMode() {
        this.state.currentQuestion = 1;
        this.nextGuessQuestion();
        this.updateGuessStats();
    },

    nextGuessQuestion() {
        this.state.currentIdiom = this.getRandomIdiom();
        this.state.hintsUsed = 0;
        
        document.getElementById('guess-question-number').textContent = this.state.currentQuestion;
        document.getElementById('guess-description').textContent = this.state.currentIdiom.description;
        document.getElementById('guess-input').value = '';
        document.getElementById('guess-input').focus();
        document.getElementById('hint-display').classList.remove('active');
        document.getElementById('hint-display').textContent = '';
        document.getElementById('guess-result').className = 'result-display';
        document.getElementById('guess-result').style.display = 'none';
    },

    guess() {
        const input = document.getElementById('guess-input').value.trim();
        
        if (input.length !== 4) {
            this.showResult('guess', '请输入4个汉字的成语！', 'wrong');
            return;
        }
        
        if (input === this.state.currentIdiom.word) {
            this.handleGuessCorrect();
        } else {
            this.handleGuessWrong();
        }
    },

    handleGuessCorrect() {
        this.state.correctCount++;
        this.state.streak++;
        if (this.state.streak > this.state.maxStreak) {
            this.state.maxStreak = this.state.streak;
        }
        
        let points = 100;
        if (this.state.streak >= 3) {
            points += 50;
        }
        if (this.state.streak >= 5) {
            points += 50;
        }
        this.state.score += points;
        
        this.updateHeader();
        this.updateGuessStats();
        
        const result = `🎉 太棒了！答案正确！+${points}分\n正确答案：${this.state.currentIdiom.word}\n释义：${this.state.currentIdiom.meaning}`;
        this.showResult('guess', result, 'correct');
        
        setTimeout(() => {
            this.state.currentQuestion++;
            if (this.state.currentQuestion % 5 === 1 && this.state.currentQuestion > 1) {
                this.state.level++;
                this.updateHeader();
            }
            this.nextGuessQuestion();
        }, 2000);
    },

    handleGuessWrong() {
        this.state.wrongCount++;
        this.state.streak = 0;
        this.updateGuessStats();
        
        const result = `😅 答案错误！\n正确答案：${this.state.currentIdiom.word}\n释义：${this.state.currentIdiom.meaning}`;
        this.showResult('guess', result, 'wrong');
        
        setTimeout(() => {
            this.state.currentQuestion++;
            this.nextGuessQuestion();
        }, 3000);
    },

    getHint() {
        if (this.state.hintsUsed >= 2) {
            this.showResult('guess', '提示次数已用完！', 'wrong');
            return;
        }
        
        if (this.state.score < 10) {
            this.showResult('guess', '分数不足，无法使用提示！', 'wrong');
            return;
        }
        
        this.state.score -= 10;
        this.updateHeader();
        
        this.state.hintsUsed++;
        const hint = this.state.hintsUsed === 1 ? 
            this.state.currentIdiom.firstHint : 
            this.state.currentIdiom.secondHint;
        
        const hintDisplay = document.getElementById('hint-display');
        hintDisplay.textContent = `💡 提示${this.state.hintsUsed}：${hint}`;
        hintDisplay.classList.add('active');
    },

    updateGuessStats() {
        document.getElementById('guess-correct').textContent = this.state.correctCount;
        document.getElementById('guess-wrong').textContent = this.state.wrongCount;
        document.getElementById('guess-streak').textContent = this.state.streak;
    },

    startQuizMode() {
        this.state.currentQuestion = 1;
        this.state.timeLeft = 30;
        this.nextQuizQuestion();
        this.updateQuizStats();
    },

    nextQuizQuestion() {
        this.state.currentQuiz = this.getRandomQuizQuestion();
        this.state.timeLeft = 30;
        
        document.getElementById('quiz-question-number').textContent = this.state.currentQuestion;
        document.getElementById('quiz-question').textContent = this.state.currentQuiz.question;
        document.getElementById('quiz-result').className = 'result-display';
        document.getElementById('quiz-result').style.display = 'none';
        
        this.renderQuizOptions();
        this.startTimer();
    },

    renderQuizOptions() {
        const optionsDiv = document.getElementById('quiz-options');
        optionsDiv.innerHTML = '';
        
        this.state.currentQuiz.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-item';
            optionElement.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
            optionElement.onclick = () => this.selectQuizOption(index);
            optionsDiv.appendChild(optionElement);
        });
    },

    startTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
        
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.state.timeLeft;
        timerElement.parentElement.classList.remove('warning');
        
        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            timerElement.textContent = this.state.timeLeft;
            
            if (this.state.timeLeft <= 10) {
                timerElement.parentElement.classList.add('warning');
            }
            
            if (this.state.timeLeft <= 0) {
                clearInterval(this.state.timer);
                this.handleQuizTimeout();
            }
        }, 1000);
    },

    selectQuizOption(selectedIndex) {
        if (this.state.timer) {
            clearInterval(this.state.timer);
        }
        
        this.state.totalTime += (30 - this.state.timeLeft);
        
        const options = document.querySelectorAll('.option-item');
        const correctIndex = this.state.currentQuiz.correct;
        
        options.forEach((option, index) => {
            option.onclick = null;
            if (index === correctIndex) {
                option.classList.add('correct');
            } else if (index === selectedIndex && index !== correctIndex) {
                option.classList.add('wrong');
            }
        });
        
        if (selectedIndex === correctIndex) {
            this.handleQuizCorrect();
        } else {
            this.handleQuizWrong();
        }
    },

    handleQuizCorrect() {
        this.state.correctCount++;
        this.state.streak++;
        if (this.state.streak > this.state.maxStreak) {
            this.state.maxStreak = this.state.streak;
        }
        
        let points = 100;
        if (this.state.timeLeft >= 20) {
            points += 50;
        }
        if (this.state.streak >= 3) {
            points += 50;
        }
        this.state.score += points;
        
        this.updateHeader();
        this.updateQuizStats();
        
        const result = `🎉 太棒了！答案正确！+${points}分\n${this.state.currentQuiz.explanation}`;
        this.showResult('quiz', result, 'correct');
        
        setTimeout(() => {
            this.state.currentQuestion++;
            if (this.state.currentQuestion % 5 === 1 && this.state.currentQuestion > 1) {
                this.state.level++;
                this.updateHeader();
            }
            this.nextQuizQuestion();
        }, 2500);
    },

    handleQuizWrong() {
        this.state.wrongCount++;
        this.state.streak = 0;
        this.updateQuizStats();
        
        const correctOption = this.state.currentQuiz.options[this.state.currentQuiz.correct];
        const result = `😅 答案错误！\n正确答案：${correctOption}\n${this.state.currentQuiz.explanation}`;
        this.showResult('quiz', result, 'wrong');
        
        setTimeout(() => {
            this.state.currentQuestion++;
            this.nextQuizQuestion();
        }, 3000);
    },

    handleQuizTimeout() {
        this.state.wrongCount++;
        this.state.streak = 0;
        this.state.totalTime += 30;
        this.updateQuizStats();
        
        const options = document.querySelectorAll('.option-item');
        const correctIndex = this.state.currentQuiz.correct;
        
        options.forEach((option, index) => {
            option.onclick = null;
            if (index === correctIndex) {
                option.classList.add('correct');
            }
        });
        
        const correctOption = this.state.currentQuiz.options[correctIndex];
        const result = `⏰ 时间到！\n正确答案：${correctOption}\n${this.state.currentQuiz.explanation}`;
        this.showResult('quiz', result, 'wrong');
        
        setTimeout(() => {
            this.state.currentQuestion++;
            this.nextQuizQuestion();
        }, 3000);
    },

    updateQuizStats() {
        document.getElementById('quiz-correct').textContent = this.state.correctCount;
        document.getElementById('quiz-wrong').textContent = this.state.wrongCount;
        document.getElementById('quiz-time').textContent = this.state.totalTime;
    },

    startWordleMode() {
        this.state.wordle = {
            answer: this.getRandomIdiom().word,
            currentRow: 0,
            currentCol: 0,
            attempts: 6,
            guesses: [],
            keyboardStatus: {},
            gameOver: false
        };
        
        document.getElementById('wordle-hint').textContent = 
            `成语释义：${GameData.idioms.find(i => i.word === this.state.wordle.answer).meaning}`;
        document.getElementById('wordle-attempts').textContent = this.state.wordle.attempts;
        
        this.renderWordleGrid();
        this.renderKeyboard();
        this.setupKeyboardListeners();
    },

    renderWordleGrid() {
        const grid = document.getElementById('wordle-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < this.state.wordle.attempts; i++) {
            const row = document.createElement('div');
            row.className = 'wordle-row';
            row.id = `wordle-row-${i}`;
            
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'wordle-cell';
                cell.id = `wordle-cell-${i}-${j}`;
                row.appendChild(cell);
            }
            
            grid.appendChild(row);
        }
    },

    renderKeyboard() {
        const keyboard = document.getElementById('keyboard');
        keyboard.innerHTML = '';
        
        const rows = [
            ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
            ['百', '千', '万', '心', '意', '一', '帆', '风', '顺'],
            ['颜', '色', '上', '下', '全', '美', '发', '中', '方', '计'],
            ['画', '龙', '点', '睛', '守', '株', '待', '兔'],
            ['掩', '耳', '盗', '铃', '亡', '羊', '补', '牢'],
            ['对', '牛', '弹', '琴', '井', '底', '之', '蛙'],
            ['刻', '舟', '求', '剑', '叶', '公', '好', '龙'],
            ['自', '相', '矛', '盾', '滥', '竽', '充', '数'],
            ['杯', '弓', '蛇', '影', '买', '椟', '还', '珠'],
            ['狐', '假', '虎', '威', '蛇', '添', '足', '愚', '公'],
            ['精', '卫', '填', '海', '卧', '薪', '尝', '胆'],
            ['闻', '鸡', '起', '舞', '破', '釜', '沉', '舟'],
            ['完', '璧', '归', '赵', '纸', '上', '谈', '兵'],
            ['指', '鹿', '为', '马'],
            ['退格', '提交']
        ];
        
        rows.forEach((rowChars, rowIndex) => {
            const row = document.createElement('div');
            row.className = 'keyboard-row';
            
            rowChars.forEach(char => {
                const key = document.createElement('button');
                key.className = 'key';
                key.textContent = char;
                key.id = `key-${char}`;
                
                if (char === '退格' || char === '提交') {
                    key.classList.add('key-wide');
                }
                
                key.onclick = () => this.handleKeyPress(char);
                row.appendChild(key);
            });
            
            keyboard.appendChild(row);
        });
    },

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.state.mode !== 'wordle' || this.state.wordle.gameOver) return;
            
            if (e.key === 'Backspace') {
                this.handleKeyPress('退格');
            } else if (e.key === 'Enter') {
                this.handleKeyPress('提交');
            } else if (/^[\u4e00-\u9fa5]$/.test(e.key)) {
                this.handleKeyPress(e.key);
            }
        });
    },

    handleKeyPress(char) {
        if (this.state.wordle.gameOver) return;
        
        if (char === '退格') {
            this.deleteLetter();
        } else if (char === '提交') {
            this.submitWordleGuess();
        } else if (/^[\u4e00-\u9fa5]$/.test(char)) {
            this.addLetter(char);
        }
    },

    addLetter(char) {
        if (this.state.wordle.currentCol >= 4) return;
        
        const cell = document.getElementById(
            `wordle-cell-${this.state.wordle.currentRow}-${this.state.wordle.currentCol}`
        );
        cell.textContent = char;
        cell.classList.add('filled');
        this.state.wordle.currentCol++;
    },

    deleteLetter() {
        if (this.state.wordle.currentCol <= 0) return;
        
        this.state.wordle.currentCol--;
        const cell = document.getElementById(
            `wordle-cell-${this.state.wordle.currentRow}-${this.state.wordle.currentCol}`
        );
        cell.textContent = '';
        cell.classList.remove('filled');
    },

    submitWordleGuess() {
        if (this.state.wordle.currentCol !== 4) {
            this.showResult('wordle', '请输入4个汉字！', 'wrong');
            return;
        }
        
        let guess = '';
        for (let i = 0; i < 4; i++) {
            const cell = document.getElementById(
                `wordle-cell-${this.state.wordle.currentRow}-${i}`
            );
            guess += cell.textContent;
        }
        
        const answer = this.state.wordle.answer;
        const correctPositions = [];
        const presentPositions = [];
        const answerChars = answer.split('');
        const guessChars = guess.split('');
        const answerUsed = new Array(4).fill(false);
        
        for (let i = 0; i < 4; i++) {
            if (guessChars[i] === answerChars[i]) {
                correctPositions.push(i);
                answerUsed[i] = true;
                this.updateKeyboardStatus(guessChars[i], 'correct');
            }
        }
        
        for (let i = 0; i < 4; i++) {
            if (correctPositions.includes(i)) continue;
            
            for (let j = 0; j < 4; j++) {
                if (!answerUsed[j] && guessChars[i] === answerChars[j]) {
                    presentPositions.push(i);
                    answerUsed[j] = true;
                    this.updateKeyboardStatus(guessChars[i], 'present');
                    break;
                }
            }
        }
        
        for (let i = 0; i < 4; i++) {
            if (!correctPositions.includes(i) && !presentPositions.includes(i)) {
                this.updateKeyboardStatus(guessChars[i], 'absent');
            }
        }
        
        for (let i = 0; i < 4; i++) {
            const cell = document.getElementById(
                `wordle-cell-${this.state.wordle.currentRow}-${i}`
            );
            
            if (correctPositions.includes(i)) {
                cell.classList.add('correct');
            } else if (presentPositions.includes(i)) {
                cell.classList.add('present');
            } else {
                cell.classList.add('absent');
            }
        }
        
        if (guess === answer) {
            this.handleWordleWin();
        } else {
            this.state.wordle.currentRow++;
            this.state.wordle.currentCol = 0;
            this.state.wordle.attempts--;
            document.getElementById('wordle-attempts').textContent = this.state.wordle.attempts;
            
            if (this.state.wordle.currentRow >= 6) {
                this.handleWordleLose();
            }
        }
    },

    updateKeyboardStatus(char, status) {
        const key = document.getElementById(`key-${char}`);
        if (!key) return;
        
        if (key.classList.contains('correct')) return;
        
        if (status === 'correct') {
            key.classList.remove('present', 'absent');
            key.classList.add('correct');
        } else if (status === 'present' && !key.classList.contains('correct')) {
            key.classList.remove('absent');
            key.classList.add('present');
        } else if (status === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
            key.classList.add('absent');
        }
    },

    handleWordleWin() {
        this.state.wordle.gameOver = true;
        this.state.correctCount++;
        this.state.streak++;
        if (this.state.streak > this.state.maxStreak) {
            this.state.maxStreak = this.state.streak;
        }
        
        let points = 200;
        const remainingAttempts = 6 - this.state.wordle.currentRow;
        points += remainingAttempts * 50;
        this.state.score += points;
        this.updateHeader();
        
        const result = `🎉 恭喜你猜对了！\n正确答案：${this.state.wordle.answer}\n释义：${GameData.idioms.find(i => i.word === this.state.wordle.answer).meaning}\n剩余次数：${remainingAttempts}次，+${points}分`;
        this.showResult('wordle', result, 'correct');
        
        setTimeout(() => {
            this.showGameOver();
        }, 3000);
    },

    handleWordleLose() {
        this.state.wordle.gameOver = true;
        this.state.wrongCount++;
        this.state.streak = 0;
        
        const result = `😅 游戏结束！\n正确答案：${this.state.wordle.answer}\n释义：${GameData.idioms.find(i => i.word === this.state.wordle.answer).meaning}`;
        this.showResult('wordle', result, 'wrong');
        
        setTimeout(() => {
            this.showGameOver();
        }, 3000);
    },

    showGameOver() {
        document.getElementById('final-score').textContent = this.state.score;
        document.getElementById('final-correct').textContent = this.state.correctCount;
        document.getElementById('final-streak').textContent = this.state.maxStreak;
        
        if (this.state.score >= 500) {
            document.getElementById('game-over-icon').textContent = '🏆';
            document.getElementById('game-over-title').textContent = '太棒了！你是成语达人！';
        } else if (this.state.score >= 300) {
            document.getElementById('game-over-icon').textContent = '🎉';
            document.getElementById('game-over-title').textContent = '做得很好！继续加油！';
        } else {
            document.getElementById('game-over-icon').textContent = '💪';
            document.getElementById('game-over-title').textContent = '继续努力，下次会更好！';
        }
        
        this.showScreen('game-over-screen');
    },

    showResult(mode, message, type) {
        const resultDiv = document.getElementById(`${mode}-result`);
        resultDiv.className = `result-display ${type}`;
        resultDiv.textContent = message;
        resultDiv.style.display = 'block';
        
        if (mode === 'wordle') {
            setTimeout(() => {
                resultDiv.style.display = 'none';
            }, 3000);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const guessInput = document.getElementById('guess-input');
    if (guessInput) {
        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                Game.guess();
            }
        });
    }
});
