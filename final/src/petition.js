function handlePetitionDetections(detections) {
	if (detections) {
		// TODO: Handle CV canvas downres factor?

		const l = detections.landmarks._positions;

		landmarks = new Array();

		for (let i = 0; i < l.length; i += 1) {
			// TODO: Does this break if user webcam dimensions !== 640:480 ?
			landmarks.push([l[i]._x * userVideoSprite.scale.x * K_FACE_CV_DOWNRES_FACTOR, l[i]._y * userVideoSprite.scale.y * K_FACE_CV_DOWNRES_FACTOR]); 
		}

		if (detections.expressions) {
			emotions = detections.expressions
		} 

		if (K_INSTALLATION_MODE) {
			const faceData = new viewerFaceDataStruct(petitionFrame, landmarks, detections.expressions || null);
			socket.emit("data", faceData);
		}
	} else {
		landmarks = false;
		emotions = false;

		if (K_INSTALLATION_MODE) {
			socket.emit("data", null);
		}
	}
}

const petitionState = {
	create: function() {
		if (K_MULTITHREADING) {
			cvWorker.onmessage = function(event) {
				if (event.data.opcode === 1) {
					handlePetitionDetections(event.data.dets);
				}
			}
		}

		game.camera.flash(0x000000, 1000, false);

		petitionFrame = 0;
		redirectionInitiated = false;

		// Do we pointlessly create objects here only to stop them and recreate them in play AND validate state?
		// Why yes we do
		cvSprite = game.add.sprite(0, 0, userVideo);
		cvSprite.visible = false;
		
		clmCanvas = game.add.bitmapData(Math.round(cvSprite.width / K_FACE_CV_DOWNRES_FACTOR), Math.round(cvSprite.height / K_FACE_CV_DOWNRES_FACTOR));

		userVideoSprite = game.add.sprite(0, 0, userVideo);

		const s = K_PROJECT_WIDTH / (userVideo.height * K_PROJECT_ASPECT_RATIO);
		userVideoSprite.scale.setTo(s, s);
		userVideoSprite.visible = false;

		const smileToSignText = game.add.text(0, 0, "Tell Snap to disclose if it is already using emotion recognition technology.", {font: "Arimo, sans-serif", fontSize: "40px", fontWeight: "bold", fill: "#FFFFFF"});
		smileToSignText.wordWrapWidth = 760;
		smileToSignText.wordWrap = true;
		smileToSignText.anchor.setTo(0.5, 0.5);
		smileToSignText.position = {x: K_PROJECT_WIDTH / 2, y: (K_PROJECT_HEIGHT / 2) - 150};

		const finePrintText = game.add.text(0, 0, "*Data about your smile and face will not be stored nor used for any purpose other than launching ", {font: "Arimo, sans-serif", fontSize: "12px", fontWeight: "bold", fill: "#cccccc"});
		// finePrintText.wordWrapWidth = 760;
		// finePrintText.wordWrap = true;
		finePrintText.anchor.setTo(0.0, 0.0);
		finePrintText.position = {x: smileToSignText.x - (smileToSignText.width / 2), y: K_PROJECT_HEIGHT - 100};

		const thisWebsiteText = game.add.text(0, 0, "this website", {font: "Arimo, sans-serif", fontSize: "12px", fontWeight: "bold", fill: "#e6e6e6"});
		thisWebsiteText.anchor.setTo(0.0, 0.0);
		thisWebsiteText.position = {x: finePrintText.x + finePrintText.width, y: finePrintText.y};

		thisWebsiteText.inputEnabled = true;
		thisWebsiteText.input.useHandCursor = true;
		
		thisWebsiteText.events.onInputOver.add(() => {
			thisWebsiteText.fill = "#ffffff";
		});

		thisWebsiteText.events.onInputOut.add(() => {
			thisWebsiteText.fill = "#e6e6e6";
		});

		thisWebsiteText.events.onInputDown.add(() => {
			window.location.href = "https://foundation.mozilla.org/en/campaigns/snapchat-stop-stealing-our-feelings/";
		});

		const smileToSignSubText = game.add.text(0, 0, "To read and sign Mozilla's petition, just ", {font: "Arimo, sans-serif", fontSize: "27px", fontWeight: "bold", fill: "#ffff1a"});
		smileToSignSubText.anchor.setTo(0.0, 0.0);
		smileToSignSubText.position = {x: smileToSignText.x - (smileToSignText.width / 2), y: smileToSignText.y + (smileToSignText.height / 2) + 16};

		const smileBlinkingText = game.add.text(0, 0, "smile ", {font: "Arimo, sans-serif", fontSize: "27px", fontWeight: "bold", fill: "#ffff1a"});
		smileBlinkingText.anchor.setTo(0.0, 0.0);
		smileBlinkingText.position = {x: smileToSignSubText.x + smileToSignSubText.width, y: smileToSignSubText.y};

		const petitionBlinkTimer = game.time.create(false);

		petitionBlinkTimer.loop(400, () => {
			smileBlinkingText.visible = smileBlinkingText.visible ? false : true;
		}, this);

		petitionBlinkTimer.start();

		petitionSmileGfx = game.add.graphics(0, 0);

		redirectingText = game.add.text(0, 0, "Redirecting...", {font: "Arimo, sans-serif", fontSize: "20px", fontWeight: "bold", fill: "#ffffff"});
		redirectingText.anchor.setTo(0.5, 0.5);
		redirectingText.position = {x: K_PROJECT_WIDTH / 2, y: (K_PROJECT_HEIGHT / 2) + 160};
		redirectingText.visible = false;

		noPetitionFaceDetectedText = game.add.text(0, 0, "face camera and check lighting", {font: "Arimo, sans-serif", fontSize: "20px", fontWeight: "bold", fill: "#404040"});
		noPetitionFaceDetectedText.anchor.setTo(0.5, 0.5);
		noPetitionFaceDetectedText.position = {x: K_PROJECT_WIDTH / 2, y: (K_PROJECT_HEIGHT / 2) + 20};
		noPetitionFaceDetectedText.visible = false;

		const altPetitionLinkText = game.add.text(0, 0, "(or click here)", {font: "Arimo, sans-serif", fontSize: "27px", fontWeight: "bold", fill: "#ffff1a"});
		altPetitionLinkText.anchor.setTo(0.0, 0.0);
		altPetitionLinkText.position = {x: smileBlinkingText.x + smileBlinkingText.width, y: smileToSignSubText.y};
		altPetitionLinkText.visible = false;

		userFailedToSmileTimeout = setTimeout(() => {
			altPetitionLinkText.alpha = 0.0;
			altPetitionLinkText.visible = true;

			const altLinkTween = game.add.tween(altPetitionLinkText).to({alpha: 1.0}, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);

			altPetitionLinkText.inputEnabled = true;
			altPetitionLinkText.input.useHandCursor = true;
			
			altPetitionLinkText.events.onInputOver.add(() => {
				altPetitionLinkText.fill = "#ffff99";
			});

			altPetitionLinkText.events.onInputOut.add(() => {
				altPetitionLinkText.fill = "#ffff1a";
			});

			altPetitionLinkText.events.onInputDown.add(() => {
				window.location.href = "https://foundation.mozilla.org/en/campaigns/snapchat-stop-stealing-our-feelings/";
			});
		}, 10000);

		if (!K_MOBILE) {
			fullScreenButton = game.add.sprite(1205, 645, "fullscreenButton");
			fullScreenButton.scale.setTo(0.75, 0.75);
			fullScreenButton.tint = 0x8c8c8c;

			fullScreenButton.events.onInputOver.add(function() {
				fullScreenButton.tint = 0xFFFFFF;
			});

			fullScreenButton.events.onInputOut.add(function() {
				fullScreenButton.tint = 0x8c8c8c;
			});

			fullScreenButton.events.onInputDown.add(function() {
				game.scale.startFullScreen();
				fullScreenButton.tint = 0x8c8c8c;

				if (K_INSTALLATION_MODE) {
					game.canvas.style.cursor = "none";
				}
			});

			fullScreenButton.visible = false;
			fullScreenButton.inputEnabled = true;
			fullScreenButton.input.useHandCursor = true;
		}

		const stateTimer = game.time.create(false);

		stateTimer.add(30000, () => {
			if (!redirectionInitiated) {
				redirectionInitiated = true;
				// clearTimeout(userFailedToSmileTimeout); // After 20000ms, userFailedToSmileTimeout has already resolved

				game.camera.fade(0x000000, 500);

				game.camera.onFadeComplete.addOnce(() => {
					petitionBlinkTimer.stop();
					petitionBlinkTimer.destroy();
					game.state.start("validate");
				});
			}
		}, this);

		stateTimer.start();
	}, 

	update: async function() {
		if (petitionFrame % K_CV_REFRESH_INTERVAL === 0) {
			if (K_MULTITHREADING) {
				createImageBitmap(userVideo.video).then((img) => {
					cvWorker.postMessage({fakeWindow: fakeWindow, fakeDocument: fakeDocument, img: img, opcode: 1, getEmotions: true, frame: petitionFrame}, [img]);
				});
			} else {
				updateCLM(clmCanvas);

				const options = new faceapi.TinyFaceDetectorOptions({inputSize: 160, scoreThreshold: 0.5});
				let detections;

				if (K_RUN_CV_ASYNC) {
					detections = faceapi.detectSingleFace(clmCanvas.canvas, options).withFaceLandmarks(true).withFaceExpressions();

					detections.then((dets) => {
						handlePetitionDetections(dets);
					});
				} else {
					detections = await faceapi.detectSingleFace(clmCanvas.canvas, options).withFaceLandmarks(true).withFaceExpressions(); 

					handlePetitionDetections(detections);
				}
			}
		}

		if (emotions) {
			function drawBigSmileGfx(l) {
				// All of this deep copy boilerplate is only happening
				// because we aren't applying scale and translation in one step
				// TODO: Make it better

				// Make a local copy of the argument
				const landmarks = [];
				for (let i = 0; i < l.length; i += 1) {
					landmarks.push([l[i][0], l[i][1]]);
				}

				// Scale the model by a factor of 4 
				for (let i = 0; i < landmarks.length; i += 1) {
					landmarks[i][0] *= 4;
					landmarks[i][1] *= 4;
				}

				// Translate the model such that the approximate center of the 
				// mouth is aligned with the center of the screen
				// NOTE: the hardcoded landmark 51 is not implementation independent!
				const xo = (K_PROJECT_WIDTH / 2) - landmarks[51][0];
				const yo = (K_PROJECT_HEIGHT / 2) - landmarks[51][1];

				for (let i = 0; i < landmarks.length; i += 1) {
					landmarks[i][0] += xo;
					landmarks[i][1] += yo;
				}

				petitionSmileGfx.visible = true;
				petitionSmileGfx.clear();
				petitionSmileGfx.lineStyle(6, 0xff0000, 1);

				petitionSmileGfx.moveTo(landmarks[K_FACE_MOUTH_OUTER[0]][0], landmarks[K_FACE_MOUTH_OUTER[0]][1]);

				for (let i = 1; i < K_FACE_MOUTH_OUTER.length; i += 1) {
					petitionSmileGfx.lineTo(landmarks[K_FACE_MOUTH_OUTER[i]][0], landmarks[K_FACE_MOUTH_OUTER[i]][1]);
				}	

				petitionSmileGfx.moveTo(landmarks[K_FACE_MOUTH_INNER_TOP[0]][0], landmarks[K_FACE_MOUTH_INNER_TOP[0]][1]);

				for (let i = 1; i < K_FACE_MOUTH_INNER_TOP.length; i += 1) {
					petitionSmileGfx.lineTo(landmarks[K_FACE_MOUTH_INNER_TOP[i]][0], landmarks[K_FACE_MOUTH_INNER_TOP[i]][1]);
				}	

				petitionSmileGfx.moveTo(landmarks[K_FACE_MOUTH_INNER_BOTTOM[0]][0], landmarks[K_FACE_MOUTH_INNER_BOTTOM[0]][1]);

				for (let i = 1; i < K_FACE_MOUTH_INNER_BOTTOM.length; i += 1) {
					petitionSmileGfx.lineTo(landmarks[K_FACE_MOUTH_INNER_BOTTOM[i]][0], landmarks[K_FACE_MOUTH_INNER_BOTTOM[i]][1]);
				}	

				redirectingText.position = {x: landmarks[K_FACE_MOUTH_OUTER[6]][0] + 100, y: landmarks[K_FACE_MOUTH_OUTER[6]][1]};
			}

			if (landmarks) {
				// noPetitionFaceDetectedText.visible = false;
				drawBigSmileGfx(landmarks);
			}

	    	if (emotions["happy"] > 0.9 && redirectionInitiated === false) {
	    		redirectionInitiated = true;

	    		clearTimeout(userFailedToSmileTimeout);

	    		redirectingText.visible = true;

	    		setTimeout(() => {
	    			window.location.href = "https://foundation.mozilla.org/en/campaigns/snapchat-stop-stealing-our-feelings/";
	    		}, 2000);
	    	}
		} else {
			petitionSmileGfx.clear();
			// noPetitionFaceDetectedText.visible = true;
		}

		petitionFrame += 1;

		if (!K_MOBILE) {
			if (!game.scale.isFullScreen) {
				fullScreenButton.visible = true;
			} else {
				fullScreenButton.visible = false;
			}
		}
	}
};