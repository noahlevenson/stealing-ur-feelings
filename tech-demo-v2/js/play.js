function getFrame(filmSprite, frameCanvas) {
	frameCanvas.copy(filmSprite, K_PROJECT_WIDTH + 1, 1, 2, K_FRAMECODE_BIT_DEPTH / 2, 0, 0);
	frameCanvas.update();

	let buffer, frame;
	if (K_FRAMECODE_BIT_DEPTH === 16) {
		buffer = new ArrayBuffer(2);
		frame = new Uint16Array(buffer);
	} else if (K_FRAMECODE_BIT_DEPTH === 32) {
		// Handle framecode bit depth of 32
	}

	let bitOffset = 0;

	for (let i = 0; i < frameCanvas.height; i += 1) {
		for (let j = 0; j < frameCanvas.width; j += 1) {
			const p = frameCanvas.getPixel(j, i); 

			if (p.r + p.g + p.b / 3 > 125) {
				frame[0] |= 1 << bitOffset;	
			}

			bitOffset += 1;
		}
	}

	return frame[0];
}

function updateCLM(clmCanvas) {
	clmCanvas.copy(userVideoSprite, 0, 0, userVideoSprite.width, userVideoSprite.height, 0, 0);
	clmCanvas.update();
} 

function getEmotions(emotionStruct) {
	if (landmarks) {
		const emotions = ec.meanPredict(clmParams);

		if (emotions) {
			emotionStruct.angry.push(emotions[0]["value"]);
			emotionStruct.sad.push(emotions[1]["value"]);
			emotionStruct.surprised.push(emotions[2]["value"]);
			emotionStruct.happy.push(emotions[3]["value"]);
		}

		return emotions || false;
	}	
}

function drawFaceModel(landmarks) {
	function draw(points) {
		faceModel.moveTo(landmarks[points[0]][0], landmarks[points[0]][1]);

		for (let i = 1; i < points.length; i += 1) {
			faceModel.lineTo(landmarks[points[i]][0], landmarks[points[i]][1]);
		}
	}

	if (landmarks) {	
		faceModel.visible = true;
		faceModel.clear();
		faceModel.lineStyle(3, 0x80ff00, 1);
		draw(K_FACE_OUTLINE);
		draw(K_FACE_MOUTH);
		draw(K_FACE_SEPTUM);
		draw(K_FACE_NOSE);
		draw(K_FACE_LEFT_EYE);
		draw(K_FACE_RIGHT_EYE);
		draw(K_FACE_LEFT_BROW);
		draw(K_FACE_RIGHT_BROW);
	}
}

function drawEmotionChart(emotionStruct) {
	const emotions = getEmotions(emotionStruct);
	if (emotions) {
		emotionChart.visible = true;
		emotionChart.clear();
		emotionChart.beginFill(0x80ff00);

		const angryy = -150 * emotions[0]["value"];
		const sady = -150 * emotions[1]["value"];
		const surprisedy = -150 * emotions[2]["value"];
		const happyy = -150 * emotions[3]["value"];
		
		emotionChart.drawRect(10, K_PROJECT_HEIGHT, 227.5, angryy);
		emotionChart.drawRect(247.5, K_PROJECT_HEIGHT, 227.5, sady);
		emotionChart.drawRect(485, K_PROJECT_HEIGHT, 227.5, surprisedy);
		emotionChart.drawRect(722.5, K_PROJECT_HEIGHT, 227.5, happyy);

		angryLabelText.visible = true;
		sadLabelText.visible = true;
		surprisedLabelText.visible = true;
		happyLabelText.visible = true;

		angryLabelText.position.x = K_PROJECT_WIDTH / 4 + 123.75
		angryLabelText.position.y = K_PROJECT_HEIGHT + angryy + 30;

		sadLabelText.position.x = K_PROJECT_WIDTH / 4 + 361.25;
		sadLabelText.position.y = K_PROJECT_HEIGHT + sady + 20;

		surprisedLabelText.position.x = K_PROJECT_WIDTH / 4 + 598.75
		surprisedLabelText.position.y = K_PROJECT_HEIGHT + surprisedy + 30;

		happyLabelText.position.x = K_PROJECT_WIDTH / 4 + 836.25;
		happyLabelText.position.y = K_PROJECT_HEIGHT + happyy + 30;
	}
}

