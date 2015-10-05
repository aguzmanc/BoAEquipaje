var BaggageCarousel = (function () {
  /**
   * Creates a bagging carousel. It is composed by several sprites, so it can
   * adapt to the required width
   * @method BaggageCarousel.create
   * @return{Phaser.Group} - returns a phaser group with all the sprites the
   * carousel is made with.
   */
  var create = function (y) {
    var carousel = game.add.group(),
	block = game.add.sprite(0,y, 'carousel'),
	i,
	blocksQuantity = game.world.width/block.width,
	block;

    airport.centerY = y;
    carousel.leftMostBlock = block;

    for (i=0; i<blocksQuantity; i++) {
      if (i) {
	block = game.add.sprite(block.width*i, y, 'carousel');
      }

      block.animations.add('roll', [0,1,2,3], 8, true)
      block.animations.play('roll');

      // p2 physics
      game.physics.p2.enable(block, debug);
      utils.setOwnCollisionGroup(this, block);

      block.body.static = true;
      carousel.add(block);      
    }

    carousel.rightMostBlock = block;
    carousel.speed = -100;
    // TODO: several carousels?
    // TODO: variable direction carousel?
    airport.carousel = carousel;
    carousel.powerButton = game.add.sprite(200, y+45 + yP2Offset, 'go');
    carousel.powerButton.animations.add('on', [1]);
    carousel.powerButton.animations.add('off', [0]);

    game.input.onDown.add(toggleOnClick, carousel);
    carousel.togglePower = togglePower;
    carousel.addCollision = addCollision;
    carousel.isBusy = isBusy;
    carousel.togglePower();

    // TODO: this is dirty
    if (airport.xrayScreen) {
      airport.xrayScreen.bringToTop();
    }

    return carousel;
  };

  var addCollision = function (collisionGroup) {
    this.forEach(function (block) {
      block.body.collides(collisionGroup);
    });
  };

  /**
   * callback function for detecting if the player clicks
   * the powerButton. The context is 'carousel'
   * @param {} - the event information.
   */
  var toggleOnClick = function (e) {
    if (Phaser.Rectangle.contains(this.powerButton,
				  game.input.x + game.camera.x,
				  game.input.y + game.camera.y)) {
      this.togglePower();
      if (this.on) {
	airport.camera.forceUnfocus();
	for (var i=0; i<Bag.bags.length; i++) {
	  Bag.bags[i].close();
	}
      } else {
	airport.camera.forceFocus();
      }
    }
  };

  /**
   * Toggles the carousel on if it is off, and off if it is on.
   * This just changes the carousel.on property, every
   * object touching it should know how to behave if
   * they are influenced by the velocity of the carousel
   *
   * return {boolean} returns the state of the carousel
   * after the change of state.
   */
  var togglePower = function () {
    if (this.on) {
      this.forEach(function (block) {
	block.animations.stop();
      });
      this.powerButton.animations.play('off');
      this.on = false;
    } else {
      this.forEach(function (block) {
	block.animations.play('roll');
      });
      this.powerButton.animations.play('on');
      this.on = true;
    }

    return this.on;
  };

  var isBusy = function () {
    for (i=0; i<Bag.bags.length; i++) {
      if (Bag.bags[i].x - (game.width-50) >= 0) {
	console.log(Bag.bags[i].x);
	return true;
      }
    }
  };

  return {
    create : create
  };
})();
