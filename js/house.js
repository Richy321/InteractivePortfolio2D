function initGenericHouse(pWidth, pHeight, worldXY)
{

    loading = true;
    //clear array
    collidables.length = 0;

    clearKeyBuffer();

    grid.initFlooring(pWidth, pHeight);

    var ToTownTrigger = new CollidableObject(teleActive, worldXY.x + pWidth / 2 - 32, worldXY.y + 70, 64, 32, 0, 0, true);
    ToTownTrigger.type = "Teleporter";
    ToTownTrigger.fireTrigger = function fireTrigger() {
        justFiredTrigger = true;
        initTown();
        locationState = LocationEnum.TOWN;
        player.positionX = lastScenePosX;
        player.positionY = lastScenePosY;
        player.popTargetFromStack()
        player.setPathFromTargetStack();
    }
    collidables.push(ToTownTrigger);

    //load walls
    var interiorWallSheet = new Image();
    interiorWallSheet.src = "./media/VILINT_small_320.png";

    var NWCornerWall = new CollidableObject(interiorWallSheet, worldXY.x + 0, worldXY.y + 0, 40, 60, 20, 20, false);
    collidables.push(NWCornerWall);
    var SWCornerWall = new CollidableObject(interiorWallSheet, worldXY.x + 0, worldXY.y + pHeight - 40, 40, 40, 20, 180, false);
    collidables.push(SWCornerWall);
    var SECornerWall = new CollidableObject(interiorWallSheet, worldXY.x + pWidth - 40, worldXY.y + pHeight - 40, 40, 40, 160, 180, false);
    collidables.push(SECornerWall);
    var NECornerWall = new CollidableObject(interiorWallSheet, worldXY.x + pWidth - 40, worldXY.y +  0, 40, 60, 160, 20, false);
    collidables.push(NECornerWall);

    //W wall
    for (i = 60; i < pHeight - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, worldXY.x + 0, worldXY.y + i, 20, 20, 20, 100, false));
    }
    //E wall
    for (i = 60; i < pHeight - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, worldXY.x + pWidth - 20, worldXY.y + i, 20, 20, 180, 100, false));
    }
    //N wall
    for (i = 40; i < pWidth - 40; i += 20)
    {
        if (i % 40)
            collidables.push(new CollidableObject(interiorWallSheet, worldXY.x + i, worldXY.y + 0, 20, 60, 80, 20, false));
        else
            collidables.push(new CollidableObject(interiorWallSheet, worldXY.x + i, worldXY.y + 0, 20, 60, 120, 20, false));
    }
    //S wall
    for (i = 40; i < pWidth - 40; i += 20) {
        collidables.push(new CollidableObject(interiorWallSheet, worldXY.x + i, worldXY.y + pHeight - 20, 20, 20, 80, 200, false));
    }

    var door = new Image();
    door.src = "./media/TOWNDOOR1_40.png";

    collidables.push(new CollidableObject(door, worldXY.x + ToTownTrigger.posX + 13, 10, 40, 46, 0, 0, false));

    player.positionX = worldXY.x + ToTownTrigger.posX;
    player.positionY = worldXY.y + ToTownTrigger.posY + player.frameHeight;
    loading = false;
}

