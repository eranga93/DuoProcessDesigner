/* use strict */

app.controller('PublishController', ['$scope', '$mdDialog', '$objectstore', function ($scope, $mdDialog, $objectstore) {

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.open = function (data, event) {
        if (angular.isDefined(data)) {
            var returnObj = {
                "data": data,
                "event": event
            }
            $mdDialog.hide(returnObj);
        }
    };
}]);