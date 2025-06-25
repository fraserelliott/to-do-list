document.addEventListener('DOMContentLoaded', function () {

    $("#tabs").tabs();

    const tasks = [];
    const deleteHistory = [];
    const tasklist = document.getElementById("tasklist");
    const taskinput = document.getElementById("taskinput");
    const undobtn = document.getElementById("undobtn");

    document.getElementById('darkmodebtn').addEventListener("click", (e) => {
        document.body.classList.toggle('darkmode');
    });

    taskinput.addEventListener("blur", () => {
        parseInput();
    })

    taskinput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            parseInput();
        } else if (event.key === "Escape") {
            taskinput.value = "";
            taskinput.blur();
        }
    })

    taskinput.addEventListener('input', function () {
        resizeTextArea(this);
    });

    undobtn.addEventListener("click", (e) => {
        undoDelete();
    });

    function undoDelete() {
        //Check this now before returning anything; we will pop this 1 element so undo button should disable
        if (deleteHistory.length == 1) {
            undobtn.disabled = true;
        }

        let data = deleteHistory.pop();
        if (checkForDuplicate(data.deletedTask.text)) {
            alert("You've already added this task back to the list.");
        } else {
            tasks.push(data.deletedTask);
            tasklist.append(data.row);
        }
    }

    function parseInput() {
        const text = taskinput.value.trim();

        if (text !== "") {
            addTask(text);
        }
    }

    function resetInput() {
        taskinput.value = "";
        resizeTextArea(taskinput);
    }

    function addTask(t) {
        if (t === "") {
            alert("You can't add an empty task.");
            return;
        }

        if (checkForDuplicate(t)) {
            resetInput();
            alert("You've already added that task.");
            return;
        }

        let task = {
            text: t,
            completed: false
        };

        tasks.push(task);

        //Flexbox container for the row
        let li = document.createElement("li");
        li.classList.add("task");


        //The text for the task
        let textarea = document.createElement("textarea");
        textarea.value = t;
        textarea.rows = 1;

        textarea.addEventListener("blur", () => {
            parseEdit(textarea, task);
        });

        textarea.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
            } if (event.key === "Escape") {
                textarea.value = task.text;
                textarea.blur();
            }
        });

        textarea.addEventListener("dblclick", () => {
            toggleComplete(li, task);
        });

        textarea.addEventListener('input', function () {
            resizeTextArea(this);
        });

        li.appendChild(textarea);

        //Button to mark it complete
        let completebtn = document.createElement("button");
        completebtn.textContent = "\u2713";
        completebtn.setAttribute('aria-label', 'Mark Complete');
        completebtn.addEventListener("click", (e) => {
            toggleComplete(li, task);
        });
        li.appendChild(completebtn);

        //Button to delete
        let deletebtn = document.createElement("button");
        deletebtn.textContent = "X";
        deletebtn.setAttribute('aria-label', 'Delete');
        deletebtn.addEventListener("click", (e) => {
            deleteElement(li, task);
        });
        li.appendChild(deletebtn);

        tasklist.append(li);
        resizeTextArea(textarea);
        resetInput();
    }

    function parseEdit(textarea, task) {
        const t = textarea.value;

        if (t === "") {
            alert("You can't change a task to empty.");
            textarea.value = task.text;
            return;
        }

        //First check if the text has changed from the original task before checking for duplicates to avoid it returning true because the text hasn't changed (and therefore array already contains this)
        if (t === task.text) {
            return;
        }

        if (checkForDuplicate(t)) {
            alert("You've already added that task.");
            textarea.value = task.text;
        } else {
            task.text = t;
        }
    }

    function checkForDuplicate(t) {
        return tasks.some(task => task.text === t);
    }

    function deleteElement(li, task) {
        const index = tasks.indexOf(task);
        if (index !== -1) {
            tasks.splice(index, 1);
        }

        tasklist.removeChild(li);
        deleteHistory.push({ row: li, deletedTask: task });
        undobtn.disabled = false;
    }

    function toggleComplete(li, task) {
        task.completed = !task.completed;
        li.classList.toggle("completed");
    }

    function resizeTextArea(textArea) {
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
    }
});