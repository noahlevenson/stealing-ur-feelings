function drawSunglasses() {
  let leftPupil = [0, 0];
  for (let j = 0; j < K_FACE_LEFT_EYE.length - 1; j += 1) {
    leftPupil[0] += landmarks[K_FACE_LEFT_EYE[j]][0];
    leftPupil[1] += landmarks[K_FACE_LEFT_EYE[j]][1];
  }

  leftPupil[0] /= K_FACE_LEFT_EYE.length - 1;
  leftPupil[1] /= K_FACE_LEFT_EYE.length - 1;

  let rightPupil = [0, 0];
  for (let j = 0; j < K_FACE_RIGHT_EYE.length - 1; j += 1) {
    rightPupil[0] += landmarks[K_FACE_RIGHT_EYE[j]][0];
    rightPupil[1] += landmarks[K_FACE_RIGHT_EYE[j]][1];
  }

  rightPupil[0] /= K_FACE_RIGHT_EYE.length - 1;
  rightPupil[1] /= K_FACE_RIGHT_EYE.length - 1;

  const pline = new Phaser.Line(
    leftPupil[0] + userVideoSprite.position.x,
    leftPupil[1] + userVideoSprite.position.y,
    rightPupil[0] + userVideoSprite.position.x,
    rightPupil[1] + userVideoSprite.position.y
  );
  const pd = pline.length;
  const glassesScale = pd / 200;
  sunglasses.scale.setTo(glassesScale, glassesScale);
  sunglasses.position = pline.midPoint();
  sunglasses.rotation = pline.angle;
  sunglasses.visible = true;
}

