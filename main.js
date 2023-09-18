function AddEvent(element, event, callback) {
    if (element.attachEvent) {
        var callback2 = function () { callback.call(element); }
        element.attachEvent('on' + event, callback2); return [element, event, callback2];
    }
    else if (element.addEventListener) {
        element.addEventListener(event, callback, false); return [element, event, callback];
    }
    return false;
}

function RemoveEvent(eventObject) {
    if (!eventObject) return false;
    if (eventObject[0].detachEvent) eventObject[0].detachEvent('on' + eventObject[1], eventObject[2]);
    else if (eventObject[0].removeEventListener) eventObject[0].removeEventListener(eventObject[1], eventObject[2], false);
    return true;
}

function FireEvent(element, event) {
    if (element.fireEvent)
        element.fireEvent('on' + event);
    else {
        var eventObject = new CustomEvent(event,
            {
                bubbles: true,
                cancelable: false
            });
        element.dispatchEvent(eventObject);
    }
}

function Find(id) {
    return document.getElementById(id);
}

var Game = {}

///////////////////////////////////////////////////////////////////////////////////////
/// Data

Game.colors = { black: "rgb(0,0,0)", white: "rgb(255,255,255)" }

Game.sprites = {
    test: [20, 20, 0, 5, 10, 8, 2, 10, 2, 5, 1, 14, 1, 3, 1, 16, 1, 2, 1, 16, 1, 1, 1, 6, 1, 4, 1, 6, 2, 6, 1, 4, 1, 6, 2, 6, 1, 4, 1, 6, 2, 18, 2, 18, 2, 18, 2, 4, 1, 8, 1, 4, 2, 5, 1, 6, 1, 5, 2, 6, 6, 6, 2, 18, 1, 1, 1, 16, 1, 2, 1, 16, 1, 3, 1, 14, 1, 5, 2, 10, 2, 8, 10, 5],
    test2: [20, 20, 1, 5, 10, 8, 2, 10, 2, 5, 1, 14, 1, 3, 1, 16, 1, 2, 1, 16, 1, 1, 1, 6, 1, 4, 1, 6, 2, 6, 1, 4, 1, 6, 2, 6, 1, 4, 1, 6, 2, 18, 2, 18, 2, 18, 2, 4, 1, 8, 1, 4, 2, 5, 1, 6, 1, 5, 2, 6, 6, 6, 2, 18, 1, 1, 1, 16, 1, 2, 1, 16, 1, 3, 1, 14, 1, 5, 2, 10, 2, 8, 10, 5],
};

Game.animations = {
    test: {
        duration: 30,
        frames: {
            0: "test",
            12: "test2",
            24: "test",
            27: "test2"
        }
    }
};

Vector2 = function (x, y) {
    this.x = x;
    this.y = y;

    this.add = function (other) {
        this.x += other.x;
        this.y += other.y;
    }
}

Rect = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

Sprite = function (data, position) {
    this.location = new Rect(position.x, position.y, data[0], data[1]);
    this.data = data;
}

///////////////////////////////////////////////////////////////////////////////////////
/// Input

Game.pressedKeys = new Set();

Game.keyDown = function (event) {
    Game.pressedKeys.add(event.code);
}

Game.keyUp = function (event) {
    Game.pressedKeys.delete(event.code);
}

Game.processInput = function () {
    Game.pressedKeys.forEach(key => {
        console.log(key);
    });
}

///////////////////////////////////////////////////////////////////////////////////////
/// Gameplay

Game.init = function () {
    Game.fps = 30;
    Game.ticks = 0;
}

Game.loop = function () {
    Game.processInput();
    Game.animate();
    Game.ticks++;

    Game.spriteBatch.add("test", new Vector2(2, 0));

    setTimeout(Game.loop, 1000 / Game.fps);
}

///////////////////////////////////////////////////////////////////////////////////////
/// Rendering

Game.screenSize = new Vector2(32, 16);

Game.currentSprite = {
    wasDrawn: false,
    name: "",
    data: [],
    location: new Rect(0, 0, 0, 0)
}

Game.spriteBatch = {
    data: []
}

Game.spriteBatch.add = function (name, position) {
    if (Game.sprites[name]) {
        this.data.push(new Sprite(Game.sprites[name], position));
    }
}

Game.spriteBatch.clear = function () {
    this.data = [];
}

