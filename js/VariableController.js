/* use strict */

app.controller('VariableController',['$scope','$mdDialog', function($scope,$mdDialog) {
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
    
    $scope.clearPair = function(pair)
    {
        pair.Key = "";
        pair.Value = "";
    }
}]);