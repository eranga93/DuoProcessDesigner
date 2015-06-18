/* use strict */

app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$provide',
        function (stateProvider, urlRouterProvider, httpProvider, provide) {
            app.stateProvider = stateProvider;
            app.urlRouterProvider = urlRouterProvider;
            
            app.urlRouterProvider.otherwise("/drawboard");
            app.stateProvider.state('drawboard', {
                url: "/drawboard"
            });
            app.stateProvider.state('login', {
                url: "/login"
            });
            /*app.stateProvider.state('other', {
                url: "/other"
            });*/
        }
]).run(function($rootScope,$state) { 
    $rootScope
        .$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams){ 
                console.log("State Change: State change success!");
                $rootScope.$broadcast('uiStateChanged', { stateName : $state.current.name });
        });
});

