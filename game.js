'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  plus(obj) {
    try {
      if (obj instanceof Vector) {
        let newX = this.x + obj.x;
        let newY = this.y + obj.y;
        return new Vector(newX, newY);
      } else {
        console.log(e); 
      }
    } catch(e) {
     throw new Error("Можно прибавлять к вектору только вектор типа Vector"); 
    }
  }
  times(number) {
    this.x *= number;
    this.y *= number;
    return new Vector(this.x, this.y);
  }
}

class Actor {
  constructor(...args) {
    this.pos = args[0] || new Vector(0, 0);
    this.size = args[1] || new Vector(1, 1);
    this.speed = args[2] || new Vector(0, 0);
    try {
    	if (!(this.pos instanceof Vector) || !(this.size instanceof Vector) || !(this.speed instanceof Vector) ) {
      	console.log(e)
    	}
    } catch(e) {
    	throw new Error("Операция доступна только для объекта типа Vector");
    }
  }
  act() {   
  }
  get left() {
    return this.pos.x;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get top() {
    return this.pos.y;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  get type() {
    return "actor";
  }
  isIntersect(obj) {
	   try {
	   	if (obj instanceof Actor && typeof obj !== "undefined") {
		    if (this === obj) {
		      return false;
		    }
		     if (this.right > obj.left && this.left < obj.right && this.top < obj.bottom && this.bottom > obj.top) {
		        return true;
		      }
		      return false;
		    } else {
		    	console.log(e);
		    }
	    } catch (e) {
	    	throw new Error("Операция доступна только для объектов типа Actor");
	    }
  }
}

class Level {
  constructor(...args) {
    this.grid = args[0] || [];
    this.actors = args[1] || [];
    this.height = this.grid.length;
    this.width = Math.max(0,...this.grid.map(el => el.length));
    this.player = this.actors.find(el => el.type === "player");
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished() {
    return this.status !== null && this.finishDelay < 1 ? true : false;
  }
  actorAt(actor){
    return this.actors.find(el => {
      if (el instanceof Actor) {
        if (actor.isIntersect(el)){
          return el;
        }
      }
    });
  }
  obstacleAt(pos, size) {
    let right = pos.x + size.x;
    let left = pos.x;
    let top = pos.y;
    let bottom = pos.y + size.y;
    if (left < 0 || right > this.grid.length || top < 0 ) {
      return "wall";
    } else if (bottom > this.height) {
      return "lava";
    } else {
    	let result;
    	this.grid.forEach(str => {
    		result = str.find(ceil => {
    			return typeof ceil !== undefined && bottom !== this.grid.indexOf(str);
    		})
    	})
    	return result;
    }
  }
  removeActor(actor) {
    let index = this.actors.indexOf(this.actors.find(el => el === actor));
    this.actors.splice(index, 1);
  }
  noMoreActors(type) {
    return this.actors.every(el => el.type !== type);
  }
  playerTouched(type, ...args) {
    let obj = args[0];
    if (type === "lava" || type === "fireball") {
      this.status = "lost";
    }
    if (type === "coin" && obj) {
      this.removeActor(obj);
      this.noMoreActors(type) ? this.status = "won" : this.status = null;
    }
  }
}

class Player extends Actor {
  constructor(pos) {
    super(pos);
    this.pos = new Vector(this.pos.x, this.pos.y - 0.5) ;
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }
  get type() {
    return "player";
  }
}