

var WIDTH = 800;
var HEIGHT = 600;

//shared scene resources
var canvas;
var bckCanvas;
var ctx;
var bckCtx;
var player;
var grid;
var timer;
var teleActive = new Image();
var teleInactive = new Image();

var justFiredTrigger = false;
var curScene = "None";

var keys = new Array();
var collidables = new Array();

//starting pos
var lastScenePosX = WIDTH / 2 - 20;
var lastScenePosY = HEIGHT / 2 - 40;

var loading = false;




var gsImg;
var assetImage;
var toonShaderImage;
var omniShadowImage;




window.onload = function()
{
    timer = new FrameTimer();
    timer.tick();
}


//keyboard input
function doKeyDown(evt) {
    keys[evt.keyCode] = true;
}

function doKeyUp(evt) {
    keys[evt.keyCode] = false;
}

function clearKeyBuffer() {
    for (i = 0; i < keys.length; i++)
        keys[i] = false;
}

function clear()
 {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}


//Draw shape helpers
function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
}
function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
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
    //overwrite this if your a trigger
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


//Player object
function Player(startPosX, startPosY) 
{
    this.positionX = startPosX;
    this.positionY = startPosY;
    this.deltaX = 6;
    this.deltaY = 6;
    this.circleSize = 10;

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

    this.updatePlayer = function updatePlayer(deltaTime) {
        if (loading)
            return;
        var oldPositionX = this.positionX;
        var oldPositionY = this.positionY;

        if (38 in keys && keys[38]) { //up
            if (this.positionY - this.deltaY > 0) {
                if (this.curDirection == "Up" && this.curFrameNo < 2) {
                    this.frameDuration -= deltaTime;
                    if (this.frameDuration <= 0) {
                        this.curFrameNo++;
                        this.frameDuration = this.frameDelay;
                    }
                }
                else {
                    this.curDirection = "Up";
                    this.curFrameNo = 0;
                }
                this.positionY -= this.deltaY;
                this.curFrame = this.upFrames[this.curFrameNo];

            }
        }
        else if (40 in keys && keys[40]) { //down
            if (this.positionY + this.deltaY < (HEIGHT - this.frameHeight * this.spriteScale)) {
                if (this.curDirection == "Down" && this.curFrameNo < 2) {
                    this.frameDuration -= deltaTime;
                    if (this.frameDuration <= 0) {
                        this.curFrameNo++;
                        this.frameDuration = this.frameDelay;
                    }
                }
                else {
                    this.curDirection = "Down";
                    this.curFrameNo = 0;
                }
                this.positionY += this.deltaY;
                this.curFrame = this.downFrames[this.curFrameNo];
            }
        }

        else if (37 in keys && keys[37]) { //left
            if (this.positionX - this.deltaX > 0) {
                if (this.curDirection == "Left" && this.curFrameNo < 2) {
                    this.frameDuration -= deltaTime;
                    if (this.frameDuration <= 0) {
                        this.curFrameNo++;
                        this.frameDuration = this.frameDelay;
                    }
                }
                else {
                    this.curDirection = "Left";
                    this.curFrameNo = 0;
                }
                this.positionX -= this.deltaX;
                this.curFrame = this.leftFrames[this.curFrameNo];
            }
        }

        else if (39 in keys && keys[39]) { //right
            if (this.positionX + this.deltaX < (WIDTH - this.frameWidth * this.spriteScale)) {
                if (this.curDirection == "Right" && this.curFrameNo < 2) {
                    this.frameDuration -= deltaTime;
                    if (this.frameDuration <= 0) {
                        this.curFrameNo++;
                        this.frameDuration = this.frameDelay;
                    }
                }
                else {
                    this.curDirection = "Right";
                    this.curFrameNo = 0;
                }
                this.positionX += this.deltaX;
                this.curFrame = this.rightFrames[this.curFrameNo];
            }
        }


        //check collisions
        var playerBnd = this.getBounds();

        var collided = false;

        for (i = 0; i < collidables.length; i++) {
            var bnd = collidables[i].getBounds();
            if (doBoundsIntersect(playerBnd, bnd)) {
                if (collidables[i].isTrigger) {
                    if (justFiredTrigger == false) {
                        collidables[i].fireTrigger();
                    }
                    collided = true;
                }
                else {
                    this.positionX = oldPositionX;
                    this.positionY = oldPositionY;
                    break;
                }
            }
        }

        //if not colliding with any triggers reset just fired flag
        //-N.B could be an issue here in future with close/overlapping triggers but ok for now.
        if (collided == false) {
            justFiredTrigger = false;
        }
    }

    this.drawPlayer = function drawPlayer() 
    {
        ctx.drawImage(this.sprite, this.curFrame.spriteXOffset, this.curFrame.spriteYOffset, this.frameWidth, this.frameHeight, this.positionX, this.positionY, this.frameWidth * this.spriteScale, this.frameHeight * this.spriteScale);
    }
    this.drawBounds = function drawBounds() {
        ctx.fillStyle = "rgba(255,0,0,0.3)";
        rect(this.positionX, this.positionY  + (this.frameHeight * this.spriteScale) / 2, this.frameWidth * this.spriteScale, this.frameHeight / 2 * this.spriteScale);
    }
    this.getBounds = function getBounds() {
        return new Bounds(this.positionX, this.positionY + (this.frameHeight * this.spriteScale) / 2, this.positionX + this.frameWidth * this.spriteScale, this.positionY + this.frameWidth * this.spriteScale);
    }
}

