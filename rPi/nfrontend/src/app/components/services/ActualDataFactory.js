(function () {
    'use strict';

    angular.module('app')
        .factory('actualDataFactory', actualDataFactory);

    actualDataFactory.$inject = ['routeProviderService', '$q'];

    function actualDataFactory(routeProviderService, $q) {

        var actualData = loadActualData();
        var threeDayData = loadThreeDayChartData();
        var longTermData = loadLongTermChartData();

        function reloadData() {
            var promises = [];

            actualData = loadActualData();
            threeDayData = loadThreeDayChartData();
            longTermData = loadLongTermChartData();

            promises.push(actualData);
            promises.push(threeDayData);
            promises.push(longTermData);

            return $q.all(promises);
        }

        function loadActualData() {
            return routeProviderService.get('actual-data')
                .then(function (response) {
                    if (response) {
                        var data = {};
                        response.forEach(function (element) {
                            if (element.length === 1) {
                                for (var i in element[0]) {
                                    if (i !== 'time') {
                                        data[i] = {
                                            time: element[0].time,
                                            value: element[0][i]
                                        };
                                    }
                                }
                            } else {
                                for (var j in element) {
                                    if (j !== 'time') {
                                        data[j] = {
                                            time: element.time,
                                            value: element[j]
                                        };
                                    }
                                }
                            }
                        });
                        return data;
                    }
                });
        }

        function loadThreeDayChartData() {
            return routeProviderService.get('recent-chart-data')
                .then(function (response) {
                    if (response) {
                        return response;
                    }
                });
        }

        function loadLongTermChartData() {
            return routeProviderService.get('long-term-chart-data')
                .then(function (response) {
                    if (response) {
                        return response;
                    }
                });
        }


        return {
            getActualData: function () {
                return actualData;
            },

            getThreeDayChartData: function () {
                return threeDayData;
            },

            getLongTermChartData: function () {
                return longTermData;
            },

            reloadData: reloadData
        };
    }
})
();
