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

function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}

var Game = {}

///////////////////////////////////////////////////////////////////////////////////////
/// Data

Game.colors = { black: "rgb(0,0,0)", white: "rgb(255,255,255)", transparent: "rgba(0,0,0,0)" }
Game.colors.getColor = function (type) {
    switch (type) {
        case 0: return Game.colors.transparent;
        case 1: return Game.colors.white;
        case 2: return Game.colors.black;
        default: return Game.colors.transparent;
    }
}
Game.colorTypes = {
    transparent: 0,
    white: 1,
    black: 2
}

Game.sprites = {
    test: [20, 20, 0, 0, 0, 5, 2, 10, 0, 8, 2, 2, 1, 10, 2, 2, 0, 5, 2, 1, 1, 14, 2, 1, 0, 3, 2, 1, 1, 16, 2, 1, 0, 2, 2, 1, 1, 16, 2, 1, 0, 1, 2, 1, 1, 5, 2, 1, 1, 6, 2, 1, 1, 5, 2, 2, 1, 5, 2, 1, 1, 6, 2, 1, 1, 5, 2, 2, 1, 5, 2, 1, 1, 6, 2, 1, 1, 5, 2, 2, 1, 18, 2, 2, 1, 18, 2, 2, 1, 18, 2, 2, 1, 18, 2, 2, 1, 3, 2, 1, 1, 10, 2, 1, 1, 3, 2, 2, 1, 4, 2, 1, 1, 8, 2, 1, 1, 4, 2, 2, 1, 5, 2, 8, 1, 5, 2, 1, 0, 1, 2, 1, 1, 16, 2, 1, 0, 2, 2, 1, 1, 16, 2, 1, 0, 3, 2, 1, 1, 14, 2, 1, 0, 5, 2, 2, 1, 10, 2, 2, 0, 8, 2, 10, 0, 5],
    test2: [20, 20, 0, 0, 0, 5, 1, 10, 0, 8, 1, 2, 2, 10, 1, 2, 0, 5, 1, 1, 2, 14, 1, 1, 0, 3, 1, 1, 2, 16, 1, 1, 0, 2, 1, 1, 2, 16, 1, 1, 0, 1, 1, 1, 2, 5, 1, 1, 2, 6, 1, 1, 2, 5, 1, 2, 2, 5, 1, 1, 2, 6, 1, 1, 2, 5, 1, 2, 2, 5, 1, 1, 2, 6, 1, 1, 2, 5, 1, 2, 2, 18, 1, 2, 2, 18, 1, 2, 2, 18, 1, 2, 2, 18, 1, 2, 2, 3, 1, 1, 2, 10, 1, 1, 2, 3, 1, 2, 2, 4, 1, 1, 2, 8, 1, 1, 2, 4, 1, 2, 2, 5, 1, 8, 2, 5, 1, 1, 0, 1, 1, 1, 2, 16, 1, 1, 0, 2, 1, 1, 2, 16, 1, 1, 0, 3, 1, 1, 2, 14, 1, 1, 0, 5, 1, 2, 2, 10, 1, 2, 0, 8, 1, 10, 0, 5],
    idle: [20, 14, 0, 0, 0, 6, 1, 2, 2, 4, 1, 2, 0, 11, 1, 1, 2, 2, 1, 3, 2, 1, 1, 1, 2, 1, 1, 1, 0, 10, 1, 2, 2, 1, 1, 3, 2, 1, 1, 3, 0, 11, 2, 2, 1, 4, 2, 3, 0, 9, 2, 6, 1, 4, 2, 2, 0, 5, 2, 4, 1, 5, 2, 1, 1, 4, 2, 1, 0, 4, 2, 1, 1, 9, 2, 1, 1, 4, 2, 1, 0, 4, 2, 1, 1, 8, 2, 3, 1, 1, 2, 2, 0, 6, 2, 8, 1, 3, 2, 1, 1, 1, 2, 1, 0, 9, 2, 2, 1, 8, 2, 3, 0, 6, 2, 2, 1, 1, 2, 1, 1, 8, 2, 1, 1, 1, 2, 1, 0, 4, 2, 2, 1, 1, 2, 1, 1, 9, 2, 1, 1, 2, 2, 1, 0, 3, 2, 1, 1, 2, 2, 1, 1, 9, 2, 1, 1, 2, 2, 1, 0, 3, 2, 1, 1, 2, 2, 1, 1, 9, 2, 1, 1, 2, 2, 1, 0, 1],
    egg0: [8, 9, 4, 9, 0, 3, 2, 2, 0, 5, 2, 1, 1, 2, 2, 1, 0, 3, 2, 3, 1, 2, 2, 1, 0, 2, 2, 2, 1, 3, 2, 1, 0, 1, 2, 1, 1, 6, 2, 2, 1, 5, 2, 5, 1, 2, 2, 3, 0, 1, 2, 2, 1, 3, 2, 1, 0, 3, 2, 4, 0, 2],
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

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
    subtract(other) { return new Vector2(this.x - other.x, this.y - other.y); }
    multiply(other) { return new Vector2(this.x * other, this.y * other); }
    multiplyV(other) { return new Vector2(this.x * other.x, this.y * other.y); }
    divide(other) { return new Vector2(this.x * other, this.y * other); }
    divideV(other) { return new Vector2(this.x * other.x, this.y * other.y); }
    area() { return this.x * this.y; }
    invert() { return new Vector2(-this.x, -this.y); }
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    getPosition() { return new Vector2(this.x, this.y); }
    getSize() { return new Vector2(this.w, this.h); }
    getArea() { return new Vector2(this.w - this.x, this.h - this.y).area(); }
}

