(function () {
    'use strict';

    angular.module('app')
        .factory('mySocket', mySocket);

    mySocket.$inject = ['socketFactory', 'actualDataFactory', '$rootScope'];

    function mySocket(socketFactory, actualDataFactory, $rootScope) {
        var mySocket = socketFactory();

        mySocket.on('info:new-data', function (event) {
            actualDataFactory.reloadData().then(function () {
                $rootScope.$emit('new-data');
                $rootScope.$emit('new-data:notification', event);
            });
        });

        mySocket.on('error:no-data', function (event) {
            $rootScope.$emit('no-data:notification', event);
        });

        return mySocket;
    }
})
();
