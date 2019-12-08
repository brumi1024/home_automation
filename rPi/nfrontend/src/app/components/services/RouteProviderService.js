/**
 * Created by Benjamin on 10/18/2016.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('routeProviderService', [
            '$http',
            routeProviderService
        ]);

    function routeProviderService($http) {

        //--- ACCESS METHODS START

        function get(url, etag) {
            return getRoot('/api/' + url, etag);
        }

        function getRoot(url, etag) {

            var req = {
                method: 'GET',
                url: url
            };

            if (etag && etag != 1) {
                req.headers = {
                    'If-None-Match': etag,
                    'Cache-Control': 'none'
                }
            }

            return deliver(req, etag);
        }

        function post(url, body) {
            var req = {
                method: 'POST',
                url: '/api/' + url,
                data: JSON.stringify(body)
            };
            return deliver(req);
        }


        function remove(url) {
            var req = {
                method: 'DELETE',
                url: '/api/' + url
            };
            return deliver(req);
        }

        //--- ACCESS METHODS END

        //--- TOOL START

        function deliver(req, etag) {
            ml('URL= ' + req.url);
            ml('Method= ' + req.method);
            return $http(req).then(function (response) {
                    ml('Success= ' + response.status);
                    if (etag) {
                        return {
                            etag: response.headers('ETag'),
                            data: response.data
                        }
                    } else {
                        return response.data;
                    }
                },
                function (response) {
                    if (response.status == 304) {
                        ml('Success= 304');
                        return 304;
                    } else {
                        ml('Error= ' + response.status);
                        return response.data;
                    }
                });
        }

        function setHead(head, val) {
            $http.defaults.headers.common[head] = val;
        }

        //myLogger
        function ml(str) {
            console.log('RouteProvider: ' + str)
        }

        //--- TOOL END

        return {
            get: get,
            post: post,
            delete: remove,
            setHead: setHead
        }
    }

})();