function drawFaceModel(landmarks) {
  function draw(points) {
    faceModel.moveTo(
      Math.round(landmarks[points[0]][0] * 1.5),
      Math.round(landmarks[points[0]][1] * 1.5)
    );

    for (let i = 1; i < points.length; i += 1) {
      faceModel.lineTo(
        Math.round(landmarks[points[i]][0] * 1.5),
        Math.round(landmarks[points[i]][1] * 1.5)
      );
    }
  }

  if (landmarks) {
    faceModel.visible = true;
    faceModel.clear();
    faceModel.lineStyle(3, 0x80ff00, 1);
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

function drawBackground(c1, c2, steps) {
  let y = 0;
  let yStep = Math.floor(K_PROJECT_HEIGHT / steps);

  for (let i = 0; i < steps; i += 1) {
    const c = Phaser.Color.interpolateColor(c1, c2, steps, i);

    backgroundBMD.rect(
      0,
      y,
      K_PROJECT_WIDTH,
      y + yStep,
      Phaser.Color.getWebRGB(c)
    );

    y += yStep;
  }
}

function getMaxOverDimensions(data) {
  let dimension;
  let probability = 0;

  if (data.angry > probability) {
    probability = data.angry;
    dimension = "angry";
  }

  if (data.disgusted > probability) {
    proability = data.disgusted;
    dimension = "disgusted";
  }

  if (data.fearful > probability) {
    probability = data.fearful;
    dimension = "fearful";
  }

  if (data.happy > probability) {
    probability = data.happy;
    dimension = "happy";
  }

  if (data.neutral > probability) {
    probability = data.neutral;
    dimension = "neutral";
  }

  if (data.sad > probability) {
    probability = data.sad;
    dimension = "sad";
  }

  if (data.surprised > probability) {
    probability = data.surprised;
    dimension = "surprised";
  }

  return { probability: probability, dimension: dimension };
}

const playState = {
  create: function () {
    game.world.setBounds(
      -1000,
      -1000,
      K_PROJECT_WIDTH + 1000,
      K_PROJECT_HEIGHT + 1000
    );

    backgroundBMD = game.add.bitmapData(K_PROJECT_WIDTH, K_PROJECT_HEIGHT);
    backgroundBMD.addToWorld();

    drawBackground(0x3333ff, 0xa6a6a6, 30);

    mozillaLogo = game.add.sprite(0, 0, "mozillaLogo");
    mozillaLogo.scale.setTo(0.6, 0.6);
    mozillaLogo.position = { x: 50, y: 50 };

    faceModelGroup = game.add.group();

    faceModel = game.add.graphics(0, 0);
    faceModel.scale.setTo(2.0, 2.0);

    faceModelGroup.add(faceModel);
    // NOTE: We divide K_PROJECT_WIDTH by 4 to compensate for a localspace offset
    // that we inherit from the raw data coming in...
    // Using a webcam other than the one we used in development may result in bad things
    faceModel.position = {
      x: -(K_PROJECT_WIDTH / 4),
      y: -(K_PROJECT_HEIGHT / 2),
    };
    faceModel.visible = true;

    fullScreenButton = game.add.sprite(1820, 980, "fullscreenButton");
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
    });

    fullScreenButton.visible = false;
    fullScreenButton.inputEnabled = true;
    fullScreenButton.useHandCursor = true;

    finalQuantTimer = game.time.create(false);

    userEmotionalStateText = game.add.text(0, 0, "neutral", {
      fontSize: "80px",
      fill: "#80ff00",
    });
    userEmotionalStateText.anchor.setTo(0.5, 0.5);

    faceModelGroup.add(userEmotionalStateText);

    faceModelGroup.alpha = 0.0;

    attractText = game.add.text(
      0,
      0,
      "meet the new AI that knows you\nbetter than you know yourself",
      { fontSize: "80px", fill: "#80ff00" }
    );
    attractText.anchor.setTo(0.5, 0.5);
    attractText.position = { x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2 };
    attractText.visible = false;

    eventText = game.add.text(0, 0, "                     ", {
      font: "Arial, Helvetica, sans-serif",
      fontSize: "120px",
      fontWeight: "bold",
      fill: "#000000",
      backgroundColor: "#ffff1a",
    });
    eventText.anchor.setTo(0.5, 0.5);
    eventText.visible = false;

    eventScoreText = game.add.text(0, 0, "                    ", {
      font: "Arial, Helvetica, sans-serif",
      fontSize: "90px",
      fontWeight: "bold",
      fill: "#33cc33",
      backgroundColor: "#000000",
    });
    eventScoreText.anchor.setTo(0.5, 0.5);
    eventScoreText.visible = false;

    positivePercentText = game.add.text(0, 0, "                    ", {
      font: "Arial, Helvetica, sans-serif",
      fontSize: "90px",
      fontWeight: "bold",
      fill: "#33cc33",
      backgroundColor: "#000000",
    });
    positivePercentText.anchor.setTo(0.5, 0.5);
    positivePercentText.visible = false;

    negativePercentText = game.add.text(0, 0, "                    ", {
      font: "Arial, Helvetica, sans-serif",
      fontSize: "90px",
      fontWeight: "bold",
      fill: "#ff0000",
      backgroundColor: "#000000",
    });
    negativePercentText.anchor.setTo(0.5, 0.5);
    negativePercentText.visible = false;

    estimatedIncomeText = game.add.text(0, 0, "                      ", {
      font: "Arial, Helvetica, sans-serif",
      fontSize: "100px",
      fontWeight: "bold",
      fill: "#000000",
      backgroundColor: "#ffff1a",
    });
    estimatedIncomeText.anchor.setTo(0.5, 0.5);
    estimatedIncomeText.visible = false;

    mentalHealthText = game.add.text(0, 0, "                      ", {
      font: "Arial, Helvetica, sans-serif",
      fontSize: "100px",
      fontWeight: "bold",
      fill: "#000000",
      backgroundColor: "#ffff1a",
    });
    mentalHealthText.anchor.setTo(0.5, 0.5);
    mentalHealthText.visible = false;

    selfImageText = game.add.text(0, 0, "                      ", {
      font: "Arial, Helvetica, sans-serif",
      fontSize: "100px",
      fontWeight: "bold",
      fill: "#000000",
      backgroundColor: "#ffff1a",
    });
    selfImageText.anchor.setTo(0.5, 0.5);
    selfImageText.visible = false;

    iqText = game.add.text(0, 0, "     ", {
      font: "Arial, Helvetica, sans-serif",
      fontSize: "300px",
      fontWeight: "bold",
      fill: "#ffff1a",
      backgroundColor: "#000000",
    });
    iqText.anchor.setTo(0.5, 0.5);
    iqText.visible = false;

    socket.on("data", (data) => {
      dataBuffer = data;
    });

    socket.on("dogs", (data) => {
      dogsEvent = data;
    });

    socket.on("gender", (data) => {
      genderEvent = data;
    });

    socket.on("kanyeStart", (data) => {
      kanyeStartEvent = data;
    });

    socket.on("kanye", (data) => {
      kanyeEvent = data;
    });

    socket.on("kanyeEnd", (data) => {
      kanyeEndEvent = data;
    });

    socket.on("pizzaStart", (data) => {
      pizzaStartEvent = data;
    });

    socket.on("pizza", (data) => {
      pizzaEvent = data;
    });

    socket.on("pizzaEnd", (data) => {
      pizzaEndEvent = data;
    });

    socket.on("race", (data) => {
      raceEvent = data;
    });

    socket.on("datingPreference", (data) => {
      datingPreferenceEvent = data;
    });

    socket.on("socialNews", (data) => {
      socialNewsEvent = data;
    });

    socket.on("politicalOrientation", (data) => {
      politicalOrientationEvent = data;
    });

    socket.on("iq", (data) => {
      iqEvent = data;
    });

    socket.on("estimatedIncome", (data) => {
      estimatedIncomeEvent = data;
    });

    socket.on("mentalHealth", (data) => {
      mentalHealthEvent = data;
    });

    socket.on("selfImage", (data) => {
      selfImageEvent = data;
    });
  },

  update: function () {
    const data = dataBuffer;

    // if (data && data.neutral) {
    // 	// const probabilityOfNonNeutrality = 1.0 - data.neutral;
    // 	// const max = getMaxOverDimensions(data);
    // 	// const step = Math.floor(K_BACKGROUND_ANIMATION_STEPS * probabilityOfNonNeutrality);

    // 	// const c2 = Phaser.Color.interpolateColor(K_BACKGROUND_ANIMATION_NON_NEUTRAL_C1[max.dimension], K_BACKGROUND_ANIMATION_NON_NEUTRAL_C2[max.dimension], K_BACKGROUND_ANIMATION_STEPS, step);
    // 	// drawBackground(0x3333ff, c2, 30);

    // 	// New idea -- each emotion's probability determines the weight in a linear equation where we find the average of a bunch of colors

    // 	const happyCol = Phaser.Color.getRGB(0xffff00);
    // 	const sadCol = Phaser.Color.getRGB(0x3366ff);
    // 	const angryCol = Phaser.Color.getRGB(0xff3300);
    // 	const disgustedCol = Phaser.Color.getRGB(0x33cc33);
    // 	const surprisedCol = Phaser.Color.getRGB(0xff00ff);
    // 	const fearfulCol = Phaser.Color.getRGB(0xff6600);
    // 	const neutralCol = Phaser.Color.getRGB(0xa6a6a6);

    // 	// sum the squares of the components
    // 	// then get the mean of the sum of squares and get its square root

    // 	// red channel
    // 	const r = Math.sqrt((Math.pow(5 * data.happy * happyCol.r, 2) + Math.pow(5 * data.sad * sadCol.r, 2) + Math.pow(data.angry * angryCol.r, 2) + Math.pow(5 * data.disgusted * disgustedCol.r, 2) +
    // 		Math.pow(5 * data.surprised * surprisedCol.r, 2) + Math.pow(5 * data.fearful * fearfulCol.r, 2) + Math.pow(5 * data.neutral * neutralCol.r, 2)) / 7);

    // 	// green channel
    // 	const g = Math.sqrt((Math.pow(5 * data.happy * happyCol.g, 2) + Math.pow(5 * data.sad * sadCol.g, 2) + Math.pow(5 * data.angry * angryCol.g, 2) + Math.pow(5 * data.disgusted * disgustedCol.g, 2) +
    // 		Math.pow(5 * data.surprised * surprisedCol.g, 2) + Math.pow(5 * data.fearful * fearfulCol.g, 2) + Math.pow(5 * data.neutral * neutralCol.g, 2)) / 7);

    // 	// blue channel
    // 	const b = Math.sqrt((Math.pow(5 * data.happy * happyCol.b, 2) + Math.pow(5 * data.sad * sadCol.b, 2) + Math.pow(5 * data.angry * angryCol.b, 2) + Math.pow(5 * data.disgusted * disgustedCol.b, 2) +
    // 		Math.pow(5 * data.surprised * surprisedCol.b, 2) + Math.pow(5 * data.fearful * fearfulCol.b, 2) + Math.pow(5 * data.neutral * neutralCol.b, 2)) / 7);

    // 	const weightedAvg = Phaser.Color.toRGBA(r, g, b, 255);

    // 	console.log(weightedAvg);

    // 	drawBackground(0x3333ff, weightedAvg, 30);
    // }

    if (data) {
      if (attractTween) {
        attractTween.stop(true);
      }

      attractText.visible = false;
      faceModelGroup.alpha = 1.0;
      clearTimeout(faceModelFadeDebounceHandle);
      faceModelFadeDebounceHandle = null;
      drawFaceModel(data.landmarks);

      if (data.sad) {
        userEmotionalStateText.text = getMaxOverDimensions(data).dimension;
      }

      userEmotionalStateText.position = {
        x: data.landmarks[14][0] * 1.5 * 2 - 200,
        y: data.landmarks[14][1] * 1.5 * 2 - 600,
      };
    } else {
      if (faceModelFadeDebounceHandle === null) {
        faceModelFadeDebounceHandle = setTimeout(() => {
          const data = dataBuffer;

          if (!data) {
            const fadeModel = game.add
              .tween(faceModelGroup)
              .to(
                { alpha: 0.0 },
                500,
                Phaser.Easing.Linear.None,
                true,
                0,
                0,
                false
              );

            fadeModel.onComplete.addOnce(() => {
              attractText.alpha = 0.0;
              attractText.visible = true;

              attractTween = game.add
                .tween(attractText)
                .to(
                  { alpha: 1.0 },
                  1000,
                  Phaser.Easing.Linear.None,
                  true,
                  0,
                  -1,
                  true
                );
              attractTween.yoyoDelay(700);
            });
          }
        }, 1000);
      }
    }

    if (dogsEvent) {
      const data = dogsEvent;
      dogsEvent = null;

      eventText.text = `User ${data[0] ? "likes" : "does not like"} dogs`;
      eventText.position.x = K_PROJECT_WIDTH + eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      eventScoreText.text = `${data[1]} ${
        data[0] ? "positive" : "negative"
      } emotion`;
      eventScoreText.fill = data[0] ? "#33cc33" : "#ff0000";
      eventScoreText.position.x = -eventScoreText.width;
      eventScoreText.position.y = K_PROJECT_HEIGHT - 200;
      eventScoreText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const eventScoreTextTween = game.add
        .tween(eventScoreText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      eventTextTween.onComplete.addOnce(() => {
        const eventTextTween = game.add
          .tween(eventText.position)
          .to(
            { x: -eventText.width },
            300,
            Phaser.Easing.Linear.None,
            true,
            4000,
            0,
            false
          );
        const eventScoreTextTween = game.add
          .tween(eventScoreText.position)
          .to(
            { x: K_PROJECT_WIDTH + eventScoreText.width },
            300,
            Phaser.Easing.Linear.None,
            true,
            4000,
            0,
            false
          );
      });
    }

    if (genderEvent) {
      const data = genderEvent;
      genderEvent = null;

      eventText.text = `User prefers ${data[0] ? "men" : "women"} vs. ${
        data[0] ? "women" : "men"
      }`;
      eventText.position.x = -eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      eventScoreText.text = `+${data[1]} ${data[0] ? "male" : "female"} bias`;
      eventScoreText.fill = "#33cc33";
      eventScoreText.position.x = K_PROJECT_WIDTH + eventScoreText.width;
      eventScoreText.position.y = K_PROJECT_HEIGHT - 200;
      eventScoreText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const eventScoreTextTween = game.add
        .tween(eventScoreText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      eventTextTween.onComplete.addOnce(() => {
        const eventTextTween = game.add
          .tween(eventText.position)
          .to(
            { x: K_PROJECT_WIDTH + eventText.width },
            300,
            Phaser.Easing.Linear.None,
            true,
            4000,
            0,
            false
          );
        const eventScoreTextTween = game.add
          .tween(eventScoreText.position)
          .to(
            { x: -eventScoreText.width },
            300,
            Phaser.Easing.Linear.None,
            true,
            4000,
            0,
            false
          );
      });
    }

    if (kanyeStartEvent) {
      kanyeStartEvent = null;

      eventText.text = `User reaction to Kanye West`;
      eventText.position.x = K_PROJECT_WIDTH + eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      eventScoreText.text = `1.00000 positive`;
      eventScoreText.fill = "#33cc33";
      eventScoreText.position.x = -eventScoreText.width;
      eventScoreText.position.y = K_PROJECT_HEIGHT - 200;
      eventScoreText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const eventScoreTextTween = game.add
        .tween(eventScoreText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
    }

    if (kanyeEvent) {
      const data = kanyeEvent;
      kanyeEvent = null;

      eventScoreText.text = `${data[1]} ${data[0] ? "positive" : "negative"}`;
      eventScoreText.fill = data[0] ? "#33cc33" : "#ff0000";
    }

    if (kanyeEndEvent) {
      kanyeEndEvent = null;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: -eventText.width },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const eventScoreTextTween = game.add
        .tween(eventScoreText.position)
        .to(
          { x: K_PROJECT_WIDTH + eventScoreText.width },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
    }

    if (pizzaStartEvent) {
      pizzaStartEvent = null;

      eventText.text = `User reaction to pizza`;
      eventText.position.x = -eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      eventScoreText.text = `1.00000 positive`;
      eventScoreText.fill = "#33cc33";
      eventScoreText.position.x = K_PROJECT_WIDTH + eventScoreText.width;
      eventScoreText.position.y = K_PROJECT_HEIGHT - 200;
      eventScoreText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const eventScoreTextTween = game.add
        .tween(eventScoreText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
    }

    if (pizzaEvent) {
      const data = pizzaEvent;
      pizzaEvent = null;

      eventScoreText.text = `${data[1]} ${data[0] ? "positive" : "negative"}`;
      eventScoreText.fill = data[0] ? "#33cc33" : "#ff0000";
    }

    if (pizzaEndEvent) {
      pizzaEndEvent = null;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH + eventText.width },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const eventScoreTextTween = game.add
        .tween(eventScoreText.position)
        .to(
          { x: -eventScoreText.width },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
    }

    if (raceEvent) {
      const data = raceEvent;
      raceEvent = null;

      eventText.text = `Racial preference detected`;
      eventText.position.x = K_PROJECT_WIDTH + eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      eventScoreText.text = `+${data[1]} ${data[0] ? "white" : "Black"} bias`;
      eventScoreText.fill = "#33cc33";
      eventScoreText.position.x = -eventScoreText.width;
      eventScoreText.position.y = K_PROJECT_HEIGHT - 200;
      eventScoreText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const eventScoreTextTween = game.add
        .tween(eventScoreText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      eventTextTween.onComplete.addOnce(() => {
        const eventTextTween = game.add
          .tween(eventText.position)
          .to(
            { x: -eventText.width },
            300,
            Phaser.Easing.Linear.None,
            true,
            4000,
            0,
            false
          );
        const eventScoreTextTween = game.add
          .tween(eventScoreText.position)
          .to(
            { x: K_PROJECT_WIDTH + eventScoreText.width },
            300,
            Phaser.Easing.Linear.None,
            true,
            4000,
            0,
            false
          );
      });
    }

    if (datingPreferenceEvent) {
      const data = datingPreferenceEvent;
      datingPreferenceEvent = null;

      eventText.text = `Dating app bias`;
      eventText.position.x = -eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      if (parseFloat(data[0]) > parseFloat(data[1])) {
        positivePercentText.text = `${data[0]}%\nwhite profiles`;
        negativePercentText.text = `${data[1]}%\nnon-white profiles`;
      } else {
        positivePercentText.text = `${data[1]}%\nnon-white profiles`;
        negativePercentText.text = `${data[0]}%\nwhite profiles`;
      }

      positivePercentText.position.x = -positivePercentText.width;
      positivePercentText.position.y = K_PROJECT_HEIGHT - 300;
      positivePercentText.visible = true;

      negativePercentText.position.x =
        K_PROJECT_WIDTH + negativePercentText.width;
      negativePercentText.position.y = K_PROJECT_HEIGHT - 300;
      negativePercentText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      const positiveTextTween = game.add
        .tween(positivePercentText.position)
        .to(
          { x: K_PROJECT_WIDTH / 4 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const negativeTextTween = game.add
        .tween(negativePercentText.position)
        .to(
          { x: K_PROJECT_WIDTH * 0.75 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      eventTextTween.onComplete.addOnce(() => {
        const eventTextTween = game.add
          .tween(eventText.position)
          .to(
            { x: K_PROJECT_WIDTH + eventText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
        const positiveTextTween = game.add
          .tween(positivePercentText.position)
          .to(
            { x: -positivePercentText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
        const negativeTextTween = game.add
          .tween(negativePercentText.position)
          .to(
            { x: K_PROJECT_WIDTH + negativePercentText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
      });
    }

    if (socialNewsEvent) {
      const data = socialNewsEvent;
      socialNewsEvent = null;

      eventText.text = `News preference`;
      eventText.position.x = K_PROJECT_WIDTH + eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      if (parseFloat(data[0]) > parseFloat(data[1])) {
        positivePercentText.text = `${data[0]}%\npolitical\nanalysis`;
        negativePercentText.text = `${data[1]}%\ncelebrity\ngossip`;
      } else {
        positivePercentText.text = `${data[1]}%\ncelebrity\ngossip`;
        negativePercentText.text = `${data[0]}%\npolitical\nanalysis`;
      }

      positivePercentText.position.x = -positivePercentText.width;
      positivePercentText.position.y = K_PROJECT_HEIGHT - 300;
      positivePercentText.visible = true;

      negativePercentText.position.x =
        K_PROJECT_WIDTH + negativePercentText.width;
      negativePercentText.position.y = K_PROJECT_HEIGHT - 300;
      negativePercentText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      const positiveTextTween = game.add
        .tween(positivePercentText.position)
        .to(
          { x: K_PROJECT_WIDTH / 4 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const negativeTextTween = game.add
        .tween(negativePercentText.position)
        .to(
          { x: K_PROJECT_WIDTH * 0.75 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      eventTextTween.onComplete.addOnce(() => {
        const eventTextTween = game.add
          .tween(eventText.position)
          .to(
            { x: -eventText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
        const positiveTextTween = game.add
          .tween(positivePercentText.position)
          .to(
            { x: -positivePercentText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
        const negativeTextTween = game.add
          .tween(negativePercentText.position)
          .to(
            { x: K_PROJECT_WIDTH + negativePercentText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
      });
    }

    if (politicalOrientationEvent) {
      const data = politicalOrientationEvent;
      politicalOrientationEvent = null;

      eventText.text = `Political bias`;
      eventText.position.x = -eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      if (parseFloat(data[0]) > parseFloat(data[1])) {
        positivePercentText.text = `${data[0]}%\ndemocrat`;
        negativePercentText.text = `${data[1]}%\nrepublican`;
      } else {
        positivePercentText.text = `${data[1]}%\nrepublican`;
        negativePercentText.text = `${data[0]}%\ndemocrat`;
      }

      positivePercentText.position.x = -positivePercentText.width;
      positivePercentText.position.y = K_PROJECT_HEIGHT - 300;
      positivePercentText.visible = true;

      negativePercentText.position.x =
        K_PROJECT_WIDTH + negativePercentText.width;
      negativePercentText.position.y = K_PROJECT_HEIGHT - 300;
      negativePercentText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      const positiveTextTween = game.add
        .tween(positivePercentText.position)
        .to(
          { x: K_PROJECT_WIDTH / 4 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const negativeTextTween = game.add
        .tween(negativePercentText.position)
        .to(
          { x: K_PROJECT_WIDTH * 0.75 },
          200,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      eventTextTween.onComplete.addOnce(() => {
        const eventTextTween = game.add
          .tween(eventText.position)
          .to(
            { x: K_PROJECT_WIDTH + eventText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
        const positiveTextTween = game.add
          .tween(positivePercentText.position)
          .to(
            { x: -positivePercentText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
        const negativeTextTween = game.add
          .tween(negativePercentText.position)
          .to(
            { x: K_PROJECT_WIDTH + negativePercentText.width },
            200,
            Phaser.Easing.Linear.None,
            true,
            3000,
            0,
            false
          );
      });
    }

    if (iqEvent) {
      const data = iqEvent;
      iqEvent = null;

      eventText.text = `User estimated IQ`;
      eventText.position.x = K_PROJECT_WIDTH + eventText.width;
      eventText.position.y = 200;
      eventText.visible = true;

      iqText.text = `${data[0]}`;
      iqText.fill = parseFloat(data[0]) < 100 ? "#ff0000" : "#33cc33";
      iqText.position.x = -eventScoreText.width;
      iqText.position.y = K_PROJECT_HEIGHT - 400;
      iqText.visible = true;

      const eventTextTween = game.add
        .tween(eventText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );
      const iqTextTween = game.add
        .tween(iqText.position)
        .to(
          { x: K_PROJECT_WIDTH / 2 },
          300,
          Phaser.Easing.Linear.None,
          true,
          0,
          0,
          false
        );

      eventTextTween.onComplete.addOnce(() => {
        const eventTextTween = game.add
          .tween(eventText.position)
          .to(
            { x: -eventText.width },
            300,
            Phaser.Easing.Linear.None,
            true,
            4000,
            0,
            false
          );
        const iqTextTween = game.add
          .tween(iqText.position)
          .to(
            { x: K_PROJECT_WIDTH + iqText.width },
            300,
            Phaser.Easing.Linear.None,
            true,
            4000,
            0,
            false
          );
      });
    }

    if (estimatedIncomeEvent) {
      const data = estimatedIncomeEvent;
      estimatedIncomeEvent = null;

      estimatedIncomeText.text = `user estimated income: $${data}`;
      estimatedIncomeText.position.x = K_PROJECT_WIDTH / 2;
      estimatedIncomeText.position.y = 300;

      estimatedIncomeText.visible = true;

      finalQuantTimer.add(
        9000,
        () => {
          estimatedIncomeText.visible = false;
          mentalHealthText.visible = false;
          selfImageText.visible = false;
        },
        this
      );

      finalQuantTimer.start();
    }

    if (mentalHealthEvent) {
      const data = mentalHealthEvent;
      mentalHealthEvent = null;

      mentalHealthText.text = `possible mental illness: ${
        data[0] ? "yes" : "no"
      }`;
      mentalHealthText.position.x = K_PROJECT_WIDTH / 2;
      mentalHealthText.position.y = 500;

      mentalHealthText.visible = true;

      if (finalQuantTimer.length === 0) {
        finalQuantTimer.add(
          9000,
          () => {
            estimatedIncomeText.visible = false;
            mentalHealthText.visible = false;
            selfImageText.visible = false;
          },
          this
        );

        finalQuantTimer.start();
      }
    }

    if (selfImageEvent) {
      const data = selfImageEvent;
      selfImageEvent = null;

      selfImageText.text = `self-image: ${data[0] ? "negative" : "positive"}`;
      selfImageText.position.x = K_PROJECT_WIDTH / 2;
      selfImageText.position.y = 700;

      selfImageText.visible = true;

      if (finalQuantTimer.length === 0) {
        finalQuantTimer.add(
          9000,
          () => {
            estimatedIncomeText.visible = false;
            mentalHealthText.visible = false;
            selfImageText.visible = false;
          },
          this
        );

        finalQuantTimer.start();
      }
    }

    if (!game.scale.isFullScreen) {
      fullScreenButton.visible = true;
    } else {
      fullScreenButton.visible = false;
    }
  },
};
