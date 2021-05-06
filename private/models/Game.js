//const GameObject = require("../../public/models/GameObject").GameObject;
const Collectible = require("../../public/models/Collectible").Collectible;
const Img = require("../../public/models/Img").Img;
const UtilsObject = require("../../private/models/Utils").Utils;

const Utils = new UtilsObject();

const CollectibleWidth = 32;
const CollectibleHeight = 32;

//items with variable amount
let items = new Map();
items.set("heart", new Img("./images/character/bard.png", 0, 0, 0, 5, 1));
items.set("coin", new Img("./images/character/bard.png", 0, 0, 0, 5, 1));
items.set("ammo", new Img("./images/character/bard.png", 0, 0, 0, 5, 1));
//depends on song
const hint = new Img("./images/character/bard.png", 0, 0, 0, 5, 1);

class Game {
    constructor () {
        this.level = 1;
        this.time = 30;
        this.players = [];
        this.on = false;
        //set default to new
        this.stage;
    }

    generateCollectibles(song) {
        let collectibles = [];
        for(let [key, value] of items) {
            let amount = Utils.getRandomNumber(5, this.level * 10);
            //make sure there are not too many items
            //need to think more about this
            while (amount > 100) {
                amount /= 10;
            }
            for (let i = 0; i < amount; i++) {
                collectibles.push(new Collectible(Math.random(), -CollectibleHeight, CollectibleWidth, CollectibleHeight, value, Utils.getRandomNumber(1, this.level), key))
            }
        }
        //add hints
        song.hints.map((arrayHint) => {
            collectibles.push(new Collectible(Math.random(), -CollectibleHeight, CollectibleWidth, CollectibleHeight, hint, Utils.getRandomNumber(1, this.level), "hint", arrayHint));
        })
        Utils.shuffleArray(collectibles);
        //console.log(collectibles);
        return collectibles;
    }
}

module.exports = {
    Game: Game
};