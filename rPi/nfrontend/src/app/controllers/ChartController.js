(function () {
    angular
        .module('app')
        .controller('HistogramController', HistogramController);

    HistogramController.$inject = ['$scope', 'actualDataFactory', '$rootScope'];

    function HistogramController($scope, actualDataFactory, $rootScope) {
        var vm = this;

        var mode = $scope.$parent.mode;
        vm.threeDayPeriod = true; // true: three days, false: long_term
        var longTermPrefix = {
            true: '',
            false: 'mean_mean_'
        };

        var chartType = {
            temperature: 'lineWithFocusChart',
            pressure: 'lineWithFocusChart',
            humidity: 'lineWithFocusChart'
        };

        var units = {
            temperature: '°C',
            pressure: 'hPa',
            humidity: '%'
        };

        var prefix = {
            temperature: 1,
            pressure: 100,
            humidity: 1
        };

        var color = {
            temperature: '#64bd63',
            pressure: '#5d8fc2',
            humidity: '#dd5826'
        };

        vm.chartOptions = {
            chart: {
                type: chartType[mode],
                height: 450,
                x: function (d) {
                    return d.x;
                },
                y: function (d) {
                    return d.y;
                },
                useInteractiveGuideline: true,
                xAxis: {
                    axisLabel: "Time",
                    tickFormat: function (d) {
                        return d3.time.format('%H:%M %x')(new Date(d))
                    },
                    showMaxMin: false,
                    staggerLabels: true,
                    axisLabelDistance: 10
                },
                x2Axis: {
                    tickFormat: function (d) {
                        return d3.time.format('%x')(new Date(d))
                    },
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: convertName(mode) + ' (' + units[mode] + ')',
                    tickFormat: function (d) {
                        return d3.format('.02f')(d);
                    }
                }
            }
        };

        activate();

        function activate() {
            loadData();

            $rootScope.$on('new-data', function() {
                loadData();
            });
        }

        vm.changePeriod = changePeriod;

        function loadData() {
            if (vm.threeDayPeriod) {
                actualDataFactory.getThreeDayChartData().then(function (data) {
                    callback(data)
                });
            } else {
                actualDataFactory.getLongTermChartData().then(function (data) {
                    callback(data)
                });
            }

        }

        function changePeriod() {
            loadData();
        }

        function convertName(string) {
            return string.substring(0, 1).toUpperCase() + string.substring(1);
        }

        function callback(data) {
            var values = data
                .filter(function (element) {
                    return (element[longTermPrefix[vm.threeDayPeriod] + mode] !== null);
                })
                .map(function (element) {
                    return {
                        x: Date.parse(element.time),
                        y: element[longTermPrefix[vm.threeDayPeriod] + mode] / prefix[mode]
                    };
                });

            vm.actualData = [{
                key: convertName(mode),
                color: color[mode],
                values: values
            }];
        }
    }
})();