function Tile(pSpriteXOffset, pSpriteYOffset, pSpriteSheetImage) {
    this.spriteXOffset = pSpriteXOffset;
    this.spriteYOffset = pSpriteYOffset;
    this.spriteSheet = pSpriteSheetImage;
    this.walkable = true;
}




function Grid(canvasWidth, canvasHeight) 
{
    this.terrainSheet = new Image();
    this.terrainSheet.src = "./Media/GRS2ROC.bmp";
    this.pavingSheet = new Image();
    this.pavingSheet.src = "./Media/PAVE_small.png";
    this.flooringSheet = new Image();
    this.flooringSheet.src = "./Media/VILFLR_small.png";
    this.tiles = new Array();
    this.tileWidth = 40;


    this.initPaving = function initPaving() {
        for (y = 0; y < canvasHeight / this.tileWidth; y++) {
            for (x = 0; x < canvasWidth / this.tileWidth; x++) {
                var rnd = Math.floor((Math.random() * 4) + 1);
                var rnd2 = Math.floor((Math.random() * 4) + 1);

                if (rnd2 == 1) //1 in 4 chance of a random tile
                {
                    switch (rnd) {
                        case 1:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(40, 41, this.pavingSheet);
                            break;
                        case 2:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(120, 41, this.pavingSheet);
                            break; ;
                        case 3:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(200, 41, this.pavingSheet);
                            break;
                        case 4:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(280, 41, this.pavingSheet);
                            break;
                    }
                }
                else {
                    this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(120, 201, this.pavingSheet);
                }
            }
        }
    }

    this.initFlooring = function initFlooring() {
        for (y = 0; y < canvasHeight / this.tileWidth; y++) {
            for (x = 0; x < canvasWidth / this.tileWidth; x++) {
                var rnd = Math.floor((Math.random() * 5) + 1);
                var rnd2 = Math.floor((Math.random() * 4) + 1);

                if (rnd2 == 1) //1 in 4 chance of a random tile
                {
                    switch (rnd) {
                        case 1:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(360, 41, this.flooringSheet);
                            break;
                        case 2:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(120, 41, this.flooringSheet);
                            break; ;
                        case 3:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(200, 41, this.flooringSheet);
                            break;
                        case 4:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(280, 41, this.flooringSheet);
                            break;
                        case 5:
                            this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(440, 41, this.flooringSheet);
                            break;
                    }
                }
                else {
                    this.tiles[(y * (canvasWidth / this.tileWidth)) + x] = new Tile(40, 41, this.flooringSheet);
                }
            }
        }
    }



    this.drawGrid = function drawGrid() 
    {
        for (y = 0; y < canvasHeight / this.tileWidth; y++) 
        {
            for (x = 0; x < canvasWidth / this.tileWidth; x++) {
                var tile = this.tiles[(y * (canvasWidth / this.tileWidth)) + x];
                ctx.drawImage(tile.spriteSheet, tile.spriteXOffset, tile.spriteYOffset, this.tileWidth, this.tileWidth, x * this.tileWidth, y * this.tileWidth, this.tileWidth, this.tileWidth);
            }
        }
    }
}


var checkCollision = function () {
}


var draw = function () {
    clear();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    rect(0, 0, WIDTH, HEIGHT);
    grid.drawGrid();



    for (i = 0; i < collidables.length; i++) {

        collidables[i].drawCollidable();
        //collidables[i].drawBounds();
    }

    //CVTrigger.drawCollidable();

    //Hack - TODO replace text with collidable images. 

    switch (curScene) {
        case "Town":
            this.drawCVHouseTxt();
            this.drawProgHouseTxt();
            this.drawTitleTxt();
            break;
        case "ProgHouse":
            this.drawProgContents();
            break;
        case "AboutHouse":
            this.drawAboutText();
            break;
    };

    player.drawPlayer();
    //player.drawBounds();
}


