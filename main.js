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

var Game = {}

Game.colors = { black: "rgb(0,0,0)", white: "rgb(255,255,255)" }

Game.frames = {
    test: [0, 5, 10, 8, 2, 10, 2, 5, 1, 14, 1, 3, 1, 16, 1, 2, 1, 16, 1, 1, 1, 6, 1, 4, 1, 6, 2, 6, 1, 4, 1, 6, 2, 6, 1, 4, 1, 6, 2, 18, 2, 18, 2, 18, 2, 4, 1, 8, 1, 4, 2, 5, 1, 6, 1, 5, 2, 6, 6, 6, 2, 18, 1, 1, 1, 16, 1, 2, 1, 16, 1, 3, 1, 14, 1, 5, 2, 10, 2, 8, 10, 5],
    test2: [1, 5, 10, 8, 2, 10, 2, 5, 1, 14, 1, 3, 1, 16, 1, 2, 1, 16, 1, 1, 1, 6, 1, 4, 1, 6, 2, 6, 1, 4, 1, 6, 2, 6, 1, 4, 1, 6, 2, 18, 2, 18, 2, 18, 2, 4, 1, 8, 1, 4, 2, 5, 1, 6, 1, 5, 2, 6, 6, 6, 2, 18, 1, 1, 1, 16, 1, 2, 1, 16, 1, 3, 1, 14, 1, 5, 2, 10, 2, 8, 10, 5],
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

///////////////////////////////////////////////////////////////////////////////////////
/// Gameplay

Game.Init = function () {
    Game.fps = 30;
    Game.ticks = 0;
}

Game.Loop = function () {
    Game.animate();
    Game.ticks++;
    setTimeout(Game.Loop, 1000 / Game.fps);
}

///////////////////////////////////////////////////////////////////////////////////////
/// Rendering

Game.currentFrame = {
    wasDrawn: false,
    name: "",
    data: []
}

Game.currentAnimation = {
    name: "",
    data: {},
    currentFrame: 0,
    isRunning: false,
    isSet: false
}

Game.clearFrame = function () {
    Game.canvasContext.fillStyle = Game.colors.white;
    Game.canvasContext.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
}

Game.setFrame = function (name) {
    if (Game.frames[name] && Game.currentFrame.name !== name) {
        Game.currentFrame.name = name;
        Game.currentFrame.data = Game.frames[name];
        Game.currentFrame.wasDrawn = false;
    }
}

Game.startAnimation = function (name) {
    if (Game.animations[name] && (Game.currentAnimation.name !== name || !Game.currentAnimation.isSet)) {
        Game.currentAnimation.name = name;
        Game.currentAnimation.data = Game.animations[name];
        Game.currentAnimation.currentFrame = 0;
        Game.currentAnimation.isRunning = true;
        Game.currentAnimation.isSet = true;
        Game.setFrame(Game.currentAnimation.data[0]);
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
            Game.setFrame(Game.currentAnimation.data.frames[Game.currentAnimation.currentFrame]);
    }
}

Game.Draw = function () {
    let currentFrame = Game.currentFrame;
    if (!currentFrame.wasDrawn) {
        let screenSize = { X: Game.canvas.width, Y: Game.canvas.height };
        let context = Game.canvasContext;

        let frameSize = { X: 20, Y: 20 };
        let pixelSize = { X: screenSize.X / frameSize.X, Y: screenSize.Y / frameSize.Y };

        Game.clearFrame();

        let isBlack = !!currentFrame.data[0];
        let pixelIndex = 0;
        for (let i = 1; i < currentFrame.data.length; i++) {
            context.fillStyle = isBlack ? Game.colors.black : Game.colors.white;
            for (let j = 0; j < currentFrame.data[i]; j++) {
                let x = pixelIndex % frameSize.X;
                let y = Math.floor(pixelIndex / frameSize.X);
                context.fillRect(x * pixelSize.X, y * pixelSize.Y, pixelSize.X, pixelSize.Y);
                pixelIndex++;
            }
            isBlack = !isBlack;
        }

        currentFrame.wasDrawn = true;
    }

    setTimeout(Game.Draw, 1000 / Game.fps);
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
        debugConsole.addButton("white", function () { Game.setFrame("test"); }, false);
        debugConsole.addButton("black", function () { Game.setFrame("test2"); }, true);
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

///////////////////////////////////////////////////////////////////////////////////////
/// Core

Game.Run = function (params) {
    Game.body = document.body;
    Game.canvas = document.getElementById("screen");

    if (!Game.canvas.getContext) {
        console.error("Canvas is not supported!");
        return;
    }
    Game.canvasContext = Game.canvas.getContext("2d", { alpha: false });

    Game.isVisible = true;
    AddEvent(document, 'visibilitychange', function (e) { Game.isVisible = (document.visibilityState === 'hidden'); });

    Game.Init();
    Game.Loop();
    Game.Draw();
}

// Launcher
window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    Game.Run(params);
}