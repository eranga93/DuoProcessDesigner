/* use strict */

app.directive('demoDirective', function($compile) {
    return {
      template: '<div></div>',
      replace: true,
      scope:{
            variableobj :'='
      },
      link: function(scope, element) {
      	var variable = scope.variableobj;
        var el = angular.element('<div/>');
        switch(variable.Type) {
          case 'checkbox':
            el.append('<input type="checkbox" ng-model="input.checked"/>');
            break;
          case 'Textbox':
            el.append('<input class="variableValue" type="text" ng-model="variable.Value" value="{{variable.Value}}"/>');
            break;
          case 'Dropdown':
            el.append('<input class="variableValue" type="text" ng-model="variable.Value"/>');
            break;
        }
        $compile(el)(scope);
        element.append(el);
      }
    }
  });