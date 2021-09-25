// Debug mode
const K_DEBUG = false;
const K_DEBUG_SEEK_TIME = 60;
const K_DEBUG_LOG_ALL_FRAMES = false;
const K_DEBUG_SHOW_FRAMECODE = false;
const K_DEBUG_FRAMECODE_SCALE = 10;

// Mute all sounds (for sanity during debugging)
const K_MUTE = false;

// Debug objects 
let framecodeSprite, pauseKey, frameQueryKey;

// Beta tester mode
const K_BETA = false;
const fpsSamples = [];

// Our projects dimensions (HD 1080p pushes 2.1m pixels, HD 720p pushes < 1m pixels)
// Unfortunately we used so many dumb magic numbers that changing dimensions won't work without significant tweaks
const K_PROJECT_WIDTH = 1280;
const K_PROJECT_HEIGHT = 720;
const K_PROJECT_ASPECT_RATIO = K_PROJECT_WIDTH / K_PROJECT_HEIGHT;

// Enables the data service for broadcasting to external data visualizations
// As seen at the 2019 Tribeca Film Festival!
const K_INSTALLATION_MODE = false;
let socket = null;

// Should we integrate the interactive call to action to sign Mozilla's petition at the end of the film?
const K_PETITION = true;
let redirectionInitiated = false;
let petitionFrame = 0;
let petitionSmileGfx, redirectingText, noPetitionFaceDetectedText, userFailedToSmileTimeout;

// Are we running on a mobile device?
let K_MOBILE = false;

// Mobile devices require some extra UX junk
let mobileTapText = null;

// Does the user have to click to play media? As of 7/2019, it seems
// the only desktop browser requiring this is Safari
let K_USER_MUST_INITIATE_VIDEO = false;
let playButton;

// For the debounce associated with positive landmark detection during validate state
const K_VALIDATE_DEBOUNCE_DELAY = 1000;
let debounceHandle = null;

// Number of particles to release during emoji explosion events
// Larger numbers here can tank FPS
const K_EMOJI_EXPLOSION_PARTICLES = 100;

// Bit width of the framecodes we're using
// This is a relic from early days - we don't actually support bit widths other than 16
const K_FRAMECODE_BIT_DEPTH = 16;

// Number of landmarks fitted by our facial pose estimation model
const K_NUMBER_OF_LANDMARKS = 68;

// How often should we call getFrame() to get sync with the video asset?
// A value of 1 means we call getFrame() every iteration of the main update loop
// Values other than 1 do weird things
const K_GET_OPTICAL_SYNC_INTERVAL = 1;

// Use webworkers to run the CV engine on another thread? This gives huge performance benefits
// on mid and low end machines, but requires OffscreenCanvas for zero copy transfer - currently 
// (as of 06/2019) implemented only in Chrome by default, and available in Firefox behind a flag
// Note that as of 07/2019, Firefox's experimental implementation still lacks the required 2D context support
let K_MULTITHREADING = true;
let cvWorker = null;

// Should we play the logo animation? On low end machines, the logo animation locks the UI
// we'll programatically set this to false during initialization
let K_LOGO_ANIMATION = true;

// This is a relic - best to leave it alone
const K_RUN_CV_ASYNC = false;

// Global refresh rate for all computer vision processes
let K_CV_REFRESH_INTERVAL = 4;

// Refresh rate for certain AR props
const K_AR_FRAME_INTERVAL = 1;

// The factor by which we downres the user video sprite before CV operations
const K_FACE_CV_DOWNRES_FACTOR = 1;

// The factor by which we downres the user video sprite for image processing effects
// Smaller numbers here can seriously tank FPS
const K_VIDEO_PROCESSING_DOWNRES_FACTOR = 4;

// Refresh rate for video processing effects like binarization and luma conversion
const K_VIDEO_PROCESSING_FRAME_INTERVAL = 1;

// Points describe paths in our landmarks array to draw corresponding features
const K_FACE_OUTLINE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const K_FACE_MOUTH_OUTER = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 48];
const K_FACE_MOUTH_INNER_TOP = [60, 61, 62, 63, 64];
const K_FACE_MOUTH_INNER_BOTTOM = [60, 67, 66, 65, 64];  
const K_FACE_SEPTUM = [27, 28, 29, 30];
const K_FACE_NOSE = [31, 32, 33, 34, 35];
const K_FACE_LEFT_EYE = [36, 37, 38, 39, 40, 41, 36];
const K_FACE_RIGHT_EYE = [42, 43, 44, 45, 46, 47, 42];
const K_FACE_LEFT_BROW = [17, 18, 19, 20, 21];
const K_FACE_RIGHT_BROW = [22, 23, 24, 25, 26];

