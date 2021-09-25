const loadState = {
  preload: function () {
    loadGfx = game.add.graphics(0, 0);

    game.load.image("mozillaLogo", "img/mozilla-logo-bw-rgb.png", 500, 143);
    game.load.image("fullscreenButton", "img/fullscreen_button.png", 48, 48);

    // Here's where we'll load our looping video backplate
    // game.load.video("dogloop", "vid/dogs_20000kbps_03172019.mp4");
  },

  create: function () {
    game.state.start("play");
  },

  loadUpdate: function () {
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
      game.load.progress * 6,
      20
    );
  },
};
