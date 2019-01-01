// Debug mode
const K_DEBUG = true;
const K_DEBUG_SEEK_TIME = 30;
const K_DEBUG_LOG_ALL_FRAMES = false;
const K_DEBUG_SHOW_FRAMECODE = false;
const K_DEBUG_FRAMECODE_SCALE = 10;

// Debug objects
let framecodeSprite, pauseKey, frameQueryKey;

// Constants for our project's dimensions - the tech demo is 16:9, but maybe we'll shoot the final piece anamorphic
const K_PROJECT_WIDTH = 1920;
const K_PROJECT_HEIGHT = 1080;
const K_PROJECT_ASPECT_RATIO = K_PROJECT_WIDTH / K_PROJECT_HEIGHT;

// Bit depth of the framecodes we're using
const K_FRAMECODE_BIT_DEPTH = 16;

// Number of landmarks fitted by our facial pose estimation model
const K_NUMBER_OF_LANDMARKS = 71;

// Framewise update frequency for AR props
const K_AR_FRAME_INTERVAL = 1;

// The factor by which we downres the user video sprite for image processing effects
// This gives us an important performance boost and also creates desirable pixelation
const K_VIDEO_PROCESSING_DOWNRES_FACTOR = 4;

// Framewise update frequency for image processing effects
const K_VIDEO_PROCESSING_FRAME_INTERVAL = 4;

// Points describe paths in our landmarks array to draw corresponding features
const K_FACE_OUTLINE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const K_FACE_MOUTH = [44, 45, 46, 47, 48, 49, 50, 59, 60, 61, 44, 56, 57, 58, 50, 51, 52, 53, 54, 55, 44];
const K_FACE_SEPTUM = [33, 41, 62];
const K_FACE_NOSE = [34, 35, 36, 42, 37, 43, 38, 39, 40];
const K_FACE_LEFT_EYE = [23, 63, 24, 64, 25, 65, 26, 66, 23];
const K_FACE_RIGHT_EYE = [30, 68, 29, 67, 28, 70, 31, 69, 30];
const K_FACE_LEFT_BROW = [19, 20, 21, 22];
const K_FACE_RIGHT_BROW = [18, 17, 16, 15];

// For framecode system
let frameCanvas, frame, lastFrame;

// Refs to video objects
let userVideo, filmVideo;

// Refs to video sprites
let userVideoSprite, filmSprite;

// Sprite masks
let userVideoMaskQuarterRight;

// For graphics rendering
let boundingBox, faceModel, emotionChart, dimmerScreen;

// For text rendering
const landmarkText = new Array(71);
let angerText, userVideoStatusText, angryLabelText, sadLabelText, surprisedLabelText, happyLabelText;

// Sound effects
let explosionSFX, beepSFX;

// AR props
let spyHatSprite, thiefMaskSprite, headPhysicsSprite;

// Other sprites
let gradientSprite;

// For particle systems
let emojiEmitter;

// Used for creating backplate to correct user video aspect ratio
let userVideoBackplateBMD, userVideoBackplateSprite;

// For facial landmark and emotion detection
let landmarks, clmParams, clmTrack, clmCanvas, ec, emotionData;

// For user video image processing effects
let userVideoProcessedBMD, userVideoProcessedSprite;

// User video aspect ratio
let userVideoAspect;

// Groups
let userVideoGroup, filmGroup, overlayGroup, textGroup;

// For loading bar
let loadGfx;

// UI buttons
let playButton;

// State
let activated = false;

// Instances of viewer emotions
let viewerEmotions;

// Data structure for collecting viewer emotions
function emotionStruct() {
	this.angry = [];
	this.sad = [];
	this.surprised = [];
	this.happy = [];
}

emotionStruct.prototype.avg = function(dimension) {
	if (this[dimension].length > 0) {
		let acc = 0;

		for (let i = 0; i < this[dimension].length; i += 1) {
			acc += this[dimension][i];
		}

		return acc / this[dimension].length;
	}
}

const cfg = {
	width: K_PROJECT_WIDTH,
	height: K_PROJECT_HEIGHT,
	multiTexture: false,
	parent: "the-film",
	enableDebug: false,
	renderer: Phaser.CANVAS,
	antialias: true,
};

const game = new Phaser.Game(cfg);

game.state.add("boot", bootState);
game.state.add("load", loadState);
game.state.add("bootcv", bootCVState);
game.state.add("play", playState);

game.state.start("boot");