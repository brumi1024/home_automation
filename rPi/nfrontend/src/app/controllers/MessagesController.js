(function () {

    angular
        .module('app')
        .controller('MessagesController', MessagesController);

    MessagesController.$inject = ['$rootScope'];

    function MessagesController($rootScope) {
        var vm = this;

        vm.notifications = [];
        vm.errors = [];

        activate();

        function activate() {
            $rootScope.$on('new-data:notification', function (event, data) {
                vm.notifications = [{
                    icon: '/assets/images/info-outline.png',
                    subject: 'Sensor notification',
                    location: 'Weather-Station Red box',
                    text: data.message + ' ' + data.time
                }];
            });

            $rootScope.$on('no-data:notification', function (event, data) {
                vm.errors = [{
                    icon: '/assets/images/error.png',
                    subject: 'Sensor error',
                    location: 'Weather-Station Red box',
                    text: data.message + ' ' + data.time
                }];
            });
        }
    }

})();
