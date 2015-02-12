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