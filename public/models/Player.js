class Player extends GameObject{
    constructor (x, y, width, height, username, img) {
        super(x, y, width, height, img);
        this.username = username;
        //coins to be spent in the shop
        this.coins = 0;
        //hints for final guess
        this.hints = 0;
        this.health = 5;
        this.points = 0;
        this.speed = 5;
    }

}