// For creating fake document hack to get tensorflow and face-api.js functioning in a webworker
let screenCopy, visualViewportCopy, styleMediaCopy, fakeWindow, fakeDocument;

// For our shareable "baseball card" generated for each user
let K_SHOW_BASEBALL_CARD = true;
const K_BASEBALL_CARD_TEXT_FIELD_HEIGHT = 300;
let baseballCardPicCaptured = false;
let readyForBaseballCardCaptureFrame = null;
let baseballCard;
let baseballCardSprite;
let creditSqueezeOffset = 0;

// Global identifiers for media elements
// Could we have done this better? You bet
let theWayISeeYouTitle, standbyForAIVisionTitle, pizzaTitle, pizzaBias, kanyeTitle, kanyeBias, genderStatsBias, threeTitle, 
	twoTitle, oneTitle, techQuizTitle, youLikeDogsSFX, youDontLikeDogsSFX, youPreferMenSFX, youPreferWomenSFX, dogEmojiEmitter, dogStats;
let questionMarks = [];
let adGfx;
let deserveAds = [];
let gradient1Sprite, pictureFrameSprite, userPhotoSprite;
let lastKnownFaceBounding = {x: null, y: null, size: null};
let userPhotoZoomTimer;
let userPhotoBMD;
let userPhotoScale;
let pixelValuesGroup;
let midgroundGroup;
let gradientBackgroundGroup;
let museumCardSprite;
let actualImagesUsedToTrainTitle;
let trainingImageCelebrityTitle;
let userVideoProcessedSpriteLeftMask;
let altUserVideoGroup;
let gradient2Sprite;
let recordedFeatureGroup;
let recordedLandmarkText = new Array(K_NUMBER_OF_LANDMARKS);
let landmarkPlaybackTimer;
let recordingOfYourFaceTitle;
let instructionsTitle;
let instructionsBlinkTimer;
let gradient3Sprite;
let yourMouthShapeTitle;
let mouthModel;
let mouthPlaybackTimer;
let mouthQuantificationTitle;
let noTitle;
let noBlinkTimer;
let raceStatsBias;
let youPreferWhitePeopleSFX, youPreferBlackPeopleSFX;
let higherOrderQuantificationTitle;
let higherOrderQuantificationLeftLabel, higherOrderQuantificationRightLabel;
let higherOrderQuantificationLeftPercent, higherOrderQuantificationRightPercent;
let springStudiosMap;
let mapGroup;
let mapGfx;
let mapUserLabel;
let mapEmotionLabel;
let screenSpaceUserLocation;
let mapBlinkTimer;
let dogNose, dogEars;
let headPhysicsSprite;
let snapchatEmojiEmitter;
let applauseEmojiEmitter;
let estimatedIQTitle;
let iqStatTitle;
let thatPartBitSFX, thatpartWaySFX;
let isPoorSFX, isNotPoorSFX;
let isMentallyIllSFX, isNotMentallyIllSFX;
let isSelfLoathingSFX, isNotSelfLoathingSFX;
let altUserVideoProcessedBMD;
let finalOverlayGroup;
let finalBoundingBlinkTimer;
let logoSprite, logoAnimationTimer;
let dogLoopVideo, dogLoopSprite;
let validateFrame = 0;
let sunglasses;
let readyToPlay = hasStarted = false;
let tophat, monocle, mustache, tophatGroup;
let fullScreenButton;
let pixelatedUserFaceBMD, pixelatedUserFaceSprite;
let userVideoSpriteScale;
let kachingSFX;
let dollarEmitter;
let userFaceRawEmotionsText;
let computerDesktop, mouseCursor, doubleClickSFX;
let disney, twentiethCenturyFox, kelloggsCornFlakes, yourLocalPizzeria, forYourNextJob;
let zuckScreenSpaceBMD, zuckScreenSpaceSprite;
let zuckAlertBoxPosition = {x: K_PROJECT_WIDTH / 2, y: K_PROJECT_HEIGHT / 2};
let poorHat, crown, leftHeart, rightHeart, leftProhibited, rightProhibited;
let wealthQuantificationComplete = mentalHealthQuantificationComplete = selfImageQuantificationComplete = false;
let estimatedIncomeLabel, facialAffectLabel, reactionToYourselfLabel;
let finalPopSFX;
let thoughtBubbleHappy, thoughtBubbleSad;
let creditTitle;
let mozillaLogoWhite;
let faceCameraAndCheckLighting, pressRedButtonToStart;
let notValidatedTimer, validatedTimer;
let patentBoxTimer;

// This describes the dimensions of the square element you sometimes see that has text inside it
const K_TEXT_BOX_SIZE = 375;

