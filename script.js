// constants
var speed = 1000;
var sec_count_default = 60;
var tick_for_seconds = 2 * Math.PI / (60);


//necessary values for the timer
var	tick_for_minutes;
var globCount_sec = 0;
var globCount_min = 0;
var interval;

//control flow
var started = false;
var	paused = false;
var	first = true;
var	work = true;

//values from spinner
var minutes_work;
var minutes_pause;
var cycle = 0;

//grapics
var canvas_sec, circle_sec;
var canvas_min, circle_min;
var twelveOClock = 1.5 * Math.PI;
var strokeWidth = 20;
var radius = 100;
var x = 130;
var y = 120;



function init() {
	$("#spinner_work").spinner("value", 1);
	$("#spinner_cycle").spinner("value", 1);
	$("#spinner_pause").spinner("value", 1);
	initGraphics();
}

function startInterval() {
	
	interval = setInterval(tick, speed);
}

function start() {
	//re-init the timer with current values
	if (started && !paused) {
		reset();
	}

	toggleHeader("close");

	//set for current values; first is necessary in order to prevent updating the variables after hitting resume
	if (first) {
		minutes_work = $("#spinner_work").spinner("value");
		minutes_pause = $("#spinner_pause").spinner("value");
		cycle = $("#spinner_cycle").spinner("value");
		paused = false;
		started = false;
	}

	//not paused, not started and a valid worktime interval: start a work cycle
	if (!paused && !started && minutes_work != 0) {
		initWorkCycle();
		initAlgo();
		setDisplayedValues(minutes_work, 0, cycle);
		//not paused, not started and a valid pausetime interval: start a pause cycle
	} else if (!paused && !started && minutes_pause != 0) {
		initRelaxCycle();
		initAlgo();
		setDisplayedValues(minutes_pause, 0, cycle);
		//no valid intervals specified: start nothing!
	} else if (minutes_work == 0 && minutes_pause == 0) {
		setTextForElement("no time :(", "txt");
		return;
	}

	//state
	started = true;
	paused = false;

	button_start();

	//starts the clock
	startInterval();

	setTextForElement("restart", "btn_start")
}

function pause() {
	if (!started) return;

	started = false;
	paused = true;

	button_pause();

	clearInterval(interval);
}

function hardReset() {
	toggleHeader("open");
	setDisplayedValues(0, 0, 0);
	button_reset();
	reset();
}

function reset() {
	setCycleText(0 + " cycles to go.");

	circle_sec.clearRect(0, 0, canvas_sec.width, canvas_sec.height);
	circle_min.clearRect(0, 0, canvas_sec.width, canvas_sec.height);

	globCount_sec = 0;
	globCount_min = 0;
	current_second = sec_count_default;
	minCount = 0;

	started = false;
	paused = false;
	first = true;

	initGraphics();

	clearInterval(interval);
}

function button_start() {
	document.getElementById("btn_pause").className = "btn";
	document.getElementById("btn_start").className = "button_active";
	document.getElementById("btn_start").innerText = "start";
}

function button_pause() {
	document.getElementById("btn_start").className = "btn";
	document.getElementById("btn_start").innerText = "resume";
	document.getElementById("btn_pause").className = "button_active";
}

function button_reset() {
	document.getElementById("btn_start").className = "btn";
	document.getElementById("btn_pause").className = "btn";
	document.getElementById("btn_start").innerText = "start";
}

function initGraphics() {
	initLeftCircle();
	initRightCircle();
}

function initRightCircle() {
	canvas_sec = document.getElementById("canvas_sec");
	circle_sec = canvas_sec.getContext("2d");
	circle_sec.beginPath();
	circle_sec.strokeStyle = '#64b5d1';
	circle_sec.arc(y, x, radius, twelveOClock, twelveOClock + 2 * Math.PI);
	circle_sec.lineWidth = strokeWidth;
	circle_sec.stroke();
}

function initLeftCircle() {
	canvas_min = document.getElementById("canvas_min");
	circle_min = canvas_min.getContext("2d");
	circle_min.beginPath();
	circle_min.strokeStyle = '#64b5d1';
	circle_min.arc(y, x, radius, twelveOClock, twelveOClock + 2 * Math.PI);
	circle_min.lineWidth = strokeWidth;
	circle_min.stroke();
}

