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
    try {
        if(!(this.pos instanceof Vector) || !(this.size instanceof Vector) || !(this.speed instanceof Vector)) {
          throw new Error("ошбика");
        }
    } catch(e) {
      console.log(e);
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