window.onload = () => {
	// Handle for our animationFrame loop
	let loopHandler;

	// For our optical frame sync system
	let lastframe = 0;

	// This offset is used to compensate for the physical horizontal placement of the user's webcam
	const webcamCenterOffset = 0;

	// Globals for page elements
	const movie = document.getElementById("movie");
	const movieCanvasContainer = document.getElementById("movie-canvas-container");
	const movieCanvas = document.getElementById("movie-canvas");
	const webcamVideo = document.getElementById("webcam-video");
	const arCanvas = document.getElementById("ar-canvas");
	const arOverlay = document.getElementById("ar-overlay");
	const wireframeOverlay = document.getElementById("wireframe-overlay");
	const masterContainer = document.getElementById("master-container");
	const overlayContainer = document.getElementById("overlay-container");
	const playButton = document.getElementById("play-button");

	// Globals for AR props
	const spyHat = document.getElementById("spy-hat");
	const spyGlasses = document.getElementById("spy-glasses");

	// Globals for the dimensions of the user's webcam and some coords we derive
	let webcamW, webcamH, webcamCenter, webcamAspect;

	// Experimental - set eigenvector 9 and 11 to not be regularized
	// pModel.shapeModel.nonRegularizedVectors.push(9);
	// pModel.shapeModel.nonRegularizedVectors.push(11);

	// Our instance of the clmtrackr object
	const ctrack = new clm.tracker();
	ctrack.init();

	// Our instance of the emotion classifier
	delete emotionModel["disgusted"];
	delete emotionModel["fear"];
	const ec = new emotionClassifier();
	ec.init(emotionModel);
	const emotionData = ec.getBlank();

	// When the user's webcam stream is ready, we grab some info about its dimensions
	webcamVideo.addEventListener("canplay", () => {
		webcamW = webcamVideo.videoWidth;
		webcamH = webcamVideo.videoHeight;
		webcamCenter = Math.floor(webcamW / 2);
		webcamAspect = webcamW / webcamH;
	}, false);

	// Event listener to enable the play button
	if (movie.readyState !== 4) {
		movie.oncanplaythrough = () => {
			playButton.style.visibility = "visible";
			playButton.style.cursor = "pointer";
		}
	} else {
		playButton.style.visibility = "visible";
		playButton.style.cursor = "pointer";
	}
		
	// Event listener to reset the experience when the movie is over
	movie.onended = () => {
		cancelAnimationFrame(loopHandle);
		webcamVideo.pause();
		movie.pause();
		movie.currentTime = 0;
		ctrack.stop();
		movieCanvasCtx.clearRect(0, 0, movieCanvas.width, movieCanvas.height);
		playButton.style.cursor = "pointer";
	}

	// Dynamically set the dimensions of our canvases and such
	arCanvas.width = arCanvas.clientWidth;
	arCanvas.height = arCanvas.clientHeight;
	arOverlay.width = arOverlay.clientWidth;
	arOverlay.height = arOverlay.clientHeight;
	wireframeOverlay.width = wireframeOverlay.clientWidth;
	wireframeOverlay.height = wireframeOverlay.clientHeight;
	movieCanvas.width = 964; // This is hard coded due to some cross-browser weirdness - we'll suss it out
	movieCanvas.height = movieCanvas.clientHeight;

	// Grab canvas contexts
	const movieCanvasCtx = movieCanvas.getContext("2d");
	const arCanvasCtx = arCanvas.getContext("2d");
	const arOverlayCtx = arOverlay.getContext("2d");
	const wireframeOverlayCtx = wireframeOverlay.getContext("2d");

	// Access user's webcam and set some stuff up
	navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
		webcamVideo.srcObject = stream;
		webcamVideo.style.display = "none";
	}).catch(err => {
		alert(err);
	});

	// Begin the experience
	function showtime() {
		if (movie.currentTime === 0) {
			playButton.style.cursor = "default";
			movie.play();
			webcamVideo.play();
			ctrack.start(arCanvas);
			loopHandle = requestAnimationFrame(mainLoop);
		}	
	}

	// Main event loop
	function mainLoop() {
		// Get our frame number
		const frame = getOpticalFrame(movieCanvasCtx);

		// Draw the current frame of the movie to the movie canvas
		movieCanvasCtx.drawImage(movie, 0, 0, 964, 540);
		// TODO: We should cache the below calculations instead of performing them every frame
		arCanvasCtx.drawImage(webcamVideo, webcamCenter - (Math.floor(webcamH * 0.59259) / 2) + webcamCenterOffset, 0, Math.floor(webcamH * 0.59259), webcamH, 0, 0, arCanvas.width, arCanvas.height);
		
		wireframeOverlayCtx.clearRect(0, 0, wireframeOverlay.width, wireframeOverlay.height);
		arOverlayCtx.clearRect(0, 0, arOverlay.width, arOverlay.height);

		const positions = ctrack.getCurrentPosition();
		let cp;

		if (positions) {
			const score = ctrack.getScore();
			cp = ctrack.getCurrentParameters();

			const emotions = ec.meanPredict(cp);

			wireframeOverlayCtx.fillStyle = "rgb(130, 255, 50)";
			wireframeOverlayCtx.font = "20px Arial";
			wireframeOverlayCtx.fillText("FACE DETECTED", 30, 30);
			wireframeOverlayCtx.fillText("faceiness: " + score.toFixed(2), 30, 60);
			wireframeOverlayCtx.font = "16px Arial";
			wireframeOverlayCtx.fillText("ANGRY SAD SURPRISED HAPPY", 34, 530);

			if (emotions) {
				wireframeOverlayCtx.fillRect(64, 510, -20, -emotions[0]["value"] * 60);
				wireframeOverlayCtx.fillRect(124, 510, -20, -emotions[1]["value"] * 60);
				wireframeOverlayCtx.fillRect(184, 510, -20, -emotions[2]["value"] * 60);
				wireframeOverlayCtx.fillRect(264, 510, -20, -emotions[3]["value"] * 60);
			}

			ctrack.draw(wireframeOverlay);
		} else {
			wireframeOverlayCtx.fillStyle = "rgb(130, 255, 50)";
			wireframeOverlayCtx.fillText("NO FACE DETECTED", 30, 30);
			wireframeOverlayCtx.fillText("check camera", 30, 60);
			wireframeOverlayCtx.fillText("check lighting", 30, 90);
		}

		// Check for dropped frames and compensate
		const diff = frame - lastframe;
		if (diff > 1) {
        	for (let i = 1; i < diff; i += 1) {
				event(lastframe + i, positions, cp);
        	}
    	}

    	lastframe = frame;

		// TODO: switch to the functional event system I've been brainstorming rather than the old style conditional one
		event(frame, positions, cp);

		arDraw(positions, cp);

		loopHandle = requestAnimationFrame(mainLoop);
	}

	// Called every update cycle - we modify this function, adding and removing AR overlay draw functions, to persist visuals in the AR space
	function arDraw(positions, cp) {

	}

	// TODO: This is the old style conditional event system - let's switch to the functional system I've been brainstorming
	function event(frame, positions, cp) {
		if (frame === 465) {
			masterContainer.style.visibility = "visible";
			overlayContainer.style.visibility = "visible";
		}

		if (frame === 909) {
			arDraw = function(positions, cp) {
				if (positions) {
					const s = Math.sqrt(cp[0] * 1.5);

					const hatScaledWidth = 187 * s;
					const hatScaledHeight = 114 * s;
					const hatOffsetFromCenter = Math.floor(hatScaledWidth / 1.8);
					
					const glassesScaledWidth = 142 * s;
					const glassesScaledHeight = 51 * s;
					const glassesOffsetFromCenter = Math.floor(glassesScaledWidth / 2);

					arOverlayCtx.save();
					arOverlayCtx.translate(positions[33][0], positions[33][1]);
					arOverlayCtx.rotate(cp[1] * 0.8);

					arOverlayCtx.drawImage(spyHat, -hatOffsetFromCenter, -130 * s, hatScaledWidth, hatScaledHeight);
					arOverlayCtx.drawImage(spyGlasses, -glassesOffsetFromCenter, -20 * s, glassesScaledWidth, glassesScaledHeight);

					arOverlayCtx.restore();
				}
			}
		}

		if (frame === 1276) {
			arDraw = function(positions, cp) {
				if (positions) {
					for (let i = 0, len = positions.length; i < len; i += 1) {
						arOverlayCtx.fillStyle = "rgb(130, 255, 50)";
						arOverlayCtx.font = "6px Arial";
						arOverlayCtx.fillText(i, positions[i][0], positions[i][1]);	
					}
				}
			}
		}

		if (frame === 2142) {
			arDraw = function(positions, cp) {

			}

			masterContainer.style.visibility = "hidden";
			overlayContainer.style.visibility = "hidden";
		}
	}

	// Binding for the play button
	playButton.onclick = () => {
		showtime();
	}

	// For debugging only
	// window.onkeydown = function(e) {
	// 	const k = e.which || e.keyCode;

	// 	if (k === 32 && !movie.ended && !movie.paused) {
	// 		movie.pause();
	// 	} else if (k === 32 && !movie.ended && movie.paused) {
	// 		movie.play();
	// 	}
	// }
	// 
}	

// TODO: Let's update this to use typedarrays and bit manipulation for performance
function getOpticalFrame(canvasContext) {
	// Read the pixels off the canvas and store them in an imgdata object
	const barcode = canvasContext.getImageData(1, 1, 2, 16);
	
	// Grab a reference to the underlying imgdata array - may improve performance
	const id = barcode.data;

	// Transform black and white pixels to an array of 0s and 1s
	const binaryArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
	for (let i = 0, j = 0, len = id.length; i < len; i += 4, j += 1) {
		const value = (id[i] + id[i + 1] + id[i + 2] + id[i + 3]) / 4;
		binaryArray[j] = value > 125 ? 1 : 0;
	}
		
	// Convert a 32-bit binary to a decimal
	let frame = 0;
	for (let i = 0, mask = 2147483648; mask > 0; mask >>>= 1, i += 1) {
		frame += binaryArray[i] * mask;
	}
	
	return frame;			
}