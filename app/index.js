const ipcRenderer = require("electron").ipcRenderer;
const { version } = require("os");
const { SerialPort } = require('serialport')
const APP_VERSION = '0.0.1';
const REQUIRE_HARDWARE_VERSION = '0.0.1';



const app = new Vue({
    el: '#app',
    data: {
        mode: 'static',
        platform: require("os").platform(),
        tab: 'hard',
        drag: false,
        devices: [],
        selDevice: null,
        connected: false,
        appversion: APP_VERSION,
        on: true,
        myArray: [{ id: 1, name: 'test1', color: '#c62eda' }, { id: 2, name: 'test2', color: '#830243' }, { id: 3, name: 'test3', color: '#012743' }],
    },
    methods: {
        removeAt(idx) {
            this.myArray.splice(idx, 1);
        },
        add: function () {
            this.myArray.push({ id: 1, name: 'test1', color: '#c62eda' });
        }
    },
    computed: {
        dragOptions() {
            return {
                animation: 200,
                group: "description",
                disabled: false,
                ghostClass: "ghost"
            };
        }
    }
})

mdui.setColorScheme('#48c6ef');

var port = null;

async function listSerialPorts() {
    await SerialPort.list().then((ports, err) => {
        if (err) {
            document.getElementById('error2').innerText = err.message
            return
        } else {
            document.getElementById('error2').innerText = ''
        }

        if (ports.length === 0) {
            document.getElementById('error2').innerText = 'No ports discovered'
        }

        app.devices = ports
    })
}

function listPorts() {
    listSerialPorts();
    setTimeout(listPorts, 2000);
}

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
setTimeout(listPorts, 2000);

listSerialPorts()

function compareVersion(version1, version2) {
    const arr1 = version1.split('.')
    const arr2 = version2.split('.')
    const length1 = arr1.length
    const length2 = arr2.length
    const minlength = Math.min(length1, length2)
    let i = 0
    for (i; i < minlength; i++) {
        let a = parseInt(arr1[i])
        let b = parseInt(arr2[i])
        if (a > b) {
            return 1
        } else if (a < b) {
            return -1
        }
    }
    if (length1 > length2) {
        for (let j = i; j < length1; j++) {
            if (parseInt(arr1[j]) != 0) {
                return 1
            }
        }
        return 0
    } else if (length1 < length2) {
        for (let j = i; j < length2; j++) {
            if (parseInt(arr2[j]) != 0) {
                return -1
            }
        }
        return 0
    }
    return 0
}

var gotedData = false;

function connect() {
    if (app.connected) {
        return
    }

    setTimeout(() => {
        if (!gotedData) {
            document.getElementById('error').textContent = 'Not response from hardware, please try again or check your hardware';
            port.close()
            app.connected = false;
        }
    }, 3000);

    if (app.selDevice == null) {
        alert('Please select a device first');
        return;
    }

    port = new SerialPort({ path: app.selDevice, baudRate: 9600 });

    port.on('open', function () {
        console.log('Port open');
        app.connected = true;
    });

    port.on('close', function () {
        console.log('Port closed');
        app.connected = false;
    });

    port.on('error', function (err) {
        console.log('Error: ', err.message);
        document.getElementById('error').textContent = ('Error: ' + err.message);
    });

    port.on('data', function (data) {
        console.log('Data:', data.toString());
        var json = JSON.parse(data.toString());
        if (!json.ok) {
            document.getElementById('error').textContent = 'Error hardware, please try another device';
            port.close()
            app.connected = false;
            return
        }
        if (json.error) {
            document.getElementById('error').textContent = 'Error on hardware: ' + json.error;
            return
        }
        if (json.version) {
            if (compareVersion(json.version, REQUIRE_HARDWARE_VERSION) < 0) {
                document.getElementById('error').textContent = 'Hardware version is ' + json.version + ' which is not compatible with this software. Please update your hardware.';
                port.close()
                app.connected = false;
                return
            }
        }
        gotedData = true;
    });

}