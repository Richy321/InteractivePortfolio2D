
var WIDTH = 1024;  //world width
var HEIGHT = 768;  //world height

var VIRTUALCAMWIDTH = 800;
var VIRTUALCAMHEIGHT = 600;

//shared scene resources
var canvas;
var bckCanvas;
var ctx;
var bckCtx;
var player;
var grid;
var timer;
var aStar;
var teleActive = new Image();
var teleInactive = new Image();

var justFiredTrigger = false;
var curScene = "None";

var keys = new Array(); //input keys
var collidables = new Array(); //collidable game objects

//starting pos
var lastScenePosX = VIRTUALCAMWIDTH / 2 - 20;
var lastScenePosY = VIRTUALCAMHEIGHT / 2 - 40;

var virtualCameraOffsetX = 0;
var virtualCameraOffsetY = 0;

var loading = false;

var gsImg;
var assetImage;
var toonShaderImage;
var omniShadowImage;

var showGridOverlay = false;
var debugKeyDown = false;


window.onload = function()
{
}

//keyboard input
function doKeyDown(evt)
{
    keys[evt.keyCode] = true;
}

function doKeyUp(evt)
{
    keys[evt.keyCode] = false;
}

function doClick(evt)
{
    player.path = aStar.calculatePath(new point(player.positionX, player.positionY), new point(evt.pageX - canvas.offsetLeft - virtualCameraOffsetX, evt.pageY - canvas.offsetTop - virtualCameraOffsetY));
    player.pathIndex = 0;
}

function clearKeyBuffer()
{
    for (i = 0; i < keys.length; i++)
        keys[i] = false;
}

function clear()
{
    ctx.clearRect(-virtualCameraOffsetX, -virtualCameraOffsetY, VIRTUALCAMWIDTH, VIRTUALCAMHEIGHT);
}

function SpriteFrame(pSpriteXOffset, pSpriteYOffset, pWidth, pHeight) {
    this.spriteXOffset = pSpriteXOffset;
    this.spriteYOffset = pSpriteYOffset;
    this.width = pWidth;
    this.height = pHeight;
}

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

    this.drawCollidable = function drawCollidable() 
    {
        //ctx.drawImage(this.sprite, this.posX, this.posY, this.sizeX, this.sizeY);
        ctx.drawImage(this.sprite, this.offsetX, this.offsetY, 
            this.sizeX, this.sizeY, 
            this.posX, this.posY, 
            this.sizeX, this.sizeY);
    }

    this.getBounds = function getBounds()
    {
        return new Bounds(this.posX, this.posY, this.posX + this.sizeX, this.posY + this.sizeY);
    }

    this.drawBounds = function drawBounds() {
        ctx.fillStyle = "rgba(255,0,0,0.3)";
        rect(this.posX, this.posY, this.sizeX, this.sizeY);
    }

}


function drawTarget()
{
    var origFill = ctx.fillStyle;

    for (var i = 0; i < player.path.length; i++)
    {
        ctx.fillStyle = 'rgba(255, 255, 0, 255)';
        circle(player.path[i].x, player.path[i].y, 5);

    }

    ctx.fillStyle = 'rgba(255, 0, 0, 255)';
    circle(player.path[player.path.length - 1].x, player.path[player.path.length - 1].y, 5);

    ctx.fillStyle = origFill;
}

var draw = function ()
{
    ctx.save();
    ctx.translate(virtualCameraOffsetX, virtualCameraOffsetY);
    clear();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    rect(0, 0, VIRTUALCAMWIDTH, VIRTUALCAMHEIGHT);
    grid.drawGrid();
    if (showGridOverlay)
        grid.drawGridOverlay();
    if (player.hasTarget)
    {
        drawTarget();
    }
    for (i = 0; i < collidables.length; i++) {

        collidables[i].drawCollidable();
        //collidables[i].drawBounds();
    }

    //CVTrigger.drawCollidable();

    //Hack - TODO replace text with collidable images. 

    switch (curScene) {
        case "Town":
            drawCVHouseTxt();
            drawProgHouseTxt();
            drawTitleTxt();
            break;
        case "ProgHouse":
            drawProgContents();
            break;
        case "AboutHouse":
            drawAboutText();
            break;
    };

    player.drawPlayer();
    //player.drawBounds();
    ctx.restore();
}

var update = function ()
{
    if (80 in keys && keys[80])
    {
        debugKeyDown = true;
    }
    else
    {
        if (debugKeyDown == true) //just released key
            showGridOverlay = !showGridOverlay; 
        debugKeyDown = false;
    }
    
    draw();

    player.updatePlayer(timer.getSeconds());
    timer.tick();
}

//init
function init() 
{
    timer = new FrameTimer();
    timer.tick();
    canvas = document.getElementById('c');
    ctx = c.getContext('2d');
    c.width = VIRTUALCAMWIDTH;
    c.height = VIRTUALCAMHEIGHT;

    player = new Player(WIDTH / 2, HEIGHT / 2);
    grid = new Grid(WIDTH, HEIGHT);
    
    aStar = new AStar(grid);

    document.onkeydown = function (e) {
        doKeyDown(e);
    }

    document.onkeyup = function (e) {
        doKeyUp(e);
    }

    document.onclick = function (e) 
    {
        doClick(e);
    }

    initTown();

    return setInterval(update, 40);
}

//--main--
init();
