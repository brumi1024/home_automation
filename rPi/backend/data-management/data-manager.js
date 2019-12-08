"use strict";

const PythonShell = require('python-shell');
const influx = require('./influxDb');
const idFactory = require('./id-factory');
let dataManager = {};
let timerToWrite = null;
let incomingDataTimeout = null;
let timeOfLastWrite = null;
let notificationObject = {};

dataManager.start = function (io) {
    let dataBuffer = {};

    io.on('connection', function (socket) {
        console.log('New client connection.');

        for (const i in notificationObject) {
            if (notificationObject[i] !== null) {
                socket.emit(i, notificationObject[i]);
            }
        }

        socket.on('errors-read', function (message) {
            console.log(message);
        });
    });

    setIncomingTimeout(io);

    let options = {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        pythonOptions: ['-u'],
        scriptPath: 'data-management',
        args: []
    };

    let pyshell = new PythonShell('serialReader.py', options);

    pyshell.on('message', function (message) {
        const messageJSON = JSON.parse(message);
        if (messageJSON.hasOwnProperty('XBeeError')) {
            console.log(messageJSON['XbeeError']);

        } else if (messageJSON.id) {
            if (messageJSON.id >= 10) {
                console.log(messageJSON);
            } else if (messageJSON.id !== 0) {
                dataBuffer[idFactory[messageJSON.id]] = parseFloat(messageJSON.value);

                if (!timerToWrite) {
                    timeOfLastWrite = new Date().toLocaleString();

                    timerToWrite = setTimeout(function () {
                        timerToWrite = null;
                        if (incomingDataTimeout !== null) {
                            clearTimeout(incomingDataTimeout);
                            setIncomingTimeout(io);
                        }

                        influx.writeData(dataBuffer);
                        dataBuffer = {};

                        notificationObject['info:new-data'] = {
                            message: 'New data written. Time of arrival:',
                            time: timeOfLastWrite
                        };
                        notificationObject['error:no-data'] = null;

                        io.emit('info:new-data', notificationObject['info:new-data']);
                    }, 20000);
                }
            }
        }
    });
};

function setIncomingTimeout(io) {
    incomingDataTimeout = setTimeout(function () {
        notificationObject['info:new-data'] = null;

        notificationObject['error:no-data'] = {
            message: 'No data received from the station. Last update: ',
            time: timeOfLastWrite
        };
        io.emit('error:no-data', notificationObject['error:no-data']);
    }, 1200000);
}


module.exports = dataManager;