//Modal popups, built on the native <dialog> element.
//
//This replaces fancyBox 2.1.5, which was the site's last reason to load jQuery.
//Everything the game ever asked of it comes down to three shapes: a page from ./pages
//shown in an iframe sized to its content, a block of HTML, and a video with a write-up
//underneath. <dialog> supplies the backdrop, the escape key, focus containment and the
//top layer - most of what the plugin was doing - so what is left is the look and the
//sizing.
//
//One shared dialog is reused rather than built per popup: only ever one is open, and
//reusing it means the close handling is wired up once.

//How much of the window a popup may fill before its content starts scrolling instead.
var POPUP_MAX_HEIGHT_RATIO = 0.85;

var popupDialog = null;
var popupCloseHandler = null;

function popupElement()
{
    if (popupDialog != null)
        return popupDialog;

    popupDialog = document.createElement("dialog");
    popupDialog.className = "sitePopup";

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "sitePopupClose";
    closeButton.setAttribute("aria-label", "Close");
    //Drawn rather than typed. As the character "x" it sat off centre however it was
    //aligned, because a glyph does not sit in the middle of its own line box and every
    //font disagrees about by how much. Two lines in a square viewBox cannot.
    closeButton.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<path d="M6 6 L18 18 M18 6 L6 18" />' +
        '</svg>';
    closeButton.addEventListener("click", function () { closePopup(); });

    var content = document.createElement("div");
    content.className = "sitePopupContent";
    //showModal() focuses the first focusable thing it finds, which was the close
    //button - so every popup opened with a focus ring drawn round it. Giving the
    //content the autofocus sends it somewhere invisible instead. The button is still
    //reachable by tab, and escape still closes.
    content.tabIndex = -1;
    content.setAttribute("autofocus", "");

    popupDialog.appendChild(closeButton);
    popupDialog.appendChild(content);
    document.body.appendChild(popupDialog);

    //A click on the backdrop reports the dialog itself as the target, because
    //everything visible sits in the child element.
    popupDialog.addEventListener("click", function (event) {
        if (event.target === popupDialog)
            closePopup();
    });

    //Fires for the close button, the escape key and closePopup() alike, so a caller's
    //cleanup only has to be registered in one place.
    popupDialog.addEventListener("close", function () {
        var handler = popupCloseHandler;
        popupCloseHandler = null;

        //Only when nothing has taken its place. close() queues this event rather than
        //firing it, so opening a popup while one is up delivers it after the new
        //content is already on screen - and emptying then would wipe the new popup
        //instead of the old one.
        if (!popupDialog.open)
        {
            //Emptied on the way out so a video stops playing rather than carrying on
            //unseen and unheard behind the game.
            content.innerHTML = "";
        }

        if (handler)
            handler();
    });

    return popupDialog;
}

function closePopup()
{
    if (popupDialog != null && popupDialog.open)
        popupDialog.close();
}

//node may be an element or a string of HTML.
function openPopup(node, variant, onClose)
{
    var dialog = popupElement();
    var content = dialog.querySelector(".sitePopupContent");

    //Replacing a popup that is still up: run the outgoing one's cleanup here and now,
    //because the close event it queues will arrive too late to tell the two apart.
    if (dialog.open)
    {
        var outgoing = popupCloseHandler;
        popupCloseHandler = null;
        dialog.close();

        if (outgoing)
            outgoing();
    }

    popupCloseHandler = onClose || null;
    dialog.className = "sitePopup" + (variant ? " " + variant : "");

    content.innerHTML = "";
    if (typeof node == "string")
        content.innerHTML = node;
    else
        content.appendChild(node);

    dialog.showModal();
    return dialog;
}

//A page from ./pages, in an iframe grown to whatever it actually renders.
//
//Guessing a height cannot work: the real font metrics and scrollbar width are only
//known in the visitor's own browser. So the frame starts at a sensible size and is
//measured once the document inside it has laid out. Content taller than the window
//stops at the cap and scrolls, which is what the work experience page does.
function openPagePopup(href, onClose)
{
    var frame = document.createElement("iframe");
    frame.className = "sitePopupFrame";
    frame.title = "Popup content";
    frame.src = href;

    frame.addEventListener("load", function () {
        var doc;

        try
        {
            doc = frame.contentDocument;
        }
        catch (e)
        {
            return; //cross origin, nothing to measure
        }

        if (!doc || !doc.body)
            return;

        //Collapsed first, because scrollHeight can only report the content or the
        //frame, whichever is taller. Measured at the frame's starting height every
        //short page came back as exactly that height and the popup stayed mostly
        //empty. The width is untouched, so nothing rewraps.
        frame.style.height = "0px";

        var maxHeight = Math.floor(window.innerHeight * POPUP_MAX_HEIGHT_RATIO);
        var needed = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);

        //Two pixels of slack: the moment a scrollbar appears it takes width off the
        //page, which can rewrap text taller still and keep the bar there.
        frame.style.height = Math.min(needed + 2, maxHeight) + "px";

        //Then check the answer. scrollHeight is rounded to whole pixels while the real
        //layout is fractional, so on a display with scaling the content can be a
        //fraction taller than the frame it was just given - enough for a scrollbar on
        //a page that visibly has room to spare. A second pass settles it. Content that
        //is genuinely longer than the window still stops at the cap and scrolls.
        for (var pass = 0; pass < 2; pass++)
        {
            var shortfall = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight) - frame.clientHeight;

            if (shortfall <= 0 || frame.clientHeight >= maxHeight)
                break;

            frame.style.height = Math.min(frame.clientHeight + shortfall + 1, maxHeight) + "px";
        }
    });

    return openPopup(frame, "sitePopupPage", onClose);
}

function openHtmlPopup(html, variant, onClose)
{
    return openPopup(html, variant, onClose);
}

//A video with its write-up underneath. The write-up carries its own background: over
//a video the words used to sit straight on whatever was behind them.
function openVideoPopup(src, titleHtml, onClose)
{
    var wrapper = document.createElement("div");

    var frame = document.createElement("iframe");
    frame.className = "sitePopupVideoFrame";
    frame.title = "Video";
    frame.src = src;
    frame.setAttribute("allow", "autoplay; fullscreen; encrypted-media");
    frame.setAttribute("allowfullscreen", "");

    wrapper.appendChild(frame);

    if (titleHtml)
    {
        var title = document.createElement("div");
        title.innerHTML = titleHtml;
        wrapper.appendChild(title);
    }

    return openPopup(wrapper, "sitePopupVideo", onClose);
}
