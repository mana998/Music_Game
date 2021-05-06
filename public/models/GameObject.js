class GameObject {
    constructor (x, y, width, height, img) {
        //position
        this.x = x;
        this.y = y;
        //size
        this.width = (width) ? width : 0;
        this.height = (height) ? height : 0;
        //collision
        this.isColliding = false;
        //image
        this.img = img;
    }

    draw(ctx) {
        this.img.draw(ctx, this.x, this.y, this.width, this.height);
    }
    
}

if (typeof exports !== 'undefined'&& typeof module !== 'undefined' && module.exports) module.exports = {GameObject};