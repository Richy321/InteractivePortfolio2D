//Multiplayer presence: draws the other people currently on the site as characters
//walking around the same world.
//
//Everything here is optional. If the relay is unreachable, blocked by a network, or
//simply not configured, every entry point below turns into a no-op and the site
//behaves exactly as it did before any of this existed - so a dead worker can never
//take the portfolio down with it.

var NET_CONFIG = {
    //The relay deployed from ./server. Empty this string to switch multiplayer off
    //entirely - nothing connects and the site runs exactly as it does single player.
    url: "wss://portfolio-multiplayer.portfolio-multiplayer.workers.dev/ws",
    enabled: true
};

//How often the local character's state is put on the wire. The game loop runs at
//25fps; sending every frame would be four times the traffic for movement that is
//interpolated on the other end anyway.
var NET_SEND_INTERVAL_MS = 100;

//A keepalive so a stationary player still counts as present, and so a relay that
//has quietly dropped us shows up as a closed socket.
var NET_KEEPALIVE_MS = 2000;

//Remote characters are drawn this far in the past. It buys one whole send interval
//of jitter tolerance, which is what keeps them gliding instead of stuttering.
var NET_INTERPOLATION_DELAY_MS = 150;

//Further than this between two snapshots is not a walk, it is a teleport or a
//scene change, so the character is moved rather than slid.
var NET_SNAP_DISTANCE = 120;

var NET_MAX_RECONNECT_DELAY_MS = 30000;

//Room is full. The server closes with this and there is no point retrying.
var NET_CLOSE_ROOM_FULL = 4001;

var net; //assigned in init()

//--sprite tinting--

var netCharacterSheet = null;
var netTintCache = {};

function netGetCharacterSheet()
{
    if (netCharacterSheet == null)
    {
        netCharacterSheet = new Image();
        netCharacterSheet.src = CHARACTER_SPRITE_SRC;
    }

    return netCharacterSheet;
}

//A hue-rotated copy of the character sheet, built once per colour. Returns null
//until the sheet has actually loaded, and the caller simply skips a frame.
function netTintedSpriteFor(hue)
{
    var sheet = netGetCharacterSheet();

    if (!sheet.complete || sheet.naturalWidth == 0)
        return null;

    var key = String(hue);
    if (netTintCache.hasOwnProperty(key))
        return netTintCache[key];

    var offscreen = document.createElement("canvas");
    offscreen.width = sheet.naturalWidth;
    offscreen.height = sheet.naturalHeight;

    var offscreenCtx = offscreen.getContext("2d");

    //Older browsers have no ctx.filter. They get the untinted sheet, which means
    //everyone looks the same but nothing breaks - the name labels still tell them
    //apart.
    if (typeof offscreenCtx.filter == "string")
        offscreenCtx.filter = "hue-rotate(" + hue + "deg) saturate(1.4)";

    offscreenCtx.drawImage(sheet, 0, 0);

    netTintCache[key] = offscreen;
    return offscreen;
}

//--remote characters--

//Deliberately not a Player. A remote character has no pathfinding, no collision, no
//triggers and no say over the camera: its position is told to it, and all it has to
//do is get from the last position it was told to the next one without looking jerky.
function RemotePlayer(id, name, hue)
{
    this.id = id;
    this.name = name;
    this.hue = hue;

    this.frameWidth = CHARACTER_FRAME_WIDTH;
    this.frameHeight = CHARACTER_FRAME_HEIGHT;
    this.frameCount = CHARACTER_FRAME_COUNT;
    this.spriteScale = CHARACTER_SPRITE_SCALE;

    var frames = createCharacterFrames();
    this.upFrames = frames.up;
    this.rightFrames = frames.right;
    this.downFrames = frames.down;
    this.leftFrames = frames.left;

    this.curDirection = "Down";
    this.curFrameNo = 0;
    this.frameDelay = 0.20; //matches the local player's walk cadence
    this.frameDuration = this.frameDelay;

    this.moving = false;
    this.loc = LocationEnum.TOWN;

    this.snapshots = [];
    this.renderX = 0;
    this.renderY = 0;
    this.hasPosition = false;
}

RemotePlayer.prototype.framesForDirection = function framesForDirection()
{
    if (this.curDirection == "Up")
        return this.upFrames;
    if (this.curDirection == "Left")
        return this.leftFrames;
    if (this.curDirection == "Right")
        return this.rightFrames;

    return this.downFrames;
}

RemotePlayer.prototype.applySnapshot = function applySnapshot(snapshot)
{
    var previous = this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
    var jumped = false;

    if (previous != null)
    {
        var deltaX = snapshot.x - previous.x;
        var deltaY = snapshot.y - previous.y;
        jumped = (previous.loc != snapshot.loc) ||
                 (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > NET_SNAP_DISTANCE);
    }

    snapshot.time = (new Date()).getTime();

    if (jumped || !this.hasPosition)
    {
        //Nothing to interpolate from, or nothing worth interpolating through.
        this.snapshots = [snapshot];
        this.renderX = snapshot.x;
        this.renderY = snapshot.y;
        this.hasPosition = true;
    }
    else
    {
        this.snapshots.push(snapshot);

        //The buffer only ever needs the pair either side of the render time.
        while (this.snapshots.length > 8)
            this.snapshots.shift();
    }

    this.loc = snapshot.loc;
    this.moving = snapshot.moving;

    if (snapshot.dir != "None")
        this.curDirection = snapshot.dir;
}

