function EventStruct(f) {
  this.run = f;
  this.activated = false;
}

function doEvent(eventList, frame) {
  if (eventList[frame] && !eventList[frame].activated) {
    eventList[frame].activated = true;
    eventList[frame].run();
  }
}

function makeMultiFrameEvent(inFrame, outFrame, f) {
  for (let i = inFrame; i < outFrame; i += 1) {
    const e = new EventStruct(f);
    filmEventList[i] = e;
  }
}

// This needs to be updated to match length of the newest video asset!
const filmEventList = new Array(12405);

function makeAd(x, y, headline, url, body) {
  const adGroup = game.add.group();

  adGfx.lineStyle(0.75, 0xa6a6a6, 1.0);
  adGfx.beginFill(0xffffff, 1);
  adGfx.drawRoundedRect(x, y, 465, 165, 9);

  const headlineText = game.add.text(x + 7, y + 7, headline, {
    font: "Arimo, sans-serif",
    fontSize: "30px",
    fontWeight: "normal",
    fill: "#2200CC",
  });
  headlineText.wordWrap = true;
  headlineText.wordWrapWidth = 450;
  adGroup.add(headlineText);

  const linkText = game.add.text(
    x + 7,
    headlineText.y + headlineText.height,
    url,
    {
      font: "Arimo, sans-serif",
      fontSize: "19px",
      fontWeight: "normal",
      fill: "#0F9D58",
    }
  );
  linkText.wordWrap = true;
  linkText.wordWrapWidth = 450;
  adGroup.add(linkText);

  const bodyText = game.add.text(x + 7, linkText.y + linkText.height, body, {
    font: "Arimo, sans-serif",
    fontSize: "19px",
    fontWeight: "normal",
    fill: "#000000",
  });
  bodyText.wordWrap = true;
  bodyText.wordWrapWidth = 450;
  adGroup.add(bodyText);

  return adGroup;
}

function makeTextBox(x, y, copy, invert = false) {
  const textBoxGroup = game.add.group();

  allTextBoxesGroup.add(textBoxGroup);

  const gfx = game.add.graphics(0, 0);
  textBoxGroup.add(gfx);

  const bgcolor = invert ? 0x000000 : 0xffff00;
  const linecolor = invert ? 0xffff00 : 0x000000;

  gfx.lineStyle(4, linecolor, 1.0);
  gfx.beginFill(bgcolor, 1);
  gfx.drawRect(x, y, K_TEXT_BOX_SIZE, K_TEXT_BOX_SIZE);

  const textcolor = invert ? "#ffff00" : "#000000";

  textBoxGroup.copyText = game.add.text(x + 12, y + 12, copy, {
    font: "Arimo, sans-serif",
    fontSize: "45px",
    fontWeight: "bold",
    fill: textcolor,
  });
  textBoxGroup.copyText.wordWrap = true;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.copyText.wordWrapWidth = K_TEXT_BOX_SIZE - 12;
  textBoxGroup.add(textBoxGroup.copyText);

  return textBoxGroup;
}

