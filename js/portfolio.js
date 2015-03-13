
var WIDTH = 1024;  //town width
var HEIGHT = 768;  //town height

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
var teleInactiveHeight = 32;
var teleInactiveWidth = 64;

var justFiredTrigger = false;

var keys = new Array(); //input keys
var collidables = new Array(); //collidable game objects

var lastScenePosX;
var lastScenePosY;
var spawnPoint;

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

//Link pathfind positions
var libraryTeleporterLocation;
var warehouseTeleportLocation;
var houseTeleporterLocation;

LocationEnum = {
    TOWN: 0,
    WAREHOUSE: 1,
    LIBRARY: 2,
}

var locationState = LocationEnum.TOWN;

window.onload = function () {
}

//keyboard input
function doKeyDown(evt) {
    keys[evt.keyCode] = true;
}

function doKeyUp(evt) {
    keys[evt.keyCode] = false;
}

function doClick(e)
{
    doMove(e.pageX, e.pageY);
}

function doTouchStart(e)
{
    e.preventDefault();
    doMove(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
}

function doMove(pageX, pageY)
{
    var gamePt = new point(pageX - canvas.offsetLeft - virtualCameraOffsetX, pageY - canvas.offsetTop - virtualCameraOffsetY);
    var localPt = new point(pageX - canvas.offsetLeft, pageY - canvas.offsetTop);

    if (localPt.x > 0 && localPt.x < canvas.width && localPt.y > 0 && localPt.y < canvas.height)
    {
        if (!player.disableMovement)
        {
            player.setPath(aStar.calculatePath(player.getCenterPosition(), gamePt));
            player.pathIndex = 0;
        }
    }
}

function doLinkClick(pLinkName)
{
    player.clearPath();
    var libraryLocations = ["CV", "Contact", "WorkExp", "Education", "Skills"];
    var warehouseLocations = ["Demo1", "Demo2", "Demo3", "Demo4", "Demo5", "Demo6"];

    if (pLinkName == "Home")
    {
        player.pushTargetToStack(spawnPoint);

        if (locationState == LocationEnum.LIBRARY || locationState == LocationEnum.WAREHOUSE)
            player.pushTargetToStack(houseTeleporterLocation);
    }

    if ($.inArray(pLinkName, libraryLocations) > -1) {
        switch (pLinkName)
        {
            case "CV":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(14, 11)); //to cv trigger
                break;
            case "Contact":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(10, 9)); //to contact me trigger
                break;
            case "WorkExp":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(5, 11)); //to work experience trigger
                break;
            case "Education":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(4, 3)); //to education trigger
                break;
            case "Skills":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(16, 3)); //to skills trigger
                break;
        }

        if (locationState == LocationEnum.TOWN || locationState == LocationEnum.WAREHOUSE)
            player.pushTargetToStack(libraryTeleporterLocation);
        if (locationState == LocationEnum.WAREHOUSE)
            player.pushTargetToStack(houseTeleporterLocation);
    }

    if ($.inArray(pLinkName, warehouseLocations) > -1) {
        switch (pLinkName) {
            case "Demo1":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(5, 5)); //to cv trigger
                break;
            case "Demo2":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(5, 10)); //to contact me trigger
                break;
            case "Demo3":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(5, 16)); //to work experience trigger
                break;
            case "Demo4":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(15, 5)); //to education trigger
                break;
            case "Demo5":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(15, 11)); //to skills trigger
                break;
            case "Demo6":
                player.pushTargetToStack(grid.GetPositionCenterFromCoord(15, 16)); //to skills trigger
                break;
        }

        if (locationState == LocationEnum.TOWN || locationState == LocationEnum.LIBRARY)
            player.pushTargetToStack(warehouseTeleportLocation);
        if (locationState == LocationEnum.LIBRARY)
            player.pushTargetToStack(houseTeleporterLocation);
    }

    player.setPathFromTargetStack();
}

function clearKeyBuffer() {
    for (i = 0; i < keys.length; i++)
        keys[i] = false;
}

function clear()
{
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.clearRect(-virtualCameraOffsetX, -virtualCameraOffsetY, VIRTUALCAMWIDTH, VIRTUALCAMHEIGHT);
}

function SpriteFrame(pSpriteXOffset, pSpriteYOffset, pWidth, pHeight) {
    this.spriteXOffset = pSpriteXOffset;
    this.spriteYOffset = pSpriteYOffset;
    this.width = pWidth;
    this.height = pHeight;
}

