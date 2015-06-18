/* use strict */

app.directive('variableControl', function($compile,$templateCache) {
    return {
        restrict: 'E',
        scope:{
            variableobj :'='
        },
        link: function($scope, element, attrs)
        {
            $scope.cntIfCondtions = [
                { label: '==', value: '==' },
                { label: '!=', value: '!=' },
                { label: '>', value: '>' },
                { label: '<', value: '<' },
                { label: '<=', value: '<=' },
                { label: '>=', value: '>=' }
            ];

            var htmlText = '';    
            var htmlrow = '';

            for (var j = 0; j < $scope.variableobj.Variables.length; j++)
            {
                var variable = $scope.variableobj.Variables[j];
                
                var openrow = '<div class="valiableitem">';
                var closerow = '</div>';
                
                var key = '<div class="varibaleKey">'+variable.Key+'</div>';
                
                var closebutton = '<md-button class="closeBtn"><ng-md-icon icon="cancel" size="15" ng-hide="'+$scope.variableobj.ControlEditDisabled+'" ng-click="removePair(variable)"></ng-md-icon></md-button>';
                
                var dynamicControl;
                if(variable.Type == "Textbox")
                {
                    dynamicControl = '<input class="variableValue" type="text" ng-change="changed(variable)" ng-model="variable.'+variable.Key+'" value="'+variable.Value+'"" />';
                    
                }
                if(variable.Type == "Dropdown")
                {
                    dynamicControl = '<input class="variableValue" type="text" ng-change="changed(variable)" ng-model="variable.'+variable.Key+'" value="'+variable.Value+'"" />';
                    
                }
                /*if(variable.Type == "Dropdown")
                {
                    dynamicControl = document.createElement("select");
                    dynamicControl.setAttribute("class","variableValue");
                    dynamicControl.setAttribute("ng-model","variable."+variable.Key);
                    dynamicControl.setAttribute("ng-change","changed(variable)");
                    for (var i = 0; i < $scope.cntIfCondtions.length; i++)
                    {
                        var option = document.createElement("option");
                        option.value = $scope.cntIfCondtions[i].label;
                        option.text = $scope.cntIfCondtions[i].label;
                        dynamicControl.appendChild(option);
                        //stringVariableBuild+= '<option value="'+$scope.cntIfCondtions[i].value+'">'+$scope.cntIfCondtions[i].label+'</option>';
                    }
                    //htmlText = '<select class="variableValue" ng-model="variable.Value">'+ stringVariableBuild + '</select>';    
                }*/
                
                htmlrow += openrow + key + closebutton + dynamicControl + closerow;
            }

            //element.replaceWith($compile(htmlrow)($scope));

            
            //$compile(htmlrow)($scope);
            //element.append(htmlrow);

            element.html(htmlrow).show();
            //$compile(element.contents())($scope);
            
















            /*var htmlText = '';    
            var divcontainer = document.createElement("div");

            for (var j = 0; j < $scope.variableobj.Variables.length; j++)
            {
                var variable = $scope.variableobj.Variables[j];
                
                var row = document.createElement("div");
                row.setAttribute("class","valiableitem");
                
                var key = document.createElement("div");
                key.setAttribute("class","varibaleKey");
                key.innerHTML=variable.Key;
                
                var closebutton = document.createElement("md-button");
                closebutton.setAttribute("class","closeBtn");
                closebutton.innerHTML='<ng-md-icon icon="cancel" size="15" ng-hide="'+$scope.variableobj.ControlEditDisabled+'" ng-click="removePair(variable)"></ng-md-icon>';
                
                var dynamicControl;
                if(variable.Type == "Textbox")
                {
                    dynamicControl = document.createElement("input");
                    dynamicControl.setAttribute("class","variableValue");
                    dynamicControl.setAttribute("type","text");
                    dynamicControl.setAttribute("ng-model","variable."+variable.Key);
                    dynamicControl.setAttribute("ng-change","changed(variable)");
                    dynamicControl.value= variable.Value;
                    
                    //htmlText = "<input class='variableValue' type='text' ng-model='variable.Value' value='{{variable.Value}}' />";
                    //$templateCache.put('txtbox', "<input class='variableValue' type='text' ng-model='variable.Value' value='{{variable.Value}}");
                }
                if(variable.Type == "Dropdown")
                {
                    dynamicControl = document.createElement("select");
                    dynamicControl.setAttribute("class","variableValue");
                    dynamicControl.setAttribute("ng-model","variable."+variable.Key);
                    dynamicControl.setAttribute("ng-change","changed(variable)");
                    for (var i = 0; i < $scope.cntIfCondtions.length; i++)
                    {
                        var option = document.createElement("option");
                        option.value = $scope.cntIfCondtions[i].label;
                        option.text = $scope.cntIfCondtions[i].label;
                        dynamicControl.appendChild(option);
                        //stringVariableBuild+= '<option value="'+$scope.cntIfCondtions[i].value+'">'+$scope.cntIfCondtions[i].label+'</option>';
                    }
                    //htmlText = '<select class="variableValue" ng-model="variable.Value">'+ stringVariableBuild + '</select>';    
                }
                
                row.appendChild(key);
                row.appendChild(closebutton);
                row.appendChild(dynamicControl);
                divcontainer.appendChild(row);
            }

            //element.replaceWith($compile(divcontainer)($scope));
            //element.replaceWith(htmlText);
            
            //$compile(divcontainer)($scope);
            //element.append(divcontainer);

            element.html(divcontainer).show();
            $compile(element.contents())($scope);*/
            
            $scope.changed = function(variable){
                var broadcastObj = {
                    "schema_id" : $scope.variableobj.schema_id,
                    "data" : variable
                };
                $scope.$emit("propertyUpdated",broadcastObj);
                console.log("Broadcasting: " ,broadcastObj);
            };
        }
    }
});