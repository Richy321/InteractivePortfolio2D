var signWidth = 180;
var signHeight = 195;

var warehouseFont = '17.5px sans-serif';

var signCollection = new Array();


function Sign(pLabel, pSignContent, pX, pY)
{
    this.label = pLabel;
    this.content = pSignContent;
    this.x = pX;
    this.y = pY;
}

function initProgHouse() {
    curScene = "ProgHouse";
    initGenericHouse(WIDTH_HOUSE, HEIGHT_HOUSE);

    var signLabels = new Array("sign1", "sign2", "sign3");
    var signContent = new Array("sign1", "sign2", "sign3");
    for (var i = 0; i < 3; i++)
    {
        var newSign = new Sign(signLabels[i], signContent[i], 128 + 128 * i, 25 + 25 * i);
    }

    var signImg = new Image();
    signImg.src = "Media/signM.png";

    var sign1 = new CollidableObject(signImg, 128, 25, signWidth, signHeight, 0, 0, false);
    collidables.push(sign1);
    var sign1Trigger = new CollidableObject(teleInactive, 128 + signWidth / 2 - 32, signHeight + 47, 64, 32, 0, 0, true);
    sign1Trigger.type = "Teleporter";
    sign1Trigger.fireTrigger = function fireTrigger() {
        //show youtube in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        player.disableMovement = true;
        $.fancybox({
            href: 'http://www.youtube.com/embed/3l8MwU0IjMI?autoplay=1',
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
    collidables.push(sign1Trigger);
    var signContentImg = new Image();
    signContentImg.src = "Media/testContentImage.png";
    var signContentOffsetX = 25;
    var signContentOffsetY = 30;
    var sign1Content = new CollidableObject(signContentImg, 128 + signContentOffsetX, 25 + signContentOffsetY, 90, 65, 0, 0, false);
    collidables.push(sign1Content);
    //90, 65



    grid.SetWalkableTiles(collidables);
}

function drawProgContents() {


    ctx.textAlign = "center";
    ctx.font = warehouseFont;

    var sign1Text = "Sign1";
    ctx.fillText(sign1Text, 128 + signWidth / 2, signHeight);

    /*
    var infoTxt = "Info";
    var dlText = "Download";

    var textProg = "Graveyard Shift";
    ctx.fillText(textProg, 30, 70);
    //ctx.drawImage(gsImg, 30, 80, 150, 100);
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
    */
}