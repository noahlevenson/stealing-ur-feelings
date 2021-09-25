const bootState = {
  preload: function () {
    // Eventually do things here
  },

  create: function () {
    // game.time.advancedTiming = true;
    // game.time.desiredFps = 30;

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.maxWidth = "100%";
    game.scale.maxHeight = "100%";

    game.stage.disableVisibilityChange = true;
    // game.renderer.renderSession.roundPixels = true;
    // Phaser.Canvas.setImageRenderingCrisp(game.canvas);

    // We may not need physics...
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.state.start("load");
  },
};
