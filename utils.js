var utils = (function () {
  var setOwnCollisionGroup = function (context, sprite) {
    if (!context.collisionGroup) {
      context.collisionGroup = game.physics.p2.createCollisionGroup();
    }
    sprite.body.setCollisionGroup(context.collisionGroup);
  };

  var moveTo = function (sprite, x, y) {
    var dx = x - sprite.x,
	dy = y - sprite.y,
	angle;

    sprite.body.rotation = Math.atan2(dy,dx) + game.math.degToRad(-90);
    angle = sprite.body.rotation + (Math.PI/2);
    sprite.body.velocity.x = sprite.getSpeed() * Math.cos(angle);
    sprite.body.velocity.y = sprite.getSpeed() * Math.sin(angle);

    // stop moving if the sprite is already on the point.
    if (Phaser.Math.distance(x, y, sprite.x, sprite.y) < 10) {
      sprite.body.velocity.x = sprite.body.velocity.y = 0;
    }
  };

  var fromMobile = function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return {
    moveTo : moveTo,
    setOwnCollisionGroup : setOwnCollisionGroup,
    fromMobile : fromMobile
  };
})();
