'use strict';

const express = require('express');
const promisedRoutes = require('promised-routes');
const router = express.Router();
const influx = require('../data-management/influxDb');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

/* GET actual data. */
router.get('/actual-data', promisedRoutes.json(function () {
    let promises = [];

    promises.push(influx.readLastData());
    promises.push(influx.readThreeDayData('max(temperature)', 'max_temperature'));
    promises.push(influx.readThreeDayData('min(temperature)', 'min_temperature'));
    promises.push(influx.readThreeDayData('max(pressure)', 'max_pressure'));
    promises.push(influx.readThreeDayData('min(pressure)', 'min_pressure'));
    promises.push(influx.readThreeDayData('max(humidity)', 'max_humidity'));
    promises.push(influx.readThreeDayData('min(humidity)', 'min_humidity'));
    promises.push(influx.readThreeDayData('max(uv_radiation)', 'max_uv_radiation'));
    promises.push(influx.readThreeDayData('min(uv_radiation)', 'min_uv_radiation'));

    return Promise.all(promises).then(promises => {
        return promises;
    });
}));

router.get('/recent-chart-data', promisedRoutes.json(function () {
    return influx.readThreeDayData('*');
}));

router.get('/long-term-chart-data', promisedRoutes.json(function () {
    return influx.readLongTermData('*');
}));

module.exports = router;
