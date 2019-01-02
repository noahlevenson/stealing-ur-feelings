const bootState = {
	preload: function() {
		// Eventually do things here
	}, 

	create: function() {
		delete emotionModel["disgusted"];
		delete emotionModel["fear"];
		
		// game.time.advancedTiming = true;
		// game.time.desiredFps = 30; 

		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.maxWidth = "100%";
		game.scale.maxHeight = "100%";
		// game.renderer.renderSession.roundPixels = true;  
		// Phaser.Canvas.setImageRenderingCrisp(game.canvas);  

		// Create the user video object and initialize webcam stream
		userVideo = game.add.video();
		userVideo.startMediaStream();

		game.physics.startSystem(Phaser.Physics.ARCADE);

		userVideo.onError.addOnce(() => {
			// The user has refused webcam access - let's tell them they cannot watch without doing so and halt the experience
		}, this);

		userVideo.onAccess.addOnce(() => {
			// TODO: gracefully handle user video errors (pause the experience and display error message?)
			userVideo.onError.removeAll();
			game.state.start("load");
		}, this);		
	}
};