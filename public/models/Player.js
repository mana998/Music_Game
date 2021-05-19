class Player extends GameObject{
    constructor (x, y, width, height, username, img) {
        super(x, y, width, height, img);
        this.username = username;
        //coins to be spent in the shop
        this.coins = 0;
        //hints for final guess
        this.hints = [];
        this.health = 5;
        this.points = 0;
        //then divide innerWidth by speed to get final value
        //this.speed = 1000 - (5 * 100);
        this.speed = 5;
        this.answer = [];
    }

    detectCollisions(collectibles) {
        // Check for collisions
        // use index to break out at first match
        //console.log("start");
        collectibles.map(collectible => {
            if (rectIntersect(this.x, this.y, this.width, this.height, collectible.x, collectible.y, collectible.width, collectible.height)){
                collectible.isColliding = true;
                //console.log("intersection");
                //collectible.isColliding = true;
                //add stats according to type
                //console.log("type", collectibles.type);
                switch (collectible.type) {
                    case "hint":
                        this.hints.push(collectible.value);
                        break;
                    case "heart":
                        this.health += collectible.value;
                        break;
                    case "coin":
                        this.coins += collectible.value;
                        break;
                    case "hit":
                        this.health -= collectible.value;
                        break;
                }
                //console.log(collectible.type, ":", collectible.value);
                //console.log(this);
            }
        });
        //console.log("hit");
        //return collectibles.filter(collectible => collectible.isColliding === false);
        return collectibles;
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