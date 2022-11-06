const changeListenInterval = 300;
const earthRad = 6378137;
let cursorTargetElement = document.getElementsByClassName("widget-scene")[0];

let oldUrl = "";
let observer;
let showOverlayTimer = undefined;
let isOverlayClose = true;
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
		CreateOverlay(26.5, 118.0, 6, 6, `<img class="overlayImg" src="https://www.cwb.gov.tw/Data/radar/CV1_TW_3600_202211070240.png">`);
	
		setInterval(ChangeListener, changeListenInterval);
	}, 300);

	overlayLayer = document.createElement('div');
	document.getElementById("scene").appendChild(overlayLayer);
	overlayLayer.id = "overlayLayer";
	overlayLayer.classList.add("overlayLayer");

	overlayLayer.style.setProperty("--activeOpacity", "0.3");

}

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
		horiDegDiv = 2 * Math.asin(width * mpx / (2 * earthRad)) * 180 / Math.PI;
		vertDegDiv = 2 * Math.asin(height * mpx / (2 * earthRad)) * 180 / Math.PI;
		//horiDegDiv = width * mpx * 360 / 2 / earthRad / Math.PI;
		//vertDegDiv = height * mpx * 360/ 2 / earthRad / Math.PI;


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

		console.log(mapParam);

		UpdateOverlay();
	}
}

// curser change callback
function CursorChangeCallback(mutationList, o){
	for (const mutation of mutationList) {
		if (mutation.type === 'attributes' && mutation.attributeName === "style") {
			if(cursorTargetElement.style.cursor === "auto" && isOverlayClose){
				showOverlayTimer = setTimeout(ShowOverlay, 5000);
			}else if(cursorTargetElement.style.cursor === "move"){
				HideOverlay();
			}
		}
	}
};

function HideOverlay(){
	//hide overlay
	isOverlayClose = true;
	overlayLayer.classList.remove("active");
}

function ShowOverlay(){
	//show overlay
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
		console.log(overlays[i]);
		UpdateSingleOverlay(overlays[i]);
	}
	
	console.log("update overlay");
}

function CreateOverlay(lat, lon, latDiff, lonDiff, content, active=true){
	let newOverlay = document.createElement('div');
	newOverlay.classList.add("overlay");
	overlayLayer.appendChild(newOverlay);
	newOverlay.setAttribute("lat", lat );
	newOverlay.setAttribute("lon", lon );
	newOverlay.setAttribute("latDiff", latDiff);
	newOverlay.setAttribute("lonDiff", lonDiff);

	newOverlay.innerHTML = content;

	if(active){
		newOverlay.classList.add("active");
	}

	UpdateSingleOverlay(newOverlay);
}

function UpdateSingleOverlay(overlay){
	console.log("update single overlay");
	let lat = overlay.getAttribute("lat");
	let lon = overlay.getAttribute("lon");
	let latDiff = overlay.getAttribute("latDiff");
	let lonDiff = overlay.getAttribute("lonDiff");
	let width = lonDiff * mapParam.lon2px;
	let height = latDiff * mapParam.lat2px;

	console.log(mapParam);
	overlay.style.width = `${width}px`;
	overlay.style.height = `${height}px`;
	overlay.style.top = `${-(lat - mapParam.lat) * mapParam.lat2px + mapParam.height / 2}px`;
	overlay.style.left = `${(lon - mapParam.lon) * mapParam.lon2px /** 0.9173128938*/ + mapParam.width / 2}px`;
}

// entry point
document.addEventListener("DOMContentLoaded", LoadInject);