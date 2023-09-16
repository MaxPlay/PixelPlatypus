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
    Game.ticks++;
    setTimeout(Game.Loop, 1000 / Game.fps);
}

///////////////////////////////////////////////////////////////////////////////////////
/// Rendering

Game.currentFrame = {
    wasDrawn: false,
    frameIdentifier: "",
    data: []
}

Game.clearFrame = function () {
    Game.canvasContext.fillStyle = Game.colors.white;
    Game.canvasContext.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
}

Game.setFrame = function(name)
{
    if (Game.frames[name] && Game.currentFrame.frameIdentifier !== name)
    {
        Game.currentFrame.frameIdentifier = name;
        Game.currentFrame.data = Game.frames[name];
        Game.currentFrame.wasDrawn = false;
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
/// Core

Game.Run = function (params) {
    Game.canvas = document.getElementById("screen");
    AddEvent(document.getElementById("whitebutton"), "click", function() { Game.setFrame("test"); });
    AddEvent(document.getElementById("blackbutton"), "click", function() { Game.setFrame("test2"); });
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