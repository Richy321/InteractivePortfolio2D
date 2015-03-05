


function initTown()
{
    loading = true;
    //clear array
    collidables.length = 0;

    grid.initPaving();

    clearKeyBuffer();
    curScene = "Town";

    //Triggers
    var AboutTrigger = new CollidableObject(teleActive, 150 - 32, 238, 64, 32, 0, 0, true);
    AboutTrigger.type = "Teleporter";
    AboutTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        lastScenePosX = player.positionX;
        lastScenePosY = player.positionY;
        ctx.translate(0, 0);
        initAboutHouse();
        player.clearPath();
    };
    collidables.push(AboutTrigger);

    var ProgTrigger = new CollidableObject(teleActive, 600 - 32, 238, 64, 32, 0, 0, true);
    ProgTrigger.type = "Teleporter";
    ProgTrigger.fireTrigger = function () {
        justFiredTrigger = true;
        lastScenePosX = player.positionX;
        lastScenePosY = player.positionY;
        ctx.translate(0, 0);
        initProgHouse();
        player.clearPath();
    };
    collidables.push(ProgTrigger);

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
        if (i % 80)
            collidables.push(new CollidableObject(wallSheet, i, HEIGHT - 75, 40, 75, 80, 143, false));
        else
            collidables.push(new CollidableObject(wallSheet, i, HEIGHT - 75 - 23, 40, 75 + 34, 80, 0, false));
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

    grid.SetWalkableTiles(collidables);

    loading = false;
}

function drawTitleTxt() {
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

function drawCVHouseTxt() {
    ctx.textAlign = "center";
    ctx.font = 'italic bold 20px sans-serif';
    var textCV = "Library";
    ctx.fillText(textCV, 150, 228 / 2 - 10);

    ctx.font = 'italic bold 15px sans-serif';
    var textCV2 = "(About, CV, Contact)";
    ctx.fillText(textCV2, 150, 228 / 2 + 5);
}

function drawProgHouseTxt() {
    ctx.textAlign = "center";
    ctx.font = 'italic bold 20px sans-serif';
    var textProg = "Warehouse";
    ctx.fillText(textProg, 600, 228 / 2 - 10);

    ctx.font = 'italic bold 15px sans-serif';
    var textProg2 = "(Demos, Code Snippets)";
    ctx.fillText(textProg2, 600, 228 / 2 + 5);
}




