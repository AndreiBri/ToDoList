const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const completedList = document.getElementById('completed-list');
const filterAllBtn = document.getElementById('filter-all');
const filterTodoBtn = document.getElementById('filter-todo');
const filterCompletedBtn = document.getElementById('filter-completed');
const taskCounter = document.getElementById('task-counter');
const prioritySelect = document.getElementById('priority-select');
const clearCompletedBtn = document.getElementById('clear-completed');
const dueDateInputGlobal = document.getElementById('due-date-input');

function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

window.onload = function() {
    if (isLocalStorageAvailable()) {
        loadTasks();
    }
};

// --- THEME TOGGLE ---
const themeToggleButton = document.getElementById('theme-toggle');
const sunIcon = document.createElement('i');
sunIcon.classList.add('fas', 'fa-sun');
const moonIcon = document.createElement('i');
moonIcon.classList.add('fas', 'fa-moon');
themeToggleButton.appendChild(sunIcon);
themeToggleButton.appendChild(moonIcon);

let isDarkMode = localStorage.getItem('theme') === 'dark';

function setTheme() {
    const sunIcon = document.createElement('i');
    sunIcon.classList.add('fas', 'fa-sun');
    const moonIcon = document.createElement('i');
    moonIcon.classList.add('fas', 'fa-moon');

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        themeToggleButton.innerHTML = '';   // clears existing icons
        themeToggleButton.appendChild(moonIcon);
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeToggleButton.innerHTML = '';   // clears existing icons
        themeToggleButton.appendChild(sunIcon);
    }
}


themeToggleButton.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    setTheme();
});

setTheme();

// --- TASK ADDING ---
addButton.addEventListener('click', () => {
    const task = todoInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInputGlobal.value;

    if (task !== '') {
        addTask(task, false, priority, dueDate);
        todoInput.value = '';
        dueDateInputGlobal.value = '';
        saveTasksDebounced();
    } else {
        alert("Please enter a task!");
    }
});

function addTask(task, completed, priority, dueDate = '') {
    const li = document.createElement('li');
    li.draggable = true;

    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);

    // Editable text span
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task;
    taskSpan.contentEditable = true;
    taskSpan.classList.add('editable-task-text');
    taskSpan.spellcheck = false;
    taskSpan.addEventListener('blur', () => {
        saveTasksDebounced();
    });
    li.appendChild(taskSpan);

    // Priority span
    const prioritySpan = document.createElement('span');
    prioritySpan.textContent = `(${priority})`;
    prioritySpan.classList.add('priority');
    li.appendChild(prioritySpan);

    // Due date input
    const dueDateInputEl = document.createElement('input');
    dueDateInputEl.type = 'date';
    dueDateInputEl.value = dueDate;
    dueDateInputEl.classList.add('due-date-input');
    dueDateInputEl.addEventListener('change', () => {
        saveTasksDebounced();
        sortTasks(todoList);
        sortTasks(completedList);
        updateCounter();
    });
    li.appendChild(dueDateInputEl);

    addTaskButtons(li, completed);

    if (completed) {
        completedList.appendChild(li);
    } else {
        todoList.appendChild(li);
    }

    updateCounter();
    sortTasks(todoList);
    sortTasks(completedList);
}

// --- TASK BUTTONS ---
function addTaskButtons(li, completed) {
    const taskSpan = li.querySelector('span.editable-task-text');
    const taskText = taskSpan ? taskSpan.textContent.trim() : '';
    const priority = li.querySelector('.priority').textContent.trim().replace(/[()]/g, '');
    const dueDate = li.querySelector('input.due-date-input').value;

    // Remove existing button container to avoid duplicates
    const existingButtons = li.querySelector('.button-container');
    if (existingButtons) existingButtons.remove();

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-btn');
    removeButton.onclick = () => {
        li.remove();
        saveTasksDebounced();
        updateCounter();
    };

    if (completed) {
        const restoreButton = document.createElement('button');
        restoreButton.textContent = 'Restore';
        restoreButton.classList.add('restore-btn');
        restoreButton.onclick = () => {
            li.remove();
            addTask(taskText, false, priority, dueDate);
            saveTasksDebounced();
            updateCounter();
        };
        buttonContainer.appendChild(restoreButton);
    } else {
        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete';
        completeButton.classList.add('complete-btn');
        completeButton.onclick = () => {
            li.remove();
            addTask(taskText, true, priority, dueDate);
            saveTasksDebounced();
            updateCounter();
        };
        buttonContainer.appendChild(completeButton);
    }

    buttonContainer.appendChild(removeButton);
    li.appendChild(buttonContainer);
}

