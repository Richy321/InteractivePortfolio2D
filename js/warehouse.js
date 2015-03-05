var signWidth = 142;
var signHeight = 154;

var warehouseFont = '17.5px sans-serif';

var signCollection = new Array();

var HEIGHT_HOUSE_PROG = 800;
var WIDTH_HOUSE_PROG = 800;


function Sign(pLabel, pSignContent, pVideoLink, rowIndex, colIndex)
{
    this.label = pLabel;
    this.content = pSignContent;
    this.row = rowIndex;
    this.col = colIndex;
    this.signImage = new Image();
    this.signImage.src = "Media/signM.png";
    this.signContentImage = pSignContent;
    this.videoLink = pVideoLink;

    var signContentOffsetX = 25;
    var signContentOffsetY = 30;

    var posX = 128;
    var posY = 25;

    var signContentWidth = 90;
    var signContentHeight = 65;

    var triggerYGap = 47;

    var totalHeight = signHeight + triggerYGap + teleInactiveHeight;

    var rowGap = 0;
    var colGap = 300;

    posY = posY + (colIndex * (rowGap + totalHeight));
    posX = posX + (rowIndex * (colGap + signWidth));

    var signCollidable = new CollidableObject(this.signImage, posX, posY, signWidth, signHeight, 0, 0, false);
    collidables.push(signCollidable);

    var signTrigger = new CollidableObject(teleInactive, posX + signWidth / 2 - teleInactiveWidth / 2, posY + signHeight, teleInactiveWidth, teleInactiveHeight, 0, 0, true);
    signTrigger.type = "Teleporter";
    signTrigger.fireTrigger = function fireTrigger() {
        //show youtube in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        player.disableMovement = true;
        $.fancybox({
            href: pVideoLink,
            //width: 560,
            //height: 315,
            type: 'iframe',
            beforeClose: function () {
                $(".fancybox-inner").unwrap();
                player.disableMovement = false;
            },
            helpers: {
                overlay: {
                    opacity: 0.3
                } // overlay
            } // helpers
        }); // fancybox
    };
    collidables.push(signTrigger);

    var signContent = new CollidableObject(this.signContentImage, posX + signContentOffsetX, posY + signContentOffsetY, signContentWidth, signContentHeight, 0, 0, false);
    collidables.push(signContent);

    this.render = function render()
    {
        ctx.fillText(this.label, posX + signWidth / 2, posY + signHeight * 0.85);
    }
}

function initProgHouse()
{
    curScene = "ProgHouse";
    initGenericHouse(WIDTH_HOUSE_PROG, HEIGHT_HOUSE_PROG);

    var testImage = new Image();
    testImage.src = "Media/testContentImage.png";

    var contentImage1 = new Image();
    contentImage1.src = "Media/arena.png";

    var signLabels = new Array("Arena", "sign2", "sign3", "sign4", "sign5", "sign6");
    var signContent = new Array(contentImage1, testImage, testImage, testImage, testImage, testImage);
    var signVideoLinks = new Array(
        "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1", "http://www.youtube.com/embed/3l8MwU0IjMI?autoplay=1",
        "http://www.youtube.com/embed/3l8MwU0IjMI?autoplay=1", "http://www.youtube.com/embed/3l8MwU0IjMI?autoplay=1",
        "http://www.youtube.com/embed/3l8MwU0IjMI?autoplay=1", "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1");
    
    var numCols = 2;
    var numRows = 3;

    for (var i = 0; i < numCols; i++)
    {
        for (var j = 0; j < numRows; j++) {

            var newSign = new Sign(signLabels[i * numRows + j], signContent[i * numRows + j], signVideoLinks[i * numRows + j], i, j);
            signCollection.push(newSign);
        }
    }

    grid.SetWalkableTiles(collidables);
}

function drawProgContents()
{
    ctx.font = warehouseFont;
    ctx.textAlign = "center";

    for (var i = 0; i < signCollection.length; i++)
    {
        signCollection[i].render();
    }
}