// And here's some global identifiers for those text boxes
let dogTextBox, genderTextBox, raceTextBox, higherOrderTextBoxLeft, higherOrderTextBoxRight;
let allTextBoxesGroup, inFrontOfTextBoxGroup, behindTextBoxesGroup;

// Global identifiers for the values associated with our binary classification events
let likeDogs = true;
let preferMen = false;
let likeKanye = true;
let likePizza = true;
let preferWhite = false;
let wayOverYourHead = false;
let isPoor = false
let isMentallyIll = false;
let isSelfLoathing = false;

// Other values associated with our classification events
let iq = 100;
let estimatedIncome = 31099;
let menPos = womenPos = null;
let dogPos = dogNeg = null;
let kanyePos = kanyeNeg = null;
let whiteNegative = nonWhiteNegative = finalRaceBias = null;
let democratPct = republicanPct = null;

// For framecode sync system
let frameCanvas, frame, lastFrame;

// gameframe is the framecount according to the game engine - IE, the number of times the main
// game loop has iterated. Not to be confused with 'frame', which is the current frame as
// determined by getFrame(), which reads a framecode off of our video asset
let gameframe = 0;

// Refs to video objects
let userVideo, filmVideo;

// Refs to video sprites
let userVideoSprite, filmSprite, cvSprite;

// Sprite masks
let userVideoMaskQuarterRight, userVideoMaskQuarterLeft;

// For graphics objects rendering
let boundingBox, faceModel, emotionChart, dimmerScreen;

// For text rendering
let landmarkText = new Array(K_NUMBER_OF_LANDMARKS);

// More text rendering
let userVideoStatusText, angryLabelText, sadLabelText, surprisedLabelText, happyLabelText;

// For creating backplate to correct user video aspect ratio
let userVideoBackplateBMD, userVideoBackplateSprite;

// For facial landmark and emotion detection
let landmarks, clmCanvas, emotions;

// For user video image processing effects
let userVideoProcessedBMD, userVideoProcessedSprite;

// User video aspect ratio
let userVideoAspect;

// Groups for things that need groups
let userVideoGroup, filmGroup, overlayGroup, textGroup, landmarkGroup;

// For loading bar
let loadGfx;

// Managing state
let activated = false;
let startTime = 0;

// Should we run computations to collect viewer facial landmarks vectors?
let getLandmarks = true;

// Should we run computations to collect user emotions?
let getEmotions = false;

// Identifier for each playthrough's instanced array of viewerFaceDataStruct
let validationStateFaceData = [];
let viewerFaceData = [];

// Data structure for collecting user face data (landmarks and/or emotions)
function viewerFaceDataStruct(frame = null, l = null, x = null) {
	this.frame = frame;
	this.landmarks = null;
	this.neutral = null;
	this.happy = null;
	this.sad = null;
	this.angry = null;
	this.fearful = null;
	this.disgusted = null;
	this.surprised = null;

	if (l) {
		this.landmarks = new Array();
		this.length = l.length;

		for (let i = 0; i < this.length; i += 1) {
			const landmark = l[i];
			this.landmarks.push([landmark[0], landmark[1]]);
		}
	}

	if (x) {
		this.neutral = x["neutral"];
		this.happy = x["happy"]; 
		this.sad = x["sad"]; 
		this.angry = x["angry"]; 
		this.fearful = x["fearful"]; 
		this.disgusted = x["disgusted"];
		this.surprised = x["surprised"];
	}
}

function getAveragePositiveEmotions(emotionDataArray, startFrame, endFrame) {
	if (emotionDataArray.length > 0) {
		let acc = 0;
		let n = 0;

		for (let i = 0; i < emotionDataArray.length; i += 1) {
			if (emotionDataArray[i].frame >= startFrame && emotionDataArray[i].frame < endFrame && emotionDataArray[i].happy) {
				acc += emotionDataArray[i].happy;
				n += 1;
			}
		}

		if (n > 0) {
			return acc / n;
		}
	}
	
	return null;
} 

function getAverageNegativeEmotions(emotionDataArray, startFrame, endFrame) {
	if (emotionDataArray.length > 0) {
		let acc = 0;
		let n = 0;

		for (let i = 0; i < emotionDataArray.length; i += 1) {
			if (emotionDataArray[i].frame >= startFrame && emotionDataArray[i].frame < endFrame && emotionDataArray[i].sad) {
				acc += emotionDataArray[i].sad + emotionDataArray[i].angry + emotionDataArray[i].fearful + emotionDataArray[i].disgusted;
				n += 4;
			}
		}

		if (n > 0) {
			return acc / n;
		}
	}

	return null;
}

// Set up the game engine!
const cfg = {
	width: K_PROJECT_WIDTH,
	height: K_PROJECT_HEIGHT,
	multiTexture: false,
	parent: "the-film",
	enableDebug: false, // Remember to flip this for production
	renderer: Phaser.CANVAS,
	antialias: true,
};

