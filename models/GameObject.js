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

}