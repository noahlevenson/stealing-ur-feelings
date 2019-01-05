const bootCVState = {
	create: function() {
		const initText = game.add.text(K_PROJECT_WIDTH / 2, K_PROJECT_HEIGHT / 2, "Initializing assets 1/3", {fontSize: "32px", fill: "#FFFFFF"});
		initText.anchor.setTo(0.5, 0.5);

		const dotText = game.add.text(K_PROJECT_WIDTH / 2 + (initText.width / 2) + 20, K_PROJECT_HEIGHT / 2 - (initText.height / 2), ".", {fontSize: "32px", fill: "#FFFFFF"});

		const animInterval = setInterval(() => {
			if (dotText.text === ".") {
				dotText.text = "..";
			} else if (dotText.text === "..") {
				dotText.text = "...";
			} else if (dotText.text === "...") {
				dotText.text = "";
			} else if (dotText.text === "") {
				dotText.text = ".";
			}
		}, 500);

		const detectorModel = faceapi.loadSsdMobilenetv1Model("../tech-demo-v2/lib/models")
		// faceapi.loadTinyFaceDetectorModel("../lib/models")

		detectorModel.then(() => {
			initText.text = "Initializing assets 2/3";

			const landmarkModel = faceapi.loadFaceLandmarkModel("../tech-demo-v2/lib/models");

			landmarkModel.then(() => {
				initText.text = "Initializing assets 3/3";

				const expressionModel = faceapi.loadFaceExpressionModel("../tech-demo-v2/lib/models");

				expressionModel.then(() => {
					clearInterval(animInterval);
					game.state.start("play");
				});
			});
		});
	}
};