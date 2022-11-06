const changeListenInterval = 300;
const cursorTargetElement = document.getElementsByClassName("widget-scene")[0];

let oldUrl = "";
let observer;
let updateOverlayTimer = undefined;


// loading function
function LoadInject(){
	console.log("inject loaded");

	const cursorWatchAttr = {attributes:true};
	
	
	observer = new MutationObserver(CursorChangeCallback);

	observer.observe(cursorTargetElement, cursorWatchAttr);

	setInterval(ChangeListener, changeListenInterval);
}

// change listener
function ChangeListener(){
	if(oldUrl !== document.URL){
		oldUrl = document.URL;
		console.log("changed");
	}
}

// curser change callback
function CursorChangeCallback(mutationList, o){
	for (const mutation of mutationList) {
		if (mutation.type === 'attributes' && mutation.attributeName === "style") {
			console.log(cursorTargetElement.style["cursor"]);
		}
	}
};

function CloseOverlay(){
	console.log("close overlay");
}

function UpdateOverlay(){
	console.log("update overlay");
}


// entry point
LoadInject();