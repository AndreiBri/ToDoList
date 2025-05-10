const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const completedList = document.getElementById('completed-list');
const filterAllBtn = document.getElementById('filter-all');
const filterTodoBtn = document.getElementById('filter-todo');
const filterCompletedBtn = document.getElementById('filter-completed');
const taskCounter = document.getElementById('task-counter');
const prioritySelect = document.getElementById('priority-select');

function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

window.onload = function() {
    if (isLocalStorageAvailable()) {
        loadTasks();
    }
};

addButton.addEventListener('click', function() {
    const task = todoInput.value.trim();
    const priority = prioritySelect.value;
    if (task !== '') {
        addTask(task, false, priority);
        todoInput.value = '';
        saveTasks();
    } else {
        alert("Please enter a task!");
    }
});

todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addButton.click();
    }
});

function addTask(task, completed, priority) {
    const li = document.createElement('li');
    li.draggable = true;

    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);

    const taskSpan = document.createElement('span');
    taskSpan.textContent = task;
    li.appendChild(taskSpan);

    const prioritySpan = document.createElement('span');
    prioritySpan.textContent = `(${priority})`;
    prioritySpan.classList.add('priority');
    li.appendChild(prioritySpan);

    addTaskButtons(li, completed);

    if (completed) {
        completedList.appendChild(li);
    } else {
        todoList.appendChild(li);
    }

    updateCounter();
    sortTasks(todoList);
}

function addTaskButtons(li, completed) {
    const taskText = li.querySelector('span').textContent.trim();
    const priority = li.querySelector('.priority').textContent.trim().replace(/[()]/g, '');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-btn');
    removeButton.onclick = function() {
        li.remove();
        saveTasks();
        updateCounter();
    };

    if (completed) {
        const restoreButton = document.createElement('button');
        restoreButton.textContent = 'Restore';
        restoreButton.classList.add('restore-btn');
        restoreButton.onclick = function() {
            li.remove();
            addTask(taskText, false, priority);
            saveTasks();
            updateCounter();
        };
        buttonContainer.appendChild(restoreButton);
    } else {
        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete';
        completeButton.classList.add('complete-btn');
        completeButton.onclick = function() {
            li.remove();
            addTask(taskText, true, priority);
            saveTasks();
            updateCounter();
        };
        buttonContainer.appendChild(completeButton);
    }

    buttonContainer.appendChild(removeButton);
    li.appendChild(buttonContainer);
}

function updateTaskButtons(li, parentList) {
    const taskText = li.querySelector('span').textContent.trim();
    const priority = li.querySelector('.priority').textContent.trim().replace(/[()]/g, '');

    const oldButtonContainer = li.querySelector('.button-container');
    if (oldButtonContainer) {
        oldButtonContainer.remove();
    }

    addTaskButtons(li, parentList.id === 'completed-list');
}

function saveTasks() {
    const tasks = {
        todo: [],
        completed: []
    };

    todoList.querySelectorAll('li').forEach(li => {
        const taskText = li.querySelector('span').textContent.trim();
        const priority = li.querySelector('.priority').textContent.trim().replace(/[()]/g, '');
        tasks.todo.push({ taskText, priority });
    });

    completedList.querySelectorAll('li').forEach(li => {
        const taskText = li.querySelector('span').textContent.trim();
        const priority = li.querySelector('.priority').textContent.trim().replace(/[()]/g, '');
        tasks.completed.push({ taskText, priority });
    });

    if (isLocalStorageAvailable()) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        const tasks = JSON.parse(saved);
        tasks.todo.forEach(task => addTask(task.taskText, false, task.priority));
        tasks.completed.forEach(task => addTask(task.taskText, true, task.priority));
    }
}

function sortTasks(list) {
    const tasks = Array.from(list.querySelectorAll('li'));
    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };

    tasks.sort((a, b) => {
        const priorityA = a.querySelector('.priority').textContent.trim().replace(/[()]/g, '');
        const priorityB = b.querySelector('.priority').textContent.trim().replace(/[()]/g, '');
        return priorityOrder[priorityA] - priorityOrder[priorityB];
    });

    tasks.forEach(task => list.appendChild(task));
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (this.parentElement && draggedItem) {
        this.parentElement.insertBefore(draggedItem, this);
        updateTaskButtons(draggedItem, this.parentElement);
        sortTasks(todoList);
        sortTasks(completedList);
        saveTasks();
        updateCounter();
    }
}