var drawTitleTxt = function () {
    ctx.textAlign = "center";
    var textTitle = "RJ Fox";
    var textTitle2 = "Games Programmer";
    var textInstructions = "(use the arrow keys to move)";
    ctx.font = 'italic bold 35px sans-serif';
    ctx.fillText(textTitle, WIDTH / 2, HEIGHT / 2 + 50);
    ctx.fillText(textTitle2, WIDTH / 2, HEIGHT / 2 + 80);

    ctx.font = 'italic bold 20px sans-serif';
    ctx.fillText(textInstructions, WIDTH / 2, HEIGHT / 2 + 105);


}

var drawCVHouseTxt = function () {
    ctx.textAlign = "center";
    ctx.font = 'italic bold 20px sans-serif';
    var textCV = "Library";
    ctx.fillText(textCV, 150, 228 / 2 - 10);

    ctx.font = 'italic bold 15px sans-serif';
    var textCV2 = "(About, CV, Contact)";
    ctx.fillText(textCV2, 150, 228 / 2 +5);
}


var drawProgHouseTxt = function () {
    ctx.textAlign = "center";
    ctx.font = 'italic bold 20px sans-serif';
    var textProg = "Warehouse";
    ctx.fillText(textProg, 600, 228 / 2 - 10);

    ctx.font = 'italic bold 15px sans-serif';
    var textProg2 = "(Demos, Code Snippets)";
    ctx.fillText(textProg2, 600, 228 / 2 +5);
}

var drawProgContents = function () {

    ctx.textAlign = "left";
    ctx.font = 'italic bold 20px sans-serif';

    var infoTxt = "Info";
    var dlText = "Download";

    var textProg = "Graveyard Shift";
    ctx.fillText(textProg, 30, 70);
    ctx.drawImage(gsImg, 30, 80, 150, 100);
    ctx.font = '15px sans-serif';
    ctx.fillText(infoTxt, 53, 190);
    ctx.fillText(dlText, 112, 190);

    ctx.font = 'italic bold 20px sans-serif';
    textProg = "Toon Shader";
    ctx.fillText(textProg, 30, 390);
    ctx.drawImage(toonShaderImage, 30, 400, 150, 100);

    ctx.font = 'italic bold 20px sans-serif';
    textProg = "Asset Manager";
    ctx.fillText(textProg, 630, 70);
    ctx.drawImage(assetImage, 630, 80, 150, 100);
    ctx.font = '15px sans-serif';
    ctx.fillText(infoTxt, 653, 190);
    ctx.fillText(dlText, 712, 190);

    textProg = "Omni-Dir Shadows";
    ctx.fillText(textProg, 570, 390);
    ctx.drawImage(omniShadowImage, 570, 400, 150, 100);
}


var drawAboutText = function () {
    ctx.textAlign = "left";
    var textAbout = "Software Developer with a wide skill base, 4+ years experience and a passion for " +
    "games development. Experienced in mobile games development with a published game on the app store. Additionally " +
    "I have worked on small web based games using GWT/GAE and HTML5 canvas, military training/simulation software, " +
    "stock management and EPOS systems with SQL database design, development and maintenance.";
    ctx.font = '17.5px sans-serif';
    wrapText(ctx, textAbout, 50, 140, 725, 20);

    ctx.textAlign = "left";


    var textCV = "Open CV (Popup .pdf)";
    ctx.font = 'italic bold 20px sans-serif';
    ctx.fillText(textCV, 50, 400);

    var textCVDL = "Download CV (.doc)";
    ctx.font = 'italic bold 20px sans-serif';
    ctx.fillText(textCVDL, 50, 500);


    /*
    var textEmailContact = "Email: rjfox321@gmail.com";
    ctx.font = 'italic bold 20px sans-serif';
    ctx.fillText(textEmailContact, 500, 400);
    */

    var textEmailPopup = "Email me (Popup)";
    ctx.font = 'italic bold 20px sans-serif';
    ctx.fillText(textEmailPopup, 500, 400);

    var textEmailClipboard = "Copy email to clipboard";
    ctx.font = 'italic bold 20px sans-serif';
    ctx.fillText(textEmailClipboard, 500, 500);






}

var update = function () 
{
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
    c.width = WIDTH;
    c.height = HEIGHT;

    player = new Player(WIDTH / 2, HEIGHT / 2);
    grid = new Grid(WIDTH, HEIGHT);
    
    document.onkeydown = function (e) {
        doKeyDown(e);
    }

    document.onkeyup = function (e) {
        doKeyUp(e);
    }

    initTown();

    return setInterval(update, 40);
}

