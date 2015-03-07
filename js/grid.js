function Tile(pSpriteXOffset, pSpriteYOffset, pSpriteSheetImage, pX, pY)
{
    this.spriteXOffset = pSpriteXOffset;
    this.spriteYOffset = pSpriteYOffset;
    this.spriteSheet = pSpriteSheetImage;
    this.x = pX;
    this.y = pY;
    this.walkable = true;
    this.traversalCost = 1;
    this.overdrawColour = 'rgba(0, 0, 0, 0)';
}

function Grid(canvasWidth, canvasHeight) {
    this.terrainSheet = new Image();
    this.terrainSheet.src = "./media/GRS2ROC.bmp";
    this.pavingSheet = new Image();
    this.pavingSheet.src = "./media/PAVE_small.png";
    this.flooringSheet = new Image();
    this.flooringSheet.src = "./media/VILFLR_small.png";
    this.tiles = new Array();
    this.tileWidth = 40;
    this.yTileCount = Math.floor(canvasHeight / this.tileWidth);
    this.xTileCount = Math.floor(canvasWidth / this.tileWidth);

    this.drawOverlayCoordinates = true;

    //Outdoor Stone Floor
    this.initPaving = function initPaving(pWidth, pHeight)
    {
        this.tiles = [];

        this.tiles = new Array(this.yTileCount * this.xTileCount);

        this.yTileCount = Math.floor(canvasHeight / this.tileWidth);
        this.xTileCount = Math.floor(canvasWidth / this.tileWidth);

        for (y = 0; y < this.yTileCount; y++)
        {
            for (x = 0; x < this.xTileCount; x++) {
                var rnd = Math.floor((Math.random() * 4) + 1);
                var rnd2 = Math.floor((Math.random() * 4) + 1);

                if (rnd2 == 1) //1 in 4 chance of a random tile
                {
                    switch (rnd) {
                        case 1:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(40, 41, this.pavingSheet, x, y);
                            break;
                        case 2:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(120, 41, this.pavingSheet, x, y);
                            break;;
                        case 3:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(200, 41, this.pavingSheet, x, y);
                            break;
                        case 4:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(280, 41, this.pavingSheet, x, y);
                            break;
                    }
                }
                else {
                    this.tiles[(y * this.xTileCount) + x] = new Tile(120, 201, this.pavingSheet, x, y);
                }
            }
        }
    }

    //Wooden Floor - indoors
    this.initFlooring = function initFlooring(pWidth, pHeight)
    {
        this.tiles = [];

        this.yTileCount = Math.floor(pHeight / this.tileWidth);
        this.xTileCount = Math.floor(pWidth / this.tileWidth);

        this.tiles = new Array(this.yTileCount * this.xTileCount);

        for (y = 0; y < this.yTileCount; y++) {
            for (x = 0; x < this.xTileCount; x++) {
                var rnd = Math.floor((Math.random() * 5) + 1);
                var rnd2 = Math.floor((Math.random() * 4) + 1);

                if (rnd2 == 1) //1 in 4 chance of a random tile
                {
                    switch (rnd) {
                        case 1:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(360, 41, this.flooringSheet, x, y);
                            break;
                        case 2:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(120, 41, this.flooringSheet, x, y);
                            break;;
                        case 3:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(200, 41, this.flooringSheet, x, y);
                            break;
                        case 4:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(280, 41, this.flooringSheet, x, y);
                            break;
                        case 5:
                            this.tiles[(y * this.xTileCount) + x] = new Tile(440, 41, this.flooringSheet, x, y);
                            break;
                    }
                }
                else {
                    this.tiles[(y * this.xTileCount) + x] = new Tile(40, 41, this.flooringSheet, x, y);
                }
            }
        }
    }

    this.drawGrid = function drawGrid()
    {
        for (y = 0; y < this.yTileCount; y++) {
            for (x = 0; x < this.xTileCount; x++) {
                var tile = this.tiles[(y * this.xTileCount) + x];
                ctx.drawImage(tile.spriteSheet, tile.spriteXOffset, tile.spriteYOffset, this.tileWidth, this.tileWidth, x * this.tileWidth, y * this.tileWidth, this.tileWidth, this.tileWidth);
            }
        }
    }

    this.drawGridOverlay = function drawGridOverlay()
    {
        var origFill = ctx.fillStyle;
        for (y = 0; y < this.yTileCount; y++) {
            for (x = 0; x < this.xTileCount; x++)
            {
                var tile = this.getTile(x, y);
                ctx.beginPath();
                ctx.rect(x * this.tileWidth, y * this.tileWidth, this.tileWidth, this.tileWidth);
                ctx.closePath();
                ctx.fillStyle = tile.overdrawColour;
                ctx.fill();
                ctx.strokeStyle = 'red';
                ctx.stroke();
                if (this.drawOverlayCoordinates)
                {
                    ctx.fillStyle = 'white';
                    ctx.textAlign = "center";
                    ctx.font = '10px sans-serif';
                    var coordText = x + "," + y;
                    wrapText(ctx, coordText, x * this.tileWidth + this.tileWidth * 0.5, y * this.tileWidth + this.tileWidth * 0.5, x * this.tileWidth + this.tileWidth, y * this.tileWidth + this.tileWidth);
                }
            }
        }
        ctx.fillStyle = origFill;
    }

    this.getTile = function getTile(xCoord, yCoord)
    {
        if (xCoord >= 0 && xCoord <= this.xTileCount &&
            yCoord >= 0 && yCoord <= this.yTileCount)
        {
            return this.tiles[(yCoord * this.xTileCount) + xCoord];
        }
        else
            return null;
    }

    this.GetTileFromPosition = function getTileCoords(posX, posY)
    {
        return this.getTile(Math.floor(posX / this.tileWidth), Math.floor(posY / this.tileWidth));
    }

    this.GetGridCoordFromPosition = function getTileCoords(posX, posY) {
        return [(posX / this.tileWidth), (posY / this.tileWidth)];
    }

    this.GetPositionCenterFromCoord = function GetPositionFromCoord(x, y)
    {
        return new point(x * this.tileWidth + this.tileWidth / 2, y * this.tileWidth + this.tileWidth / 2);
    }

    this.SetWalkableTiles = function SetWalkableTiles(collidables)
    {
        //O(n^2) - can improve 
        //check min and max points and set inclusive tiles to walkable false?
        for (var i = 0; i < collidables.length; i++)
        {
            for (var j = 0; j < this.tiles.length; j++)
            {
                var tileBounds = new Bounds(this.tiles[j].x * this.tileWidth, this.tiles[j].y * this.tileWidth, this.tiles[j].x * this.tileWidth + this.tileWidth, this.tiles[j].y * this.tileWidth + this.tileWidth);
                
                if (doBoundsIntersect(tileBounds, collidables[i].getBounds()))
                {
                    if (collidables[i].type == "Teleporter")
                    {
                        this.tiles[j].traversalCost = 100;
                        this.tiles[j].overdrawColour = 'rgba(255, 255, 0, 0.3)';
                    }
                    else
                    {
                        this.tiles[j].walkable = false;
                        this.tiles[j].overdrawColour = 'rgba(255, 0, 0, 0.3)';
                    }
                }
            }
        }
    }
}
