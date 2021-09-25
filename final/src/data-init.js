const dataInitState = {
	create: function() {
		questionMarks = [];
		deserveAds = [];
		lastKnownFaceBounding = {x: null, y: null, size: null};
		recordedLandmarkText = new Array(K_NUMBER_OF_LANDMARKS);
		zuckAlertBoxPosition = {x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2};
		wealthQuantificationComplete = mentalHealthQuantificationComplete = selfImageQuantificationComplete = false;

		baseballCardPicCaptured = false;
		readyForBaseballCardCaptureFrame = null;
		creditSqueezeOffset = 0;

		likeDogs = true;
		preferMen = false;
		likeKanye = true;
		likePizza = true;
		preferWhite = false;
		wayOverYourHead = false;
		iq = 100;
		estimatedIncome = 31099;
		isPoor = false
		isMentallyIll = false;
		isSelfLoathing = false;

		menPos = womenPos = null;
		dogPos = dogNeg = null;
		kanyePos = kanyeNeg = null;
		whiteNegative = nonWhiteNegative = finalRaceBias = null;
		democratPct = republicanPct = null;

		landmarkText = new Array(K_NUMBER_OF_LANDMARKS);

		let viewerFaceData = [];

		for (let i = 0; i < filmEventList.length; i += 1) {
			if (filmEventList[i]) {
				filmEventList[i].activated = false;
			}
		}

		game.state.start("play");
	}
};