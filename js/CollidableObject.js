﻿function CollidableObject(spriteImage, pPosX, pPosY, pSizeX, pSizeY, pOffsetX, pOffsetY, isTrigger) {
    this.posY = pPosY;
    this.posX = pPosX;
    this.sizeX = pSizeX;
    this.sizeY = pSizeY;
    this.sprite = spriteImage;
    this.isTrigger = isTrigger;
    this.disableDraw = false;
    this.offsetX = pOffsetX;
    this.offsetY = pOffsetY;
    this.type = "Standard";
    //overwrite this if you're a trigger
    this.fireTrigger = function fireTrigger() {

    }

    this.drawCollidable = function drawCollidable()
    {
        try {
            if (this.sprite && this.sizeX >= 0 && this.sizeY >= 0 && this.offsetX >= 0 && this.offsetY >= 0) {
                ctx.drawImage(this.sprite, this.offsetX, this.offsetY,
                    this.sizeX, this.sizeY,
                    this.posX, this.posY,
                    this.sizeX, this.sizeY);
            }
        }
        catch (e)
        {
            throw new UserException("fuck!");
        }
    }

    this.getBounds = function getBounds() {
        return new Bounds(this.posX, this.posY, this.posX + this.sizeX, this.posY + this.sizeY);
    }

    this.drawBounds = function drawBounds() {
        ctx.fillStyle = "rgba(255,0,0,0.3)";
        rect(this.posX, this.posY, this.sizeX, this.sizeY);
    }
}