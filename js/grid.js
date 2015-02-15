function Tile(pSpriteXOffset, pSpriteYOffset, pSpriteSheetImage, pX, pY)
{
    this.spriteXOffset = pSpriteXOffset;
    this.spriteYOffset = pSpriteYOffset;
    this.spriteSheet = pSpriteSheetImage;
    this.x = pX;
    this.y = pY;
    this.walkable = true;
}

function Grid(canvasWidth, canvasHeight) {
    this.terrainSheet = new Image();
    this.terrainSheet.src = "./Media/GRS2ROC.bmp";
    this.pavingSheet = new Image();
    this.pavingSheet.src = "./Media/PAVE_small.png";
    this.flooringSheet = new Image();
    this.flooringSheet.src = "./Media/VILFLR_small.png";
    this.tiles = new Array();
    this.tileWidth = 40;
    this.yTileCount = Math.floor(canvasHeight / this.tileWidth);
    this.xTileCount = Math.floor(canvasWidth / this.tileWidth);

    //Outdoor Stone Floor
    this.initPaving = function initPaving() {
        for (y = 0; y < this.yTileCount; y++) {
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
                            break;;
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

    this.drawGrid = function drawGrid() {
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
        for (y = 0; y < canvasHeight / this.tileWidth; y++) {
            for (x = 0; x < canvasWidth / this.tileWidth; x++)
            {
                ctx.beginPath();
                ctx.rect(x * this.tileWidth, y * this.tileWidth, this.tileWidth, this.tileWidth);
                ctx.closePath();
                ctx.fillStyle = 'rgba(0, 0, 0, 0)';
                ctx.fill();
                ctx.strokeStyle = 'red';
                ctx.stroke();
            }
        }
        ctx.fillStyle = origFill;
    }

    this.getTile = function getTile(xCoord, yCoord)
    {
        return this.tiles[(yCoord * this.xTileCount) + xCoord];
    }

    this.GetTileFromPosition = function getTileCoords(posX, posY)
    {
        return this.getTile(Math.ceil(posX / this.tileWidth), Math.ceil(posY / this.tileWidth));
    }

    this.GetGridCoordFromPosition = function getTileCoords(posX, posY) {
        return [(posX / this.tileWidth), (posY / this.tileWidth)];
    }
}
