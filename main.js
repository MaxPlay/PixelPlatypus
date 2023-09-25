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
        case 0: return Game.colors.transparent;
        case 1: return Game.colors.white;
        case 2: return Game.colors.black;
        default: return Game.colors.transparent;
    }
}

Game.sprites = {
    test: [20, 20, 0, 5, 2, 10, 0, 8, 2, 2, 1, 10, 2, 2, 0, 5, 2, 1, 1, 14, 2, 1, 0, 3, 2, 1, 1, 16, 2, 1, 0, 2, 2, 1, 1, 16, 2, 1, 0, 1, 2, 1, 1, 5, 2, 1, 1, 6, 2, 1, 1, 5, 2, 2, 1, 5, 2, 1, 1, 6, 2, 1, 1, 5, 2, 2, 1, 5, 2, 1, 1, 6, 2, 1, 1, 5, 2, 2, 1, 18, 2, 2, 1, 18, 2, 2, 1, 18, 2, 2, 1, 18, 2, 2, 1, 3, 2, 1, 1, 10, 2, 1, 1, 3, 2, 2, 1, 4, 2, 1, 1, 8, 2, 1, 1, 4, 2, 2, 1, 5, 2, 8, 1, 5, 2, 1, 0, 1, 2, 1, 1, 16, 2, 1, 0, 2, 2, 1, 1, 16, 2, 1, 0, 3, 2, 1, 1, 14, 2, 1, 0, 5, 2, 2, 1, 10, 2, 2, 0, 8, 2, 10, 0, 5],
    test2: [20, 20, 0, 5, 1, 10, 0, 8, 1, 2, 2, 10, 1, 2, 0, 5, 1, 1, 2, 14, 1, 1, 0, 3, 1, 1, 2, 16, 1, 1, 0, 2, 1, 1, 2, 16, 1, 1, 0, 1, 1, 1, 2, 5, 1, 1, 2, 6, 1, 1, 2, 5, 1, 2, 2, 5, 1, 1, 2, 6, 1, 1, 2, 5, 1, 2, 2, 5, 1, 1, 2, 6, 1, 1, 2, 5, 1, 2, 2, 18, 1, 2, 2, 18, 1, 2, 2, 18, 1, 2, 2, 18, 1, 2, 2, 3, 1, 1, 2, 10, 1, 1, 2, 3, 1, 2, 2, 4, 1, 1, 2, 8, 1, 1, 2, 4, 1, 2, 2, 5, 1, 8, 2, 5, 1, 1, 0, 1, 1, 1, 2, 16, 1, 1, 0, 2, 1, 1, 2, 16, 1, 1, 0, 3, 1, 1, 2, 14, 1, 1, 0, 5, 1, 2, 2, 10, 1, 2, 0, 8, 1, 10, 0, 5],
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
    this.area = function () {
        return this.x * this.y;
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
            let spriteSize = element.location;
            let pixelIndex = 0;
            for (let i = 2; i < element.data.length; i += 2) {
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
        this.window = Find(basetool + "-resize");
        this.xInput = Find(basetool + "-resize-x");
        this.yInput = Find(basetool + "-resize-y");
        {
            let resizeButtons = [];
            let me = this;
            let index = 0;
            ["up-left", "up", "up-right", "center-left", "center", "center-right", "down-left", "down", "down-right"].forEach(element => {
                let button = Find("paint-tool-resize-" + element);
                AddEvent(button, "click", () => me.setDirection(button));
                resizeButtons.push(button);
                ++index;
            });
            this.buttons = resizeButtons;
        }
        this.applyButton = Find("paint-tool-resize-apply");
        AddEvent(this.applyButton, "click", this.apply);
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
        paintTool.changeSize(me.size, me.direction);
    }
};

class PaintTool extends Tool {
    constructor() {
        super("Paint Tool", "paint-tool");
        this.canvas = Find("paint-tool");
        this.canvasContext = this.canvas.getContext("2d", { alpha: false });
        this.resizeWindow = new PaintToolResizeWindow(this.identifier);
        this.toolbar = Find("paint-tool-toolbar");
        this.dataDisplay = Find("paint-tool-data");
        this.brush = {
            tool: "paint",
            color: 1,
            size: 1
        }
        this.imageData = [];
        this.size = new Vector2(0, 0);
        this.changeSize(new Vector2(20, 20), 0);
    }

    init() {
        AddEvent(Find("close-paint-tool"), "click", function () { Find("paint-tool-container").style.visibility = "collapse"; });

        function setBrushData(id, value) {
            let me = Game.tools.byId["paint-tool"];
            me.brush[id] = value;
            me.refreshMode();
        }

        this.addButton(this.toolbar, "white", '<svg width="20" height="20"><rect height="16" width="16" x="2" y="2" fill="#fff" stroke="#888"></rect></svg>', () => setBrushData("color", 1), "color");
        this.addButton(this.toolbar, "black", '<svg width="20" height="20"><rect height="16" width="16" x="2" y="2" fill="#000" stroke="#888"></rect></svg>', () => setBrushData("color", 2), "color");
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

    changeSize(size, direction) {
        let me = Game.tools.byId["paint-tool"];
        let oldSize = me.size;
        let oldData = Array.from(me.imageData);

        me.size = size;
        let difference = new Vector2(me.size.x - oldSize.x, me.size.y - oldSize.y);

        let x = size.x;
        let y = size.y;

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


        me.canvas.width = x * 20;
        me.canvas.height = y * 20;
        this.resetImage();

        for (let oldY = 0; oldY < oldSize.y; oldY++) {
            for (let oldX = 0; oldX < oldSize.x; oldX++) {
                let newCoordinate = new Vector2(oldX + padding.x, oldY + padding.y);
                if (newCoordinate.x < me.size.x && newCoordinate.x >= 0 && newCoordinate.y < me.size.y && newCoordinate.y >= 0) {
                    let value = oldData[oldX + oldY * oldSize.x];
                    me.imageData[newCoordinate.x + newCoordinate.y * me.size.x] = value;
                }
            }
        }

        me.repaint();
    }

    refreshData() {
        let me = Game.tools.byId["paint-tool"];
        let output = [];
        output.push(me.size.x);
        output.push(me.size.y);
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
        if (data.length < 4) {
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
            selectedColor = 0;

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