Sprite = function (data, position) {
    this.location = new Rect(position.x - data[2], position.y - data[3], data[0], data[1]);
    this.data = data;
}

Game.character = {
    name: "",
    age: 0,
    hunger: 0,
    happiness: 0,
    energy: 0
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
        // Handle key down
    });
}

Game.onLeftButtonClicked = function () {
    // TODO: Handle right click
}

Game.onSelectButtonClicked = function () {
    // TODO: Handle select click
}

Game.onRightButtonClicked = function () {
    // TODO: Handle right click
}

///////////////////////////////////////////////////////////////////////////////////////
/// Gameplay

Game.mechanics = {}
Game.mechanics.lifestage = {
    names: [
        "egg",
        "young",
        "grown",
        "old"
    ],
    ages: [
        100,
        10000,
        60000
    ]
};
Game.mechanics.lifestage.getLifestageFromAge = function (age) {
    let me = Game.mechanics.lifestage;
    let i = 0;
    for (; i < me.ages.length; i++) {
        const ageThreshold = me.ages[i];
        if (ageThreshold >= age)
            break;
    }
    return me.names[i];
}

Game.init = function () {
    Game.fps = 30;
    Game.ticks = 0;
}

Game.loop = function () {
    var time = Date.now();
    Game.data.deltaTime = (time - Game.data.time) / 1000;
    Game.data.time = time;
    Game.processInput();
    // TODO process animations here: Game.animate();
    Game.ticks++;

    Game.character.age += Game.data.deltaTime;

    console.log(Game.mechanics.lifestage.getLifestageFromAge(Game.character.age));

    Game.spriteBatch.add("egg0", new Vector2(0, 10));

    setTimeout(Game.loop, 1000 / Game.fps);
}

///////////////////////////////////////////////////////////////////////////////////////
/// Rendering

Game.screenSize = new Vector2(32, 16);

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

Game.clearFrame = function () {
    Game.canvasContext.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
    Game.canvasContext.fillStyle = Game.colors.white;
    Game.canvasContext.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
}

Game.draw = function () {
    let screenSize = new Vector2(Game.canvas.width, Game.canvas.height);
    let context = Game.canvasContext;

    let frameSize = Game.screenSize;
    let pixelSize = new Vector2(screenSize.x / frameSize.x, screenSize.y / frameSize.y);

    Game.clearFrame();

    Game.spriteBatch.data.forEach(element => {
        if (element.data.length > 4) {
            let spriteSize = element.location;
            let pixelIndex = 0;
            for (let i = 4; i < element.data.length; i += 2) {
                let color = element.data[i];
                let amount = element.data[i + 1];
                if (color > 0) {
                    context.fillStyle = Game.colors.getColor(color);
                    for (let j = 0; j < amount; j++) {
                        let x = pixelIndex % spriteSize.w;
                        let y = Math.floor(pixelIndex / spriteSize.w);
                        context.fillRect((x + spriteSize.x) * pixelSize.x, (y + spriteSize.y) * pixelSize.y, pixelSize.x, pixelSize.y);
                        pixelIndex++;
                    }
                }
                else {
                    pixelIndex += amount;
                }
            }
        }
    });

    Game.spriteBatch.clear();
    setTimeout(Game.draw, 1000 / Game.fps);
}

