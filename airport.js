var airport = (function () {
  var unfocusCount = 50;

  var camera = {
    focused: true,
    steps: 25,
    stepsCounter : 50,
    speed : {
      x : 0,
      y : 0
    },
    target : {
      x: 300,
      y: 300
    },
    untarget : {
      x: 320,
      y: 155
    },

    focus : function () {
      if (!this.focused) {
	this.forceFocus();
      }
    },

    forceFocus : function () {
      this.focused = true;
      this.stepsCounter = 0;
      this.speed.x = (this.target.x - game.camera.x)/this.steps;
      this.speed.y = (this.target.y - game.camera.y)/this.steps;
    },

    unfocus : function () {
      if (this.focused) {
	this.forceUnfocus();
      }
    },

    forceUnfocus : function () {
      this.focused = false;
      this.stepsCounter = 0;
      this.speed.x = (this.untarget.x - game.camera.x)/this.steps;
      this.speed.y = (this.untarget.y - game.camera.y)/this.steps;
    },

    update : function () {
      if (this.stepsCounter <= this.steps) {
	this.stepsCounter++;
	game.camera.x += this.speed.x;
	game.camera.y += this.speed.y;
      }
    }
  };

  var create = function () {
    var i,
	p2;

    game.stage.backgroundColor = "#eeb";
    game.world.setBounds(0,0, game.width*2, game.height*2);
    // I need this model to know the width/height of each type of thing
    // so i can know it's volume, so I can compute how much things will
    // pack into a bag
    for (i=0; i<Thing.type.length; i++) {
      Thing.type[i].model = game.add.sprite(-100,-100, Thing.type[i].name);
      Thing.type[i].model.kill();
    }

    if (utils.fromMobile()) {
      this.spawnMobileAlert();
    }

    this.setupPhysics();
    this.spawnEnvironment();

  };

  var spawnEnvironment = function () {
    table = this.table = Table.create(650, 20);
    xrayScreen = this.xrayScreen = XrayScreen.create(100, 300+38, 200, 200);

    carousel = this.carousel = BaggageCarousel.create(300);
    Bag.createIndicator();
    gate = this.gate = Gate.create(this.carousel, 'left');

    // bag = this.bag = Bag.create(game.width-100,50, Bag.type[0]);
    trash = this.trash = Trash.create(this.xrayScreen.right, this.xrayScreen.y,
    			      function (thing) {
    				return !thing.type.alive;
    			      },
    				      'trash');
    xrayScreen.bringToTop();
  };

  var setupPhysics = function () {
    var p2;
    game.physics.startSystem(Phaser.Physics.P2JS);
    p2 = game.physics.p2;

    p2.setBoundsToWorld(false, false, true, true);
    p2.gravity.y = airport.gravity;
    p2.restitution = 0.1;
    p2.updateBoundsCollisionGroup();
    p2.setImpactEvents(true);
  };

  var spawnMobileAlert = function () {
    game.paused = true;
    this.alert =
      game.add.sprite(game.width/2, game.height/2, 'mobile-alert');
    this.alert.anchor.set(0.5, 0.5);

    game.input.onDown.add(function () {
      if (this.alert && game.paused) {
	game.paused = false;
	this.alert.kill();
	this.alert = null;

	game.scale.startFullScreen(true);
      }
    }, this);
  };

  var setupCamera = function () {
    camera.target.x = this.xrayScreen.x;
    camera.target.y = this.xrayScreen.y-200;

    // TODO: multidirectional carousels?
    camera.untarget.x = 0,
    camera.untarget.y = this.carousel.children[0].bottom - game.height + 50;

    camera.unfocus();
  };

  var postCreate = function () {
    setupCamera();
    this.simulateDepth();
    if (this.alert) {
      this.alert.bringToTop();
    }

        // so you can grab things
    game.input.onDown.add(function (pointer) {
      console.log(game.input.x + game.camera.x,
		  game.input.y + game.camera.y);
      var i,
	  bodies = game.physics.p2.hitTest({ x: game.input.x + game.camera.x,
					     y: game.input.y + game.camera.y,
					     type: 25 }, things),
	  max = bodies[0];

      if (max) {
	for (i=1; i<bodies.length; i++) {
	  if (bodies[i].z > max.z) {
	    max.z = bodies[i];
	  }
	}

	
	max.parent.sprite.grab();
      }
    });

    this.simulateDepth();
  };

  var simulateDepth = function () {
    var i=0;

    for (i=things.length-1; i>=0; i--) {
      things[i].bringToTop();
      things[i].xrayTwin.bringToTop();
    }

    for (i=Bag.bags.length-1; i>=0; i--) {
      Bag.bags[i].bringToTop();
      Bag.bags[i].xrayTwin.bringToTop();
    }

    this.table.bringToTop();
    this.trash.bringToTop();
  };

  var update = function () {
    var i;

    for (i=0; i<Bag.bags.length; i++) {
      Bag.bags[i].update();
    }

    camera.update();
    Bag.update(); // spawns bags
    // this.simulateDepth();
  };

  var getPointer = function (pointer) {
    return { x: pointer.x + game.camera.x,
	     y: pointer.y + game.camera.y };
  };

  return {
    create : create,
    update : update,
    setupCamera : setupCamera,
    postCreate : postCreate,
    getPointer : getPointer,
    spawnMobileAlert : spawnMobileAlert,
    simulateDepth : simulateDepth,
    setupPhysics : setupPhysics,
    spawnEnvironment : spawnEnvironment,

    camera : camera,
    gravity: 800,
    score: 0
  };
})();