function setDisplayedValues(min, sec, cycle) {
	document.getElementById("timeSec").innerHTML = sec;
	document.getElementById("timeMin").innerHTML = min;
	updateCycleText(cycle);
}

function initNextCycle() {
	console.log("init next cycle");
	decreaseCycleCount();
	if (cycle > 0) {
		startNextCycle();
	} else {
		fin();
	}
}

function decreaseCycleCount() {
	var norelax = false;
	var nowork = false;
	//console.log(minutes_pause + " - " + minutes_work);
	if (minutes_pause === 0) norelax = true;
	if (minutes_work === 0) nowork = true;

	if (norelax || nowork) {
		cycle -= 1;
	}
	//was the last cycle a relax cycle?
	else if (!work) {
		cycle -= 1;
	}
}

function startNextCycle() {
	console.log("start next cycle");

	if (work) {
		if (minutes_pause > 0) {
			initRelaxCycle();
		} else {
			initWorkCycle();
		}
	} else {
		initWorkCycle();
	}
	initAlgo();
	setDisplayedValues(minCount, 0, cycle);
	started = true;
	startInterval();
}

function fin() {
	setTextForElement("Yay! \\o/", "txt");
	setCycleText("fin.")
	toggleHeader("open");
	hardReset();
}

function initRelaxCycle() {
	minCount = minutes_pause;
	if (minCount != 0)
		setTextForElement("relax", "txt");
	work = false;
}

function initWorkCycle() {
	minCount = minutes_work;
	if (minCount != 0)
		setTextForElement("work", "txt");
	work = true;

}

function initAlgo() {
	current_second = 0;
	tick_for_minutes = 2 * Math.PI / minCount;
}

//sets the inner text for a element with id text to name.
function setTextForElement(text, name) {
	
	document.getElementById(name).innerHTML = text;
}


function tick() {

	if (!started) return;

	//wait one second in order to display the set time
	if (first) {
		first = false;
		return;
	}

	//Sec  
	if (current_second - 1 == -1) {
		document.getElementById("timeSec").innerHTML = sec_count_default;
		--current_second;
		//display 59
		document.getElementById("timeSec").innerHTML = 59;
	} else {
		document.getElementById("timeSec").innerHTML = --current_second;
	}
	

	if (current_second == -1) {
		
		circle_sec.clearRect(0, 0, canvas_sec.width, canvas_sec.height);
		initRightCircle();
		
		//init with sec = 59
		current_second = sec_count_default - 1;
		//angle is assigned at the end of the function
		globCount_sec = 0;

		drawAMinuteTick();
		globCount_min += tick_for_minutes;

		if (minCount != 0) {
			document.getElementById("timeMin").innerHTML = --minCount;
		} else {
			playSound();
			reset();
			initNextCycle()
			return;
		}
	}
	globCount_sec += tick_for_seconds;
	drawASecondTick()
}

function drawASecondTick() {
	//console.log("draw sec" + ", " + current_second + ", " + globCount_sec);
	circle_sec.beginPath();
	circle_sec.strokeStyle = 'white';
	circle_sec.arc(y, x, radius, twelveOClock, globCount_sec + twelveOClock);
	circle_sec.lineWidth = strokeWidth;
	circle_sec.stroke();
}

function drawAMinuteTick() {
	circle_min.beginPath();
	circle_min.strokeStyle = 'white';
	circle_min.arc(y, x, radius, twelveOClock, globCount_min + twelveOClock);
	circle_min.lineWidth = strokeWidth;
	circle_min.stroke();
}

function playSound() {
	var play = true;

	if (minutes_work == 0 && work) play = false;
	if (minutes_pause == 0 && !work) play = false;
	if (play) {
		new Audio('ding.mp3').play()
	}
}

function updateCycleText(val) {
	if (cycle != 1) setCycleText(val + " cycles to go");
	if (cycle === 1) setCycleText(val + " cycle to go");
}

function setCycleText(val) {

	document.getElementById("cycleCount").innerHTML = val;
}

function toggleHeader(val) {
	var toggle = false;
	var isVisible = $(document.getElementById("toggle")).is(":visible")


	if (val === "close" && isVisible) {
		toggle = true;
	} else if (val === "open" && !isVisible) {
		toggle = true;
	}

	if (toggle) $(document.getElementById("toggle")).toggle("blind");

}