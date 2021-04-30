class Img {
    constructor (src, startRow, startColumn, rows, columns, speed) {
        //src img
        this.src = src;
        //start position on stylesheet
        this.startRow = startRow;
        this.startColumn = startColumn;
        //length of animation
        this.rows = rows;
        this.columns = columns;
        //animation speed
        this.speed = speed;
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
        ctx.drawImage(this.src, startWidth, startHeight, width, height, x, y, this.width, this.height);
    }

}