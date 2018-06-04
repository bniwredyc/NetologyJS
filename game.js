'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  plus(obj) {
    if (obj instanceof Vector) {
      const newX = this.x + obj.x;
      const newY = this.y + obj.y;
      return new Vector(newX, newY);
    }
    throw new Error("Ожидается объект типа 'Vector'");
  }
  times(number) {
  	const newX = this.x * number;
  	const newY = this.y * number;
    return new Vector(newX, newY);
  }
}


class Actor {
  constructor(pos, size, speed) {
    this.pos = pos || new Vector(0, 0);
    this.size = size || new Vector(1, 1);
    this.speed = speed || new Vector(0, 0);
  	if (!(this.pos instanceof Vector) || !(this.size instanceof Vector) || !(this.speed instanceof Vector) ) {
    	throw new Error("Ожидается объект типа 'Vector'");
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
   	if (obj instanceof Actor && typeof obj !== "undefined") {
	    if (this === obj) {
	      return false;
	    }
	     if (this.right > obj.left && this.left < obj.right && this.top < obj.bottom && this.bottom > obj.top) {
	        return true;
	      }
	      return false;
	    }
    throw new Error("Ожидается объект типа 'Actor'");
  }
}

class Level {
    constructor(grid, actors) {
      this.grid = grid || [];
      this.actors = actors || [];
      this.height = this.grid.length;
      this.width = Math.max(0,...this.grid.map(el => el.length));
      this.player = this.actors.find(el => el.type === "player");
      this.status = null;
      this.finishDelay = 1;
    }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
  actorAt(actor){
    return this.actors.find(el => {
      if (actor.isIntersect(el)){
        return el;
      }
    });
  }
  obstacleAt(pos, size) {
    const left = Math.floor(pos.x);
    const right = Math.ceil(pos.x + size.x);
    const top = Math.floor(pos.y);
    const bottom = Math.ceil(pos.y + size.y);

    if (left < 0 || right > this.width || top < 0 ) {
      return "wall";
    }

    if (bottom > this.height) {
      return "lava";
    }

  	for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        if (this.grid[y][x]) {
          return this.grid[y][x];
        }
      }
    }
  }
  removeActor(actor) {
    let index = this.actors.indexOf(actor);
    this.actors.splice(index, 1);
  }
  noMoreActors(type) {
    if (this.actors.length != 0) {
      return this.actors.every(el => el.type !== type);
    }
    return true;
  }
  playerTouched(type, actor) {
    let obj = actor;
    if (type === "lava" || type === "fireball") {
      this.status = "lost";
    }
    if (type === "coin" && obj) {
      this.removeActor(obj);
      this.noMoreActors(type) ? this.status = "won" : this.status;
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
      str.split("").map(ceil => {
        arrArray.push(this.obstacleFromSymbol(ceil));
      });
      return strArray ? arrArray : [];
    })
  }
  createActors(strArray) {
    let actorsArray = [];
     strArray.map((str, y) => {
       str.split("").forEach((ceil, x) => {
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
	constructor(pos, speed) {
		super(pos, speed);
		this.pos = pos || new Vector(0, 0);
		this.size = new Vector(1, 1);
		this.speed = speed || new Vector(0, 0);
	}

	get type() {
		return "fireball";
	}
	getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
	}
	handleObstacle() {
		this.speed = this.speed.times(-1);
	}
	act(time, level) {
    if (level.obstacleAt(this.getNextPosition(time), this.size)) {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);
    }
  }
}

class HorizontalFireball extends Fireball {
	constructor(pos, speed) {
		super(pos, speed);
		this.speed = new Vector(2, 0);
	}
}

class VerticalFireball extends Fireball {
	constructor(pos, speed) {
		super(pos, speed);
		this.speed = new Vector(0, 2);
	}
}

class FireRain extends Fireball {
	constructor(pos, speed) {
		super(pos, speed);
		this.begin = pos;
		this.speed = new Vector(0, 3);
	}
	handleObstacle() {
		this.pos = this.begin;
		this.speed = this.speed;
	}
}

class Coin extends Actor {
	constructor(pos, size) {
		super(pos, size);
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

const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball
};

const parser = new LevelParser(actorDict);

loadLevels().then((win) => {
    runGame(JSON.parse(win), parser, DOMDisplay).then(() => alert("Поздравляем! Вы одержали победу!"))
  });