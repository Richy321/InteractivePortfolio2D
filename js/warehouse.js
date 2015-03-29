var signWidth = 142;
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

    var triggerYGap = 14;

    var totalHeight = signHeight + triggerYGap + teleInactiveHeight;

    var rowGap = 40;
    var colGap = 300;

    posY = posY + (colIndex * (rowGap + totalHeight));
    posX = posX + (rowIndex * (colGap + signWidth));

    var signCollidable = new CollidableObject(this.signImage, posX, posY, signWidth, signHeight, 0, 0, false);
    collidables.push(signCollidable);

    var signTrigger = new CollidableObject(teleInactive, posX + signWidth / 2 - teleInactiveWidth / 2, posY + signHeight + triggerYGap, teleInactiveWidth, teleInactiveHeight, 0, 0, true);
    signTrigger.type = "Teleporter";
    signTrigger.fireTrigger = function fireTrigger() {
        //show youtube in popup
        justFiredTrigger = true;
        clearKeyBuffer();
        player.disableMovement = true;
        $.fancybox({
            href: pVideoLink,
            title: pTitleText,
            type: 'iframe',
            padding : 0,
            beforeClose: function () {
                $(".fancybox-inner").unwrap();
                player.disableMovement = false;
            },
            helpers: {
                title: { type: 'outside' },
            },
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

function initWarehouse()
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

    var contentImage0 = new Image();
    contentImage0.src = "media/arena.png";
    signLabels[0] = "Arena";
    signContentTitle[0] = "<div>";
    signContentTitle[0] += "<p><b>Arena</b></p>";
    signContentTitle[0] += "Source: <a href='https://bitbucket.org/richy321/arena'>https://bitbucket.org/richy321/arena</a><br/><br/>";
    signContentTitle[0] += "<p>"
    signContentTitle[0] += "A Top down shooter coded in C++ and OpenGL/GLSL on the octet framework (found <a href='http://sourceforge.net/projects/octetframework/'>here</a>)<br/>";
    signContentTitle[0] += "This was the project for my first assignment of my MSc in Computer games and entertainment written in C++. Highlights include a templated object pool manager, explode vertex shader, multiple barrel turrets, integrated bullet physics library, controls via xbox controller, basic chase AI. Includes Single Player, Coop and VS modes on the same machine.";
    signContentTitle[0] += "</p>";
    signContentTitle[0] += "</div>";
    signContent[0] = contentImage0;
    signVideoLinks[0] = "http://www.youtube.com/embed/l7MGzSWvdks?autoplay=1";

    var contentImage1 = new Image();
    contentImage1.src = "media/procterrain.png";
    signLabels[1] = "Procedural Terrain";
    signContentTitle[1] = "<div>";
    signContentTitle[1] += "<p><b>Procedurally Generated Terrain</b></p>";
    signContentTitle[1] += "Source: <a href='https://bitbucket.org/richy321/terrain-generation'>https://bitbucket.org/richy321/terrain-generation</a><br/><br/>";
    signContentTitle[1] += "<p>"
    signContentTitle[1] += "Explores technqiues for procedurally generating terrain using fractals. Built using C++ OpenGL/GLSL on the octet framework (found <a href='http://sourceforge.net/projects/octetframework/'>here</a>)<br/>";
    signContentTitle[1] += "The algorithms used (in order the same order as shown in the video) are: Mid-point displacement, Diamond Square, Perlin Noise, fractal Brownian Motion (fBm) using Perlin noise. <br/>";
    signContentTitle[1] += "Perlin noise was implemented from scratched based on the Improved Perlin noise algorithm. The texture mapping linearly interpolates/blends between 5 different textures depending on high value.";
    signContentTitle[1] += "</p>";
    signContentTitle[1] += "</div>";

    signContent[1] = contentImage1;
    signVideoLinks[1] = "http://www.youtube.com/embed/y5WiY6jm-0Q?autoplay=1";

    var contentImage2 = new Image();
    contentImage2.src = "media/l-systems.png";
    signLabels[2] = "L-Systems";
    signContentTitle[2] = "<div>";
    signContentTitle[2] += "<p><b>L-Systems Implementation</b></p>";
    signContentTitle[2] += "Source: <a href='https://bitbucket.org/richy321/lsystem'>https://bitbucket.org/richy321/lsystem</a><br/><br/>";
    signContentTitle[2] += "<p>"
    signContentTitle[2] += "Implementation of a Lindenmayer system. Built using C++ and OpenGL on the octet framework (found <a href='http://sourceforge.net/projects/octetframework/'>here</a>)<br/>";
    signContentTitle[2] += "A Lindenmayer system (L-System) is a recursive self-similar fractal like form that have often been used in the generation of artifical life, especially plants and trees. <br/>";
    signContentTitle[2] += "This implementation shows 6 different L-Systems including 4 plant like systems and a Sierpinksi triangle and a Dragon curve. <br/>";
    signContentTitle[2] += "</p>";
    signContentTitle[2] += "</div>";
    signContent[2] = contentImage2;
    signVideoLinks[2] = "http://www.youtube.com/embed/ojJABvs-_s0?autoplay=1";

    var contentImage3 = new Image();
    contentImage3.src = "media/proceduralCreatures.png";
    signLabels[3] = "Procedural Creatures";
    //signContentTitle[3] = "Procedural Creatures - C++, Metaballs, Octet Framework, OpenGL, GLSL";
    signContentTitle[3] = "<div>";
    signContentTitle[3] += "<p><b>Procedural Creatures</b></p>";
    signContentTitle[3] += "Source: On Visual Studio Online. Available upon request<br/><br/>";
    signContentTitle[3] += "<p>"
    signContentTitle[3] += "Group project which generates creatures using fixed skeleton structures with randomised bone lengths/parametric curved muscles with rendering using metaballs. Built using C++ and OpenGL/GLSL on the octet framework (found <a href='http://sourceforge.net/projects/octetframework/'>here</a>)<br/>";
    signContentTitle[3] += "For this project I was in charge of the skin generation using the metaballs technique. I used brute force ray marching coupled with sphere weighting based on size and distance to determine the shape(sphere blending) of the skin. Most of the metaball work was implemented within the fragment shader. <br/>";
    signContentTitle[3] += "</p>";
    signContentTitle[3] += "</div>";
    signContent[3] = contentImage3;
    signVideoLinks[3] = "http://www.youtube.com/embed/Y_J5FiD9gP8?autoplay=1";

    var contentImage4 = new Image();
    contentImage4.src = "media/graveyardShift.png";
    signLabels[4] = "Graveyard Shift";
    signContentTitle[4] = "<div>";
    signContentTitle[4] += "<p><b>Graveyard Shift</b></p>";
    signContentTitle[4] += "<p>"
    signContentTitle[4] += "A FPS built in C++ and DirectX9 using a small games framework I developed a while ago. Includes loading of hierarchial XFile characters and animations, Quaternion FPS camera, GUI elements and a Scoreboard.<br/>";
    signContentTitle[4] += "Implements basic collisions and collision response and bullet ray casting.<br/>";
    signContentTitle[4] += "</p>";
    signContentTitle[4] += "</div>";
    signContent[4] = contentImage4;
    signVideoLinks[4] = "http://www.youtube.com/embed/AZj0DsckI0U?autoplay=1";

    var contentImage5 = new Image();
    //contentImage5.src = "media/l-systems.png";
    //signLabels[5] = "Networking Library (coming soon)";
    //signContentTitle[5] = "L-Systems implementation - C++, OpenGL, Octet Framework";
    signContent[5] = null;//contentImage5;
    //signVideoLinks[5] = "http://www.youtube.com/embed/ojJABvs-_s0?autoplay=1";



    for (var i = 0; i < numCols; i++)
    {
        for (var j = 0; j < numRows; j++)
        {
            if (signContent[i * numRows + j] != null)
            {
                var newSign = new Sign(signLabels[i * numRows + j], signContent[i * numRows + j], signVideoLinks[i * numRows + j], signContentTitle[i * numRows + j], i, j);
                signCollection.push(newSign);
            }
        }
    }

    grid.SetWalkableTiles(collidables);
}

function drawWarehouseContents()
{
    ctx.font = warehouseFont;
    ctx.textAlign = "center";

    for (var i = 0; i < signCollection.length; i++)
    {
        signCollection[i].render();
    }
}