// S4A Connector Extension
// =================
// Snap for All firmata boards Connector. Connecting Snap! to any Firmata compatible
// board: UNO, Nano, Mega, Leonardo, Micro, Due, 101, ESP8266, NodeMCU...
// to dynamically control their functionalities.
// Firmata firmware uploaded is required.
// -----------------
// This extension wants to give continuity to the S4A and Snap4Arduino projects
// (Citilab, Bernat Romagosa, Joan Guillén)
//
// We are using the WebSerial Firmata implementation "firmata-web" by Jelle Hak
// https://github.com/yellow-digital/firmata-web
// forked in https://github.com/jguille2/firmata-web

import { Firmata, WebSerialTransport } from "./firmata-web/index.js";

// s4aConnector //////////////////////////////////////////////////////

// From Snap4Arduino arduino.js 
function s4aConnector (stage) {
    this.init(stage);
};

s4aConnector.prototype.init = function (stage) {
    this.stage = stage;
    this.port = null;
    this.transport = null;
    this.board = null;
};

s4aConnector.prototype.selectPort = function () {
    if (this.board) {
        var myself = this;
        this.transport.on('close', function () { myself.selectPort(); });
        this.disconnect(
            true // quietly
        );
    } else {
        navigator.serial.requestPort().then(port => this.connect(port));
    }
};

s4aConnector.prototype.connect = function (port) {
    var myself = this,
        dialog =
            new DialogBoxMorph().inform(
                'S4A Connector',
                localize('Connecting board...'),
                this.stage.world()
            );

    setTimeout(
        function () {
            if (!(myself.board && myself.board.isReady)) {
                dialog.destroy();
                myself.disconnected('Timed out while attempting to connect.');
            }
        },
        6000
    );

    this.port = port;

    port.open({ baudRate: 57600 }).then(() => {
        this.transport = new WebSerialTransport(port);
        this.board = new Firmata(this.transport);
        this.board.on('ready', () => {
            if (dialog) { dialog.destroy(); }
            new DialogBoxMorph().inform(
                'S4A Connector',
                localize('Your board has been connected. Happy prototyping!'),
                this.stage.world()
            );
            this.transport.port.ondisconnect = function () {
                myself.disconnected();
            };
        });

    });
};

s4aConnector.prototype.disconnect = function (quietly) {
    if (this.board) {
        this.board.serialClose();
        this.board = null;
        if (!quietly) {
            new DialogBoxMorph().inform(
                'S4A Connector',
                localize('Connection closed.'),
                this.stage.world()
            );
        }
    } else {
        if (!quietly) {
            new DialogBoxMorph().inform(
                'S4A Connector',
                localize('No board connected.'),
                this.stage.world()
            );
        }
    }
    if (this.port) {
            this.port.forget();
            this.port = null;
    }
};

s4aConnector.prototype.disconnected = function (message) {
    // Board was disconnected because of some error, or cable was unplugged
    this.disconnect(true);
    new DialogBoxMorph().inform(
        'S4A Connector',
        message || 'Board was disconnected',
        this.stage.world()
    );
};

// From Snap4Arduino threads.js

s4aConnector.prototype.digitalWrite = function (pin, value, proc) {
    var board = this.board;
    if (board && board.isReady) {
        if (board.pins[pin].mode != board.MODES.OUTPUT) {
            board.pinMode(pin, board.MODES.OUTPUT);
            proc.pushContext('doYield');
            proc.pushContext();
        }
        var val = value ? board.HIGH : board.LOW;
        board.digitalWrite(pin, val);
    } else {
        throw new Error('Board not connected');
    }
};

s4aConnector.prototype.pwmWrite = function (pin, value, proc) {
    var board = this.board;
    if (board && board.isReady) {
        if (board.pins[pin].mode != board.MODES.PWM) {
            board.pinMode(pin, board.MODES.PWM);
            proc.pushContext('doYield');
            proc.pushContext();
        }
        board.analogWrite(pin, value);
    } else {
        throw new Error('Board not connected');
    }
};