Game.currentAnimation = {
    name: "",
    data: {},
    currentFrame: 0,
    isRunning: false,
    isSet: false,
    position: new Vector2(0, 0)
}

Game.clearFrame = function () {
    Game.canvasContext.fillStyle = Game.colors.white;
    Game.canvasContext.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
}

Game.setSprite = function (name, position = new Vector2(0, 0)) {
    if (Game.sprites[name] && Game.currentSprite.name !== name) {
        Game.currentSprite.name = name;
        Game.currentSprite.data = Game.sprites[name];
        Game.currentSprite.wasDrawn = false;
        Game.currentSprite.location = new Rect(position.x, position.y, Game.currentSprite.data[0], Game.currentSprite.data[1]);
    }
}

Game.startAnimation = function (name, position = new Vector2(0, 0)) {
    if (Game.animations[name] && (Game.currentAnimation.name !== name || !Game.currentAnimation.isSet)) {
        Game.currentAnimation.name = name;
        Game.currentAnimation.data = Game.animations[name];
        Game.currentAnimation.currentFrame = 0;
        Game.currentAnimation.isRunning = true;
        Game.currentAnimation.isSet = true;
        Game.currentAnimation.position = position;
        Game.setSprite(Game.currentAnimation.data[0], position);
    }
}

Game.stopAnimation = function () {
    Game.currentAnimation.isRunning = false;
    Game.currentAnimation.isSet = false;
}

Game.animate = function () {
    if (Game.currentAnimation.isSet && Game.currentAnimation.isRunning) {
        Game.currentAnimation.currentFrame++;
        if (Game.currentAnimation.data.duration === Game.currentAnimation.currentFrame)
            Game.currentAnimation.currentFrame = 0;

        if (Game.currentAnimation.data.frames[Game.currentAnimation.currentFrame])
            Game.setSprite(Game.currentAnimation.data.frames[Game.currentAnimation.currentFrame], Game.currentAnimation.position);
    }
}

Game.draw = function () {
    let screenSize = new Vector2(Game.canvas.width, Game.canvas.height);
    let context = Game.canvasContext;

    let frameSize = Game.screenSize;
    let pixelSize = new Vector2(screenSize.x / frameSize.x, screenSize.y / frameSize.y);

    Game.clearFrame();

    Game.spriteBatch.data.forEach(element => {
        if (element.data.length > 2) {
            let isBlack = !!element.data[2];
            let spriteSize = element.location;
            let pixelIndex = 0;
            for (let i = 3; i < element.data.length; i++) {
                context.fillStyle = isBlack ? Game.colors.black : Game.colors.white;
                for (let j = 0; j < element.data[i]; j++) {
                    let x = pixelIndex % spriteSize.w;
                    let y = Math.floor(pixelIndex / spriteSize.w);
                    context.fillRect((x + spriteSize.x) * pixelSize.x, (y + spriteSize.y) * pixelSize.y, pixelSize.x, pixelSize.y);
                    pixelIndex++;
                }
                isBlack = !isBlack;
            }
        }
    });

    Game.spriteBatch.clear();
    setTimeout(Game.draw, 1000 / Game.fps);
}

///////////////////////////////////////////////////////////////////////////////////////
/// Debugging

Game.debugMode = false;
Game.debugConsole = null;

