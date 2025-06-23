document.addEventListener('DOMContentLoaded', function () {

    const tasks = []
    const tasklist = document.getElementById("tasklist");
    const taskinput = document.getElementById("taskinput")

    taskinput.addEventListener('blur', () => {
        parseInput();
    })

    taskinput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
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

        let li = document.createElement("li");
        li.classList.add("task");

        let span = document.createElement("span");
        span.textContent = t;
        li.appendChild(span);

        let btn = document.createElement("button");
        btn.classList.add("deletebtn");
        btn.textContent = "X";
        btn.addEventListener("click", (e) => {
            deleteElement(btn);
        });
        li.appendChild(btn);

        tasklist.append(li);
        resetInput();
    }

    function checkForDuplicate(t) {
        return tasks.some(task => task.text === t);
    }

    function deleteElement(button) {
        let li = button.parentNode;
        let t = li.querySelector('span').textContent;

        const index = tasks.findIndex(task => task.text === t);
        if (index !== -1) {
            tasks.splice(index, 1);
        }

        tasklist.removeChild(li);
    }
});