//Player object
function Player(startPosX, startPosY) 
{
    this.positionX = startPosX;
    this.positionY = startPosY;
    this.deltaX = 6;
    this.deltaY = 6;
    this.circleSize = 10;

    this.targetX = -1;
    this.targetY = -1;
    this.hasTarget = false;

    //load sprite frames
    this.sprite = new Image();
    this.sprite.src = "./Media/IWDCHAR.png";
    this.curFrameNo = 0;
    this.frameWidth = 21;
    this.frameHeight = 30;
    this.frameCount = 3;
    this.upFrames = new Array();
    this.upFrames[0] = new SpriteFrame(0, 0, this.frameWidth, this.frameHeight);
    this.upFrames[1] = new SpriteFrame(24, 0, this.frameWidth, this.frameHeight);
    this.upFrames[2] = new SpriteFrame(48, 0, this.frameWidth, this.frameHeight);
    this.rightFrames = new Array();
    this.rightFrames[0] = new SpriteFrame(2, 32, this.frameWidth, this.frameHeight);
    this.rightFrames[1] = new SpriteFrame(25, 32, this.frameWidth, this.frameHeight);
    this.rightFrames[2] = new SpriteFrame(48, 32, this.frameWidth, this.frameHeight);
    this.downFrames = new Array();
    this.downFrames[0] = new SpriteFrame(2, 64, this.frameWidth, this.frameHeight);
    this.downFrames[1] = new SpriteFrame(25, 64, this.frameWidth, this.frameHeight);
    this.downFrames[2] = new SpriteFrame(49, 64, this.frameWidth, this.frameHeight);
    this.leftFrames = new Array();
    this.leftFrames[0] = new SpriteFrame(0, 95, this.frameWidth, this.frameHeight);
    this.leftFrames[1] = new SpriteFrame(24, 95, this.frameWidth, this.frameHeight);
    this.leftFrames[2] = new SpriteFrame(48, 95, this.frameWidth, this.frameHeight);
    this.curFrame = this.downFrames[0];
    this.curDirection = "Down";
    this.curFrameNo = 0;
    this.frameDelay = 0.20;
    this.frameDuration = this.frameDelay;
    this.spriteScale = 2;

    this.path = [];
    this.pathIndex = 0;
}
Player.prototype.updatePlayer = function updatePlayer(deltaTime) 
{
    if (loading)
        return;
    var oldPositionX = this.positionX;
    var oldPositionY = this.positionY;
    var oldVirtualCamOffsetX = virtualCameraOffsetX;
    var oldVirtualCamOffsetY = virtualCameraOffsetY;

    this.curDirection = "None";

    if (38 in keys && keys[38]) { //up
        if (this.positionY - this.deltaY > 0)
        {
            this.curDirection = "Up";
        }
    }
    else if (40 in keys && keys[40]) { //down
        if (this.positionY + this.deltaY < (HEIGHT - this.frameHeight * this.spriteScale)) {
            this.curDirection = "Down";
        }
    }
    else if (37 in keys && keys[37]) { //left
        if (this.positionX - this.deltaX > 0)
        {
            this.curDirection = "Left";
        }
    }

    else if (39 in keys && keys[39]) { //right
        if (this.positionX + this.deltaX < (WIDTH - this.frameWidth * this.spriteScale))
        {
            this.curDirection = "Right";
        }
    }


    //Navigate path
    if (this.path.length > 0 && this.pathIndex < this.path.length) {
        this.targetX = this.path[this.pathIndex].x;
        this.targetY = this.path[this.pathIndex].y;
        this.hasTarget = true;

        var centreTargX = this.targetX - (this.frameWidth * this.spriteScale) * 0.5;
        var centreTargY = this.targetY - (this.frameHeight * this.spriteScale) * 0.5;

        if (this.positionX == centreTargX && this.positionY == centreTargY) {
            this.pathIndex++;
        }
    }
    else
    {
        this.hasTarget = false;
        this.pathIndex = -1;
        this.targetX = -1;
        this.targetY = -1;
        this.path = [];
    }

    if (this.hasTarget)
    {
        var centreTargX = this.targetX - (this.frameWidth * this.spriteScale) * 0.5;
        var centreTargY = this.targetY - (this.frameHeight * this.spriteScale) * 0.5;

        var dirX = centreTargX - this.positionX;
        var dirDeltaX = this.deltaX;
        
        if (dirX < 0) {
            dirDeltaX = -this.deltaX;
        }

        if (Math.abs(dirX) < this.deltaX) {
            this.positionX += dirX;
            this.curDirection = "None";
        }

        var dirY = centreTargY - this.positionY;
        var dirDeltaY = this.deltaY;

        if (dirY < 0) {
            dirDeltaY = -this.deltaY;
        }

        if (Math.abs(dirY) < this.deltaY) {
            this.positionY += dirY;
            this.curDirection = "None";
        }

        
        if (Math.abs(dirX) > Math.abs(dirY))
        {
            if (dirX > 0)
                this.curDirection = "Right";
            else if (dirX < 0)
                this.curDirection = "Left";
        }
        else
        {
            if (dirY > 0)
                this.curDirection = "Down";
            else if (dirY < 0)
                this.curDirection = "Up";
        }
    }

    if (this.curDirection == "Up")
    {
        if (this.curFrameNo < 2)
        {
            this.frameDuration -= deltaTime;
            if (this.frameDuration <= 0)
            {
                this.curFrameNo++;
                this.frameDuration = this.frameDelay;
            }
        }
        else
        {
            this.curFrameNo = 0;
        }
        if (!collided)
        {
            this.positionY -= this.deltaY;
            virtualCameraOffsetY += this.deltaY;
        }
        this.curFrame = this.upFrames[this.curFrameNo];
    }


    if (this.curDirection == "Down")
    {
        if (this.curFrameNo < 2) {
            this.frameDuration -= deltaTime;
            if (this.frameDuration <= 0) {
                this.curFrameNo++;
                this.frameDuration = this.frameDelay;
            }
        }
        else
        {
            this.curFrameNo = 0;
        }
        if (!collided)
        {
            this.positionY += this.deltaY;
            virtualCameraOffsetY -= this.deltaY;
        }
        this.curFrame = this.downFrames[this.curFrameNo];
    }

    if (this.curDirection == "Left")
    {
        if (this.curFrameNo < 2) {
            this.frameDuration -= deltaTime;
            if (this.frameDuration <= 0) {
                this.curFrameNo++;
                this.frameDuration = this.frameDelay;
            }
        }
        else
        {
            this.curFrameNo = 0;
        }
        if (!collided)
        {
            this.positionX -= this.deltaX;
            virtualCameraOffsetX += this.deltaX;
        }
        this.curFrame = this.leftFrames[this.curFrameNo];
    }

    if (this.curDirection == "Right")
    {
        if (this.curFrameNo < 2) {
            this.frameDuration -= deltaTime;
            if (this.frameDuration <= 0) {
                this.curFrameNo++;
                this.frameDuration = this.frameDelay;
            }
        }
        else
        {
            this.curFrameNo = 0;
        }
        if (!collided)
        {
            this.positionX += this.deltaX;
            virtualCameraOffsetX -= this.deltaX;
        }
        this.curFrame = this.rightFrames[this.curFrameNo];
    }

    //check collisions
    var playerBnd = this.getBounds();

    var collidedTrigger = false;
    var collided = false;

    for (i = 0; i < collidables.length; i++) {
        var bnd = collidables[i].getBounds();
        if (doBoundsIntersect(playerBnd, bnd)) {
            if (collidables[i].isTrigger) {
                if (justFiredTrigger == false) {
                    collidables[i].fireTrigger();
                }
                collidedTrigger = true;
            }
            else {
                this.positionX = oldPositionX;
                this.positionY = oldPositionY;
                virtualCameraOffsetX = oldVirtualCamOffsetX;
                virtualCameraOffsetY = oldVirtualCamOffsetY;
                break;
            }
        }
    }


    //if not colliding with any triggers reset just fired flag
    //-N.B could be an issue here in future with close/overlapping triggers but ok for now.
    if (collidedTrigger == false) {
        justFiredTrigger = false;
    }
}

Player.prototype.drawPlayer = function drawPlayer()
{
    ctx.drawImage(this.sprite, this.curFrame.spriteXOffset, this.curFrame.spriteYOffset, this.frameWidth, this.frameHeight, this.positionX, this.positionY, this.frameWidth * this.spriteScale, this.frameHeight * this.spriteScale);
}

Player.prototype.drawBounds = function drawBounds() 
{
    ctx.fillStyle = "rgba(255,0,0,0.3)";
    rect(this.positionX, this.positionY + (this.frameHeight * this.spriteScale) / 2, this.frameWidth * this.spriteScale, this.frameHeight / 2 * this.spriteScale);
}

Player.prototype.getBounds = function getBounds() 
{
    return new Bounds(this.positionX, this.positionY + (this.frameHeight * this.spriteScale) / 2, this.positionX + this.frameWidth * this.spriteScale, this.positionY + this.frameWidth * this.spriteScale);
}
