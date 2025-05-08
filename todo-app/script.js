// Get the necessary DOM elements
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

// Function to create a new to-do item
function createTodoItem(task) {
    const li = document.createElement('li'); // Create the list item
    li.textContent = task; // Set the text of the list item to the task

    // Create a remove button for each task
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = function () {
        li.remove(); // Remove the task from the list when clicked
    };

    // Append the remove button to the list item
    li.appendChild(removeButton);

    // Append the list item to the todo list
    todoList.appendChild(li);
}

// Event listener for the "Add Task" button
addButton.addEventListener('click', function () {
    const task = todoInput.value.trim(); // Get the value from the input
    if (task !== '') {
        createTodoItem(task); // Add the task to the list
        todoInput.value = ''; // Clear the input field
    }
});

// Event listener for pressing "Enter" key to add task
todoInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addButton.click(); // Simulate the click on "Add Task"
    }
});

// Event delegation to handle "Remove" button clicks for both manually added and dynamically added tasks
todoList.addEventListener('click', function(e) {
    if (e.target && e.target.tagName === 'BUTTON') {
        const li = e.target.closest('li'); // Find the closest <li> element to the button
        li.remove(); // Remove the <li> element
    }
});
