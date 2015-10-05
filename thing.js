// improvised collection of things...
// TODO: the collection of things should be on their parent bag
var things = [];

/**
 * Namespace that contains everything 'thing' related.
 * a 'thing' is anything contained inside a bag.
 */
var Thing = (function () {
  var bounciness = [],
      sliperiness = [],
      LOW=0,
      NORMAL=1,
      SOME=2,
      HIGH=3,
      NONE=4;

  sliperiness[NONE] = bounciness[NONE] = 0;
  sliperiness[LOW] = bounciness[LOW] = 0.05;
  sliperiness[NORMAL] = bounciness[NORMAL] = 0.1;
  sliperiness[SOME] = bounciness[SOME] = 0.4;
  sliperiness[HIGH] = bounciness[HIGH] = 0.7;

  /**
   * An array containing all the possible type of things that
   * could come into a bag.
   */
  var typeOfThings = [
    {
      name: 'cota-cola',
      xray: 'twin-cota-cola',
      allowed: true,
      alive: false,
      cost: 50,
      mass: 0.5,

      restitution: bounciness[NORMAL],
      friction: sliperiness[LOW]
    }, {
      name: 'ball',
      xray: 'ball-xray',
      allowed: true,
      alive: false,
      cost: 50,
      mass: 0.3,

      restitution: bounciness[HIGH],
      friction: sliperiness[HIGH]
    }, {
      name: 'iguana',
      xray: 'twin-iguana',
      allowed: false,
      alive: true,
      cost: -100,
      mass: 10,

      restitution: bounciness[LOW],
      friction: sliperiness[HIGH],
    }, {
      name: 'perfume',
      xray: 'twin-perfume',
      allowed: false,
      alive: false,
      cost: -50,
      mass: 10,

      restitution: bounciness[NORMAL],
      friction: sliperiness[LOW],
    }, {
      name: 'knife',
      xray: 'xray-knife',
      allowed: false,
      alive: false,
      cost: -200,
      mass: 10,

      restitution: bounciness[SOME],
      friction: sliperiness[LOW]
    }, {
      name: 'chulo',
      xray: 'xray-chulo',
      allowed: true,
      alive: false,
      cost: 100,
      mass: 0.1,

      restitution: bounciness[NONE],
      friction: sliperiness[LOW]
    }
  ];

  /**
   * returns a thing created at (x,y)
   * @param {number} x - Spawning point at x
   * @param {number} y - Spawning point at y
   */
  var create = function (bag, type) {
    var thing = game.add.sprite(bag.x + bag.width/2,
				bag.y + bag.height/2,
				type.name),
	offset = [Math.round(thing.width) + Bag.thickness,
		  Math.round(thing.height) + Bag.thickness],
	material;

    thing.type = type;
    // randomly allocate inside the bag
    // thing.x += game.rnd.integerInRange(offset[0],
    // 				       bag.width/2 - offset[0]);
    // thing.y += game.rnd.integerInRange(offset[1],
    // 				       bag.height/2 - offset[1]);
    // p2 physics
    game.physics.p2.enable(thing, debug);
    utils.setOwnCollisionGroup(this, thing);
    // collision group for grabbed things...
    // TODO
    if (!this.grabbedCollisionGroup) {
      this.grabbedCollisionGroup = game.physics.p2.createCollisionGroup();
    }
    // it collides with the carousel
    thing.body.collides(BaggageCarousel.collisionGroup);
    airport.carousel.addCollision(Thing.collisionGroup);
    // it also collides with the bag (when not grabbed)
    thing.body.collides(Bag.collisionGroup);
    bag.body.collides(Thing.collisionGroup);
    // and between each other
    // TODO: z-index
    thing.body.collides(Thing.collisionGroup);

    // props
    thing.anchor.set(0.5,0.5);
    thing.body.restitution = type.restitution;
    thing.body.friction = type.friction;
    thing.body.mass = type.mass;
    thing.isSafe = true;

    // methods!
    thing.grab = grab;
    thing.release = release;
    thing.getSpeed = getSpeed;
    thing.follow = follow;
    thing.isInsideBag = isInsideBag;
    thing.update = update;
    thing.collideBuddies = collideBuddies;
    thing.dragToSafePlace = dragToSafePlace;
    thing.checkBag = checkBag;
    thing.purgeOutsideSpawnBug = purgeOutsideSpawnBug;

    // adding thing to necessary collections...
    things.push(thing);
    bag.addThing(thing);
    thing.packed = true;

    // x-ray twin
    Twin.addTwin(thing, type.xray);
    airport.xrayScreen.addXrayVision(thing);

    // this is expensive, but necessary for grabbing the right thing.
    things.sort(function (a, b) {
      return b.z - a.z;
    });

    // if it gets spawned outside the bag, PURGE!!!
    // but it needs a little of time to reacomodate
    game.time.events.add(Phaser.Timer.SECOND*1,
			 thing.purgeOutsideSpawnBug, thing);

    return thing;
  };

  /*
   * The speed at which the thing will move towards the mouse.
   * @method thing#getSpeed
   */
  var getSpeed = function () {
    // TODO: an awesome speed calculated with the weight of the thing.
    return 1000;
  };

  /**
   * This is the method that has to be actioned whenever the thing
   * gets grabbed and must follow the mouse pointer.
   * Whether the thing gets grabbed or not, is coded at the update function.
   * @method thing#grab
   */
  var grab = function () {
    if (debug || (!this.bag || this.bag.isOpen)) {
      this.body.setCollisionGroup(Thing.grabbedCollisionGroup);
      this.grabbed = true;
      this.packed = false;
      this.bringToTop();
      this.xrayTwin.bringToTop();
      things.grabbed = this;
      if (this.bag) {
	this.bag.removeThing(this);
      }
    }
  };

  /**
   * This releases the thing when it is grabbed, and causes it to stop
   * following the mouse pointer.
   * @method thing#release
   */
  var release = function () {
    var lastBag = this.bag;

    this.body.setCollisionGroup(Thing.collisionGroup);
    this.grabbed = false;
    // things.grabbed = null;

    if (lastBag) {
      this.packed = this.isInsideBag()

      if (!this.packed) {
	lastBag.removeThing(this);
      }
    }

    if (!this.packed && !this.grabbed && !this.onTable) {
      this.isSafe = false;
    }
  };

  /**
   * Tells whether the thing is "geometrically" totally inside it's parent bag.
   * the thing can not be put inside another bag.
   * @return {boolean} true if the thing is geometrically inside a bag
   */
  var isInsideBag = function () {
    if (this.bag) {
      return Phaser.Rectangle.containsRect(this.body, this.bag.body);
    }
  };

  /**
   * This causes the thing to change it's velocity towards the mouse pointer.
   * it must be actively called while the thing is being grabbed.
   * @method thing#follow
   */
  var follow = function () {
    utils.moveTo(this,
		 game.input.x + game.camera.x,
		 game.input.y + game.camera.y);

    if (airport.table.isOnTop(this)) {
      this.onTable = true;
    } else {
      this.onTable = false;
    }

    this.body.static = true;
  };

  var collideBuddies = function () {
    // TODO
  };

  /**
   * This is automatically actively called on the phaser update bucle.
   */
  var update = function () {
    var bagRectangle, rectangle, i, bag, middle, gap;

    if (this.packed) {
      // follow parent if it is packed
      this.body.velocity.x = this.bag.body.velocity.x;
      if (debug) {
	this.alpha = 0.8;
      } else {
	this.alpha = 0;
      }
      this.bringToTop();
    } else {
      this.alpha = 1;
    }

    if (this.grabbed) {
      this.follow();
    } else {
      if (this.onTable) {
	this.body.static = true;
	this.body.velocity.x = this.body.velocity.y = 0;
	this.body.angularVelocity = 0;
	this.body.angle = 0;
      } else {
	this.body.static = false;
	// TODO: do this work?
	this.body.velocity.x *= 0.95;

	if (airport.carousel.on) {
	  this.body.velocity.x = airport.carousel.speed;
	}
      }
    }

    if (!game.input.activePointer.isDown) {
      things.grabbed = null;
      this.grabbed = false;
    }

    if (!this.isSafe) {
      this.dragToSafePlace();
    } else if (!this.packed && !this.grabbed && !this.onTable) {
      this.checkBag();
    }
  };

  var checkBag = function (bag) {
    var myRectangle = new Phaser.Rectangle(this.x,this.y,
      					   this.width, this.height),
	bagRectangle;

    if (!bag) {
      bag = airport.xrayScreen.bag
    }

    if (bag && this.alive && bag.alive) {
      bagRectangle = new Phaser.Rectangle(bag.left, bag.top,
					  bag.width, bag.height);
      if (bagRectangle.containsRect(myRectangle)) {
	bag.addThing(this);
	return false;
      }
    }

    return true;
  };

  var purgeOutsideSpawnBug = function () {
    var index;
    if (!checkBag(this.bag)) {
      index = this.bag.initialContent.indexOf(this);
      this.kill();
      this.bag.initialContent.splice(index,1);
      this.bag.removeThing(this);
      this.update = function () {};
      return true;
    }
  };

  var dragToSafePlace = function () {
    var middle = airport.xrayScreen.left + airport.xrayScreen.width/2;

    this.body.x = middle;
    this.body.y = airport.xrayScreen.top;
    this.isSafe = true;

    // this.body.static = true;
    // this.body.setCollisionGroup(Thing.grabbedCollisionGroup);
    // utils.moveTo(this, middle, airport.xrayScreen.top)

    // if (Phaser.Math.distance(this.x, this.y,
    // 			     middle, airport.xrayScreen.top) < 10) {
    //   this.body.static = false;
    //   this.isSafe = true;
    //   this.body.setCollisionGroup(Thing.collisionGroup);
    // }
  };

  return {
    create : create,
    type : typeOfThings,
    purgeOutsideSpawnBug : purgeOutsideSpawnBug
  };
})();
