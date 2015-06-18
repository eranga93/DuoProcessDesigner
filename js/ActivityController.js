/* use strict */

app.controller('ActivityController',['$scope', '$mdDialog','$mdToast','$objectstore', function($scope, $mdDialog,$mdToast,$objectstore) {
    
    $scope.activitylist = [];
    
    $scope.getallActivities = function(){
        $scope.activitylist = [];
        var client = $objectstore.getClient("com.duosoftware.test","process_activities");
        client.onGetMany(function(data){
            if (data){
                console.log(data);
                $scope.activitylist = data;
                document.getElementById("windowloading").style.display = "none";
            }
        });
        client.getByFiltering("*");
    }
    $scope.getallActivities();
    
    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.open = function(activity) {
        $scope.activity = activity;;
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
    
    $scope.update = function(event){
        console.log("update was clicked");
    };
    
    $scope.remove = function(event){
        console.log("remove was clicked");
    };
}]);