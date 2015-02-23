
var WIDTH = 1024;  //world width
var HEIGHT = 768;  //world height

var VIRTUALCAMWIDTH = 800;
var VIRTUALCAMHEIGHT = 600;

var newWidth = window.innerWidth;
var newHeight = window.innerHeight;


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
var lastScenePosX = VIRTUALCAMWIDTH / 2;
var lastScenePosY = VIRTUALCAMHEIGHT / 2;

var virtualCameraOffsetX = 0;
var virtualCameraOffsetY = 0;

var loading = false;

var gsImg;
var assetImage;
var toonShaderImage;
var omniShadowImage;

var showGridOverlay = false;
var debugKeyDown = false;

var videoElement;
var videoDiv;

var videoHeight = 100;
var videoWidth = 133;


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
    player.setPath(aStar.calculatePath(player.getCenterPosition(), new point(evt.pageX - canvas.offsetLeft - virtualCameraOffsetX, evt.pageY - canvas.offsetTop - virtualCameraOffsetY)));
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

function drawTarget()
{
    var origFill = ctx.fillStyle;

    for (var i = 0; i < player.path.length; i++)
    {
        ctx.fillStyle = 'rgba(255, 255, 0, 255)';
        if(player.path.length >0)
            circle(player.path[i].x, player.path[i].y, 5);
    }

    ctx.fillStyle = 'rgba(255, 0, 0, 255)';
    circle(player.path[player.path.length - 1].x, player.path[player.path.length - 1].y, 5);

    ctx.fillStyle = origFill;
}

function eventWindowLoaded()
{
    /*
    videoElement = document.createElement("video");
    videoDiv = document.createElement('div');
    document.body.appendChild(videoDiv);
    videoDiv.appendChild(videoElement);
    videoDiv.setAttribute("style", "display:none;");

    var videoType = supportedVideoFormat(videoElement);
    if (videoType == "") {
        alert("no video support");
        return;
    }
    videoElement.addEventListener("canplaythrough", videoLoaded, false);
    videoElement.setAttribute("src", "video/video." + videoType);
    */
}

function videoLoaded(event)
{
    init();
}

function supportedVideoFormat(video)
{
    var returnExtension = "";
    if (video.canPlayType("video/webm") == "probably" ||
        video.canPlayType("video/webm") == "maybe") {
        returnExtension = "webm";
    } else if (video.canPlayType("video/mp4") == "probably" ||
        video.canPlayType("video/mp4") == "maybe") {
        returnExtension = "mp4";
    } else if (video.canPlayType("video/ogg") == "probably" ||
        video.canPlayType("video/ogg") == "maybe") {
        returnExtension = "ogg";
    }

    return returnExtension;
}

function drawVideo(posX, posY)
{
    if(videoElement)
        ctx.drawImage(videoElement, posX, posY, videoWidth, videoHeight);
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

    if (showGridOverlay)
        grid.drawGridOverlay();

    drawVideo(0,0);

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

    if(videoElement)
        videoElement.play();

    timer.tick();
}

function resizeGame()
{
    var newWidth = gameCanvas.clientWidth;
    var newHeight = gameCanvas.clientHeight;

    VIRTUALCAMWIDTH = newWidth;
    VIRTUALCAMHEIGHT = newHeight;
    gameCanvas.width = VIRTUALCAMWIDTH;
    gameCanvas.height = VIRTUALCAMHEIGHT;
}


//init
function init() 
{
    timer = new FrameTimer();
    timer.tick();
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = VIRTUALCAMWIDTH;
    canvas.height = VIRTUALCAMHEIGHT;
    canvas.style.border = "none";

    grid = new Grid(WIDTH, HEIGHT);
    
    teleActive.src = "Media/teleporter_active_64.png";
    teleInactive.src = "Media/teleporter_inactive_64.png";

    var spawnPoint = grid.GetPositionCenterFromCoord(12, 9);
    player = new Player(spawnPoint.x, spawnPoint.y);

    aStar = new AStar(grid);
    document.onkeydown = function (e)
    {
        doKeyDown(e);
    }

    document.onkeyup = function (e)
    {
        doKeyUp(e);
    }

    document.onclick = function (e) 
    {
        doClick(e);
    }

    //initTown();
    justFiredTrigger = true
    //initAboutHouse();
    initProgHouse();

    window.addEventListener('resize', resizeGame, false);
    window.addEventListener('orientationchange', resizeGame, false);
    resizeGame();

    return setInterval(update, 40);
}

//--main--
init();
//window.addEventListener('load', eventWindowLoaded, false);