const themeToggleButton = document.getElementById('theme-toggle');
let isDarkMode = localStorage.getItem('theme') === 'dark';

function setTheme() {
    const sunIcon = document.createElement('i');
    sunIcon.classList.add('fas', 'fa-sun');
    const moonIcon = document.createElement('i');
    moonIcon.classList.add('fas', 'fa-moon');

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        themeToggleButton.innerHTML = '';
        themeToggleButton.appendChild(moonIcon);
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeToggleButton.innerHTML = '';
        themeToggleButton.appendChild(sunIcon);
    }
}

themeToggleButton.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    setTheme();
});

setTheme();

function updateCounter() {
    const totalTasks = todoList.querySelectorAll('li').length + completedList.querySelectorAll('li').length;
    const completedTasks = completedList.querySelectorAll('li').length;
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    taskCounter.textContent = `${completedTasks} su ${totalTasks} completati (${percentage}%)`;
}

filterAllBtn.addEventListener('click', function() {
    todoList.style.display = 'block';
    completedList.style.display = 'block';
    updateCounter();
});

filterTodoBtn.addEventListener('click', function() {
    todoList.style.display = 'block';
    completedList.style.display = 'none';
    updateCounter();
});

filterCompletedBtn.addEventListener('click', function() {
    todoList.style.display = 'none';
    completedList.style.display = 'block';
    updateCounter();
});
* {
    box-sizing: border-box;
}
@media (max-width: 600px) {
    li {
        flex-direction: column;
        align-items: stretch;
    }
    li button {
        width: 100%;
    }
}

html, body {
    height: 100%;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;  /* Center everything vertically */
    min-height: 100vh;  /* Ensures the body takes full viewport height */
}

.header {
    padding: 10px;
    padding-bottom: 20px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: space-between;  /* Centers content horizontally */
    width: 100%;  /* Ensures header takes full width */
    max-width: 800px;  /* Optional, max width of header */
}

h1 {
    margin: 0;
    margin-left: 10px; /* Aggiungi spazio tra il bottone e il titolo */
    flex-grow: 1; /* Rende l'header espandibile e il titolo si allinea a sinistra */
    font-size: 32px; /* Puoi regolare la dimensione del testo se necessario */
}

.add-task-section {
    display: flex;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    width: 100%;
    max-width: 600px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 50px;
    position: relative;
    left: 200px;
}

input, button {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #4caf50;
}

.todo-columns-container {
    display: flex;
    justify-content: space-between;
    width: 1000px;
    max-width: 12000px;  /* Puoi mantenere o rimuovere questo se desideri */
    gap: 20px;
    margin: 0 auto;
    height: 1000px;
}

.todo-columns {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 20px;
    margin: 0 auto;
    flex-wrap: wrap; /* Permette di andare a capo se non c'è abbastanza spazio */
}

.todo-column ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    max-width: 100%; /* Assicurati che la lista possa espandersi */
}
.todo-column h2 {
    text-align: center;
}

.todo-column {
    background-color: #111;
    padding: 20px;
    border-radius: 8px;
    overflow-y: auto;
    max-height: 1000px;
    width: calc(50% - 20px); /* Impostiamo la larghezza delle colonne */
}
.todo-column ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

li {
    background-color: #222;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    word-wrap: break-word;
}

li span {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: normal;
    overflow: hidden;
    display: block;
    width: 100%;
    word-wrap: break-word;
    flex: 1;   /* occupa spazio */
    margin-right: 10px;

}

li .button-container {
    display: flex;
    justify-content: flex-start;
    gap: 5px;
    margin-top: 5px;
    flex-wrap: nowrap;
}
.todo-list, .completed-tasks {
    max-height: none;        /* togli eventuale limite altezza */
    overflow: visible;
}

li button {
    padding: 5px 8px;
    font-size: 12px;
    border-radius: 4px;
    color: white;
    min-width: 60px;
    flex-shrink: 0;
}

button.remove-btn {
    background-color: #ff4d4d;
}

button.complete-btn {
    background-color: #4caf50;
}

button.restore-btn {
    background-color: #2196f3;
}


ul {
    padding: 0;
    margin: 0;
}

.add-task-section.light-mode,
.todo-columns-container.light-mode,
.todo-column.light-mode,
.todo-column li.light-mode {
    background-color: #ffffff;
    color: #333;
    border: 1px solid #ccc;
}

/* Modalità Dark */
body.dark-mode {
    background-color: #1f1f1f;
    color: #f0f0f0;
}

