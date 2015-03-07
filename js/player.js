//Player object
function Player(startPosX, startPosY) 
{
    this.deltaX = 6;
    this.deltaY = 6;
    this.circleSize = 10;

    this.targetX = -1;
    this.targetY = -1;
    this.innerPathTargetX = -1;
    this.innerPathTargetY = -1;
    this.hasTarget = false;

    //load sprite frames
    this.sprite = new Image();
    this.sprite.src = "./media/IWDCHAR.png";
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
    this.curDirection = "None";
    this.curFrameNo = 0;
    this.frameDelay = 0.20;
    this.frameDuration = this.frameDelay;
    this.spriteScale = 2;

    

    this.positionX = Math.floor(startPosX - (this.frameWidth * this.spriteScale) * 0.5);
    this.positionY = Math.floor(startPosY - (this.frameHeight * this.spriteScale) * 0.5);

    this.targetStack = [];
    this.path = [];
    this.pathIndex = 0;
    this.disableChangeAnimationDirection = false;
    this.savedframeArray = [];

    this.disableMovement = false;
}
Player.prototype.updatePlayer = function updatePlayer(deltaTime) 
{
    if (loading || this.disableMovement)
        return;

    var oldPositionX = this.positionX;
    var oldPositionY = this.positionY;
    var oldVirtualCamOffsetX = virtualCameraOffsetX;
    var oldVirtualCamOffsetY = virtualCameraOffsetY;
    var dirDeltaY = this.deltaY;
    var dirDeltaX = this.deltaX;

    var movementKeyPressed = ((38 in keys && keys[38]) ||
        (40 in keys && keys[40]) ||
        (37 in keys && keys[37]) ||
        (39 in keys && keys[39]));
    //Navigate path
    if (!movementKeyPressed && this.path.length > 0 && this.pathIndex < this.path.length) 
    {
        this.targetX = this.path[this.pathIndex].x;
        this.targetY = this.path[this.pathIndex].y;
        this.hasTarget = true;

        var centreTargX = this.targetX - (this.frameWidth * this.spriteScale) * 0.5;
        var centreTargY = this.targetY - (this.frameHeight * this.spriteScale) * 0.5;

        if (this.positionX == centreTargX && this.positionY == centreTargY) {
            this.pathIndex++;

            if ((this.pathIndex == 0 || this.pathIndex == this.path.length - 1) &&
                this.disableChangeAnimationDirection == false) {
                this.disableChangeAnimationDirection = true;
            }
            else
            {
                this.disableChangeAnimationDirection = false;
            }
        }
    }
    else
    {
        this.clearPath();
    }

    if (38 in keys && keys[38]) { //up
        if (this.positionY - this.deltaY > 0)
        {
            this.curDirection = "Up";
            dirDeltaY = -dirDeltaY;
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
            dirDeltaX = -dirDeltaX;
        }
    }
    else if (39 in keys && keys[39]) { //right
        if (this.positionX + this.deltaX < (WIDTH - this.frameWidth * this.spriteScale))
        {
            this.curDirection = "Right";
        }
    }
    

    if (this.hasTarget)
    {
        var centreTargX = this.targetX - (this.frameWidth * this.spriteScale) * 0.5;
        var centreTargY = this.targetY - (this.frameHeight * this.spriteScale) * 0.5;

        var dirX = centreTargX - this.positionX;
        
        if (dirX < 0) {
            dirDeltaX = -dirDeltaX;
        }

        if (Math.abs(dirX) < this.deltaX) {
            dirDeltaX = dirX;
        }

        var dirY = centreTargY - this.positionY;

        if (dirY < 0)
        {
            dirDeltaY = -dirDeltaY;
        }

        if (Math.abs(dirY) < this.deltaY)
        {
            dirDeltaY = dirY;
        }

        if (Math.abs(dirX) > Math.abs(dirY)) {
            if (dirX > 0)
                this.curDirection = "Right";
            else if (dirX < 0)
                this.curDirection = "Left";
        }
        else {
            if (dirY > 0)
                this.curDirection = "Down";
            else if (dirY < 0)
                this.curDirection = "Up";
        }
    }

    if (this.curFrameNo < 2)
    {
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

    if (this.curDirection == "Up" || this.curDirection == "Down")
    {
        if (!collided)
        {
            this.positionY += dirDeltaY;
            virtualCameraOffsetY -= dirDeltaY;
        }

        if (!this.disableChangeAnimationDirection)
        {
            if (this.curDirection == "Down")
                this.curFrame = this.downFrames[this.curFrameNo];
            else
                this.curFrame = this.upFrames[this.curFrameNo];
        }
    }

    if (this.curDirection == "Left" || this.curDirection == "Right")
    {
        if (!collided)
        {
            this.positionX += dirDeltaX;
            virtualCameraOffsetX -= dirDeltaX;
        }

        if (!this.disableChangeAnimationDirection)
        {
            if (this.curDirection == "Right")
                this.curFrame = this.rightFrames[this.curFrameNo];
            else
                this.curFrame = this.leftFrames[this.curFrameNo];
        }
    }

    if (this.disableChangeAnimationDirection) {
        if (this.savedframeArray.length == 0) {
            if (this.curDirection == "Down")
                this.savedframeArray = this.downFrames.slice();
            else if (this.curDirection == "Up")
                this.savedframeArray = this.upFrames.slice();
            else if (this.curDirection == "Left")
                this.savedframeArray = this.leftFrames.slice();
            else if (this.curDirection == "Right")
                this.savedframeArray = this.rightFrames.slice();
        }
        this.curFrame = this.savedframeArray[this.curFrameNo];
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
            else
            {
                this.positionX = oldPositionX;
                this.positionY = oldPositionY;
                virtualCameraOffsetX = oldVirtualCamOffsetX;
                virtualCameraOffsetY = oldVirtualCamOffsetY;
                break;
            }
        }
    }

    virtualCameraOffsetX = -player.positionX + Math.floor(VIRTUALCAMWIDTH / 2);
    virtualCameraOffsetY = -player.positionY + Math.floor(VIRTUALCAMHEIGHT / 2);

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

Player.prototype.getCenterPosition = function getCenterPosition()
{
    return new point(this.positionX + (this.frameWidth * this.spriteScale) /2,  this.positionY + (this.frameHeight * this.spriteScale) / 2);
}

Player.prototype.setPath = function setPath(pPath)
{
    if (pPath != null && pPath.length > 0)
    {
        this.disableChangeAnimationDirection = true;
        this.path = pPath.slice();
        this.pathIndex = 0;
    }
}

Player.prototype.clearPath = function clearPath()
{
    this.hasTarget = false;
    this.pathIndex = -1;
    this.targetX = -1;
    this.targetY = -1;
    this.path = [];
    this.curDirection = "None";
    this.disableChangeAnimationDirection = false
}

Player.prototype.pushTargetToStack = function pushTargetToStack(pTargetPoint)
{
    if (pTargetPoint != null)
    {
        this.targetStack.push(pTargetPoint);
    }
}

Player.prototype.popTargetFromStack = function popTargetFromStack()
{
    if (this.targetStack.length > 0)
        this.targetStack.pop();
}

Player.prototype.setPathFromTargetStack = function setPathFromTargetStack()
{
    if (this.targetStack.length > 0) {
        var targetPoint = this.targetStack[this.targetStack.length - 1];
        var nextPath = aStar.calculatePath(this.getCenterPosition(), new point(targetPoint.x, targetPoint.y));
        this.setPath(nextPath);
    }
    else
        this.clearPath();
}

Player.prototype.clearTargetStack = function clearTargetStack()
{
     this.targetStack = [];
}
