function eventStruct(f) {
	this.run = f;
	this.activated = false;
}

function doEvent(eventList, frame) {
	if (eventList[frame] && !eventList[frame].activated) {
		eventList[frame].activated = true;
		eventList[frame].run();
	}
}

const filmEventList = new Array(4566);

// Just collect user emotions
for (let i = 1; i < 743; i += 1) {
	const e = new eventStruct(() => {
		const emotions = getEmotions(viewerEmotions);
	});

	filmEventList[i] = e;
}

filmEventList[743] = new eventStruct(() => {
	const filmSlideRight = game.add.tween(filmSprite.position).to( {x: K_PROJECT_WIDTH / 4, y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

	userVideoGroup.position.x = -(K_PROJECT_WIDTH * 0.75);
	userVideoSprite.visible = true;
	userVideoMaskQuarterRight.visible = true;

	const userVideoSlideRight = game.add.tween(userVideoGroup.position).to( {x: -(K_PROJECT_WIDTH / 4), y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

	const emotions = getEmotions(viewerEmotions);
});

// Turn on "spy" AR filter
for (let i = 1043; i < 1456; i += 1) {
	const e = new eventStruct(() => {
		if (landmarks) {
			if (frame % K_AR_FRAME_INTERVAL === 0) {
				const s = Math.sqrt(clmParams[0] / 5);
				
				thiefMaskSprite.scale.setTo(s / 1.5, s / 1.5);
				thiefMaskSprite.position = {x: landmarks[33][0] + userVideoGroup.position.x, y: landmarks[33][1] + (3 * s) + userVideoGroup.position.y};
				thiefMaskSprite.rotation = clmParams[1] * 0.8;
				thiefMaskSprite.visible = true;

				spyHatSprite.scale.setTo(s, s);
				spyHatSprite.position = {x: landmarks[33][0] + userVideoGroup.position.x, y: landmarks[33][1] - (40 * s) + userVideoGroup.position.y};
				spyHatSprite.rotation = clmParams[1] * 0.8;
				spyHatSprite.visible = true;
			}
		} else {
			spyHatSprite.visible = false;
			thiefMaskSprite.visible = false;
		}

		const emotions = getEmotions(viewerEmotions);
	});

	filmEventList[i] = e;
}

// Make emojis explode from above
filmEventList[1463] = new eventStruct(() => {
	spyHatSprite.visible = false;
	thiefMaskSprite.visible = false;

	emojiEmitter.x = 0;
	emojiEmitter.y = -200;

	emojiEmitter.bounce.setTo(0.5, 0.5);

	const xs = Math.cos(1) * 500;
	const ys = Math.sin(1) * 500;
	
	emojiEmitter.setXSpeed(xs, xs * 4);
	emojiEmitter.setYSpeed(ys, ys * 4);

	explosionSFX.play();

	emojiEmitter.flow(3300, 10, 5, 400, true);

	const emotions = getEmotions(viewerEmotions);
});

// Turn on the invisible head physics collider and persist it as the emojis fall
for (let i = 1464; i < 1600; i += 1) {
	const e = new eventStruct(() => {
		if (landmarks) {
			headPhysicsSprite.visible = true;
			const s = clmParams[0];
			headPhysicsSprite.scale.setTo(s, s);
			headPhysicsSprite.position = {x: landmarks[33][0] + userVideoGroup.position.x, y: landmarks[33][1] + userVideoGroup.position.y};

			game.physics.arcade.collide(emojiEmitter, headPhysicsSprite);
		} else {
			headPhysicsSprite.visible = false;
		}

		const emotions = getEmotions(viewerEmotions);
	});

	filmEventList[i] = e;
}

// Return to full screen film
filmEventList[1600] = new eventStruct(() => {
	const filmSlideLeft = game.add.tween(filmSprite.position).to( {x: 0, y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
	const userVideoSlideLeft = game.add.tween(userVideoGroup.position).to( {x: -(K_PROJECT_WIDTH * 0.75), y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

	headPhysicsSprite.visible = false;

	const emotions = getEmotions(viewerEmotions);
});

// Return to 50/50 split with user video
filmEventList[2097] = new eventStruct(() => {
	const filmSlideRight = game.add.tween(filmSprite.position).to( {x: K_PROJECT_WIDTH / 4, y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

	userVideoGroup.position.x = -(K_PROJECT_WIDTH * 0.75);
	userVideoSprite.visible = true;
	const userVideoSlideRight = game.add.tween(userVideoGroup.position).to( {x: -(K_PROJECT_WIDTH / 4), y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

	const emotions = getEmotions(viewerEmotions);
});

// Put enumerated facial landmarks over the user and track their movement
for (let i = 2127; i < 2400; i += 1) {
	const e = new eventStruct(() => {
		if (landmarks) {
			for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
				landmarkText[j].visible = true;
				landmarkText[j].position = {x: landmarks[j][0] + userVideoGroup.position.x, y: landmarks[j][1] + userVideoGroup.position.y};
			}
		} else {
			for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
				landmarkText[j].visible = false;
			}
		}

		const emotions = getEmotions(viewerEmotions);
	});

	filmEventList[i] = e;
}

// Fade out the enumerated facial landmarks
filmEventList[2400] = new eventStruct(() => {
	for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
		game.add.tween(landmarkText[j]).to({alpha: 0}, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);
	}

	const emotions = getEmotions(viewerEmotions);
});

// Play a beep and begin luma filter
filmEventList[2401] = new eventStruct(() => {
	beepSFX.play();

	userVideoProcessedSprite.visible = true;

	if (frame % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
		const s = 1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR * 1.5;
		userVideoProcessedBMD.copy(userVideoSprite, 0, 0, userVideoSprite.width, userVideoSprite.height, undefined, undefined, undefined, undefined, undefined, undefined, undefined, s, s, undefined, null, true);
		userVideoProcessedBMD.update();

		userVideoProcessedBMD.processPixelRGB((pixel) => {
			const luma = (pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722);
			return {r: luma, g: luma, b: luma, a: 255};		
		}, this);
	}
		
	const emotions = getEmotions(viewerEmotions);
});

// Continue luma filter
for (let i = 2402; i < 2520; i += 1) {
	const e = new eventStruct(() => {
		userVideoProcessedSprite.visible = true;

		if (frame % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
			const s = 1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR * 1.5;
			userVideoProcessedBMD.copy(userVideoSprite, 0, 0, userVideoSprite.width, userVideoSprite.height, undefined, undefined, undefined, undefined, undefined, undefined, undefined, s, s, undefined, null, true);
			userVideoProcessedBMD.update();

			userVideoProcessedBMD.processPixelRGB((pixel) => {
				const luma = (pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722);
				return {r: luma, g: luma, b: luma, a: 255};		
			}, this);	
		}
		
		const emotions = getEmotions(viewerEmotions);
	});

	filmEventList[i] = e;
}

// Play a beep and begin threshold filter
filmEventList[2520] = new eventStruct(() => {
	beepSFX.play();

	userVideoProcessedSprite.visible = true;

	if (frame % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
		const s = 1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR * 1.5;
		userVideoProcessedBMD.copy(userVideoSprite, 0, 0, userVideoSprite.width, userVideoSprite.height, undefined, undefined, undefined, undefined, undefined, undefined, undefined, s, s, undefined, null, true);
		userVideoProcessedBMD.update();

		userVideoProcessedBMD.processPixelRGB((pixel) => {
			const luma = (pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722);
				
			if (luma < 125) {
				return {r: 0, g: 0, b: 0, a: 255};
			} else {
				return {r: 255, g: 255, b: 255, a: 255};
			}	
		}, this);	
	}
	
	const emotions = getEmotions(viewerEmotions);
});

// Continue threshold filter
for (let i = 2521; i < 2634; i += 1) {
	const e = new eventStruct(() => {
		userVideoProcessedSprite.visible = true;

		if (frame % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
			const s = 1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR * 1.5;
			userVideoProcessedBMD.copy(userVideoSprite, 0, 0, userVideoSprite.width, userVideoSprite.height, undefined, undefined, undefined, undefined, undefined, undefined, undefined, s, s, undefined, null, true);
			userVideoProcessedBMD.update();

			userVideoProcessedBMD.processPixelRGB((pixel) => {
				const luma = (pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722);
					
				if (luma < 125) {
					return {r: 0, g: 0, b: 0, a: 255};
				} else {
					return {r: 255, g: 255, b: 255, a: 255};
				}	
			}, this);	
		}
		
		const emotions = getEmotions(viewerEmotions);
	});

	filmEventList[i] = e;
}

// Pop on facial bounding box and continue threshold filter
for (let i = 2634; i < 2693; i += 1) {
	const e = new eventStruct(() => {
		userVideoProcessedSprite.visible = true;

		if (frame % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
			const s = 1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR * 1.5;
			userVideoProcessedBMD.copy(userVideoSprite, 0, 0, userVideoSprite.width, userVideoSprite.height, undefined, undefined, undefined, undefined, undefined, undefined, undefined, s, s, undefined, null, true);
			userVideoProcessedBMD.update();

			userVideoProcessedBMD.processPixelRGB((pixel) => {
				const luma = (pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722);
					
				if (luma < 125) {
					return {r: 0, g: 0, b: 0, a: 255};
				} else {
					return {r: 255, g: 255, b: 255, a: 255};
				}	
			}, this);
		}
		
		boundingBox.visible = true;
		boundingBox.clear();
		boundingBox.lineStyle(5, 0x80ff00, 1);

		if (landmarks) {
			const size = clmParams[0] * 100;
			boundingBox.position = {x: landmarks[62][0] + userVideoGroup.position.x - (size / 2), y: landmarks[62][1] + userVideoGroup.position.y - (size / 2)};
			boundingBox.drawRect(0, 0, size, size);
		}
		
		const emotions = getEmotions(viewerEmotions);
	});

	filmEventList[i] = e;
}

// Return to full screen film
filmEventList[2693] = new eventStruct(() => {
	const filmSlideLeft = game.add.tween(filmSprite.position).to( {x: 0, y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
	const userVideoSlideLeft = game.add.tween(userVideoGroup.position).to( {x: -(K_PROJECT_WIDTH * 0.75), y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

	userVideoSlideLeft.onComplete.addOnce(() => {
		boundingBox.visible = false;
	}, this);	

	userVideoProcessedSprite.visible = true;

	if (frame % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
		const s = 1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR * 1.5;
		userVideoProcessedBMD.copy(userVideoSprite, 0, 0, userVideoSprite.width, userVideoSprite.height, undefined, undefined, undefined, undefined, undefined, undefined, undefined, s, s, undefined, null, true);
		userVideoProcessedBMD.update();

		userVideoProcessedBMD.processPixelRGB((pixel) => {
			const luma = (pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722);
				
			if (luma < 125) {
				return {r: 0, g: 0, b: 0, a: 255};
			} else {
				return {r: 255, g: 255, b: 255, a: 255};
			}	
		}, this);	
	}
	
	boundingBox.visible = true;
	boundingBox.clear();
	boundingBox.lineStyle(5, 0x80ff00, 1);

	if (landmarks) {
		const size = clmParams[0] * 100;
		boundingBox.position = {x: landmarks[62][0] + userVideoGroup.position.x - (size / 2), y: landmarks[62][1] + userVideoGroup.position.y - (size / 2)};
		boundingBox.drawRect(0, 0, size, size);
	}
	
	const emotions = getEmotions(viewerEmotions);
});

for (let i = 2694; i < 2724; i += 1) {
	const e = new eventStruct(() => {
		userVideoProcessedSprite.visible = true;

		if (frame % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
			const s = 1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR * 1.5;
			userVideoProcessedBMD.copy(userVideoSprite, 0, 0, userVideoSprite.width, userVideoSprite.height, undefined, undefined, undefined, undefined, undefined, undefined, undefined, s, s, undefined, null, true);
			userVideoProcessedBMD.update();

			userVideoProcessedBMD.processPixelRGB((pixel) => {
				const luma = (pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722);
					
				if (luma < 125) {
					return {r: 0, g: 0, b: 0, a: 255};
				} else {
					return {r: 255, g: 255, b: 255, a: 255};
				}	
			}, this);	
		}
		
		boundingBox.visible = true;
		boundingBox.clear();
		boundingBox.lineStyle(5, 0x80ff00, 1);
		
		if (landmarks) {
			const size = clmParams[0] * 100;
			boundingBox.position = {x: landmarks[62][0] + userVideoGroup.position.x - (size / 2), y: landmarks[62][1] + userVideoGroup.position.y - (size / 2)};
			boundingBox.drawRect(0, 0, size, size);
		}
		
		const emotions = getEmotions(viewerEmotions);
	});

	filmEventList[i] = e;
}

// Reveal your anger score
filmEventList[2860] = new eventStruct(() => {
	userVideoProcessedSprite.visible = false;

	gradientSprite.position = {x: 0, y: K_PROJECT_HEIGHT};
	gradientSprite.visible = true;

	const gradientTween = game.add.tween(gradientSprite).to({x: 0, y: 0}, 500, Phaser.Easing.Linear.None, true, 0, 0, false);

	gradientTween.onComplete.addOnce(() => {
		angerText.position = {x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2};
		angerText.visible = true;
	}, this);
});

for (let i = 2861; i < 3167; i += 1) {
	const e = new eventStruct(() => {
		const pct = (viewerEmotions.avg("happy") * 100).toFixed(0);
		angerText.text = "You've been an average of " + pct + "% happy for the last " + userVideo.currentTime.toFixed(2) + " seconds.";
	});

	filmEventList[i] = e;
}

filmEventList[3167] = new eventStruct(() => {
	filmSprite.position = {x: K_PROJECT_WIDTH / 4, y: 0};
	userVideoGroup.position = {x: -(K_PROJECT_WIDTH / 4), y: 0};

	userVideoProcessedSprite.visible = false;
	userVideoSprite.visible = true;
	dimmerScreen.visible = true;

	angerText.visible = false;

	const gradientTween = game.add.tween(gradientSprite).to({x: 0, y: K_PROJECT_HEIGHT}, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
});

for (let i = 3168; i < 3646; i += 1) {
	const e = new eventStruct(() => {
		if (landmarks) {
			drawFaceModel(landmarks);
			drawEmotionChart(viewerEmotions);
		} else {
			faceModel.clear();
			emotionChart.clear();

			angryLabelText.visible = false;
			sadLabelText.visible = false;
			surprisedLabelText.visible = false;
			happyLabelText.visible = false;
		}
	});

	filmEventList[i] = e;
}

filmEventList[3646] = new eventStruct(() => {
	const filmSlideLeft = game.add.tween(filmSprite.position).to( {x: 0, y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
	const userVideoSlideLeft = game.add.tween(userVideoGroup.position).to( {x: -(K_PROJECT_WIDTH * 0.75), y: 0}, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

	if (landmarks) {
		drawFaceModel(landmarks);
	} else {
		faceModel.clear();
	}
});

for (let i = 3647; i < 3677; i += 1) {
	const e = new eventStruct(() => {
		if (landmarks) {
			drawFaceModel(landmarks);
			drawEmotionChart(viewerEmotions);

		} else {
			faceModel.clear();
			emotionChart.clear();

			angryLabelText.visible = false;
			sadLabelText.visible = false;
			surprisedLabelText.visible = false;
			happyLabelText.visible = false;
		}
	});

	filmEventList[i] = e;
}

filmEventList[3677] = new eventStruct(() => {
	userVideoSprite.visible = false;
	dimmerScreen.visible = false;
	faceModel.clear();
	emotionChart.clear();
});

for (let i = 4159; i < 4307; i += 1) {
	const e = new eventStruct(() => {
		angerText.setStyle({fontSize: "70px", fill: "#FFFFFF", backgroundColor: "#000000"}, true);
		angerText.visible = true;

		let emotions;

		if (landmarks) {
			emotions = getEmotions(viewerEmotions);
		}

		if (emotions) {
			const pct = (emotions[0]["value"] * 100).toFixed(2);
			angerText.text = "You are " + pct + "% angry about Trump.";
		} else {
			angerText.text = "face camera + check light to be classified";
		}
	});

	filmEventList[i] = e;
}

filmEventList[4306] = new eventStruct(() => {
	angerText.visible = false;
});

filmEventList[4565] = new eventStruct(() => {
	activated = false;

	userVideo.stop();
	userVideo.currentTime = 0;

	for (let i = 0; i < filmEventList.length; i += 1) {
		if (filmEventList[i]) {
			filmEventList[i].activated = false;
		}
	}

	game.state.start("bootcv");
});