RemotePlayer.prototype.update = function update(deltaTime)
{
    if (!this.hasPosition)
        return;

    var renderTime = (new Date()).getTime() - NET_INTERPOLATION_DELAY_MS;

    //Drop everything that is now older than the pair bracketing the render time.
    while (this.snapshots.length > 2 && this.snapshots[1].time <= renderTime)
        this.snapshots.shift();

    if (this.snapshots.length == 1)
    {
        this.renderX = this.snapshots[0].x;
        this.renderY = this.snapshots[0].y;
    }
    else
    {
        var from = this.snapshots[0];
        var to = this.snapshots[1];
        var span = to.time - from.time;

        //Clamped rather than extrapolated: guessing past the last snapshot makes a
        //character overshoot and snap back every time an update is late.
        var t = span > 0 ? (renderTime - from.time) / span : 1;
        t = Math.min(1, Math.max(0, t));

        this.renderX = from.x + (to.x - from.x) * t;
        this.renderY = from.y + (to.y - from.y) * t;
    }

    //Animated locally off the moving flag rather than from a frame number on the
    //wire, so the walk cycle stays smooth between updates.
    if (this.moving)
    {
        this.frameDuration -= deltaTime;
        if (this.frameDuration <= 0)
        {
            this.curFrameNo = (this.curFrameNo + 1) % this.frameCount;
            this.frameDuration = this.frameDelay;
        }
    }
    else
    {
        this.curFrameNo = 0;
    }
}

RemotePlayer.prototype.draw = function draw()
{
    if (!this.hasPosition)
        return;

    var sprite = netTintedSpriteFor(this.hue);
    if (sprite == null)
        return;

    var frame = this.framesForDirection()[this.curFrameNo];
    var width = this.frameWidth * this.spriteScale;
    var height = this.frameHeight * this.spriteScale;

    //Whole pixels, for the same reason the local player is drawn on them: an
    //interpolated position is fractional, and a fractional destination resamples
    //the sprite and blurs it.
    var x = Math.round(this.renderX);
    var y = Math.round(this.renderY);

    ctx.drawImage(sprite, frame.spriteXOffset, frame.spriteYOffset, this.frameWidth, this.frameHeight,
        x, y, width, height);

    this.drawLabel(x + width / 2, y - 4);
}

RemotePlayer.prototype.drawLabel = function drawLabel(centreX, baselineY)
{
    var originalFill = ctx.fillStyle;
    var originalStroke = ctx.strokeStyle;
    var originalLineWidth = ctx.lineWidth;
    var originalFont = ctx.font;
    var originalAlign = ctx.textAlign;

    ctx.font = "11px Arial, sans-serif";
    ctx.textAlign = "center";

    //Outlined, so the name stays readable over paving, grass and interior floors
    //alike without needing a background plate.
    ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
    ctx.lineWidth = 3;
    ctx.strokeText(this.name, centreX, baselineY);

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.fillText(this.name, centreX, baselineY);

    ctx.fillStyle = originalFill;
    ctx.strokeStyle = originalStroke;
    ctx.lineWidth = originalLineWidth;
    ctx.font = originalFont;
    ctx.textAlign = originalAlign;
}

//--connection--

function NetClient()
{
    this.socket = null;
    this.peers = {};
    this.selfId = null;

    this.reconnectDelay = 1000;
    this.reconnectTimer = null;
    this.stopped = false;

    this.lastSendTime = 0;
    this.lastSentX = null;
    this.lastSentY = null;
    this.lastSentDirection = null;
    this.lastSentLocation = null;
    this.lastSentMoving = false;
}

NetClient.prototype.resolveUrl = function resolveUrl()
{
    //A ?mp= override makes local testing against `wrangler dev` a URL change rather
    //than a code change. Honoured only when the page is being served locally, so a
    //crafted link cannot repoint the published site.
    try
    {
        var host = window.location.hostname;
        var isLocal = (host == "localhost" || host == "127.0.0.1" || host == "");

        if (isLocal)
        {
            var match = window.location.search.match(/[?&]mp=([^&]+)/);
            if (match)
                return decodeURIComponent(match[1]);
        }
    }
    catch (err)
    {
        //Fall through to the configured URL.
    }

    return NET_CONFIG.url;
}

