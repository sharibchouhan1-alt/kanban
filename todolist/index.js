let arr = [];
let index = 0;

const todoContainer = document.getElementById('todo-tasks');
const inProgressContainer = document.getElementById('inprogress-tasks');
const doneContainer = document.getElementById('done-tasks');

// --- CATCHING / DROPPING REGIONS (The physical landing columns) ---
const todoColumn = document.getElementById('todo-column');
const inProgressColumn = document.getElementById('inprogress-column');
const doneColumn = document.getElementById('done-column');

// --- THE INTERACTION BUTTONS ---
const createCardBtn = document.getElementById('btn-create-task');

// --- DYNAMIC TASK COUNTERS ---
const todoCountBadge = document.getElementById('todo-count');
const inProgressCountBadge = document.getElementById('inprogress-count');
const doneCountBadge = document.getElementById('done-count');

// --- APP STATUS INDICATORS ---
const storageStatusBadge = document.getElementById('storage-status');

// 🌟 HELPER FUNCTION A: Updates badge totals across all columns
function updateCounters() {
    const todoTasks = arr.filter(t => t.Status === "ToDo").length;
    const inProgressTasks = arr.filter(t => t.Status === "InProgress").length;
    const doneTasks = arr.filter(t => t.Status === "Done").length;

    todoCountBadge.textContent = `${todoTasks} tasks`;
    inProgressCountBadge.textContent = `${inProgressTasks} tasks`;
    doneCountBadge.textContent = `${doneTasks} tasks`;
}

// 🌟 HELPER FUNCTION B: Commits array snapshot to localStorage state
function saveToLocalStorage() {
    localStorage.setItem('kanban-board-state', JSON.stringify(arr));
}

// --- TASK CREATION INPUT ENGINE ---
createCardBtn.addEventListener('click', function(e) {
    createCardBtn.classList.add('d-none');
    const formWrapper = document.createElement('div');
    formWrapper.className = 'mb-3 p-2 bg-white rounded shadow-sm border border-light';
    formWrapper.id = 'dynamic-task-form';

    formWrapper.innerHTML = `
        <input type="text" id="task-input-field" class="form-control form-control-sm mb-2" placeholder="What needs to be done?" autofocus>
        <div class="d-flex gap-2 justify-content-end" id="prntbtninp">
            <button class="btn btn-sm btn-secondary" id="btn-cancel-task">Cancel</button>
            <button class="btn btn-sm text-white" style="background-color: #d81b60;" id="btn-submit-task">Add</button>
        </div>
    `;
    todoColumn.insertBefore(formWrapper, todoContainer);

    // 🌟 ADDED: Cancel creation handler
    document.getElementById('btn-cancel-task').addEventListener('click', function() {
        formWrapper.remove();
        createCardBtn.classList.remove('d-none');
    });

    document.querySelector("#btn-submit-task").addEventListener('click', function(e) {
        let userdescription = document.querySelector("#task-input-field").value.trim();
        
        if (userdescription === "") return;

        let obj = {
            id: "date" + Date.now(),
            title: userdescription,
            Status: "ToDo"
        };
        arr.push(obj);

        createcard(obj.title, obj.id, obj.Status); // Pass state configuration down
        
        saveToLocalStorage(); // Persist State
        updateCounters();     // Sync Counters
        
        formWrapper.remove();
        createCardBtn.classList.remove('d-none');
    });
});

function createcard(taskTitle, taskId, initialStatus = "ToDo") {
    let card = document.createElement('div');
    card.className = 'task-card';
    card.id = taskId;       
    card.draggable = true;  
    
    card.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', card.id);
        card.style.opacity = '0.4';
    });
    
    card.addEventListener('dragend', function() {
        card.style.opacity = '1'; 
    });

    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <p class="mb-0 fw-semibold text-dark task-title-text">${taskTitle}</p>
            
            <div class="dropdown">
                <button class="btn btn-sm text-muted p-0" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item edit-task-btn" href="#"><i class="bi bi-pencil me-2"></i>Edit</a></li>
                    <li><a class="dropdown-item text-danger delete-task-btn" href="#"><i class="bi bi-trash me-2"></i>Delete</a></li>
                </ul>
            </div>
        </div>
        
        <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="badge bg-danger-subtle text-danger rounded-pill" style="font-size: 0.7rem;">Task</span>
            <small class="text-muted" style="font-size: 0.75rem;">
                <i class="bi bi-calendar3 me-1"></i> New
            </small>
        </div>
    `;

    // 🌟 ADDED: Dynamic Edit Action Binding
    card.querySelector('.edit-task-btn').addEventListener('click', function(e) {
        e.preventDefault();
        const titlePara = card.querySelector('.task-title-text');
        let editedText = prompt("Modify your task description:", titlePara.textContent);
        
        if (editedText !== null && editedText.trim() !== "") {
            titlePara.textContent = editedText.trim();
            let targetObj = arr.find(item => item.id === card.id);
            if (targetObj) targetObj.title = editedText.trim();
            saveToLocalStorage();
        }
    });

    // 🌟 ADDED: Dynamic Delete Action Binding
    card.querySelector('.delete-task-btn').addEventListener('click', function(e) {
        e.preventDefault();
        card.remove(); // Clean layout element node
        arr = arr.filter(item => item.id !== card.id); // Wipe entry out of tracking reference array
        saveToLocalStorage();
        updateCounters();
    });
    
    // 🌟 ADDED: Renders into the proper container list based on state value upon hydration
    if (initialStatus === "InProgress") {
        inProgressContainer.appendChild(card);
    } else if (initialStatus === "Done") {
        doneContainer.appendChild(card);
    } else {
        todoContainer.appendChild(card);
    }
}

// --- DRAG AND DROP ARCHITECTURE INTERFACES ---
const landingColumns = [todoColumn, inProgressColumn, doneColumn];

landingColumns.forEach(column => {
    
    column.addEventListener('dragover', function(e) {
        e.preventDefault(); 
    });

    column.addEventListener('dragenter', function() {
        column.classList.add('column-drag-hover');
    });

    column.addEventListener('dragleave', function() {
        column.classList.remove('column-drag-hover');
    });

    column.addEventListener('drop', function(e) {
        column.classList.remove('column-drag-hover');

        const pickedUpCardId = e.dataTransfer.getData('text/plain');
        const movingCardElement = document.getElementById(pickedUpCardId);
        
        if (movingCardElement) {
            const internalTaskList = column.querySelector('.tasks-container');
            
            if (internalTaskList) {
                internalTaskList.appendChild(movingCardElement);
                
                // 🌟 ADDED: State Redirection Mapper to find item in array and update status field
                let targetDataObj = arr.find(item => item.id === pickedUpCardId);
                if (targetDataObj) {
                    if (column.id === "todo-column") targetDataObj.Status = "ToDo";
                    if (column.id === "inprogress-column") targetDataObj.Status = "InProgress";
                    if (column.id === "done-column") targetDataObj.Status = "Done";
                }
                
                saveToLocalStorage(); // Save changes to memory
                updateCounters();     // Refresh header badges
            }
        }
    });
});

// 🌟 ADDED: Initializer block to pull layout from localStorage data on reload
function loadSavedBoardState() {
    const rawDataStr = localStorage.getItem('kanban-board-state');
    if (rawDataStr) {
        arr = JSON.parse(rawDataStr);
        arr.forEach(task => {
            createcard(task.title, task.id, task.Status);
        });
    }
    updateCounters(); // Initial layout syncing pass
}

// Start tracking application layout instantly
loadSavedBoardState();


// see it