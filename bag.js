/**
 * Namespace containing everything related to bags
 */
var Bag = (function () {
  var type = [
    {
      name: 'bag',
      xray: 'xray-bag'
    },
    {
      name: '2bag',
      xray: 'xray-2bag'
    }
  ];
  /**
   * Creates a bag that can contain things, at (x,y)
   * @param {integer} x - spawning position in x
   * @param {integer} y - spawning position in y
   */

  var createIndicator = function () {
    this.nextBagIndicator.create();
    this.honk = game.add.audio('honk');
  };

  var spawnBag = function (type) {
    if (airport.carousel.isBusy()) {
      this.honk.play();
      console.log('it is busy!');
    } else {
      if (!type) {
	type = Bag.type[game.rnd.integerInRange(0,1)];
      }
      return this.create(game.width+50, 50, type);
    }
  };

  var update = function () {
    var cooldown;

    if (this.nextBagIndicator.isHere()) {
      this.spawnBag();
      cooldown = game.rnd.integerInRange(this.spawnCooldown.min/100,
					 this.spawnCooldown.max/100)*100;
      this.nextBagIndicator.reset(cooldown);
    }
  };

  var create = function (x,y, type) {
    var bag = game.add.sprite(x,y, type.name),
	material;

    this.bags.push(bag);

    // p2 physics
    game.physics.p2.enable(bag, debug);

    // box collision
    bag.closedCollisionBox = getBox(bag, this.thickness);
    bag.openCollisionBox = getOpenBox(bag, this.thickness);

    // ??
    bag.body.clearShapes();
    bag.body.addPolygon(null, getBox(bag, this.thickness));
    bag.updateCollisions = updateCollisions;
    bag.updateCollisions();

    // container
    bag.container = game.add.sprite(0,0, type.name);
    game.physics.p2.enable(bag.container,debug);
    bag.container.body.clearShapes();
    bag.container.body.addPolygon(null, [this.thickness,this.thickness,
					 bag.width,this.thickness,
					 bag.height, bag.width,
					 this.thickness, bag.height]);
    bag.container.alpha = 0;
    if (!this.containerBody) {
      this.containerBody = game.physics.p2.createCollisionGroup();
    }
    bag.container.body.setCollisionGroup(this.containerBody);
    bag.container.bag = bag;
    bag.container.update = containerUpdate;
    bag.container.body.static = true;
    this.containers.push(bag.container);
    bag.content =  [];
    bag.initialContent = [];

    // function for adding things into bag.
    game.input.onUp.add(function () {
      var newBag = game.physics.p2.hitTest({
	x: game.input.x + game.camera.x,
	y: game.input.y + game.camera.y,
	type: 25 }, Bag.containers)[0];

      if (things.grabbed) {
	things.grabbed.release();
      }

      if (newBag) {
	newBag.parent.sprite.bag.addThing(things.grabbed);
	if (things.grabbed) {
	  things.grabbed.isSafe = true;
	}
      }
    });

    // props
    material = game.physics.p2.createMaterial(type.name, bag.body);
    material.restitution = 1;
    material.friction = 1;
    bag.body.mass = 1000;

    // bag functions
    bag.fillWithThings = fillWithThings;
    bag.update = updateEachBag;
    bag.addThing = addThing;
    bag.removeThing = removeThing;
    bag.zMax = 3;
    bag.open = open;
    bag.close = close;
    bag.updateCoords = updateCoords;

    // xray
    Twin.addTwin(bag, type.xray);
    airport.xrayScreen.addXrayVision(bag);

    // filling with things:
    // allowing 70% of the bag's volume to be void.
    bag.fillWithThings(bag.width * bag.height * 0.6);
    // initialize bag as closed!
    bag.close();

    return bag;
  };

  var getBox = function (sprite, thickness) {
    return [0,0,
	    sprite.width,0,
	    sprite.width,sprite.height,
	    0,sprite.height,
	    0,thickness + 1,

	    thickness,thickness,
	    thickness,sprite.height-thickness,
	    sprite.width-thickness, sprite.height-thickness,
	    sprite.width-thickness, thickness,
	    thickness + 1,thickness, 0,0];
  };

  var getOpenBox = function (sprite, thickness) {
    return [0,0,
	    thickness,0,
	    thickness, sprite.height-thickness,
	    sprite.width-thickness, sprite.height-thickness,
	    sprite.width-thickness, 0,
	    sprite.width, 0,
	    sprite.width, sprite.height,
	    0, sprite.height,
	    0,0];
  };
  /**
   * If the carousel is on, the bag gets slided with it.
   */
  var updateEachBag = function () {
    if (airport.carousel.on) {
      this.body.velocity.x = airport.carousel.speed;
    } else {
      this.body.velocity.x = 0;
    }

    // do not allow bag angle
    this.body.angle = 0;
  };

  var open = function () {
    if (!this.isOpen) {
      this.body.clearShapes();
      this.body.addPolygon(null, this.openCollisionBox);
      this.updateCollisions();
      this.isOpen = true;
      this.updateCoords();
    }
  };

  var updateCollisions = function () {
    utils.setOwnCollisionGroup(Bag, this);
    this.body.collides(BaggageCarousel.collisionGroup);
    airport.carousel.addCollision(Bag.collisionGroup);
  };

  var updateCoords = function () {
    this.body.x -= this.width/2;
    this.body.y -= this.height/2;
  };

  var close = function () {
    if (this.isOpen) {
      this.body.clearShapes();
      this.body.addPolygon(null, this.closedCollisionBox);
      this.updateCollisions();
      this.isOpen = false;
      this.updateCoords();
    }
  };


  /**
   * Packs a thing into the bag.
   */
  var addThing = function (thing) {
    if (thing) {
      debug? console.log('adding ' + thing.key):null;
      this.content.push(thing);
      thing.packed = true;
      thing.bag = this;
    }
  };

  var removeThing = function (thing) {
    debug? console.log('removing ' + thing.key):null;
    var index = this.content.indexOf(thing);
    if (index >= 0) {
      this.content.splice(index,1);
    }
    thing.bag = null;
  };

  var containerUpdate = function () {
    this.body.x = this.bag.x;
    this.body.y = this.bag.y;
    // this.body.velocity.x = this.bag.body.velocity.x;
    // this.body.velocity.y = this.bag.body.velocity.y;
    this.body.angle = this.bag.body.angle;
  };

  var fillWithThings = function (gapAllowed) {
    var gapLeft = this.width * this.height,
	thing,
	failCounter = 0,
	newThingArea;

    // TODO: probabilities
    while (gapLeft > gapAllowed) {
      thing = Thing.type[game.rnd.integerInRange(0, Thing.type.length-1)];
      newThingArea = thing.model.width * thing.model.height;

      if ((gapLeft - newThingArea) < gapAllowed) {
	failCounter++;
      } else {
	thing = Thing.create(this, thing);
	this.initialContent.push(thing);
	gapLeft -= thing.width * thing.height;
      }

      if (failCounter > 10) {
	return;
      }
    }
  };

  return {
    create : create,
    bags: [],
    containers: [],
    type : type,
    thickness: 10,
    update : update,
    createIndicator : createIndicator,

    spawnCooldown : {
      max : 15*1000,
      min : 6*1000
    },

    nextBagIndicator : {
      create : function () {
	var powerButton = airport.carousel.powerButton
	this.indicator = game.add.sprite(powerButton.x + powerButton.width + 20,
					 airport.carousel.leftMostBlock.y + 20,
					 'next-bag-indicator');
	this.bagDrawing.create(this.indicator);
	this.bagDrawing.spawn(600);
      },

      isHere: function () {
	return this.bagDrawing.isHere();
      },

      reset: function (cooldown) {
	this.bagDrawing.spawn(cooldown);
      },

      bagDrawing : {
	create : function (bagIndicator) {
	  this.x = bagIndicator.right;
	  this.y = bagIndicator.top-10;
	  this.roadLength = bagIndicator.width;

	  this.sprite = game.add.sprite(this.x, this.y, 'bag-drawing');
	  this.sprite.animations.add('die', [1]);
	  this.sprite.animations.add('live', [0]);
	  this.sprite.anchor.set(1,1);
	  game.physics.p2.enable(this.sprite);
	  this.sprite.body.static = true;
	},

	spawn: function (cooldown) {
	  this.sprite.body.x = this.x;
	  this.sprite.body.y = this.y;
	  this.sprite.animations.play('live');
	  this.sprite.body.velocity.x = -(this.roadLength*1000)/cooldown;
	},

	isHere: function () {
	  return this.sprite.body.x <= (this.x - this.roadLength);
	}
      }
    },

    spawnBag : spawnBag

  };

})();
