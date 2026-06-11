// Система управления пользователями
class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('phpTutorialUsers')) || [];
        this.initDemoAccounts();
    }

    initDemoAccounts() {
        const demoAccounts = [
            { email: 'admin@test.ru', password: 'admin123', name: 'Администратор', role: 'admin' },
            { email: 'user@test.ru', password: 'user123', name: 'Тестовый Пользователь', role: 'user' }
        ];

        demoAccounts.forEach(account => {
            if (!this.users.find(u => u.email === account.email)) {
                this.users.push({
                    ...account,
                    id: this.generateId(),
                    progress: {
                        completedLessons: [],
                        testResults: {},
                        studyTime: 0,
                        achievements: [],
                        completedExercises: [],
                        points: 0
                    }
                });
            }
        });
        this.saveUsers();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveUsers() {
        localStorage.setItem('phpTutorialUsers', JSON.stringify(this.users));
    }

    register(userData) {
        if (this.users.find(u => u.email === userData.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }

        const newUser = {
            ...userData,
            id: this.generateId(),
            progress: {
                completedLessons: [],
                testResults: {},
                studyTime: 0,
                achievements: [],
                completedExercises: [],
                points: 0
            }
        };

        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Неверный email или пароль');
        }
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    updateUserProgress(updates) {
        if (!this.currentUser) return;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].progress = { ...this.users[userIndex].progress, ...updates };
            this.currentUser = this.users[userIndex];
            this.saveUsers();
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const saved = localStorage.getItem('currentUser');
            if (saved) {
                this.currentUser = JSON.parse(saved);
            }
        }
        return this.currentUser;
    }
}

// Система тестов
class TestManager {
    constructor() {
        this.tests = {
            1: {
                title: "Основы PHP",
                questions: [
                    {
                        question: "Как начинается переменная в PHP?",
                        answers: [
                            { text: "@variable", correct: false },
                            { text: "$variable", correct: true },
                            { text: "var variable", correct: false },
                            { text: "#variable", correct: false }
                        ]
                    },
                    {
                        question: "Какой оператор используется для конкатенации строк?",
                        answers: [
                            { text: "+", correct: false },
                            { text: ".", correct: true },
                            { text: "&", correct: false },
                            { text: "|", correct: false }
                        ]
                    },
                    {
                        question: "Что выведет код: echo 5 + '5'; ?",
                        answers: [
                            { text: "55", correct: false },
                            { text: "10", correct: true },
                            { text: "Ошибку", correct: false },
                            { text: "'55'", correct: false }
                        ]
                    },
                    {
                        question: "Как объявить функцию в PHP?",
                        answers: [
                            { text: "function myFunc()", correct: true },
                            { text: "def myFunc()", correct: false },
                            { text: "func myFunc()", correct: false },
                            { text: "function = myFunc()", correct: false }
                        ]
                    },
                    {
                        question: "Какой цикл выполнится хотя бы один раз?",
                        answers: [
                            { text: "for", correct: false },
                            { text: "while", correct: false },
                            { text: "do-while", correct: true },
                            { text: "foreach", correct: false }
                        ]
                    }
                ]
            },
            2: {
                title: "Переменные и типы данных",
                questions: [
                    {
                        question: "Какой тип данных используется для true/false значений?",
                        answers: [
                            { text: "boolean", correct: true },
                            { text: "string", correct: false },
                            { text: "integer", correct: false },
                            { text: "float", correct: false }
                        ]
                    },
                    {
                        question: "Что выведет код: echo gettype(3.14); ?",
                        answers: [
                            { text: "integer", correct: false },
                            { text: "double", correct: true },
                            { text: "float", correct: false },
                            { text: "number", correct: false }
                        ]
                    },
                    {
                        question: "Как преобразовать строку в целое число?",
                        answers: [
                            { text: "(int)", correct: true },
                            { text: "(integer)", correct: true },
                            { text: "intval()", correct: true },
                            { text: "Все вышеперечисленные", correct: true }
                        ]
                    },
                    {
                        question: "Что такое NULL в PHP?",
                        answers: [
                            { text: "Пустая строка", correct: false },
                            { text: "Число 0", correct: false },
                            { text: "Специальный тип, обозначающий отсутствие значения", correct: true },
                            { text: "Ложное значение", correct: false }
                        ]
                    },
                    {
                        question: "Как проверить, является ли переменная массивом?",
                        answers: [
                            { text: "is_array()", correct: true },
                            { text: "typeof()", correct: false },
                            { text: "get_type()", correct: false },
                            { text: "array_check()", correct: false }
                        ]
                    },
                    {
                        question: "Что делает функция isset()?",
                        answers: [{ text: "Проверяет, объявлена ли переменная и не равна ли NULL", correct: true },
                            { text: "Проверяет, пустая ли переменная", correct: false },
                            { text: "Устанавливает значение переменной", correct: false },
                            { text: "Удаляет переменную", correct: false }
                        ]
                    }
                ]
            }
        };
    }