///////////////////////////////////////////////////////////////////////////////////////
/// Debugging

Game.debugMode = false;

class Tool {
    constructor(name, identifier) {
        this.name = name;
        this.identifier = identifier;
        this.buttonGroups = {}

        Game.tools.add(this);
    }

    getCustomShowLogic() {
        return undefined;
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

        AddEvent(Find(button.id), "click", function () { if (tool.getCustomShowLogic() !== undefined) { tool.getCustomShowLogic()(); } else { Find(tool.identifier + "-container").style.visibility = "visible"; } });
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

class DebugConsole extends Tool {
    constructor() {
        super("Debug Console", "debugconsole");
        this.instance = null;
    }

    getCustomShowLogic() {
        return this.show;
    }

    init() {
    }

    show() {
        let me = Game.tools.byId["debugconsole"];
        if (me.instance === null) {
            let debugConsole = document.createElement("div");
            debugConsole.id = "debugconsole";
            debugConsole.style.position = "absolute";
            debugConsole.style.top = 0;
            debugConsole.style.border = "1px solid black";
            debugConsole.style.margin = "10px";
            debugConsole.style.padding = "30px 10px 10px 10px";
            debugConsole.style.background = "#ffae0080";
            me.instance = debugConsole;

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
                AddEvent(closeButton, "click", me.hide);
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

            // TODO: Fill debug console here

            Game.debugMode = true;

            Game.body.appendChild(debugConsole);
        }
    }

    hide() {
        let me = Game.tools.byId["debugconsole"];
        if (me.instance !== null) {
            me.instance.remove();
            Game.debugMode = false;
            me.instance = null;
        }
    };
}

///////////////////////////////////////////////////////////////////////////////////////
/// Paint Tool

class PaintToolResizeWindow {
    constructor(basetool) {
        this.basetool = basetool;
        this.toolname = basetool + "-resize";
        this.window = Find(this.toolname);
        this.xInput = Find(this.toolname + "-x");
        this.yInput = Find(this.toolname + "-y");
        {
            let resizeButtons = [];
            let me = this;
            let index = 0;
            ["up-left", "up", "up-right", "center-left", "center", "center-right", "down-left", "down", "down-right"].forEach(element => {
                let button = Find(me.toolname + "-" + element);
                AddEvent(button, "click", () => me.setDirection(button));
                resizeButtons.push(button);
                ++index;
            });
            this.buttons = resizeButtons;
        }
        this.applyButton = Find(this.toolname + "-apply");
        AddEvent(this.applyButton, "click", this.apply);
        this.cancelButton = Find(this.toolname + "-cancel");
        AddEvent(this.cancelButton, "click", this.cancel);
        this.size = new Vector2(1, 1);
        this.oldSize = this.size;
        this.direction = 4;
    }

    show(currentSize) {
        this.oldSize = currentSize;
        this.size = currentSize;
        this.xInput.value = this.size.x;
        this.yInput.value = this.size.y;
        this.window.style.visibility = "inherit";
        this.setDirection(this.buttons[this.direction]);
    }

    setDirection(button) {
        let me = Game.tools.byId["paint-tool"].resizeWindow;
        me.direction = me.buttons.indexOf(button);
        const icons = { "-1-1": "↖", "0-1": "⬆", "1-1": "↗", "-10": "⬅", "00": "•", "10": "➡", "-11": "↙", "01": "⬇", "11": "↘" };

        let centerX = Math.floor(me.direction % 3);
        let centerY = Math.floor(me.direction / 3);
        for (let i = 0; i < me.buttons.length; i++) {
            const button = me.buttons[i];
            let x = Math.floor(i % 3) - centerX;
            let y = Math.floor(i / 3) - centerY;
            if (Math.abs(x) < 2 && Math.abs(y) < 2) {
                let identifier = x + "" + y;
                button.innerHTML = icons[identifier];
            }
            else {
                button.innerHTML = "";
            }
        }
    }

    apply() {
        let paintTool = Game.tools.byId["paint-tool"];
        let me = paintTool.resizeWindow;
        me.window.style.visibility = "collapse";

        const x = Math.max(1, Math.min(40, Number(me.xInput.value)));
        const y = Math.max(1, Math.min(40, Number(me.yInput.value)));
        me.size = new Vector2(x, y);
        paintTool.applySizeChange(me.size, me.direction);
    }

    cancel() {
        let paintTool = Game.tools.byId["paint-tool"];
        let me = paintTool.resizeWindow;
        me.window.style.visibility = "collapse";
    }
}

class PaintToolPivotWindow {
    constructor(basetool) {
        this.basetool = basetool;
        this.toolname = basetool + "-pivot";
        this.window = Find(this.toolname);
        this.xInput = Find(this.toolname + "-x");
        this.yInput = Find(this.toolname + "-y");
        this.limits = new Vector2(0, 0);
        this.pivot = new Vector2(0, 0);
        this.applyButton = Find(this.toolname + "-apply");
        AddEvent(this.applyButton, "click", this.apply);
        this.cancelButton = Find(this.toolname + "-cancel");
        AddEvent(this.cancelButton, "click", this.cancel);
    }

    show(pivot, limits) {
        this.window.style.visibility = "inherit";
        this.limits = new Vector2(Math.round(limits.x), Math.round(limits.y));
        const x = clamp(Math.round(pivot.x), 1, this.limits.x);
        const y = clamp(Math.round(pivot.y), 1, this.limits.y);
        this.xInput.value = x;
        this.xInput.setAttribute("max", this.limits.x);
        this.yInput.value = y;
        this.yInput.setAttribute("max", this.limits.y);
    }

    apply() {
        let paintTool = Game.tools.byId["paint-tool"];
        let me = paintTool.pivotWindow;
        me.window.style.visibility = "collapse";

        const x = clamp(Number(me.xInput.value), 1, me.limits.x);
        const y = clamp(Number(me.yInput.value), 1, me.limits.y);
        paintTool.setPivot(new Vector2(x, y));
    }

    cancel() {
        let paintTool = Game.tools.byId["paint-tool"];
        let me = paintTool.pivotWindow;
        me.window.style.visibility = "collapse";
    }
}

class PaintTool extends Tool {
    constructor() {
        super("Paint Tool", "paint-tool");
        this.canvas = Find("paint-tool");
        this.canvasContext = this.canvas.getContext("2d", { alpha: false });
        this.resizeWindow = new PaintToolResizeWindow(this.identifier);
        this.pivotWindow = new PaintToolPivotWindow(this.identifier);
        this.toolbar = Find("paint-tool-toolbar");
        this.dataDisplay = Find("paint-tool-data");
        this.brush = {
            tool: "paint",
            color: 1,
            size: 1
        }
        this.imageData = [];
        this.size = new Vector2(0, 0);
        this.pivot = new Vector2(10, 10);
        this.resize(new Vector2(20, 20), new Vector2(0, 0));
    }

    init() {
        AddEvent(Find("close-paint-tool"), "click", function () { Find("paint-tool-container").style.visibility = "collapse"; });

        function setBrushData(id, value) {
            let me = Game.tools.byId["paint-tool"];
            me.brush[id] = value;
            me.refreshMode();
        }

        this.addButton(this.toolbar, "white", '<svg width="20" height="20"><rect height="16" width="16" x="2" y="2" fill="#fff" stroke="#888"></rect></svg>', () => setBrushData("color", Game.colorTypes.white), "color");
        this.addButton(this.toolbar, "black", '<svg width="20" height="20"><rect height="16" width="16" x="2" y="2" fill="#000" stroke="#888"></rect></svg>', () => setBrushData("color", Game.colorTypes.black), "color");
        this.addSeparator(this.toolbar);
        this.addButton(this.toolbar, "paint", '<svg width="20" height="20"><rect height="2.68748" width="3.06248" y="14.96872" x="14.12497" stroke="#000" fill="#000000"/><rect transform="rotate(-41.2257, 10.1057, 9.9232)" height="15.93494" width="4.43747" y="1.95573" x="7.88692" stroke="#000" fill="#ffffff"/><rect rx="1" transform="rotate(-41.2257, 4.36706, 3.37399)" height="2.05906" width="4.43747" y="2.34446" x="2.14833" stroke="#000" fill="#000000"/></svg>', () => setBrushData("tool", "paint"), "tool");
        this.addButton(this.toolbar, "fill", '<svg width="20" height="20"><ellipse transform="rotate(14.1157, 14.7187, 8.87501)" ry="1.34374" rx="3.09373" cy="8.87501" cx="14.71872" stroke="#000" fill="#000000"/><rect transform="rotate(42.8183, 9.03079, 11.9955)" height="11.06243" width="8.53023" y="6.46431" x="4.76568" stroke="#000" fill="#fff"/><line y2="9.34376" x2="10.0625" y1="3.46879" x1="5.56253" stroke="#000" fill="none"/><ellipse ry="1.90624" rx="0.96874" cy="10.93749" cx="17.15621" stroke="#000" fill="#000000"/><ellipse ry="2.71873" rx="0.75" cy="12.68748" cx="17.43745" stroke="#000" fill="#000000"/></svg>', () => setBrushData("tool", "fill"), "tool");
        this.addButton(this.toolbar, "erase", '<svg width="20" height="20"><rect rx="1" transform="rotate(42.8183, 10.1665, 9.79617)" height="8.01821" width="15.99863" y="5.78707" x="2.16717" stroke="#000" fill="#fff"/><rect rx="1" transform="rotate(42.8183, 13.1373, 12.4864)" height="8.01821" width="7.4266" y="8.47729" x="9.42397" stroke="#000" fill="#000000"/><line y2="17.9062" x2="10.93749" y1="17.9062" x1="4.81253" stroke="#000" fill="none"/></svg>', () => setBrushData("tool", "erase"), "tool");
        this.addSeparator(this.toolbar);
        this.addButton(this.toolbar, "brushsize-1", '<svg width="20" height="20"><rect height="2" width="2" x="9" y="9" fill="#000"></svg>', () => setBrushData("size", 1), "brushsize");
        this.addButton(this.toolbar, "brushsize-2", '<svg width="20" height="20"><rect height="6" width="6" x="7" y="7" fill="#000"></svg>', () => setBrushData("size", 2), "brushsize");
        this.addButton(this.toolbar, "brushsize-3", '<svg width="20" height="20"><rect height="10" width="10" x="5" y="5" fill="#000"></svg>', () => setBrushData("size", 3), "brushsize");
        this.addButton(this.toolbar, "brushsize-4", '<svg width="20" height="20"><rect height="14" width="14" x="3" y="3" fill="#000"></svg>', () => setBrushData("size", 4), "brushsize");
        this.addSeparator(this.toolbar);
        this.addButton(this.toolbar, "resize", '<svg width="20" height="20"><rect stroke-width="0" height="17.625" width="18" y="1.1875" x="1" stroke="#000" fill="#000000"/><rect transform="rotate(45, 10, 10)" height="18" width="18" y="1" x="1" stroke-width="0" stroke="#000" fill="#ffffff"/><rect transform="rotate(45, 10, 10)" height="2" width="20" y="9" x="0" stroke-width="0" stroke="#000" fill="#000000"/><rect transform="rotate(-45, 10, 10)" height="2" width="20" y="9" x="0" stroke-width="0" stroke="#000" fill="#000000"/></svg>', this.showResize);
        this.addButton(this.toolbar, "resize-to-fit", '<svg width="20" height="20"><line stroke-linecap="undefined" stroke-linejoin="undefined" y2="18" x2="6" y1="2" x1="6" stroke="#000" fill="none"/><line stroke-linecap="undefined" stroke-linejoin="undefined" y2="18" x2="14" y1="2" x1="14" stroke="#000" fill="none"/><line stroke-linecap="undefined" stroke-linejoin="undefined" y2="6" x2="18" y1="6" x1="2" stroke="#000" fill="none"/><line stroke-linecap="undefined" stroke-linejoin="undefined" y2="14" x2="18" y1="14" x1="2" stroke="#000" fill="none"/></svg>', this.resizeToFit);
        this.addButton(this.toolbar, "pivot", '<svg width="20" height="20"><line stroke-width="2" stroke-linecap="undefined" stroke-linejoin="undefined" y2="10" x2="17" y1="10" x1="3" stroke="#000" fill="none"/><line stroke-linecap="undefined" stroke-linejoin="undefined" y2="17" x2="10" y1="3" x1="10" stroke-width="2" stroke="#000" fill="none"/></svg>', this.showPivot);

        AddEvent(this.canvas, "mousedown", this.canvasMouseDown);
        AddEvent(this.canvas, "mousemove", this.canvasMouseMove);
        AddEvent(this.canvas, "mouseup", this.canvasMouseUp);

        AddEvent(Find("paint-tool-copy-data"), "click", this.copyData);
        AddEvent(Find("paint-tool-paste-data"), "click", this.pasteData);

        this.refreshMode();
        this.repaint();
    }

    showResize() {
        let me = Game.tools.byId["paint-tool"];
        me.resizeWindow.show(me.size);
    }

    showPivot() {
        let me = Game.tools.byId["paint-tool"];
        me.pivotWindow.show(me.pivot, me.size);
    }

    setPivot(pivot) {
        let me = Game.tools.byId["paint-tool"];
        me.pivot.x = pivot.x;
        me.pivot.y = pivot.y;

        me.repaint();
    }

    resizeToFit() {
        let me = Game.tools.byId["paint-tool"];
        let targetRect = new Rect(me.size.x, me.size.y, me.size.x, me.size.y);
        for (let x = 0; x < me.size.x; x++) {
            for (let y = 0; y < me.size.y; y++) {
                const value = me.imageData[x + y * me.size.x];
                if (value !== Game.colorTypes.transparent) {
                    targetRect.x = Math.min(targetRect.x, x);
                    targetRect.y = Math.min(targetRect.y, y);
                    targetRect.w = Math.min(targetRect.w, (me.size.x - 1) - x);
                    targetRect.h = Math.min(targetRect.h, (me.size.y - 1) - y);
                }
            }
        }

        const offset = new Vector2(-targetRect.x, -targetRect.y);
        const size = new Vector2(clamp(me.size.x - targetRect.x - targetRect.w, 1, 40), clamp(me.size.y - targetRect.y - targetRect.h, 1, 40));
        me.resize(size, offset);
    }

    applySizeChange(size, direction) {
        let me = Game.tools.byId["paint-tool"];
        const oldSize = me.size;

        let difference = new Vector2(size.x - oldSize.x, size.y - oldSize.y);
        let padding = new Vector2(0, 0);
        switch (direction) {
            case 1:
                padding.x = Math.round(difference.x / 2);
                break;
            case 2:
                padding.x = difference.x;
                break;
            case 3:
                padding.y = Math.round(difference.y / 2);
                break;
            case 4:
                padding.x = Math.round(difference.x / 2);
                padding.y = Math.round(difference.y / 2);
                break;
            case 5:
                padding.x = difference.x;
                padding.y = Math.round(difference.y / 2);
                break;
            case 6:
                padding.y = difference.y;
                break;
            case 7:
                padding.x = Math.round(difference.x / 2);
                padding.y = difference.y;
                break;
            case 8:
                padding.x = difference.x;
                padding.y = difference.y;
                break;
        }

        me.resize(size, padding)
    }

    resize(size, offset) {
        const oldSize = new Vector2(this.size.x, this.size.y);
        const oldData = Array.from(this.imageData);
        this.canvas.width = size.x * 20;
        this.canvas.height = size.y * 20;
        this.size.x = size.x;
        this.size.y = size.y;
        this.resetImage();

        for (let oldY = 0; oldY < oldSize.y; oldY++) {
            for (let oldX = 0; oldX < oldSize.x; oldX++) {
                let newCoordinate = new Vector2(oldX + offset.x, oldY + offset.y);
                if (newCoordinate.x < this.size.x && newCoordinate.x >= 0 && newCoordinate.y < this.size.y && newCoordinate.y >= 0) {
                    let value = oldData[oldX + oldY * oldSize.x];
                    this.imageData[newCoordinate.x + newCoordinate.y * this.size.x] = value;
                }
            }
        }

        this.pivot.x = clamp(this.pivot.x, 0, this.size.x);
        this.pivot.y = clamp(this.pivot.y, 0, this.size.y);

        this.repaint();
    }

    refreshData() {
        let me = Game.tools.byId["paint-tool"];
        let output = [];
        output.push(me.size.x);
        output.push(me.size.y);
        output.push(me.pivot.x);
        output.push(me.pivot.y);
        let lastColor = -1;
        let count = 0;
        me.imageData.forEach(data => {
            if (lastColor === -1) {
                lastColor = data;
                count = 1;
                return;
            }

            if (lastColor != data) {
                output.push(lastColor);
                output.push(count);
                lastColor = data;
                count = 1;
                return;
            }

            ++count;
        });
        output.push(lastColor);
        output.push(count);

        me.dataDisplay.value = JSON.stringify(output);
    }

    copyData() {
        if (navigator.clipboard.writeText === undefined) {
            window.alert("Writing to the clipboard is not enabled in your browser. You have to specifically give permission to do that.");
            return;
        }

        let me = Game.tools.byId["paint-tool"];
        let copyButton = Find("paint-tool-copy-data");
        navigator.clipboard.writeText(me.dataDisplay.value).then(function () {
            let oldContent = copyButton.innerHTML;
            copyButton.innerHTML = "Copied!";
            setTimeout(function () { copyButton.innerHTML = oldContent; }, 1000)
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    pasteData() {
        if (navigator.clipboard.readText === undefined) {
            window.alert("Reading from the clipboard is not enabled in your browser. You have to specifically give permission to do that.");
            return;
        }

        let me = Game.tools.byId["paint-tool"];
        navigator.clipboard.readText().then((text) => {
            let data = JSON.parse(text);
            if (Array.isArray(data)) {
                me.loadData(data);
            }
            else {
                console.error('Paste data is not an array');
            }
        }, function (err) {
            console.error('Async: Could not paste text: ', err);
        });
    }

    loadData(data) {
        if (data.length < 6) {
            console.error('Not enough data to load.');
            return;
        }

        if ((data.length % 2) !== 0) {
            console.error('The amount of data must be an even number.');
            return;
        }

        if (!data.every(a => Number.isInteger(a))) {
            console.error('Not all elements in the data set is an image');
            return;
        }

        this.size.x = data[0];
        this.size.y = data[1];

        this.pivot.x = data[2];
        this.pivot.y = data[3];

        this.canvas.width = this.size.x * 20;
        this.canvas.height = this.size.y * 20;

        this.resetImage();

        let currentIndex = 0;
        for (let i = 2; i < data.length; i += 2) {
            const color = data[i];
            const count = data[i + 1];
            for (let j = 0; j < count; j++) {
                this.imageData[currentIndex] = color;
                ++currentIndex;
            }
        }

        this.repaint();
    }

    resetImage() {
        this.imageData = [];
        for (let i = 0; i < this.size.area(); i++) {
            this.imageData.push(0);
        }
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
            selectedColor = Game.colorTypes.transparent;

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
        let context = me.canvasContext;
        const tilesize = 20;

        context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);

        for (let i = 0; i < me.size.x * 2 * me.size.y * 2; i++) {
            let x = i % (me.size.x * 2);
            let y = Math.floor(i / (me.size.x * 2));
            let a = Math.abs((i % 2) - (y % 2)) == 0;
            context.fillStyle = a ? "rgb(205,245,205)" : "rgb(200,140,200)";
            context.fillRect(x * 10, y * 10, 10, 10);
        }
        let pixelIndex = 0;
        me.imageData.forEach(pixel => {
            let x = pixelIndex % me.size.x;
            let y = Math.floor(pixelIndex / me.size.x);
            pixelIndex++;

            context.fillStyle = Game.colors.getColor(pixel);
            context.fillRect(x * tilesize, y * tilesize, tilesize, tilesize);
        });

        const pivot = me.pivot.multiply(tilesize);
        context.strokeStyle = "rgb(255, 0, 0)";
        context.beginPath();
        context.moveTo(pivot.x - 10, pivot.y);
        context.lineTo(pivot.x + 10, pivot.y);
        context.moveTo(pivot.x, pivot.y - 10);
        context.lineTo(pivot.x, pivot.y + 10);
        context.lineWidth = 2.0;
        context.stroke();

        me.refreshData();
    }

    refreshMode() {
        const colorLookup = {
            1: "white",
            2: "black"
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
            toolbar.style.visibility = "visible";
            new DebugConsole();
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

    AddEvent(Find("button-left"), "click", Game.onLeftButtonClicked);
    AddEvent(Find("button-select"), "click", Game.onSelectButtonClicked);
    AddEvent(Find("button-right"), "click", Game.onRightButtonClicked);

    Game.data = {
        time: Date.now(),
        deltaTime: 0
    }
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