Phaser.Device.onInitialized.add((device) => {
	// Profile the host and make set things accordingly
	// TODO: Validate specific browser versions and capabilities
	if ((device.iOS && device.mobileSafari && navigator.userAgent.includes("CriOS")) || (device.iOS && device.mobileSafari && navigator.userAgent.includes("FxiOS")) || device.edge || device.ie) {
		game.state.start("unsupportedBrowser");
	} else {
		if (device.mobileSafari) {
			K_SHOW_BASEBALL_CARD = false;
		}

		if (device.safari || device.mobileSafari || device.iOS || device.android) {
			K_USER_MUST_INITIATE_VIDEO = true;
		}

		if (!device.desktop) {
			K_MOBILE = true;
		}

		if (device.chrome) {
			K_MULTITHREADING = true;

			if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
				K_CV_REFRESH_INTERVAL = 8;
			}
		} else {
			K_MULTITHREADING = false;

			if (!navigator.hardwareConcurrency || navigator.hardwareConcurrency < 8) {
				K_CV_REFRESH_INTERVAL = 8;
				K_LOGO_ANIMATION = false;
			}
		}

		// console.log(device);
		// console.log(`multithreading: ${K_MULTITHREADING}, cv refresh rate: ${K_CV_REFRESH_INTERVAL}`);

		if (K_INSTALLATION_MODE) {
			socket = io("http://localhost:8000");
		}

		// Pilfered code that, in combination with code in the worker, tricks
		// tensorflow and face-api.js into thinking it's not running in a worker
		// Credit to jeffreytgilbert on github: https://github.com/justadudewhohacks/face-api.js/issues/47
		if (K_MULTITHREADING) {
			screenCopy = {};

			for(let key in screen){
				screenCopy[key] = +screen[key];
			}

			screenCopy.orientation = {};

			for(let key in screen.orientation){
				if (typeof screen.orientation[key] !== 'function') {
					screenCopy.orientation[key] = screen.orientation[key];
				}
			}

			visualViewportCopy = {};

			if (typeof window['visualViewport'] !== 'undefined') {
				for(let key in visualViewport){
					if(typeof visualViewport[key] !== 'function') {
						visualViewportCopy[key] = +visualViewport[key];
					}
				}
			}

			styleMediaCopy = {};

			if (typeof window['styleMedia'] !== 'undefined') {
				for(let key in styleMedia){
					if(typeof styleMedia[key] !== 'function') {
						styleMediaCopy[key] = styleMedia[key];
					}
				}
			}

			fakeWindow = {};

			Object.getOwnPropertyNames(window).forEach(name => {
				try {
					if (typeof window[name] !== 'function'){
						if (typeof window[name] !== 'object' && 
							name !== 'undefined' && 
							name !== 'NaN' && 
							name !== 'Infinity' && 
							name !== 'event' && 
							name !== 'name' 
						) {
							fakeWindow[name] = window[name];
						} else if (name === 'visualViewport') {
							// console.log('want this?', name, JSON.parse(JSON.stringify(window[name])));
						} else if (name === 'styleMedia') {
							// console.log('want this?', name, JSON.parse(JSON.stringify(window[name])));
						}
					}
				} catch (ex){
					// console.log('Access denied for a window property');
				}
			});

			fakeWindow.screen = screenCopy;
			fakeWindow.visualViewport = visualViewportCopy;
			fakeWindow.styleMedia = styleMediaCopy;
			// console.log(fakeWindow);

			fakeDocument = {};

			for(let name in document){
				try {
					if(name === 'all') {
						// o_O
					} else if (typeof document[name] !== 'function' && typeof document[name] !== 'object') {
							fakeDocument[name] = document[name];
					} else if (typeof document[name] === 'object') {
						fakeDocument[name] = null;
					} else if(typeof document[name] === 'function') {
						fakeDocument[name] = { type:'*function*', name: document[name].name };
					}
				} catch (ex){
					// console.log('Access denied for a window property');
				}
			}
		}

		// Should this be moved to boot-cv?
		if (K_MULTITHREADING) {
			cvWorker = new Worker("js/cv-worker.min.js");
			cvWorker.postMessage({fakeWindow: fakeWindow, fakeDocument: fakeDocument, opcode: 0});
		}

		game.state.start("boot");
	}
});

const game = new Phaser.Game(cfg);

game.state.add("unsupportedBrowser", unsupportedBrowserState);
game.state.add("boot", bootState);
game.state.add("load", loadState);
game.state.add("bootcv", bootCVState);
game.state.add("validate", validateState);
game.state.add("dataInit", dataInitState);
game.state.add("play", playState);
game.state.add("petition", petitionState);
