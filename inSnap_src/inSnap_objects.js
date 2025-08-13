////
//In objects.js (around line 2330)... adding elements to the return object in the primitiveBlocks function
////
        },
// Adding 6 dev primitives to offer compatibility with Snap4Arduino projects

        reportConnected: {
            dev: true,
            type: 'predicate',
            category: 'other',
            spec: 'arduino connected?',
            src:`(
                (prim t reportConnected) 
                (report 
                    (ext s4a_reportConnected)
                )
            )`
        },
        digitalWrite: {
            dev: true,
            type: 'command',
            category: 'other',
            spec: 'set digital pin %n to %b',
            src:`(
                (prim t digitalWrite pin value) 
                (extension "s4a_digitalWrite(pin, value)" 
                    (get pin) 
                    (get value)
                )
            )`
        },
        pwmWrite: {
            dev: true,
            type: 'command',
            category: 'other',
            spec: 'set pin %n to value %n',
            defaults: [null, 128],
            src:`(
                (prim t pwmWrite pin value) 
                (extension "s4a_pwmWrite(pin, value)" 
                    (get pin) 
                    (get value)
                )
            )`
        },
        servoWrite: {
            dev: true,
            type: 'command',
            category: 'other',
            spec: 'set servo %n to %s',
            defaults: [null, ['clockwise']],
            src:`(
                (prim t servoWrite pin value) 
                (extension "s4a_servoWrite(pin, value)" 
                    (get pin) 
                    (ext "txt_transform(name, txt)" unselect 
                        (get value)
                    )
                )
            )`
        },
            reportAnalogReading: {
            dev: true,
            type: 'reporter',
            category: 'other',
            spec: 'analog reading %n',
            src:`(
                (prim t reportAnalogReading pin) 
                (report 
                    (ext "s4a_reportAnalogReading(pin)" 
                        (get pin)
                    )
                )
            )`
        },
        reportDigitalReading: {
            dev: true,
            type: 'predicate',
            category: 'other',
            spec: 'digital reading %n',
            src:`(
                (prim t reportDigitalReading pin) 
                (report 
                    (ext "s4a_reportDigitalReading(pin)" 
                        (get pin)
                    )
                )
            )`
        }
////
