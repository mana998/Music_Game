class Character {
    constructor (right, left, middle) {
        this.right = right;
        this.left = left;
        this.middle = middle
    }
}

const characters = [
    new Character([2,0], [1,0], [0,1]),
    new Character([2,3], [1,3], [0,4]),
    new Character([2,6], [1,6], [0,7]),
    new Character([2,9], [1,9], [0,10]),
    new Character([6,0], [5,0], [4,1]),
    new Character([6,3], [5,3], [4,4]),
    new Character([6,6], [5,6], [4,7]),
    new Character([6,9], [5,9], [4,10])
]