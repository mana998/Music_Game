//const GameObject = require("../../public/models/GameObject").GameObject;
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
        //this.time = 30;
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
        for(let key in list) {
            this.songs.push(list[key]);
        }
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
                collectibles.push(new Collectible(Utils.getRandomNumber(0,500 - CollectibleWidth), -CollectibleHeight, CollectibleWidth, CollectibleHeight, value, Utils.getRandomNumber(1, 20), key))
                //collectibles.push(new Collectible(Utils.getRandomNumber(0,500 - CollectibleWidth), -CollectibleHeight, CollectibleWidth, CollectibleHeight, value, Utils.getRandomNumber(1, this.level), key))
            }
        }
        //add hints
        this.song = this.getHints(song);
        this.songs.splice(song, 1);
        console.log("songs", this.songs);
        //this.songs.splice(song, 1);
        console.log("song",this.song, this.song.length);
        this.song.map((arrayHint) => {
            collectibles.push(new Collectible(Utils.getRandomNumber(0,500 - CollectibleWidth), -CollectibleHeight, CollectibleWidth, CollectibleHeight, hint, Utils.getRandomNumber(1, this.level), "hint", arrayHint));
        });
        Utils.shuffleArray(collectibles);
        //console.log(collectibles);
        //console.log(collectibles);
        return collectibles;
    }

    getHints(song) {
        //console.log(song);
        let hints = this.songs[song].split(",");
        //maybe add length of the song or leave it as set
        return hints;
    }
}

module.exports = {
    Game: Game
};