.add-task-section.dark-mode {
    background-color: #2a2a2a;
    border: 1px solid #555;
}

.todo-columns-container.dark-mode {
    background-color: #2a2a2a;
}

.todo-column.dark-mode {
    background-color: #333;
    border: 1px solid #555;
}

.todo-column li.dark-mode {
    background-color: #3d3d3d;
    color: #f0f0f0;
    border: 1px solid #555;
}

h1, h2 {
    color: inherit;
}

button.light-mode {
    background-color: #4caf50;
    color: white;
}

button.dark-mode {
    background-color: #555;
    color: white;
}

button.remove-btn {
    background-color: #e74c3c;
}

button.complete-btn {
    background-color: #27ae60;
}

button.restore-btn {
    background-color: #2980b9;
}

/* Pulsanti in dark mode */
button.dark-mode.remove-btn {
    background-color: #e74c3c;
}

button.dark-mode.complete-btn {
    background-color: #27ae60;
}

button.dark-mode.restore-btn {
    background-color: #2980b9;
}

/* Lista task e comportamento testo */
ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin: 5px 0;
    border-radius: 4px;
    width: 100%;
    word-wrap: break-word;
}

li span {
    flex-grow: 1;
    word-wrap: break-word;
    max-width: calc(100% - 140px);
}

li button {
    padding: 5px 8px;
    font-size: 14px;
    border: none;
    border-radius: 4px;
    margin-left: 5px;
    min-width: 50px;
    width: auto;
    display: inline-block;
}

/* Dark mode: li in todo-list e completed-list */
body.dark-mode #todo-list li,
body.dark-mode #completed-list li {
    background-color: #111;
    color: #f0f0f0;
    border: 1px solid #333;
}

/* Dark mode: contenitore colonne */
.todo-columns-container.dark-mode {
    background-color: #111;
    border: 1px solid #333;
}

/* Dark mode: contenitore principale */
body.dark-mode .todo-columns-container {
    background-color: #111;
    border: 1px solid #333;
    color: #f0f0f0;
}

body.dark-mode .add-task-section {
    background-color: #111;
    border: 1px solid #333;
    color: #f0f0f0;
}

/* Dark mode: pulsante Add Task */
body.dark-mode #add-btn {
    background-color: #f0f0f0;
    color: #000027;
    border: 1px solid #555;
}

body.dark-mode #add-btn:hover {
    background-color: #4caf50;
    color: #fff;
}

/* Light mode: pulsante Add Task */
body.light-mode #add-btn {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
}

body.light-mode #add-btn:hover {
    background-color: #45a049;
    color: #fff;
}
body.light-mode .todo-columns-container {
    background-color: #ffffff;

}

/* Per il pulsante con le icone */
#theme-toggle {
    display: flex;
    position: absolute;
    right: 200px;
    left: -100px;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    background-color: #28e62e00;
    color: #333;
    border: none;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

/* Light Mode: Icona Sole */
body.light-mode #theme-toggle .fa-sun {
    display: block; /* Mostra l'icona del sole in modalità chiara */
}

body.light-mode #theme-toggle .fa-moon {
    display: none; /* Nasconde l'icona della luna in modalità chiara */
}

/* Dark Mode: Icona Luna */
body.dark-mode #theme-toggle .fa-sun {
    display: none; /* Nasconde l'icona del sole in modalità scura */
}

body.dark-mode #theme-toggle .fa-moon {
    display: block; /* Mostra l'icona della luna in modalità scura */
}

/* Colore dell'icona del sole in Light Mode */
.light-mode #theme-toggle .fa-sun {
    color: #FFD700; /* Colore giallo per il sole */
}

/* Colore dell'icona della luna in Dark Mode */
.dark-mode #theme-toggle .fa-moon {
    color: #FFFFFF; /* Colore bianco per la luna */
}
/* Light mode colors */
.light-mode .todo-column {
  background-color: #ffffff;  /* light gray */
  color: #000000;                /* dark text */
}
.light-mode li {
    background-color: #808080;  /* white */
    color: #000000;                /* dark text */
}

footer {
    padding: 10px 0;
    text-align: center;
}

#task-counter {
    margin-top: 20px;  /* Spazio sopra */
    margin-bottom: 20px;  /* Spazio sotto */
    font-size: 16px;  /* Puoi anche regolare la dimensione del testo se necessario */
    font-weight: bold;  /* Per renderlo più evidente */
}

