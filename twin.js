/**
 * Namespace that contains everything related to the 
 * xray view shown on the xray screen.
 */
var Twin = (function () {  
  /**
   * adds an xray "twin" to the sprite. The xray twin.
   * follows the sprite everywhere, and causes the original.
   * sprite to get clipped to the xray vision screen.
   * and the xray twin gets masked into the xray vision screen.
   * @param {Phaser.Sprite} sprite - the sprite who needs an xrawy twin.
   * @param {string} twin - the name of the face of the  sprite's xray twin.
   * return {Phaser.Sprite} the sprite of the xray twin.
   */
  var addTwin = function (sprite, twin) {
    var i,
	child;

    twin = game.add.sprite(0,0, twin);
    // i can't use this.
    // the mask gets automagically applied to the children as well
    // sprite.addChild(twin);    

    twin.anchor.set(sprite.anchor.x, sprite.anchor.y);
    twin.update = updateTwin;

    twin.original = sprite;
    sprite.xrayTwin = twin;

    if (sprite.children) {
      for (i=0; i<sprite.children.length; i++) {
	child = game.add.sprite(sprite.children[i].x,
				sprite.children[i].y, twin.key);
	twin.addChild(child);
      }
    }

    return twin;
  };

  /**
   * The update function of the xray twin sprite.
   */
  var updateTwin = function () {
    this.x = this.original.x;
    this.y = this.original.y

    this.angle = this.original.angle;
  };

  return {
    addTwin : addTwin
  };

})()
