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
        //then divide innerWidth by speed to get final value
        //this.speed = 1000 - (5 * 100);
        this.speed = 5;
        this.ammo = 0;
    }

    detectCollisions(collectibles) {
        // Check for collisions
        // use index to break out at first match
        //console.log("start");
        collectibles.map(collectible => {
            if (rectIntersect(this.x, this.y, this.width, this.height, collectible.x, collectible.y, collectible.width, collectible.height)){
                collectible.isColliding = true;
                //collectible.isColliding = true;
                //add stats according to type
                switch (collectibles.type) {
                    case "hint":
                        this.hints.push(collectible.value);
                        break;
                    case "health":
                        this.health += collectible.value;
                        break;
                    case "coin":
                        this.coins += collectible.value;
                        break;
                    case "ammo":
                        this.ammo += collectible.value;
                        break;
                }
                console.log("hit");
            }
        });
        return collectibles.filter(collectible => collectible.isColliding === false);
    }
}

//update spreadsheet values
function switchImage(value, array){
    player.img[`${value}Row`] = array[0];
    player.img[`${value}Column`] = array[1];
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Check x and y for overlap
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2){
        return false;
    }
    return true;
}