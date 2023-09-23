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
        this.buttonGroups = {}

        Game.tools.add(this);
    }

    init() { }

    addButton(toolbar, id, content, callback, group = null) {
        let button = document.createElement("button");
        button.id = this.identifier + "-button-" + id;
        button.innerHTML = content;

        toolbar.appendChild(button);

        if (group !== null) {
            if (this.buttonGroups[group] === undefined)
                this.buttonGroups[group] = { ids: [], buttonsByIds: {} };
            this.buttonGroups[group].ids.push(id);
            this.buttonGroups[group].buttonsByIds[id] = button;
        }

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

    highlightGroupButton(group, id) {
        if (this.buttonGroups[group] !== undefined) {
            let buttonsByIds = this.buttonGroups[group].buttonsByIds;
            this.buttonGroups[group].ids.forEach(buttonId => {
                let button = buttonsByIds[buttonId];
                if (buttonId === id)
                    button.classList.add("selected");
                else
                    button.classList.remove("selected");
            });
        }
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
        this.brush = {
            tool: "paint",
            color: 0,
            size: 1
        }
        this.imageData = [];
        this.size = new Vector2(0, 0);
        this.changeSize(20, 20, 0);
    }

    init() {
        AddEvent(Find("close-paint-tool"), "click", function () { Find("paint-tool-container").style.visibility = "collapse"; });

        function setBrushData(id, value) {
            let me = Game.tools.byId["paint-tool"];
            me.brush[id] = value;
            me.refreshMode();
        }

        this.addButton(this.toolbar, "white", '<svg width="20" height="20"><rect height="16" width="16" x="2" y="2" fill="#fff" stroke="#888"></rect></svg>', () => setBrushData("color", 0), "color");
        this.addButton(this.toolbar, "black", '<svg width="20" height="20"><rect height="16" width="16" x="2" y="2" fill="#000" stroke="#888"></rect></svg>', () => setBrushData("color", 1), "color");
        this.addSeparator(this.toolbar);
        this.addButton(this.toolbar, "paint", '<svg width="20" height="20"><rect id="svg_21" height="2.68748" width="3.06248" y="14.96872" x="14.12497" stroke="#000" fill="#000000"/><rect transform="rotate(-41.2257, 10.1057, 9.9232)" id="svg_19" height="15.93494" width="4.43747" y="1.95573" x="7.88692" stroke="#000" fill="#ffffff"/><rect rx="1" transform="rotate(-41.2257, 4.36706, 3.37399)" id="svg_22" height="2.05906" width="4.43747" y="2.34446" x="2.14833" stroke="#000" fill="#000000"/></svg>', () => setBrushData("tool", "paint"), "tool");
        this.addButton(this.toolbar, "fill", '<svg width="20" height="20"><ellipse transform="rotate(14.1157, 14.7187, 8.87501)" ry="1.34374" rx="3.09373" id="svg_6" cy="8.87501" cx="14.71872" stroke="#000" fill="#000000"/><rect transform="rotate(42.8183, 9.03079, 11.9955)" id="svg_1" height="11.06243" width="8.53023" y="6.46431" x="4.76568" stroke="#000" fill="#fff"/><line id="svg_3" y2="9.34376" x2="10.0625" y1="3.46879" x1="5.56253" stroke="#000" fill="none"/><ellipse ry="1.90624" rx="0.96874" id="svg_7" cy="10.93749" cx="17.15621" stroke="#000" fill="#000000"/><ellipse ry="2.71873" rx="0.75" id="svg_8" cy="12.68748" cx="17.43745" stroke="#000" fill="#000000"/></svg>', () => setBrushData("tool", "fill"), "tool");
        this.addButton(this.toolbar, "erase", '<svg width="20" height="20"><rect rx="1" transform="rotate(42.8183, 10.1665, 9.79617)" id="svg_1" height="8.01821" width="15.99863" y="5.78707" x="2.16717" stroke="#000" fill="#fff"/><rect rx="1" transform="rotate(42.8183, 13.1373, 12.4864)" id="svg_9" height="8.01821" width="7.4266" y="8.47729" x="9.42397" stroke="#000" fill="#000000"/><line id="svg_10" y2="17.9062" x2="10.93749" y1="17.9062" x1="4.81253" stroke="#000" fill="none"/></svg>', () => setBrushData("tool", "erase"), "tool");
        this.addSeparator(this.toolbar);
        this.addButton(this.toolbar, "brushsize-1", '<svg width="20" height="20"><rect height="2" width="2" x="9" y="9" fill="#000"></svg>', () => setBrushData("size", 1), "brushsize");
        this.addButton(this.toolbar, "brushsize-2", '<svg width="20" height="20"><rect height="6" width="6" x="7" y="7" fill="#000"></svg>', () => setBrushData("size", 2), "brushsize");
        this.addButton(this.toolbar, "brushsize-3", '<svg width="20" height="20"><rect height="10" width="10" x="5" y="5" fill="#000"></svg>', () => setBrushData("size", 3), "brushsize");
        this.addButton(this.toolbar, "brushsize-4", '<svg width="20" height="20"><rect height="14" width="14" x="3" y="3" fill="#000"></svg>', () => setBrushData("size", 4), "brushsize");
        this.addSeparator(this.toolbar);
        this.addButton(this.toolbar, "change-size", "Change Size", this.showChangeSize);
        this.addButton(this.toolbar, "repaint", "Repaint", this.repaint);

        AddEvent(this.canvas, "mousedown", this.canvasMouseDown);
        AddEvent(this.canvas, "mousemove", this.canvasMouseMove);
        AddEvent(this.canvas, "mouseup", this.canvasMouseUp);

        this.refreshMode();
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

        const brush = me.brush;

        let selectedColor = me.brush.color;
        if (me.brush.tool === "erase")
            selectedColor = 3;

        let previousColor = me.imageData[x + y * me.size.x];
        if (me.brush.tool === "fill" && previousColor !== selectedColor) {
            me.floodFill(selectedColor, previousColor, new Vector2(x, y));
        }
        else {
            const offset = 1 - (brush.size % 2);
            const extentA = Math.floor(brush.size / 2) - offset;
            const extentB = Math.ceil(brush.size / 2) + offset;
            let brushSize = {
                left: Math.max(0, x - extentA),
                top: Math.max(0, y - extentA),
                right: Math.min(me.size.x, x + extentB),
                bottom: Math.min(me.size.y, y + extentB)
            };
            console.info(JSON.stringify(brushSize));
            for (let targetX = brushSize.left; targetX < brushSize.right; targetX++) {
                for (let targetY = brushSize.top; targetY < brushSize.bottom; targetY++) {
                    me.imageData[targetX + targetY * me.size.x] = selectedColor;
                }
            }
        }
        me.repaint();
    }

    floodFill(color, target, location) {
        if (location.x >= 0 && location.x < this.size.x && location.y >= 0 && location.y < this.size.y) {
            let currentColor = this.imageData[location.x + location.y * this.size.x];
            if (currentColor == target) {
                this.imageData[location.x + location.y * this.size.x] = color;
                this.floodFill(color, target, new Vector2(location.x - 1, location.y));
                this.floodFill(color, target, new Vector2(location.x + 1, location.y));
                this.floodFill(color, target, new Vector2(location.x, location.y - 1));
                this.floodFill(color, target, new Vector2(location.x, location.y + 1));
            }
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
        const colorLookup = {
            0: "white",
            1: "black"
        };
        const brushSizeLookup = {
            1: "brushsize-1",
            2: "brushsize-2",
            3: "brushsize-3",
            4: "brushsize-4"
        };

        let me = Game.tools.byId["paint-tool"];
        me.highlightGroupButton("tool", me.brush.tool);
        me.highlightGroupButton("color", colorLookup[me.brush.color]);
        me.highlightGroupButton("brushsize", brushSizeLookup[me.brush.size]);
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