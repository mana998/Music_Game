class Player extends GameObject{
    constructor (x, y, width, height, username, coins, hints, health, points, img) {
        super(x, y, width, height, img);
        this.username = username;
        //coins to be spent in the shop
        this.coins = coins;
        //hints for final guess
        this.hints = hints;
        this.health = health;
        this.points = points;
        this.speed = 1;
    }

}