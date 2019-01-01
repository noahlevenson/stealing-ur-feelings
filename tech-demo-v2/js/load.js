const loadState = {
	preload: function() {
		loadGfx = game.add.graphics(0, 0);

		game.load.image("playButtonImage", "img/play.png", 1000, 1000);
		game.load.image("spyHat", "img/spyHat.png", 600, 506);
		game.load.image("thiefMask", "img/thiefMask.png", 600, 225);
		game.load.image("emoji", "img/emoji.png", 40, 40);
		game.load.image("headPhysicsSprite", "img/headPhysicsSprite.png", 100, 100);
		game.load.image("gradientSprite", "img/gradientHD.png", 1920, 1080);

		game.load.audio("explosion", "sfx/explosion.mp3");
		game.load.audio("beep", "sfx/beep.mp3");

		game.load.video("film", "vid/12312018.mp4");
	},

	create: function() {
		game.state.start("bootcv");
	}, 

	loadUpdate: function() {
		loadGfx.clear();
		loadGfx.beginFill(0x8c8c8c, 1);
		loadGfx.drawRect(game.world.centerX - 300, game.world.centerY - 100, 600, 20);
		loadGfx.beginFill(0xFFFFFF, 1);
    	loadGfx.drawRect(game.world.centerX - 300, game.world.centerY - 100, game.load.progress * 6, 20);
	}
};