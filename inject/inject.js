const changeListenInterval = 50;
const earthRad = 6378137;
const lat150km = 2.72441928;
const lon150km = 2.97;

let cursorTargetElement = document.getElementsByClassName("widget-scene")[0];

let oldUrl = "";
let observer;
let showOverlayTimer = undefined;
let isOverlayClose = true;
let forceClose = true;
let overlayLayer;
let mapParam = {
	width: 0,
	height: 0,
	lat2px:0,
	lon2px:0,
	lat: 0,
	lon: 0,
	minLat: 0,
	maxLat: 0,
	minLon: 0,
	maxLon: 0
}

let radarOverlays = {};
let settingElement;
let mouseStartCoord = undefined;

//--------------------------------
//
// Initialization functions
//
//--------------------------------

// loading function
function LoadInject(){
	console.log("inject loaded");

	const cursorWatchAttr = {attributes:true};
	
	setTimeout(()=>{
		cursorTargetElement = document.getElementsByClassName("widget-scene")[0];
		observer = new MutationObserver(CursorChangeCallback);
		observer.observe(cursorTargetElement, cursorWatchAttr);
		
		//CreateOverlay(23.829008, 120.955836, 1, 1, `<div class="overlayImg" style="background-color:blue;"></div>`);
		//CreateOverlay(25.012713,121.542978, 1, 1, `<div class="overlayImg" style="background-color:blue;"></div>`);
		radarOverlays.taiwan = CreateOverlay(23.5, 121, 6, 6, `<img class="overlayImg" src="https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0058-003.png">`, "taiwan");
		radarOverlays.shulin = CreateOverlay(25.003870, 121.400658, lat150km, lon150km, `<img class="overlayImg" src="https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-001.png">`, "shulin", false);
		radarOverlays.nantun = CreateOverlay(24.14,120.58, lat150km, lon150km, `<img class="overlayImg" src="https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-002.png">`, "nantun", false);
		radarOverlays.linyuan = CreateOverlay(22.53, 120.38, lat150km, lon150km, `<img class="overlayImg" src="https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-003.png">`, "linyuan", false);
	
		setInterval(ChangeListener, changeListenInterval);

		document.getElementById("scene").addEventListener("wheel", HideOverlayOnZoom);
	}, 300);

	overlayLayer = document.createElement('div');
	document.getElementById("scene").appendChild(overlayLayer);
	overlayLayer.id = "overlayLayer";
	overlayLayer.classList.add("overlayLayer");

	overlayLayer.style.setProperty("--activeOpacity", "0.5");

	CreateSetting();
}

