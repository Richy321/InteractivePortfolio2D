
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
    player.SetFastMovement(false);
    doMove(e.pageX, e.pageY);
}

function doTouchStart(e)
{
    e.preventDefault();
    player.SetFastMovement(false);
    doMove(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
}

function doMove(pageX, pageY)
{
    var gamePt = new point(pageX - canvas.offsetLeft - virtualCameraOffsetX, pageY - canvas.offsetTop - virtualCameraOffsetY);
    var localPt = new point(pageX - canvas.offsetLeft, pageY - canvas.offsetTop);

    //Compared against the camera size, not canvas.width: since the canvas is scaled by
    //devicePixelRatio its width attribute is in device pixels, while a click arrives in
    //CSS pixels. On a 2x display that comparison would accept clicks well past the
    //right-hand edge of the game.
    if (localPt.x > 0 && localPt.x < VIRTUALCAMWIDTH && localPt.y > 0 && localPt.y < VIRTUALCAMHEIGHT)
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

    //Grid coordinate of each sign's trigger, named after the sign rather than
    //Demo1..Demo6: the numbers said nothing about which board they led to, so
    //rearranging the signs meant working the mapping out again. The signs fill the
    //warehouse a column at a time, hence the left wall first then the right.
    var warehouseTargets = {
        "Helix":           [5, 5],    //left wall, top
        "CastOuts":        [5, 10],   //left wall, middle
        "PlanetOfTheApes": [5, 16],   //left wall, bottom
        "TerraTechWorlds": [15, 5],   //right wall, top
        "Narcos":          [15, 11],  //right wall, middle
        "EarlierWork":     [15, 16]   //right wall, bottom
    };

    player.SetFastMovement(true);
    if (pLinkName == "Home")
    {
        player.pushTargetToStack(spawnPoint);

        if (locationState == LocationEnum.LIBRARY || locationState == LocationEnum.WAREHOUSE)
            player.pushTargetToStack(houseTeleporterLocation);
    }

    if (libraryLocations.indexOf(pLinkName) > -1) {
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

    if (warehouseTargets.hasOwnProperty(pLinkName)) {
        var signTile = warehouseTargets[pLinkName];
        player.pushTargetToStack(grid.GetPositionCenterFromCoord(signTile[0], signTile[1]));

        if (locationState == LocationEnum.TOWN || locationState == LocationEnum.LIBRARY)
            player.pushTargetToStack(warehouseTeleportLocation);
        if (locationState == LocationEnum.LIBRARY)
            player.pushTargetToStack(houseTeleporterLocation);
    }

    player.setPathFromTargetStack();
}

function clearKeyBuffer() {
    for (var i = 0; i < keys.length; i++)
        keys[i] = false;
}

function clear()
{
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.clearRect(-virtualCameraOffsetX, -virtualCameraOffsetY, VIRTUALCAMWIDTH, VIRTUALCAMHEIGHT);
}

//Just where the player is headed. The intermediate waypoints used to be marked
//too, which only showed the shape of the route rather than the destination.
function drawTarget() {
    if (player.path.length == 0)
        return;

    var origFill = ctx.fillStyle;
    var destination = player.path[player.path.length - 1];

    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    circle(destination.x, destination.y, 5);

    ctx.fillStyle = origFill;
}

var draw = function () {
    ctx.save();
    ctx.translate(virtualCameraOffsetX, virtualCameraOffsetY);
    clear();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    rect(0, 0, VIRTUALCAMWIDTH, VIRTUALCAMHEIGHT);
    grid.drawGrid();

    for (var i = 0; i < collidables.length; i++) {

        collidables[i].drawCollidable();
        //collidables[i].drawBounds();
    }

    //After the collidables, so the markers are not painted over by whatever they
    //sit on - the teleporter discs in particular are drawn as collidables.
    if (player.hasTarget) {
        drawTarget();
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

    //Other visitors first, so the character you are actually controlling is never
    //hidden underneath somebody standing on the same tile.
    if (typeof net != "undefined" && net != null)
        net.draw();

    player.drawPlayer();
    //player.drawBounds();
    ctx.restore();
}

//One step of the simulation. Movement is expressed per step - the character moves
//deltaX pixels each time this runs, not deltaX pixels per second - so the step has to
//stay at the 40ms the old setInterval used or the whole game changes speed.
var SIMULATION_STEP_MS = 40;
var SIMULATION_STEP_SECONDS = SIMULATION_STEP_MS / 1000;

//The most catching-up one frame may do. A tab that was hidden for a minute comes back
//with an enormous elapsed time, and without this the loop would try to simulate the
//whole minute in one go and lock the page up.
var MAX_CATCHUP_MS = 200;

var simulationAccumulator = 0;

var update = function () {
    if (80 in keys && keys[80]) {
        debugKeyDown = true;
    }
    else {
        if (debugKeyDown == true) //just released key
            showGridOverlay = !showGridOverlay;
        debugKeyDown = false;
    }

    player.updatePlayer(SIMULATION_STEP_SECONDS);
}

//Driven by requestAnimationFrame rather than a 25fps setInterval, so drawing lines up
//with the display's refresh instead of fighting it, and stops altogether while the tab
//is hidden. The simulation still advances in fixed 40ms steps, which is what keeps
//movement speed identical to before; only the redraw got faster.
var frame = function () {
    window.requestAnimationFrame(frame);

    timer.tick();

    var elapsedMs = Math.min(timer.getSeconds() * 1000, MAX_CATCHUP_MS);
    simulationAccumulator += elapsedMs;

    while (simulationAccumulator >= SIMULATION_STEP_MS) {
        update();
        simulationAccumulator -= SIMULATION_STEP_MS;
    }

    //Once per frame rather than per step: the other players are interpolated against
    //the wall clock, so the more often this runs the smoother they move.
    if (typeof net != "undefined" && net != null)
        net.update(elapsedMs / 1000);

    //After the simulation rather than before it, so a frame shows the state that was
    //just computed instead of the previous one.
    draw();
}

function resizeGame() {
    var displayWidth = gameCanvas.clientWidth;
    var displayHeight = gameCanvas.clientHeight;

    //The game continues to work entirely in CSS pixels - VIRTUALCAM* and every world
    //coordinate are unchanged. Only the backing store gains the extra resolution, and
    //the context is scaled once here so no drawing code has to know about it.
    //Without this the canvas renders at CSS resolution and is soft on any screen with
    //a devicePixelRatio above 1, which is most of them now.
    var pixelRatio = window.devicePixelRatio || 1;

    VIRTUALCAMWIDTH = displayWidth;
    VIRTUALCAMHEIGHT = displayHeight;

    gameCanvas.width = Math.round(displayWidth * pixelRatio);
    gameCanvas.height = Math.round(displayHeight * pixelRatio);

    if (ctx)
    {
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        //This is pixel art drawn at 2x. Smoothing it turns every hard edge to mush.
        //Resizing a canvas resets the context, so it has to be set again here.
        ctx.imageSmoothingEnabled = false;
    }
}

//init
function init() {
    timer = new FrameTimer();
    timer.tick();
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    //Only a starting size; resizeGame() at the end of init sets the real one, scaled
    //for the display's pixel ratio.
    canvas.width = VIRTUALCAMWIDTH;
    canvas.height = VIRTUALCAMHEIGHT;
    canvas.style.border = "none";

    grid = new Grid(WIDTH, HEIGHT);

    teleActive.src = "./media/teleporter_active_64.png";
    teleInactive.src = "./media/teleporter_inactive_64.png";

    spawnPoint = grid.GetPositionCenterFromCoord(9, 7);
    player = new Player(spawnPoint.x, spawnPoint.y);

    aStar = new AStar(grid);

    //Presence is entirely optional: with no relay configured, or an unreachable one,
    //this connects to nothing and the game runs exactly as it does single player.
    net = new NetClient();
    net.connect();

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

    //Reset here rather than at declaration: the timer was constructed at the top of
    //init and everything since then - image loads, scene building - counts as elapsed
    //time it should not try to catch up on.
    timer.tick();
    simulationAccumulator = 0;

    return window.requestAnimationFrame(frame);
}

//--main--
init();
