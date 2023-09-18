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

Game.colors = { black: "rgb(0,0,0)", white: "rgb(255,255,255)", transparent: "rgba(0,0,0,0)" }
Game.colors.getColor = function (type) {
    switch (type) {
        case 0: return Game.colors.white;
        case 1: return Game.colors.black;
        case 2: return Game.colors.transparent;
        default: return Game.colors.transparent;
    }
}

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
        button.style.margin = "0px 2px";
        button.innerText = name;

        toolbar.appendChild(button);

        AddEvent(Find(button.id), "click", callback);
    }

    addSeparator(toolbar) {
        let separator = document.createElement("span");
        separator.style.display = "inline-block";
        separator.style.width = "1px";
        separator.style.height = "100%";
        separator.style.margin = "0px 2px";
        separator.style.backgroundColor = "#fff";
        toolbar.appendChild(separator);
    }
}

Game.tools = {}
Game.tools.collection = [];
Game.tools.byId = {}
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
        Game.tools.byId[tool.identifier] = tool;
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
        this.canvas = Find("paint-tool");
        this.canvasContext = this.canvas.getContext("2d", { alpha: false });
        this.toolbar = Find("paint-tool-toolbar");
        this.modeDisplay = Find("paint-tool-mode");
        this.selectedTool = "paint";
        this.selectedColor = 0;
        this.imageData = [];
        this.size = new Vector2(0, 0);
        this.changeSize(20, 20, 0);
    }

    init() {
        AddEvent(Find("close-paint-tool"), "click", function () { Find("paint-tool-container").style.visibility = "collapse"; });

        this.addButton(this.toolbar, "white", "Color: White", this.setColorWhite);
        this.addButton(this.toolbar, "black", "Color: Black", this.setColorBlack);
        this.addSeparator(this.toolbar);
        this.addButton(this.toolbar, "paint", "Paint", this.setToolPaint);
        this.addButton(this.toolbar, "fill", "Fill", this.setToolFill);
        this.addButton(this.toolbar, "erase", "Erase", this.setToolErase);
        this.addSeparator(this.toolbar);
        this.addButton(this.toolbar, "change-size", "Change Size", this.showChangeSize);
        this.addButton(this.toolbar, "repaint", "Repaint", this.repaint);

        AddEvent(this.canvas, "mousedown", this.canvasMouseDown);
        AddEvent(this.canvas, "mousemove", this.canvasMouseMove);
        AddEvent(this.canvas, "mouseup", this.canvasMouseUp);

        this.refreshMode();
    }

    setColorWhite() {
        let me = Game.tools.byId["paint-tool"];
        me.selectedColor = 0;
        me.refreshMode();
    }

    setColorBlack() {
        let me = Game.tools.byId["paint-tool"];
        me.selectedColor = 1;
        me.refreshMode();
    }

    setToolPaint() {
        let me = Game.tools.byId["paint-tool"];
        me.selectedTool = "paint";
        me.refreshMode();
    }

    setToolFill() {
        let me = Game.tools.byId["paint-tool"];
        me.selectedTool = "fill";
        me.refreshMode();
    }

    setToolErase() {
        let me = Game.tools.byId["paint-tool"];
        me.selectedTool = "erase";
        me.refreshMode();
    }

    showChangeSize() {
        let me = Game.tools.byId["paint-tool"];

    }

    changeSize(x, y, direction) {
        let me = Game.tools.byId["paint-tool"];
        me.size.x = x;
        me.size.y = y;

        me.canvas.width = x * 20;
        me.canvas.height = y * 20;
        me.imageData = [];
        for (let i = 0; i < x * y; i++) {
            me.imageData.push(2);
        }
        me.repaint();
    }

    canvasMouseDown(event) {
        let me = Game.tools.byId["paint-tool"];
        me.isMouseDown = true;
        me.canvasInput(event.pageX, event.pageY);
    }

    canvasMouseMove(event) {
        let me = Game.tools.byId["paint-tool"];
        if (me.isMouseDown)
            me.canvasInput(event.pageX, event.pageY);
    }

    canvasMouseUp(event) {
        let me = Game.tools.byId["paint-tool"];
        me.isMouseDown = false;
    }

    canvasInput(inX, inY) {
        let me = Game.tools.byId["paint-tool"];
        const rawX = inX - me.canvas.offsetLeft + me.canvas.clientLeft;
        const rawY = inY - me.canvas.offsetTop + me.canvas.clientTop;

        const x = Math.floor(rawX / 20);
        const y = Math.floor(rawY / 20);

        let selectedColor = me.selectedColor;
        if (me.selectedTool === "erase")
            selectedColor = 3;

        let previousColor = me.imageData[x + y * me.size.x];
        if (previousColor !== selectedColor) {
            me.imageData[x + y * me.size.x] = selectedColor;
            if (me.selectedTool === "fill") {
                // TODO: Do a flood fill here for each adjacent pixel that is in 'previousColor' and set it to 'selectedColor'
            }
            me.repaint();
        }
    }

    repaint() {
        let me = Game.tools.byId["paint-tool"];

        for (let i = 0; i < me.size.x * 2 * me.size.y * 2; i++) {
            let x = i % (me.size.x * 2);
            let y = Math.floor(i / (me.size.x * 2));
            let a = Math.abs((i % 2) - (y % 2)) == 0;
            me.canvasContext.fillStyle = a ? "rgb(245,245,245)" : "rgb(200,200,200)";
            me.canvasContext.fillRect(x * 10, y * 10, 10, 10);
        }
        let pixelIndex = 0;
        me.imageData.forEach(pixel => {
            let x = pixelIndex % me.size.x;
            let y = Math.floor(pixelIndex / me.size.x);
            pixelIndex++;

            me.canvasContext.fillStyle = Game.colors.getColor(pixel);
            me.canvasContext.fillRect(x * 20, y * 20, 20, 20);
        });
    }

    refreshMode() {
        let me = Game.tools.byId["paint-tool"];
        let display = "";
        let colorBlock = '<span style="display: inline-block; width: 15px; height: 15px; border: solid #888 1px; background-color: ' + Game.colors.getColor(me.selectedColor) + '"></span>'
        if (me.selectedTool === "erase")
            display = "Erase";
        else if (me.selectedTool === "paint")
            display = 'Paint ' + colorBlock;
        else if (me.selectedTool === "fill")
            display = 'Fill ' + colorBlock;
        me.modeDisplay.innerHTML = display;
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