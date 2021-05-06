class Img {
    constructor (src, startRow, startColumn, rows, columns, speed, size, currentRow, currentColumn) {
        //src img
        this.src = src
        if (typeof exports !== 'undefined'&& typeof module !== 'undefined' && module.exports) {
            this.img = `<img src="${src}">`;
        } else {
            this.img = new Image();
            this.img.src = src;
        }
        //start position on stylesheet
        this.startRow = startRow;
        this.startColumn = startColumn;
        //length of animation
        this.rows = rows;
        this.columns = columns;
        //current position
        //passed on the client to draw other players else it wouldnt be animated
        this.currentRow = currentRow || startRow;
        this.currentColumn = currentColumn || startColumn;
        //animation speed
        this.speed = speed;
        this.currentSpeed = 0;
        //size multiplier
        this.size = size || 1;
    }

    draw (ctx, x, y, width, height) {
        let startWidth = this.currentColumn * width;
        let startHeight = this.currentRow * height;
        this.currentSpeed++;
        if (this.currentSpeed === this.speed) {
            this.currentColumn++;
            this.currentSpeed = 0;
        }
        if (this.currentColumn > this.columns) {
            this.currentColumn = this.startColumn;
            this.currentRow++;
            if (this.currentRow > this.rows){
                this.currentRow = this.startRow;
            }
        }
        ctx.drawImage(this.img, startWidth, startHeight, width, height, x, y, width * this.size, height * this.size);
    }

}

if (typeof exports !== 'undefined'&& typeof module !== 'undefined' && module.exports) module.exports = {Img};