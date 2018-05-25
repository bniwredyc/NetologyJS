'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  /* Branch searchingBugs */
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

class LevelParser {
  constructor(dict) {
    this.dict = dict || {};
  }

  actorFromSymbol(symbol) {
    return symbol ? this.dict[symbol] : undefined;
  }
  obstacleFromSymbol(symbol) {
    switch(symbol) {
      case undefined:
      return undefined;
      break;
      case "x": 
      return "wall";
      break;
      case "!": 
      return "lava";
      break;
    }
  }
  createGrid(strArray) {
    return strArray.map(str => {
      let arrArray = [];
      [...str].forEach(ceil => {
        arrArray.push(this.obstacleFromSymbol(ceil))
      })
      return strArray ? arrArray : [];
    });
  }
  createActors(strArray) {
    let actorsArray = [];
    strArray.map((str, y) => {
      [...str].forEach((ceil, x) => {
        if (typeof this.actorFromSymbol(ceil) === "function" && new (this.actorFromSymbol(ceil))() instanceof Actor)
          actorsArray.push(new (this.actorFromSymbol(ceil))(new Vector(x, y)));
      })
    })
    return actorsArray;
  }
  parse(strArray) {
    return new Level(this.createGrid(strArray), this.createActors(strArray));
  }
}

class Fireball extends Actor {
	constructor(...args) {
		super(...args);
		this.pos = args[0] || new Vector(0, 0);
		this.size = new Vector(1, 1);
		this.speed = args[1] || new Vector(0, 0);
	}

	get type() {
		return "fireball";
	}
	getNextPosition(time = 1) {
		return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
	}
	handleObstacle() {
		this.speed.x = -this.speed.x;
		this.speed.y = -this.speed.y;
	}
	act(time, level) {
		level.obstacleAt(this.getNextPosition(time), this.size) ? this.handleObstacle() : this.pos = this.getNextPosition(time);
	}
}

class HorizontalFireball extends Fireball {
	constructor() {
		super();
		this.speed = new Vector(2, 0);
	}
}

class VerticalFireball extends Fireball {
	constructor() {
		super();
		this.speed = new Vector(0, 2);
	}
}

class FireRain extends Fireball {
	constructor(...args) {
		super(...args);
		this.begin = args[0];
		this.speed = new Vector(0, 3);
	}
	handleObstacle() {
		this.pos = this.begin;
		this.speed = this.speed;
	}
}

class Coin extends Actor {
	constructor(pos) {
		super(pos);
		this.pos = new Vector(this.pos.x + 0.2, this.pos.y + 0.1);
		this.begin = this.pos;
		this.size = new Vector(0.6, 0.6);
		this.spring = Math.random() * 2 * (Math.PI);
		this.springSpeed = 8;
		this.springDist = 0.07;
	}
	get type() {
		return "coin";
	}
	updateSpring(time = 1) {
		this.spring = this.spring + this.springSpeed * time;
	}
	getSpringVector() {
		return new Vector(0, Math.sin(this.spring) * this.springDist)
	}
	getNextPosition(time = 1) {
		this.updateSpring(time);
		return this.begin.plus(this.getSpringVector());
	}
	act(time) {
		this.pos = this.getNextPosition(time);
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