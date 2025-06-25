const tasks = [];
const deletedTasks = [];
let taskList = null;
let taskInput = null;
let deletedTaskList = null;

document.addEventListener('DOMContentLoaded', function () {
    taskList = document.getElementById("tasklist");
    taskInput = document.getElementById("taskinput");
    deletedTaskList = document.getElementById("deletedtasks");

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
});

function parseInput() {
    const text = taskInput.textContent.trim();

    if (text === "") {
        return;
    }

    if (checkForDuplicate(text)) {
        taskInput.textContent = "";
        alert("You've already added that task.");
        return;
    }

    const task = new Task(text, false);
    tasks.push(task);
    taskList.append(task.taskRow.li);
    taskInput.textContent = "";
}

function checkForDuplicate(t) {
    return tasks.some(task => task.text === t);
}


class Task {
    constructor(text, completed) {
        this.text = text;
        this.completed = completed;
        this.taskRow = new TaskRow(this);
    }

    toggleComplete() {
        this.completed = !this.completed;
        this.taskRow.updateCompleteState(this.completed);
    }

    handleDelete() {
        //First remove this from the tasks list
        const index = tasks.indexOf(this);
        if (index !== -1) {
            tasks.splice(index, 1);
        }

        //Add to the deleted tasks list
        deletedTasks.push(this);

        //add to the history tab
        this.historyRow = new HistoryRow(this.text, new Date());
        deletedTaskList.append(this.historyRow.li);
    }
}

class TaskRow {
    constructor(task) {
        this.task = task;
        this.li = this.createRow();
        this.p = this.createParagraph(task.text);
        this.completeBtn = this.createButton("\u2713", "Mark Complete", () => this.task.toggleComplete());
        this.deleteBtn = this.createButton("X", "Delete Task", () => this.handleDelete());

        this.li.append(this.p, this.completeBtn, this.deleteBtn);
    }

    createRow() {
        const li = document.createElement("li");
        li.classList.add("task");
        return li;
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

    handleDelete() {
        taskList.removeChild(this.li);
        this.task.handleDelete();
    }
}

class HistoryRow {
    constructor(text, deletedDate) {
        this.text = text;
        this.deletedDate = deletedDate;

        this.li = this.createRow();
        this.p = this.createParagraph(text);
        this.timestamp = this.createTimestamp(deletedDate);

        this.li.append(this.p, this.timestamp);
    }

    createRow() {
        const li = document.createElement("li");
        li.classList.add("task");
        return li;
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
        p.class = "timestamp";
        return p;
    }
}