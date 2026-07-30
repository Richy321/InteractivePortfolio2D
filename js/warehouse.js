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
    this.signImage.src = "./media/signM.png";
    this.signContentImage = pSignContent;
    this.videoLink = pVideoLink;

    var signContentOffsetX = 25;
    //Centred in the board's opening now that the artwork is shorter than it was.
    var signContentOffsetY = 37;

    var posX = warehouseWorldXY.x + 128;
    var posY = warehouseWorldXY.y + 25;

    //16:9, so a video thumbnail drops straight in. The old 90x65 opening squashed
    //one vertically by nearly a third.
    var signContentWidth = 90;
    var signContentHeight = 51;

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
        justFiredTrigger = true;
        clearKeyBuffer();
        player.disableMovement = true;

        var options = {
            padding: 0,
            beforeClose: function () {
                $(".fancybox-inner").unwrap();
                player.disableMovement = false;
            }
        };

        if (pVideoLink)
        {
            //Video, with the write-up underneath it.
            options.href = pVideoLink;
            options.type = 'iframe';
            options.title = pTitleText;
            options.helpers = { title: { type: 'outside' } };
        }
        else
        {
            //Nothing public to embed for this one, so show the write-up on its own
            //rather than an empty player.
            options.content = '<div class="signPopup">' + pTitleText + '</div>';
            options.type = 'html';
            options.autoSize = true;
        }

        $.fancybox(options); // fancybox
    };
    collidables.push(signTrigger);

    //The artwork is drawn here rather than pushed as a collidable, because
    //CollidableObject passes its size as both the source and destination rect: it
    //crops that many pixels out of the top left instead of scaling, which is why
    //every original sign image had to be exactly 90x65. Scaling the whole image
    //means artwork of any size can be dropped in. The board already covers this
    //area for collision purposes, so nothing is lost by not being a collidable.
    this.render = function render()
    {
        var artwork = this.signContentImage;

        if (artwork && artwork.complete && artwork.naturalWidth > 0)
        {
            ctx.drawImage(artwork, posX + signContentOffsetX, posY + signContentOffsetY,
                signContentWidth, signContentHeight);
        }

        //Wrapped to the sign, the same way the house labels are: a title longer
        //than the board ran off the side when drawn as a single line.
        wrapText(ctx, this.label, posX + signWidth / 2, posY + signHeight * 0.85, signWidth, 20);
    }
}