NetClient.prototype.connect = function connect()
{
    if (this.stopped || !NET_CONFIG.enabled)
        return;

    if (typeof WebSocket == "undefined")
        return;

    var url = this.resolveUrl();
    if (!url)
        return; //not configured - single player, exactly as before

    var self = this;

    try
    {
        this.socket = new WebSocket(url);
    }
    catch (err)
    {
        this.scheduleReconnect();
        return;
    }

    this.socket.onopen = function ()
    {
        self.reconnectDelay = 1000;
        self.sendState(true);
    };

    this.socket.onmessage = function (event)
    {
        try
        {
            self.handleMessage(JSON.parse(event.data));
        }
        catch (err)
        {
            //A message we cannot read is not worth dropping the connection over.
        }
    };

    this.socket.onclose = function (event)
    {
        self.socket = null;
        self.peers = {};
        self.selfId = null;

        if (event && event.code == NET_CLOSE_ROOM_FULL)
        {
            self.stopped = true; //room is full; retrying would only spin
            return;
        }

        self.scheduleReconnect();
    };

    this.socket.onerror = function ()
    {
        //onclose always follows, and that is where reconnection is handled.
    };
}

NetClient.prototype.scheduleReconnect = function scheduleReconnect()
{
    if (this.stopped || this.reconnectTimer != null)
        return;

    var self = this;
    var delay = this.reconnectDelay;

    this.reconnectTimer = setTimeout(function ()
    {
        self.reconnectTimer = null;
        self.connect();
    }, delay);

    //Backed off, so a relay that is down does not turn into a connection attempt
    //every second for as long as the tab stays open.
    this.reconnectDelay = Math.min(delay * 2, NET_MAX_RECONNECT_DELAY_MS);
}

NetClient.prototype.handleMessage = function handleMessage(message)
{
    if (message == null)
        return;

    switch (message.t)
    {
        case "welcome":
            this.selfId = message.id;
            this.peers = {};

            if (message.peers)
            {
                for (var i = 0; i < message.peers.length; i++)
                {
                    var peer = message.peers[i];
                    var remote = this.addPeer(peer.id, peer.name, peer.hue);
                    remote.applySnapshot({ x: peer.x, y: peer.y, dir: peer.dir, moving: peer.moving, loc: peer.loc });
                }
            }
            break;

        case "join":
            this.addPeer(message.id, message.name, message.hue);
            break;

        case "state":
            //A snapshot can arrive before the join that introduces the peer if the
            //two cross on the wire, so the peer is created on demand.
            var target = this.peers[message.id];
            if (target == null)
                target = this.addPeer(message.id, "Visitor", 0);

            target.applySnapshot({ x: message.x, y: message.y, dir: message.dir, moving: message.moving, loc: message.loc });
            break;

        case "leave":
            delete this.peers[message.id];
            break;
    }
}

NetClient.prototype.addPeer = function addPeer(id, name, hue)
{
    if (this.peers[id] == null)
        this.peers[id] = new RemotePlayer(id, name, hue);
    else
    {
        this.peers[id].name = name;
        this.peers[id].hue = hue;
    }

    return this.peers[id];
}

NetClient.prototype.isOpen = function isOpen()
{
    return this.socket != null && this.socket.readyState == 1;
}

NetClient.prototype.sendState = function sendState(force)
{
    if (!this.isOpen() || typeof player == "undefined" || player == null)
        return;

    var now = (new Date()).getTime();

    if (!force && (now - this.lastSendTime) < NET_SEND_INTERVAL_MS)
        return;

    var x = player.positionX;
    var y = player.positionY;

    var moved = (this.lastSentX == null) ||
                (Math.abs(x - this.lastSentX) > 0.1) ||
                (Math.abs(y - this.lastSentY) > 0.1);

    //Coming to a halt counts as a change even though the position has not moved.
    //Without it the last thing the others heard was "walking", and they would keep
    //the walk cycle running on the spot until the next keepalive.
    var changed = moved ||
                  (this.lastSentMoving != moved) ||
                  (this.lastSentDirection != player.curDirection) ||
                  (this.lastSentLocation != locationState);

    //Standing still costs one keepalive every couple of seconds rather than a
    //message every tick.
    if (!force && !changed && (now - this.lastSendTime) < NET_KEEPALIVE_MS)
        return;

    try
    {
        this.socket.send(JSON.stringify({
            t: "state",
            x: x,
            y: y,
            dir: player.curDirection,
            moving: moved,
            loc: locationState
        }));
    }
    catch (err)
    {
        return; //onclose will pick this up
    }

    this.lastSendTime = now;
    this.lastSentX = x;
    this.lastSentY = y;
    this.lastSentDirection = player.curDirection;
    this.lastSentLocation = locationState;
    this.lastSentMoving = moved;
}

NetClient.prototype.update = function update(deltaTime)
{
    for (var id in this.peers)
    {
        if (this.peers.hasOwnProperty(id))
            this.peers[id].update(deltaTime);
    }

    this.sendState(false);
}

//Called from inside the camera transform in draw(), so peers are positioned in the
//same world space as everything else. Only the ones in the same building are drawn -
//the interiors sit at their own world offsets, and a peer in the library has no
//meaningful place in the town.
NetClient.prototype.draw = function draw()
{
    for (var id in this.peers)
    {
        if (!this.peers.hasOwnProperty(id))
            continue;

        var peer = this.peers[id];
        if (peer.loc == locationState)
            peer.draw();
    }
}
