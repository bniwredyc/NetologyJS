'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  plus(obj) {
    // лучше наоборот: если аргументы неправильные - исключение,
    // а дальше основной код
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
    // здесь лучше исопльзовать задание значений аргументов по-умолчанию
    this.pos = pos || new Vector(0, 0);
    this.size = size || new Vector(1, 1);
    this.speed = speed || new Vector(0, 0);
    // это лучше проверить в начале
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
    // сначал проверки, потом код
   	if (obj instanceof Actor && typeof obj !== "undefined") {
	    if (this === obj) {
	      return false;
	    }
	    // если выражение в if это true или false, то можно писать просто return <выражение>
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
      // здесь лучше исопльзовать задание значений аргументов по-умолчанию
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
    // в find передаётся функция обратного вызова,
    // которая должна возвращать true или false
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
        // this.grid[y][x] лучше записать в переменную, чтобы 2 раза не писать
        if (this.grid[y][x]) {
          return this.grid[y][x];
        }
      }
    }
  }
  removeActor(actor) {
    // если объект не будет найден, то код отработает некорректно
    let index = this.actors.indexOf(actor);
    this.actors.splice(index, 1);
  }
  noMoreActors(type) {
    // можно написать короче с помощью метода some
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
      // непонятно зачем тут тренарный опреатор сравнения
      this.noMoreActors(type) ? this.status = "won" : this.status;
    }
  }
}

class LevelParser {
  constructor(dict) {
    // лучше использовать задание значения аргуметна по-умолчанию
    this.dict = dict || {};
  }

  actorFromSymbol(symbol) {
    // проверка лишняя
    return symbol ? this.dict[symbol] : undefined;
  }
  obstacleFromSymbol(symbol) {
    switch(symbol) {
      case "x": 
      return "wall";
      // если case заканчивается на return, то break не нужен
      break;
      case "!": 
      return "lava";
      break;
    }
  }
  createGrid(strArray) {
    return strArray.map(str => {
      let arrArray = [];
      str.split("").map(cell => {
        arrArray.push(this.obstacleFromSymbol(cell));
      });
      // непонятная строчка кода
      return strArray ? arrArray : [];
    });
  }
  createActors(strArray) {
    let actorsArray = [];
     strArray.map((str, y) => {
       str.split("").forEach((ceil, x) => {
         // лучше вызывать функцию actorFromSymbol 1 раз
         // и сохранить результат в переменной
         if (typeof this.actorFromSymbol(ceil) === "function") {
          // значение присваивается 1 раз, так что лучше использовать const
          let obj = new (this.actorFromSymbol(ceil))(new Vector(x,y));
          if (obj instanceof Actor) {
           actorsArray.push(obj);
          }
        }
       });
     });
     return actorsArray;
  }
  parse(strArray) {
    return new Level(this.createGrid(strArray), this.createActors(strArray));
  }
}

class Fireball extends Actor {
	constructor(pos, speed) {
		super(pos, speed);
		// pos, speed, size должны задаваться через родительский конструктор
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
    // pos, speed, size должны задаваться через родительский конструктор
		this.speed = new Vector(2, 0);
	}
}

class VerticalFireball extends Fireball {
	constructor(pos, speed) {
		super(pos, speed);
    // pos, speed, size должны задаваться через родительский конструктор
		this.speed = new Vector(0, 2);
	}
}

class FireRain extends Fireball {
	constructor(pos, speed) {
		super(pos, speed);
    // pos, speed, size должны задаваться через родительский конструктор
		this.begin = pos;
		this.speed = new Vector(0, 3);
	}
	handleObstacle() {
		this.pos = this.begin;
		// ?
		this.speed = this.speed;
	}
}

class Coin extends Actor {
	constructor(pos, size) {
		super(pos, size);
    // pos, speed, size должны задаваться через родительский конструктор
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
    // pos, speed, size должны задаваться через родительский конструктор
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
