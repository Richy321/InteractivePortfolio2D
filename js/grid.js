function Tile(pSpriteXOffset, pSpriteYOffset, pSpriteSheetImage)
{
    this.spriteXOffset = pSpriteXOffset;
    this.spriteYOffset = pSpriteYOffset;
    this.spriteSheet = pSpriteSheetImage;
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

    //Outdoor Stone Floor
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
                            break;;
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
        for (y = 0; y < canvasHeight / this.tileWidth; y++) {
            for (x = 0; x < canvasWidth / this.tileWidth; x++) {
                var tile = this.tiles[(y * (canvasWidth / this.tileWidth)) + x];
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
        return tiles[(y * (canvasWidth / this.tileWidth)) + x];
    }
}