function CreateSetting(){
	let temp;
	let block;
	let line;

	settingElement = document.createElement("div");
	document.body.appendChild(settingElement);
	settingElement.classList.add("settingPanel");
	settingElement.classList.add("window");

	temp = document.createElement('div');
	settingElement.appendChild(temp);
	temp.innerText = "<";
	temp.classList.add("menubutton");
	temp.id = "menubutton";
	temp.addEventListener("click", ToggleSettingPanel);

	{
		block = document.createElement("div");
		block.classList.add("block");
		settingElement.appendChild(block);
	
		line = document.createElement("div");
		line.classList.add("title");
		line.innerText = "Overlay";
		block.appendChild(line);
		//toggle overlay
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Overlay";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		temp.setAttribute("type", "checkbox");
		//temp.setAttribute("checked", "");
		temp.addEventListener("input", ToggleOverlay);
		line.appendChild(temp);
	
		//overlay opacity
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Opacity";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		// type="range" min="1" max="100" value="50"
		temp.setAttribute("type", "range");
		temp.setAttribute("min", "0");
		temp.setAttribute("max", "100");
		temp.setAttribute("value", "50");
		temp.addEventListener("input", ChangeOverlayOpacity);
		line.appendChild(temp);
	}

	{
		block = document.createElement("div");
		block.classList.add("block");
		settingElement.appendChild(block);
	
		line = document.createElement("div");
		line.classList.add("title");
		line.innerText = "Taiwan Overlay";
		block.appendChild(line);

		//toggle overlay
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Overlay";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		temp.setAttribute("type", "checkbox");
		temp.setAttribute("checked", "");
		temp.setAttribute("target", "taiwan");
		temp.addEventListener("input", ToggleSingleOverlay);
		line.appendChild(temp);

		//toggle background
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Background";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		temp.setAttribute("type", "checkbox");
		temp.setAttribute("checked", "");
		temp.setAttribute("target", "taiwan");
		temp.addEventListener("input", ToggleTaiwanRadarBackground);
		line.appendChild(temp);
	
		//overlay opacity
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Opacity";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		// type="range" min="1" max="100" value="50"
		temp.setAttribute("type", "range");
		temp.setAttribute("min", "0");
		temp.setAttribute("max", "100");
		temp.setAttribute("value", "50");
		temp.setAttribute("target", "taiwan");
		temp.addEventListener("input", ChangeSingleOverlayOpacity);
		line.appendChild(temp);
	}

	{
		block = document.createElement("div");
		block.classList.add("block");
		settingElement.appendChild(block);
	
		line = document.createElement("div");
		line.classList.add("title");
		line.innerText = "ShuLin Overlay";
		block.appendChild(line);

		//toggle overlay
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Overlay";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		temp.setAttribute("type", "checkbox");
		temp.setAttribute("target", "shulin");
		temp.addEventListener("input", ToggleSingleOverlay);
		line.appendChild(temp);
	
		//overlay opacity
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Opacity";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		// type="range" min="1" max="100" value="50"
		temp.setAttribute("type", "range");
		temp.setAttribute("min", "0");
		temp.setAttribute("max", "100");
		temp.setAttribute("value", "50");
		temp.setAttribute("target", "shulin");
		temp.addEventListener("input", ChangeSingleOverlayOpacity);
		line.appendChild(temp);
	}

	{
		block = document.createElement("div");
		block.classList.add("block");
		settingElement.appendChild(block);
	
		line = document.createElement("div");
		line.classList.add("title");
		line.innerText = "NanTun Overlay";
		block.appendChild(line);

		//toggle overlay
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Overlay";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		temp.setAttribute("type", "checkbox");
		temp.setAttribute("target", "nantun");
		temp.addEventListener("input", ToggleSingleOverlay);
		line.appendChild(temp);
	
		//overlay opacity
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Opacity";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		// type="range" min="1" max="100" value="50"
		temp.setAttribute("type", "range");
		temp.setAttribute("min", "0");
		temp.setAttribute("max", "100");
		temp.setAttribute("value", "50");
		temp.setAttribute("target", "nantun");
		temp.addEventListener("input", ChangeSingleOverlayOpacity);
		line.appendChild(temp);
	}

	{
		block = document.createElement("div");
		block.classList.add("block");
		settingElement.appendChild(block);
	
		line = document.createElement("div");
		line.classList.add("title");
		line.innerText = "LinYuan Overlay";
		block.appendChild(line);

		//toggle overlay
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Overlay";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		temp.setAttribute("type", "checkbox");
		temp.setAttribute("target", "linyuan");
		temp.addEventListener("input", ToggleSingleOverlay);
		line.appendChild(temp);
	
		//overlay opacity
		line = document.createElement("div");
		block.appendChild(line);
		line.classList.add("line");
		
		temp = document.createElement("h3")
		temp.innerText = "Opacity";
		temp.classList.add("name");
		line.appendChild(temp);
		temp = document.createElement("input")
		temp.classList.add("input");
		// type="range" min="1" max="100" value="50"
		temp.setAttribute("type", "range");
		temp.setAttribute("min", "0");
		temp.setAttribute("max", "100");
		temp.setAttribute("value", "50");
		temp.setAttribute("target", "linyuan");
		temp.addEventListener("input", ChangeSingleOverlayOpacity);
		line.appendChild(temp);
	}
}

