/* use strict */

//directives link user interactions with $scope behaviours
//now we extend html with <div plumb-item>, we can define a template <> to replace it with "proper" html, or we can 
//replace it with something more sophisticated, e.g. setting jsPlumb arguments and attach it to a double-click 
//event
app.directive('plumbItem', function($compile,$mdDialog) {
    return {
        restrict:'E',
        scope:{
            module:'='
        },
        replace:true,
        controller: 'mainController',
        link: function ($scope, element, attrs) {
            console.log("Add plumbing for the 'item' element");
            
            //var uuid = $scope.createuuid();
            
            jsPlumb.setId(element,$scope.module.schema_id);
            
            jsPlumb.draggable(element, {
                containment: "parent"
            });
            
            //jsPlumb.draggable(jsPlumb.getSelector(".container .item"), { grid: [20, 20] });	
            //var connectiontypeObj = [ "Flowchart", { stub:[20, 30], gap:3, cornerRadius:5, alwaysRespectStubs:true } ];
            var connectiontypeObj = [ "Straight", { stub:[20, 30], gap:3 } ];
            //var connectiontypeObj = [ "StateMachine", { curviness:600, margin:20, proximityLimit:90 } ];
            //var connectiontypeObj = [ "Bezier ", { curviness:60 } ];
            
            
            var getIfStyle = function(id){
              var controlstyle;
              
              if(id==0)
              {
                controlstyle = {
                	endpoint:"Dot",
                	paintStyle:{ 
                		strokeStyle:"#7AB02C",
                		fillStyle:"transparent",
                		radius:7,
                		lineWidth:3 
                	},				
                	isSource:true,
                	connector:connectiontypeObj,								                
                	connectorStyle:connectorPaintStyle,
                	hoverPaintStyle:endpointHoverStyle,
                	connectorHoverStyle:connectorHoverStyle,
                  dragOptions:{},
                  overlays:[
                  	[ "Label", { 
                      	location:[1.5, 1.5], 
                      	label:"True",
                      	cssClass:"endpointSourceLabel" 
                      } ]
                  ]
                };
              }
              
              if(id==1)
              {
                controlstyle = {
                	endpoint:"Dot",
                	paintStyle:{ 
                		strokeStyle:"#7AB02C",
                		fillStyle:"transparent",
                		radius:7,
                		lineWidth:3 
                	},				
                	isSource:true,
                	connector:connectiontypeObj,
                	connectorStyle:connectorPaintStyle,
                	hoverPaintStyle:endpointHoverStyle,
                	connectorHoverStyle:connectorHoverStyle,
                  dragOptions:{},
                  overlays:[
                  	[ "Label", { 
                      	location:[-0.5, 1.5], 
                      	label:"False",
                      	cssClass:"endpointSourceLabel" 
                      } ]
                  ]
                };
              }
              
              return controlstyle;
            }
            
            var endpointHoverStyle = {
            	fillStyle:"#22A7F0",
            	strokeStyle:"#22A7F0"
            };
            
            var connectorHoverStyle = {
            	lineWidth:4,
            	strokeStyle:"#216477",
            	outlineWidth:2,
            	outlineColor:"white"
            }
            
            var connectorPaintStyle = {
            	lineWidth:4,
            	strokeStyle:"#61B7CF",
            	joinstyle:"round",
            	outlineColor:"white",
            	outlineWidth:2
            }
            
            var defaultStyleSource = {
            	endpoint:"Dot",
            	paintStyle:{ 
            		strokeStyle:"#7AB02C",
            		fillStyle:"transparent",
            		radius:7,
            		lineWidth:3 
            	},				
            	isSource:true,
            	connector:connectiontypeObj,
            	connectorStyle:connectorPaintStyle,
            	hoverPaintStyle:endpointHoverStyle,
            	connectorHoverStyle:connectorHoverStyle,
              dragOptions:{},
            };
            
            var defaultStyleTarget = {
            	endpoint:"Dot",					
            	paintStyle:{ fillStyle:"#7AB02C",radius:11 },
            	hoverPaintStyle:endpointHoverStyle,
            	maxConnections:-1,
            	dropOptions:{ hoverClass:"hover", activeClass:"active" },
            	isTarget:true
            };
            
            for (var i = 0; i < $scope.module.SourceEndpoints.length; i++)
            {
              if($scope.module.library_id == 2)
              {
                jsPlumb.addEndpoint(element,getIfStyle(i),{ anchor:$scope.module.SourceEndpoints[i], uuid: $scope.createuuid()});	
              }
              else
              {
                jsPlumb.addEndpoint(element,defaultStyleSource,{ anchor:$scope.module.SourceEndpoints[i], uuid: $scope.createuuid() });	
              }
            }
            for (var j = 0; j < $scope.module.TargetEndpoints.length; j++)
            {
            	jsPlumb.addEndpoint(element,defaultStyleTarget,{ anchor:$scope.module.TargetEndpoints[j], uuid: $scope.createuuid()});	
            }

            // this should actually done by a AngularJS template and subsequently a controller attached to the dbl-click event
            element.bind('dblclick', function(e) {
              
              var endpoints = jsPlumb.getEndpoints($(this).attr('id'));
              
              var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .content('The selected control will be removed. Are you sure you want to continue?')
                .ariaLabel('Lucky day')
                .ok('Remove it!')
                .cancel('OMG! No')
                .targetEvent(e);
                
               $mdDialog.show(confirm).then(function() {
                 
                for (var j = 0; j < endpoints.length; j++)
                {
                	jsPlumb.deleteEndpoint(endpoints[j]);
                }
                
                jsPlumb.detachAllConnections($(this));
                $(this).remove();
                // stop event propagation, so it does not directly generate a new state
                e.stopPropagation();
                //we need the $scope of the parent, here assuming <plumb-item> is part of the <plumbApp>         
                $scope.$parent.removeState(attrs.identifier);
                //$scope.$parent.$digest();
                
                $scope.showToast("Control removed successfully.");
                
              }, function() {
                
              });
            });
            
            $compile(element.contents())($scope);
            //jsPlumb.repaintEverything();
        }
    };
});