const playState = {
	create: function() {
		viewerEmotions = new emotionStruct();

		activated = false;
		frame = 0;
		lastFrame = 0;

		landmarks = undefined;

		game.world.setBounds(-1000, -1000, K_PROJECT_WIDTH + 1000, K_PROJECT_HEIGHT + 1000);

		frameCanvas = game.add.bitmapData(2, 8);
		
		filmGroup = game.add.group();
		userVideoGroup = game.add.group();
		overlayGroup = game.add.group();
		textGroup = game.add.group();

		userVideoSprite = game.add.sprite(0, 0, userVideo);
		
		// Handling variance in user camera aspect ratio is a 2 step process:
		// First we get aspect ratio of user video...
		userVideoAspect = userVideo.width / userVideo.height;

		// ...and if necessary, create a backplate in the correct aspect for it
		if (userVideoAspect < K_PROJECT_ASPECT_RATIO) {
			userVideoBackplateBMD = game.add.bitmapData(userVideo.height * K_PROJECT_ASPECT_RATIO, userVideo.height);
			userVideoBackplateBMD.fill(255, 255, 255, 255);
	 		userVideoBackplateSprite = game.add.sprite(0, 0, userVideoBackplateBMD);
			userVideoGroup.add(userVideoBackplateSprite);
		} else if (userVideoAspect > K_PROJECT_ASPECT_RATIO) {
			// TODO: User video is wider than 16:9 - this is a pretty extreme edge case
		}

		userVideoGroup.add(userVideoSprite);

		clmCanvas = game.add.bitmapData(userVideo.width, userVideo.height);

		userVideoMaskQuarterRight = game.make.graphics(0, 0);
		userVideoMaskQuarterRight.beginFill(0xFFFFFF);
		userVideoMaskQuarterRight.drawRect(0, 0, K_PROJECT_WIDTH * 0.75, K_PROJECT_HEIGHT)
		userVideoMaskQuarterRight.visible = false;

		userVideoSprite.mask = userVideoMaskQuarterRight;
		userVideoGroup.add(userVideoMaskQuarterRight);

		boundingBox = game.add.graphics(0, 0);
		boundingBox.lineStyle(5, 0x80ff00, 1);
		boundingBox.visible = false;

		// Then we derive a scaling factor from the backplate (which we created to be correct aspect) 
		// or user video (which is assumed to be correct aspect if no backplate exists) and apply it
		let s;
		if (userVideoBackplateBMD) {
			s = K_PROJECT_WIDTH / userVideoBackplateBMD.width;
			userVideoBackplateSprite.scale.setTo(s, s);
		} else {
			s = K_PROJECT_WIDTH / userVideo.width;
			userVideoSprite.scale.setTo(s, s);
		}
		
		filmVideo = game.add.video("film");
		filmSprite = game.add.sprite(0, 0, filmVideo);
		filmSprite.visible = false;

		filmGroup.add(filmSprite);

		userVideoProcessedBMD = game.add.bitmapData(userVideoSprite.width / K_VIDEO_PROCESSING_DOWNRES_FACTOR, userVideoSprite.height / K_VIDEO_PROCESSING_DOWNRES_FACTOR);
		userVideoProcessedSprite = game.add.sprite(0, 0, userVideoProcessedBMD);
		userVideoProcessedSprite.visible = false;
		userVideoProcessedSprite.mask = userVideoMaskQuarterRight;
		userVideoProcessedSprite.scale.setTo(K_VIDEO_PROCESSING_DOWNRES_FACTOR, K_VIDEO_PROCESSING_DOWNRES_FACTOR);
		userVideoGroup.add(userVideoProcessedSprite);

		userVideoSprite.visible = false;

		dimmerScreen = game.add.graphics(0, 0);
		dimmerScreen.beginFill(0x595959, 0.8);
		dimmerScreen.drawRect(0, 0, K_PROJECT_WIDTH * 0.75, K_PROJECT_HEIGHT);
		dimmerScreen.visible = false;
		userVideoGroup.add(dimmerScreen);

		emotionChart = game.add.graphics(K_PROJECT_WIDTH / 4, 0);
		emotionChart.visible = false;
		userVideoGroup.add(emotionChart);

		angryLabelText = game.add.text(K_PROJECT_WIDTH / 4, 0, "ANGRY", {fontSize: "32px", fill: "#ff3399"});
		angryLabelText.anchor.setTo(0.5, 0.5);
		angryLabelText.visible = false;
		sadLabelText = game.add.text(K_PROJECT_WIDTH / 4, 0, "SAD", {fontSize: "32px", fill: "#ff3399"});
		sadLabelText.anchor.setTo(0.5, 0.5);
		sadLabelText.visible = false;
		surprisedLabelText = game.add.text(K_PROJECT_WIDTH / 4, 0, "SURPRISED", {fontSize: "32px", fill: "#ff3399"});
		surprisedLabelText.anchor.setTo(0.5, 0.5);
		surprisedLabelText.visible = false;
		happyLabelText = game.add.text(K_PROJECT_WIDTH / 4, 0, "HAPPY", {fontSize: "32px", fill: "#ff3399"});
		happyLabelText.anchor.setTo(0.5, 0.5);
		happyLabelText.visible = false;
		userVideoGroup.add(angryLabelText);
		userVideoGroup.add(sadLabelText);
		userVideoGroup.add(surprisedLabelText);
		userVideoGroup.add(happyLabelText);

		userVideoMaskQuarterRight.beginFill(0xFFFFFF);
		userVideoMaskQuarterRight.drawRect(0, 0, K_PROJECT_WIDTH * 0.75, K_PROJECT_HEIGHT)

		userVideoStatusText = game.add.text(K_PROJECT_WIDTH / 4 + 20, 20, "! FACE CAMERA + CHECK LIGHT", {fontSize: "30px", fill: "#ffff00"});
		userVideoStatusText.visible = false;
		userVideoGroup.add(userVideoStatusText);

		faceModel = game.add.graphics(0, 0);
		faceModel.lineStyle(3, 0x80ff00, 1);
		faceModel.visible = false;
		userVideoGroup.add(faceModel);

		userVideoGroup.position.x = -(K_PROJECT_WIDTH);

		thiefMaskSprite = game.add.sprite(0, 0, "thiefMask");
		thiefMaskSprite.anchor.setTo(0.5, 0.5);
		thiefMaskSprite.visible = false;

		spyHatSprite = game.add.sprite(0, 0, "spyHat");
		spyHatSprite.anchor.setTo(0.5, 1.0);
		spyHatSprite.visible = false;

		headPhysicsSprite = game.add.sprite(500, 400, "headPhysicsSprite");
		headPhysicsSprite.anchor.setTo(0.5, 0.5);
		headPhysicsSprite.alpha = 0;
		game.physics.enable(headPhysicsSprite, Phaser.Physics.ARCADE);
		headPhysicsSprite.body.immovable = true;
		headPhysicsSprite.visible = false;

		emojiEmitter = game.add.emitter(game, 0, 0, 500);
		emojiEmitter.makeParticles("emoji", 0, 500, true, true);
		// emojiEmitter.setAlpha(1, 0, 5000, Phaser.Easing.Linear.None, false);

		explosionSFX = game.add.audio("explosion");
		explosionSFX.volume = 0.3;

		beepSFX = game.add.audio("beep");
		beepSFX.volume = 1;

		for (let i = 0; i < K_NUMBER_OF_LANDMARKS; i += 1) {
			landmarkText[i] = game.add.text(0, 0, i, {fontSize: "10px", fill: "#80ff00"});
			landmarkText[i].visible = false;
			textGroup.add(landmarkText[i]);
		}

		angerText = game.add.text(0, 0, "placeholder", {fontSize: "40px", fill: "#FFFFFF"});
		angerText.anchor.setTo(0.5, 0.5);
		angerText.visible = false;
		textGroup.add(angerText);

		gradientSprite = game.add.sprite(0, 0, "gradientSprite");
		gradientSprite.visible = false;
		overlayGroup.add(gradientSprite);
       
		playButton = game.add.sprite(0, 0, "playButtonImage");
		playButton.anchor.setTo(0.5, 0.5);
		playButton.x = K_PROJECT_WIDTH / 2;
		playButton.y = K_PROJECT_HEIGHT / 2;
		playButton.inputEnabled = true;

		playButton.events.onInputDown.addOnce(() => {
			clmTrack.start(clmCanvas.canvas);

			playButton.visible = false;
			filmSprite.visible = true;

			filmVideo.currentTime = 0;

			filmVideo.play();

			activated = true;
		});

		if (K_DEBUG) {
			if (K_DEBUG_SHOW_FRAMECODE) {
				framecodeSprite = game.add.sprite(0, 0, frameCanvas);
				framecodeSprite.scale.setTo(K_DEBUG_FRAMECODE_SCALE, K_DEBUG_FRAMECODE_SCALE);
			}
			
			pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
			pauseKey.onDown.add(() => {
				if (!filmVideo.paused) {
					filmVideo.paused = true;
				} else {
					filmVideo.paused = false;
				}
			});

			frameQueryKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
			frameQueryKey.onDown.add(() => {
				console.log(getFrame(filmSprite, frameCanvas));
			});

			seekKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
			seekKey.onDown.add(() => {
				filmVideo.currentTime = K_DEBUG_SEEK_TIME;

				for (let i = 0; i < filmEventList.length; i += 1) {
					if (filmEventList[i]) {
						filmEventList[i].activated = false;
					}
				}
			});
		}
	},

	update: function() {
		if (activated) {
			frame = getFrame(filmSprite, frameCanvas);
			const frameDelta = frame - lastFrame;

			if (frameDelta > 1) {
				for (let i = 0; i < frameDelta; i += 1) {
					doEvent(filmEventList, lastFrame + i);
				}
			}

			updateCLM(clmCanvas);
			landmarks = clmTrack.getCurrentPosition();

			if (landmarks) {
				userVideoStatusText.visible = false;
				clmParams = clmTrack.getCurrentParameters();
			} else {
				userVideoStatusText.visible = true;
			}

			doEvent(filmEventList, frame);
			lastFrame = frame;

			if (K_DEBUG && K_DEBUG_LOG_ALL_FRAMES) {
				console.log(frame);
			}
		}
	}
};