Game.showDebugConsole = function () {
    if (!Game.debugConsole) {
        let debugConsole = document.createElement("div");
        debugConsole.id = "debugconsole";
        debugConsole.style.position = "absolute";
        debugConsole.style.top = 0;
        debugConsole.style.border = "1px solid black";
        debugConsole.style.margin = "10px";
        debugConsole.style.padding = "30px 10px 10px 10px";
        debugConsole.style.background = "#ffae0080";
        Game.debugConsole = debugConsole;

        {
            let heading = document.createElement("div");
            heading.innerText = "Debugging";
            heading.style.position = "absolute";
            heading.style.top = "2px";
            heading.style.left = "2px";
            heading.style.fontSize = 14;
            heading.style.fontFamily = "sans-serif";
            debugConsole.appendChild(heading);

            let closeButton = document.createElement("button");
            closeButton.innerText = "X";
            closeButton.style.position = "absolute";
            closeButton.style.right = 0;
            closeButton.style.top = 0;
            AddEvent(closeButton, "click", Game.hideDebugConsole);
            debugConsole.appendChild(closeButton);
        }

        debugConsole.addContainer = function () {
            let container = document.createElement("div");
            debugConsole.appendChild(container);
            debugConsole.lastContainer = container;
        }

        // Add default container
        debugConsole.addContainer();

        debugConsole.addSpace = function (amount) {
            debugConsole.lastContainer.style.marginBottom = amount + "px";
            debugConsole.addContainer();
        }

        debugConsole.addButton = function (text, callback, inline) {
            let button = document.createElement("button");
            button.innerText = text;
            button.style.margin = "4px 2px";
            AddEvent(button, "click", callback);
            if (!inline) {
                debugConsole.addContainer();
            }
            debugConsole.lastContainer.appendChild(button);
        }

        debugConsole.addHeading = function (text) {
            let heading = document.createElement("div");
            heading.innerText = text;
            heading.style.fontSize = 16;
            heading.style.fontWeight = "bold";
            heading.style.fontFamily = "sans-serif";
            debugConsole.lastContainer.appendChild(heading);
        }

        debugConsole.addHeading("Frame Test");
        debugConsole.addButton("white", function () { Game.setSprite("test"); }, false);
        debugConsole.addButton("black", function () { Game.setSprite("test2"); }, true);
        debugConsole.addSpace(10);
        debugConsole.addHeading("Animation Test");
        debugConsole.addButton("start", function () { Game.startAnimation("test"); }, false);
        debugConsole.addButton("stop", function () { Game.stopAnimation(); }, true);

        Game.debugMode = true;

        Game.body.appendChild(debugConsole);
    }
}

Game.hideDebugConsole = function () {
    if (Game.debugConsole) {
        Game.debugConsole.remove();
        Game.debugMode = false;
        Game.debugConsole = null;
    }
}

class Tool {

    constructor(name, identifier) {
        this.name = name;
        this.identifier = identifier;

        Game.tools.add(this);
    }

    init() { }

    addButton(toolbar, id, name, callback) {
        let button = document.createElement("button");
        button.id = this.identifier + "-button-" + id;
        button.innerText = name;

        toolbar.appendChild(button);

        AddEvent(Find(button.id), "click", callback);
    }
}

Game.tools = {}
Game.tools.collection = [];
Game.tools.initialized = false;
Game.tools.add = function (tool) {
    if (Game.toolbar) {
        let button = document.createElement("button");
        button.id = "open-" + tool.identifier;
        button.innerText = "Open " + tool.name;
        button.style.display = "block";
        Game.toolbar.appendChild(button);

        AddEvent(Find(button.id), "click", function () { Find(tool.identifier + "-container").style.visibility = "visible"; });
        Game.tools.collection.push(tool);
        if (this.initialized)
            tool.init();
    }
}

Game.tools.init = function () {
    if (this.initialized)
        return;

    Game.tools.collection.forEach(tool => {
        tool.init();
    });

    this.initialized = true;
}

///////////////////////////////////////////////////////////////////////////////////////
/// Paint Tool

class PaintTool extends Tool {
    constructor() {
        super("Paint Tool", "paint-tool");
        this.toolbar = Find("paint-tool-toolbar");
    }

    init() {
        AddEvent(Find("close-paint-tool"), "click", function () { Find("paint-tool-container").style.visibility = "collapse"; });

        this.addButton(this.toolbar, "alert", "alert", function () { alert("platypus!") })
    }
}

///////////////////////////////////////////////////////////////////////////////////////
/// Core

Game.run = function (params) {
    Game.body = document.body;
    Game.canvas = Find("screen");
    let toolbar = Find("toolbar");
    if (toolbar) {
        if (params.has("withtools")) {
            Game.toolbar = toolbar;
            new PaintTool();
        }
        else {
            toolbar.remove()
        }
    }

    if (!Game.canvas.getContext) {
        console.error("Canvas is not supported!");
        return;
    }
    Game.canvasContext = Game.canvas.getContext("2d", { alpha: false });

    Game.isVisible = true;
    AddEvent(document, 'visibilitychange', function (e) { Game.isVisible = (document.visibilityState === 'hidden'); });
    AddEvent(document, "keydown", Game.keyDown);
    AddEvent(document, "keyup", Game.keyUp);

    Game.tools.init();
    Game.init();
    Game.loop();
    Game.draw();
}

// Launcher
window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    Game.run(params);
}