var Table = (function () {
  var create = function (x,y) {
    var table = game.add.sprite(x,y, 'table');
    table.anchor.set(1,0);
    game.physics.arcade.enable(table);
    table.alpha = 0;

    table.animations.add('stand', [0]);
    table.animations.add('shine', [1]);

    table.isOnTop = isOnTop;
    table.update = update;

    return table;
  };

  var update = function () {
    if (airport.carousel.on) {
      this.alpha = 0;
    } else {
      this.alpha = 1;
    }

    if (things.grabbed && this.isOnTop(things.grabbed)) {
      this.animations.play('shine');
    } else {
      this.animations.play('stand');
    }
  };

  var isOnTop = function (sprite) {
    return Phaser.Rectangle.contains(this.body, sprite.x, sprite.y);
  };

  return {
    create : create
  };
})();