function handleValidationDetections(detections) {
  if (detections) {
    // TODO: Handle CV canvas downres factor?

    const l = detections.landmarks._positions;

    landmarks = new Array();

    for (let i = 0; i < l.length; i += 1) {
      // TODO: Does this break if user webcam dimensions !== 640:480 ?
      landmarks.push([
        l[i]._x * userVideoSprite.scale.x * K_FACE_CV_DOWNRES_FACTOR,
        l[i]._y * userVideoSprite.scale.y * K_FACE_CV_DOWNRES_FACTOR,
      ]);
    }

    if (detections.expressions) {
      if (validationStateFaceData.length < 200000) {
        handleViewerFaceData(
          validateFrame,
          validationStateFaceData,
          landmarks,
          detections.expressions
        );
      }

      emotions = detections.expressions;
    } else {
      if (validationStateFaceData.length < 200000) {
        handleViewerFaceData(
          validateFrame,
          validationStateFaceData,
          landmarks,
          null
        );
      }
    }

    if (K_INSTALLATION_MODE) {
      const faceData = new viewerFaceDataStruct(
        validateFrame,
        landmarks,
        detections.expressions || null
      );
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

const validateState = {
  create: function () {
    function makeItGo() {
      hasStarted = true;
      logoSprite.inputEnabled = false;
      pressRedButtonToStart.visible = false;
      faceCameraAndCheckLighting.visible = false;

      if (K_LOGO_ANIMATION) {
        logoAnimationTimer = game.time.create(false);

        let logoFrameIdx = 78;

        logoAnimationTimer.loop(
          30,
          () => {
            logoSprite.loadTexture(`logoFrame${logoFrameIdx}`);

            if (logoFrameIdx === 0) {
              logoAnimationTimer.stop();

              game.camera.onFadeComplete.addOnce(() => {
                notValidatedTimer.stop();
                validatedTimer.stop();

                game.state.start("dataInit");
              });

              game.camera.fade(0x000000, 300);
            } else {
              logoFrameIdx -= 1;
            }
          },
          this
        );

        logoAnimationTimer.start();
      } else {
        game.camera.onFadeComplete.addOnce(() => {
          notValidatedTimer.stop();
          validatedTimer.stop();

          game.state.start("dataInit");
        });

        game.camera.fade(0x000000, 300);
      }
    }

    if (K_MULTITHREADING) {
      cvWorker.onmessage = function (event) {
        if (event.data.opcode === 1) {
          handleValidationDetections(event.data.dets);
        }
      };
    }

    game.camera.flash(0x000000, 1000, false);

    // Reset state stuff
    debounceHandle = null;
    validateFrame = 0;
    readyToPlay = false;
    hasStarted = false;
    validationStateFaceData = [];

    // Do we pointlessly create objects here only to stop them and recreate them in play state?
    // Why yes we do
    cvSprite = game.add.sprite(0, 0, userVideo);
    cvSprite.visible = false;

    clmCanvas = game.add.bitmapData(
      Math.round(cvSprite.width / K_FACE_CV_DOWNRES_FACTOR),
      Math.round(cvSprite.height / K_FACE_CV_DOWNRES_FACTOR)
    );

    dogLoopVideo = game.add.video("dogloop");
    dogLoopSprite = game.add.sprite(K_PROJECT_WIDTH / 4, 0, dogLoopVideo);

    dogLoopVideo.play(true, 1);

    userVideoSprite = game.add.sprite(0, 0, userVideo);

    const s = K_PROJECT_WIDTH / (userVideo.height * K_PROJECT_ASPECT_RATIO);
    userVideoSprite.scale.setTo(s, s);

    userVideoMaskQuarterRight = game.make.graphics(0, 0);
    userVideoMaskQuarterRight.beginFill(0xffffff);
    userVideoMaskQuarterRight.drawRect(
      0,
      0,
      K_PROJECT_WIDTH / 2,
      K_PROJECT_HEIGHT
    );

    userVideoSprite.mask = userVideoMaskQuarterRight;

    userVideoSprite.position.x = -(userVideoSprite.width / 4);

    sunglasses = game.add.sprite(0, 0, "sunglasses");
    sunglasses.anchor.setTo(0.5, 0.5);
    sunglasses.visible = false;

    // const mozillaLogo = game.add.sprite(0, 0, "mozillaLogo");
    // mozillaLogo.position = {x: Math.round(K_PROJECT_WIDTH - mozillaLogo.width - 37), y: 37};

    const webbyLaurel = game.add.sprite(0, 0, "webbyLaurel");
    webbyLaurel.scale.setTo(0.5, 0.5);
    webbyLaurel.anchor.setTo(0, 0);
    webbyLaurel.position = { x: 10, y: 10 };

    const meetTheNewAI = game.add.text(
      0,
      0,
      '"meet the new A.I. \nthat knows you better \nthan you know yourself" ',
      {
        font: "Arimo, sans-serif",
        strokeThickness: 5,
        fontStyle: "italic",
        fontSize: "30px",
        fontWeight: "bold",
        fill: "#00ffff",
        align: "right",
      }
    );
    meetTheNewAI.lineSpacing = -10;
    meetTheNewAI.setShadow(2, 2, "#000000");
    meetTheNewAI.anchor.setTo(1.0, 0.0);

    meetTheNewAI.position = { x: K_PROJECT_WIDTH - 20, y: 20 };

    const directedBy = game.add.text(
      0,
      0,
      " written, directed and programmed \n by noah levenson  (6 min) ",
      {
        font: "Arimo, sans-serif",
        strokeThickness: 5,
        fontStyle: "italic",
        fontSize: "20px",
        fontWeight: "bold",
        fill: "#ffffff",
        align: "right",
      }
    );
    directedBy.lineSpacing = -5;
    directedBy.setShadow(2, 2, "#000000");
    directedBy.anchor.setTo(1.0, 0.0);
    directedBy.position = {
      x: K_PROJECT_WIDTH - 20,
      y: 20 + meetTheNewAI.height,
    };

    const tribecaLaurel = game.add.sprite(0, 0, "tribecaLaurel");
    tribecaLaurel.scale.setTo(0.5, 0.5);
    tribecaLaurel.anchor.setTo(1.0, 0.0);
    tribecaLaurel.position = {
      x: K_PROJECT_WIDTH - 20,
      y: directedBy.y + directedBy.height + 5,
    };

    const ciffLaurel = game.add.sprite(0, 0, "ciffLaurel");
    ciffLaurel.scale.setTo(0.5, 0.5);
    ciffLaurel.anchor.setTo(1.0, 0.0);
    ciffLaurel.position = {
      x: K_PROJECT_WIDTH - 20,
      y: tribecaLaurel.y + tribecaLaurel.height + 5,
    };

    const ridmLaurel = game.add.sprite(0, 0, "ridmLaurel");
    ridmLaurel.scale.setTo(0.5, 0.5);
    ridmLaurel.anchor.setTo(1.0, 0.0);
    ridmLaurel.position = {
      x: K_PROJECT_WIDTH - 20,
      y: ciffLaurel.y + ciffLaurel.height + 5,
    };

    const opencityLaurel = game.add.sprite(0, 0, "opencityLaurel");
    opencityLaurel.scale.setTo(0.5, 0.5);
    opencityLaurel.anchor.setTo(1.0, 0.0);
    opencityLaurel.position = {
      x: K_PROJECT_WIDTH - 20,
      y: ridmLaurel.y + ridmLaurel.height + 5,
    };

    if (K_LOGO_ANIMATION) {
      logoSprite = game.add.sprite(0, 0, "logoFrame0");
      logoSprite.scale.setTo(0.65, 0.65);
      logoSprite.anchor.setTo(0.5, 0.5);
      logoSprite.position = { x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2 };

      logoSprite.hitArea = new Phaser.Circle(0, 0, 700);

      let logoFrameIdx = 1;

      logoAnimationTimer = game.time.create(false);

      logoAnimationTimer.loop(
        30,
        () => {
          logoSprite.loadTexture(`logoFrame${logoFrameIdx}`);

          if (logoFrameIdx === 79) {
            logoAnimationTimer.stop();
            readyToPlay = true;
          } else {
            logoFrameIdx += 1;
          }
        },
        this
      );

      logoAnimationTimer.start();
    } else {
      logoSprite = game.add.sprite(0, 0, "logoFrame79");
      logoSprite.scale.setTo(0.65, 0.65);
      logoSprite.anchor.setTo(0.5, 0.5);
      logoSprite.position = { x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2 };

      logoSprite.hitArea = new Phaser.Circle(0, 0, 700);
      readyToPlay = true;
    }

    // pressRedButtonToStart = game.add.sprite(0, 0, "pressRedButtonToStart");
    // pressRedButtonToStart.scale.setTo(0.75, 0.75);

    pressRedButtonToStart = game.add.text(0, 0, "click smiley to start ", {
      font: "Arimo, sans-serif",
      strokeThickness: 5,
      fontStyle: "italic",
      fontSize: "40px",
      fontWeight: "bold",
      fill: "#ffff1a",
      align: "right",
    });
    pressRedButtonToStart.setShadow(2, 2, "#000000");
    pressRedButtonToStart.anchor.setTo(0.5, 0.5);
    pressRedButtonToStart.position = {
      x: K_PROJECT_WIDTH / 2,
      y: K_PROJECT_HEIGHT - 75,
    };
    pressRedButtonToStart.visible = false;

    // faceCameraAndCheckLighting = game.add.sprite(0, 0, "faceCameraAndCheckLighting");
    // faceCameraAndCheckLighting.scale.setTo(0.75, 0.75);

    faceCameraAndCheckLighting = game.add.text(
      0,
      0,
      "face camera and check lighting ",
      {
        font: "Arimo, sans-serif",
        strokeThickness: 5,
        fontStyle: "italic",
        fontSize: "40px",
        fontWeight: "bold",
        fill: "#ff0066",
        align: "right",
      }
    );
    faceCameraAndCheckLighting.setShadow(2, 2, "#000000");
    faceCameraAndCheckLighting.anchor.setTo(0.5, 0.5);
    faceCameraAndCheckLighting.position = {
      x: K_PROJECT_WIDTH / 2,
      y: K_PROJECT_HEIGHT - 75,
    };
    faceCameraAndCheckLighting.visible = true;

    notValidatedTimer = game.time.create(false);

    notValidatedTimer.loop(600, () => {
      faceCameraAndCheckLighting.text =
        faceCameraAndCheckLighting.text === ""
          ? "face camera and check lighting "
          : "";
    });

    notValidatedTimer.start();

    validatedTimer = game.time.create(false);

    validatedTimer.loop(200, () => {
      pressRedButtonToStart.text =
        pressRedButtonToStart.text === "" ? "click smiley to start " : "";
    });

    validatedTimer.start();

    if (K_MOBILE) {
      mobileTapText = game.add.text(0, 0, "tap", {
        font: "Arimo, sans-serif",
        fontSize: "44px",
        fill: "rgba(255, 255, 255, 0.5)",
      });
      mobileTapText.anchor.setTo(0.5, 0.5);
      mobileTapText.position = {
        x: K_PROJECT_WIDTH * 0.75,
        y: K_PROJECT_HEIGHT / 2,
      };

      game.input.onTap.addOnce(() => {
        mobileTapText.visible = false;
      });
    }

    if (!K_MOBILE) {
      fullScreenButton = game.add.sprite(1205, 645, "fullscreenButton");
      fullScreenButton.scale.setTo(0.75, 0.75);
      fullScreenButton.tint = 0x8c8c8c;

      fullScreenButton.events.onInputOver.add(function () {
        fullScreenButton.tint = 0xffffff;
      });

      fullScreenButton.events.onInputOut.add(function () {
        fullScreenButton.tint = 0x8c8c8c;
      });

      fullScreenButton.events.onInputDown.add(function () {
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

    logoSprite.events.onInputDown.addOnce(makeItGo);

    const spacebarKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    spacebarKey.onDown.add(() => {
      if (logoSprite.inputEnabled) {
        game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
        makeItGo();
      }
    });
  },

  update: async function () {
    if (validateFrame % K_CV_REFRESH_INTERVAL === 0) {
      if (K_MULTITHREADING) {
        createImageBitmap(userVideo.video).then((img) => {
          cvWorker.postMessage(
            {
              fakeWindow: fakeWindow,
              fakeDocument: fakeDocument,
              img: img,
              opcode: 1,
              getEmotions: true,
              frame: validateFrame,
            },
            [img]
          );
        });
      } else {
        updateCLM(clmCanvas);

        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
          scoreThreshold: 0.5,
        });
        let detections;

        if (K_RUN_CV_ASYNC) {
          detections = faceapi
            .detectSingleFace(clmCanvas.canvas, options)
            .withFaceLandmarks(true)
            .withFaceExpressions();

          detections.then((dets) => {
            handleValidationDetections(dets);
          });
        } else {
          detections = await faceapi
            .detectSingleFace(clmCanvas.canvas, options)
            .withFaceLandmarks(true)
            .withFaceExpressions();

          handleValidationDetections(detections);
        }
      }
    }

    if (landmarks) {
      if (validateFrame % K_AR_FRAME_INTERVAL === 0) {
        drawSunglasses(landmarks);
      }

      // Here's the debounce
      if (debounceHandle === null && readyToPlay) {
        debounceHandle = setTimeout(() => {
          if (landmarks) {
            if (!hasStarted) {
              faceCameraAndCheckLighting.visible = false;
              pressRedButtonToStart.visible = true;

              logoSprite.inputEnabled = true;
              logoSprite.input.useHandCursor = true;
            }
          }
        }, K_VALIDATE_DEBOUNCE_DELAY);
      }
    } else {
      clearTimeout(debounceHandle);
      debounceHandle = null;

      sunglasses.visible = false;

      if (!hasStarted) {
        pressRedButtonToStart.visible = false;
        faceCameraAndCheckLighting.visible = true;
      }

      logoSprite.inputEnabled = false;
    }

    validateFrame += 1; // Are we nervous about what happens if this number gets really huge?

    if (!K_MOBILE) {
      if (!game.scale.isFullScreen) {
        fullScreenButton.visible = true;
      } else {
        fullScreenButton.visible = false;
      }
    }
  },
};
