/**
 * Namespace that contains everything related to the boxes
 * where you remove things from the bags.
 */
var Trash = (function () {
  /**
   * Returns a trash can created at (x,y).
   * @param {number} x - position on x.
   * @param {number} y - position on y.
   * @param {function} allowed - function(thing) that tells whether a thing
   * is allowed into this trash can.
   * @param {string} sprite - name of the sprite of this trash can.
   * @return the created trash can.
   */
  var create = function (x,y, allowed, sprite) {
    var trash = game.add.sprite(x,y, sprite);

    trash.animations.add('close', [0]);
    trash.animations.add('open', [1]);

    trash.update = update;
    trash.allowed = allowed
    trash.throwGrabbedThing = throwGrabbedThing;

    trash.badSound = game.add.audio('bad');
    trash.goodSound = game.add.audio('good');

    game.input.onUp.add(stop, trash);
    trash.badExplossion = game.add.sprite(x, y, 'bad-explossion');
    trash.badExplossion.alpha = 0;

    return trash;
  };

  /**
   * This is automatically actively called on the phaser update bucle.
   */
  var update = function () {
    // the trash can will only be visible/enabled if the carousel is off
    if (!airport.carousel.on) {
      this.alpha = 1;
      this.bringToTop();
      // if the grabbed thing is into the trash can
      if (things.grabbed &&
	  Phaser.Math.distance(game.input.x + game.camera.x,
			       game.input.y + game.camera.y,
			       things.grabbed.x, things.grabbed.y) < 50 &&
	  Phaser.Rectangle.contains(this,
				    game.input.x + game.camera.x,
				    game.input.y + game.camera.y)) {
	this.animations.play('open');
      } else {
	this.animations.play('close');
      }
    } else {
      this.animations.play('close');
      this.alpha = 0;
    }
  };

  /**
   * This is supposed to run when the grabbed thing is released.
   * if the grabbed thing is not allowed into that trash can,
   * a penalty should be triggered.
   * if the grabbed thing does belong to that trash can, there is no reward
   *
   * TODO: put all the penalties and rewards together into world.
   */
  var stop = function () {
    if (this.animations.currentAnim.name === 'open') {
      if (things.grabbed.type.allowed) {
	this.badSound.play();
	game.add.tween(this.badExplossion)
	  .to({alpha:1}, 250, "Linear", true,0,0)
	  .yoyo(true, 200);	
      } else {
	this.goodSound.play();
      }
      // TODO: cage for animals
      throwGrabbedThing();
    }
  };

  /**
   * Forces the grabbed thing to be thrown away.
   * rewards nor penalties are triggered from here.
   */
  var throwGrabbedThing = function () {
    var throwed = things.grabbed;
    things.grabbed = null;
    throwed.kill();
    throwed.xrayTwin.kill();
  };

  return {
    create : create
  };
})();
