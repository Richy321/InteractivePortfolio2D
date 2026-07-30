//Player object
function Player(startPosX, startPosY) 
{
    this.deltaXBase = 6;
    this.deltaYBase = 6;
    this.deltaX = this.deltaXBase;
    this.deltaY = this.deltaYBase;

    this.deltaXFast = 12;
    this.deltaYFast = 12;

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
    this.frameDelayBase = 0.20;
    this.frameDelayFast = 0.10;
    this.frameDelay = this.frameDelayBase;
    this.frameDuration = this.frameDelay;
    this.spriteScale = 2;

    this.positionX = Math.floor(startPosX - (this.frameWidth * this.spriteScale) * 0.5);
    this.positionY = Math.floor(startPosY - (this.frameHeight * this.spriteScale) * 0.5);

    this.targetStack = [];
    this.path = [];
    this.pathIndex = 0;

    //Close enough to count as having reached a waypoint. Moving diagonally the
    //player rarely lands on one exactly, and the exact comparison this replaces
    //made it stall on the spot waiting to.
    this.waypointArriveRadius = 2;
    //Movement smaller than this says nothing about where the character is headed,
    //so it must not be allowed to change the facing.
    this.facingDeadzone = 2;
    //How far the other axis has to win by before the sprite turns. Stops a run
    //that is nearly diagonal flickering between two facings.
    this.facingTurnBias = 1.4;

    this.disableMovement = false;
    this.fastMovement = false;
}

//Which way the sprite faces. Deliberately separate from movement: the old code
//derived it from whichever axis was moving, so arriving at a waypoint - where the
//remaining delta shrinks to a pixel or two - could leave the character facing an
//arbitrary direction.
Player.prototype.updateFacing = function updateFacing(deltaX, deltaY)
{
    if (Math.abs(deltaX) < this.facingDeadzone && Math.abs(deltaY) < this.facingDeadzone)
        return;

    var absX = Math.abs(deltaX);
    var absY = Math.abs(deltaY);
    var faceHorizontally;

    //Hysteresis: the axis already faced has to be clearly beaten before turning.
    if (this.curDirection == "Left" || this.curDirection == "Right")
        faceHorizontally = !(absY > absX * this.facingTurnBias);
    else if (this.curDirection == "Up" || this.curDirection == "Down")
        faceHorizontally = (absX > absY * this.facingTurnBias);
    else
        faceHorizontally = (absX > absY);

    if (faceHorizontally)
        this.curDirection = (deltaX > 0) ? "Right" : "Left";
    else
        this.curDirection = (deltaY > 0) ? "Down" : "Up";
}

Player.prototype.framesForDirection = function framesForDirection()
{
    if (this.curDirection == "Up")
        return this.upFrames;
    if (this.curDirection == "Left")
        return this.leftFrames;
    if (this.curDirection == "Right")
        return this.rightFrames;

    return this.downFrames;
}

