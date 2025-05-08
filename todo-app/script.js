const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const completedList = document.getElementById('completed-list');

// Carica le task dal localStorage all'avvio della pagina
window.onload = function() {
    loadTasks();
};

// Aggiungi nuova task
addButton.addEventListener('click', function() {
    const task = todoInput.value.trim();
    if (task !== '') {
        addTask(task, false);
        todoInput.value = '';
        saveTasks();
    }
});

// Permetti l'aggiunta con il tasto Enter
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addButton.click();
    }
});

function addTask(task, completed) {
    const li = document.createElement('li');

    // CREIAMO UN <span> PER IL TESTO
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task;
    li.appendChild(taskSpan);

    // CREIAMO UN CONTENITORE PER I BOTTONI
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-btn');
    removeButton.onclick = function() {
        li.remove();
        saveTasks();
    };

    if (completed) {
        const restoreButton = document.createElement('button');
        restoreButton.textContent = 'Restore';
        restoreButton.classList.add('restore-btn');
        restoreButton.onclick = function() {
            li.remove();
            addTask(task, false);
            saveTasks();
        };
        buttonContainer.appendChild(restoreButton);
    } else {
        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete';
        completeButton.classList.add('complete-btn');
        completeButton.onclick = function() {
            li.remove();
            addTask(task, true);
            saveTasks();
        };
        buttonContainer.appendChild(completeButton);
    }

    // AGGIUNGIAMO IL REMOVE SEMPRE
    buttonContainer.appendChild(removeButton);

    // AGGIUNGIAMO IL CONTENITORE BOTTONI ALL'LI
    li.appendChild(buttonContainer);

    if (completed) {
        completedList.appendChild(li);
    } else {
        todoList.appendChild(li);
    }
}

function saveTasks() {
    const tasks = {
        todo: [],
        completed: []
    };

    todoList.querySelectorAll('li').forEach(li => {
        const taskText = li.querySelector('span').textContent.trim();
        tasks.todo.push(taskText);
    });

    completedList.querySelectorAll('li').forEach(li => {
        const taskText = li.querySelector('span').textContent.trim();
        tasks.completed.push(taskText);
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        const tasks = JSON.parse(saved);
        tasks.todo.forEach(task => addTask(task, false));
        tasks.completed.forEach(task => addTask(task, true));
    }
}

// DARK / LIGHT MODE
const themeToggleButton = document.getElementById('theme-toggle');
let isDarkMode = localStorage.getItem('theme') === 'dark';

// Aggiungi la classe di tema in base alla preferenza
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

// Cambia tema quando il pulsante viene cliccato
themeToggleButton.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    setTheme();
});

// Imposta il tema iniziale
setTheme();
