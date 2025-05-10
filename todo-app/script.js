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
