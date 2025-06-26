const tasks = [];
const deletedTasks = [];
let taskList = null;
let taskInput = null;
let deletedTaskList = null;
const settings = loadSettings();

document.addEventListener('DOMContentLoaded', function () {
    taskList = document.getElementById("tasklist");
    taskInput = document.getElementById("taskinput");
    deletedTaskList = document.getElementById("deletedtasks");
    let clearbtn = document.getElementById("clearbtn");
    let showDuplicatesInput = document.getElementById("showDuplicates");
    let deleteCompletedInput = document.getElementById("deletecompleted");
    let clearCompletedBtn = document.getElementById("clearcompletedbtn");

    document.getElementById('darkmodebtn').addEventListener("click", (e) => {
        document.body.classList.toggle('darkmode');
    });

    taskInput.addEventListener("blur", () => {
        parseInput();
    })

    taskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            taskInput.blur();
        } else if (event.key === "Escape") {
            taskInput.textContent = "";
            taskInput.blur();
        }
    })

    clearbtn.addEventListener("click", (e) => {
        while (tasks.length > 0) {
            let task = tasks.pop();
            taskList.removeChild(task.taskRow.li);
        }

        while (deletedTasks.length > 0) {
            let task = deletedTasks.pop();
            deletedTaskList.removeChild(task.historyRow.li);
        }

        save();
    });

    showDuplicatesInput.checked = settings.showDuplicates;

    showDuplicatesInput.addEventListener("change", (event) => {
        settings.showDuplicates = showDuplicatesInput.checked;
        save();
        updateHistoryVisibility();
    })

    deleteCompletedInput.checked = settings.deleteCompleted;

    deleteCompletedInput.addEventListener("change", (event) => {
        settings.deleteCompleted = deleteCompletedInput.checked;
        save();
    })

    clearCompletedBtn.addEventListener("click", (e) => {
        clearCompleted();
    });

    load();
});

function parseInput() {
    const text = taskInput.textContent.trim();

    if (text === "") {
        return;
    }

    if (checkForDuplicate(text)) {
        taskInput.textContent = "";
        createAlert("Task already exists", 2000);
        return;
    }

    const task = new Task(text, false);
    tasks.push(task);
    taskList.append(task.taskRow.li);
    taskInput.textContent = "";
    save();
    updateHistoryVisibility();
}

function checkForDuplicate(t) {
    return tasks.some(task => task.text.toUpperCase() === t.toUpperCase());
}

function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
    localStorage.setItem("settings", JSON.stringify(settings));
}

function load() {
    const tasksParsed = JSON.parse(localStorage.getItem("tasks"));
    const deletedTasksParsed = JSON.parse(localStorage.getItem("deletedTasks"));
    
    tasksParsed.forEach(task => {
        let t = Task.fromJSON(task);
        tasks.push(t);
        taskList.append(t.taskRow.li);
    });

    deletedTasksParsed.forEach(task => {
        let t = Task.fromJSON(task);
        deletedTasks.push(t);
        if (t.historyRow) {
            deletedTaskList.append(t.historyRow.li);
        }
    });

    updateHistoryVisibility();
}

function loadSettings() {
    const parsed = JSON.parse(localStorage.getItem("settings"));

    const defaults = {
        deleteCompleted: false,
        showDuplicates: true
    };

    return {
        deleteCompleted: parsed?.deleteCompleted ?? defaults.deleteCompleted,
        showDuplicates: parsed?.showDuplicates ?? defaults.showDuplicates
    };
}

function createAlert(text, delayMs) {
    const alert = document.createElement("div");
    alert.className = "erroralert";
    alert.innerHTML = `${text}`;
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('hide');
        setTimeout(() => document.body.removeChild(alert), 150);
    }, delayMs);
}

function updateHistoryVisibility() {
    console.log(`Updating history visibility with settings.showDuplicates=${settings.showDuplicates}`);

    const seen = new Set();

    deletedTasks.forEach(task => {
        const text = task.text.toLowerCase();
        const li = task.historyRow.li;

        if (settings.showDuplicates) {
            li.classList.remove("d-none");
        } else {
            const isInTasks = checkForDuplicate(text);
            if (isInTasks || seen.has(text)) {
                li.classList.add("d-none");
            } else {
                li.classList.remove("d-none");
                seen.add(text);
            }
        }
    });
}

function clearCompleted() {
    tasks.filter(task => task.completed).forEach(task => task.handleDelete());
}

class Task {
    constructor(text, completed, deletedDate) {
        this.text = text;
        this.completed = completed;
        this.taskRow = new TaskRow(this);
        this.displayed = true;

        if (completed) {
            this.taskRow.updateCompleteState(true);
        }

        if (deletedDate) {
            this.deletedDate = deletedDate;
            this.historyRow = new HistoryRow(this, text, deletedDate);
        }
    }

    toggleComplete() {
        this.completed = !this.completed;
        this.taskRow.updateCompleteState(this.completed);
        if (settings.deleteCompleted && this.completed) {
            this.handleDelete();
        }
        save();
    }

