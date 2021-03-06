collectSound = new Sound(`./sounds/collect/collect.wav`);
bombSound = new Sound(`./sounds/collect/bomb.wav`);

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
        this.speed = 5;
        this.answer = [];
    }

    detectCollisions(collectibles) {
        // Check for collisions
        // use index to break out at first match
        collectibles.map(collectible => {
            if (rectIntersect(this.x, this.y, this.width, this.height, collectible.x, collectible.y, collectible.width, collectible.height)){
                collectible.isColliding = true;
                //add stats according to type
                switch (collectible.type) {
                    case "hint":
                        this.hints.push(collectible.value);
                        $(`#hints-value`).text(this.hints.length);
                        collectSound.play();
                        break;
                    case "heart":
                        this.health += collectible.value;
                        $(`#health-value`).text(this.health);
                        collectSound.play();
                        break;
                    case "coin":
                        this.coins += collectible.value;
                        $(`#coins-value`).text(this.coins);
                        collectSound.play();
                        break;
                    case "hit":
                        this.health -= collectible.value;
                        $(`#health-value`).text(this.health);
                        bombSound.play();
                        this.checkHealth();
                        break;
                }
            }
        });
        return collectibles;
    }

    showCollectibles() {
        $("main").append(this.renderPlayerCollectibles());
    }
    
    renderPlayerCollectibles() {
        let result = `<div class="player-collectibles">`;
        let items =  ["health", "coins", "points", "speed", "hints"];
        items.map(item => {
            result += this.renderPlayerCollectible(item);
        });
        result += `</div>`;
        return result;
    }

    renderPlayerCollectible(collectible) {
        return `<div class="player-collectible">
            <img class="collectible-img" src="./images/collectibles/${collectible}.png">
            <span id="${collectible}-value">${collectible !== "hints" ? this[collectible] : this[collectible].length}</span>
        </div>`
    }

    checkHealth() {
        if (this.health <= 0) {
            socket.emit("client lost", {player: this})
        }
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