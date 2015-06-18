/* use strict */

app.controller('SaveController',['$scope','$mdDialog', function($scope,$mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.publish = function(){
        console.log("Publish button was clicked.");
    }
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.save = function(data,event) {
        if(angular.isDefined(data)){
            var returnObj = {
                "data" : data,
                "event" : event
            }
            $mdDialog.hide(returnObj);
        }
    };
}]);