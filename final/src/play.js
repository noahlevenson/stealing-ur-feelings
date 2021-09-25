function getFrame(filmSprite, frameCanvas) {
  frameCanvas.copy(
    filmSprite,
    K_PROJECT_WIDTH + 1,
    1,
    2,
    K_FRAMECODE_BIT_DEPTH / 2,
    0,
    0
  );
  frameCanvas.update();

  let buffer = new ArrayBuffer(2);
  let frame = new Uint16Array(buffer);

  let bitOffset = 0;

  for (let i = 0; i < frameCanvas.height; i += 1) {
    for (let j = 0; j < frameCanvas.width; j += 1) {
      const p = frameCanvas.getPixel(j, i);

      if ((p.r + p.g + p.b) / 3 > 125) {
        frame[0] |= 1 << bitOffset;
      }

      bitOffset += 1;
    }
  }

  return frame[0];
}

function updateCLM(clmCanvas) {
  clmCanvas.copy(
    cvSprite,
    0,
    0,
    cvSprite.width,
    cvSprite.height,
    0,
    0,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    1 / K_FACE_CV_DOWNRES_FACTOR,
    1 / K_FACE_CV_DOWNRES_FACTOR
  );
  clmCanvas.update();
}

function handlePlayDetections(detections, cachedFrame) {
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

    if (detections.expressions && getLandmarks) {
      handleViewerFaceData(
        cachedFrame,
        viewerFaceData,
        landmarks,
        detections.expressions
      );
      emotions = detections.expressions;
    } else if (detections.expressions && !getLandmarks) {
      handleViewerFaceData(
        cachedFrame,
        viewerFaceData,
        null,
        detections.expressions
      );
      emotions = detections.expressions;
    } else if (!detections.expressions && getLandmarks) {
      handleViewerFaceData(cachedFrame, viewerFaceData, landmarks, null);
    }

    if (K_INSTALLATION_MODE) {
      const faceData = new viewerFaceDataStruct(
        cachedFrame,
        landmarks,
        detections.expressions || null
      );
      socket.emit("data", faceData);
    }

    userVideoStatusText.visible = false;
  } else {
    landmarks = false;
    emotions = false;
    userVideoStatusText.visible = true;

    if (K_INSTALLATION_MODE) {
      socket.emit("data", null);
    }
  }
}

function handleViewerFaceData(frame, dataArray, l = null, x = null) {
  const faceData = new viewerFaceDataStruct(frame, l, x);
  dataArray.push(faceData);
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
    faceModel.lineStyle(2, 0x80ff00, 1);
    draw(K_FACE_OUTLINE);
    draw(K_FACE_MOUTH_OUTER);
    draw(K_FACE_MOUTH_INNER_TOP);
    draw(K_FACE_MOUTH_INNER_BOTTOM);
    draw(K_FACE_SEPTUM);
    draw(K_FACE_NOSE);
    draw(K_FACE_LEFT_EYE);
    draw(K_FACE_RIGHT_EYE);
    draw(K_FACE_LEFT_BROW);
    draw(K_FACE_RIGHT_BROW);
  }
}

function drawBigMouthModel(l) {
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
  const xo = K_PROJECT_WIDTH / 2 - landmarks[51][0];
  const yo = K_PROJECT_HEIGHT / 2 - landmarks[51][1];

  for (let i = 0; i < landmarks.length; i += 1) {
    landmarks[i][0] += xo;
    landmarks[i][1] += yo;
  }

  mouthModel.visible = true;
  mouthModel.clear();
  mouthModel.lineStyle(6, 0xff0000, 1);

  mouthModel.moveTo(
    landmarks[K_FACE_MOUTH_OUTER[0]][0],
    landmarks[K_FACE_MOUTH_OUTER[0]][1]
  );

  for (let i = 1; i < K_FACE_MOUTH_OUTER.length; i += 1) {
    mouthModel.lineTo(
      landmarks[K_FACE_MOUTH_OUTER[i]][0],
      landmarks[K_FACE_MOUTH_OUTER[i]][1]
    );
  }

  mouthModel.moveTo(
    landmarks[K_FACE_MOUTH_INNER_TOP[0]][0],
    landmarks[K_FACE_MOUTH_INNER_TOP[0]][1]
  );

  for (let i = 1; i < K_FACE_MOUTH_INNER_TOP.length; i += 1) {
    mouthModel.lineTo(
      landmarks[K_FACE_MOUTH_INNER_TOP[i]][0],
      landmarks[K_FACE_MOUTH_INNER_TOP[i]][1]
    );
  }

  mouthModel.moveTo(
    landmarks[K_FACE_MOUTH_INNER_BOTTOM[0]][0],
    landmarks[K_FACE_MOUTH_INNER_BOTTOM[0]][1]
  );

  for (let i = 1; i < K_FACE_MOUTH_INNER_BOTTOM.length; i += 1) {
    mouthModel.lineTo(
      landmarks[K_FACE_MOUTH_INNER_BOTTOM[i]][0],
      landmarks[K_FACE_MOUTH_INNER_BOTTOM[i]][1]
    );
  }
}

function drawEmotionChart() {
  if (emotions) {
    emotionChart.visible = true;
    emotionChart.clear();
    emotionChart.beginFill(0x80ff00);

    const angryy = -165 * emotions["angry"];
    const sady = -165 * emotions["sad"];
    const surprisedy = -165 * emotions["surprised"];
    const happyy = -165 * emotions["happy"];

    emotionChart.drawRect(10, K_PROJECT_HEIGHT, 147.5, angryy);
    emotionChart.drawRect(167.5, K_PROJECT_HEIGHT, 147.5, sady);
    emotionChart.drawRect(325, K_PROJECT_HEIGHT, 147.5, surprisedy);
    emotionChart.drawRect(482.5, K_PROJECT_HEIGHT, 147.5, happyy);

    angryLabelText.visible = true;
    sadLabelText.visible = true;
    surprisedLabelText.visible = true;
    happyLabelText.visible = true;

    angryLabelText.position.x = K_PROJECT_WIDTH / 4 + 83.75;
    angryLabelText.position.y = K_PROJECT_HEIGHT + angryy + 30;

    sadLabelText.position.x = K_PROJECT_WIDTH / 4 + 241.25;
    sadLabelText.position.y = K_PROJECT_HEIGHT + sady + 30;

    surprisedLabelText.position.x = K_PROJECT_WIDTH / 4 + 398.75;
    surprisedLabelText.position.y = K_PROJECT_HEIGHT + surprisedy + 30;

    happyLabelText.position.x = K_PROJECT_WIDTH / 4 + 556.25;
    happyLabelText.position.y = K_PROJECT_HEIGHT + happyy + 30;
  }
}

