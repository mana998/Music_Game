class Utils {

    getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    shuffleArray(arr) {
        return arr;
    }
}

module.exports = {Utils}