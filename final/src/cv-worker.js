Canvas = HTMLCanvasElement = OffscreenCanvas;
HTMLCanvasElement.name = 'HTMLCanvasElement';
Canvas.name = 'Canvas';

function HTMLImageElement(){}
function HTMLVideoElement(){}
function CanvasRenderingContext2D(){}

Image = HTMLImageElement;
Video = HTMLVideoElement;
CanvasRenderingContext2D = CanvasRenderingContext2D;

// Canvas.prototype = Object.create(OffscreenCanvas.prototype);

function Storage () {
	let _data = {};
	this.clear = function(){ return _data = {}; };
	this.getItem = function(id){ return _data.hasOwnProperty(id) ? _data[id] : undefined; };
	this.removeItem = function(id){ return delete _data[id]; };
	this.setItem = function(id, val){ return _data[id] = String(val); };
}
class Document extends EventTarget {}

let window, document = new Document();

let detectorModel, landmarkModel, expressionModel;

let offscreenCanvas, offscreenCanvasCtx;

let busy = false;

function init(event) {
	// do terrible things to the worker's global namespace to fool tensorflow
	for (let key in event.data.fakeWindow) {
		if (!self[key]) {
			self[key] = event.data.fakeWindow[key];
		} 
	}
	window = Window = self;
	localStorage = new Storage();
	// console.log('*faked* Window object for the worker', window);

	for (let key in event.data.fakeDocument) {
		if (document[key]) { continue; }

		let d = event.data.fakeDocument[key];
		// request to create a fake function (instead of doing a proxy trap, fake better)
		if (d && d.type && d.type === '*function*') {
			document[key] = function() { 
				// console.log('FAKE instance', key, 'type', document[key].name, '(',document[key].arguments,')'); 
			};

			document[key].name = d.name;
		} else {
			document[key] = d;
		}
	}
	// console.log('*faked* Document object for the worker', document);

	function createElement(element) {
		// console.log('FAKE ELELEMT instance', createElement, 'type', createElement, '(', createElement.arguments, ')');
		switch(element) {
			case 'canvas':
				// console.log('creating canvas');
				let canvas = new Canvas(1,1);
				canvas.localName = 'canvas';
				canvas.nodeName = 'CANVAS';
				canvas.tagName = 'CANVAS';
				canvas.nodeType = 1;
				canvas.innerHTML = '';
				canvas.remove = () => { 
					// console.log('nope'); 
				};
				// console.log('returning canvas', canvas);
				return canvas;
			default:
				// console.log('arg', element);
				break;
		}
	}

	document.createElement = createElement;
	document.location = self.location;
	// console.log('*faked* Document object for the worker', document);

	offscreenCanvas = new OffscreenCanvas(640, 480);
	offscreenCanvas.width = 640;
	offscreenCanvas.height = 480;
	offscreenCanvasCtx = offscreenCanvas.getContext("2d");

	self.importScripts("../lib/face-api.js");

	detectorModel = faceapi.nets.tinyFaceDetector.loadFromUri("../lib/models");
		
		detectorModel.then(() => {
			landmarkModel = faceapi.nets.faceLandmark68TinyNet.loadFromUri("../lib/models");
		
			landmarkModel.then(() => {
				expressionModel = faceapi.nets.faceExpressionNet.loadFromUri("../lib/models");

				expressionModel.then(() => {
					// console.log("ALL MODELS HAVE BEEN LOADED!!!!!!!!!!");
				});
			});
		});
}

function detectWithExpressions(event) {
	if (busy) {
		return;
	}

	offscreenCanvasCtx.drawImage(event.data.img, 0, 0);
	
	const options = new faceapi.TinyFaceDetectorOptions({inputSize: 160, scoreThreshold: 0.5});
	let detections;
	busy = true;

	if (event.data.getEmotions) {
		detections = faceapi.detectSingleFace(offscreenCanvas, options).withFaceLandmarks(true).withFaceExpressions();
	} else {
		detections = faceapi.detectSingleFace(offscreenCanvas, options).withFaceLandmarks(true);
	}

	detections.then((dets) => {
		postMessage({opcode: 1, dets: dets, frame: event.data.frame});
		busy = false;
	});
}

onmessage = function(event) {
	if (event.data.opcode === 0) {
		init(event);
	} else if (event.data.opcode === 1) {
		detectWithExpressions(event);
	}
}