function initWarehouse()
{
    locationState = LocationEnum.WAREHOUSE;
    
    initGenericHouse(WIDTH_HOUSE_PROG, HEIGHT_HOUSE_PROG, warehouseWorldXY);

    var numCols = 2;
    var numRows = 3;

    //Each sign has its own image file in media/, currently a plain 16:9 placeholder
    //panel. Overwrite the file to give a sign its artwork - no code change needed.
    function signImage(source)
    {
        var image = new Image();
        image.src = source;
        return image;
    }

    //One entry per sign. video is the YouTube embed URL for the popup, or null
    //where there is no publicly released footage to show - the popup then shows
    //the write-up on its own rather than an empty player. Array order fills the
    //grid a column at a time: 0-2 down the left wall, 3-5 down the right.
    var projects = [
    {
        label: "HELIX",
        image: signImage("./media/helix.png"),
        video: "https://www.youtube.com/embed/nwywfZuhHH4?autoplay=1",
        description:
            "<div>" +
            "<p><b>HELIX</b> &ndash; Hypersonic Laboratories (Lead Software Engineer)</p>" +
            "<p>User generated content games platform built on Unreal Engine 5.</p>" +
            "<p>Leading international engineering teams delivering HELIX: a custom engine build, plugin architecture, Chaos Vehicles, Iris Networking, Gameplay Ability System, Lua scripting integration and ModKit/modding support.</p>" +
            "<p>Own technical direction, system architecture and release management across an engineering team of 10&ndash;15 split into three sub-teams, and direct the DevOps and LiveOps infrastructure spanning Jenkins, Perforce, BuildGraph, Docker, cloud and dedicated servers.</p>" +
            "</div>"
    },
    {
        label: "Cast Outs",
        image: signImage("./media/castOuts.png"),
        video: "https://www.youtube.com/embed/If76IrwqxSI?autoplay=1",
        description:
            "<div>" +
            "<p><b>Cast Outs</b> &ndash; Twisted Works (Senior Programmer, contract)</p>" +
            "<p>Released on Steam.</p>" +
            "<p>Prototyped UE5 multiplayer mechanics and Gameplay Ability System features, alongside optimisation and bug fixing. Set up the Azure cloud CI and build infrastructure using Jenkins and Perforce.</p>" +
            "</div>"
    },
    {
        label: "Planet of the Apes",
        image: signImage("./media/planetOfTheApes.png"),
        video: "https://www.youtube.com/embed/J5P9wd9wNpY?autoplay=1",
        description:
            "<div>" +
            "<p><b>Planet of the Apes: Last Frontier</b> &ndash; Imaginati Studios (Senior Programmer)</p>" +
            "<p>PS4, Xbox One and PC/Steam.</p>" +
            "<p>Built a full-cycle narrative UE4 title from vertical slice to release, including level streaming, local multiplayer and a dynamic audio sequencer plugin. Integrated PlayStation PlayLink, Wi-Fi hotspot multiplayer, Microsoft Mixer and Steam, and delivered console submission, TRC compliance and post-launch patches.</p>" +
            "</div>"
    },
    {
        label: "TerraTech Worlds",
        image: signImage("./media/terraTechWorlds.png"),
        video: "https://www.youtube.com/embed/BPdgAEFk-CA?autoplay=1",
        description:
            "<div>" +
            "<p><b>TerraTech Worlds</b> and <b>TerraTech</b> &ndash; Payload Studios (Senior Programmer)</p>" +
            "<p><b>TerraTech Worlds</b> (Steam, UE5): implemented core gameplay systems &ndash; block building, crafting and automation, and multiplayer &ndash; using ECS. Backend integration with PlayFab and AWS, spatial UI in UMG, and ownership of the build pipeline and system optimisation through BuildGraph.</p>" +
            "<p><b>TerraTech</b> (PS4, Xbox One, Nintendo Switch, PC/Steam, Unity): new features, bug fixes and live maintenance for the existing release across four platforms.</p>" +
            "<p>Managed and mentored junior programmers, including aspiring programmers moving across from QA.</p>" +
            "</div>"
    },
    {
        label: "Narcos",
        image: signImage("./media/narcos.png"),
        video: "https://www.youtube.com/embed/BMTgVN4xIeo?autoplay=1",
        description:
            "<div>" +
            "<p><b>Narcos: Rise of the Cartels</b> &ndash; Kuju (Senior Programmer)</p>" +
            "<p>PS4, Xbox One, Nintendo Switch and PC/Steam.</p>" +
            "<p>Delivered core mechanics, combat and data driven skills systems for a full-cycle UE4 turn-based strategy title, shipped across four platforms in around a year with a small team. Console development, async tasks, optimisation and submission/patching.</p>" +
            "</div>"
    },
    {
        label: "Earlier work",
        image: signImage("./media/proceduralCreatures.png"),
        video: null,
        description:
            "<div>" +
            "<p><b>Earlier and academic work</b></p>" +
            "<p>Graphics and procedural generation projects from an MSc in Computer Games &amp; Entertainment at Goldsmiths, plus earlier personal engine work. C++ with OpenGL/GLSL and DirectX.</p>" +
            "<ul>" +
            "<li><b>Arena</b> &ndash; top down shooter in C++ and OpenGL/GLSL. Templated object pool, explode vertex shader, multiple barrel turrets, bullet physics, chase AI, and single player, co-op and versus modes. " +
            "<a href='https://www.youtube.com/watch?v=l7MGzSWvdks' target='_blank' rel='noopener'>video</a>, " +
            "<a href='https://bitbucket.org/richy321/arena' target='_blank' rel='noopener'>source</a></li>" +
            "<li><b>Procedural Terrain</b> &ndash; fractal terrain generation in C++ and OpenGL/GLSL. " +
            "<a href='https://www.youtube.com/watch?v=y5WiY6jm-0Q' target='_blank' rel='noopener'>video</a></li>" +
            "<li><b>L-Systems</b> &ndash; Lindenmayer system implementation in C++ and OpenGL. " +
            "<a href='https://www.youtube.com/watch?v=ojJABvs-_s0' target='_blank' rel='noopener'>video</a></li>" +
            "<li><b>Procedural Creatures</b> &ndash; group project generating creatures from fixed skeletons with randomised bone lengths and parametric curved muscles, rendered with metaballs. " +
            "<a href='https://www.youtube.com/watch?v=Y_J5FiD9gP8' target='_blank' rel='noopener'>video</a></li>" +
            "<li><b>Graveyard Shift</b> &ndash; FPS in C++ and DirectX 9 on a personal framework: hierarchical XFile characters and animation, quaternion FPS camera, GUI and scoreboard. " +
            "<a href='https://www.youtube.com/watch?v=AZj0DsckI0U' target='_blank' rel='noopener'>video</a></li>" +
            "</ul>" +
            "</div>"
    }];

    //Rebuilt every time the warehouse is entered. Without this the signs from the
    //previous visit stayed in the collection and were drawn again on top.
    signCollection.length = 0;

    for (var col = 0; col < numCols; col++)
    {
        for (var row = 0; row < numRows; row++)
        {
            var project = projects[col * numRows + row];

            if (project == null || project.image == null)
                continue;

            signCollection.push(new Sign(project.label, project.image, project.video, project.description, col, row));
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