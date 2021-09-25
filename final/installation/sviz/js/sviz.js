// Debug mode
const K_DEBUG = true;

// The room name for the consumers group recognized by sdata
// (sdata will log an error if you send a join request for a room name it doesn't recognize)
const K_CONSUMERS_ROOM_NAME = "CONSUMERS";

// Constants for our project's dimensions
const K_PROJECT_WIDTH = 1920;
const K_PROJECT_HEIGHT = 1080;
const K_PROJECT_ASPECT_RATIO = K_PROJECT_WIDTH / K_PROJECT_HEIGHT;

// Number of landmarks fitted by our facial pose estimation model
const K_NUMBER_OF_LANDMARKS = 68;

const K_BACKGROUND_ANIMATION_STEPS = 30;
const K_BACKGROUND_ANIMATION_NON_NEUTRAL_C1 = {
  surprised: 0x6600cc,
  happy: 0xffff00,
  angry: 0xff3300,
  disgusted: 0x33cc33,
  fearful: 0xff751a,
  sad: 0x0033cc,
  neutral: 0xa6a6a6,
};

const K_BACKGROUND_ANIMATION_NON_NEUTRAL_C2 = {
  surprised: 0xff3399,
  happy: 0xffcc00,
  angry: 0xffb399,
  disgusted: 0x80ff80,
  fearful: 0xffd1b3,
  sad: 0xb3c6ff,
  neutral: 0xa6a6a6,
};

// Points describe paths in our landmarks array to draw corresponding features
const K_FACE_OUTLINE = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
];
const K_FACE_MOUTH_OUTER = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 48];
const K_FACE_MOUTH_INNER_TOP = [60, 61, 62, 63, 64];
const K_FACE_MOUTH_INNER_BOTTOM = [60, 67, 66, 65, 64];
const K_FACE_SEPTUM = [27, 28, 29, 30];
const K_FACE_NOSE = [31, 32, 33, 34, 35];
const K_FACE_LEFT_EYE = [36, 37, 38, 39, 40, 41, 36];
const K_FACE_RIGHT_EYE = [42, 43, 44, 45, 46, 47, 42];
const K_FACE_LEFT_BROW = [17, 18, 19, 20, 21];
const K_FACE_RIGHT_BROW = [22, 23, 24, 25, 26];

// Globals
let loadGfx,
  fullScreenButton,
  mozillaLogo,
  socket,
  faceModel,
  userEmotionalStateText,
  attractText,
  attractTween,
  faceModelGroup,
  backgroundBMD,
  backgroundSprite;
let faceModelFadeDebounceHandle = null;

// Data structure for incoming data - currently we just stomp it
// if we're experiencing bad things, let's implement a ring buffer
let dataBuffer;

// Data structures for incoming events
let dogsEvent,
  genderEvent,
  kanyeStartEvent,
  kanyeEndEvent,
  kanyeEvent,
  pizzaStartEvent,
  pizzaEndEvent,
  pizzaEvent,
  raceEvent,
  datingPreferenceEvent,
  socialNewsEvent,
  politicalOrientationEvent,
  iqEvent,
  estimatedIncomeEvent,
  mentalHealthEvent,
  selfImageEvent;

let eventText,
  eventScoreText,
  positivePercentText,
  negativePercentText,
  estimatedIncomeText,
  mentalHealthText,
  selfImageText,
  finalQuantTimer,
  iqText;

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
    this.neutral = x[0]["probability"];
    this.happy = x[1]["probability"];
    this.sad = x[2]["probability"];
    this.angry = x[3]["probability"];
    this.fearful = x[4]["probability"];
    this.disgusted = x[5]["probability"];
    this.surprised = x[6]["probability"];
  }
}

socket = io("http://localhost:8000");
socket.emit("joinRequest", K_CONSUMERS_ROOM_NAME);

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
game.state.add("play", playState);

game.state.start("boot");
