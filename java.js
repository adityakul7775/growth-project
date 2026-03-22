let tasksByDate = JSON.parse(localStorage.getItem("tasksByDate")) || {};
let today = new Date().toISOString().split("T")[0];

function goToHistory(){
window.location.href = "history.html";
}

function setTodayDate(){
let d = new Date();
document.getElementById("todayDate").innerText =
"📅 " + d.toDateString();
}

function addTask(){

let name = document.getElementById("taskName").value.trim();
let category = document.getElementById("category").value;
let plannedInput = document.getElementById("plannedHours").value;
let deadlineInput = document.getElementById("deadline").value;

if(name===""){ alert("Enter task name"); return;}

let planned = plannedInput==="" ? 0 : Number(plannedInput);

if(planned===0 && deadlineInput===""){
alert("Add hours OR deadline");
return;
}

let taskDate = deadlineInput || today;

if(!tasksByDate[taskDate]){
tasksByDate[taskDate]=[];
}

tasksByDate[taskDate].push({
name,
category,
planned,
actual:0,
done:false,
deadline:taskDate
});

saveTasks();
renderTasks();

taskName.value="";
plannedHours.value="";
deadline.value="";
}

function renderTasks(){

let todayTable = document.getElementById("todayTable");
let futureTable = document.getElementById("futureTable");
let emptyMsg = document.getElementById("emptyMessage");

todayTable.innerHTML="";
futureTable.innerHTML="";
emptyMsg.innerText="";

let allTasks=[];
let todayDate=new Date(today);

Object.keys(tasksByDate).forEach(date=>{
tasksByDate[date].forEach((task,index)=>{
allTasks.push({...task,date,index});
});
});

allTasks.sort((a,b)=>{
let aD=new Date(a.date), bD=new Date(b.date);
let aO=aD<todayDate && !a.done;
let bO=bD<todayDate && !b.done;

if(aO&&!bO) return -1;
if(!aO&&bO) return 1;

if(a.date===today) return -1;
if(b.date===today) return 1;

return aD-bD;
});

if(allTasks.length===0){
emptyMsg.innerText="🎉 No tasks available";
}

allTasks.forEach(task=>{

let row=document.createElement("tr");
let d=new Date(task.date);

let diff=Math.ceil((d-todayDate)/86400000);
let text="Today";
if(diff>0) text=diff+" days remaining";
if(diff<0) text="Overdue";

if(d<todayDate&&!task.done) row.classList.add("overdue-row");
else if(d>todayDate) row.classList.add("future-row");

row.innerHTML=`
<td><input type="checkbox" ${task.done?"checked":""} onchange="toggleTask('${task.date}',${task.index})"></td>
<td>${d>todayDate?"⭐ ":""}${task.name}</td>
<td>${task.category}</td>
<td>${task.planned||"-"}</td>
<td><input type="number" value="${task.actual}" onchange="updateHours('${task.date}',${task.index},this.value)"></td>
<td>${text}</td>
<td><button onclick="deleteTask('${task.date}',${task.index})">❌</button></td>
`;

if(d>todayDate) futureTable.appendChild(row);
else todayTable.appendChild(row);

});

updateStats();
updateHoursBar();
updateAssignmentBar();
}

function toggleTask(date,index){

let task=tasksByDate[date][index];

// ✅ allow if no planned hours
if(!task.done && task.planned>0 && task.actual===0){
alert("Enter hours first");
return;
}

task.done=!task.done;

saveTasks();
renderTasks();
}

function updateHours(date,index,value){

let task=tasksByDate[date][index];
let val=Number(value)||0;

if(val<0) val=0;

if(task.planned>0 && val>task.planned){
alert("Cannot exceed planned");
val=task.planned;
}

task.actual=val;

saveTasks();
renderTasks();
}

function deleteTask(date,index){

tasksByDate[date].splice(index,1);

if(tasksByDate[date].length===0){
delete tasksByDate[date];
}

saveTasks();
renderTasks();
}

function updateStats(){

let t=tasksByDate[today]||[];
let total=t.length;
let done=t.filter(x=>x.done).length;

let p=total?Math.round(done/total*100):0;

document.getElementById("totalTasks").innerText=total;
document.getElementById("completedTasks").innerText=done;
document.getElementById("completionPercent").innerText=p+"%";

document.getElementById("progress-bar").style.width=p+"%";
}

function updateHoursBar(){

let t=tasksByDate[today]||[];

let planned=t.reduce((s,x)=>s+(x.planned||0),0);
let actual=t.reduce((s,x)=>s+(x.actual||0),0);

let per=planned?(actual/planned)*100:0;

document.getElementById("hoursText").innerText=actual+"/"+planned+"h";
document.getElementById("hours-bar").style.width=per+"%";
}

function updateAssignmentBar(){

let future=[];
let todayDate=new Date(today);

Object.keys(tasksByDate).forEach(d=>{
if(new Date(d)>todayDate){
future=future.concat(tasksByDate[d]);
}
});

let total=future.length;
let done=future.filter(t=>t.done).length;

let p=total?Math.round(done/total*100):0;

document.getElementById("assignment-progress-bar").style.width=p+"%";
document.getElementById("assignmentPercent").innerText=p+"%";
}

function saveTasks(){
localStorage.setItem("tasksByDate",JSON.stringify(tasksByDate));
}

setTodayDate();
renderTasks();