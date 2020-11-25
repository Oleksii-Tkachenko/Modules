const ONEDAY = 1000*60*60*24;

// default tasks for To-Do list

const DEFAULT_TASKS = [
{task : "some task", done : true, date : "29.02.2020"},
{task : "another task", done : true, date : "30.03.2020"},
{task : "additional task", done : true, date : "15.04.2020"},
{task : "annoying task", done : false, date : "15.05.2020"},
{task : "interesting task", done : false, date : "01.06.2020"},
{task : "important task", done : false, date : "30.06.2020"}
];
function adjustDate() {
    const TODAY = Date.now();
    let date;
    DEFAULT_TASKS.forEach((task, i) => {
        if (i < 4) {
            date = TODAY - ONEDAY * 30 * (4 - i);
        } else if (i == 4) {
            date = TODAY;
        } else {
            date = TODAY + ONEDAY * 30 * (i - 2);
        }
        newDate = new Date(date);
        task.date = newDate.toLocaleDateString("ru");
    })
};
adjustDate();


// create class of To-Do List

class TodoList{
    constructor(id){
        this.todo = $(id);
        this.list = this.todo.children(".todo-list");
        this.task = this.todo.find(".textfield");
        this.date = this.todo.find(".datefield");
        this.select = this.todo.find(".select");
        this.taskTemplete = this.list.find(".todo-item:first-child");
        this.btnAdd = this.todo.find(".add-btn");
        this.clearBtn = this.todo.find(".clear-btn");
        this.find = this.todo.find(".find");
        this.userTodoDataTasks = null;
        this.i = 0;

        this.loadTasks();
        this.createEvents();
        this.sortTasks();
    }
    loadTasks(){
    // if you whish to get tasks from JSON use following code

        // $.getJSON("todo-data.json", (todoData)=>{
        //     if(this.i === 0) {
        //         this.userTodoDataTasks = JSON.parse(JSON.stringify(todoData.tasks));
        //     }
        // });
        this.userTodoDataTasks = DEFAULT_TASKS;
        $.each(this.userTodoDataTasks, (i, taskData)=>{
                let {task, done, date} = taskData; 
                this.filterName(task, done, date);
            });
    }
    filterName(task, done, date){
        let findVal = this.find.val(),
            regexp = new RegExp(findVal, "gi");
        if (task.search(regexp) >=0 || date.search(regexp) >=0 || findVal === ""){
            this.dateCompare(task, done, date);
        }
    }
    dateCompare(task, done, date){
        let deadlineArr = date.split("."),
            deadline = new Date(deadlineArr[2], deadlineArr[1]-1, deadlineArr[0]),
            today = new Date(),
            timeLeft = deadline - today,
            selectVal = this.select.val(),
            isExp = false;
        task = task.padEnd(20, " ") + "exp.: " + date;
        if (timeLeft>-ONEDAY && timeLeft<0 && selectVal === "today") {
            this.putTask(task, done, isExp);
        } else if (timeLeft>-ONEDAY && selectVal === "current") {
            this.putTask(task, done, isExp);
        } else if (timeLeft<-ONEDAY && selectVal === "expired") {
            isExp = true;
            this.putTask(task, done, isExp);
        } else if (selectVal === "all") {
            if(timeLeft<-ONEDAY) {
                isExp = true;
            }
            this.putTask(task, done, isExp);
        } 
    }
    putTask(task, done, isExp){
        let currentTaskTemplate = this.taskTemplete.clone();
        let title = currentTaskTemplate.children(".title");
        let delBtn = currentTaskTemplate.children(".del-btn");
            title.text(task);
                if (done) {
                    title.addClass("done");
                }
                if (isExp) {
                    title.addClass("red");
                } else {
                    title.addClass("green");
                }
        delBtn.click(this.delTask.bind(this));
        title.click(this.changeTaskStatus.bind(this));
        this.list.append(currentTaskTemplate);
    }
    addTask(){
        let taskText = this.task.val(),
            taskDate = this.date.val();
        if (taskText==="") {
            this.task.css("boxShadow", "0 0 4px red");
        } else if (taskDate==="" || this.date[0].validity.patternMismatch === true) {
            this.date.css("boxShadow", "0 0 4px red");
            this.task.css("boxShadow", "");
        } else {
            this.task.css("boxShadow", "");
            this.date.css("boxShadow", "");
            this.userTodoDataTasks.push({task: taskText, done: false, date: taskDate});
            this.loadAgain();
            this.i++;
            this.task.val("");
            this.date.val("");
        }
    }
    sortTasks(){
        this.userTodoDataTasks.sort((a, b) => {
                let arrA = a.date.split("."),
                    arrB = b.date.split("."),
                    dateA = new Date(arrA[2], arrA[1]-1, arrA[0]),
                    dateB = new Date(arrB[2], arrB[1]-1, arrB[0]);
                return dateA.getTime() - dateB.getTime();
            });
    }
    delTask(event){
        let currentDelBtn = $(event.currentTarget),
            currentDelBtnParent = currentDelBtn.parent(),
            n = currentDelBtnParent.prevAll().length;
        delete this.userTodoDataTasks[n-1];
        this.userTodoDataTasks = this.userTodoDataTasks.filter(function (el) {
                                        return el != null;
                                    });
        currentDelBtn.parent().remove();
        this.i++;
    }
    delList(){
        let listItems = this.list.children(".todo-item");
        listItems.each((i, task) =>{
            if(i){
                $(task).remove();
            }
        });
    }
    changeTaskStatus(event){
        $(event.currentTarget).toggleClass("done");
    }
    loadAgain(){
        this.sortTasks();
        this.delList();
        this.loadTasks();
    }
    createEvents(){
        this.btnAdd.click(this.addTask.bind(this));
        this.clearBtn.click(this.delList.bind(this));
        this.select.change(this.loadAgain.bind(this)); 
        this.find.on("input", ()=>{
            this.loadAgain();
        });
    }
}

let todoList = new TodoList("#todo");



