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
    if (typeof arguments[0] === "undefined") { 
      this.pos = new Vector(0, 0);
    } else {
      this.pos = arguments[0];
    }
    if (typeof arguments[1] === "undefined") {
      this.size = new Vector(1, 1);
    } else {
      this.size = arguments[1];
    }
    if (typeof arguments[2] === "undefined") {
      this.speed = new Vector(0, 0);
    } else {
      this.speed = arguments[2];
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
    if (this === obj) {
      return false;
    }
     if (this.right > obj.left && this.left < obj.right && this.top < obj.bottom && this.bottom > obj.top) {
        return true;
      }
      return false;
  }
}