s4aConnector.prototype.servoWrite = function (pin, value, proc) {
    var board = this.board,
        numericValue = parseInt(value);

    if (board && board.isReady) {
        if (value == 'disconnected') {
            board.pinMode(pin, board.MODES.OUTPUT);
            return;
        }
        if (board.pins[pin].mode != board.MODES.SERVO) {
            board.pinMode(pin, board.MODES.SERVO);
            board.servoConfig(pin, 600, 2400);
        }

        switch (value) {
            case 'clockwise':
                numericValue = 1200;
                break;
            case 'counter-clockwise':
                numericValue = 1800;
                break;
            case 'stopped':
                numericValue = 1500;
                break;
        }
        board.servoWrite(pin, numericValue);
    } else {
        throw new Error('Board not connected');
    }
};

s4aConnector.prototype.reportDigitalReading = function (pin, proc) {
    var board = this.board;
    if (board && board.isReady) {
        if (board.pins[pin].mode != board.MODES.INPUT) {
            board.pinMode(pin, board.MODES.INPUT);
            board.pins[pin].reporting = 1;
        } else {
            if (board.pins[pin].reporting != 2) {
                //board.reportDigitalPin(pin, 1);
                board.digitalRead(pin, function () {board.pins[pin].reporting = 2});
            } else {
                return board.pins[pin].value == 1;
            }
        }
        proc.pushContext('doYield');
        proc.pushContext();
    } else {
        throw new Error('Board not connected');
    }
};

// S4A Connector buttons

SnapExtensions.buttons.palette.push({
    category: 'S4A Connector',
    label: 'Connect',
    hideable: false,
    action: function () {
        var stage = this.parentThatIsA(StageMorph);
        if (!stage.s4aConnector) {
            stage.s4aConnector = new s4aConnector(stage);
        }
        stage.s4aConnector.selectPort();
    }
});

SnapExtensions.buttons.palette.push({
    category: 'S4A Connector',
    label: 'Disconnect',
    hideable: false,
    action: function () {
        var stage = this.parentThatIsA(StageMorph);
        if (!stage.s4aConnector) {
            stage.s4aConnector = new s4aConnector(stage);
        }
        stage.s4aConnector.disconnect();
    }
});

// Initialize the extension

(function() {
    var ide = world.children[0],
        stage = ide.stage;

    // Redo palette so the button actually shows up
    world.children[0].flushBlocksCache();
    world.children[0].refreshPalette();

    // Init controller
    if (!stage.s4aConnector) {
        stage.s4aConnector = new s4aConnector(stage);
    }
})();

// S4A Connector extension

SnapExtensions.primitives.set(
    's4a_digitalWrite(pin, value)',
    function (pin, value, proc) {
        var stage = this.parentThatIsA(StageMorph);
        if (!(stage.s4aConnector && stage.s4aConnector.board && stage.s4aConnector.board.isReady)) { return; }
        stage.s4aConnector.digitalWrite(pin, value, proc);
    }
);

SnapExtensions.primitives.set(
    's4a_pwmWrite(pin, value)',
    function (pin, value, proc) {
        var stage = this.parentThatIsA(StageMorph);
        if (!(stage.s4aConnector && stage.s4aConnector.board && stage.s4aConnector.board.isReady)) { return; }
        stage.s4aConnector.pwmWrite(pin, value, proc);
    }
);

SnapExtensions.primitives.set(
    's4a_servoWrite(pin, value)',
    function (pin, value, proc) {
        var stage = this.parentThatIsA(StageMorph);
        if (!(stage.s4aConnector && stage.s4aConnector.board && stage.s4aConnector.board.isReady)) { return; }
        stage.s4aConnector.servoWrite(pin, value, proc);
    }
);

SnapExtensions.primitives.set(
    's4a_reportDigitalReading(pin)',
    function (pin, proc) {
        var stage = this.parentThatIsA(StageMorph);
        if (!(stage.s4aConnector && stage.s4aConnector.board && stage.s4aConnector.board.isReady)) { return; }
        return stage.s4aConnector.reportDigitalReading(pin, proc);
    }
);
