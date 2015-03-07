﻿var signWidth = 142;
var signHeight = 154;

var warehouseFont = '17.5px sans-serif';

var signCollection = new Array();

var HEIGHT_HOUSE_PROG = 800;
var WIDTH_HOUSE_PROG = 800;
var warehouseWorldXY = new point(0, 0);


function Sign(pLabel, pSignContent, pVideoLink, pTitleText, rowIndex, colIndex)
{
    this.label = pLabel;
    this.content = pSignContent;
    this.row = rowIndex;
    this.col = colIndex;
    this.signImage = new Image();
    this.signImage.src = "media/signM.png";
    this.signContentImage = pSignContent;
    this.videoLink = pVideoLink;

    var signContentOffsetX = 25;
    var signContentOffsetY = 30;

    var posX = warehouseWorldXY.x + 128;
    var posY = warehouseWorldXY.y + 25;

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
            helpers: {
                title: {
                    type: 'inside',
                    position: 'top'
                }
            },
            href: pVideoLink,
            //title: '<div>' + pTitleText + '</div>',
            //titlePosition: 'outside'
            //width: 560,
            //height: 315,
            type: 'iframe',
            beforeLoad: function ()
            {
                this.title = pTitleText;
            },
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
    locationState = LocationEnum.WAREHOUSE;
    
    initGenericHouse(WIDTH_HOUSE_PROG, HEIGHT_HOUSE_PROG, warehouseWorldXY);

    var numCols = 2;
    var numRows = 3;

    var signLabels = new Array(numCols* numRows);
    var signContent = new Array(numCols * numRows);
    var signContentTitle = new Array(numCols * numRows);
    var signVideoLinks = new Array(numCols * numRows);

    var testImage = new Image();
    testImage.src = "media/testContentImage.png";


    var contentImage1 = new Image();
    contentImage1.src = "media/arena.png";
    signLabels[0] = "Arena";
    signContentTitle[0] = "Arena - C++, OpenGL, Bullet Physics, XBox Controller                                     Line 2";
    signContent[0] = contentImage1;
    signVideoLinks[0] = "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1";

    signLabels[1] = "sign2";
    signContentTitle[1] = "2";
    signContent[1] = testImage;
    signVideoLinks[1] = "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1";

    signLabels[2] = "sign3";
    signContentTitle[2] = "3";
    signContent[2] = testImage;
    signVideoLinks[2] = "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1";

    signLabels[3] = "sign4";
    signContentTitle[3] = "4";
    signContent[3] = testImage;
    signVideoLinks[3] = "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1";

    signLabels[4] = "sign4";
    signContentTitle[4] = "4";
    signContent[4] = testImage;
    signVideoLinks[4] = "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1";

    signLabels[5] = "sign5";
    signContentTitle[5] = "5";
    signContent[5] = testImage;
    signVideoLinks[5] = "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1";


    for (var i = 0; i < numCols; i++)
    {
        for (var j = 0; j < numRows; j++) {

            var newSign = new Sign(signLabels[i * numRows + j], signContent[i * numRows + j], signVideoLinks[i * numRows + j],signContentTitle[i * numRows + j], i, j);
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