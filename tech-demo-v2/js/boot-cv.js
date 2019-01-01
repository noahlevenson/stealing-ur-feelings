const bootCVState = {
	create: function() {
		clmTrack = new clm.tracker();
		clmTrack.init();

		ec = new emotionClassifier();
		ec.init(emotionModel);
		emotionData = ec.getBlank();		

		game.state.start("play");
	}
};