    handleDelete() {
        //First remove this from the tasks list
        const index = tasks.indexOf(this);
        if (index !== -1) {
            tasks.splice(index, 1);
        }

        //Remove from the tasks tab
        taskList.removeChild(this.taskRow.li);

        //Reset history row
        this.historyRow = null;

        //add to the history tab
        this.deletedDate = new Date();
        this.historyRow = new HistoryRow(this, this.text, this.deletedDate);
        deletedTaskList.append(this.historyRow.li);

        //Add to the deleted tasks list
        deletedTasks.push(this);

        save();
        updateHistoryVisibility();
    }

    handleUndoDelete() {
        const index = deletedTasks.indexOf(this);
        if (index !== -1) {
            deletedTasks.splice(index, 1);
        }

        if (checkForDuplicate(this.text)) {
            createAlert("Task already exists", 2000);
            return;
        }

        //remove from the history tab
        deletedTaskList.removeChild(this.historyRow.li);

        //add to the tasks tab
        taskList.append(this.taskRow.li);

        //Add to the task list
        tasks.push(this);

        save();
        updateHistoryVisibility();
    }

    handlePermaDelete() {
        const index = deletedTasks.indexOf(this);

        console.log(`Permanently deleting element ${this.text}, this is in deletedTasks at index ${index}`);

        if (index !== -1) {
            deletedTasks.splice(index, 1);
        }

        //remove from the history tab
        deletedTaskList.removeChild(this.historyRow.li);

        save();
        updateHistoryVisibility();
    }

    parseEdit() {
        const t = this.taskRow.p.textContent;

        if (t === "") {
            this.resetTextDisplay();
            createAlert("Task can't be empty", 2000);
            return;
        }

        if (t === this.text) {
            return
        }

        if (checkForDuplicate(t)) {
            this.resetTextDisplay();
            createAlert("Task already exists", 2000);
        } else {
            this.text = t;
            save();
            updateHistoryVisibility();
        }
    }

    resetTextDisplay() {
        this.taskRow.p.textContent = this.text;
    }

    toJSON() {
        return {
            text: this.text,
            completed: this.completed,
            deletedDate: this.deletedDate ? this.deletedDate.toISOString() : this.deletedDate
        };
    }

    static fromJSON(obj) {
        return new Task(
            obj.text,
            obj.completed,
            obj.deletedDate ? new Date(obj.deletedDate) : obj.deletedDate // if it's null or undefined keep this, otherwise make a date out of the stored string
        );
    }
}

class TaskRow {
    constructor(task) {
        this.task = task;
        this.li = this.createRow();
        this.p = this.createParagraph(task.text);
        this.p.addEventListener("blur", () => {
            this.task.parseEdit();
        });

        this.p.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "Enter":
                    event.preventDefault();
                    this.p.blur();
                    break;
                case "Escape":
                    this.task.resetTextDisplay();
                    this.p.blur();
                    break;
            }
        });

        this.p.addEventListener("dblclick", () => {
            this.task.toggleComplete();
        });

        this.div = this.createDiv();
        this.completeBtn = this.createButton("\u2713", "Mark Complete", () => this.task.toggleComplete());
        this.deleteBtn = this.createButton("\u274C", "Delete Task", () => this.task.handleDelete());
        this.div.append(this.completeBtn, this.deleteBtn);

        this.li.append(this.p, this.div);
    }

    createRow() {
        const li = document.createElement("li");
        li.classList.add("task");
        return li;
    }

    createDiv() {
        const div = document.createElement("div");
        div.classList.add("align-right");
        return div;
    }

    createParagraph(text) {
        const p = document.createElement("p");
        p.textContent = text;
        p.contentEditable = "true";
        p.dataset.placeholder = "Type the task you want to change this to...";
        p.classList.add("tasktext");
        return p;
    }

    createButton(text, ariaLabel, onClick) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.ariaLabel = ariaLabel;
        btn.classList.add("mybtn");
        btn.addEventListener("click", onClick);
        return btn;
    }

    updateCompleteState(completed) {
        if (completed) {
            this.li.classList.add("completed");
        } else {
            this.li.classList.remove("completed");
        }
    }
}

class HistoryRow {
    constructor(task, text, deletedDate) {
        this.task = task;
        this.text = text;
        this.deletedDate = deletedDate;

        this.li = this.createRow();
        this.p = this.createParagraph(text);

        this.div = this.createDiv();
        this.timestamp = this.createTimestamp(deletedDate);
        this.undoBtn = this.createButton("\u21A9", "Undo Delete", () => this.task.handleUndoDelete());
        this.permaDeleteBtn = this.createButton("\uD83D\uDDD1", "Permanently Delete", () => this.task.handlePermaDelete());
        this.div.append(this.timestamp, this.undoBtn, this.permaDeleteBtn);

        this.li.append(this.p, this.div);
    }

    createRow() {
        const li = document.createElement("li");
        li.classList.add("task");
        return li;
    }

    createDiv() {
        const div = document.createElement("div");
        div.classList.add("align-right");
        return div;
    }

    createParagraph(text) {
        const p = document.createElement("p");
        p.textContent = text;
        p.classList.add("tasktext");
        return p;
    }

    createTimestamp(date) {
        const p = document.createElement("p");
        p.textContent = `Deleted at: ${date.toLocaleString()}`;
        p.classList.add("timestamp");
        return p;
    }

    createButton(text, ariaLabel, onClick) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.ariaLabel = ariaLabel;
        btn.classList.add("mybtn");
        btn.addEventListener("click", onClick);
        return btn;
    }
}