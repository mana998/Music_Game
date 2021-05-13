class Utils {

    getRandomNumber(min, max, floor) {
        let random = Math.random() * (max - min) + min;
        return floor ? Math.floor(random) : random;
    }

    shuffleArray(arr) {
        //Durstenfeld's shuffle 
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); //index from 0 to i
            [arr[i], arr[j]] = [arr[j], arr[i]]; //swap
        }
        return arr;
    }


}

module.exports = {Utils}