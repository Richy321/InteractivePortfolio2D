//Container for object boundaries
function Bounds(pMinX, pMinY, pMaxX, pMaxY)
{
    this.minX = pMinX;
    this.minY = pMinY;
    this.maxX = pMaxX;
    this.maxY = pMaxY;
}

function doBoundsIntersect(obj1Bounds, obj2Bounds)
{

    return (obj1Bounds.minX <= obj2Bounds.maxX) &&
        (obj1Bounds.minY <= obj2Bounds.maxY) &&
        (obj1Bounds.maxX >= obj2Bounds.minX) &&
        (obj1Bounds.maxY >= obj2Bounds.minY);
}

//Sprite sheet geometry for the walking character. Shared rather than described in
//the Player constructor, because the networked characters are drawn from the same
//sheet and two copies of these offsets would drift apart.
var CHARACTER_SPRITE_SRC = "./media/IWDCHAR.png";
var CHARACTER_FRAME_WIDTH = 21;
var CHARACTER_FRAME_HEIGHT = 30;
var CHARACTER_FRAME_COUNT = 3;
var CHARACTER_SPRITE_SCALE = 2;

function SpriteFrame(pSpriteXOffset, pSpriteYOffset, pWidth, pHeight) {
    this.spriteXOffset = pSpriteXOffset;
    this.spriteYOffset = pSpriteYOffset;
    this.width = pWidth;
    this.height = pHeight;
}

//The four walk cycles as laid out on IWDCHAR.png. The x offsets are not a regular
//stride - the sheet is not perfectly aligned - so they stay written out.
function createCharacterFrames()
{
    var w = CHARACTER_FRAME_WIDTH;
    var h = CHARACTER_FRAME_HEIGHT;

    return {
        up: [new SpriteFrame(0, 0, w, h), new SpriteFrame(24, 0, w, h), new SpriteFrame(48, 0, w, h)],
        right: [new SpriteFrame(2, 32, w, h), new SpriteFrame(25, 32, w, h), new SpriteFrame(48, 32, w, h)],
        down: [new SpriteFrame(2, 64, w, h), new SpriteFrame(25, 64, w, h), new SpriteFrame(49, 64, w, h)],
        left: [new SpriteFrame(0, 95, w, h), new SpriteFrame(24, 95, w, h), new SpriteFrame(48, 95, w, h)]
    };
}

function wrapText(context, text, x, y, maxWidth, lineHeight)
{
    var words = text.split(" ");
    var line = "";

    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth) {
            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
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

function point(pX, pY)
{
    this.x = pX;
    this.y = pY;
}