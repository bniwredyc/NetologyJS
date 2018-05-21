'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  plus(obj) {
    try {
      if (obj instanceof Vector) {
        obj.x += this.x;
        obj.y += this.y;
        return new Vector(obj.x, obj.y);
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