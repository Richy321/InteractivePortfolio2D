function CollidableObject(spriteImage, pPosX, pPosY, pSizeX, pSizeY, pOffsetX, pOffsetY, isTrigger) {
    this.posY = pPosY;
    this.posX = pPosX;
    this.sizeX = pSizeX;
    this.sizeY = pSizeY;
    this.sprite = spriteImage;
    this.isTrigger = isTrigger;
    this.disableDraw = false;
    this.offsetX = pOffsetX;
    this.offsetY = pOffsetY;
    //overwrite this if you're a trigger
    this.fireTrigger = function fireTrigger() {

    }

    this.drawCollidable = function drawCollidable() {
        //ctx.drawImage(this.sprite, this.posX, this.posY, this.sizeX, this.sizeY);
        ctx.drawImage(this.sprite, this.offsetX, this.offsetY,
            this.sizeX, this.sizeY,
            this.posX, this.posY,
            this.sizeX, this.sizeY);
    }

    this.getBounds = function getBounds() {
        return new Bounds(this.posX, this.posY, this.posX + this.sizeX, this.posY + this.sizeY);
    }

    this.drawBounds = function drawBounds() {
        ctx.fillStyle = "rgba(255,0,0,0.3)";
        rect(this.posX, this.posY, this.sizeX, this.sizeY);
    }
}