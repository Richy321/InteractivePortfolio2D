var bookcaseWidth = 40;
var bookcaseHeight = 76;
var xOffsetBookcase = 100;
var yOffsetBookcase = 20;

var armorSetWidth = 90;
var armorSetHeight = 57;
var xOffsetArmorSet = -100;
var yOffsetArmorSet = 20;

var wallSwordWidth = 87;
var wallSwordHeight = 22;

var sawBarrelWidth = 45;
var sawBarrelHeight = 93;

var anvilRWidth = 40;
var anvilRHeight = 36;

var lavaBucketWidth = 71;
var lavaBucketHeight = 37;

var forgeWidth = 100;
var forgeHeight = 161;

var logsWidth = 40;
var logsHeight = 41;

var penInkWidth = 35;
var penInkHeight = 31;

var teleInactiveWidth = 64;
var teleInactiveHeight = 32;

var interviewTableWidth = 100;
var interviewTableHeight = 101;

var interviewChairTopWidth = 30;
var interviewChairTopHeight = 33;

var interviewChairBottomWidth = 30
var interviewChairBottomHeight = 33;

var cvScrollWidth = 25;
var cvScrollHeight = 34;

var houseFont = '17.5px sans-serif';

function initAboutHouse() {
    curScene = "AboutHouse";
    initGenericHouse();

    //Email me
    var table = new Image();
    table.src = "Media/TableAndChairs.png";
    collidables.push(new CollidableObject(table, WIDTH_HOUSE / 2 - 169 / 2, 270, 169, 60, 0, 0, false));
    var penInk = new Image();
    penInk.src = "Media/inkPen.png";
    collidables.push(new CollidableObject(penInk, WIDTH_HOUSE / 2 - penInkWidth / 2, 260 + penInkHeight / 2, penInkWidth, penInkHeight, 0, 0, false));
    var emailTrigger = new CollidableObject(teleInactive, WIDTH_HOUSE / 2 - teleInactiveWidth / 2, 345, 64, 32, 0, 0, true);
    emailTrigger.type = "Teleporter";

    emailTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        player.disableMovement = true;
        clearKeyBuffer();
        $.fancybox.open({
            padding: 0,
            beforeClose: function () {
                $(".fancybox-inner").unwrap();
                player.disableMovement = false;
            },
            href: 'pages/contact.html',
            type: 'iframe'
        });
    };
    collidables.push(emailTrigger);


    //Education
    var bookcase = new Image();
    bookcase.src = "Media/bookcaseM.png";
    collidables.push(new CollidableObject(bookcase, xOffsetBookcase, yOffsetBookcase, bookcaseWidth, bookcaseHeight, 0, 0, false));
    collidables.push(new CollidableObject(bookcase, xOffsetBookcase + bookcaseWidth, yOffsetBookcase, bookcaseWidth, bookcaseHeight, 0, 0, false));
    collidables.push(new CollidableObject(bookcase, xOffsetBookcase + bookcaseWidth * 2, yOffsetBookcase, bookcaseWidth, bookcaseHeight, 0, 0, false));
    collidables.push(new CollidableObject(bookcase, xOffsetBookcase + bookcaseWidth * 3, yOffsetBookcase, bookcaseWidth, bookcaseHeight, 0, 0, false));
    var educationTrigger = new CollidableObject(teleInactive, xOffsetBookcase + bookcaseWidth + 8, yOffsetBookcase + bookcaseHeight + 40, 64, 32, 0, 0, true);
    educationTrigger.type = "Teleporter";
    educationTrigger.fireTrigger = function fireTrigger() {
        justFiredTrigger = true;
        player.disableMovement = true;
        clearKeyBuffer();
        $.fancybox.open({
            padding: 0,
            beforeClose: function () {
                $(".fancybox-inner").unwrap();
                player.disableMovement = false;
            },
            href: 'pages/education.html',
            type: 'iframe'
        });
    };
    collidables.push(educationTrigger);


    //Skills
    var armorSet = new Image();
    armorSet.src = "Media/ArmorSetL.png";
    collidables.push(new CollidableObject(armorSet, WIDTH_HOUSE + xOffsetArmorSet - armorSetWidth, yOffsetBookcase, armorSetWidth, armorSetHeight, 0, 0, false));
    var wallSword = new Image();
    wallSword.src = "Media/wallSwordM.png";
    collidables.push(new CollidableObject(wallSword, WIDTH_HOUSE + xOffsetArmorSet - armorSetWidth - wallSwordWidth, yOffsetBookcase, wallSwordWidth, wallSwordHeight, 0, 0, false));
    var sawBarrel = new Image();
    sawBarrel.src = "Media/sawBarrelM.png";
    collidables.push(new CollidableObject(sawBarrel, WIDTH_HOUSE - sawBarrelWidth - 30, yOffsetBookcase, sawBarrelWidth, sawBarrelHeight, 0, 0, false));

    collidables.push(new CollidableObject(sawBarrel, WIDTH_HOUSE - sawBarrelWidth - 30, yOffsetBookcase + sawBarrelHeight / 2.5, sawBarrelWidth, sawBarrelHeight, 0, 0, false));
    var skillsTrigger = new CollidableObject(teleInactive, WIDTH_HOUSE + xOffsetArmorSet - 82, yOffsetBookcase + bookcaseHeight + 40, 64, 32, 0, 0, true);
    skillsTrigger.type = "Teleporter";
    skillsTrigger.fireTrigger = function fireTrigger() {
        justFiredTrigger = true;
        player.disableMovement = true;
        clearKeyBuffer();
        $.fancybox.open({
            padding: 0,
            beforeClose: function () {
                $(".fancybox-inner").unwrap();
                player.disableMovement = false;
            },
            href: 'pages/skills.html',
            type: 'iframe'
        });
    };
    collidables.push(skillsTrigger);


    //Work Experience
    var anvilR = new Image();
    anvilR.src = "Media/anvilR_M.png";
    collidables.push(new CollidableObject(anvilR, 20 + 15 + lavaBucketWidth, HEIGHT_HOUSE - 20 - anvilRHeight - 5, anvilRWidth, anvilRHeight, 0, 0, false));
    collidables.push(new CollidableObject(anvilR, 20 + 20 + lavaBucketWidth + anvilRWidth, HEIGHT_HOUSE - 20 - anvilRHeight - 5, anvilRWidth, anvilRHeight, 0, 0, false));

    var lavaBucket = new Image();
    lavaBucket.src = "Media/lava.png";
    collidables.push(new CollidableObject(lavaBucket, 20 + 5, HEIGHT_HOUSE - 20 - anvilRHeight - 5, lavaBucketWidth, lavaBucketHeight, 0, 0, false));

    var forge = new Image();
    forge.src = "Media/forge.png";
    collidables.push(new CollidableObject(forge, 20 + 25, HEIGHT_HOUSE - 20 - anvilRHeight * 2 - 50 - forgeHeight, forgeWidth, forgeHeight, 0, 0, false));

    var logs = new Image();
    logs.src = "media/logs.png";
    collidables.push(new CollidableObject(logs, 20 + 5, HEIGHT_HOUSE - 20 - lavaBucketHeight - 10 - logsHeight, logsWidth, logsHeight, 0, 0, false));
    collidables.push(new CollidableObject(logs, 20 + 5, HEIGHT_HOUSE - 20 - lavaBucketHeight - 10 - logsHeight * 2, logsWidth, logsHeight, 0, 0, false));

    var workExpTrigger = new CollidableObject(teleInactive, xOffsetBookcase + bookcaseWidth * 2, HEIGHT_HOUSE - 140, 64, 32, 0, 0, true);
    workExpTrigger.type = "Teleporter";
    workExpTrigger.fireTrigger = function fireTrigger() {
        justFiredTrigger = true;
        player.disableMovement = true;
        clearKeyBuffer();
        $.fancybox.open({
            padding: 0,
            beforeClose: function () {
                $(".fancybox-inner").unwrap();
                player.disableMovement = false;
            },
            href: 'pages/workExperience.html',
            type: 'iframe'
        });

    };
    collidables.push(workExpTrigger);

    //CV & Misc
    var interviewTable = new Image();
    interviewTable.src = "Media/interviewTable.png";
    collidables.push(new CollidableObject(interviewTable, WIDTH_HOUSE - 20 - interviewTableWidth - 40, HEIGHT_HOUSE - interviewTableHeight - 20 - 50, interviewTableWidth, interviewTableHeight, 0, 0, false));

    var interviewChairTop = new Image();
    interviewChairTop.src = "Media/interviewTableChairTop.png";
    collidables.push(new CollidableObject(interviewChairTop, WIDTH_HOUSE - 20 - interviewTableWidth - 5, HEIGHT_HOUSE - interviewTableHeight - 20 - 80, interviewTableWidth, interviewTableHeight, 0, 0, false));


    var interviewChairBottom = new Image();
    interviewChairBottom.src = "Media/interviewTableChairBottom.png";
    collidables.push(new CollidableObject(interviewChairBottom, WIDTH_HOUSE - 20 - interviewTableWidth - 5, HEIGHT_HOUSE - interviewTableHeight + interviewChairBottomHeight / 2, interviewTableWidth, interviewTableHeight, 0, 0, false));


    var cvScroll = new Image();
    cvScroll.src = "Media/cvScroll.png";
    collidables.push(new CollidableObject(cvScroll, WIDTH_HOUSE - 20 - interviewTableWidth - 40 + cvScrollWidth + cvScrollWidth / 2, HEIGHT_HOUSE - interviewTableHeight - 20 - 60 + cvScrollHeight, cvScrollWidth, cvScrollHeight, 0, 0, false));


    var CVTrigger = new CollidableObject(teleInactive, WIDTH_HOUSE - 20 - interviewTableWidth - 110, HEIGHT_HOUSE - 140, 64, 32, 0, 0, true);
    CVTrigger.type = "Teleporter";
    CVTrigger.fireTrigger = function fireTrigger() {
        //show CV in popup
        justFiredTrigger = true;
        player.disableMovement = true;
        clearKeyBuffer();
        $.fancybox({
            type: 'html',
            autoSize: false,
            content: '<embed src="' + 'CV_Games2.pdf' + '#nameddest=self&page=1&view=FitH,0&zoom=90,0,0" type="application/pdf" height="99%" width="100%" />',
            beforeClose: function () {
                $(".fancybox-inner").unwrap();
                player.disableMovement = false;
            },
            helpers: {
                overlay: {
                    opacity: 0.3
                } // overlay
            }
        }); //fancybox

    };
    collidables.push(CVTrigger);

    grid.SetWalkableTiles(collidables);
}

