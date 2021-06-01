const Collectible = require("../../public/models/Collectible").Collectible;
const Img = require("../../public/models/Img").Img;
const UtilsObject = require("./Utils").Utils;

const Utils = new UtilsObject();

const CollectibleWidth = 16;
const CollectibleHeight = 16;

//items with variable amount
let items = new Map();
items.set("heart", new Img("./images/collectibles/health.png", 0, 0, 1, 1, 0));
items.set("coin", new Img("./images/collectibles/coins.png", 0, 0, 1, 1, 0));
items.set("hit", new Img("./images/collectibles/hit.png", 0, 0, 1, 1, 0));
//depends on song
const hint = new Img("./images/collectibles/hints.png", 0, 0, 1, 1, 0);

class Game {
    constructor () {
        this.level = 1;
        this.players = [];
        //whether game started
        this.on = false;
        //remaining songs
        this.songs = [];
        //current song
        this.song;
        //set default to new
        this.stage = "starting";
    }

    loadSongs(list) {
        this.songs = [];
        for(let key in list) {
            this.songs.push(list[key]);
        }
    }

    generateCollectibles(song) {
        let collectibles = [];
        for(let [key, value] of items) {
            let amount = Utils.getRandomNumber(5, 10 + this.level * 2);
            for (let i = 0; i < amount; i++) {
                collectibles.push(new Collectible(Utils.getRandomNumber(0,500 - CollectibleWidth), -CollectibleHeight, CollectibleWidth, CollectibleHeight, value, Utils.getRandomNumber(1, 5 + this.level), key))
            }
        }
        //add hints
        this.song = this.getHints(song);
        this.songs.splice(song, 1);
        this.song.map((arrayHint) => {
            collectibles.push(new Collectible(Utils.getRandomNumber(0,500 - CollectibleWidth), -CollectibleHeight, CollectibleWidth, CollectibleHeight, hint, Utils.getRandomNumber(1, 5 + this.level), "hint", arrayHint));
        });
        Utils.shuffleArray(collectibles);
        return collectibles;
    }

    getHints(song) {
        let hints = this.songs[song].split(",");
        return hints;
    }
}

module.exports = {
    Game: Game
};