function drawDogFilter(landmarks) {
  if (landmarks) {
    if (frame % K_AR_FRAME_INTERVAL === 0) {
      const cline = new Phaser.Line(
        landmarks[0][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[0][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
        landmarks[16][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[16][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y
      );
      const cd = cline.length;
      const noseScale = cd / 1050;
      dogNose.scale.setTo(noseScale, noseScale);
      dogNose.position.x =
        landmarks[30][0] +
        userVideoGroup.position.x +
        userVideoSprite.position.x;
      dogNose.position.y =
        landmarks[30][1] +
        userVideoGroup.position.y +
        userVideoSprite.position.y;
      dogNose.rotation = cline.angle;
      dogNose.visible = true;

      const median = cline.midPoint();
      let perpendicular = new Phaser.Line(median.x, median.y, 0, 0);
      perpendicular = perpendicular.fromAngle(
        median.x,
        median.y,
        cline.angle - 1.5708,
        cd * 0.4
      );

      const dogEarsScale = cd / 320;
      dogEars.scale.setTo(dogEarsScale, dogEarsScale);

      dogEars.position = perpendicular.end;
      dogEars.rotation = cline.angle;
      dogEars.visible = true;

      const s =
        new Phaser.Line(
          landmarks[0][0],
          landmarks[0][1],
          landmarks[16][0],
          landmarks[16][1]
        ).length / 100;
      headPhysicsSprite.scale.setTo(s, s);
      headPhysicsSprite.position = {
        x:
          landmarks[33][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        y:
          landmarks[33][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
      };
      headPhysicsSprite.visible = true;

      game.physics.arcade.collide(dogEmojiEmitter, headPhysicsSprite);
    }
  } else {
    dogNose.visible = false;
    dogEars.visible = false;
    headPhysicsSprite.visible = false;
  }
}

function drawTophatFilter(landmarks) {
  if (landmarks) {
    if (frame % K_AR_FRAME_INTERVAL === 0) {
      const cline = new Phaser.Line(
        landmarks[0][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[0][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
        landmarks[16][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[16][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y
      );
      const cd = cline.length;

      const hatScale = cd / 300;
      const monocleScale = cd / 500;
      const mustacheScale = cd / 600;

      const median = cline.midPoint();
      let perpendicular = new Phaser.Line(median.x, median.y, 0, 0);
      perpendicular = perpendicular.fromAngle(
        median.x,
        median.y,
        cline.angle - 1.5708,
        cd * 0.2
      );

      tophat.position = perpendicular.end;
      tophat.scale.setTo(hatScale, hatScale);
      tophat.rotation = cline.angle;
      tophat.visible = true;

      // pupil as centroid of eye shape
      let rightPupil = [0, 0];
      for (let j = 0; j < K_FACE_RIGHT_EYE.length - 1; j += 1) {
        rightPupil[0] += landmarks[K_FACE_RIGHT_EYE[j]][0];
        rightPupil[1] += landmarks[K_FACE_RIGHT_EYE[j]][1];
      }

      rightPupil[0] /= K_FACE_RIGHT_EYE.length - 1;
      rightPupil[1] /= K_FACE_RIGHT_EYE.length - 1;

      monocle.position = {
        x:
          rightPupil[0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        y:
          rightPupil[1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
      };
      monocle.scale.setTo(monocleScale, monocleScale);
      monocle.rotation = cline.angle;
      monocle.visible = true;

      mustache.position = {
        x:
          landmarks[33][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        y:
          landmarks[33][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
      };
      mustache.scale.setTo(mustacheScale, mustacheScale);
      mustache.rotation = cline.angle;
      mustache.visible = true;
    }
  } else {
    tophat.visible = false;
    monocle.visible = false;
    mustache.visible = false;
  }
}

function drawPoorHatFilter(landmarks) {
  if (landmarks) {
    if (frame % K_AR_FRAME_INTERVAL === 0) {
      const cline = new Phaser.Line(
        landmarks[0][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[0][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
        landmarks[16][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[16][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y
      );
      const cd = cline.length;

      const hatScale = cd / 350;

      const median = cline.midPoint();
      let perpendicular = new Phaser.Line(median.x, median.y, 0, 0);
      perpendicular = perpendicular.fromAngle(
        median.x,
        median.y,
        cline.angle - 1.5708,
        cd * 0.1
      );

      poorHat.position = perpendicular.end;
      poorHat.scale.setTo(hatScale, hatScale);
      poorHat.rotation = cline.angle;
      poorHat.visible = true;
    }
  } else {
    poorHat.visible = false;
  }
}

function drawCrownFilter(landmarks) {
  if (landmarks) {
    if (frame % K_AR_FRAME_INTERVAL === 0) {
      const cline = new Phaser.Line(
        landmarks[0][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[0][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
        landmarks[16][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[16][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y
      );
      const cd = cline.length;

      const hatScale = cd / 250;

      const median = cline.midPoint();
      let perpendicular = new Phaser.Line(median.x, median.y, 0, 0);
      perpendicular = perpendicular.fromAngle(
        median.x,
        median.y,
        cline.angle - 1.5708,
        cd * 0.2
      );

      crown.position = perpendicular.end;
      crown.scale.setTo(hatScale, hatScale);
      crown.rotation = cline.angle;
      crown.visible = true;
    }
  } else {
    crown.visible = false;
  }
}

function drawHeartEyesFilter(landmarks) {
  if (landmarks) {
    if (frame % K_AR_FRAME_INTERVAL === 0) {
      // Pupils as centroids of eye shapes
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

      const cline = new Phaser.Line(
        landmarks[0][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[0][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
        landmarks[16][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[16][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y
      );
      const cd = cline.length;

      const heartScale = cd / 650;

      leftHeart.position = {
        x:
          leftPupil[0] + userVideoGroup.position.x + userVideoSprite.position.x,
        y:
          leftPupil[1] + userVideoGroup.position.y + userVideoSprite.position.y,
      };
      leftHeart.scale.setTo(heartScale, heartScale);
      leftHeart.rotation = cline.angle;
      leftHeart.visible = true;

      rightHeart.position = {
        x:
          rightPupil[0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        y:
          rightPupil[1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
      };
      rightHeart.scale.setTo(heartScale, heartScale);
      rightHeart.rotation = cline.angle;
      rightHeart.visible = true;
    }
  } else {
    leftHeart.visible = false;
    rightHeart.visible = false;
  }
}

function drawProhibitedFilter(landmarks) {
  if (landmarks) {
    if (frame % K_AR_FRAME_INTERVAL === 0) {
      // Pupils as centroids of eye shapes
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

      const cline = new Phaser.Line(
        landmarks[0][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[0][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
        landmarks[16][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[16][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y
      );
      const cd = cline.length;

      const pScale = cd / 650;

      leftProhibited.position = {
        x:
          leftPupil[0] + userVideoGroup.position.x + userVideoSprite.position.x,
        y:
          leftPupil[1] + userVideoGroup.position.y + userVideoSprite.position.y,
      };
      leftProhibited.scale.setTo(pScale, pScale);
      leftProhibited.rotation = cline.angle;
      leftProhibited.visible = true;

      rightProhibited.position = {
        x:
          rightPupil[0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        y:
          rightPupil[1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
      };
      rightProhibited.scale.setTo(pScale, pScale);
      rightProhibited.rotation = cline.angle;
      rightProhibited.visible = true;
    }
  } else {
    leftProhibited.visible = false;
    rightProhibited.visible = false;
  }
}

function drawThoughtBubbleFilter(landmarks, ref) {
  if (landmarks) {
    if (frame % K_AR_FRAME_INTERVAL === 0) {
      const cline = new Phaser.Line(
        landmarks[0][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[0][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
        landmarks[16][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        landmarks[16][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y
      );
      const cd = cline.length;

      const thoughtScale = cd / 500;

      ref.position = {
        x:
          landmarks[17][0] +
          userVideoGroup.position.x +
          userVideoSprite.position.x,
        y:
          landmarks[17][1] +
          userVideoGroup.position.y +
          userVideoSprite.position.y,
      };
      ref.scale.setTo(thoughtScale, thoughtScale);
      ref.rotation = cline.angle;
      ref.visible = true;
    }
  } else {
    ref.visible = false;
  }
}

makeMultiFrameEvent(61, 80, () => {
  getEmotions = true;
  threeTitle.visible = true;

  if (landmarks) {
    threeTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    threeTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(80, 98, () => {
  threeTitle.visible = false;
  twoTitle.visible = true;

  if (landmarks) {
    twoTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    twoTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(98, 121, () => {
  twoTitle.visible = false;
  oneTitle.visible = true;

  if (landmarks) {
    oneTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    oneTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(121, 157, () => {
  oneTitle.visible = false;
  techQuizTitle.visible = true;

  if (landmarks) {
    techQuizTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    techQuizTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(157, 158, () => {
  techQuizTitle.visible = false;
});

makeMultiFrameEvent(297, 486, () => {
  zuckScreenSpaceSprite.visible = true;

  let drawKey;

  if (frame < 316) {
    drawKey = "zuck1";
  } else if (frame < 330) {
    drawKey = "zuck2";
  } else if (frame < 345) {
    drawKey = "zuck3";
  } else if (frame < 358) {
    drawKey = "zuck4";
  } else if (frame < 371) {
    drawKey = "zuck5";
  } else if (frame < 378) {
    drawKey = "zuck6";
  } else if (frame < 386) {
    drawKey = "zuck7";
  } else if (frame < 392) {
    drawKey = "zuck8";
  } else if (frame < 411) {
    drawKey = "zuck9";
  } else if (frame < 438) {
    drawKey = "zuck10";
  } else {
    drawKey = "zuck11";
  }

  if (landmarks) {
    zuckAlertBoxPosition = {
      x:
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2 -
        337,
      y: landmarks[33][1] - 140,
    };
  }

  zuckScreenSpaceBMD.draw(
    drawKey,
    zuckAlertBoxPosition.x,
    zuckAlertBoxPosition.y
  );
  zuckScreenSpaceBMD.dirty = true;
});

makeMultiFrameEvent(486, 585, () => {
  zuckScreenSpaceSprite.visible = false;

  if (landmarks) {
    const x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2 +
      game.rnd.integerInRange(-175, 175);
    const y = landmarks[33][1] + game.rnd.integerInRange(-175, 175);

    const colorObject = Phaser.Color.getRGB(Phaser.Color.getRandomColor());
    const color = Phaser.Color.RGBtoString(
      colorObject.r,
      colorObject.g,
      colorObject.b,
      colorObject.a,
      "#"
    );

    for (let i = 0; i < 10; i += 1) {
      const xo = game.rnd.integerInRange(-Math.pow(5, i), Math.pow(5, i));
      const yo = game.rnd.integerInRange(-Math.pow(5, i), Math.pow(5, i));
      questionMarks.push(
        game.add.text(x + xo, y + yo, "?", {
          font: "Arimo, sans-serif",
          fontSize: "150px",
          fontWeight: "bold",
          fill: color,
        })
      );
    }
  }
});

makeMultiFrameEvent(585, 586, () => {
  for (let i = 0; i < questionMarks.length; i += 1) {
    questionMarks[i].visible = false;
  }

  const filmSlideRight = game.add
    .tween(filmSprite.position)
    .to(
      { x: K_PROJECT_WIDTH / 4, y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  userVideoGroup.position.x = -(K_PROJECT_WIDTH * 0.75);
  userVideoSprite.visible = true;
  userVideoMaskQuarterRight.visible = true;

  const userVideoSlideRight = game.add
    .tween(userVideoGroup.position)
    .to(
      { x: -(K_PROJECT_WIDTH / 4), y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  // TODO: Turn on AR filter and head physics collider
  drawDogFilter(landmarks);
});

makeMultiFrameEvent(586, 606, () => {
  drawDogFilter(landmarks);
});

makeMultiFrameEvent(606, 607, () => {
  dogPos = getAveragePositiveEmotions(validationStateFaceData, 0, 20000);
  dogNeg = getAverageNegativeEmotions(validationStateFaceData, 0, 20000);

  if (dogPos !== null && dogNeg !== null) {
    likeDogs = dogPos >= dogNeg ? true : false;
    dogStats.text = likeDogs
      ? `${(dogPos - dogNeg).toFixed(6)} \npositive `
      : `${(dogNeg - dogPos).toFixed(6)} \nnegative `;
    dogStats.fill = likeDogs ? "#33cc33" : "#ff0000";

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("dogs", [
        likeDogs,
        likeDogs ? (dogPos - dogNeg).toFixed(6) : (dogNeg - dogPos).toFixed(6),
      ]);
    }
  }

  if (likeDogs) {
    dogEmojiEmitter.makeParticles(
      "smileEmoji",
      0,
      K_EMOJI_EXPLOSION_PARTICLES,
      true,
      true
    );
    youLikeDogsSFX.play();
  } else {
    dogEmojiEmitter.makeParticles(
      "frownEmoji",
      0,
      K_EMOJI_EXPLOSION_PARTICLES,
      true,
      true
    );
    youDontLikeDogsSFX.play();
  }

  dogTextBox = makeTextBox(
    K_PROJECT_WIDTH / 2 - K_TEXT_BOX_SIZE / 2,
    K_PROJECT_HEIGHT / 2 - K_TEXT_BOX_SIZE / 2,
    "Your reaction to dog content"
  );

  dogStats.visible = true;

  drawDogFilter(landmarks);
});

makeMultiFrameEvent(607, 655, () => {
  drawDogFilter(landmarks);
});

makeMultiFrameEvent(655, 656, () => {
  const xs = Math.cos(1) * 700;
  const ys = Math.sin(1) * 700;

  dogEmojiEmitter.setXSpeed(xs, xs * 4);
  dogEmojiEmitter.setYSpeed(ys, ys * 4);

  // emojiEmitter.flow(5000, 2, 10, 200, true);
  dogEmojiEmitter.explode(5000, K_EMOJI_EXPLOSION_PARTICLES);

  drawDogFilter(landmarks);
});

makeMultiFrameEvent(656, 1025, () => {
  drawDogFilter(landmarks);
});

makeMultiFrameEvent(1025, 1026, () => {
  dogTextBox.visible = false;
  dogStats.visible = false;

  dogNose.visible = false;
  dogEars.visible = false;
  headPhysicsSprite.visible = false;

  // dogStatsTitleTween.stop();
  // dogStatsTween.stop();

  const filmSlideLeft = game.add
    .tween(filmSprite.position)
    .to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
  const userVideoSlideLeft = game.add
    .tween(userVideoGroup.position)
    .to(
      { x: -(K_PROJECT_WIDTH * 0.75), y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );
});

makeMultiFrameEvent(1440, 1441, () => {
  menPos = getAveragePositiveEmotions(viewerFaceData, 1025, 1150);
  womenPos = getAveragePositiveEmotions(viewerFaceData, 1226, 1351); // Note we're not sampling over all the women footage so we keep same size sample

  if (menPos !== null && womenPos !== null) {
    preferMen = menPos >= womenPos ? true : false;
    genderStatsBias.text = preferMen
      ? `+${(menPos - womenPos).toFixed(6)} \n male bias `
      : `+${(womenPos - menPos).toFixed(6)} \n female bias `;

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("gender", [
        preferMen,
        preferMen
          ? (menPos - womenPos).toFixed(6)
          : (womenPos - menPos).toFixed(6),
      ]);
    }
  }

  if (preferMen) {
    youPreferMenSFX.play();
  } else {
    youPreferWomenSFX.play();
  }

  genderTextBox = makeTextBox(37, 37, "Your reaction to men vs. women");

  genderStatsBias.visible = true;
});

makeMultiFrameEvent(1713, 1714, () => {
  genderTextBox.visible = false;
  genderStatsBias.visible = false;

  const kanyeTitleSlideTween = game.add
    .tween(kanyeTitle.position)
    .to(
      { x: K_PROJECT_WIDTH / 2 },
      300,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );
  const kanyeBiasSlideTween = game.add
    .tween(kanyeBias.position)
    .to(
      { x: K_PROJECT_WIDTH / 2 },
      300,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  if (K_INSTALLATION_MODE) {
    socket.emit("kanyeStart", true);
  }
});

makeMultiFrameEvent(1714, 1797, () => {
  kanyePos = getAveragePositiveEmotions(viewerFaceData, 1713, frame);
  kanyeNeg = getAverageNegativeEmotions(viewerFaceData, 1713, frame);

  if (kanyePos !== null && kanyeNeg !== null) {
    const kanyeDiff = kanyePos - kanyeNeg;

    if (kanyeDiff >= 0) {
      kanyeBias.text = `${kanyeDiff.toFixed(6)} positive`;
      kanyeBias.fill = "#33cc33";
      likeKanye = true;
    } else {
      kanyeBias.text = `${Math.abs(kanyeDiff).toFixed(6)} negative`;
      kanyeBias.fill = "#ff0000";
      likeKanye = false;
    }

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("kanye", [likeKanye, Math.abs(kanyeDiff).toFixed(6)]);
    }
  }
});

makeMultiFrameEvent(1797, 1798, () => {
  const kanyeTitleSlideTween = game.add
    .tween(kanyeTitle.position)
    .to(
      { x: -(kanyeTitle.width / 2) },
      300,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );
  const kanyeBiasSlideTween = game.add
    .tween(kanyeBias.position)
    .to(
      { x: K_PROJECT_WIDTH + kanyeTitle.width / 2 },
      300,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  if (K_INSTALLATION_MODE) {
    socket.emit("kanyeEnd", true);
  }
});

makeMultiFrameEvent(1808, 1809, () => {
  kanyeTitle.visible = false;
  kanyeBias.visible = false;

  const pizzaTitleSlideTween = game.add
    .tween(pizzaTitle.position)
    .to(
      { x: K_PROJECT_WIDTH / 2 },
      300,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );
  const pizzaBiasSlideTween = game.add
    .tween(pizzaBias.position)
    .to(
      { x: K_PROJECT_WIDTH / 2 },
      300,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  if (K_INSTALLATION_MODE) {
    socket.emit("pizzaStart", true);
  }
});

makeMultiFrameEvent(1809, 1971, () => {
  const pizzaPos = getAveragePositiveEmotions(viewerFaceData, 1797, frame);
  const pizzaNeg = getAverageNegativeEmotions(viewerFaceData, 1797, frame);

  if (pizzaPos !== null && pizzaNeg !== null) {
    const pizzaDiff = pizzaPos - pizzaNeg;

    if (pizzaDiff >= 0) {
      pizzaBias.text = `${pizzaDiff.toFixed(6)} positive`;
      pizzaBias.fill = "#33cc33";
      likePizza = true;
    } else {
      pizzaBias.text = `${Math.abs(pizzaDiff).toFixed(6)} negative`;
      pizzaBias.fill = "#ff0000";
      likePizza = false;
    }

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("pizza", [likePizza, Math.abs(pizzaDiff).toFixed(6)]);
    }
  }
});

makeMultiFrameEvent(1893, 1894, () => {
  adGfx = game.add.graphics(0, 0);

  let headline;
  let url;
  let body;

  if (likeKanye) {
    headline = "LOVE KANYE?";
    url = "https://kanye-lovers-only.com";
    body =
      "Since you love Kanye, we're ONLY giving you access to FAVORABLE Kanye content! Click here for takes that align with your worldview!";
  } else {
    headline = "HATE KANYE?";
    url = "https://kanye-haters-only.com";
    body =
      "Since you hate Kanye, we're ONLY giving you access to UNFAVORABLE Kanye content! Click here for takes that align with your worldview!";
  }

  deserveAds.push(makeAd(15, 30, headline, url, body));
});

makeMultiFrameEvent(1909, 1910, () => {
  let headline;
  let url;
  let body;

  if (likePizza) {
    headline = "WE KNOW YOU LIKE PIZZA!";
    url = "https://pizza-positive.com";
    body = "You like pizza, so you need to see PIZZA ONLY!";
  } else {
    headline = "YOU DON'T LIKE PIZZA!";
    url = "https://zero-pizza-tolerated.org";
    body =
      "It's important that you ONLY see content for PIZZA HATERS such as yourself.";
  }

  deserveAds.push(makeAd(150, 225, headline, url, body));
});

makeMultiFrameEvent(1928, 1929, () => {
  let headline;
  let url;
  let body;

  if (likePizza) {
    headline = "PIZZA? THAT'S ALL YOU";
    url = "https://pizza-is-good.net";
    body = "Since you <3 pizza, here's endless pizza content.";
  } else {
    headline = "PIZZA? PASS";
    url = "https://down-with-pizza.co";
    body =
      "Pizza is disgusting, and you're one of the people who understands that. Click here to enter the pizza-negative ideaology bubble.";
  }

  deserveAds.push(makeAd(800, 450, headline, url, body));
});

makeMultiFrameEvent(1938, 1939, () => {
  let headline;
  let url;
  let body;

  if (likeKanye) {
    headline = "KANYE IS GOOD";
    url = "https://kanye-is-a-good-celebrity.org";
    body =
      "The rules are simple: You have a positive perspective on Kanye. We bias your internet experience to feature more Kanye.";
  } else {
    headline = "KANYE IS NOT GOOD";
    url = "https://kanye-is-not-good.org";
    body =
      "You personally do not care for Kanye. We honor that by only showing you content that does not challenge your ideas.";
  }

  deserveAds.push(makeAd(640, 7, headline, url, body));
});

makeMultiFrameEvent(1948, 1949, () => {
  let headline;
  let url;
  let body;

  if (likePizza) {
    headline = "PIZZA FAN DETECTED";
    url = "https://yes-to-pizza.com";
    body =
      "We have something in common: You know you like pizza, and WE know you like pizza. That's why you're seeing this ad.";
  } else {
    headline = "PIZZA HATER DETECTED";
    url = "https://no-to-pizza.com";
    body =
      "We have something in common: You know you dislike pizza, and WE know you dislike pizza. That's why you're seeing this ad.";
  }

  deserveAds.push(makeAd(75, 520, headline, url, body));
});

makeMultiFrameEvent(1971, 1972, () => {
  pizzaTitle.visible = false;
  pizzaBias.visible = false;

  adGfx.clear();

  for (let i = 0; i < deserveAds.length; i += 1) {
    deserveAds[i].visible = false;
  }

  if (landmarks) {
    standbyForAIVisionTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    standbyForAIVisionTitle.y = landmarks[33][1];
  }

  standbyForAIVisionTitle.visible = true;

  if (K_INSTALLATION_MODE) {
    socket.emit("pizzaEnd", true);
  }
});

makeMultiFrameEvent(1972, 2125, () => {
  if (landmarks) {
    standbyForAIVisionTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    standbyForAIVisionTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(2125, 2278, () => {
  standbyForAIVisionTitle.visible = false;

  userVideoGroup.position.x = 0;
  userVideoSprite.visible = true;
  userVideoSprite.mask = null; // Remember to put the mask back on later!

  userVideoProcessedSprite.visible = true;
  userVideoProcessedSprite.mask = null; // Remember to put the mask back on later

  userVideoMaskQuarterRight.visible = false;

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 2125) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      0,
      0,
      0,
      s,
      s,
      1,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

      if (luma < 125) {
        return { r: 0, g: 0, b: 0, a: 255 };
      } else {
        return { r: 255, g: 255, b: 255, a: 255 };
      }
    }, this);
  }

  boundingBox.visible = true;
  boundingBox.clear();
  boundingBox.lineStyle(5, 0x80ff00, 1);

  if (landmarks) {
    const size = new Phaser.Line(
      landmarks[0][0],
      landmarks[0][1],
      landmarks[16][0],
      landmarks[16][1]
    ).length;
    const xPos =
      landmarks[33][0] +
      userVideoGroup.position.x +
      userVideoSprite.position.x -
      size / 2;
    const yPos =
      landmarks[33][1] +
      userVideoGroup.position.y +
      userVideoSprite.position.y -
      size / 2;
    boundingBox.position = { x: xPos, y: yPos };
    boundingBox.drawRect(0, 0, size, size);
    lastKnownFaceBounding = {
      x:
        (xPos - userVideoGroup.position.x - userVideoSprite.position.x) /
        K_VIDEO_PROCESSING_DOWNRES_FACTOR,
      y:
        (yPos - userVideoGroup.position.y - userVideoSprite.position.y) /
        K_VIDEO_PROCESSING_DOWNRES_FACTOR,
      size: Math.floor(size / K_VIDEO_PROCESSING_DOWNRES_FACTOR),
    };
  }
});

makeMultiFrameEvent(2278, 2279, () => {
  game.camera.flash(0xffffff, 500, false);

  let top;
  let bottom;
  let left;
  let right;

  // Fix for bug we observed at Tribeca: if the bounding box for the user's face extends beyond the bounds of the user video, fall back
  // to slicing a default subwindow from the mathematical center of the user video - because otherwise, it will take a "picture" of the user
  // that does not completely fill the picture frame and looks broken
  if (
    lastKnownFaceBounding.x !== null &&
    lastKnownFaceBounding.x >= 0 &&
    lastKnownFaceBounding.x + lastKnownFaceBounding.size <
      userVideoSprite.width / K_VIDEO_PROCESSING_DOWNRES_FACTOR - 1 &&
    lastKnownFaceBounding.y !== null &&
    lastKnownFaceBounding.y >= 0 &&
    lastKnownFaceBounding.y + lastKnownFaceBounding.size <
      userVideoSprite.height / K_VIDEO_PROCESSING_DOWNRES_FACTOR - 1 &&
    lastKnownFaceBounding.size !== null
  ) {
    top = lastKnownFaceBounding.y;
    bottom = lastKnownFaceBounding.y + lastKnownFaceBounding.size;
    left = lastKnownFaceBounding.x;
    right = lastKnownFaceBounding.x + lastKnownFaceBounding.size;

    userPhotoBMD = game.add.bitmapData(
      Math.round(lastKnownFaceBounding.size),
      Math.round(lastKnownFaceBounding.size)
    );
  } else {
    top = userVideoProcessedBMD.height / 2 - userVideoProcessedBMD.height / 4;
    bottom =
      userVideoProcessedBMD.height / 2 + userVideoProcessedBMD.height / 4;
    left = userVideoProcessedBMD.width / 2 - userVideoProcessedBMD.width / 4;
    right = userVideoProcessedBMD.width / 2 + userVideoProcessedBMD.width / 4;

    userPhotoBMD = game.add.bitmapData(
      Math.round(userVideoProcessedBMD.width / 2),
      Math.round(userVideoProcessedBMD.height / 2)
    );
  }

  userPhotoBMD.copy(
    userVideoProcessedSprite,
    left,
    top,
    right - left - 1,
    bottom - top - 1,
    0,
    0,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    1,
    1,
    undefined,
    null,
    true
  );
  userPhotoBMD.update();

  userPhotoSprite = game.add.sprite(
    K_PROJECT_WIDTH / 2,
    K_PROJECT_HEIGHT / 2,
    userPhotoBMD
  );
  userPhotoSprite.anchor.setTo(0.5, 0.5);

  midgroundGroup.add(userPhotoSprite);

  userPhotoScale = (pictureFrameSprite.height * 0.67) / userPhotoSprite.height;
  userPhotoSprite.scale.setTo(userPhotoScale, userPhotoScale);

  boundingBox.visible = false;

  userVideoSprite.visible = false;
  userVideoProcessedSprite.visible = false;

  userVideoSprite.mask = userVideoMaskQuarterRight;
  userVideoProcessedSprite.mask = userVideoMaskQuarterRight;

  userVideoGroup.position.x = -K_PROJECT_WIDTH;

  userVideoMaskQuarterRight.visible = true;

  gradient1Sprite.visible = true;
  pictureFrameSprite.visible = true;
  museumCardSprite.visible = true;
});

makeMultiFrameEvent(2377, 2378, () => {
  for (let i = 0; i < userPhotoSprite.height; i += 10) {
    for (let j = 0; j < userPhotoSprite.width; j += 10) {
      const p = userPhotoBMD.getPixel(
        Math.round(j / userPhotoScale),
        Math.round(i / userPhotoScale)
      );

      let numeral;
      let color;
      if (p.r === 255) {
        numeral = "0";
        color = "#bfbfbf";
      } else {
        numeral = "1";
        color = "#000000";
      }

      const x = userPhotoSprite.x - userPhotoSprite.width / 2 + j;
      const y = userPhotoSprite.y - userPhotoSprite.height / 2 + i;

      const pVal = game.add.text(x, y, numeral, {
        font: "Arimo, sans-serif",
        fontSize: "8px",
        fontWeight: "bold",
        fill: color,
      });
      pVal.anchor.setTo(0.5, 0.5);
      pixelValuesGroup.add(pVal);
    }
  }

  userPhotoZoomTimer = game.time.create(false);

  let scale = 1;
  userPhotoZoomTimer.loop(
    50,
    () => {
      game.camera.scale.setTo(scale, scale);
      game.camera.x += (K_PROJECT_WIDTH / 2) * 0.03;
      game.camera.y += (K_PROJECT_HEIGHT / 2) * 0.03;
      scale += 0.03;
    },
    this
  );

  userPhotoZoomTimer.start();

  const userPhotoAlphaTween = game.add
    .tween(userPhotoSprite)
    .to({ alpha: 0 }, 3000, Phaser.Easing.Linear.None, true, 1500, 0, false);
});

makeMultiFrameEvent(2568, 2569, () => {
  userPhotoZoomTimer.stop();
  game.camera.scale.setTo(1, 1);
  game.camera.x = 0;
  game.camera.y = 0;

  // Remember to reset these groups if you reuse them!
  gradientBackgroundGroup.visible = false;
  pixelValuesGroup.visible = false;
  userPhotoSprite.visible = false;
  pictureFrameSprite.visible = false;
  museumCardSprite.visible = false;
});

makeMultiFrameEvent(2828, 2883, () => {
  actualImagesUsedToTrainTitle.visible = true;
  trainingImageCelebrityTitle.visible = true;

  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(2883, 2884, () => {
  trainingImageCelebrityTitle.text = "(andre agassi) \n";
  trainingImageCelebrityTitle.fill = "#ff33cc";

  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(2884, 2938, () => {
  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(2938, 2939, () => {
  trainingImageCelebrityTitle.text = "(andy dick) \n";
  trainingImageCelebrityTitle.fill = "#00ffff";

  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(2939, 2995, () => {
  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(2995, 2996, () => {
  trainingImageCelebrityTitle.text = "(carson daly) \n";
  trainingImageCelebrityTitle.fill = "#66ff33";

  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(2996, 3051, () => {
  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3051, 3052, () => {
  trainingImageCelebrityTitle.text = "(christina aguilera) \n";
  trainingImageCelebrityTitle.fill = "#ff0000";

  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3052, 3128, () => {
  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3128, 3129, () => {
  trainingImageCelebrityTitle.text = "(fred durst) \n";
  trainingImageCelebrityTitle.fill = "#ff9933";

  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3129, 3206, () => {
  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3206, 3207, () => {
  trainingImageCelebrityTitle.text = "(heidi fleiss) \n";
  trainingImageCelebrityTitle.fill = "#cc33ff";

  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3207, 3276, () => {
  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3276, 3277, () => {
  trainingImageCelebrityTitle.text = "(jerry springer) \n";
  trainingImageCelebrityTitle.fill = "#3333ff";

  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3277, 3363, () => {
  if (landmarks) {
    trainingImageCelebrityTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    trainingImageCelebrityTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(3363, 3364, () => {
  actualImagesUsedToTrainTitle.visible = false;
  trainingImageCelebrityTitle.visible = false;

  const filmSlideRight = game.add
    .tween(filmSprite.position)
    .to(
      { x: K_PROJECT_WIDTH / 4, y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  userVideoGroup.position.x = -(K_PROJECT_WIDTH * 0.75);
  userVideoSprite.visible = true;
  userVideoMaskQuarterRight.visible = true;

  const userVideoSlideRight = game.add
    .tween(userVideoGroup.position)
    .to(
      { x: -(K_PROJECT_WIDTH / 4), y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  drawTophatFilter(landmarks);
});

makeMultiFrameEvent(3364, 3450, () => {
  drawTophatFilter(landmarks);
});

makeMultiFrameEvent(3450, 3451, () => {
  altUserVideoGroup.position.x = K_PROJECT_WIDTH;
  userVideoProcessedSpriteLeftMask.visible = true;
  userVideoMaskQuarterLeft.visible = true;

  const rightUserVideoSlide = game.add
    .tween(altUserVideoGroup.position)
    .to(
      { x: K_PROJECT_WIDTH / 2 - K_PROJECT_WIDTH / 4, y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 3450) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          altUserVideoGroup.position.x +
          userVideoProcessedSpriteLeftMask.position.x,
        y:
          landmarks[j][1] +
          altUserVideoGroup.position.y +
          userVideoProcessedSpriteLeftMask.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }

  drawTophatFilter(landmarks);
});

makeMultiFrameEvent(3451, 3732, () => {
  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          altUserVideoGroup.position.x +
          userVideoProcessedSpriteLeftMask.position.x,
        y:
          landmarks[j][1] +
          altUserVideoGroup.position.y +
          userVideoProcessedSpriteLeftMask.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }

  drawTophatFilter(landmarks);
});

makeMultiFrameEvent(3732, 3733, () => {
  getLandmarks = false;

  recordedFeatureGroup.position.x = -(K_PROJECT_WIDTH / 2);
  gradient2Sprite.visible = true;
  recordingOfYourFaceTitle.visible = true;

  const gradientSlide = game.add
    .tween(recordedFeatureGroup.position)
    .to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);

  landmarkPlaybackTimer = game.time.create(false);

  let recordedFeaturePlaybackIndex = 0;

  const viewerLandmarks = [];

  for (let i = 0; i < viewerFaceData.length; i += 1) {
    if (viewerFaceData[i].landmarks !== null) {
      viewerLandmarks.push(viewerFaceData[i]);
    }
  }

  landmarkPlaybackTimer.loop(
    60,
    () => {
      if (viewerLandmarks.length > 0) {
        if (recordedFeaturePlaybackIndex > viewerLandmarks.length - 1) {
          recordedFeaturePlaybackIndex = 0;
        }

        const landmarksData = viewerLandmarks[recordedFeaturePlaybackIndex];

        recordingOfYourFaceTitle.text = `Your face vectors \nrecorded ${(
          (frame - landmarksData.frame) /
          30
        ).toFixed(1)} seconds ago `;
        for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
          recordedLandmarkText[j].visible = true;
          recordedLandmarkText[j].position = {
            x:
              landmarksData.landmarks[j][0] +
              userVideoGroup.position.x +
              userVideoSprite.position.x,
            y:
              landmarksData.landmarks[j][1] +
              userVideoGroup.position.y +
              userVideoSprite.position.y,
          };
        }

        recordedFeaturePlaybackIndex += 4;
      } else {
        // TODO: Handle the extreme edge case that we never even recorded
        // one single frame of viewer landmark data
      }
    },
    this
  );

  landmarkPlaybackTimer.start();

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          altUserVideoGroup.position.x +
          userVideoProcessedSpriteLeftMask.position.x,
        y:
          landmarks[j][1] +
          altUserVideoGroup.position.y +
          userVideoProcessedSpriteLeftMask.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }

  drawTophatFilter(landmarks);
});

makeMultiFrameEvent(3733, 3743, () => {
  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          altUserVideoGroup.position.x +
          userVideoProcessedSpriteLeftMask.position.x,
        y:
          landmarks[j][1] +
          altUserVideoGroup.position.y +
          userVideoProcessedSpriteLeftMask.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }

  drawTophatFilter(landmarks);
});

makeMultiFrameEvent(3743, 3912, () => {
  tophat.visible = false;
  monocle.visible = false;
  mustache.visible = false;

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          altUserVideoGroup.position.x +
          userVideoProcessedSpriteLeftMask.position.x,
        y:
          landmarks[j][1] +
          altUserVideoGroup.position.y +
          userVideoProcessedSpriteLeftMask.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }
});

makeMultiFrameEvent(3912, 3913, () => {
  const rightUserVideoSlide = game.add
    .tween(altUserVideoGroup.position)
    .to(
      { x: K_PROJECT_WIDTH, y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  rightUserVideoSlide.onComplete.addOnce(() => {
    userVideoProcessedSpriteLeftMask.visible = false;
    userVideoMaskQuarterLeft.visible = false;
  });

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          altUserVideoGroup.position.x +
          userVideoProcessedSpriteLeftMask.position.x,
        y:
          landmarks[j][1] +
          altUserVideoGroup.position.y +
          userVideoProcessedSpriteLeftMask.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }
});

makeMultiFrameEvent(3913, 3921, () => {
  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          altUserVideoGroup.position.x +
          userVideoProcessedSpriteLeftMask.position.x,
        y:
          landmarks[j][1] +
          altUserVideoGroup.position.y +
          userVideoProcessedSpriteLeftMask.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }
});

makeMultiFrameEvent(4053, 4054, () => {
  for (let i = 0; i < K_NUMBER_OF_LANDMARKS; i += 1) {
    landmarkText[i].visible = false;
  }

  userVideoGroup.position = { x: -(K_PROJECT_WIDTH / 4), y: 0 };

  userVideoProcessedSprite.visible = false;
  userVideoSprite.visible = true;
  dimmerScreen.visible = true;

  const recordedFeatureGroupSlide = game.add
    .tween(recordedFeatureGroup.position)
    .to(
      { x: -(K_PROJECT_WIDTH / 2), y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  recordedFeatureGroupSlide.onComplete.addOnce(() => {
    landmarkPlaybackTimer.stop();

    gradient2Sprite.visible = true;
    recordingOfYourFaceTitle.visible = true;

    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      recordedLandmarkText[j].visible = false;
    }

    getLandmarks = true;
  });

  if (landmarks) {
    drawFaceModel(landmarks);
    drawEmotionChart();
  } else {
    faceModel.clear();
    emotionChart.clear();

    angryLabelText.visible = false;
    sadLabelText.visible = false;
    surprisedLabelText.visible = false;
    happyLabelText.visible = false;
  }

  instructionsTitle.visible = true;

  instructionsBlinkTimer = game.time.create(false);

  instructionsBlinkTimer.loop(100, () => {
    instructionsTitle.visible = instructionsTitle.visible ? false : true;
  });

  instructionsBlinkTimer.start();
});

makeMultiFrameEvent(4054, 4145, () => {
  if (landmarks) {
    drawFaceModel(landmarks);
    drawEmotionChart();
  } else {
    faceModel.clear();
    emotionChart.clear();

    angryLabelText.visible = false;
    sadLabelText.visible = false;
    surprisedLabelText.visible = false;
    happyLabelText.visible = false;
  }
});

makeMultiFrameEvent(4145, 4146, () => {
  instructionsTitle.text = "frown!!!";

  if (landmarks) {
    drawFaceModel(landmarks);
    drawEmotionChart();
  } else {
    faceModel.clear();
    emotionChart.clear();

    angryLabelText.visible = false;
    sadLabelText.visible = false;
    surprisedLabelText.visible = false;
    happyLabelText.visible = false;
  }
});

makeMultiFrameEvent(4146, 4297, () => {
  if (landmarks) {
    drawFaceModel(landmarks);
    drawEmotionChart();
  } else {
    faceModel.clear();
    emotionChart.clear();

    angryLabelText.visible = false;
    sadLabelText.visible = false;
    surprisedLabelText.visible = false;
    happyLabelText.visible = false;
  }
});

makeMultiFrameEvent(4297, 4298, () => {
  getLandmarks = false;

  overlayGroup.position = { x: 0, y: K_PROJECT_HEIGHT };

  gradient3Sprite.visible = true;
  yourMouthShapeTitle.visible = true;
  mouthQuantificationTitle.visible = true;
  mouthModel.visible = true;

  const gradientTween = game.add
    .tween(overlayGroup.position)
    .to({ x: 0, y: 0 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false);

  mouthPlaybackTimer = game.time.create(false);

  let recordedFeaturePlaybackIndex = 0;

  const faceDataInRange = [];

  for (let i = 0; i < viewerFaceData.length; i += 1) {
    if (viewerFaceData[i].frame >= 4053 && viewerFaceData[i].frame < 4234) {
      faceDataInRange.push(viewerFaceData[i]);
    }
  }

  mouthPlaybackTimer.loop(
    60,
    () => {
      if (faceDataInRange.length > 0) {
        if (recordedFeaturePlaybackIndex > faceDataInRange.length - 1) {
          recordedFeaturePlaybackIndex = 0;
        }

        const landmarksData =
          faceDataInRange[recordedFeaturePlaybackIndex].landmarks;

        if (landmarksData) {
          drawBigMouthModel(landmarksData);

          const e = faceDataInRange[recordedFeaturePlaybackIndex];

          if (e.sad) {
            mouthQuantificationTitle.text = `${e.neutral.toFixed(
              6
            )} neutral\n${e.happy.toFixed(6)} happy\n${e.sad.toFixed(
              6
            )} sad\n${e.angry.toFixed(6)} angry\n${e.fearful.toFixed(
              6
            )} fearful\n${e.disgusted.toFixed(
              6
            )} disgusted\n${e.surprised.toFixed(6)} surprised`;
          }
        }

        recordedFeaturePlaybackIndex += 1;
      } else {
        // TODO: Handle the extreme edge case that we never even recorded
        // one single frame of viewer face data during the SMILE!!!! / FROWN!!!! segment
      }
    },
    this
  );

  mouthPlaybackTimer.start();

  gradientTween.onComplete.addOnce(() => {
    instructionsBlinkTimer.stop();
    instructionsTitle.visible = false;
  });

  if (landmarks) {
    drawFaceModel(landmarks);
    drawEmotionChart();
  } else {
    faceModel.clear();
    emotionChart.clear();

    angryLabelText.visible = false;
    sadLabelText.visible = false;
    surprisedLabelText.visible = false;
    happyLabelText.visible = false;
  }
});

makeMultiFrameEvent(4298, 4314, () => {
  if (landmarks) {
    drawFaceModel(landmarks);
    drawEmotionChart();
  } else {
    faceModel.clear();
    emotionChart.clear();

    angryLabelText.visible = false;
    sadLabelText.visible = false;
    surprisedLabelText.visible = false;
    happyLabelText.visible = false;
  }
});

makeMultiFrameEvent(4512, 4513, () => {
  userVideoGroup.position.x = -(K_PROJECT_WIDTH * 0.75);
  filmSprite.position.x = 0;

  userVideo.visible = false;
  dimmerScreen.visible = false;

  gradient3Sprite.visible = false;
  yourMouthShapeTitle.visible = false;
  mouthQuantificationTitle.visible = false;
  mouthModel.visible = false;

  mouthPlaybackTimer.stop();
});

// makeMultiFrameEvent(4683, 4684, () => {
// 	dynamicNewsSprite.visible = true;
// });

// makeMultiFrameEvent(4698, 4699, () => {
// 	if (dynamicNewsSprite.height > 1500) {
// 		const newsScroll = game.add.tween(dynamicNewsSprite.position).to( {x: 0, y: -420}, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);
// 	}
// });

// makeMultiFrameEvent(4750, 4751, () => {
// 	dynamicNewsSprite.visible = false;
// });

makeMultiFrameEvent(5246, 5247, () => {
  noTitle.visible = true;

  if (landmarks) {
    noTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    noTitle.y = landmarks[33][1];
  }

  noBlinkTimer = game.time.create(false);

  noBlinkTimer.loop(200, () => {
    noTitle.visible = noTitle.visible ? false : true;
  });

  noBlinkTimer.start();
});

makeMultiFrameEvent(5247, 5330, () => {
  if (landmarks) {
    noTitle.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    noTitle.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(5330, 5331, () => {
  noBlinkTimer.stop();
  noTitle.visible = false;
});

makeMultiFrameEvent(5821, 5822, () => {
  whiteNegative = getAverageNegativeEmotions(viewerFaceData, 5596, 5660); // Note we're not sampling over all the caucasian footage so we keep same size sample
  nonWhiteNegative = getAverageNegativeEmotions(viewerFaceData, 5671, 5735);

  if (whiteNegative !== null && nonWhiteNegative !== null) {
    preferWhite = whiteNegative <= nonWhiteNegative ? true : false;
    finalRaceBias = preferWhite
      ? nonWhiteNegative - whiteNegative
      : whiteNegative - nonWhiteNegative;
    raceStatsBias.text = preferWhite
      ? `+${finalRaceBias.toFixed(6)} \nwhite bias `
      : `+${finalRaceBias.toFixed(6)} \nBlack bias `;

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("race", [preferWhite, finalRaceBias.toFixed(6)]);
    }
  }

  if (preferWhite) {
    youPreferWhitePeopleSFX.play();
  } else {
    youPreferBlackPeopleSFX.play();
  }

  //raceStatsTitle.visible = true;

  raceTextBox = makeTextBox(37, 37, "Your reaction to white vs. Black people");
  raceStatsBias.visible = true;
  // raceStatsTitleTween = makeFloatTween(raceStatsTitle, 50, 10000);
  // raceStatsBiasTween = makeFloatTween(raceStatsBias, 50, 10000);
});

makeMultiFrameEvent(6107, 6108, () => {
  game.camera.fade(0x000000, 1000);

  game.camera.onFadeComplete.addOnce(() => {
    //raceStatsTitle.visible = false;

    raceTextBox.visible = false;
    raceStatsBias.visible = false;

    // raceStatsTitleTween.stop();
    // raceStatsBiasTween.stop();

    game.camera.resetFX();
  });
});

makeMultiFrameEvent(6137, 6138, () => {
  // If you prefer white people, then we should add your percentage of dislike for non-white
  // people to 50%, and that's how we arrive at what % of white profiles we should show you
  // (Although by subtracting probabilities, would we remove ambient or "resting" face?)

  // TODO:  HANDLE ERRORS BETTER - THIS IS CURRENTLY BAD

  if (whiteNegative !== null && nonWhiteNegative !== null) {
    // let whitePct;
    // let nonWhitePct;

    let meanGlobalBlackPreference = 0.5;
    const standardDeviation = 0.01;

    const normalizedBlackPreference =
      (whiteNegative - nonWhiteNegative + 1.0) / 2.0;

    const standardDeviationsFromMean =
      (normalizedBlackPreference - meanGlobalBlackPreference) /
      standardDeviation;

    let nonWhitePct = 50 + 15 * standardDeviationsFromMean;

    if (nonWhitePct > 100) {
      nonWhitePct = 100;
    } else if (nonWhitePct < 0) {
      nonWhitePct = 0;
    }

    let whitePct = 100 - nonWhitePct;

    if (whitePct >= nonWhitePct) {
      higherOrderQuantificationLeftPercent.fill = "#33cc33";
      higherOrderQuantificationRightPercent.fill = "#ff0000";
    } else {
      higherOrderQuantificationLeftPercent.fill = "#ff0000";
      higherOrderQuantificationRightPercent.fill = "#33cc33";
    }

    // if (preferWhite) {
    // 	whitePct = 50 + (nonWhiteNegative * 50);
    // 	nonWhitePct = 100 - whitePct;

    // 	higherOrderQuantificationLeftPercent.fill = "#33cc33";
    // 	higherOrderQuantificationRightPercent.fill = "#ff0000";
    // } else {
    // 	nonWhitePct = 50 + (whiteNegative * 50);
    // 	whitePct = 100 - nonWhitePct;

    // 	higherOrderQuantificationLeftPercent.fill = "#ff0000";
    // 	higherOrderQuantificationRightPercent.fill = "#33cc33";
    // }

    higherOrderQuantificationLeftPercent.text = `${whitePct.toFixed(1)}% `;
    higherOrderQuantificationRightPercent.text = `${nonWhitePct.toFixed(1)}% `;

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("datingPreference", [
        whitePct.toFixed(1),
        nonWhitePct.toFixed(1),
      ]);
    }
  }

  higherOrderQuantificationTitle.visible = true;
  higherOrderQuantificationTitle.position = {
    x: K_PROJECT_WIDTH / 2,
    y: K_PROJECT_HEIGHT / 2,
  };

  higherOrderTextBoxLeft = makeTextBox(
    K_PROJECT_WIDTH / 4 - K_TEXT_BOX_SIZE / 2,
    K_PROJECT_HEIGHT / 2 - K_TEXT_BOX_SIZE / 2,
    "White\nprofiles"
  );
  higherOrderTextBoxRight = makeTextBox(
    K_PROJECT_WIDTH * 0.75 - K_TEXT_BOX_SIZE / 2,
    K_PROJECT_HEIGHT / 2 - K_TEXT_BOX_SIZE / 2,
    "Non-white profiles"
  );

  // higherOrderQuantificationLeftLabel.visible = true;
  // higherOrderQuantificationRightLabel.visible = true;
  higherOrderQuantificationLeftPercent.visible = true;
  higherOrderQuantificationRightPercent.visible = true;
});

makeMultiFrameEvent(6260, 6261, () => {
  // TODO:  HANDLE ERRORS BETTER - THIS IS CURRENTLY BAD

  if (kanyePos !== null && kanyeNeg !== null) {
    // let politicalPct;
    // let gossipPct;

    let meanGlobalKanyePreference = 0.5;
    const standardDeviation = 0.01;

    const normalizedKanyePreference = (kanyePos - kanyeNeg + 1.0) / 2.0;

    const standardDeviationsFromMean =
      (normalizedKanyePreference - meanGlobalKanyePreference) /
      standardDeviation;

    let gossipPct = 50 + 15 * standardDeviationsFromMean;

    if (gossipPct > 100) {
      gossipPct = 100;
    } else if (gossipPct < 0) {
      gossipPct = 0;
    }

    let politicalPct = 100 - gossipPct;

    if (politicalPct >= gossipPct) {
      higherOrderQuantificationLeftPercent.fill = "#33cc33";
      higherOrderQuantificationRightPercent.fill = "#ff0000";
    } else {
      higherOrderQuantificationLeftPercent.fill = "#ff0000";
      higherOrderQuantificationRightPercent.fill = "#33cc33";
    }

    // if (likeKanye) {
    // 	gossipPct = 50 + (kanyePos * 50);
    // 	politicalPct = 100 - gossipPct;

    // 	higherOrderQuantificationLeftPercent.fill = "#ff0000";
    // 	higherOrderQuantificationRightPercent.fill = "#33cc33";
    // } else {
    // 	politicalPct = 50 + (kanyeNeg * 50);
    // 	gossipPct = 100 - politicalPct;

    // 	higherOrderQuantificationLeftPercent.fill = "#33cc33";
    // 	higherOrderQuantificationRightPercent.fill = "#ff0000";
    // }

    higherOrderQuantificationLeftPercent.text = `${politicalPct.toFixed(1)}% `;
    higherOrderQuantificationRightPercent.text = `${gossipPct.toFixed(1)}% `;

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("socialNews", [
        politicalPct.toFixed(1),
        gossipPct.toFixed(1),
      ]);
    }
  }

  higherOrderQuantificationTitle.text = "your \nfeed \nwill \nshow ";
  higherOrderQuantificationTitle.position = {
    x: K_PROJECT_WIDTH / 2,
    y: K_PROJECT_HEIGHT / 2,
  };

  // higherOrderQuantificationLeftLabel.text = "political analysis";
  // higherOrderQuantificationRightLabel.text = "celebrity gossip";

  higherOrderTextBoxLeft.copyText.text = "Political analysis";
  higherOrderTextBoxRight.copyText.text = "Celebrity\ngossip";
});

makeMultiFrameEvent(6391, 6392, () => {
  // TODO:  HANDLE ERRORS BETTER - THIS IS CURRENTLY BAD

  // This algo translates approximately to: Your republican-ness is equal to the mean
  // of your positive response to dogs, your positive response to kanye west, and your negative response to non-white people

  // Dog preference correlates with conservative political views
  // https://www.psychologytoday.com/us/blog/canine-corner/201306/do-politics-matter-when-it-comes-loving-cats-or-dogs

  if (dogPos !== null && kanyePos !== null && nonWhiteNegative !== null) {
    // republicanPct = (dogPos + kanyePos + nonWhiteNegative) / 3 * 100;

    // if (republicanPct > 100) {
    // 	republicanPct = 100;
    // }

    // democratPct = 100 - republicanPct;

    let meanGlobalRepublicanness = 0.05;
    const standardDeviation = 0.1;

    const normalizedRepublicanness = (dogPos + kanyePos + nonWhiteNegative) / 3;

    const standardDeviationsFromMean =
      (normalizedRepublicanness - meanGlobalRepublicanness) / standardDeviation;

    republicanPct = 50 + 15 * standardDeviationsFromMean;

    if (republicanPct > 100) {
      republicanPct = 100;
    } else if (republicanPct < 0) {
      republicanPct = 0;
    }

    democratPct = 100 - republicanPct;

    higherOrderQuantificationLeftPercent.text = `${democratPct.toFixed(1)}% `;
    higherOrderQuantificationRightPercent.text = `${republicanPct.toFixed(
      1
    )}% `;

    higherOrderQuantificationLeftPercent.fill =
      democratPct > republicanPct ? "#33cc33" : "#ff0000";
    higherOrderQuantificationRightPercent.fill =
      democratPct > republicanPct ? "#ff0000" : "#33cc33";

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("politicalOrientation", [
        democratPct.toFixed(1),
        republicanPct.toFixed(1),
      ]);
    }
  }

  higherOrderQuantificationTitle.text = "your \npolit- \nical \nprofile ";
  higherOrderQuantificationTitle.position = {
    x: K_PROJECT_WIDTH / 2,
    y: K_PROJECT_HEIGHT / 2,
  };

  // higherOrderQuantificationLeftLabel.text = "democrat";
  // higherOrderQuantificationRightLabel.text = "republican";

  higherOrderTextBoxLeft.copyText.text = "Left leaning";
  higherOrderTextBoxRight.copyText.text = "Right leaning";
});

makeMultiFrameEvent(6615, 6616, () => {
  higherOrderQuantificationTitle.visible = false;
  // higherOrderQuantificationLeftLabel.visible = false;
  // higherOrderQuantificationRightLabel.visible = false;
  higherOrderQuantificationLeftPercent.visible = false;
  higherOrderQuantificationRightPercent.visible = false;

  higherOrderTextBoxLeft.visible = false;
  higherOrderTextBoxRight.visible = false;

  faceModel.clear();
  emotionChart.clear();

  angryLabelText.visible = false;
  sadLabelText.visible = false;
  surprisedLabelText.visible = false;
  happyLabelText.visible = false;
});

makeMultiFrameEvent(6731, 6732, () => {
  // TODO: This will eventually be determined by lat/long we get from GPS API or IP geolocation
  screenSpaceUserLocation = { x: 1015, y: 482 };

  mapGroup.position.x = K_PROJECT_WIDTH;
  springStudiosMap.visible = true;

  userVideoGroup.position.x = -(K_PROJECT_WIDTH * 0.75);
  userVideoSprite.visible = true;
  userVideoMaskQuarterRight.visible = true;

  mapGfx.visible = true;
  // mapUserLabel.visible = true;

  boundingBox.clear();
  boundingBox.visible = true;

  // Draw/update the user label
  // mapUserLabel.text = "USER LOCATED";
  // mapUserLabel.position.x = screenSpaceUserLocation.x - (K_PROJECT_WIDTH / 2);
  // mapUserLabel.position.y = screenSpaceUserLocation.y + 90;

  // Draw/update the emotion label
  // mapEmotionLabel.text = "";
  mapEmotionLabel.position.x = K_PROJECT_WIDTH * 0.75 - K_PROJECT_WIDTH / 2;
  mapEmotionLabel.position.y = K_PROJECT_HEIGHT / 2;

  dollarEmitter.position.x = mapEmotionLabel.position.x;
  dollarEmitter.position.y = mapEmotionLabel.position.y;

  // Draw the blue dot
  mapGfx.lineStyle(3, 0xffffff, 1.0);
  mapGfx.beginFill(0x0099ff);
  mapGfx.drawCircle(screenSpaceUserLocation.x, screenSpaceUserLocation.y, 50);
  mapGfx.endFill();

  const userVideoSlideRight = game.add
    .tween(userVideoGroup.position)
    .to(
      { x: -(K_PROJECT_WIDTH / 4), y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );
  const mapSlideLeft = game.add
    .tween(mapGroup.position)
    .to(
      { x: K_PROJECT_WIDTH / 2, y: 0 },
      200,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      false
    );

  mapBlinkTimer = game.time.create(false);

  mapBlinkTimer.loop(1000, () => {
    if (mapEmotionLabel.visible) {
      mapEmotionLabel.visible = false;
    } else {
      // Display most probable emotion
      if (emotions) {
        let dimension = 0;
        let probability = 0;

        for (let [key, value] of Object.entries(emotions)) {
          if (value > probability) {
            probability = value;
            dimension = key;
          }
        }

        // for (let i = 0; i < emotions.length; i += 1) {
        // 	if (emotions[i]["probability"] > probability) {
        // 		probability = emotions[i]["probability"];
        // 		dimension = emotions[i]["expression"];
        // 	}
        // }

        mapEmotionLabel.text = `feels ${dimension} `;
      }

      mapEmotionLabel.visible = true;
      kachingSFX.play();
      dollarEmitter.emitParticle();
    }
  });

  mapBlinkTimer.start();
});

makeMultiFrameEvent(6732, 7222, () => {
  mapGfx.clear();
  boundingBox.clear();

  // Draw the blue dot
  mapGfx.lineStyle(4, 0xffffff, 1.0);
  mapGfx.beginFill(0x0099ff);
  mapGfx.drawCircle(screenSpaceUserLocation.x, screenSpaceUserLocation.y, 50);
  mapGfx.endFill();

  // Draw the pip
  if (landmarks) {
    const size = new Phaser.Line(
      landmarks[0][0],
      landmarks[0][1],
      landmarks[16][0],
      landmarks[16][1]
    ).length;
    const xPos =
      landmarks[33][0] +
      userVideoGroup.position.x +
      userVideoSprite.position.x -
      size / 2;
    const yPos =
      landmarks[33][1] +
      userVideoGroup.position.y +
      userVideoSprite.position.y -
      size / 2;

    boundingBox.clear();
    boundingBox.lineStyle(14, 0x0099ff, 1.0);
    boundingBox.position = { x: xPos, y: yPos };
    boundingBox.drawRect(0, 0, size, size);

    mapGfx.lineStyle(10, 0x0099ff, 1.0);
    mapGfx.moveTo(screenSpaceUserLocation.x, screenSpaceUserLocation.y);
    mapGfx.lineTo(
      landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2 +
        size / 2,
      landmarks[33][1]
    );

    const copyScale =
      pixelatedUserFaceBMD.width / (size / userVideoSpriteScale);

    // TODO: Should this run at a different frequency using the video update interval, like our other video processing effects?
    pixelatedUserFaceBMD.copy(
      userVideoSprite,
      (landmarks[33][0] - size / 2) / userVideoSpriteScale,
      (landmarks[33][1] - size / 2) / userVideoSpriteScale,
      size / userVideoSpriteScale,
      size / userVideoSpriteScale,
      0,
      0,
      undefined,
      undefined,
      0,
      0,
      0,
      copyScale,
      copyScale,
      1,
      null,
      true
    );
    pixelatedUserFaceBMD.update();

    pixelatedUserFaceBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

      if (luma < 125) {
        return { r: 0, g: 0, b: 0, a: 255 };
      } else {
        return { r: 255, g: 255, b: 255, a: 255 };
      }
    }, this);

    const pixelatedUserFaceSpriteScale = size / pixelatedUserFaceBMD.width;
    pixelatedUserFaceSprite.scale.setTo(
      pixelatedUserFaceSpriteScale,
      pixelatedUserFaceSpriteScale
    );
    pixelatedUserFaceSprite.position = { x: xPos, y: yPos };
    pixelatedUserFaceSprite.visible = true;

    if (emotions) {
      userFaceRawEmotionsText.text = `[${emotions["neutral"].toFixed(
        6
      )} ${emotions["happy"].toFixed(6)} ${emotions["sad"].toFixed(
        6
      )} ${emotions["angry"].toFixed(6)}\n${emotions["fearful"].toFixed(
        6
      )} ${emotions["disgusted"].toFixed(6)} ${emotions["surprised"].toFixed(
        6
      )}]`;
      userFaceRawEmotionsText.position = { x: xPos, y: yPos + size + 10 };
      userFaceRawEmotionsText.visible = true;
    } else {
      userFaceRawEmotionsText.visible = false;
    }
  } else {
    pixelatedUserFaceSprite.visible = false;
    userFaceRawEmotionsText.visible = false;
  }
});

makeMultiFrameEvent(7222, 7223, () => {
  pixelatedUserFaceSprite.visible = false;
  userFaceRawEmotionsText.visible = false;

  mapGfx.clear();
  boundingBox.clear();

  mapBlinkTimer.stop();

  mapGroup.visible = false;
  userVideoGroup.visible = false;
});

makeMultiFrameEvent(7377, 7378, () => {
  boundingBox.visible = false;
  boundingBox.clear();
  boundingBox.position = { x: 428, y: 315 };
  boundingBox.lineStyle(4, 0xff0000, 1.0);
  boundingBox.drawRect(0, 0, 301, 97);

  patentBoxTimer = game.time.create(false);

  patentBoxTimer.loop(
    200,
    () => {
      boundingBox.visible = boundingBox.visible ? false : true;
    },
    this
  );

  patentBoxTimer.start();
});

makeMultiFrameEvent(7462, 7463, () => {
  const xs = Math.cos(1) * 700;
  const ys = Math.sin(1) * 700;

  snapchatEmojiEmitter.setXSpeed(xs, xs * 4);
  snapchatEmojiEmitter.setYSpeed(ys, ys * 4);

  snapchatEmojiEmitter.explode(5000, K_EMOJI_EXPLOSION_PARTICLES);
});

makeMultiFrameEvent(7472, 7473, () => {
  boundingBox.visible = false;
  patentBoxTimer.stop();
});

makeMultiFrameEvent(7624, 7625, () => {
  boundingBox.clear();
  boundingBox.position = { x: 794, y: 346 };
  boundingBox.lineStyle(4, 0xff0000, 1.0);
  boundingBox.drawRect(0, 0, 304, 70);

  patentBoxTimer = game.time.create(false);

  patentBoxTimer.loop(
    200,
    () => {
      boundingBox.visible = boundingBox.visible ? false : true;
    },
    this
  );

  patentBoxTimer.start();
});

makeMultiFrameEvent(7684, 7685, () => {
  boundingBox.visible = false;
  boundingBox.clear();
  patentBoxTimer.stop();
});

makeMultiFrameEvent(8368, 8369, () => {
  const xs = Math.cos(1) * 700;
  const ys = Math.sin(1) * 700;

  applauseEmojiEmitter.setXSpeed(xs, xs * 4);
  applauseEmojiEmitter.setYSpeed(ys, ys * 4);

  applauseEmojiEmitter.explode(5000, K_EMOJI_EXPLOSION_PARTICLES);
});

makeMultiFrameEvent(8712, 8713, () => {
  computerDesktop.visible = true;
  mouseCursor.visible = true;
  const cursorTween = game.add
    .tween(mouseCursor)
    .to({ x: 1230, y: 20 }, 400, Phaser.Easing.Linear.None, true, 0, 0, false);

  cursorTween.onComplete.addOnce(() => {
    doubleClickSFX.play();

    if (landmarks) {
      disney.x =
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
      disney.y = landmarks[33][1];
    } else {
      disney.position = { x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2 };
    }

    disney.visible = true;
  });
});

makeMultiFrameEvent(8713, 8763, () => {
  if (landmarks) {
    disney.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    disney.y = landmarks[33][1];
  }
});

makeMultiFrameEvent(8763, 8764, () => {
  doubleClickSFX.play();
  twentiethCenturyFox.position = {
    x: K_PROJECT_WIDTH / 2,
    y: K_PROJECT_HEIGHT / 2,
  };
});

makeMultiFrameEvent(8764, 8836, () => {
  if (landmarks) {
    twentiethCenturyFox.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    twentiethCenturyFox.y = landmarks[33][1];
  }

  twentiethCenturyFox.visible = true;
});

makeMultiFrameEvent(8836, 8837, () => {
  doubleClickSFX.play();
  kelloggsCornFlakes.position = {
    x: K_PROJECT_WIDTH / 2,
    y: K_PROJECT_HEIGHT / 2,
  };
});

makeMultiFrameEvent(8837, 8917, () => {
  if (landmarks) {
    kelloggsCornFlakes.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    kelloggsCornFlakes.y = landmarks[33][1];
  }

  kelloggsCornFlakes.visible = true;
});

makeMultiFrameEvent(8917, 8918, () => {
  doubleClickSFX.play();
  yourLocalPizzeria.position = {
    x: K_PROJECT_WIDTH / 2,
    y: K_PROJECT_HEIGHT / 2,
  };
});

makeMultiFrameEvent(8918, 8981, () => {
  if (landmarks) {
    yourLocalPizzeria.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    yourLocalPizzeria.y = landmarks[33][1];
  }

  yourLocalPizzeria.visible = true;
});

makeMultiFrameEvent(8981, 8982, () => {
  doubleClickSFX.play();
  forYourNextJob.position = { x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2 };
});

makeMultiFrameEvent(8982, 9107, () => {
  if (landmarks) {
    forYourNextJob.x =
      K_PROJECT_WIDTH -
      landmarks[33][0] -
      (K_PROJECT_WIDTH - userVideoSprite.width) / 2;
    forYourNextJob.y = landmarks[33][1];
  }

  forYourNextJob.visible = true;
});

makeMultiFrameEvent(9107, 9108, () => {
  forYourNextJob.visible = false;
  yourLocalPizzeria.visible = false;
  kelloggsCornFlakes.visible = false;
  twentiethCenturyFox.visible = false;
  disney.visible = false;
  mouseCursor.visible = false;
  computerDesktop.visible = false;
});

makeMultiFrameEvent(9151, 9152, () => {
  // Cat preference over dog preference positively correlates with higher intelligence
  // https://www.huffingtonpost.com/2014/05/29/cat-people-dog-people-intelligence_n_5412245.html

  // Racism positively correlates with stupidity
  // https://www.psychologicalscience.org/news/were-only-human/is-racism-just-a-form-of-stupidity.html

  // General prejudices and biases positively correlate with low IQ
  // https://www.livescience.com/18132-intelligence-social-conservatism-racism.html

  // Preference for the music of Kanye West positively correlates with low test scores
  // https://consequenceofsound.net/2014/10/smart-people-listen-to-radiohead-and-dumb-people-listen-to-beyonce-according-to-new-study/

  if (
    dogPos !== null &&
    menPos !== null &&
    womenPos !== null &&
    whiteNegative !== null &&
    nonWhiteNegative !== null &&
    kanyePos !== null
  ) {
    // Larger mean global stupidity values will make the viewers on average less stupid
    const meanGlobalStupidity = 0.0005;
    const standardDeviation = 0.05;

    const normalizedStupidity =
      (dogPos +
        Math.abs(menPos - womenPos) +
        Math.abs(whiteNegative - nonWhiteNegative) +
        kanyePos) /
      4;

    const standardDeviationsFromMean =
      -(normalizedStupidity - meanGlobalStupidity) / standardDeviation;

    // we translate our "stupidity quotient" to more user-friendly IQ by using normal distribution standard deviation of 15
    iq = Math.floor(15 * standardDeviationsFromMean + 100);

    // Only clamp the min because we're skewing the mean to create more stupid viewers
    if (iq < 1) {
      // Sad hack for web release - just to avoid the dreaded repetitive IQ of 1
      iq = game.rnd.integerInRange(1, 20);
    }

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("iq", [iq]);
    }
  }

  if (iq < 100) {
    wayOverYourHead = true;
  }

  iqStatTitle.text = `${iq} `;
  iqStatTitle.fill = iq < 100 ? "#ff0000" : "#33cc33";

  estimatedIQTitle.visible = true;
  iqStatTitle.visible = true;

  if (wayOverYourHead) {
    thatPartWaySFX.play();
  } else {
    thatPartBitSFX.play();
  }
});

makeMultiFrameEvent(9702, 9703, () => {
  function mentalHealthQuantification() {
    function selfLoathingQuantification() {
      const notNull = function (x) {
        return x !== null;
      };

      const positiveSamples = [];
      const negativeSamples = [];

      positiveSamples.push(
        getAveragePositiveEmotions(viewerFaceData, 585, 1025)
      ); // dog AR filter bit
      negativeSamples.push(
        getAverageNegativeEmotions(viewerFaceData, 585, 1025)
      );

      positiveSamples.push(
        getAveragePositiveEmotions(viewerFaceData, 2125, 2278)
      ); // AI vision bit
      negativeSamples.push(
        getAverageNegativeEmotions(viewerFaceData, 2125, 2278)
      );

      positiveSamples.push(
        getAveragePositiveEmotions(viewerFaceData, 3363, 3921)
      ); // tophat/monocle AR filter + enumerated landmarks bit
      negativeSamples.push(
        getAverageNegativeEmotions(viewerFaceData, 3363, 3921)
      );

      positiveSamples.push(
        getAveragePositiveEmotions(viewerFaceData, 6731, 7222)
      ); // Geolocation correlation bit
      negativeSamples.push(
        getAverageNegativeEmotions(viewerFaceData, 6731, 7222)
      );

      if (positiveSamples.some(notNull) && negativeSamples.some(notNull)) {
        let positiveAcc = 0;
        for (let i = 0; i < positiveSamples.length; i += 1) {
          positiveAcc += positiveSamples[i];
        }

        let negativeAcc = 0;
        for (let i = 0; i < negativeSamples.length; i += 1) {
          negativeAcc += negativeSamples[i];
        }

        const meanPositive = positiveAcc / positiveSamples.length;
        const meanNegative = negativeAcc / negativeSamples.length;

        if (meanNegative > meanPositive) {
          isSelfLoathing = true;
        }

        // We only emit a visualization event if we got some signal from the user
        if (K_INSTALLATION_MODE) {
          socket.emit("selfImage", [
            isSelfLoathing,
            Math.abs(meanPositive - meanNegative).toFixed(6),
          ]);
        }

        selfImageQuantificationComplete = true;
        finalPopSFX.play();

        // console.log(`Self loathing delta: ${meanPositive - meanNegative}`)
      }

      if (isSelfLoathing) {
        isSelfLoathingSFX.play();
      } else {
        isNotSelfLoathingSFX.play();
      }

      reactionToYourselfLabel.text =
        "reaction to yourself: " + (isSelfLoathing ? "bad" : "good");
      reactionToYourselfLabel.position.x =
        userVideoGroup.x + userVideoSprite.x + userVideoSprite.width - 37;
      reactionToYourselfLabel.position.y = K_PROJECT_HEIGHT - 147;
      reactionToYourselfLabel.visible = true;
    }

    // Reduced (flat, blunted) facial affect positive correlates with mental illness
    // https://en.wikipedia.org/wiki/Reduced_affect_display
    const meanAffects = [];

    for (let i = 0; i < viewerFaceData.length; i += 1) {
      if (viewerFaceData[i].sad) {
        const frameMean =
          (viewerFaceData[i].happy +
            viewerFaceData[i].sad +
            viewerFaceData[i].angry +
            viewerFaceData[i].fearful +
            viewerFaceData[i].disgusted +
            viewerFaceData[i].surprised) /
          6;

        meanAffects.push(frameMean);
      }
    }

    let meanOfMeans = null;

    if (meanAffects.length > 0) {
      let acc = 0;

      for (let i = 0; i < meanAffects.length; i += 1) {
        acc += meanAffects[i];
        meanOfMeans = acc / meanAffects.length;
      }
    }

    if (meanOfMeans !== null) {
      isMentallyIll = meanOfMeans < 0.05 ? true : false;

      // We only emit a visualization event if we got some signal from the user
      if (K_INSTALLATION_MODE) {
        socket.emit("mentalHealth", [isMentallyIll, meanOfMeans.toFixed(6)]);
      }
    }

    isMentallyIllSFX.onStop.addOnce(selfLoathingQuantification);
    isNotMentallyIllSFX.onStop.addOnce(selfLoathingQuantification);

    if (isMentallyIll) {
      isMentallyIllSFX.play();
    } else {
      isNotMentallyIllSFX.play();
    }

    facialAffectLabel.text =
      "avg facial affect: " + (isMentallyIll ? "low" : "high");
    facialAffectLabel.position.x =
      userVideoGroup.x + userVideoSprite.x + userVideoSprite.width - 37;
    facialAffectLabel.position.y = K_PROJECT_HEIGHT - 87;
    facialAffectLabel.visible = true;

    mentalHealthQuantificationComplete = true;
    finalPopSFX.play();

    // console.log(`Mean affect: ${meanOfMeans}`);
  }

  userVideoGroup.position.x = 0;
  userVideoGroup.position.y = 0;

  userVideoGroup.visible = true;

  userVideoSprite.visible = true;
  userVideoSprite.mask = null;

  userVideoProcessedSprite.visible = false;
  userVideoProcessedSprite.mask = null;

  userVideoMaskQuarterRight.visible = false;

  estimatedIQTitle.visible = false;
  iqStatTitle.visible = false;

  // Dog preference over cat preference positively correlates with higher annual income
  // https://www.thisisinsider.com/cat-people-vs-dog-people-2018-1

  // Higher IQ positively correlates with higher income
  // https://www.forbes.com/sites/quora/2015/09/16/is-iq-a-predictor-of-success/#6710737a3604

  // Republican political affiliation positively correlates with higher annual salary
  // https://www.theatlantic.com/business/archive/2012/11/does-your-wage-predict-your-vote/264541/

  if (dogPos !== null && iq !== null && republicanPct !== null) {
    // Larger mean global wealth will make the viewers on average less wealthy
    const meanGlobalWealth = 0.5;
    const standardDeviation = 0.1;

    const rescaledIQ = iq / 100;
    const rescaledRepublicanism = republicanPct / 50;

    const normalizedWealth = (dogPos + rescaledIQ + rescaledRepublicanism) / 3;

    const standardDeviationsFromMean =
      (normalizedWealth - meanGlobalWealth) / standardDeviation;

    // US incomes do not follow a normal distribution but we arbitrarily use a standard deviation of $20K
    // http://campuspress.yale.edu/sabrinacales/2015/08/03/the-negotiator-us-salaries-are-not-normal-ly-distributed/
    estimatedIncome = Math.floor(20000 * standardDeviationsFromMean + 31099);

    if (estimatedIncome < 0) {
      estimatedIncome = 0;
    }

    if (estimatedIncome < 31099) {
      isPoor = true;
    }

    // We only emit a visualization event if we got some signal from the user
    if (K_INSTALLATION_MODE) {
      socket.emit("estimatedIncome", [estimatedIncome]);
    }
  }

  isPoorSFX.onStop.addOnce(mentalHealthQuantification);
  isNotPoorSFX.onStop.addOnce(mentalHealthQuantification);

  if (isPoor) {
    isPoorSFX.play();
  } else {
    isNotPoorSFX.play();
  }

  estimatedIncomeLabel.text = "estimated income: $" + estimatedIncome;
  estimatedIncomeLabel.position.x =
    userVideoGroup.x + userVideoSprite.x + userVideoSprite.width - 37;
  estimatedIncomeLabel.position.y = K_PROJECT_HEIGHT - 27;
  estimatedIncomeLabel.visible = true;

  wealthQuantificationComplete = true;
  finalPopSFX.play();

  // console.log(`Estimated income: $${estimatedIncome}`);
});

makeMultiFrameEvent(9703, 10176, () => {
  if (wealthQuantificationComplete) {
    if (isPoor) {
      drawPoorHatFilter(landmarks);
    } else {
      drawCrownFilter(landmarks);
    }
  }

  if (mentalHealthQuantificationComplete) {
    if (isMentallyIll) {
      drawThoughtBubbleFilter(landmarks, thoughtBubbleSad);
    } else {
      drawThoughtBubbleFilter(landmarks, thoughtBubbleHappy);
    }
  }

  if (selfImageQuantificationComplete) {
    if (isSelfLoathing) {
      drawProhibitedFilter(landmarks);
    } else {
      drawHeartEyesFilter(landmarks);
    }

    if (readyForBaseballCardCaptureFrame === null) {
      readyForBaseballCardCaptureFrame = frame;
    }
  }

  if (
    K_SHOW_BASEBALL_CARD &&
    !baseballCardPicCaptured &&
    landmarks &&
    readyForBaseballCardCaptureFrame !== null &&
    frame - readyForBaseballCardCaptureFrame > 5
  ) {
    // All the finale props have been added and 5 frames of safety have elapsed, so let's snap a pic of the user at the first frame where we have positive landmark detection
    baseballCardPicCaptured = true;

    // Deep copy the landmarks array
    // baseballCardLandmarks = JSON.parse(JSON.stringify(landmarks));

    // Get a centercut region of the user video
    // const drawScale = K_BASEBALL_CARD_SIZE / userVideo.height;
    // baseballCard.copy(userVideoSprite, Math.round((userVideo.width - userVideo.height) / 2), 0, userVideo.height, userVideo.height, 0, 0, undefined, undefined, undefined, undefined, undefined, drawScale, drawScale);
    // baseballCard.update();

    // The new wave - let's just copy the canvas and keep it simple
    // baseballCard.fill(0, 0, 0, 1.0);
    // baseballCard.draw("pizzaStamp", 0, K_PROJECT_HEIGHT, 1280, 704);

    baseballCard.draw("gradient1", 0, K_PROJECT_HEIGHT, 1280, 720);

    const userVideoScale = K_PROJECT_HEIGHT / userVideo.height;
    baseballCard.copy(
      game.canvas,
      (K_PROJECT_WIDTH - userVideo.width * userVideoScale) / 2,
      0,
      userVideo.width * userVideoScale,
      userVideo.height * userVideoScale,
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      1
    );

    let genderBiasText = "none";
    if (menPos !== null && womenPos !== null) {
      genderBiasText = preferMen
        ? `+${(menPos - womenPos).toFixed(6)} male`
        : `+${(womenPos - menPos).toFixed(6)} female`;
    }

    let raceBiasText = "none";
    if (whiteNegative !== null && nonWhiteNegative !== null) {
      const finalRaceBias = preferWhite
        ? nonWhiteNegative - whiteNegative
        : whiteNegative - nonWhiteNegative;
      raceBiasText = preferWhite
        ? `+${finalRaceBias.toFixed(6)} white`
        : `+${finalRaceBias.toFixed(6)} Black`;
    }

    const stoleMyFeelings = game.make.text(
      0,
      0,
      '"A.I. stole my feelings at \nwww.stealingurfeelin.gs" ',
      {
        font: "Arimo, sans-serif",
        strokeThickness: 5,
        fontStyle: "italic",
        fontSize: "50px",
        fontWeight: "bold",
        fill: "#00ffff",
        align: "left",
      }
    );
    stoleMyFeelings.lineSpacing = -10;
    stoleMyFeelings.setShadow(5, 5, "#000000");
    stoleMyFeelings.updateText();

    baseballCard.draw(stoleMyFeelings, 37, 10);

    const basex = K_PROJECT_HEIGHT;

    // baseballCard.text("\"A.I. stole my feelings @ www.stealingurfeelin.gs\"", 37, 57, "bold 38px Arimo", "rgb(255, 51, 204)", true);

    baseballCard.text(
      `likes dogs: ${likeDogs ? "yes" : "no"}`,
      37,
      basex + 57,
      "bold 30px Arimo",
      "rgb(255, 255, 0)",
      true
    );
    baseballCard.text(
      `likes kanye west: ${likeKanye ? "yes" : "no"}`,
      37,
      basex + 97,
      "bold 30px Arimo",
      "rgb(255, 255, 0)",
      true
    );
    baseballCard.text(
      `wants pizza: ${likePizza ? "yes" : "no"}`,
      37,
      basex + 137,
      "bold 30px Arimo",
      "rgb(255, 255, 0)",
      true
    );
    baseballCard.text(
      `gender bias: ${genderBiasText}`,
      37,
      basex + 177,
      "bold 30px Arimo",
      "rgb(255, 255, 0)",
      true
    );
    baseballCard.text(
      `racial bias: ${raceBiasText}`,
      37,
      basex + 217,
      "bold 30px Arimo",
      "rgb(255, 255, 0)",
      true
    );
    baseballCard.text(
      `estimated IQ: ${iq}`,
      37,
      basex + 257,
      "bold 30px Arimo",
      "rgb(255, 255, 0)",
      true
    );

    baseballCard.draw(
      "sufStamp",
      baseballCard.width - 200 - 37,
      baseballCard.height - 100 - K_BASEBALL_CARD_TEXT_FIELD_HEIGHT / 2,
      200,
      200
    );

    baseballCard.update();
  }
});

makeMultiFrameEvent(10176, 10177, () => {
  if (wealthQuantificationComplete) {
    if (isPoor) {
      drawPoorHatFilter(landmarks);
    } else {
      drawCrownFilter(landmarks);
    }
  }

  if (mentalHealthQuantificationComplete) {
    if (isMentallyIll) {
      drawThoughtBubbleFilter(landmarks, thoughtBubbleSad);
    } else {
      drawThoughtBubbleFilter(landmarks, thoughtBubbleHappy);
    }
  }

  if (selfImageQuantificationComplete) {
    if (isSelfLoathing) {
      drawProhibitedFilter(landmarks);
    } else {
      drawHeartEyesFilter(landmarks);
    }
  }

  const fadeHat = game.add
    .tween(poorHat)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  const fadeCrown = game.add
    .tween(crown)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  const fadeLeftHeart = game.add
    .tween(leftHeart)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  const fadeRightHeart = game.add
    .tween(rightHeart)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  const fadeLeftProhibited = game.add
    .tween(leftProhibited)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  const fadeRightProhibited = game.add
    .tween(rightProhibited)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  const fadeBubble = game.add
    .tween(isMentallyIll ? thoughtBubbleSad : thoughtBubbleHappy)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);

  const fadeIncomeLabel = game.add
    .tween(estimatedIncomeLabel)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  const fadeSelfLoathingLabel = game.add
    .tween(reactionToYourselfLabel)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  const fadeFacialAffectLabel = game.add
    .tween(facialAffectLabel)
    .to({ alpha: 0.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);

  userVideoProcessedSprite.alpha = 0.0;
  userVideoProcessedSprite.visible = true;

  const fadeInGreyscale = game.add
    .tween(userVideoProcessedSprite)
    .to({ alpha: 1.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);

  for (let i = 0; i < K_NUMBER_OF_LANDMARKS; i += 1) {
    landmarkText[i].alpha = 0.0;
    landmarkText[i].visible = true;

    const fadeInLandmarkText = game.add
      .tween(landmarkText[i])
      .to({ alpha: 1.0 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
  }

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 10211) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          userVideoGroup.position.x +
          userVideoProcessedSprite.position.x,
        y:
          landmarks[j][1] +
          userVideoGroup.position.y +
          userVideoProcessedSprite.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }
});

makeMultiFrameEvent(10177, 10392, () => {
  if (wealthQuantificationComplete) {
    if (isPoor) {
      drawPoorHatFilter(landmarks);
    } else {
      drawCrownFilter(landmarks);
    }
  }

  if (mentalHealthQuantificationComplete) {
    if (isMentallyIll) {
      drawThoughtBubbleFilter(landmarks, thoughtBubbleSad);
    } else {
      drawThoughtBubbleFilter(landmarks, thoughtBubbleHappy);
    }
  }

  if (selfImageQuantificationComplete) {
    if (isSelfLoathing) {
      drawProhibitedFilter(landmarks);
    } else {
      drawHeartEyesFilter(landmarks);
    }
  }

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          userVideoGroup.position.x +
          userVideoProcessedSprite.position.x,
        y:
          landmarks[j][1] +
          userVideoGroup.position.y +
          userVideoProcessedSprite.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }
});

makeMultiFrameEvent(10355, 10356, () => {
  // This is super hacky - we just reuse the userVideoProcessedSpriteLeftMask identifier to create
  // a new sprite using the alt bitmap data
  userVideoProcessedSpriteLeftMask = game.add.sprite(
    0,
    0,
    altUserVideoProcessedBMD
  );
  userVideoProcessedSpriteLeftMask.alpha = 0.0;
  userVideoProcessedSpriteLeftMask.scale.setTo(
    K_VIDEO_PROCESSING_DOWNRES_FACTOR,
    K_VIDEO_PROCESSING_DOWNRES_FACTOR
  );
  userVideoProcessedSpriteLeftMask.position = {
    x: K_PROJECT_WIDTH / 2 - userVideoSprite.width / 2,
    y: 0,
  };
  altUserVideoGroup.add(userVideoProcessedSpriteLeftMask);

  altUserVideoGroup.position.x = 0;
  altUserVideoGroup.position.y = 0;

  userVideoProcessedSpriteLeftMask.visible = true;
  altUserVideoGroup.visible = true;

  const fadeInBinarized = game.add
    .tween(userVideoProcessedSpriteLeftMask)
    .to({ alpha: 1.0 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false);

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 2125) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    altUserVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    altUserVideoProcessedBMD.update();

    altUserVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

      if (luma < 125) {
        return { r: 0, g: 0, b: 0, a: 255 };
      } else {
        return { r: 102, g: 102, b: 102, a: 255 };
      }
    }, this);
  }

  // To continue the greyscale/enumerated landmarks while the tween goes
  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          userVideoGroup.position.x +
          userVideoProcessedSprite.position.x,
        y:
          landmarks[j][1] +
          userVideoGroup.position.y +
          userVideoProcessedSprite.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }
});

makeMultiFrameEvent(10356, 10366, () => {
  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 2125) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    altUserVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    altUserVideoProcessedBMD.update();

    altUserVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

      if (luma < 125) {
        return { r: 0, g: 0, b: 0, a: 255 };
      } else {
        return { r: 102, g: 102, b: 102, a: 255 };
      }
    }, this);
  }

  // To continue the greyscale/enumerated landmarks while the tween goes
  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    userVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    userVideoProcessedBMD.update();

    userVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      return { r: luma, g: luma, b: luma, a: 255 };
    }, this);
  }

  if (landmarks) {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = true;
      landmarkText[j].position = {
        x:
          landmarks[j][0] +
          userVideoGroup.position.x +
          userVideoProcessedSprite.position.x,
        y:
          landmarks[j][1] +
          userVideoGroup.position.y +
          userVideoProcessedSprite.position.y,
      };
    }
  } else {
    for (let j = 0; j < K_NUMBER_OF_LANDMARKS; j += 1) {
      landmarkText[j].visible = false;
    }
  }
});

makeMultiFrameEvent(10366, 10367, () => {
  userVideoProcessedSprite.visible = false;

  for (let i = 0; i < K_NUMBER_OF_LANDMARKS; i += 1) {
    landmarkText[i].visible = false;
  }

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 2125) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    altUserVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    altUserVideoProcessedBMD.update();

    altUserVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

      if (luma < 125) {
        return { r: 0, g: 0, b: 0, a: 255 };
      } else {
        return { r: 102, g: 102, b: 102, a: 255 };
      }
    }, this);
  }
});

makeMultiFrameEvent(10367, 10388, () => {
  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 2125) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    altUserVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    altUserVideoProcessedBMD.update();

    altUserVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

      if (luma < 125) {
        return { r: 0, g: 0, b: 0, a: 255 };
      } else {
        return { r: 102, g: 102, b: 102, a: 255 };
      }
    }, this);
  }
});

makeMultiFrameEvent(10388, 10389, () => {
  boundingBox.clear();
  boundingBox.visible = true;

  finalBoundingBlinkTimer = game.time.create(false);

  finalBoundingBlinkTimer.loop(
    100,
    () => {
      boundingBox.visible = boundingBox.visible ? false : true;
    },
    this
  );

  finalBoundingBlinkTimer.start();

  if (landmarks) {
    const size = new Phaser.Line(
      landmarks[0][0],
      landmarks[0][1],
      landmarks[16][0],
      landmarks[16][1]
    ).length;
    const xPos =
      landmarks[33][0] +
      userVideoGroup.position.x +
      userVideoSprite.position.x -
      size / 2;
    const yPos =
      landmarks[33][1] +
      userVideoGroup.position.y +
      userVideoSprite.position.y -
      size / 2;
    boundingBox.position = { x: xPos, y: yPos };
    boundingBox.lineStyle(5, 0xff0000, 1);
    boundingBox.drawRect(0, 0, size, size);
  }

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 2125) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    altUserVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    altUserVideoProcessedBMD.update();

    altUserVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

      if (luma < 125) {
        return { r: 0, g: 0, b: 0, a: 255 };
      } else {
        return { r: 102, g: 102, b: 102, a: 255 };
      }
    }, this);
  }
});

makeMultiFrameEvent(10389, 10441, () => {
  boundingBox.clear();

  if (landmarks) {
    const size = new Phaser.Line(
      landmarks[0][0],
      landmarks[0][1],
      landmarks[16][0],
      landmarks[16][1]
    ).length;
    const xPos =
      landmarks[33][0] +
      userVideoGroup.position.x +
      userVideoSprite.position.x -
      size / 2;
    const yPos =
      landmarks[33][1] +
      userVideoGroup.position.y +
      userVideoSprite.position.y -
      size / 2;
    boundingBox.position = { x: xPos, y: yPos };
    boundingBox.lineStyle(5, 0xff0000, 1);
    boundingBox.drawRect(0, 0, size, size);
  }

  if (gameframe % K_VIDEO_PROCESSING_FRAME_INTERVAL === 0 || frame === 2125) {
    const s = (1 / K_VIDEO_PROCESSING_DOWNRES_FACTOR) * 1.5;
    altUserVideoProcessedBMD.copy(
      userVideoSprite,
      0,
      0,
      Math.floor(userVideo.width),
      Math.floor(userVideo.height),
      0,
      0,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      s,
      s,
      undefined,
      null,
      true
    );
    altUserVideoProcessedBMD.update();

    altUserVideoProcessedBMD.processPixelRGB((pixel) => {
      const luma = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

      if (luma < 125) {
        return { r: 0, g: 0, b: 0, a: 255 };
      } else {
        return { r: 102, g: 102, b: 102, a: 255 };
      }
    }, this);
  }
});

makeMultiFrameEvent(10441, 10442, () => {
  if (K_BETA) {
    let avgFps = 0;

    for (let i = 0; i < fpsSamples.length; i += 1) {
      avgFps += fpsSamples[i];
    }

    avgFps /= fpsSamples.length;

    let browser;
    let v;

    if (game.device.chrome) {
      browser = "Chrome";
      v = game.device.chromeVersion;
    } else if (game.device.firefox) {
      browser = "Firefox";
      v = game.device.firefoxVersion;
    } else if (game.device.safari) {
      browser = "Safari";
      v = game.device.safariVersion;
    } else {
      browser = "Other";
      v = 0;
    }

    const msg = `Plz snap a pic of this + email to: noahlevenson@gmail.com\n
			hardwareConcurrency: ${navigator.hardwareConcurrency}\n
			cv refresh rate: ${K_CV_REFRESH_INTERVAL}\n
			browser: ${browser}\n
			version: ${v}\n
			multithreading: ${K_MULTITHREADING}\n
			avg fps: ${avgFps.toFixed(0)}`;

    game.add.text(0, 0, msg, {
      font: "Arimo, sans-serif",
      fontSize: "14px",
      fill: "#000000",
      backgroundColor: "#ffff1a",
    });
  }

  userVideoProcessedSpriteLeftMask.visible = false;
  userVideoGroup.visible = false;
  boundingBox.clear();
  finalBoundingBlinkTimer.stop();

  creditTitle.position = {
    x: creditSqueezeOffset + K_PROJECT_WIDTH / 2,
    y: K_PROJECT_HEIGHT / 2,
  };

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(10442, 10606, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(10606, 10607, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(10625, 10626, () => {
  // If we successfully captured a baseball card from the user, let's create it and give it to them
  if (K_SHOW_BASEBALL_CARD && baseballCardPicCaptured) {
    creditSqueezeOffset = K_PROJECT_WIDTH / 4;
    creditTitle.setStyle(
      {
        font: "Arial, Helvetica, sans-serif",
        fontSize: "24px",
        fontWeight: "bold",
        fill: "#FFFFFF",
      },
      true
    );
    mozillaLogoWhite.scale.setTo(0.5, 0.5);

    const bcElement = document.getElementById("baseball-card");
    const dataurl = baseballCard.canvas.toDataURL();
    bcElement.width = Math.round(
      userVideo.width * (K_PROJECT_HEIGHT / userVideo.height)
    );
    bcElement.height = Math.round(
      userVideo.height * (K_PROJECT_HEIGHT / userVideo.height)
    );
    bcElement.src = dataurl;

    const bcAnchorElement = document.getElementById("baseball-card-download");
    bcAnchorElement.href = dataurl;

    const loader = new Phaser.Loader(game);
    loader.image("baseball-card", dataurl);

    loader.onLoadComplete.addOnce(() => {
      baseballCardSprite = game.add.sprite(0, 0, "baseball-card");
      baseballCardSprite.scale.setTo(0.5, 0.5);
      baseballCardSprite.anchor.setTo(0.5, 0.5);
      baseballCardSprite.position = {
        x: K_PROJECT_WIDTH / 4,
        y: K_PROJECT_HEIGHT / 2,
      };

      baseballCardSprite.inputEnabled = true;
      baseballCardSprite.input.useHandCursor = true;

      const instructionsText = game.add.text(
        0,
        0,
        "^^ click to download your personalized results ^^",
        {
          font: "Arimo, sans-serif",
          fontSize: "20px",
          fontWeight: "bold",
          fill: "#FFFFFF",
        }
      );
      instructionsText.anchor.setTo(0.5, 0.5);
      instructionsText.position = {
        x: K_PROJECT_WIDTH / 4,
        y: K_PROJECT_HEIGHT / 2 + baseballCardSprite.height / 2 + 24,
      };

      const instructionsTextBlinkTimer = game.time.create(false);

      instructionsTextBlinkTimer.loop(
        800,
        () => {
          instructionsText.visible = instructionsText.visible ? false : true;
        },
        this
      );

      instructionsTextBlinkTimer.start();

      baseballCardSprite.events.onInputDown.add(() => {
        bcAnchorElement.click();
      }, this);

      baseballCardSprite.events.onInputOver.add(() => {
        baseballCardSprite.tint = 0xa6a6a6;
      }, this);

      baseballCardSprite.events.onInputOut.add(() => {
        baseballCardSprite.tint = 0xffffff;
      }, this);
    });

    loader.start();
  }

  creditTitle.text = `starring\nYOU\n\n(who ${
    likeDogs ? "likes" : "doesn't like"
  } dogs,\n${likeKanye ? "likes" : "doesn't like"} Kanye,\nand ${
    likePizza ? "wants" : "doesn't want"
  } some pizza)`;

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(10626, 10718, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(10718, 10719, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(10737, 10738, () => {
  creditTitle.text = "executive producer\nBRETT GAYLOR";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(10738, 10831, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(10831, 10832, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(10850, 10851, () => {
  creditTitle.text = "AR character artist\nASHER LEVENSON";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(10851, 10943, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(10943, 10944, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(10962, 10963, () => {
  creditTitle.text = "designer\nANA SANCHEZ\n\nlogo animation\nDAVID ACAMPORA";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(10963, 11056, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11056, 11057, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11075, 11076, () => {
  creditTitle.text =
    "editor\nNELSON VAN HOE\n\nassistant editor\nERIE CULKOWSKI";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11076, 11168, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11168, 11169, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11187, 11188, () => {
  creditTitle.text = "narrator\nNOAH LEVENSON";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11188, 11281, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11281, 11282, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11300, 11301, () => {
  creditTitle.text = "re-recording mixer\nMARC DICENZO";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11301, 11393, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11393, 11394, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11412, 11413, () => {
  creditTitle.text =
    "app users\nTHE ACE FAMILY SNAPCHAT\nHELPVIDEOSTV\nYING MA\nCHRISTINA LORRE'";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11413, 11507, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11507, 11508, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11526, 11527, () => {
  creditTitle.text = "associate producers\nALLYSSA AGRO\nKATIE BOLAND";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11527, 11617, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11617, 11618, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11637, 11638, () => {
  creditTitle.text =
    "for mozilla\nJENN BEARD\nLINDSEY FROST\nKEVIN ZAWACKI\n\nfor harmony labs\nMARY JOYCE\nH PAUL JOHNSON";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11638, 11730, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11730, 11731, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11749, 11750, () => {
  creditTitle.text =
    "catering\nPIZZERIA LA ROSA\n\nexperiential fabrication\nOTTAVIO'S WOODWORKING\n\npublicity\nPKPR";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11750, 11842, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11842, 11843, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11861, 11862, () => {
  creditTitle.text =
    "special thanks\nAMANDA CULKOWSKI\nJENNA XU\nNIC MONTANARO\nERIK LEE SNYDER\nALEC COIRO\nKURSTEN BRACCHI";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11862, 11955, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(11955, 11956, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(11974, 11975, () => {
  creditTitle.text = "a BRONX RIVER ADVENTURES project";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(11975, 12067, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(12067, 12068, () => {
  creditTitle.visible = false;
});

makeMultiFrameEvent(12086, 12087, () => {
  mozillaLogoWhite.position = {
    x: creditSqueezeOffset + K_PROJECT_WIDTH / 2,
    y: K_PROJECT_HEIGHT / 2,
  };

  if (landmarks) {
    mozillaLogoWhite.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  mozillaLogoWhite.visible = true;
});

makeMultiFrameEvent(12087, 12181, () => {
  if (landmarks) {
    mozillaLogoWhite.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(12181, 12182, () => {
  mozillaLogoWhite.visible = false;
});

makeMultiFrameEvent(12198, 12199, () => {
  creditTitle.text = "MADE IN NEW YORK CITY © 2019 A.D.";

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }

  creditTitle.visible = true;
});

makeMultiFrameEvent(12199, 12318, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(12318, 12319, () => {
  game.camera.fade(0x000000, 1000);

  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});

makeMultiFrameEvent(12319, 12402, () => {
  if (landmarks) {
    creditTitle.position = {
      x:
        creditSqueezeOffset +
        K_PROJECT_WIDTH -
        landmarks[33][0] -
        (K_PROJECT_WIDTH - userVideoSprite.width) / 2,
      y: landmarks[33][1],
    };
  }
});
