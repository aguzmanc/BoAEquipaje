var yP2Offset = -50;
var xP2Offset = -45;

var mainState = ( function () {

  var preload = function () {
    game.load.spritesheet('mobile-alert',
			  'assets/information-for-mobile.png', 426, 252);

    game.load.spritesheet('ball', 'assets/ball.png', 92,87);
    game.load.spritesheet('ball-xray', 'assets/ball-xray.png', 92,87);
    game.load.spritesheet('cota-cola', 'assets/cota-cola.png', 25, 53);
    game.load.spritesheet('twin-cota-cola', 'assets/twin-cota-cola.png', 25, 53);
    game.load.spritesheet('iguana', 'assets/iguana.png', 93,34);
    game.load.spritesheet('twin-iguana', 'assets/twin-iguana.png', 93,34);
    game.load.spritesheet('perfume', 'assets/perfume.png', 14,25);
    game.load.spritesheet('twin-perfume', 'assets/twin-perfume.png', 14,25);
    game.load.spritesheet('knife', 'assets/knife.png', 16,40);
    game.load.spritesheet('xray-knife', 'assets/xray-knife.png', 16,40);
    game.load.spritesheet('chulo', 'assets/chulo.png', 50,45);
    game.load.spritesheet('xray-chulo', 'assets/xray-chulo.png', 50,45);

    game.load.spritesheet('carousel', 'assets/baggage-carousel.png', 50, 100);
    game.load.spritesheet('xray-screen', 'assets/xray-screen.png', 225,225);
    game.load.spritesheet('bag', 'assets/01bag.png', 180,180);
    game.load.spritesheet('xray-bag', 'assets/01bag-xray.png', 180,180);
    game.load.spritesheet('2bag', 'assets/02bag.png', 120,120);
    game.load.spritesheet('xray-2bag', 'assets/02bag-xray.png', 120,120);
    game.load.spritesheet('go', 'assets/go.png', 50,50);
    game.load.spritesheet('gate', 'assets/door.png', 84,249);
    game.load.spritesheet('trash', 'assets/trash.png', 83,101);
    game.load.spritesheet('table', 'assets/table.png', 228,177)

    game.load.spritesheet('bad-explossion', 'assets/bad-explossion.png',
			  110,112);

    game.load.spritesheet('bag-drawing', 'assets/bag-drawing.png', 23,26);
    game.load.spritesheet('next-bag-indicator',
			  'assets/next-bag-indicator.png', 142,22);

    game.load.audio('good', 'assets/audio/good.mp3');
    game.load.audio('bad', 'assets/audio/bad.mp3');
    game.load.audio('perfect', 'assets/audio/perfect.mp3');
    game.load.audio('honk', 'assets/audio/honk.mp3');
  }

  var create = function () {
    airport.create();
    airport.postCreate();
  }

  var update = function () {
    airport.update();
    // bag.update();
  };

  return { preload : preload,
	   create : create,
	   update : update };

})();

var width = utils.fromMobile()? 700: 640;
var game = new Phaser.Game(width, 360, Phaser.AUTO, 'game');
game.state.add('main', mainState);
game.state.start('main');
