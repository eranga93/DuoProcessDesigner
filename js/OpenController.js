/* use strict */

app.controller('OpenController',['$scope','$mdDialog','$objectstore', function($scope,$mdDialog,$objectstore) {
    
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.open = function(data,event) {
        if(angular.isDefined(data)){
            var returnObj = {
                "data" : data,
                "event" : event
            }
            $mdDialog.hide(returnObj);
        }
    };
    
    $scope.getallProcessers = function(){
        
        $scope.processlist = [];
        var client = $objectstore.getClient("com.duosoftware.test","process_flows");
        client.onGetMany(function(data){
            if (data){
                console.log(data);
                $scope.processlist = data;
                document.getElementById("windowloading").style.display = "none";
            }
        });
        client.getByFiltering("*");
        
        /*$scope.processlist = [
            {"ID":"079e","Name":"Sample one","Description":"sample one which can take a very long sentance","JSONData":"{\"nodes\":[{\"blockId\":\"2f17\",\"nodedata\":{\"library_id\":0,\"schema_id\":\"2f17\",\"Name\":\"Start\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini/48/Cut-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[],\"Type\":\"start\",\"Category\":\"flowcontrol\",\"X\":\"425px\",\"Y\":\"45px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[{\"id\":\"ba72\",\"location\":\"BottomCenter\"}],\"TargetEndpoints\":[]}},{\"blockId\":\"55f0\",\"nodedata\":{\"library_id\":1,\"schema_id\":\"55f0\",\"Name\":\"Stop\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini/48/Faq-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[],\"Type\":\"stop\",\"Category\":\"flowcontrol\",\"X\":\"476px\",\"Y\":\"252px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[],\"TargetEndpoints\":[{\"id\":\"c06b\",\"location\":\"TopCenter\"}]}}],\"connections\":[{\"id\":\"con_25\",\"sourceId\":\"2f17\",\"targetId\":\"55f0\"}],\"ifconditions\":[]}"},
            {"ID":"28bd","Name":"Sample two","Description":"this is going to be another sample","JSONData":"{\"nodes\":[{\"blockId\":\"bb37\",\"nodedata\":{\"library_id\":0,\"schema_id\":\"bb37\",\"Name\":\"Start\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini/48/Cut-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[],\"Type\":\"start\",\"Category\":\"flowcontrol\",\"X\":\"503px\",\"Y\":\"37px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[{\"id\":\"8f14\",\"location\":\"BottomCenter\"}],\"TargetEndpoints\":[]}},{\"blockId\":\"2619\",\"nodedata\":{\"library_id\":1,\"schema_id\":\"2619\",\"Name\":\"Stop\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini/48/Faq-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[],\"Type\":\"stop\",\"Category\":\"flowcontrol\",\"X\":\"568px\",\"Y\":\"478px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[],\"TargetEndpoints\":[{\"id\":\"5c1b\",\"location\":\"TopCenter\"}]}},{\"blockId\":\"0015\",\"nodedata\":{\"library_id\":3,\"schema_id\":\"0015\",\"Name\":\"Global Variables\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini-2/48/Data-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[],\"Type\":\"global_variables\",\"Category\":\"flowcontrol\",\"X\":\"697px\",\"Y\":\"159px\",\"ControlEditDisabled\":false,\"SourceEndpoints\":[{\"id\":\"e05d\",\"location\":\"BottomCenter\"}],\"TargetEndpoints\":[{\"id\":\"d5fb\",\"location\":\"TopCenter\"}]}},{\"blockId\":\"d193\",\"nodedata\":{\"library_id\":2,\"schema_id\":\"d193\",\"Name\":\"If\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini/48/Add-fav-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[{\"Key\":\"ValueOne\",\"Value\":\"\",\"Type\":\"Textbox\"},{\"Key\":\"Condition\",\"Value\":\"\",\"Type\":\"Dropdown\"},{\"Key\":\"ValueTwo\",\"Value\":\"\",\"Type\":\"Textbox\"}],\"Type\":\"if\",\"Category\":\"flowcontrol\",\"X\":\"477px\",\"Y\":\"256px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[{\"id\":\"7a08\",\"location\":\"RightMiddle\"},{\"id\":\"d918\",\"location\":\"LeftMiddle\"}],\"TargetEndpoints\":[{\"id\":\"f9e2\",\"location\":\"TopCenter\"}]}},{\"blockId\":\"66d5\",\"nodedata\":{\"library_id\":8,\"schema_id\":\"66d5\",\"Name\":\"Message\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini-2/48/Data-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[{\"Key\":\"MessageBody\",\"Value\":\"\",\"Type\":\"Textbox\"}],\"Type\":\"defaultitem\",\"Category\":\"messaging\",\"X\":\"652px\",\"Y\":\"332px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[{\"id\":\"b245\",\"location\":\"BottomCenter\"}],\"TargetEndpoints\":[{\"id\":\"93f0\",\"location\":\"TopCenter\"}]}},{\"blockId\":\"622b\",\"nodedata\":{\"library_id\":8,\"schema_id\":\"622b\",\"Name\":\"Message\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini-2/48/Data-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[{\"Key\":\"MessageBody\",\"Value\":\"\",\"Type\":\"Textbox\"}],\"Type\":\"defaultitem\",\"Category\":\"messaging\",\"X\":\"401px\",\"Y\":\"380px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[{\"id\":\"192d\",\"location\":\"BottomCenter\"}],\"TargetEndpoints\":[{\"id\":\"3a58\",\"location\":\"TopCenter\"}]}}],\"connections\":[{\"id\":\"con_67\",\"sourceId\":\"bb37\",\"targetId\":\"0015\"},{\"id\":\"con_71\",\"sourceId\":\"0015\",\"targetId\":\"d193\"},{\"id\":\"con_75\",\"sourceId\":\"d193\",\"targetId\":\"66d5\"},{\"id\":\"con_79\",\"sourceId\":\"d193\",\"targetId\":\"622b\"},{\"id\":\"con_83\",\"sourceId\":\"622b\",\"targetId\":\"2619\"},{\"id\":\"con_87\",\"sourceId\":\"66d5\",\"targetId\":\"2619\"}],\"ifconditions\":[{\"id\":\"d193\",\"true\":\"66d5\",\"false\":\"622b\"}]}"}
        ];*/
    }
    $scope.getallProcessers();
}]);