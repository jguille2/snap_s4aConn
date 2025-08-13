////
//In threads.js (around line 9629)... ending the Process.prototype functions definition
////
// Adding 6 dev primitives to offer compatibility with Snap4Arduino projects
// They need s4a extension functions, loaded with the S4A Connector library

Process.prototype.reportConnected = function () {
    return this.reportApplyExtension("s4a_reportConnected", new List([]));
};
Process.prototype.digitalWrite = function (pin, booleanValue) {
    this.doApplyExtension("s4a_digitalWrite(pin, value)", new List([pin, booleanValue]));
};
Process.prototype.pwmWrite = function (pin, value) {
    this.doApplyExtension("s4a_pwmWrite(pin, value)", new List([pin, value]));
};
Process.prototype.servoWrite = function (pin, value) {
    this.doApplyExtension("s4a_servoWrite(pin, value)", new List([pin, value]));
};
Process.prototype.reportAnalogReading = function (pin) {
    return this.reportApplyExtension("s4a_reportAnalogReading(pin)", new List([pin]));
};
Process.prototype.reportDigitalReading = function (pin, booleanValue) {
    return this.reportApplyExtension("s4a_reportDigitalReading(pin)", new List([pin]));
};

////
