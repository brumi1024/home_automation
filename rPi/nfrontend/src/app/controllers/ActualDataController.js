(function () {
    angular
        .module('app')
        .controller('ActualDataController', ActualDataController);

    ActualDataController.$inject = ['$scope', 'actualDataFactory', '$rootScope'];

    function ActualDataController($scope, actualDataFactory, $rootScope) {
        var vm = this;

        vm.actualData = {};
        vm.mode = $scope.$parent.mode;
        vm.units = {
            temperature: '°C',
            pressure: '<span class="long-unit">hPa</span>',
            humidity: '%',
            uv_radiation: '<span class="long-unit"><sup>mW</sup>&frasl;<sub>cm<sup>2</sup></sub></span>'
        };
        vm.prefix = {
            temperature: 1,
            pressure: 100,
            humidity: 1,
            uv_radiation: 1
        };

        activate();

        function activate() {
            loadData();
            $rootScope.$on('new-data', function() {
                loadData();
            });
        }

        function loadData() {
            actualDataFactory.getActualData().then(function (data) {
                vm.actualData = data;
            });
        }
    }
})();
