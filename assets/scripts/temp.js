const tasks = [];

document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById("tasklist");
    const taskinput = document.getElementById("taskinput");

    document.getElementById('darkmodebtn').addEventListener("click", (e) => {
        document.body.classList.toggle('darkmode');
    });

    taskinput.addEventListener("blur", () => {
        parseInput(taskinput, taskList);
    })

    taskinput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            parseInput(taskinput, taskList);
        } else if (event.key === "Escape") {
            taskinput.textContent = "";
            taskinput.blur();
        }
    })
});

function parseInput(taskinput, taskList) {
    const text = taskinput.textContent.trim();

    if (text === "") {
        return;
    }

    if (checkForDuplicate(text)) {
        taskinput.textContent = "";
        alert("You've already added that task.");
        return;
    }

    const task = new Task(text, false);
    tasks.push(task);
    taskList.append(task.taskRow.li);
    taskinput.textContent = "";
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

    // Add more task-related methods here (e.g. delete, edit)
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
        tasklist.removeChild(this.li);

        const index = tasks.indexOf(this.task);
        if (index !== -1) {
            tasks.splice(index, 1);
        }
    }
}