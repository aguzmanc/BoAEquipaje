/**
 * Namespace that contains everything related to the xray screen
 */
var XrayScreen = (function () {
  /**
   * Returns an xray screen.
   * It uses Phaser figures, so with masks it shows the xray twin
   * of the items that go behind it.
   */
  var create = function (x,y) {
    y += yP2Offset;
    var screen = game.add.sprite(x,y, 'xray-screen'),
	mask,
	clip;
    // can't set anchor, z depth messes up
    y = screen.y -= screen.height;

    // setting as camera target
    airport.camera.target.x = x;
    airport.camera.target.y = screen.bottom - 200;

    // TODO: pretty margins
    mask = game.add.graphics(0,0);
    mask.beginFill(0xffffff);
    mask.drawRect(x,y, screen.width, screen.height);

    // draws a polygon that does not contain the screen.mask rectangle
    // Phaser has no clip :(
    clip = game.add.graphics(0,0);
    clip.beginFill(0xffffff);
    clip.drawPolygon(0,0,
		     x,y, screen.right,y, screen.right,screen.bottom,
		     x,screen.bottom, x,y,
		     
		     0,0, 0,game.height, game.world.width,game.world.height,
		     game.world.width,0,
		     
		     0,0);

    screen.xrayMask = mask;
    screen.xrayClip = clip;

    screen.addXrayVision = addXrayVision;
    screen.update = update;
    airport.xrayScreen = screen;

    return screen;
  };

  /**
   * This assumes that the thing already have an xray twin
   * Masks the thing into the xray, so the xray view
   * and the normal view are consistent acording to the
   * xray screen.
   * @param {Phaser.Sprite} thing - a sprite with an xray twin
   * the mask will be applied to it.
   */
  var addXrayVision = function (thing) {
    var arr = [],
	i;

    if (!thing.length) {
      arr[0] = thing;
    } else {
      arr = thing;
    }

    for (i=0; i<arr.length; i++) {
      if (arr[i].xrayTwin) {
	arr[i].xrayTwin.mask = this.xrayMask;
	arr[i].xrayTwin.bringToTop();
      }
      arr[i].mask = this.xrayClip;
      arr[i].bringToTop();
    }
  };

  /**
   * If there is a bag in the middle of it that has not
   * been checked yet, it forces the carousel to stop,
   * marks the bag as xrayAnalized, and as open.
   */
  var update = function () {
    var xDistance,
	i,
	bags = Bag.bags;

    for (i=0; i<bags.length; i++) {
      xDistance = (bags[i].left + bags[i].width/2) - (this.left + this.width/2);

      if (xDistance < 0 && !bags[i].xrayAnalized) {
	// TODO: several carousels?
	bags[i].xrayAnalized = true;
	bags[i].open();

	airport.carousel.togglePower();
	airport.camera.focus();
	this.bag = bags[i]
	console.log('ding!');
      }
    }

  };

  return {
    create : create
  };
})();