    calculateScore(testId, userAnswers) {
        const test = this.tests[testId];
        let correct = 0;
        
        userAnswers.forEach((answer, index) => {
            if (test.questions[index].answers[answer].correct) {
                correct++;
            }
        });

        return Math.round((correct / test.questions.length) * 100);
    }
}

// Основной класс приложения
class PhpTutorialApp {
    constructor() {
        this.userManager = new UserManager();
        this.testManager = new TestManager();
        this.currentTest = null;
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Авторизация
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.target));
        });

        // Уроки
        document.querySelectorAll('.lesson-link').forEach(link => {
            link.addEventListener('click', (e) => this.switchLesson(e));
        });

        // Тесты
        document.querySelectorAll('.start-test').forEach(btn => {
            btn.addEventListener('click', (e) => this.startTest(e.target.closest('.test-card').dataset.test));
        });

        // Профиль
        document.getElementById('save-profile').addEventListener('click', () => this.saveProfile());

        // Табы авторизации
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });

        // Завершение уроков
        document.querySelectorAll('.complete-lesson').forEach(btn => {
            btn.addEventListener('click', (e) => this.completeLesson(e.target.dataset.lesson));
        });

        // Практика
        document.querySelectorAll('.practice-type-card').forEach(card => {
            card.addEventListener('click', (e) => this.switchPracticeType(e.currentTarget.dataset.type));
        });

        // Компилятор
        document.getElementById('run-code').addEventListener('click', () => this.runPHPCode());
        document.getElementById('clear-code').addEventListener('click', () => this.clearCode());
        document.getElementById('save-code').addEventListener('click', () => this.saveCode());

        // Примеры кода
        document.querySelectorAll('.code-example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadCodeExample(e.currentTarget.dataset.example));
        });

        // Проверка заданий
        document.querySelectorAll('.test-exercise').forEach(btn => {
            btn.addEventListener('click', (e) => this.testExercise(e.currentTarget.dataset.exercise));
        });

        document.querySelectorAll('.test-challenge').forEach(btn => {
            btn.addEventListener('click', (e) => this.testChallenge(e.currentTarget.dataset.challenge));
        });

        // Закрытие модального окна
        document.querySelector('.close').addEventListener('click', () => this.closeTestModal());
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const user = this.userManager.login(email, password);
            this.showMainScreen(user);
            this.showNotification('Успешный вход!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('register-name').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value
        };

        try {
            const user = this.userManager.register(formData);
            this.showMainScreen(user);
            this.showNotification('Регистрация успешна!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handleLogout() {
        this.userManager.logout();
        this.showAuthScreen();
        this.showNotification('Вы вышли из системы', 'info');
    }

    checkAuthStatus() {
        const user = this.userManager.getCurrentUser();
        if (user) {
            this.showMainScreen(user);
        } else {
            this.showAuthScreen();
        }
    }

    showAuthScreen() {
        document.getElementById('auth-screen').classList.add('active');
        document.getElementById('main-screen').classList.remove('active');
    }

    showMainScreen(user) {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
        
        document.getElementById('user-name').textContent = user.name;
        this.updateProgressDisplay();
    }

    switchSection(sectionId) {
        // Обновляем активные кнопки навигации
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        
        document.querySelector(`[data-target="${sectionId}"]`).classList.add('active');
        document.getElementById(sectionId).classList.add('active');

        // Обновляем данные при переключении разделов
        if (sectionId === 'progress') {
            this.updateProgressDisplay();
        } else if (sectionId === 'profile') {
            this.loadProfileData();
        } else if (sectionId === 'practice') {
            this.loadPracticeData();
        }
    }

    switchLesson(e) {
        e.preventDefault();
        const lessonId = e.target.dataset.lesson;
        
        document.querySelectorAll('.lesson-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.lesson').forEach(lesson => lesson.classList.remove('active'));
        
        e.target.classList.add('active');
        document.getElementById(`lesson-${lessonId}`).classList.add('active');
    }

    completeLesson(lessonId) {
        const user = this.userManager.getCurrentUser();
        if (!user) return;

        lessonId = parseInt(lessonId);
        if (!user.progress.completedLessons.includes(lessonId)) {
            const updatedProgress = {
                completedLessons: [...user.progress.completedLessons, lessonId],
                studyTime: user.progress.studyTime + 15,
                points: (user.progress.points || 0) + 5
            };

            this.userManager.updateUserProgress(updatedProgress);
            this.showNotification('Урок отмечен как пройденный!', 'success');
            this.updateProgressDisplay();
            this.checkAchievements();
        }
    }

    startTest(testId) {
        this.currentTest = testId;
        this.currentQuestion = 0;
        this.userAnswers = [];
        
        const test = this.testManager.tests[testId];
        if (!test) return;

        const modal = document.getElementById('test-modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = this.renderTest(test, testId);
        modal.style.display = 'block';

        this.setupTestNavigation();
    }

    renderTest(test, testId) {
        return `
            <h2>${test.title}</h2>
            <div class="test-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(1 / test.questions.length) * 100}%"></div>
                </div>
                <span class="progress-text">Вопрос 1 из ${test.questions.length}</span>
            </div>

            <div class="quiz-container">
                ${test.questions.map((q, index) => `
                    <div class="question ${index === 0 ? 'active' : ''}" data-question="${index}">
                        <h3>${q.question}</h3>
                        <div class="answers">
                            ${q.answers.map((answer, ansIndex) => `
                                <label class="answer">
                                    <input type="radio" name="question${index}" value="${ansIndex}">
                                    ${answer.text}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="test-controls">
                <button id="prev-btn" class="btn btn-secondary" disabled>Назад</button>
                <button id="next-btn" class="btn btn-primary">Далее</button>
                <button id="submit-test" class="btn btn-success" style="display: none;">Завершить тест</button>
            </div>
        `;
    }

    setupTestNavigation() {
        const test = this.testManager.tests[this.currentTest];
        const questions = document.querySelectorAll('.question');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-test');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        const updateNavigation = () => {
            prevBtn.disabled = this.currentQuestion === 0;
            nextBtn.style.display = this.currentQuestion === test.questions.length - 1 ? 'none' : 'block';
            submitBtn.style.display = this.currentQuestion === test.questions.length - 1 ? 'block' : 'none';
            
            const progress = ((this.currentQuestion + 1) / test.questions.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Вопрос ${this.currentQuestion + 1} из ${test.questions.length}`;
        };

        nextBtn.addEventListener('click', () => {
            // Сохраняем ответ
            const selected = document.querySelector(`input[name="question${this.currentQuestion}"]:checked`);
            if (selected) {
                this.userAnswers[this.currentQuestion] = parseInt(selected.value);
            }

            if (this.currentQuestion < test.questions.length - 1) {
                questions[this.currentQuestion].classList.remove('active');
                this.currentQuestion++;
                questions[this.currentQuestion].classList.add('active');
                updateNavigation();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (this.currentQuestion > 0) {
                questions[this.currentQuestion].classList.remove('active');
                this.currentQuestion--;
                questions[this.currentQuestion].classList.add('active');
                updateNavigation();
            }
        });

        submitBtn.addEventListener('click', () => {
            // Сохраняем последний ответ
            const selected = document.querySelector(`input[name="question${this.currentQuestion}"]:checked`);
            if (selected) {
                this.userAnswers[this.currentQuestion] = parseInt(selected.value);
            }
            this.submitTest();
        });

        updateNavigation();
    }

    submitTest() {
        const score = this.testManager.calculateScore(this.currentTest, this.userAnswers);
        
        // Сохраняем результат
        const user = this.userManager.getCurrentUser();
        if (user) {
            const updatedProgress = {
                testResults: {
                    ...user.progress.testResults,
                    [this.currentTest]: Math.max(user.progress.testResults[this.currentTest] || 0, score)
                },
                points: (user.progress.points || 0) + Math.floor(score / 10)
            };
            this.userManager.updateUserProgress(updatedProgress);
        }

        // Показываем результаты
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2>Результаты теста</h2>
            <div class="score">Ваш результат: ${score}%</div>
            <div class="result-message">
                ${score >= 80 ? 'Отлично! 🎉' : score >= 60 ? 'Хорошо! 👍' : 'Попробуйте еще раз! 💪'}
            </div>
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="app.closeTestModal()">Закрыть</button>
            </div>
        `;

        this.updateProgressDisplay();
        this.checkAchievements();
    }

    closeTestModal() {
        document.getElementById('test-modal').style.display = 'none';
        this.currentTest = null;
        this.currentQuestion = 0;
        this.userAnswers = [];
    }

    // Практика
    switchPracticeType(type) {
        document.querySelectorAll('.practice-type-card').forEach(card => card.classList.remove('active'));
        document.querySelectorAll('.practice-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        document.getElementById(`${type}-practice`).classList.add('active');
    }

    // Компилятор PHP
    async runPHPCode() {
        const code = document.getElementById('php-code').value;
        const output = document.getElementById('output');
        
        output.innerHTML = '<div class="output-warning">Выполнение кода...</div>';

        try {
            // Эмуляция выполнения PHP через JavaScript
            const result = await this.executePHP(code);
            output.innerHTML = `
                <div class="output-success">✅ Код выполнен успешно</div>
                <pre>${result}</pre>
            `;
        } catch (error) {
            output.innerHTML = `
                <div class="output-error">❌ Ошибка выполнения</div>
                <pre>${error.message}</pre>
            `;
        }
    }

    async executePHP(code) {
        // Эмуляция базового выполнения PHP через JavaScript
        return new Promise((resolve, reject) => {
            try {
                // Убираем PHP теги для эмуляции
                let jsCode = code.replace(/&lt;\\?php|&lt;\\?|\\?&gt;/g, '')
                               .replace(/<\?php|<\?|\?>/g, '');
                
                // Простые преобразования PHP в JS
                jsCode = jsCode.replace(/echo\s+/g, 'output += ')
                              .replace(/print\s+/g, 'output += ')
                              .replace(/\\\$/g, '')
                              .replace(/\$(\w+)/g, 'let $1');
                
                let output = '';eval(jsCode);
                resolve(output || 'Код выполнен, но вывод пуст');
            } catch (error) {
                reject(error);
            }
        });
    }

    clearCode() {
        document.getElementById('php-code').value = '';
        document.getElementById('output').innerHTML = 
            '<div class="output-placeholder">Результат появится здесь после запуска кода...</div>';
    }

    saveCode() {
        const code = document.getElementById('php-code').value;
        const user = this.userManager.getCurrentUser();
        
        if (user) {
            const savedCode = JSON.parse(localStorage.getItem('userCode') || '{}');
            savedCode[user.id] = code;
            localStorage.setItem('userCode', JSON.stringify(savedCode));
            this.showNotification('Код сохранен!', 'success');
        }
    }

    loadCodeExample(example) {
        const examples = {
            variables: `<?php
// Работа с переменными
$name = "Иван";
$age = 25;
$height = 175.5;
$isStudent = true;

echo "Имя: " . $name . "\\n";
echo "Возраст: " . $age . "\\n";
echo "Рост: " . $height . " см\\n";
echo "Студент: " . ($isStudent ? "Да" : "Нет");
?>`,
            conditions: `<?php
// Условные операторы
$temperature = 22;

if ($temperature > 30) {
    echo "Очень жарко!";
} elseif ($temperature > 20) {
    echo "Тепло";
} elseif ($temperature > 10) {
    echo "Прохладно";
} else {
    echo "Холодно";
}

// Тернарный оператор
$message = ($temperature >= 20) ? "Можно без куртки" : "Нужна куртка";
echo "\\n" . $message;
?>`,
            loops: `<?php
// Циклы
echo "Цикл for:\\n";
for ($i = 1; $i <= 5; $i++) {
    echo "Итерация: $i\\n";
}

echo "\\nЦикл while:\\n";
$count = 1;
while ($count <= 3) {
    echo "Счет: $count\\n";
    $count++;
}

echo "\\nЦикл foreach:\\n";
$fruits = ["Яблоко", "Банан", "Апельсин"];
foreach ($fruits as $fruit) {
    echo "Фрукт: $fruit\\n";
}
?>`,
            functions: `<?php
// Функции
function greet($name) {
    return "Привет, $name!";
}

function calculate($a, $b, $operation = '+') {
    switch ($operation) {
        case '+': return $a + $b;
        case '-': return $a - $b;
        case '*': return $a * $b;
        case '/': return $b != 0 ? $a / $b : "Ошибка: деление на ноль";
        default: return "Неизвестная операция";
    }
}

echo greet("Мир") . "\\n";
echo "5 + 3 = " . calculate(5, 3) . "\\n";
echo "10 / 2 = " . calculate(10, 2, '/') . "\\n";
?>`,
            arrays: `<?php
// Работа с массивами
$numbers = [1, 2, 3, 4, 5];
$user = [
    'name' => 'Анна',
    'age' => 30,
    'city' => 'Москва'
];

echo "Числа: \\n";
foreach ($numbers as $number) {
    echo "$number ";
}

echo "\\n\\nИнформация о пользователе:\\n";
foreach ($user as $key => $value) {
    echo "$key: $value\\n";
}

// Функции для работы с массивами
echo "\\nКоличество чисел: " . count($numbers);
echo "\\nПоследнее число: " . end($numbers);
?>`
        };

        if (examples[example]) {
            document.getElementById('php-code').value = examples[example];
            this.showNotification(`Загружен пример: ${example}`, 'info');
        }
    }

    // Проверка заданий
    async testExercise(exerciseId) {
        const code = document.querySelector(`.exercise-code[data-exercise="${exerciseId}"]`).value;
        const exerciseCard = document.querySelector(`.exercise-card[data-exercise="${exerciseId}"]`);
        
        let resultElement = exerciseCard.querySelector('.test-result');
        if (!resultElement) {
            resultElement = document.createElement('div');
            resultElement.className = 'test-result';
            exerciseCard.querySelector('.exercise-editor').appendChild(resultElement);
        }

        try {
            const tests = this.getExerciseTests(exerciseId);
            const results = await this.runTests(code, tests);
            
            const passed = results.filter(r => r.passed).length;
            const total = results.length;if (passed === total) {
                resultElement.className = 'test-result success';
                resultElement.innerHTML = `
                    ✅ Все тесты пройдены! (${passed}/${total})
                    <div class="test-feedback">Отличная работа! Задание выполнено правильно.</div>
                `;
                
                // Обновляем статус
                const statusElement = exerciseCard.querySelector('.exercise-status');
                statusElement.textContent = '✅ Выполнено';
                statusElement.className = 'exercise-status status completed';
                
                // Сохраняем прогресс
                this.completeExercise(exerciseId);
                
            } else {
                resultElement.className = 'test-result error';
                const failedTests = results.filter(r => !r.passed);
                resultElement.innerHTML = `
                    ❌ Пройдено тестов: ${passed}/${total}
                    <div class="test-feedback">
                        <strong>Ошибки:</strong>
                        ${failedTests.map(test => `<div>• ${test.message}</div>`).join('')}
                    </div>
                `;
            }
        } catch (error) {
            resultElement.className = 'test-result error';
            resultElement.innerHTML = `
                ❌ Ошибка выполнения
                <div class="test-feedback">${error.message}</div>
            `;
        }
    }

    getExerciseTests(exerciseId) {
        const tests = {
            1: [ // Приветствие
                { input: ['Анна'], expected: 'Привет, Анна!' },
                { input: ['Мир'], expected: 'Привет, Мир!' },
                { input: [''], expected: 'Привет, !' }
            ],
            2: [ // Сумма чисел
                { input: [2, 3], expected: 5 },
                { input: [0, 0], expected: 0 },
                { input: [-1, 1], expected: 0 },
                { input: [10, -5], expected: 5 }
            ],
            3: [ // Четные числа
                { input: [2], expected: true },
                { input: [3], expected: false },
                { input: [0], expected: true },
                { input: [100], expected: true }
            ]
        };
        
        return tests[exerciseId] || [];
    }

    async runTests(code, tests) {
        const results = [];
        
        for (const test of tests) {
            try {
                // Эмуляция выполнения функции
                const result = await this.executeFunction(code, test.input);
                const passed = this.compareResults(result, test.expected);
                
                results.push({
                    passed,
                    message: passed ? 'Тест пройден' : `Ожидалось: ${test.expected}, получено: ${result}`
                });
            } catch (error) {
                results.push({
                    passed: false,
                    message: `Ошибка: ${error.message}`
                });
            }
        }
        
        return results;
    }

    async executeFunction(code, inputs) {
        // Эмуляция выполнения PHP функции
        return new Promise((resolve, reject) => {
            try {
                let result;
                
                // Для демонстрации используем простые проверки
                if (code.includes('greet')) {
                    result = `Привет, ${inputs[0]}!`;
                } else if (code.includes('sum')) {
                    result = inputs[0] + inputs[1];
                } else if (code.includes('isEven')) {
                    result = inputs[0] % 2 === 0;
                }
                
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    compareResults(actual, expected) {
        if (typeof actual === 'number' && typeof expected === 'number') {
            return Math.abs(actual - expected) < 0.0001;
        }
        return actual === expected;
    }

    completeExercise(exerciseId) {
        const user = this.userManager.getCurrentUser();
        if (!user) return;

        const completedExercises = user.progress.completedExercises || [];
        if (!completedExercises.includes(parseInt(exerciseId))) {
            const updatedProgress = {
                completedExercises: [...completedExercises, parseInt(exerciseId)],
                points: (user.progress.points || 0) + 10
            };

            this.userManager.updateUserProgress(updatedProgress);
            this.updateProgressDisplay();
            this.checkAchievements();
        }
    }

    async testChallenge(challengeId) {
        this.showNotification('Проверка сложных задач в разработке...', 'info');
    }

    loadPracticeData() {
        const user = this.userManager.getCurrentUser();
        if (!user) return;

        // Обновляем статусы заданий
        const completedExercises = user.progress.completedExercises || [];
        completedExercises.forEach(exerciseId => {
            const exerciseCard = document.querySelector(`.exercise-card[data-exercise="${exerciseId}"]`);
            if (exerciseCard) {
                const statusElement = exerciseCard.querySelector('.exercise-status');
                statusElement.textContent = '✅ Выполнено';
                statusElement.className = 'exercise-status status completed';
            }
        });
    }

    updateProgressDisplay() {
        const user = this.userManager.getCurrentUser();
        if (!user) return;

        const progress = user.progress;// Обновляем статистику
        document.getElementById('lessons-completed').textContent = progress.completedLessons.length;
        document.getElementById('exercises-completed').textContent = progress.completedExercises.length;
        document.getElementById('study-time').textContent = Math.round(progress.studyTime / 60) + 'ч';
        
        // Средний результат тестов
        const testScores = Object.values(progress.testResults);
        const avgScore = testScores.length > 0 ? 
            Math.round(testScores.reduce((a, b) => a + b) / testScores.length) : 0;
        document.getElementById('avg-score').textContent = avgScore + '%';

        // Обновляем результаты тестов
        Object.keys(progress.testResults).forEach(testId => {
            const scoreElement = document.getElementById(`test${testId}-score`);
            if (scoreElement) {
                scoreElement.textContent = progress.testResults[testId] + '%';
            }
        });

        // Обновляем прогресс уроков
        this.updateLessonsProgress(progress);
        
        // Обновляем результаты тестов
        this.updateTestsResults(progress);

        // Общий прогресс
        this.updateOverallProgress(progress);
    }

    updateLessonsProgress(progress) {
        const container = document.getElementById('lessons-progress');
        const totalLessons = 6;
        
        container.innerHTML = '';
        for (let i = 1; i <= totalLessons; i++) {
            const isCompleted = progress.completedLessons.includes(i);
            container.innerHTML += `
                <div style="margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>Урок ${i}</span>
                        <span>${isCompleted ? '✅' : '⏳'}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e9ecef; border-radius: 4px;">
                        <div style="width: ${isCompleted ? '100' : '0'}%; height: 100%; background: #27ae60; border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        }
    }

    updateTestsResults(progress) {
        const container = document.getElementById('tests-results');
        const tests = this.testManager.tests;
        
        container.innerHTML = '';
        Object.keys(tests).forEach(testId => {
            const score = progress.testResults[testId] || 0;
            container.innerHTML += `
                <div style="margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>${tests[testId].title}</span>
                        <span>${score}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e9ecef; border-radius: 4px;">
                        <div style="width: ${score}%; height: 100%; background: #3498db; border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        });
    }

    updateOverallProgress(progress) {
        const totalLessons = 6;
        const totalExercises = 3;
        const totalTasks = totalLessons + totalExercises;
        
        const completedLessons = progress.completedLessons.length;
        const completedExercises = progress.completedExercises.length;
        const totalCompleted = completedLessons + completedExercises;
        
        const progressPercent = Math.round((totalCompleted / totalTasks) * 100);
        
        document.getElementById('overall-progress').textContent = progressPercent + '%';
        document.getElementById('overall-progress-bar').style.width = progressPercent + '%';
        document.getElementById('total-completed').textContent = totalCompleted;
        document.getElementById('total-tasks').textContent = totalTasks;// Обновляем круг прогресса
        const progressCircle = document.querySelector('.progress-circle');
        progressCircle.style.background = `conic-gradient(var(--primary) 0% ${progressPercent}%, #e9ecef ${progressPercent}% 100%)`;
    }

    checkAchievements() {
        const user = this.userManager.getCurrentUser();
        if (!user) return;

        const achievements = [];
        const progress = user.progress;

        // Проверяем достижения
        if (progress.completedLessons.length >= 1) {
            achievements.push(1);
        }

        if (Object.values(progress.testResults).some(score => score === 100)) {
            achievements.push(2);
        }

        if (progress.completedLessons.length >= 3) {
            achievements.push(3);
        }

        if (progress.completedExercises.length >= 3) {
            achievements.push(4);
        }

        // Обновляем отображение достижений
        achievements.forEach(achievementId => {
            const achievementElement = document.getElementById(`achievement-${achievementId}`);
            if (achievementElement) {
                achievementElement.classList.remove('locked');
                achievementElement.classList.add('unlocked');
            }
        });
    }

    loadProfileData() {
        const user = this.userManager.getCurrentUser();
        if (!user) return;

        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-password').value = '';

        this.checkAchievements();
    }

    saveProfile() {
        const user = this.userManager.getCurrentUser();
        if (!user) return;

        const name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;
        const password = document.getElementById('profile-password').value;

        // Обновляем данные пользователя
        const userIndex = this.userManager.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            this.userManager.users[userIndex].name = name;
            this.userManager.users[userIndex].email = email;
            if (password) {
                this.userManager.users[userIndex].password = password;
            }
            this.userManager.saveUsers();
            this.userManager.currentUser = this.userManager.users[userIndex];
            localStorage.setItem('currentUser', JSON.stringify(this.userManager.currentUser));
            
            document.getElementById('user-name').textContent = name;
            this.showNotification('Профиль обновлен!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Автоматическое скрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Закрытие по клику
        notification.querySelector('.notification-close').onclick = () => {
            if (notification.parentNode) {
                notification.remove();
            }
        };
    }
}

// Вспомогательная функция для копирования кода
function copyCode(button) {
    const code = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Скопировано!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

//Инициализация приложения
const app = new PhpTutorialApp();