function initTown() 
{
    loading = true;
    //clear array
    collidables.length = 0;

    grid.initPaving();

    clearKeyBuffer();
    curScene = "Town";

    teleActive = new Image();
    teleInactive = new Image();
    teleActive.src = "Media/teleporter_active_64.png";
    teleInactive.src = "Media/teleporter_inactive_128.png";

    //Triggers
    var AboutTrigger = new CollidableObject(teleActive, 150 - 32, 238, 64, 32, 0,0, true);
    AboutTrigger.fireTrigger = function fireTrigger() 
    {
        //show CV in popup
        justFiredTrigger = true;
        lastScenePosX = player.positionX;
        lastScenePosY = player.positionY;
        initAboutHouse();
         
    };
    collidables.push(AboutTrigger);

    var ProgTrigger = new CollidableObject(teleActive, 600 - 32, 238, 64, 32,0,0, true);
    ProgTrigger.fireTrigger = function () {
        justFiredTrigger = true;
        lastScenePosX = player.positionX;
        lastScenePosY = player.positionY;
        initProgHouse();
    };
    collidables.push(ProgTrigger);

    player.positionX = lastScenePosX;
    player.positionY = lastScenePosY;



    var StoneBench1 = new Image();
    StoneBench1.src = "Media/bench.png";
    collidables.push(new CollidableObject(StoneBench1, 50, 450, 117, 60, 0, 0, false));




    var wallSheet = new Image();
    wallSheet.src = "Media/FENCE_small.png";


    //W wall
    for (i = 60; i < HEIGHT - 60; i += 40) {
        collidables.push(new CollidableObject(wallSheet, 0, i, 40, 56, 0, 123, false));
    }
    //N wall
    for (i = 40; i < WIDTH - 40; i += 40) 
    {
        collidables.push(new CollidableObject(wallSheet, i, 20, 40, 75, 80, 143, false));
    }
    //E wall
    for (i = 60; i < HEIGHT - 60; i += 40) {
        collidables.push(new CollidableObject(wallSheet, WIDTH - 40, i, 40, 56, 0, 123, false));
    }
    //S wall
    for (i = 40; i < WIDTH - 40; i += 40) {
    if(i % 80)
        collidables.push(new CollidableObject(wallSheet, i, HEIGHT - 75, 40, 75, 80, 143, false));
    else
        collidables.push(new CollidableObject(wallSheet, i, HEIGHT - 75-23, 40, 75+34, 80, 0, false));
    }

    var SWCornerWall = new CollidableObject(wallSheet, 0, HEIGHT - 95, 40, 95, 0, 243, false);
    collidables.push(SWCornerWall);

    var NWCornerWall = new CollidableObject(wallSheet, 0, 0, 40, 95, 0, 3, false);
    collidables.push(NWCornerWall);

    var NECornerWall = new CollidableObject(wallSheet, WIDTH - 40, 0, 40, 95, 160, 3, false);
    collidables.push(NECornerWall);

    var SECornerWall = new CollidableObject(wallSheet, WIDTH - 40, HEIGHT - 95, 40, 95, 160, 243, false);
    collidables.push(SECornerWall);


    var house1 = new Image();
    house1.src = "Media/House1.png";
    //CV house
    collidables.push(new CollidableObject(house1, 50, 10, 200, 228, 0, 0, false));
    //Prog House
    collidables.push(new CollidableObject(house1, 500, 10, 200, 228, 0, 0, false));


    var bench1 = new Image();
    bench1.src = "Media/bench.png";
    collidables.push(new CollidableObject(bench1, 300, 80, 76, 40, 320, 0, false));
    collidables.push(new CollidableObject(bench1, 400, 80, 76, 40, 320, 0, false));


    loading = false;




}



