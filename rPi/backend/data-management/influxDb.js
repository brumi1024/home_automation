'use strict';

const Influx = require('influx');

const influx = new Influx.InfluxDB({
    host: 'localhost',
    port: 8086,
    username: 'admin',
    password: 'sm4rth0m1',
    database: 'weather_outside',
    schema: [
        {
            measurement: 'weather_data',
            fields: {
                temperature: Influx.FieldType.FLOAT,
                pressure: Influx.FieldType.FLOAT,
                humidity: Influx.FieldType.FLOAT,
                uv_radiation: Influx.FieldType.FLOAT,
                uv_radiation_raw: Influx.FieldType.FLOAT
            },
            tags: [
                'location'
            ]
        }
    ]
});

influx.writeData = function (dataBuffer) {
    let measurement = {
        measurement: 'weather_data',
        tags: {location: 'home'},
        fields: {}
    };

    for (let i in dataBuffer) {
        measurement.fields[i] = parseFloat(dataBuffer[i]);
    }

    influx.writePoints([measurement]).then(() => {
        console.info(new Date().toLocaleString(), 'Point written successfully.');

    }).catch(err => {
        console.error(err);
    });
};

influx.readLastData = function () {
    return influx.query('select last(*) from weather_data')
        .then(result => {
            return result[0];
        })
        .catch(err => {
            console.error(err);
        });
};

influx.readThreeDayData = function (param, as = null) {
    let query = 'select ' + param;
    query += as ? ' as ' + as : '';
    query += ' from weather_data';
    return influx.query(query)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error(err);
        });
};

influx.readLongTermData = function (param, as = null) {
    let query = 'select ' + param;
    query += as ? ' as ' + as : '';
    query += ' from long_term.downsampled_weather_data';
    return influx.query(query)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error(err);
        });
};

module.exports = influx;