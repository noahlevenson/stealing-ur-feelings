const bootCVState = {
  create: function () {
    // const initText = game.add.text(K_PROJECT_WIDTH / 2, K_PROJECT_HEIGHT / 2, "Initializing assets 1/3", {font: "Arimo, sans-serif", fontSize: "32px", fill: "#FFFFFF"});
    // initText.anchor.setTo(0.5, 0.5);

    // const dotText = game.add.text(K_PROJECT_WIDTH / 2 + (initText.width / 2) + 20, K_PROJECT_HEIGHT / 2 - (initText.height / 2), ".", {font: "Arimo, sans-serif", fontSize: "32px", fill: "#FFFFFF"});

    // const animInterval = setInterval(() => {
    // 	if (dotText.text === ".") {
    // 		dotText.text = "..";
    // 	} else if (dotText.text === "..") {
    // 		dotText.text = "...";
    // 	} else if (dotText.text === "...") {
    // 		dotText.text = "";
    // 	} else if (dotText.text === "") {
    // 		dotText.text = ".";
    // 	}
    // }, 500);

    if (!K_MULTITHREADING) {
      loadGfx = game.add.graphics(0, 0);

      loadGfx.beginFill(0x8c8c8c, 1);
      loadGfx.drawRect(
        game.world.centerX - 300,
        game.world.centerY - 100,
        600,
        20
      );

      const detectorModel =
        faceapi.nets.tinyFaceDetector.loadFromUri("lib/models");

      detectorModel.then(() => {
        // initText.text = "Initializing assets 2/3";

        loadGfx.clear();
        loadGfx.beginFill(0x8c8c8c, 1);
        loadGfx.drawRect(
          game.world.centerX - 300,
          game.world.centerY - 100,
          600,
          20
        );
        loadGfx.beginFill(0xffffff, 1);
        loadGfx.drawRect(
          game.world.centerX - 300,
          game.world.centerY - 100,
          200,
          20
        );

        const landmarkModel =
          faceapi.nets.faceLandmark68TinyNet.loadFromUri("lib/models");

        landmarkModel.then(() => {
          // initText.text = "Initializing assets 3/3";

          loadGfx.clear();
          loadGfx.beginFill(0x8c8c8c, 1);
          loadGfx.drawRect(
            game.world.centerX - 300,
            game.world.centerY - 100,
            600,
            20
          );
          loadGfx.beginFill(0xffffff, 1);
          loadGfx.drawRect(
            game.world.centerX - 300,
            game.world.centerY - 100,
            400,
            20
          );

          const expressionModel =
            faceapi.nets.faceExpressionNet.loadFromUri("lib/models");

          expressionModel.then(() => {
            // clearInterval(animInterval);

            // Shader compilation isn't triggered until we make the first call to faceapi that positively detects a face
            // And shader compilation takes a few seconds and it blocks the main thread
            // So we create a temporary dummy clmCanvas from an image that definitely has a face, and use it to make the first
            // faceapi call here, so we don't block the main thread and lock the UI when we enter validate state
            clmCanvas = game.add.bitmapData(
              Math.round(640 / K_FACE_CV_DOWNRES_FACTOR),
              Math.round(480 / K_FACE_CV_DOWNRES_FACTOR)
            );
            clmCanvas.copy(
              "don",
              0,
              0,
              640,
              480,
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

            loadGfx.clear();
            loadGfx.beginFill(0x8c8c8c, 1);
            loadGfx.drawRect(
              game.world.centerX - 300,
              game.world.centerY - 100,
              600,
              20
            );
            loadGfx.beginFill(0xffffff, 1);
            loadGfx.drawRect(
              game.world.centerX - 300,
              game.world.centerY - 100,
              500,
              20
            );

            const options = new faceapi.TinyFaceDetectorOptions({
              inputSize: 160,
              scoreThreshold: 0.5,
            });
            const detections = faceapi
              .detectSingleFace(clmCanvas.canvas, options)
              .withFaceLandmarks(true)
              .withFaceExpressions();

            detections.then((dets) => {
              loadGfx.clear();
              loadGfx.beginFill(0x8c8c8c, 1);
              loadGfx.drawRect(
                game.world.centerX - 300,
                game.world.centerY - 100,
                600,
                20
              );
              loadGfx.beginFill(0xffffff, 1);
              loadGfx.drawRect(
                game.world.centerX - 300,
                game.world.centerY - 100,
                600,
                20
              );

              clmCanvas.destroy();
              game.state.start("validate");
            });
          });
        });
      });
    } else {
      // clearInterval(animInterval);
      game.state.start("validate");
    }
  },
};
