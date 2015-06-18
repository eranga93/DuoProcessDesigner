var loginpage = angular.module("diginLogin", ['ngMaterial', 'ngAnimate']);

loginpage.controller("LoginCtrl", ['$scope', '$rootScope', '$location', '$window', function ($scope, $rootScope, $location, $window) {

    $scope.errorDiv = true;
    $scope.errorMsg = '';
    $scope.currentUser = '';
    $scope.password = '';

    $scope.login = function () {
        $rootScope.currentUser = $scope.currentUser;

        if ($scope.currentUser == '') {
            $scope.errorDiv = false;
            $scope.errorMsg = 'username cannot be empty';
        } else if ($scope.password == '') {
            $scope.errorDiv = false;
            $scope.errorMsg = 'password cannot be empty';
        } else if ($scope.currentUser == 'admin' && $scope.password == 'admin') {
            $scope.errorDiv = true;
            sessionStorage.setItem("LoggedUser",$scope.currentUser);
            window.location = "index.html";            
        } else {
            $scope.errorDiv = false;
            $scope.errorMsg = 'username or password is incorrect';
        }

    }
    $scope.go = function (path) {
        $location.path("/Home");
    };

    $scope.enter = function (keyEvent) {
        if (keyEvent.which === 13) {
            $scope.login();
        }
    }
}]);

loginpage.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('orange');
});