// --- SAVE & LOAD TASKS ---
function saveTasks() {
    const tasks = { todo: [], completed: [] };

    todoList.querySelectorAll('li').forEach(li => {
        const taskText = li.querySelector('span.editable-task-text').textContent.trim();
        const priority = li.querySelector('.priority').textContent.trim().replace(/[()]/g, '').toLowerCase();
        const dueDate = li.querySelector('input.due-date-input').value;
        tasks.todo.push({ taskText, priority, dueDate });
    });

    completedList.querySelectorAll('li').forEach(li => {
        const taskText = li.querySelector('span.editable-task-text').textContent.trim();
        const priority = li.querySelector('.priority').textContent.trim().replace(/[()]/g, '').toLowerCase();
        const dueDate = li.querySelector('input.due-date-input').value;
        tasks.completed.push({ taskText, priority, dueDate });
    });

    if (isLocalStorageAvailable()) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

const saveTasksDebounced = debounce(saveTasks, 300);

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        const tasks = JSON.parse(saved);
        tasks.todo.forEach(task => addTask(task.taskText, false, task.priority, task.dueDate));
        tasks.completed.forEach(task => addTask(task.taskText, true, task.priority, task.dueDate));
    }
}

// --- SORTING ---
function sortTasks(list) {
    const tasks = Array.from(list.querySelectorAll('li'));
    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };

    tasks.sort((a, b) => {
        const priorityA = a.querySelector('.priority').textContent.trim().replace(/[()]/g, '');
        const priorityB = b.querySelector('.priority').textContent.trim().replace(/[()]/g, '');

        // Compare priorities
        const priorityComparison = priorityOrder[priorityA] - priorityOrder[priorityB];
        if (priorityComparison !== 0) return priorityComparison;

        // If same priority, compare dates
        const dateA = a.querySelector('input.due-date-input').value;
        const dateB = b.querySelector('input.due-date-input').value;

        // Empty dates should be treated as 'far future' so they go last
        if (!dateA) return 1;
        if (!dateB) return -1;

        return new Date(dateA) - new Date(dateB);
    });

    tasks.forEach(task => list.appendChild(task));
}


// --- DRAG & DROP ---

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
}

function handleDragOver(e) {
    e.preventDefault();
}

// Drop on a list item — insert before that item
function handleDrop(e) {
    e.preventDefault();
    if (!draggedItem) return;

    if (this.parentElement) {
        this.parentElement.insertBefore(draggedItem, this);

        const parentListId = this.parentElement.id;
        const isNowCompleted = parentListId === 'completed-list';

        updateTaskStatus(draggedItem, isNowCompleted);
    }
}

// Enable dropping at the end of the lists
[todoList, completedList].forEach(list => {
    list.addEventListener('dragover', e => e.preventDefault());
    list.addEventListener('drop', e => {
        e.preventDefault();
        if (draggedItem && e.target === list) {
            list.appendChild(draggedItem);
            updateTaskStatus(draggedItem, list.id === 'completed-list');
        }
    });
});

function updateTaskStatus(li, completed) {
    const oldButtons = li.querySelector('.button-container');
    if (oldButtons) oldButtons.remove();

    addTaskButtons(li, completed);
    sortTasks(todoList);
    sortTasks(completedList);
    saveTasksDebounced();
    updateCounter();
}

// --- COUNTER & FILTERS ---

function updateCounter() {
    const totalTasks = todoList.querySelectorAll('li').length + completedList.querySelectorAll('li').length;
    const completedTasks = completedList.querySelectorAll('li').length;
    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    taskCounter.textContent = `${completedTasks} su ${totalTasks} completati (${percentage}%)`;
}

filterAllBtn.addEventListener('click', () => {
    todoList.parentElement.style.display = 'flex';
    completedList.parentElement.style.display = 'flex';
});

filterTodoBtn.addEventListener('click', () => {
    todoList.parentElement.style.display = 'flex';
    completedList.parentElement.style.display = 'none';
});

filterCompletedBtn.addEventListener('click', () => {
    todoList.parentElement.style.display = 'none';
    completedList.parentElement.style.display = 'flex';
});

clearCompletedBtn.addEventListener('click', () => {
    if (confirm("Sei sicuro di voler eliminare tutti i task completati?")) {
        completedList.innerHTML = '';
        saveTasksDebounced();
        updateCounter();
    }
});

// --- UTILS ---

// Debounce helper to limit function calls in rapid succession
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
