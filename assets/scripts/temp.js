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

    load();
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
    save();
}

function checkForDuplicate(t) { //TODO: change to take array input
    return tasks.some(task => task.text === t);
}

function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
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
}

class Task {
    constructor(text, completed, deletedDate) {
        this.text = text;
        this.completed = completed;
        this.taskRow = new TaskRow(this);

        if (completed) {
            this.taskRow.updateCompleteState(true);
        }

        if (deletedDate) {
            this.deletedDate = deletedDate;
            this.historyRow = new HistoryRow(text, deletedDate);
        }
    }

    toggleComplete() {
        this.completed = !this.completed;
        this.taskRow.updateCompleteState(this.completed);
        save();
    }

    handleDelete() {
        //First remove this from the tasks list
        const index = tasks.indexOf(this);
        if (index !== -1) {
            tasks.splice(index, 1);
        }

        //add to the history tab
        this.deletedDate = new Date();
        this.historyRow = new HistoryRow(this.text, this.deletedDate);
        deletedTaskList.append(this.historyRow.li);

        //Add to the deleted tasks list
        deletedTasks.push(this);

        save();
    }

    parseEdit() {
        const t = this.taskRow.p.textContent;

        if (t === "") {
            this.resetTextDisplay();
            alert("You can't change a task to empty.");
            return;
        }

        if (t === this.text) {
            return
        }

        if (checkForDuplicate(t)) {
            this.resetTextDisplay();
            alert("You've already added that task.");
        } else {
            this.text = t;
            save();
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
        this.deleteBtn = this.createButton("\u274C", "Delete Task", () => this.handleDelete());
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

        this.div = this.createDiv();
        this.timestamp = this.createTimestamp(deletedDate);
        this.undoBtn = this.createButton("\u21A9", "Undo Delete", () => this.task.handleUndoDelete());
        this.permaDeleteBtn = this.createButton("\uD83D\uDDD1", () => this.handlePermaDelete());
        this.div.append(this.timestamp, this.undoBtn, this.permaDeleteBtn);

        this.li.append(this.p, this.div);
    }

    handleUndoDelete() {
        //TODO: handleUndoDelete
    }

    handlePermaDelete() {
        //TODO: handlePermaDelete
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
        btn.addEventListener("click", onClick);
        return btn;
    }
}