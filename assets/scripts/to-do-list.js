document.addEventListener('DOMContentLoaded', function () {

    const tasks = []
    const tasklist = document.getElementById("tasklist");
    const taskinput = document.getElementById("taskinput")

    taskinput.addEventListener("blur", () => {
        parseInput();
    })

    taskinput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            parseInput();
        }
    })

    function parseInput() {
        const text = taskinput.value.trim();

        if (text !== "") {
            addTask(text);
        }
    }

    function resetInput() {
        taskinput.value = "";
    }

    function addTask(t) {
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
        let input = document.createElement("input");
        input.value = t;

        input.addEventListener("blur", () => {
            parseEdit(input, task);
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                input.blur();
            }
        });

        input.addEventListener("dblclick", () => {
            toggleComplete(li, task);
        });

        li.appendChild(input);

        //Button to mark it complete
        let completebtn = document.createElement("button");
        completebtn.textContent = "\u2713";
        completebtn.ariaLabel = "Mark Complete";
        completebtn.addEventListener("click", (e) => {
            toggleComplete(li, task);
        });
        li.appendChild(completebtn);

        //Button to delete
        let deletebtn = document.createElement("button");
        deletebtn.textContent = "X";
        deletebtn.ariaLabel = "Delete";
        deletebtn.addEventListener("click", (e) => {
            deleteElement(li, task);
        });
        li.appendChild(deletebtn);

        tasklist.append(li);
        resetInput();
    }

    function parseEdit(input, task) {
        const t = input.value;

        //First check if the text has changed from the original task before checking for duplicates to avoid it returning true because the text hasn't changed (and therefore array already contains this)
        if (t === task.text) {
            return;
        }

        if (checkForDuplicate(t)) {
            alert("You've already added that task.");
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
    }

    function toggleComplete(li, task) {
        task.completed = !task.completed;
        li.classList.toggle("completed");
    }
});