function CreateOverlay(maxLat, minLon, latDiff, lonDiff, content, id, active=true){
	let newOverlay = document.createElement('div');
	newOverlay.classList.add("overlay");
	overlayLayer.appendChild(newOverlay);
	newOverlay.setAttribute("lat", maxLat  + latDiff / 2);
	newOverlay.setAttribute("lon", minLon - lonDiff / 2);
	newOverlay.setAttribute("latDiff", latDiff);
	newOverlay.setAttribute("lonDiff", lonDiff);

	newOverlay.innerHTML = content;

	newOverlay.id = id;

	if(active){
		newOverlay.classList.add("active");
	}

	UpdateSingleOverlay(newOverlay);

	return newOverlay;
}


//--------------------------------
//
// Map utility functions
//
//--------------------------------
// change listener
function ChangeListener(){
	if(oldUrl !== document.URL){
		let strProc;
		let width = window.innerWidth / 2;
		let height = window.innerHeight / 2;
		let horiDegDiv;
		let vertDegDiv;
		let mpx;

		oldUrl = document.URL;
		

		//extract position information from query
		strProc = oldUrl.split("@")[1].split("?")[0].split(',');
		strProc[0] = parseFloat(strProc[0]);
		strProc[1] = parseFloat(strProc[1]);
		strProc[2] = parseFloat(strProc[2].replace('z', ""));

		mpx = 156543.03392 * Math.cos(strProc[0] * Math.PI / 180) / Math.pow(2, strProc[2]);
		horiDegDiv = 2 * Math.asin(width * mpx / (2 * earthRad)) * 180 / Math.PI / 0.9173128938;
		vertDegDiv = 2 * Math.asin(height * mpx / (2 * earthRad)) * 180 / Math.PI;


		mapParam.lat = strProc[0];
		mapParam.lon = strProc[1];
		mapParam.minLat = strProc[0] - vertDegDiv;
		mapParam.maxLat = strProc[0] + vertDegDiv;
		mapParam.minLon = strProc[1] - horiDegDiv;
		mapParam.maxLon = strProc[1] + horiDegDiv;
		mapParam.width = window.innerWidth;
		mapParam.height = window.innerHeight;
		mapParam.lat2px = height / (vertDegDiv);
		mapParam.lon2px = width / (horiDegDiv);

		UpdateOverlay();
	}
}

// curser change callback
function CursorChangeCallback(mutationList, o){
	for (const mutation of mutationList) {
		if (mutation.type === 'attributes' && mutation.attributeName === "style") {
			if(cursorTargetElement.style.cursor === "auto"){
				//showOverlayTimer = setTimeout(ShowOverlay, 5000);
				document.getElementById("scene").removeEventListener("mousemove", OncursorMove);
				if(mouseStartCoord !== undefined){
					//MoveOverlayMomentum(mouseStartCoord.deltaMouseCoord.x, mouseStartCoord.deltaMouseCoord.y, mouseStartCoord.deltaMouseCoord.t);
					HideOverlay();
				}
				mouseStartCoord = undefined;


			}else if(cursorTargetElement.style.cursor === "move"){
				if(mouseStartCoord === undefined){
					mouseStartCoord = null;
					document.getElementById("scene").addEventListener("mousemove", OncursorMove);
				}
			}
		}
	}
};

function OncursorMove(event){
	let overlays = overlayLayer.getElementsByClassName("overlay");
	if(!mouseStartCoord){
		mouseStartCoord = {};
		mouseStartCoord.x = event.clientX;
		mouseStartCoord.y = event.clientY;
		mouseStartCoord.oldCoord = [];
		mouseStartCoord.lastMouseCoord = {
			x:event.clientX,
			y:event.clientY,
			t:event.timeStamp
		};
		mouseStartCoord.deltaMouseCoord = {
			x:0,
			y:0,
			t:0
		};
		for(let i = 0;i<overlays.length;++i){
			let rect = overlays[i].getBoundingClientRect();
			mouseStartCoord.oldCoord.push({
					x:rect.x,
					y:rect.y
				});
		}
		return;
	}

	for(let i = 0;i<overlays.length;++i){
		overlays[i].style.top = `${mouseStartCoord.oldCoord[i].y + event.clientY - mouseStartCoord.y}px`;
		overlays[i].style.left = `${mouseStartCoord.oldCoord[i].x + event.clientX - mouseStartCoord.x}px`;
	}

	mouseStartCoord.deltaMouseCoord = {
		x : mouseStartCoord.deltaMouseCoord.x * 0.1 + (event.clientX - mouseStartCoord.lastMouseCoord.x) * 0.9,
		y : mouseStartCoord.deltaMouseCoord.y * 0.1 + (event.clientY - mouseStartCoord.lastMouseCoord.y)* 0.9,
		t : mouseStartCoord.deltaMouseCoord.t * 0.1 + (event.timeStamp - mouseStartCoord.lastMouseCoord.t)* 0.9
	}

	mouseStartCoord.lastMouseCoord = {
		x:event.clientX,
		y:event.clientY,
		t:event.timeStamp
	};
}

