
function initTown() {
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
    var AboutTrigger = new CollidableObject(teleActive, 150 - 32, 238, 64, 32, 0, 0, true);
    AboutTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        lastScenePosX = player.positionX;
        lastScenePosY = player.positionY;
        ctx.translate(0, 0);
        initAboutHouse();

    };
    collidables.push(AboutTrigger);

    var ProgTrigger = new CollidableObject(teleActive, 600 - 32, 238, 64, 32, 0, 0, true);
    ProgTrigger.fireTrigger = function () {
        justFiredTrigger = true;
        lastScenePosX = player.positionX;
        lastScenePosY = player.positionY;
        ctx.translate(0, 0);
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
    for (i = 40; i < WIDTH - 40; i += 40) {
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
    collidables.push(new CollidableObject(table, 400 - (169 / 2), 270, 169, 60, 0, 0, false));
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

function drawProgContents() {

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

function drawAboutText() {
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