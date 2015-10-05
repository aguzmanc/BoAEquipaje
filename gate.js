/**
 * Namespace that contains everything related to the gate through which
 * the bags gets admited.
 */
var Gate = (function () {
  /**
   * Creates a gate through which the bags can get admited.
   * @param{Carousel} the carousel that leads the bags to this gate.
   * return {Phaser.Sprite} returns the gate.
   */
  var create = function (carousel) {
    var gate = game.add.sprite(0,0, 'gate'),
	// TODO: is this really necessary?
	where = airport.carousel.speed/Math.abs(airport.carousel.speed) < 0? 'left': 'right';

    // animations...
    gate.animations.add('alarm', [2,1], 7, true);
    gate.animations.add('perfect', [4,3], 7, true);
    gate.animations.add('stand', [0]);

    gate.animations.play('stand');

    gate.anchor.set(0,1);
    gate.y = airport.carousel.leftMostBlock.y+33 + yP2Offset;

    // TODO: is this really necessary? o.O
    if (where === 'right' ) {
      gate.x = airport.carousel.rightMostBlock.x;
      gate.scale.set(-1,1);
    } else {
      gate.x = airport.carousel.leftMostBlock.x;
    }

    gate.perfectSound = game.add.audio('perfect');

    gate.analyze = analyze;
    gate.update = update;

    return gate;
  };

  /**
   * The gate checks if a bag is gone through it
   * if the bag has gone through it, then it kills the bag
   * and analyzes it.
   *
   * TODO: it'd be really buggy if there are more gates on the game. 
   */
  var update = function () {
    var i=0,
	xDistance,
	bag;

    this.alarm--;

    if (this.alarm < 0) {
      this.animations.play('stand');
    }

    for (i=0; i<Bag.bags.length; i++) {
      bag = Bag.bags[i];
      xDistance = (bag.x + bag.width/8) - (this.x);
      if (xDistance < -100 && !bag.gone && bag.alive) {
	console.log("it's gone");
	bag.gone = true;
	this.analyze(bag);
	bag.kill();
	bag.container.kill();
      }
    }
  };

  /**
   * Analyzes the bag as if it just passed through
   */
  var analyze = function (bag) {
    var i,
	item,
	wrong = 0;

    for (i=0; i<bag.initialContent.length; i++) {
      item = bag.initialContent[i]

      if (item) {
	if (!item.type.allowed) {
	  // not allowed and packed or not thrown away
	  if (item.packed || item.alive) {
	    console.log(item.key + ' is not allowed!!! O__O');
	    wrong++;
	  }
	} else if (!item.packed) {
	  // allowed not packed
	  console.log(item.key + ' was not packed :(');
	  wrong++;
	} else {
	  // allowed and packed
	  console.log(item.key + ' is allowed and packed... good job!!');
	}
      }
    }

    if (wrong) {
      this.animations.play('alarm');
      this.alarm = 100;
    } else {
      this.animations.play('perfect');
      this.alarm = 100;
      gate.perfectSound.play();
    }
  };

  return {
    create : create
  };
})();