function HideOverlayOnZoom(){
	HideOverlay();
	if(showOverlayTimer){
		clearTimeout(showOverlayTimer);
	}
	showOverlayTimer = setTimeout(ShowOverlay, 5000);
}

//----------------------------------
//
// Overlay functions
//
//----------------------------------
function HideOverlay(){
	//hide overlay
	isOverlayClose = true;
	overlayLayer.classList.remove("active");
}

function ShowOverlay(){
	//show overlay
	if(forceClose)return;
	isOverlayClose = false;
	overlayLayer.classList.add("active");
}

function UpdateOverlay(){
	if(showOverlayTimer){
		clearTimeout(showOverlayTimer);
		showOverlayTimer = undefined;
	}

	//show overlay
	if(isOverlayClose){
		ShowOverlay();
	}

	let overlays = overlayLayer.getElementsByClassName("overlay");

	for(let i = 0;i<overlays.length;++i){
		UpdateSingleOverlay(overlays[i]);
	}
	
	console.log("update overlay");
}

function UpdateSingleOverlay(overlay){
	let lat = overlay.getAttribute("lat");
	let lon = overlay.getAttribute("lon");
	let latDiff = overlay.getAttribute("latDiff");
	let lonDiff = overlay.getAttribute("lonDiff");
	let width = lonDiff * mapParam.lon2px;
	let height = latDiff * mapParam.lat2px;

	overlay.style.width = `${width}px`;
	overlay.style.height = `${height}px`;
	overlay.style.top = `${-(lat - mapParam.lat) / latDiff * height + mapParam.height / 2}px`;
	overlay.style.left = `${(lon - mapParam.lon) / lonDiff * width  + mapParam.width / 2 }px`;
}

function ToggleOverlay(){
	if(overlayLayer.classList.contains("active")){
		forceClose = true;
		overlayLayer.classList.remove("active");
	}else{
		forceClose = false;
		overlayLayer.classList.add("active");
	}
}

function ToggleSingleOverlay(event){
	let target = document.getElementById(event.target.getAttribute("target"));
	if(target.classList.contains("active")){
		target.classList.remove("active");
	}else{
		target.classList.add("active");
	}
}


//-----------------------------------------
//
// Button Actions
//
//-----------------------------------------
function ToggleTaiwanRadarBackground(event){
	let target = document.getElementById("taiwan");
	if(event.target.checked){
		target.innerHTML = `<img class="overlayImg" src="https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0058-003.png">`;
	}else{
		target.innerHTML = `<img class="overlayImg" src="https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0058-006.png">`;

	}
}

function ChangeOverlayOpacity(event){
	overlayLayer.style.setProperty("--activeOpacity", (parseFloat(event.target.value) / 100).toString());
}

function ChangeSingleOverlayOpacity(event){
	document.getElementById(event.target.getAttribute("target")).getElementsByClassName("overlayImg")[0].style.opacity =  (parseFloat(event.target.value) / 100).toString();
}

function ToggleSettingPanel(){
	if(settingElement.classList.contains("active")){
		settingElement.classList.remove("active");
		document.getElementById("menubutton").innerText = "<";
	}else{
		settingElement.classList.add("active");
		document.getElementById("menubutton").innerText = ">";
	}
}

// entry point
document.addEventListener("DOMContentLoaded", LoadInject);