function initGenericHouse(pWidth, pHeight) {

    loading = true;
    //clear array
    collidables.length = 0;

    clearKeyBuffer();

    grid.initFlooring(pWidth, pHeight);

    var ToTownTrigger = new CollidableObject(teleActive, pWidth / 2 - 32, 70, 64, 32, 0, 0, true);
    ToTownTrigger.type = "Teleporter";
    ToTownTrigger.fireTrigger = function fireTrigger() {
        justFiredTrigger = true;
        initTown();
        player.positionX = lastScenePosX;
        player.positionY = lastScenePosY;
        player.clearPath();
    }
    collidables.push(ToTownTrigger);


    //load walls
    var interiorWallSheet = new Image();
    interiorWallSheet.src = "Media/VILINT_small_320.png";

    var NWCornerWall = new CollidableObject(interiorWallSheet, 0, 0, 40, 60, 20, 20, false);
    collidables.push(NWCornerWall);
    var SWCornerWall = new CollidableObject(interiorWallSheet, 0, pHeight - 40, 40, 40, 20, 180, false);
    collidables.push(SWCornerWall);
    var SECornerWall = new CollidableObject(interiorWallSheet, pWidth - 40, pHeight - 40, 40, 40, 160, 180, false);
    collidables.push(SECornerWall);
    var NECornerWall = new CollidableObject(interiorWallSheet, pWidth - 40, 0, 40, 60, 160, 20, false);
    collidables.push(NECornerWall);

    //W wall
    for (i = 60; i < pHeight - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, 0, i, 20, 20, 20, 100, false));
    }
    //E wall
    for (i = 60; i < pHeight - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, pWidth - 20, i, 20, 20, 180, 100, false));
    }
    //N wall
    for (i = 40; i < pWidth - 40; i += 20) {
        if (i % 40)
            collidables.push(new CollidableObject(interiorWallSheet, i, 0, 20, 60, 80, 20, false));
        else
            collidables.push(new CollidableObject(interiorWallSheet, i, 0, 20, 60, 120, 20, false));
    }
    //S wall
    for (i = 40; i < pWidth - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, i, pHeight - 20, 20, 20, 80, 200, false));
    }

    var door = new Image();
    door.src = "Media/TOWNDOOR1_40.png";

    collidables.push(new CollidableObject(door, ToTownTrigger.posX + 13, 10, 40, 46, 0, 0, false));

    player.positionX = ToTownTrigger.posX;
    player.positionY = ToTownTrigger.posY;
    loading = false;
}