function cleanup() {
  filmGroup.removeAll();
  userVideoGroup.removeAll();
  tophatGroup.removeAll();
  recordedFeatureGroup.removeAll();
  altUserVideoGroup.removeAll();
  landmarkGroup.removeAll();
  gradientBackgroundGroup.removeAll();
  pixelValuesGroup.removeAll();
  midgroundGroup.removeAll();
  overlayGroup.removeAll();
  mapGroup.removeAll();
  textGroup.removeAll();
  finalOverlayGroup.removeAll();

  behindTextBoxesGroup.removeAll();
  allTextBoxesGroup.removeAll();
  inFrontOfTextBoxGroup.removeAll();

  if (K_INSTALLATION_MODE) {
    game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
  }
}

const playState = {
  create: function () {
    // Reset state stuff
    viewerFaceData = [];

    getLandmarks = true;
    getEmotions = false;
    activated = false;
    frame = 0;
    gameframe = 0;
    lastFrame = 0;
    startTime = 0;

    landmarks = undefined;
    emotions = undefined;

    if (K_MUTE) {
      game.sound.mute = true;
    }

    if (K_MULTITHREADING) {
      cvWorker.onmessage = function (event) {
        if (event.data.opcode === 1) {
          handlePlayDetections(event.data.dets, event.data.frame);
        }
      };
    }

    // In installation mode, allow the film to be reset by pressing and holding the "go" button for 2 seconds
    if (K_INSTALLATION_MODE) {
      let t1 = 0;
      let t2 = 0;

      const spacebarKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      spacebarKey.callbackContext = this;

      spacebarKey.onDown.add(() => {
        t1 = game.time.now;
      });

      spacebarKey.onUp.add(() => {
        t2 = game.time.now;

        if (t2 - t1 >= 2000) {
          filmVideo.stop();
          filmVideo.video.currentTime = 0;
          filmVideo.complete();
        }
      });
    }

    game.world.setBounds(
      -1000,
      -1000,
      K_PROJECT_WIDTH + 1000,
      K_PROJECT_HEIGHT + 1000
    );

    frameCanvas = game.add.bitmapData(2, 8);

    filmGroup = game.add.group();
    userVideoGroup = game.add.group();
    tophatGroup = game.add.group();
    recordedFeatureGroup = game.add.group();
    altUserVideoGroup = game.add.group();
    landmarkGroup = game.add.group();
    gradientBackgroundGroup = game.add.group();
    pixelValuesGroup = game.add.group();
    midgroundGroup = game.add.group();
    overlayGroup = game.add.group();
    mapGroup = game.add.group();
    textGroup = game.add.group();
    finalOverlayGroup = game.add.group();

    behindTextBoxesGroup = game.add.group();
    allTextBoxesGroup = game.add.group();
    inFrontOfTextBoxGroup = game.add.group();

    cvSprite = game.add.sprite(0, 0, userVideo);
    cvSprite.visible = false;

    // Handling variance in user camera aspect ratio is a 2 step process:
    // First we get aspect ratio of user video...
    userVideoAspect = userVideo.width / userVideo.height;

    userVideoSprite = game.add.sprite(0, 0, userVideo);

    // ...and if necessary, create a backplate in the correct aspect for it
    if (userVideoAspect < K_PROJECT_ASPECT_RATIO) {
      userVideoBackplateBMD = game.add.bitmapData(
        userVideo.height * K_PROJECT_ASPECT_RATIO,
        userVideo.height
      );
      userVideoBackplateBMD.fill(255, 51, 255, 0);
      userVideoBackplateSprite = game.add.sprite(0, 0, userVideoBackplateBMD);
      userVideoGroup.add(userVideoBackplateSprite);
    } else if (userVideoAspect > K_PROJECT_ASPECT_RATIO) {
      // TODO: User video is wider than 16:9 - this is a pretty extreme edge case
    }

    userVideoGroup.add(userVideoSprite);

    clmCanvas = game.add.bitmapData(
      Math.round(cvSprite.width / K_FACE_CV_DOWNRES_FACTOR),
      Math.round(cvSprite.height / K_FACE_CV_DOWNRES_FACTOR)
    );

    userVideoMaskQuarterRight = game.make.graphics(0, 0);
    userVideoMaskQuarterRight.beginFill(0xffffff);
    userVideoMaskQuarterRight.drawRect(
      0,
      0,
      K_PROJECT_WIDTH * 0.75,
      K_PROJECT_HEIGHT
    );
    userVideoMaskQuarterRight.visible = false;

    userVideoSprite.mask = userVideoMaskQuarterRight;

    userVideoGroup.add(userVideoMaskQuarterRight);

    boundingBox = game.add.graphics(0, 0);
    boundingBox.lineStyle(5, 0x80ff00, 1);
    boundingBox.visible = false;
    finalOverlayGroup.add(boundingBox);

    // Then we derive a scaling factor from the backplate (which we are sure is the correct aspect)
    // or user video (which is assumed to be correct aspect if no backplate exists) and apply it
    let s;
    if (userVideoBackplateBMD) {
      userVideoSpriteScale = K_PROJECT_WIDTH / userVideoBackplateBMD.width;
      userVideoBackplateSprite.scale.setTo(
        userVideoSpriteScale,
        userVideoSpriteScale
      );
      userVideoBackplateSprite.mask = userVideoMaskQuarterRight;
      userVideoSprite.scale.setTo(userVideoSpriteScale, userVideoSpriteScale);
    } else {
      userVideoSpriteScale = K_PROJECT_WIDTH / userVideo.width;
      userVideoSprite.scale.setTo(userVideoSpriteScale, userVideoSpriteScale);
    }

    userVideoSprite.position = {
      x: K_PROJECT_WIDTH / 2 - userVideoSprite.width / 2,
      y: 0,
    };

    filmVideo = game.add.video("film");

    filmVideo.onComplete.addOnce(() => {
      cleanup();
      filmVideo.video.currentTime = 0;

      if (K_PETITION) {
        game.state.start("petition");
      } else {
        game.state.start("validate");
      }
    });

    filmSprite = game.add.sprite(0, 0, filmVideo);
    filmSprite.visible = false;

    filmGroup.add(filmSprite);

    userVideoProcessedBMD = game.add.bitmapData(
      Math.round(userVideoSprite.width / K_VIDEO_PROCESSING_DOWNRES_FACTOR),
      Math.round(userVideoSprite.height / K_VIDEO_PROCESSING_DOWNRES_FACTOR)
    );
    altUserVideoProcessedBMD = game.add.bitmapData(
      Math.round(userVideoSprite.width / K_VIDEO_PROCESSING_DOWNRES_FACTOR),
      Math.round(userVideoSprite.height / K_VIDEO_PROCESSING_DOWNRES_FACTOR)
    );

    userVideoProcessedSprite = game.add.sprite(0, 0, userVideoProcessedBMD);
    userVideoProcessedSprite.visible = false;
    userVideoProcessedSprite.mask = userVideoMaskQuarterRight;
    userVideoProcessedSprite.scale.setTo(
      K_VIDEO_PROCESSING_DOWNRES_FACTOR,
      K_VIDEO_PROCESSING_DOWNRES_FACTOR
    );
    userVideoProcessedSprite.position = {
      x: K_PROJECT_WIDTH / 2 - userVideoSprite.width / 2,
      y: 0,
    };
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

    angryLabelText = game.add.text(K_PROJECT_WIDTH / 4, 0, "angry", {
      font: "Arimo, sans-serif",
      fontSize: "24px",
      fill: "#000000",
    });
    angryLabelText.anchor.setTo(0.5, 0.5);
    angryLabelText.visible = false;
    sadLabelText = game.add.text(K_PROJECT_WIDTH / 4, 0, "sad", {
      font: "Arimo, sans-serif",
      fontSize: "24px",
      fill: "#000000",
    });
    sadLabelText.anchor.setTo(0.5, 0.5);
    sadLabelText.visible = false;
    surprisedLabelText = game.add.text(K_PROJECT_WIDTH / 4, 0, "surprised", {
      font: "Arimo, sans-serif",
      fontSize: "24px",
      fill: "#000000",
    });
    surprisedLabelText.anchor.setTo(0.5, 0.5);
    surprisedLabelText.visible = false;
    happyLabelText = game.add.text(K_PROJECT_WIDTH / 4, 0, "happy", {
      font: "Arimo, sans-serif",
      fontSize: "24px",
      fill: "#000000",
    });
    happyLabelText.anchor.setTo(0.5, 0.5);
    happyLabelText.visible = false;
    userVideoGroup.add(angryLabelText);
    userVideoGroup.add(sadLabelText);
    userVideoGroup.add(surprisedLabelText);
    userVideoGroup.add(happyLabelText);

    userVideoMaskQuarterRight.beginFill(0xffffff);
    userVideoMaskQuarterRight.drawRect(
      0,
      0,
      K_PROJECT_WIDTH * 0.75,
      K_PROJECT_HEIGHT
    );

    userVideoStatusText = game.add.text(
      K_PROJECT_WIDTH / 4 + 20,
      20,
      "face camera and check lighting ",
      {
        font: "Arimo, sans-serif",
        strokeThickness: 5,
        fontStyle: "italic",
        fontSize: "30px",
        fontWeight: "bold",
        fill: "#ff0066",
      }
    );
    userVideoStatusText.setShadow(2, 2, "#000000");

    userVideoStatusText.visible = false;
    userVideoGroup.add(userVideoStatusText);

    faceModel = game.add.graphics(
      K_PROJECT_WIDTH / 2 - userVideoSprite.width / 2,
      0
    );
    faceModel.lineStyle(3, 0x80ff00, 1);
    faceModel.visible = false;
    userVideoGroup.add(faceModel);

    userVideoGroup.position.x = -K_PROJECT_WIDTH;

    userVideoMaskQuarterLeft = game.make.graphics(0, 0);
    userVideoMaskQuarterLeft.beginFill(0xffffff);
    userVideoMaskQuarterLeft.drawRect(
      K_PROJECT_WIDTH / 4,
      0,
      K_PROJECT_WIDTH,
      K_PROJECT_HEIGHT
    );
    userVideoMaskQuarterLeft.visible = false;

    userVideoProcessedSpriteLeftMask = game.add.sprite(
      0,
      0,
      userVideoProcessedBMD
    );
    userVideoProcessedSpriteLeftMask.mask = userVideoMaskQuarterLeft;
    userVideoProcessedSpriteLeftMask.visible = false;
    userVideoProcessedSpriteLeftMask.scale.setTo(
      K_VIDEO_PROCESSING_DOWNRES_FACTOR,
      K_VIDEO_PROCESSING_DOWNRES_FACTOR
    );
    userVideoProcessedSpriteLeftMask.position = {
      x: K_PROJECT_WIDTH / 2 - userVideoSprite.width / 2,
      y: 0,
    };

    altUserVideoGroup.add(userVideoProcessedSpriteLeftMask);
    altUserVideoGroup.add(userVideoMaskQuarterLeft);

    for (let i = 0; i < K_NUMBER_OF_LANDMARKS; i += 1) {
      landmarkText[i] = game.add.text(0, 0, i, {
        font: "Arimo, sans-serif",
        fontSize: "7px",
        fill: "#80ff00",
      });
      landmarkText[i].visible = false;
      landmarkGroup.add(landmarkText[i]);
    }

    if (K_USER_MUST_INITIATE_VIDEO) {
      playButton = game.add.sprite(0, 0, "playButtonImage");
      playButton.anchor.setTo(0.5, 0.5);
      playButton.x = K_PROJECT_WIDTH / 2;
      playButton.y = K_PROJECT_HEIGHT / 2;
      playButton.inputEnabled = true;
      playButton.input.useHandCursor = true;

      playButton.events.onInputOver.add(() => {
        playButton.tint = 0xffff1a;
      });

      playButton.events.onInputOut.add(() => {
        playButton.tint = 0xffffff;
      });

      playButton.events.onInputDown.addOnce(() => {
        playButton.inputEnabled = false;
        playButton.visible = false;

        filmVideo.currentTime = 0;
        filmSprite.visible = true;
        startTime = game.time.now;

        if (K_MULTITHREADING) {
          createImageBitmap(userVideo.video).then((img) => {
            cvWorker.postMessage(
              {
                fakeWindow: fakeWindow,
                fakeDocument: fakeDocument,
                img: img,
                opcode: 1,
                frame: frame,
                getEmotions: getEmotions,
              },
              [img]
            );
            filmVideo.play();
            activated = true;
          });
        } else {
          updateCLM(clmCanvas);
          const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: 0.5,
          });
          const detections = faceapi
            .detectSingleFace(clmCanvas.canvas, options)
            .withFaceLandmarks(true)
            .withFaceExpressions();
          detections.then(() => {
            filmVideo.play();
            activated = true;
          });
        }
      });
    }

    // **********************************************
    // Here's where we construct assets for the show!
    // **********************************************

    threeTitle = game.add.text(0, 0, "3", {
      font: "Arimo, sans-serif",
      fontSize: "675px",
      fontWeight: "bold",
      fill: "#ff3399",
    });
    threeTitle.setShadow(20, 20, "#000000");
    threeTitle.anchor.setTo(0.5, 0.5);
    threeTitle.x = K_PROJECT_WIDTH / 2;
    threeTitle.y = K_PROJECT_HEIGHT / 2;
    threeTitle.visible = false;

    twoTitle = game.add.text(0, 0, "2", {
      font: "Arimo, sans-serif",
      fontSize: "675px",
      fontWeight: "bold",
      fill: "#4dff4d",
    });
    twoTitle.setShadow(20, 20, "#000000");
    twoTitle.anchor.setTo(0.5, 0.5);
    twoTitle.x = K_PROJECT_WIDTH / 2;
    twoTitle.y = K_PROJECT_HEIGHT / 2;
    twoTitle.visible = false;

    oneTitle = game.add.text(0, 0, "1", {
      font: "Arimo, sans-serif",
      fontSize: "675px",
      fontWeight: "bold",
      fill: "#ffffff",
    });
    oneTitle.setShadow(20, 20, "#000000");
    oneTitle.anchor.setTo(0.5, 0.5);
    oneTitle.x = K_PROJECT_WIDTH / 2;
    oneTitle.y = K_PROJECT_HEIGHT / 2;
    oneTitle.visible = false;

    techQuizTitle = game.add.text(0, 0, "TECH\nQUIZ", {
      font: "Arimo, sans-serif",
      fontSize: "340px",
      fontWeight: "bold",
      fill: "#ffff1a",
    });
    techQuizTitle.setShadow(20, 20, "#000000");
    techQuizTitle.anchor.setTo(0.5, 0.5);
    techQuizTitle.x = K_PROJECT_WIDTH / 2;
    techQuizTitle.y = K_PROJECT_HEIGHT / 2;
    techQuizTitle.visible = false;

    dogNose = game.add.sprite(0, 0, "dogNose");
    dogNose.anchor.setTo(0.5, 0.5);
    behindTextBoxesGroup.add(dogNose);
    dogNose.visible = false;

    dogEars = game.add.sprite(0, 0, "dogEars");
    dogEars.anchor.setTo(0.5, 1.0);
    behindTextBoxesGroup.add(dogEars);
    dogEars.visible = false;

    tophat = game.add.sprite(0, 0, "tophat");
    tophat.anchor.setTo(0.5, 1.0);
    tophat.visible = false;
    tophatGroup.add(tophat);

    mustache = game.add.sprite(0, 0, "mustache");
    mustache.anchor.setTo(0.5, 0.2);
    mustache.visible = false;
    tophatGroup.add(mustache);

    monocle = game.add.sprite(0, 0, "monocle");
    monocle.anchor.setTo(0.38, 0.2);
    monocle.visible = false;
    tophatGroup.add(monocle);

    headPhysicsSprite = game.add.sprite(500, 400, "headPhysicsSprite");
    headPhysicsSprite.anchor.setTo(0.5, 0.5);
    headPhysicsSprite.alpha = 0;
    game.physics.enable(headPhysicsSprite, Phaser.Physics.ARCADE);
    headPhysicsSprite.body.immovable = true;
    headPhysicsSprite.visible = false;

    // dogStats = game.add.text(0, 0, "1.000 positive", {font: "Arimo, sans-serif", fontSize: "34px", fontWeight: "bold", fill: "#33cc33", backgroundColor: "#000000"});
    // dogStats.anchor.setTo(0.5, 0.5);
    // dogStats.x = K_PROJECT_WIDTH / 2;
    // dogStats.y = (K_PROJECT_HEIGHT / 2) + 75;
    // inFrontOfTextBoxGroup.add(dogStats);
    // dogStats.visible = false;

    dogStats = game.add.text(0, 0, "1.000 \n positive ", {
      font: "Arimo, sans-serif",
      fontSize: "60px",
      fontWeight: "bold",
      strokeThickness: 5,
      fontStyle: "italic",
      fill: "#33cc33",
    });
    dogStats.setShadow(3, 3, "#000000");
    dogStats.anchor.setTo(0.5, 0.5);
    dogStats.x = K_PROJECT_WIDTH / 2;
    dogStats.y = K_PROJECT_HEIGHT / 2 + 40;
    inFrontOfTextBoxGroup.add(dogStats);
    dogStats.visible = false;

    // genderStatsBias = game.add.text(0, 0, "+1.000 female bias", {font: "Arimo, sans-serif", fontSize: "34px", fontWeight: "bold", fill: "#33cc33", backgroundColor: "#000000"})
    // genderStatsBias.anchor.setTo(0.5, 0.5);
    // genderStatsBias.x = 37 + (K_TEXT_BOX_SIZE / 2);
    // genderStatsBias.y = 37 + (K_TEXT_BOX_SIZE / 2) + 75;
    // genderStatsBias.visible = false;

    genderStatsBias = game.add.text(0, 0, "+1.000 \n female bias ", {
      font: "Arimo, sans-serif",
      fontSize: "60px",
      fontWeight: "bold",
      strokeThickness: 5,
      fontStyle: "italic",
      fill: "#33cc33",
    });
    genderStatsBias.setShadow(3, 3, "#000000");
    genderStatsBias.anchor.setTo(0.5, 0.5);
    genderStatsBias.x = 37 + K_TEXT_BOX_SIZE / 2;
    genderStatsBias.y = 37 + K_TEXT_BOX_SIZE / 2 + 40;
    genderStatsBias.visible = false;

    kanyeTitle = game.add.text(0, 0, "Your reaction to Kanye", {
      font: "Arimo, sans-serif",
      fontSize: "82px",
      fontWeight: "bold",
      fill: "#000000",
      backgroundColor: "#ffff1a",
    });
    kanyeTitle.anchor.setTo(0.5, 0.5);
    kanyeTitle.x = K_PROJECT_WIDTH + kanyeTitle.width / 2;
    kanyeTitle.y = 142;
    kanyeTitle.visible = true;

    kanyeBias = game.add.text(0, 0, "+1.000 positive", {
      font: "Arimo, sans-serif",
      fontSize: "112px",
      fontWeight: "bold",
      fill: "#33cc33",
      backgroundColor: "#000000",
    });
    kanyeBias.anchor.setTo(0.5, 0.5);
    kanyeBias.x = -(kanyeBias.width / 2);
    kanyeBias.y = K_PROJECT_HEIGHT - kanyeBias.height;
    kanyeBias.visible = true;

    pizzaTitle = game.add.text(0, 0, "Your reaction to pizza", {
      font: "Arimo, sans-serif",
      fontSize: "82px",
      fontWeight: "bold",
      fill: "#000000",
      backgroundColor: "#ffff1a",
    });
    pizzaTitle.anchor.setTo(0.5, 0.5);
    pizzaTitle.x = K_PROJECT_WIDTH + pizzaTitle.width / 2;
    pizzaTitle.y = 142;
    pizzaTitle.visible = true;

    pizzaBias = game.add.text(0, 0, "1.000 positive", {
      font: "Arimo, sans-serif",
      fontSize: "112px",
      fontWeight: "bold",
      fill: "#33cc33",
      backgroundColor: "#000000",
    });
    pizzaBias.anchor.setTo(0.5, 0.5);
    pizzaBias.x = -(pizzaBias.width / 2);
    pizzaBias.y = K_PROJECT_HEIGHT - pizzaBias.height;
    pizzaBias.visible = true;

    standbyForAIVisionTitle = game.add.text(
      0,
      0,
      "stand by for \nA.I. vision ",
      {
        font: "Arimo, sans-serif",
        fontSize: "150px",
        fontWeight: "bold",
        strokeThickness: 5,
        fontStyle: "italic",
        fill: "#ffffff",
      }
    );
    // standbyForAIVisionTitle.setShadow(20, 20, "#000000");
    standbyForAIVisionTitle.setShadow(8, 8, "#000000");
    standbyForAIVisionTitle.anchor.setTo(0.5, 0.5);
    standbyForAIVisionTitle.x = K_PROJECT_WIDTH / 2;
    standbyForAIVisionTitle.y = K_PROJECT_HEIGHT / 2;
    standbyForAIVisionTitle.visible = false;

    // actualImagesUsedToTrainTitle = game.add.text(0, 0, "Actual images that trained our AI", {font: "Arimo, sans-serif", fontSize: "67px", fontWeight: "bold", fill: "#000000", backgroundColor: "#ffff1a"});
    // actualImagesUsedToTrainTitle.anchor.setTo(0.5, 0.5);
    // actualImagesUsedToTrainTitle.x = K_PROJECT_WIDTH / 2;
    // actualImagesUsedToTrainTitle.y = 142;
    // actualImagesUsedToTrainTitle.visible = false;

    actualImagesUsedToTrainTitle = game.add.text(
      0,
      0,
      "*actual images \nthat trained \nour A.I. ",
      {
        font: "Arimo, sans-serif",
        strokeThickness: 5,
        fontStyle: "italic",
        fontSize: "70px",
        fontWeight: "bold",
        fill: "#ffffff",
      }
    );
    actualImagesUsedToTrainTitle.setShadow(3, 3, "#000000");
    actualImagesUsedToTrainTitle.anchor.setTo(0.0, 0.0);
    actualImagesUsedToTrainTitle.x = 20;
    actualImagesUsedToTrainTitle.y = 20;
    actualImagesUsedToTrainTitle.visible = false;

    trainingImageCelebrityTitle = game.add.text(0, 0, "(adam sandler) \n", {
      font: "Arimo, sans-serif",
      strokeThickness: 5,
      fontSize: "97px",
      fontStyle: "italic",
      fontWeight: "bold",
      fill: "#cccc00",
    });
    trainingImageCelebrityTitle.setShadow(5, 5, "#000000");
    trainingImageCelebrityTitle.anchor.setTo(0.5, 0);
    trainingImageCelebrityTitle.x = K_PROJECT_WIDTH / 2;
    trainingImageCelebrityTitle.y = K_PROJECT_HEIGHT / 2;
    trainingImageCelebrityTitle.visible = false;

    instructionsTitle = game.add.text(0, 0, "smile!!!", {
      font: "Arimo, sans-serif",
      fontSize: "150px",
      fontWeight: "bold",
      fill: "#ffff1a",
      backgroundColor: "#00000",
    });
    instructionsTitle.anchor.setTo(0.5, 0.5);
    instructionsTitle.x = K_PROJECT_WIDTH * 0.75;
    instructionsTitle.y = K_PROJECT_HEIGHT / 2;
    instructionsTitle.visible = false;
    midgroundGroup.add(instructionsTitle);

    // raceStatsBias = game.add.text(0, 0, "+1.000 Black bias", {font: "Arimo, sans-serif", fontSize: "34px", fontWeight: "bold", fill: "#33cc33", backgroundColor: "#000000"})
    // raceStatsBias.anchor.setTo(0.5, 0.5);
    // raceStatsBias.x = 37 + (K_TEXT_BOX_SIZE / 2);
    // raceStatsBias.y = 37 + (K_TEXT_BOX_SIZE / 2) + 75;
    // raceStatsBias.visible = false;

    raceStatsBias = game.add.text(0, 0, "+1.000 \nBlack bias ", {
      font: "Arimo, sans-serif",
      fontSize: "60px",
      fontWeight: "bold",
      strokeThickness: 5,
      fontStyle: "italic",
      fill: "#33cc33",
    });
    raceStatsBias.setShadow(3, 3, "#000000");
    raceStatsBias.anchor.setTo(0.5, 0.5);
    raceStatsBias.x = 37 + K_TEXT_BOX_SIZE / 2;
    raceStatsBias.y = 37 + K_TEXT_BOX_SIZE / 2 + 80;
    raceStatsBias.visible = false;

    gradient2Sprite = game.add.sprite(0, 0, "gradient2");
    gradient2Sprite.visible = false;
    recordedFeatureGroup.add(gradient2Sprite);

    for (let i = 0; i < K_NUMBER_OF_LANDMARKS; i += 1) {
      recordedLandmarkText[i] = game.add.text(0, 0, i, {
        font: "Arimo, sans-serif",
        fontSize: "8px",
        fontWeight: "bold",
        strokeThickness: 5,
        fill: "#ff99ff",
      });
      recordedLandmarkText[i].setShadow(2, 2, "#ff0000");
      recordedLandmarkText[i].visible = false;
      recordedFeatureGroup.add(recordedLandmarkText[i]);
    }

    recordingOfYourFaceTitle = game.add.text(
      0,
      0,
      "your face vectors \nrecorded 0 seconds ago ",
      {
        font: "Arimo, sans-serif",
        fontSize: "30px",
        strokeThickness: 5,
        fontStyle: "italic",
        fontWeight: "bold",
        fill: "#00ffff",
        backgroundColor: "#ffff1a",
      }
    );
    recordingOfYourFaceTitle.setShadow(2, 2, "#000000");
    recordingOfYourFaceTitle.anchor.setTo(0.5, 0.5);
    recordingOfYourFaceTitle.x = K_PROJECT_WIDTH / 4;
    recordingOfYourFaceTitle.y = 100;
    recordingOfYourFaceTitle.visible = false;
    recordedFeatureGroup.add(recordingOfYourFaceTitle);

    gradient1Sprite = game.add.sprite(0, 0, "gradient1");
    gradient1Sprite.visible = false;
    gradientBackgroundGroup.add(gradient1Sprite);

    pictureFrameSprite = game.add.sprite(0, 0, "pictureFrame");
    pictureFrameSprite.anchor.setTo(0.5, 0.5);
    const pictureFrameScale =
      (K_PROJECT_HEIGHT - 100) / pictureFrameSprite.height;
    pictureFrameSprite.scale.setTo(pictureFrameScale, pictureFrameScale);
    pictureFrameSprite.x = K_PROJECT_WIDTH / 2;
    pictureFrameSprite.y = K_PROJECT_HEIGHT / 2;
    pictureFrameSprite.visible = false;
    overlayGroup.add(pictureFrameSprite);

    museumCardSprite = game.add.sprite(
      pictureFrameSprite.x,
      pictureFrameSprite.y + pictureFrameSprite.height * 0.2,
      "museumCard"
    );
    museumCardSprite.visible = false;

    gradient3Sprite = game.add.sprite(0, 0, "gradient3");
    gradient3Sprite.visible = false;
    overlayGroup.add(gradient3Sprite);

    yourMouthShapeTitle = game.add.text(0, 0, "YOUR MOUTH\nMOMENTS AGO", {
      font: "Arimo, sans-serif",
      fontSize: "70px",
      fontWeight: "bold",
      fill: "#ffff1a",
      backgroundColor: "#00000",
    });
    yourMouthShapeTitle.anchor.setTo(0.5, 0.5);
    yourMouthShapeTitle.x = K_PROJECT_WIDTH / 2;
    yourMouthShapeTitle.y = 130;
    yourMouthShapeTitle.visible = false;
    overlayGroup.add(yourMouthShapeTitle);

    mouthQuantificationTitle = game.add.text(
      0,
      0,
      "0.000000 neutral\n0.000000 happy\n0.000000 sad\n0.000000 angry\n0.000000 fearful\n0.000000 disgusted\n0.000000 surprised",
      {
        font: "Arimo, sans-serif",
        fontSize: "28px",
        fontWeight: "bold",
        fill: "#ffffff",
        backgroundColor: "#00000",
      }
    );
    mouthQuantificationTitle.anchor.setTo(0.5, 0.5);
    mouthQuantificationTitle.x = K_PROJECT_WIDTH / 2 + K_PROJECT_WIDTH / 4;
    mouthQuantificationTitle.y = K_PROJECT_HEIGHT / 2 + 20;
    mouthQuantificationTitle.visible = false;
    overlayGroup.add(mouthQuantificationTitle);

    mouthModel = game.add.graphics(0, 0);
    mouthModel.lineStyle(3, 0xff0000, 1);
    mouthModel.visible = false;
    overlayGroup.add(mouthModel);

    noTitle = game.add.text(0, 0, "NO!!!", {
      font: "Arimo, sans-serif",
      fontSize: "420px",
      fontWeight: "bold",
      fill: "#ff0000",
    });
    noTitle.setShadow(20, 20, "#000000");
    noTitle.anchor.setTo(0.5, 0.5);
    noTitle.x = K_PROJECT_WIDTH / 2;
    noTitle.y = K_PROJECT_HEIGHT / 2;
    noTitle.visible = false;

    // higherOrderQuantificationTitle = game.add.text(0, 0, "You will see", {font: "Arimo, sans-serif", fontSize: "72px", fontWeight: "bold", fill: "#000000", backgroundColor: "#ffff1a"});
    // higherOrderQuantificationTitle.anchor.setTo(0.5, 0.5);
    // higherOrderQuantificationTitle.visible = false;

    higherOrderQuantificationTitle = game.add.text(0, 0, "you \nwill \nsee ", {
      font: "Arimo, sans-serif",
      fontSize: "66px",
      fontWeight: "bold",
      strokeThickness: 5,
      fontStyle: "italic",
      fill: "#00ffff",
      backgroundColor: "#ff33ff",
    });
    higherOrderQuantificationTitle.setShadow(4, 4, "#000000");
    higherOrderQuantificationTitle.anchor.setTo(0.5, 0.5);
    higherOrderQuantificationTitle.visible = false;

    // higherOrderQuantificationLeftPercent = game.add.text(0, 0, "50%", {font: "Arimo, sans-serif", fontSize: "72px", fontWeight: "bold", fill: "#33cc33", backgroundColor: "#000000"});
    // higherOrderQuantificationLeftPercent.anchor.setTo(0.5, 0.5);
    // higherOrderQuantificationLeftPercent.x = K_PROJECT_WIDTH / 4;
    // higherOrderQuantificationLeftPercent.y = K_PROJECT_HEIGHT / 2;
    // higherOrderQuantificationLeftPercent.visible = false;

    // higherOrderQuantificationRightPercent = game.add.text(0, 0, "50%", {font: "Arimo, sans-serif", fontSize: "72px", fontWeight: "bold", fill: "#ff0000", backgroundColor: "#000000"});
    // higherOrderQuantificationRightPercent.anchor.setTo(0.5, 0.5);
    // higherOrderQuantificationRightPercent.x = K_PROJECT_WIDTH  * 0.75;
    // higherOrderQuantificationRightPercent.y = K_PROJECT_HEIGHT / 2;
    // higherOrderQuantificationRightPercent.visible = false;

    higherOrderQuantificationLeftPercent = game.add.text(0, 0, "50% ", {
      font: "Arimo, sans-serif",
      fontSize: "96px",
      fontWeight: "bold",
      strokeThickness: 5,
      fontStyle: "italic",
      fill: "#33cc33",
    });
    higherOrderQuantificationLeftPercent.setShadow(5, 5, "#000000");
    higherOrderQuantificationLeftPercent.anchor.setTo(0.5, 0.4);
    higherOrderQuantificationLeftPercent.x = K_PROJECT_WIDTH / 4;
    higherOrderQuantificationLeftPercent.y = K_PROJECT_HEIGHT / 2;
    higherOrderQuantificationLeftPercent.visible = false;

    higherOrderQuantificationRightPercent = game.add.text(0, 0, "50% ", {
      font: "Arimo, sans-serif",
      fontSize: "96px",
      fontWeight: "bold",
      strokeThickness: 5,
      fontStyle: "italic",
      fill: "#ff0000",
    });
    higherOrderQuantificationRightPercent.setShadow(5, 5, "#000000");
    higherOrderQuantificationRightPercent.anchor.setTo(0.5, 0.4);
    higherOrderQuantificationRightPercent.x = K_PROJECT_WIDTH * 0.75;
    higherOrderQuantificationRightPercent.y = K_PROJECT_HEIGHT / 2;
    higherOrderQuantificationRightPercent.visible = false;

    springStudiosMap = game.add.sprite(0, 0, "springStudiosMap");
    springStudiosMap.visible = false;
    mapGroup.add(springStudiosMap);

    mapGfx = game.add.graphics(-(K_PROJECT_WIDTH / 2), 0);
    mapGfx.visible = false;
    mapGroup.add(mapGfx);

    // mapUserLabel = game.add.text(0, 0, "USER", {font: "Arimo, sans-serif", fontSize: "30px", fontWeight: "bold", fill: "#ffff1a", backgroundColor: "#000000"});
    // mapUserLabel.anchor.setTo(0.5, 0.5);
    // mapUserLabel.visible = false;
    // mapGroup.add(mapUserLabel);

    mapEmotionLabel = game.add.text(0, 0, "feels happy ", {
      font: "Arimo, sans-serif",
      fontSize: "72px",
      fontWeight: "bold",
      fill: "#0099ff",
      strokeThickness: 5,
      fontStyle: "italic",
    });
    mapEmotionLabel.setShadow(4, 4, "#000000");
    mapEmotionLabel.anchor.setTo(0.5, 0.5);
    mapEmotionLabel.visible = false;
    mapGroup.add(mapEmotionLabel);

    dollarEmitter = game.add.emitter(0, 0, K_EMOJI_EXPLOSION_PARTICLES);
    dollarEmitter.makeParticles("moneyBagEmoji");
    dollarEmitter.minParticleSpeed.set(0, 300);
    dollarEmitter.maxParticleSpeed.set(0, 400);
    mapGroup.add(dollarEmitter);

    pixelatedUserFaceBMD = game.add.bitmapData(40, 40);

    pixelatedUserFaceSprite = game.add.sprite(0, 0, pixelatedUserFaceBMD);
    pixelatedUserFaceSprite.visible = false;

    userFaceRawEmotionsText = game.add.text(
      0,
      0,
      "[.000000 .000000 .000000 .000000\n.000000 .000000 .000000]",
      {
        font: "Arimo, sans-serif",
        fontSize: "18px",
        fontWeight: "bold",
        fill: "#000000",
      }
    );
    userFaceRawEmotionsText.visible = false;

    estimatedIQTitle = game.add.text(0, 0, "Your estimated IQ ", {
      font: "Arimo, sans-serif",
      fontSize: "72px",
      fontWeight: "bold",
      strokeThickness: 5,
      fontStyle: "italic",
      fill: "#00ffff",
      backgroundColor: "#ffff1a",
    });
    estimatedIQTitle.setShadow(4, 4, "#000000");
    estimatedIQTitle.anchor.setTo(0.5, 0.5);
    estimatedIQTitle.x = K_PROJECT_WIDTH / 2;
    estimatedIQTitle.y = 72;
    estimatedIQTitle.visible = false;

    iqStatTitle = game.add.text(0, 0, "100 ", {
      font: "Arimo, sans-serif",
      fontSize: "440px",
      fontWeight: "bold",
      fill: "#33cc33",
      strokeThickness: 5,
      fontStyle: "italic",
    });
    iqStatTitle.setShadow(20, 20, "#000000");
    iqStatTitle.anchor.setTo(0.5, 0.5);
    iqStatTitle.x = K_PROJECT_WIDTH / 2;
    iqStatTitle.y = K_PROJECT_HEIGHT / 2;
    iqStatTitle.visible = false;

    computerDesktop = game.add.sprite(0, 0, "computerDesktop");
    computerDesktop.visible = false;

    zuckScreenSpaceBMD = game.add.bitmapData(1920, 1080);
    zuckScreenSpaceSprite = game.add.sprite(0, 0, zuckScreenSpaceBMD);

    mouseCursor = game.add.sprite(-50, K_PROJECT_HEIGHT, "mouseCursor");
    mouseCursor.visible = false;

    disney = game.add.sprite(0, 0, "disney");
    disney.anchor.setTo(0.5, 0.5);
    disney.visible = false;

    twentiethCenturyFox = game.add.sprite(0, 0, "20thCenturyFox");
    twentiethCenturyFox.anchor.setTo(0.5, 0.5);
    twentiethCenturyFox.visible = false;

    kelloggsCornFlakes = game.add.sprite(0, 0, "kelloggsCornFlakes");
    kelloggsCornFlakes.anchor.setTo(0.5, 0.5);
    kelloggsCornFlakes.visible = false;

    yourLocalPizzeria = game.add.sprite(0, 0, "yourLocalPizzeria");
    yourLocalPizzeria.anchor.setTo(0.5, 0.5);
    yourLocalPizzeria.visible = false;

    forYourNextJob = game.add.sprite(0, 0, "forYourNextJob");
    forYourNextJob.anchor.setTo(0.5, 0.5);
    forYourNextJob.visible = false;

    poorHat = game.add.sprite(0, 0, "poorHat");
    poorHat.anchor.setTo(0.5, 1.0);
    poorHat.visible = false;

    crown = game.add.sprite(0, 0, "crown");
    crown.anchor.setTo(0.5, 1.0);
    crown.visible = false;

    leftHeart = game.add.sprite(0, 0, "heart");
    leftHeart.anchor.setTo(0.5, 0.5);
    leftHeart.visible = false;

    rightHeart = game.add.sprite(0, 0, "heart");
    rightHeart.anchor.setTo(0.5, 0.5);
    rightHeart.visible = false;

    leftProhibited = game.add.sprite(0, 0, "prohibited");
    leftProhibited.anchor.setTo(0.5, 0.5);
    leftProhibited.visible = false;

    rightProhibited = game.add.sprite(0, 0, "prohibited");
    rightProhibited.anchor.setTo(0.5, 0.5);
    rightProhibited.visible = false;

    thoughtBubbleHappy = game.add.sprite(0, 0, "thoughtBubbleHappy");
    thoughtBubbleHappy.anchor.setTo(1.0, 1.0);
    thoughtBubbleHappy.visible = false;

    thoughtBubbleSad = game.add.sprite(0, 0, "thoughtBubbleSad");
    thoughtBubbleSad.anchor.setTo(1.0, 1.0);
    thoughtBubbleSad.visible = false;

    estimatedIncomeLabel = game.add.text(
      0,
      0,
      "estimated income: $" + estimatedIncome,
      {
        font: "Arimo, sans-serif",
        fontSize: "36px",
        fontWeight: "bold",
        fill: "#000000",
        backgroundColor: "#ffff1a",
      }
    );
    estimatedIncomeLabel.anchor.setTo(1.0, 1.0);
    estimatedIncomeLabel.visible = false;

    facialAffectLabel = game.add.text(
      1000,
      1000,
      "avg facial affect: " + (isMentallyIll ? "low" : "high"),
      {
        font: "Arimo, sans-serif",
        fontSize: "36px",
        fontWeight: "bold",
        fill: "#000000",
        backgroundColor: "#ffff1a",
      }
    );
    facialAffectLabel.anchor.setTo(1.0, 1.0);
    facialAffectLabel.visible = false;

    reactionToYourselfLabel = game.add.text(
      1000,
      1000,
      "reaction to yourself: " + (isSelfLoathing ? "bad" : "good"),
      {
        font: "Arimo, sans-serif",
        fontSize: "36px",
        fontWeight: "bold",
        fill: "#000000",
        backgroundColor: "#ffff1a",
      }
    );
    reactionToYourselfLabel.anchor.setTo(1.0, 1.0);
    reactionToYourselfLabel.visible = false;

    creditTitle = game.add.text(
      0,
      0,
      "written, directed and programmed by\nNOAH LEVENSON",
      {
        font: "Arimo, sans-serif",
        fontSize: "42px",
        fontWeight: "bold",
        fill: "#FFFFFF",
      }
    );
    creditTitle.anchor.setTo(0.5, 0.5);
    creditTitle.visible = false;

    mozillaLogoWhite = game.add.sprite(0, 0, "mozillaLogoWhite");
    mozillaLogoWhite.anchor.setTo(0.5, 0.5);
    mozillaLogoWhite.visible = false;

    if (K_SHOW_BASEBALL_CARD) {
      const userVideoScale = K_PROJECT_HEIGHT / userVideo.height;
      baseballCard = game.add.bitmapData(
        Math.round(userVideo.width * userVideoScale),
        Math.round(userVideo.height * userVideoScale) +
          K_BASEBALL_CARD_TEXT_FIELD_HEIGHT
      );
    }

    youLikeDogsSFX = game.add.audio("youLikeDogs");
    youLikeDogsSFX.volume = 0.7;

    youDontLikeDogsSFX = game.add.audio("youDontLikeDogs");
    youDontLikeDogsSFX.volume = 0.7;

    youPreferMenSFX = game.add.audio("youPreferMen");
    youPreferMenSFX.volume = 0.7;

    youPreferWomenSFX = game.add.audio("youPreferWomen");
    youPreferWomenSFX.volume = 0.7;

    youPreferWhitePeopleSFX = game.add.audio("youPreferWhitePeople");
    youPreferWhitePeopleSFX.volume = 0.7;

    youPreferBlackPeopleSFX = game.add.audio("youPreferBlackPeople");
    youPreferBlackPeopleSFX.volume = 0.7;

    thatPartBitSFX = game.add.audio("thatPartBit");
    thatPartBitSFX.volume = 0.8;

    thatPartWaySFX = game.add.audio("thatPartWay");
    thatPartWaySFX.volume = 0.8;

    isPoorSFX = game.add.audio("isPoor");
    isPoorSFX.volume = 0.7;

    isNotPoorSFX = game.add.audio("isNotPoor");
    isNotPoorSFX.volume = 0.7;

    isMentallyIllSFX = game.add.audio("isMentallyIll");
    isMentallyIllSFX.volume = 0.7;

    isNotMentallyIllSFX = game.add.audio("isNotMentallyIll");
    isNotMentallyIllSFX.volume = 0.7;

    isSelfLoathingSFX = game.add.audio("isSelfLoathing");
    isSelfLoathingSFX.volume = 0.7;

    isNotSelfLoathingSFX = game.add.audio("isNotSelfLoathing");
    isNotSelfLoathingSFX.volume = 0.7;

    kachingSFX = game.add.audio("kaching");
    kachingSFX.volume = 0.3;

    doubleClickSFX = game.add.audio("doubleclick");
    doubleClickSFX.volume = 0.6;

    finalPopSFX = game.add.audio("finalPop");
    finalPopSFX.volume = 0.8;

    dogEmojiEmitter = game.add.emitter(game, 0, 0, K_EMOJI_EXPLOSION_PARTICLES);

    dogEmojiEmitter.x = 0;
    dogEmojiEmitter.y = -200;
    dogEmojiEmitter.bounce.setTo(0.5, 0.5);

    snapchatEmojiEmitter = game.add.emitter(
      game,
      0,
      0,
      K_EMOJI_EXPLOSION_PARTICLES
    );
    snapchatEmojiEmitter.x = 0;
    snapchatEmojiEmitter.y = -200;
    snapchatEmojiEmitter.bounce.setTo(0.5, 0.5);

    snapchatEmojiEmitter.makeParticles(
      "secretEmoji",
      0,
      K_EMOJI_EXPLOSION_PARTICLES,
      true,
      true
    );

    applauseEmojiEmitter = game.add.emitter(
      game,
      0,
      0,
      K_EMOJI_EXPLOSION_PARTICLES
    );
    applauseEmojiEmitter.x = 0;
    applauseEmojiEmitter.y = -200;
    applauseEmojiEmitter.bounce.setTo(0.5, 0.5);

    applauseEmojiEmitter.makeParticles(
      "moneyFaceEmoji",
      0,
      K_EMOJI_EXPLOSION_PARTICLES,
      true,
      true
    );

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

    if (K_DEBUG) {
      if (K_DEBUG_SHOW_FRAMECODE) {
        framecodeSprite = game.add.sprite(0, 0, frameCanvas);
        framecodeSprite.scale.setTo(
          K_DEBUG_FRAMECODE_SCALE,
          K_DEBUG_FRAMECODE_SCALE
        );
      }

      pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
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
        filmVideo.video.currentTime = K_DEBUG_SEEK_TIME;

        for (let i = 0; i < filmEventList.length; i += 1) {
          if (filmEventList[i]) {
            filmEventList[i].activated = false;
          }
        }
      });
    }

    // Here's where we start the show
    if (!K_USER_MUST_INITIATE_VIDEO) {
      filmVideo.currentTime = 0;
      filmSprite.visible = true;
      startTime = game.time.now;

      if (K_MULTITHREADING) {
        createImageBitmap(userVideo.video).then((img) => {
          cvWorker.postMessage(
            {
              fakeWindow: fakeWindow,
              fakeDocument: fakeDocument,
              img: img,
              opcode: 1,
              frame: frame,
              getEmotions: getEmotions,
            },
            [img]
          );
          filmVideo.play();
          activated = true;
        });
      } else {
        updateCLM(clmCanvas);
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
          scoreThreshold: 0.5,
        });
        const detections = faceapi
          .detectSingleFace(clmCanvas.canvas, options)
          .withFaceLandmarks(true)
          .withFaceExpressions();
        detections.then(() => {
          filmVideo.play();
          activated = true;
        });
      }
    }
  },

  update: async function () {
    if (activated) {
      if (gameframe % K_GET_OPTICAL_SYNC_INTERVAL === 0) {
        frame = getFrame(filmSprite, frameCanvas);
      } else {
        frame = lastFrame;
      }

      const frameDelta = frame - lastFrame;

      if (frameDelta > 1) {
        for (let i = 0; i < frameDelta; i += 1) {
          doEvent(filmEventList, lastFrame + i);
        }
      }

      if (frame % K_CV_REFRESH_INTERVAL === 0) {
        if (K_MULTITHREADING) {
          createImageBitmap(userVideo.video).then((img) => {
            cvWorker.postMessage(
              {
                fakeWindow: fakeWindow,
                fakeDocument: fakeDocument,
                img: img,
                opcode: 1,
                frame: frame,
                getEmotions: getEmotions,
              },
              [img]
            );
          });
        } else {
          updateCLM(clmCanvas);

          const cachedFrame = frame;

          const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: 0.5,
          });
          let detections;

          if (!getEmotions) {
            if (K_RUN_CV_ASYNC) {
              detections = faceapi
                .detectSingleFace(clmCanvas.canvas, options)
                .withFaceLandmarks(true);
            } else {
              detections = await faceapi
                .detectSingleFace(clmCanvas.canvas, options)
                .withFaceLandmarks(true);
            }

            emotions = false;
          } else {
            if (K_RUN_CV_ASYNC) {
              detections = faceapi
                .detectSingleFace(clmCanvas.canvas, options)
                .withFaceLandmarks(true)
                .withFaceExpressions();
            } else {
              detections = await faceapi
                .detectSingleFace(clmCanvas.canvas, options)
                .withFaceLandmarks(true)
                .withFaceExpressions();
            }
          }

          if (K_RUN_CV_ASYNC) {
            detections.then((dets) => {
              handlePlayDetections(dets, cachedFrame);
            });
          } else {
            handlePlayDetections(detections, cachedFrame);
          }
        }
      }

      doEvent(filmEventList, frame);
      lastFrame = frame;

      gameframe += 1;

      if (!K_MOBILE) {
        if (!game.scale.isFullScreen) {
          fullScreenButton.visible = true;
        } else {
          fullScreenButton.visible = false;
        }
      }

      if (K_DEBUG && K_DEBUG_LOG_ALL_FRAMES) {
        console.log(frame);
      }

      if (K_BETA) {
        fpsSamples.push(game.time.fps);
      }
    }
  },

  // We can get rid of this for production
  // render: function() {
  // 	game.debug.text(game.time.fps, 20, 20, "#00ff00");

  // }
};
