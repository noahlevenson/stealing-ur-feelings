const unsupportedBrowserState = {
	create: function() {
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

		let suggestedBrowsers = "Firefox";
		let fsize = "20px";
		let hsize = "24px";
		
		if (game.device.desktop && (game.device.windows || game.device.linux)) {
			suggestedBrowsers = "Firefox or Chrome";
		} else if (game.device.desktop && game.device.macOS) {
			suggestedBrowsers = "Firefox, Chrome, or Safari";
		} else if (game.device.iOS) {
			suggestedBrowsers = "Safari";
			fsize = "40px";
			hsize = "48px";
		} else if (game.device.android) {
			suggestedBrowsers = "Firefox or Chrome";
			fsize = "40px";
			hsize = "48px";
		}

		const unsupportedText = game.add.text(0, 0, `STEALING UR FEELINGS doesn't work with this browser. For this device, please use ${suggestedBrowsers}.`, {font: "Arimo, sans-serif", fontSize: fsize, fontWeight: "bold", fill: "#FFFFFF"});
		unsupportedText.wordWrapWidth = 710;
		unsupportedText.wordWrap = true;
		unsupportedText.anchor.setTo(0.5, 0.5);
		unsupportedText.position = {x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2};

		const unsupportedTextHeader = game.add.text(0, 0, "unsupported browser:", {font: "Arimo, sans-serif", fontSize: hsize, fontWeight: "bold", fill: "#eb4034"});
		unsupportedTextHeader.position = {x: unsupportedText.position.x - (unsupportedText.width / 2), y: unsupportedText.y - (unsupportedText.height / 2) - (fsize === "20px" ? 35 : 70)};
	}
};