function AddEvent(element, event, callback) {
    if (element.addEventListener) {
        element.addEventListener(event, callback, false); return [element, event, callback];
    }
    else if (element.attachEvent) {
        var callback2 = function () { callback.call(element); }
        element.attachEvent('on' + event, callback2); return [element, event, callback2];
    }
    return false;
}

function RemoveEvent(eventObject) {
    if (!eventObject) return false;
    if (eventObject[0].removeEventListener) eventObject[0].removeEventListener(eventObject[1], eventObject[2], false);
    else if (eventObject[0].detachEvent) eventObject[0].detachEvent('on' + eventObject[1], eventObject[2]);
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

Game.Init = function () {
    Game.fps = 30;
    Game.ticks = 0;
}

Game.Loop = function () {
    Game.ticks++;
    setTimeout(Game.Loop, 1000 / Game.fps);
}

Game.clearFrame = function () {
    Game.canvasContext.fillStyle = Game.colors.white;
    Game.canvasContext.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
}

Game.Draw = function () {
    let currentFrame = Game.currentFrame;
    if (!currentFrame.wasDrawn) {
        let screenSize = { X: Game.canvas.width, Y: Game.canvas.height };
        let context = Game.canvasContext;

        let frameSize = { X: 5, Y: 5 };
        let pixelSize = { X: screenSize.X / frameSize.X, Y: screenSize.Y / frameSize.Y };

        Game.clearFrame();

        for (let i = 0; i < currentFrame.data.length; i++) {
            const pixel = currentFrame.data[i];
            switch (pixel) {
                case 0:
                    context.fillStyle = Game.colors.white;
                    break;
                case 1:
                    context.fillStyle = Game.colors.black;
                    break;
                default:
                    continue;
            }
            let x = i % frameSize.X;
            let y = Math.floor(i / frameSize.X);
            context.fillRect(x * pixelSize.X, y * pixelSize.Y, pixelSize.X, pixelSize.Y);
        }

        currentFrame.wasDrawn = true;
    }

    setTimeout(Game.Draw, 1000 / Game.fps);
}

Game.Run = function (params) {
    Game.canvas = document.getElementById("screen");
    if (!Game.canvas.getContext) {
        console.error("Canvas is not supported!");
        return;
    }
    Game.canvasContext = Game.canvas.getContext("2d", { alpha: false });

    Game.currentFrame = {
        wasDrawn: false,
        data:
            [0, 1, 0, 1, 0,
                1, 0, 1, 0, 1,
                0, 1, 0, 1, 0,
                1, 0, 1, 0, 1,
                0, 1, 0, 1, 0]
    };

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