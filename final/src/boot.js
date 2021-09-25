const bootState = {
	create: function() {
		const privacyText = game.add.text(0, 0, "STEALING UR FEELINGS accesses your device camera and uses A.I. algorithms to analyze your video stream. We do NOT transmit, store, or share your data. STEALING UR FEELINGS is for entertainment purposes only. We are committed to respecting your privacy.", {font: "Arimo, sans-serif", fontSize: "20px", fontWeight: "bold", fill: "#FFFFFF"});
		privacyText.wordWrapWidth = 710;
		privacyText.wordWrap = true;
		privacyText.anchor.setTo(0.5, 0.5);
		privacyText.position = {x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2};

		const privacyTextHeader = game.add.text(0, 0, "artificial intelligence disclosure:", {font: "Arimo, sans-serif", fontSize: "24px", fontWeight: "bold", fill: "#eb4034"});
		privacyTextHeader.position = {x: privacyText.position.x - (privacyText.width / 2), y: (K_PROJECT_HEIGHT / 2) - 100};


		// Create the user video object and initialize webcam stream
		// Safari isn't like all the other browsers, so we need to 
		// roll our own function to get access to the camera
		function videoInit() {
			if (game.device.safari || game.device.mobileSafari || game.device.iOS || game.device.android) {
				userVideo = game.add.video();

				userVideo.video = document.createElement('video');
				userVideo.video.setAttribute('autoplay', 'autoplay');
				userVideo.video.setAttribute('playsinline', 'playsinline');

				const constraints = {
					video: true,
					audio: false,
					aspectRatio: 640 / 480,
					width: 640,
					height: 480,
					facingMode: {exact: "user"}
				};

				navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
					userVideo.videoStream = stream;

					if (userVideo.video.mozSrcObject !== undefined) {
			            userVideo.video.mozSrcObject = stream;
			        } else if (userVideo.video.srcObject !== undefined) {
			            userVideo.video.srcObject = stream;
			        } else {
			            userVideo.video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
			        }

			        userVideo.video.onloadeddata = function() {
			            var retry = 10;

			            function checkStream() {
			                if (retry > 0) {
			                    if (userVideo.video.videoWidth > 0) {
			                        var width = userVideo.video.videoWidth;
			                        var height = userVideo.video.videoHeight;

			                        if (isNaN(userVideo.video.videoHeight)) {
			                            height = width / (4 / 3); // sup with this hardcoded aspect ratio? can't be great
			                        }

			                        userVideo.video.play();

			                        userVideo.isStreaming = true;
			                        userVideo.baseTexture.source = userVideo.video;
			                        userVideo.updateTexture(null, width, height);
			                        userVideo.onAccess.dispatch(userVideo);
			                    } else {
			                        window.setTimeout(checkStream, 500);
			                    }
			                } else {
			                    // console.warn('Unable to connect to video stream. Webcam error?');
			                }

			                retry -= 1;
			            }

			            checkStream();
			        };

			        userVideo.onAccess.addOnce(() => {
						// TODO: gracefully handle user video errors (pause the experience and display error message?)
						userVideo.onError.removeAll();
						game.state.start("load");
					}, this);	
				}).catch((err) => {
					// Handle this error!
				});
			} else {
				userVideo = game.add.video();
				userVideo.startMediaStream();

				userVideo.onError.addOnce(() => {
					// The user has refused webcam access - let's politely explain that they can't watch the movie without granting access
				}, this);

				userVideo.onAccess.addOnce(() => {
					// TODO: gracefully handle user video errors (pause the experience and display error message?)
					userVideo.onError.removeAll();
					game.state.start("load");
				}, this);	
			}
		}

		function checkMobileOrientation() {
			if (!game.device.desktop && game.scale.isPortrait) {
				setTimeout(checkMobileOrientation, 200);
			} else {
				videoInit();
			}
		}

		game.time.advancedTiming = true;
		
		game.scale.forceOrientation(true, false);

		game.scale.enterIncorrectOrientation.add(() => {
			if (!game.device.desktop) {
				document.getElementById("rotate-device").style.display = "block";
			}
		});

		game.scale.leaveIncorrectOrientation.add(() => {
			if (!game.device.desktop) {
				document.getElementById("rotate-device").style.display = "none";
			}
		});

		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.maxWidth = "100%";
		game.scale.maxHeight = "100%";

		game.stage.disableVisibilityChange = true;
		game.physics.startSystem(Phaser.Physics.ARCADE);

		checkMobileOrientation();
	}
};