function initGenericHouse() {

    loading = true;
    //clear array
    collidables.length = 0;

    clearKeyBuffer();
    

    grid.initFlooring();

    var ToTownTrigger = new CollidableObject(teleActive, WIDTH / 2 - 32, 60, 64, 32, 0, 0, true);
    ToTownTrigger.fireTrigger = function fireTrigger() {
        justFiredTrigger = true;
        initTown();
    }
    collidables.push(ToTownTrigger);


    //load walls

    var interiorWallSheet = new Image();
    interiorWallSheet.src = "Media/VILINT_small_320.png";

    var NWCornerWall = new CollidableObject(interiorWallSheet, 0, 0, 40, 60, 20, 20, false);
    collidables.push(NWCornerWall);
    var SWCornerWall = new CollidableObject(interiorWallSheet, 0, HEIGHT - 40, 40, 40, 20, 180, false);
    collidables.push(SWCornerWall);
    var SECornerWall = new CollidableObject(interiorWallSheet, WIDTH - 40, HEIGHT - 40, 40, 40, 160, 180, false);
    collidables.push(SECornerWall);
    var NECornerWall = new CollidableObject(interiorWallSheet, WIDTH - 40, 0, 40, 60, 160, 20, false);
    collidables.push(NECornerWall);

    //W wall
    for (i = 60; i < HEIGHT - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, 0, i, 20, 20, 20, 100, false));
    }
    //E wall
    for (i = 60; i < HEIGHT - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, WIDTH - 20, i, 20, 20, 180, 100, false));
    }
    //N wall
    for (i = 40; i < WIDTH - 40; i += 20) {
        if (i % 40)
            collidables.push(new CollidableObject(interiorWallSheet, i, 0, 20, 60, 80, 20, false));
        else
            collidables.push(new CollidableObject(interiorWallSheet, i, 0, 20, 60, 120, 20, false));
    }
    //S wall
    for (i = 40; i < WIDTH - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, i, HEIGHT - 20, 20, 20, 80, 200, false));
    }


    var door = new Image();
    door.src = "Media/TOWNDOOR1_40.png";

    collidables.push(new CollidableObject(door, ToTownTrigger.posX + 13, 10, 40, 46, 0, 0, false));


    player.positionX = ToTownTrigger.posX;
    player.positionY = ToTownTrigger.posY;
    loading = false;

}

function initProgHouse() {
    curScene = "ProgHouse";
    initGenericHouse();


    gsImg = new Image();
    gsImg.src = "Media/GraveyardShiftScreenshot2_medium.jpg";
    var gsTrigger = new CollidableObject(teleActive, 32, 190, 64, 32, 0, 0, true);
    gsTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.open("CV_Games2.pdf", "winPopupPDF", 0, false);
    };
    collidables.push(gsTrigger);


    var gsTriggerDL = new CollidableObject(teleActive, 112, 190, 64, 32, 0, 0, true);
    gsTriggerDL.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.location.href = "demos/GraveyardShift.zip";
    };
    collidables.push(gsTriggerDL);

    assetImage = new Image();
    assetImage.src = "Media/AssetManager.png";
    var assetTrigger = new CollidableObject(teleActive, 70, 410, 64, 32, 0, 0, true);
    assetTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.location.href = "demos/AssetManager.zip";
    };
    collidables.push(assetTrigger);


    toonShaderImage = new Image();
    toonShaderImage.src = "Media/ToonShader.JPG";
    var toonShaderTrigger = new CollidableObject(teleActive, 500, 210, 64, 32, 0, 0, true);
    toonShaderTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.location.href = "demos/AssetManager.zip";
    };
    collidables.push(toonShaderTrigger);


    omniShadowImage = new Image();
    omniShadowImage.src = "Media/ToonShader.JPG";
    var omniShadowTrigger = new CollidableObject(teleActive, 500, 410, 64, 32, 0, 0, true);
    omniShadowTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.location.href = "demos/AssetManager.zip";
    };
    collidables.push(omniShadowTrigger);




}



function initAboutHouse() {
    curScene = "AboutHouse";
    initGenericHouse();


    //Triggers
    var CVTrigger = new CollidableObject(teleActive, 50, 410, 64, 32, 0, 0, true);
    CVTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.open("CV_Games2.pdf", "winPopupPDF", 0, false);
    };
    collidables.push(CVTrigger);

    var CVDLTrigger = new CollidableObject(teleActive, 50, 510, 64, 32, 0, 0, true);
    CVDLTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.location.href = "CV_Games2.doc";
    };
    collidables.push(CVDLTrigger);

    var emailTrigger = new CollidableObject(teleActive, 500, 410, 64, 32, 0, 0, true);
    emailTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.open("mailto:rjfox321@gmail.com", 'Mailer');
        //window.location.href = "mailto:rjfox321@gmail.com";
    };
    collidables.push(emailTrigger);

    var emailClipboardTrigger = new CollidableObject(teleActive, 500, 510, 64, 32, 0, 0, true);
    emailClipboardTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        window.prompt("Copy to clipboard: Ctrl+C (Cmd-C on Mac), Enter", "rjfox321@gmail.com");
    };
    collidables.push(emailClipboardTrigger);


    var table = new Image();
    table.src = "Media/TableAndChairs.png";
    collidables.push(new CollidableObject(table, 400-(169/2), 270, 169, 60, 0, 0, false));
}





//--main--
init();