function drawAboutText() {
    ctx.textAlign = "center";

    var educationText = "Education";
    ctx.font = houseFont;
    wrapText(ctx, educationText, xOffsetBookcase + bookcaseWidth * 2, yOffsetBookcase + bookcaseHeight + 20, bookcaseWidth * 4, 20);

    var skillsText = "Skills";
    ctx.font = houseFont;
    wrapText(ctx, skillsText, WIDTH_HOUSE + xOffsetArmorSet - 50, yOffsetBookcase + bookcaseHeight + 20, bookcaseWidth * 4, 20);

    var workExperienceText = "Work Experience";
    ctx.font = houseFont;
    wrapText(ctx, workExperienceText, xOffsetBookcase + 117, HEIGHT_HOUSE - 80, bookcaseWidth * 4, 20);

    var CVText = "CV";
    ctx.font = houseFont;
    wrapText(ctx, CVText, WIDTH_HOUSE - 20 - interviewTableWidth - 75, HEIGHT_HOUSE - 90, bookcaseWidth * 4, 20);

    /*
    var textAbout = "Software Developer with a wide skill base, 4+ years experience and a passion for " +
    "games development. Experienced in mobile games development with a published game on the app store. Additionally " +
    "I have worked on small web based games using GWT/GAE and HTML5 canvas, military training/simulation software, " +
    "stock management and EPOS systems with SQL database design, development and maintenance.";
    ctx.font = '17.5px sans-serif';
    wrapText(ctx, textAbout, 50, 140, 725, 20);

    ctx.textAlign = "left";

    var textCV = "Open CV (Popup .pdf)";
    ctx.font = 'italic bold 20px sans-serif';
    ctx.fillText(textCV, 50, 400);
    */
    var textEmailPopup = "Contact Me";
    ctx.fillText(textEmailPopup, WIDTH_HOUSE / 2, 345);
}