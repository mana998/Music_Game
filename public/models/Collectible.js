
if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) GameObject = require("../../public/models/GameObject").GameObject;

class Collectible extends GameObject {
    constructor (x, y, width, height, img, speed, type, value) {
        super(x, y, width, height, img);
        this.speed = speed;
        //hint, health, coin, hit
        this.type = type;
        //hint text or number
        this.value = value || 1;
    }
}

if (typeof exports !== 'undefined'&& typeof module !== 'undefined' && module.exports) module.exports = {Collectible};