Player.prototype.distanceToWaypoint = function distanceToWaypoint(index)
{
    var waypoint = this.path[index];
    var deltaX = (waypoint.x - (this.frameWidth * this.spriteScale) * 0.5) - this.positionX;
    var deltaY = (waypoint.y - (this.frameHeight * this.spriteScale) * 0.5) - this.positionY;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

Player.prototype.isBlockedAt = function isBlockedAt(x, y)
{
    var bounds = this.getBoundsAt(x, y);

    for (var i = 0; i < collidables.length; i++)
    {
        if (!collidables[i].isTrigger && doBoundsIntersect(bounds, collidables[i].getBounds()))
            return true;
    }

    return false;
}
Player.prototype.updatePlayer = function updatePlayer(deltaTime) 
{
    if (loading || this.disableMovement)
        return;

    var spriteWidth = this.frameWidth * this.spriteScale;
    var spriteHeight = this.frameHeight * this.spriteScale;
    var moveX = 0;
    var moveY = 0;

    var movementKeyPressed = ((38 in keys && keys[38]) ||
        (40 in keys && keys[40]) ||
        (37 in keys && keys[37]) ||
        (39 in keys && keys[39]));

    if (movementKeyPressed)
    {
        this.SetFastMovement(false);
    }

    //Navigate path
    if (!movementKeyPressed && this.path.length > 0 && this.pathIndex < this.path.length)
    {
        //Step past any waypoints already reached.
        while (this.pathIndex < this.path.length &&
               this.distanceToWaypoint(this.pathIndex) <= this.waypointArriveRadius)
        {
            this.pathIndex++;
        }

        if (this.pathIndex >= this.path.length)
        {
            this.clearPath();
        }
        else
        {
            this.targetX = this.path[this.pathIndex].x;
            this.targetY = this.path[this.pathIndex].y;
            this.hasTarget = true;
        }
    }
    else
    {
        this.clearPath();
    }

    if (movementKeyPressed)
    {
        if (38 in keys && keys[38]) { //up
            if (this.positionY - this.deltaY > 0)
                moveY = -this.deltaY;
        }
        else if (40 in keys && keys[40]) { //down
            if (this.positionY + this.deltaY < (HEIGHT - spriteHeight))
                moveY = this.deltaY;
        }
        else if (37 in keys && keys[37]) { //left
            if (this.positionX - this.deltaX > 0)
                moveX = -this.deltaX;
        }
        else if (39 in keys && keys[39]) { //right
            if (this.positionX + this.deltaX < (WIDTH - spriteWidth))
                moveX = this.deltaX;
        }

        this.updateFacing(moveX, moveY);
    }
    else if (this.hasTarget)
    {
        var toTargetX = (this.targetX - spriteWidth * 0.5) - this.positionX;
        var toTargetY = (this.targetY - spriteHeight * 0.5) - this.positionY;
        var distance = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);

        if (distance > 0)
        {
            //Travel straight at the waypoint instead of one axis at a time, which
            //is what made even a straight run look like a staircase.
            var step = Math.min(this.deltaX, distance);
            moveX = (toTargetX / distance) * step;
            moveY = (toTargetY / distance) * step;
        }

        this.updateFacing(toTargetX, toTargetY);
    }

    if (moveX != 0 || moveY != 0)
    {
        //Slide along anything solid rather than stopping dead against it.
        if (!this.isBlockedAt(this.positionX + moveX, this.positionY + moveY))
        {
            this.positionX += moveX;
            this.positionY += moveY;
        }
        else if (moveX != 0 && !this.isBlockedAt(this.positionX + moveX, this.positionY))
        {
            this.positionX += moveX;
        }
        else if (moveY != 0 && !this.isBlockedAt(this.positionX, this.positionY + moveY))
        {
            this.positionY += moveY;
        }

        this.frameDuration -= deltaTime;
        if (this.frameDuration <= 0)
        {
            this.curFrameNo = (this.curFrameNo + 1) % this.frameCount;
            this.frameDuration = this.frameDelay;
        }
    }
    else
    {
        //Standing still, so stand rather than freeze mid-stride.
        this.curFrameNo = 0;
    }

    this.curFrame = this.framesForDirection()[this.curFrameNo];

    //fire any triggers now standing on
    var playerBnd = this.getBounds();
    var collidedTrigger = false;

    for (i = 0; i < collidables.length; i++) {
        if (!collidables[i].isTrigger)
            continue;

        if (doBoundsIntersect(playerBnd, collidables[i].getBounds())) {
            if (justFiredTrigger == false) {
                collidables[i].fireTrigger();
            }
            collidedTrigger = true;
        }
    }

    //Rounded: the position is fractional now that movement is not axis-aligned,
    //and a fractional camera offset would blur every tile in the scene.
    virtualCameraOffsetX = -Math.round(player.positionX) + Math.floor(VIRTUALCAMWIDTH / 2);
    virtualCameraOffsetY = -Math.round(player.positionY) + Math.floor(VIRTUALCAMHEIGHT / 2);

    //if not colliding with any triggers reset just fired flag
    //-N.B could be an issue here in future with close/overlapping triggers but ok for now.
    if (collidedTrigger == false) {
        justFiredTrigger = false;
    }
}

Player.prototype.drawPlayer = function drawPlayer()
{
    //Drawn on whole pixels: the position is fractional now that movement runs
    //diagonally, and a fractional destination resamples the sprite and blurs it.
    ctx.drawImage(this.sprite, this.curFrame.spriteXOffset, this.curFrame.spriteYOffset, this.frameWidth, this.frameHeight, Math.round(this.positionX), Math.round(this.positionY), this.frameWidth * this.spriteScale, this.frameHeight * this.spriteScale);
}

Player.prototype.drawBounds = function drawBounds() 
{
    ctx.fillStyle = "rgba(255,0,0,0.3)";
    rect(this.positionX, this.positionY + (this.frameHeight * this.spriteScale) / 2, this.frameWidth * this.spriteScale, this.frameHeight / 2 * this.spriteScale);
}

Player.prototype.getBoundsAt = function getBoundsAt(x, y)
{
    return new Bounds(x, y + (this.frameHeight * this.spriteScale) / 2, x + this.frameWidth * this.spriteScale, y + this.frameWidth * this.spriteScale);
}

Player.prototype.getBounds = function getBounds()
{
    return this.getBoundsAt(this.positionX, this.positionY);
}

Player.prototype.getCenterPosition = function getCenterPosition()
{
    return new point(this.positionX + (this.frameWidth * this.spriteScale) /2,  this.positionY + (this.frameHeight * this.spriteScale) / 2);
}

Player.prototype.setPath = function setPath(pPath)
{
    if (pPath != null && pPath.length > 0)
    {
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
    //curDirection is deliberately left alone. Resetting it to "None" here meant
    //the character snapped to a default facing the instant a path finished.
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

Player.prototype.SetFastMovement = function SetFastMovement(isFast)
{
    if (isFast)
    {
        this.deltaX = this.deltaXFast;
        this.deltaY = this.deltaYFast;
        this.frameDelay = this.frameDelayFast;
    }
    else
    {
        this.deltaX = this.deltaXBase;
        this.deltaY = this.deltaYBase;
        this.frameDelay = this.frameDelayBase;
    }
}