function drawTarget() {
    var origFill = ctx.fillStyle;

    for (var i = 0; i < player.path.length; i++) {
        ctx.fillStyle = 'rgba(255, 255, 0, 255)';
        if (player.path.length > 0)
            circle(player.path[i].x, player.path[i].y, 5);
    }

    ctx.fillStyle = 'rgba(255, 0, 0, 255)';
    circle(player.path[player.path.length - 1].x, player.path[player.path.length - 1].y, 5);

    ctx.fillStyle = origFill;
}

function eventWindowLoaded() {
    /*
    videoElement = document.createElement("video");
    videoDiv = document.createElement('div');
    document.body.appendChild(videoDiv);
    videoDiv.appendChild(videoElement);
    videoDiv.setAttribute("style", "display:none;");

    var videoType = supportedVideoFormat(videoElement);
    if (videoType == "") 
    {
        alert("no video support");
        return;
    }
    videoElement.addEventListener("canplaythrough", videoLoaded, false);
    videoElement.setAttribute("src", "video/video." + videoType);
    */
}

function videoLoaded(event) {
    init();
}

function supportedVideoFormat(video) {
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

function drawVideo(posX, posY) {
    if (videoElement)
        ctx.drawImage(videoElement, posX, posY, videoWidth, videoHeight);
}

var draw = function () {
    ctx.save();
    ctx.translate(virtualCameraOffsetX, virtualCameraOffsetY);
    clear();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    rect(0, 0, VIRTUALCAMWIDTH, VIRTUALCAMHEIGHT);
    grid.drawGrid();

    if (player.hasTarget) {
        drawTarget();
    }
    for (i = 0; i < collidables.length; i++) {

        collidables[i].drawCollidable();
        //collidables[i].drawBounds();
    }

    switch (locationState) {
        case LocationEnum.TOWN:
            drawLibraryHouseTxt();
            drawWarehouseHouseTxt();
            drawTitleTxt();
            break;
        case LocationEnum.WAREHOUSE:
            drawWarehouseContents();
            break;
        case LocationEnum.LIBRARY:
            drawLibraryContents();
            break;
    };

    if (showGridOverlay)
        grid.drawGridOverlay();

    drawVideo(0, 0);

    player.drawPlayer();
    //player.drawBounds();
    ctx.restore();
}

var update = function () {
    if (80 in keys && keys[80]) {
        debugKeyDown = true;
    }
    else {
        if (debugKeyDown == true) //just released key
            showGridOverlay = !showGridOverlay;
        debugKeyDown = false;
    }

    draw();

    player.updatePlayer(timer.getSeconds());

    if (videoElement)
        videoElement.play();

    timer.tick();
}

function resizeGame() {
    var newWidth = gameCanvas.clientWidth;
    var newHeight = gameCanvas.clientHeight;

    VIRTUALCAMWIDTH = newWidth;
    VIRTUALCAMHEIGHT = newHeight;
    gameCanvas.width = VIRTUALCAMWIDTH;
    gameCanvas.height = VIRTUALCAMHEIGHT;
}

//init
function init() {
    timer = new FrameTimer();
    timer.tick();
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = VIRTUALCAMWIDTH;
    canvas.height = VIRTUALCAMHEIGHT;
    canvas.style.border = "none";

    grid = new Grid(WIDTH, HEIGHT);

    teleActive.src = "media/teleporter_active_64.png";
    teleInactive.src = "media/teleporter_inactive_64.png";

    spawnPoint = grid.GetPositionCenterFromCoord(9, 7);
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

    canvas.addEventListener("mousedown", doClick, false);
    canvas.addEventListener("touchstart", doTouchStart, false);

    libraryTeleporterLocation = grid.GetPositionCenterFromCoord(3, 6);
    warehouseTeleportLocation = grid.GetPositionCenterFromCoord(14, 6);
    houseTeleporterLocation = grid.GetPositionCenterFromCoord(10, 2);

    initTown();
    justFiredTrigger = true;
    //initLibrary();
    //initWarehouse();

    window.addEventListener('resize', resizeGame, false);
    window.addEventListener('orientationchange', resizeGame, false);
    resizeGame();

    return setInterval(update, 40);
}

//--main--
init();
//window.addEventListener('load', eventWindowLoaded, false);