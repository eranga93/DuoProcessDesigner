/* use strict */

var app = angular.module('processdesigner', [
  'ui.router',
  'ngMaterial',
  'ngMdIcons',
  'ngAnimate',
  'ngScrollbars',
  'uiMicrokernel'
  ]);

app.controller('mainController', ['$scope', '$rootScope', '$http', '$mdDialog', '$mdToast', '$animate', '$mdBottomSheet', '$objectstore', '$mdSidenav', 'dataHandler', '$state','$interval', function ($scope, $rootScope, $http, $mdDialog, $mdToast, $animate, $mdBottomSheet, $objectstore, $mdSidenav, dataHandler, $state,$interval) {

    function module(library_id, schema_id, parentView, name, description, x, y, icon, variables, type, category, controldisabled, endpoints, targetendpoints, otherdata) {
        this.library_id = library_id,
            this.schema_id = schema_id,
            this.parentView = parentView,
            this.Name = name,
            this.Icon = icon,
            this.Description = description,
            this.Variables = variables,
            this.Type = type,
            this.Category = category,
            this.X = x,
            this.Y = y,
            this.ControlEditDisabled = controldisabled,
            this.SourceEndpoints = endpoints,
            this.TargetEndpoints = targetendpoints,
            this.OtherData = otherdata
    }

    $scope.currentstate = "";
    $scope.allowAddManualConnections = true;
    $scope.allowDetachManualConnections = true;

    $scope.changeState = function (Tostate) {
        var currentState = $state.current.name;
        if (Tostate != currentState) {
            var setdata = $scope.getSaveJsonForState(currentState);
            $scope.allowDetachManualConnections = false;
            jsPlumb.reset();
            $scope.jsplumbInitiate();
            $scope.allowDetachManualConnections = true;
            if (setdata != null) {
                dataHandler.setFlowObject(setdata);
            }
            $state.transitionTo(Tostate);
        }
    };

    $scope.$on('uiStateChanged', function (event, data) {
        if (dataHandler.getCurrentState() != data.stateName) {
            dataHandler.setCurrentState(data.stateName);
            console.log('Broadcast recived:', data);
            $scope.getFlowDataForState($state.current.name);
        }
    });

    $scope.getSaveJsonForState = function (state) {

        var nodes = [];

        var statenodes = dataHandler.getNodesForState(state);
        $.each(statenodes, function (idx, elem) {
            var element = document.getElementById(elem.schema_id);
            var endpoints = jsPlumb.getEndpoints(element);
            elem.X = element.style.left.substring(0, element.style.left.length - 2);
            elem.Y = element.style.top.substring(0, element.style.top.length - 2);

            //var posX = elem.nodedata.X.substring(0, elem.nodedata.X.length - 2);
            //var posY = elem.nodedata.Y.substring(0, elem.nodedata.Y.length - 2);
            nodes.push(elem);
        });

        var plumbConnections = dataHandler.getConnectionsForState(state);

        var flowChart = {};
        flowChart.nodes = nodes;
        flowChart.connections = plumbConnections;

        return flowChart;
    };

    $scope.getTargetEndpointUUID = function (id) {
        var returnValue = "";
        var endpoints = jsPlumb.getEndpoints(id);
        $.each(endpoints, function (idx, conendpnt) {
            if (conendpnt.anchor.type == "TopCenter") {
                returnValue = conendpnt.getUuid();
            }
        });
        return returnValue;
    };
    
    $scope.ShowBusyContainer = function(message){
        document.getElementById("loading").style.display = "flex";
        var element = document.getElementById("busycontent");
        element.innerHTML = "<p>"+message+"</p>";
    }
    
    $scope.HideBusyContainer = function(){
        document.getElementById("loading").style.display = "none";
    }

    $scope.processConnections = function () {
        var plumbConnections = dataHandler.getConnectionsForState($state.current.name);
        $.each(plumbConnections, function (idx, connection) {
            var sourcemoduleObj = dataHandler.getModuleByID(connection.sourceId);
            var targetmoduleObj = dataHandler.getModuleByID(connection.targetId);
            var sourceUUID = "",
                targetUUID = "";

            if (sourcemoduleObj.library_id == "2") {
                var data = $.inArray(connection.sourceId, $scope.GlobalExecutedIfs);
                if (data == -1) {

                    var ifcondition = $scope.getIfConditionByID(connection.sourceId);
                    var sourceUUIDleft = dataHandler.getEndpointsForItem(connection.sourceId, "source", "left");
                    $scope.addConnection(connection.id, connection.sourceId, connection.targetId, sourceUUIDleft, ifcondition.falseUUID);

                    var sourceUUIDright = dataHandler.getEndpointsForItem(connection.sourceId, "source", "right");
                    $scope.addConnection(connection.id, connection.sourceId, connection.targetId, sourceUUIDright, ifcondition.trueUUID);
                    $scope.GlobalExecutedIfs.push(connection.sourceId);

                }
            } else {
                sourceUUID = dataHandler.getEndpointsForItem(connection.sourceId, "source", "default");
                targetUUID = dataHandler.getEndpointsForItem(connection.targetId, "target", "default");

                $scope.addConnection(connection.id, connection.sourceId, connection.targetId, sourceUUID, targetUUID);
            }
        });
    }

    $scope.addConnection = function (connectionid, sourceId, targetId, sourceUUID, targetUUID) {
        var connObj = {
            id: connectionid,
            sourceId: sourceId,
            targetId: targetId,
            sourceUUID: sourceUUID,
            targetUUID: targetUUID,
            parentView: $state.current.name
        };
        dataHandler.addtoConnections(connObj);
    }

    $scope.getIfConditionByID = function (id) {
        var returnObj;
        for (var i = 0; i < GlobalIfConditions.length; i++) {
            if (GlobalIfConditions[i].id == id) {
                returnObj = GlobalIfConditions[i];
                break;
            }
        }
        return returnObj;
    };

    $scope.testMethod = function (text) {
        var obj = dataHandler.sayHello(text);
        alert(obj.name);
    }

    $scope.changeserviceData = function (text) {
        var obj = dataHandler.changeData(text);
        alert(obj.name);
    }

    $scope.addDynamicState = function () {
        /*app.stateProvider.state('other', {
                url: "/other",
                templateUrl: "partials/drawbox.html"
            });*/
        alert("internal function called.");
    }

    $scope.scrollbarconfig = {
        autoHideScrollbar: false,
        theme: 'minimal-dark',
        advanced: {
            updateOnContentResize: true
        },
        scrollInertia: 300
    }

    $('#era').mCustomScrollbar({
        theme:"dark-3"
    });

    $scope.displayToolbox = true;
    $scope.loadedProcessObj = null;
    $scope.library = [];
    $scope.library_uuid = 0;
    $scope.schema_uuid = 0;
    $scope.library_topleft = {
        x: 15,
        y: 145,
        item_height: 50,
        margin: 5,
    };

    $scope.module_css = {
        width: 150,
        height: 100, // actually variable
    };

    $scope.activitylist = [];
    $scope.userlist = [];

    $scope.pmbendpoints = [];

    $scope.GlobalConnections = [];
    $scope.GlobalIfConditions = [];
    $scope.GlobalExecutedIfs = [];

    $scope.connectiontypeObj = ["Flowchart", {
        stub: [20, 30],
        gap: 3,
        cornerRadius: 5,
        alwaysRespectStubs: true
    }];
    //$scope.connectiontypeObj = [ "Straight", { stub:[20, 30], gap:3 } ];
    //$scope.connectiontypeObj = [ "StateMachine", { curviness:600, margin:20, proximityLimit:90 } ];
    //$scope.connectiontypeObj = [ "Bezier ", { curviness:60 } ];


    $scope.data = {
        selectedIndex: 0,
        secondLocked: true,
        secondLabel: "Item Two"
    };
    $scope.next = function () {
        $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
    };
    $scope.previous = function () {
        $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };


    $scope.getIfStyle = function (id) {
        var controlstyle;

        if (id == 0) {
            controlstyle = {
                endpoint: "Dot",
                paintStyle: {
                    strokeStyle: "grey",
                    fillStyle: "transparent",
                    radius: 7,
                    lineWidth: 3
                },
                isSource: true,
                connector: $scope.connectiontypeObj,
                connectorStyle: $scope.connectorPaintStyle,
                hoverPaintStyle: $scope.endpointHoverStyle,
                connectorHoverStyle: $scope.connectorHoverStyle,
                dragOptions: {},
                overlays: [
            ["Label", {
                        location: [1.5, 1.5],
                        label: "True",
                        cssClass: "endpointSourceLabel"
              }]
          ]
            };
        }

        if (id == 1) {
            controlstyle = {
                endpoint: "Dot",
                paintStyle: {
                    strokeStyle: "grey",
                    fillStyle: "transparent",
                    radius: 7,
                    lineWidth: 3
                },
                isSource: true,
                connector: $scope.connectiontypeObj,
                connectorStyle: $scope.connectorPaintStyle,
                hoverPaintStyle: $scope.endpointHoverStyle,
                connectorHoverStyle: $scope.connectorHoverStyle,
                dragOptions: {},
                overlays: [
            ["Label", {
                        location: [-0.5, 1.5],
                        label: "False",
                        cssClass: "endpointSourceLabel"
              }]
          ]
            };
        }

        return controlstyle;
    };

    $scope.endpointHoverStyle = {
        fillStyle: "#22A7F0",
        strokeStyle: "#22A7F0"
    };

    $scope.connectorHoverStyle = {
        lineWidth: 4,
        strokeStyle: "#61B7CF",
        outlineWidth: 2,
        outlineColor: "white"
    };

    $scope.connectorPaintStyle = {
        lineWidth: 2,
        strokeStyle: "grey",
        joinstyle: "round",
        outlineColor: "white",
        outlineWidth: 2
    };

    $scope.defaultStyleSource = {
        endpoint: "Dot",
        paintStyle: {
            strokeStyle: "grey",
            fillStyle: "transparent",
            radius: 7,
            lineWidth: 3
        },
        isSource: true,
        connector: $scope.connectiontypeObj,
        connectorStyle: $scope.connectorPaintStyle,
        hoverPaintStyle: $scope.endpointHoverStyle,
        connectorHoverStyle: $scope.connectorHoverStyle,
        dragOptions: {},
    };

    $scope.defaultStyleTarget = {
        endpoint: "Dot",
        paintStyle: {
            fillStyle: "grey",
            radius: 11
        },
        hoverPaintStyle: $scope.endpointHoverStyle,
        maxConnections: -1,
        dropOptions: {
            hoverClass: "hover",
            activeClass: "active"
        },
        isTarget: true
    };

    $scope.selectedModule = null;

    $scope.redraw = function () {
        console.log("-- Redraw function executed");
        $scope.schema_uuid = 0;
        jsPlumb.detachEveryConnection();
        dataHandler.resetFactory();
        $scope.library = [];
        $scope.activitylist = [];
        $scope.userlist = [];

        $http({
            url: "./json/controldata.json",
            dataType: "json",
            method: "GET",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
                "Content-Type": "text/json"
            }
        }).success(
            function (response) {
                console.log("");
                console.log("Control JSON Received : ");
                console.log(response);

                for (var i = 0; i < response.Controls.length; i++) {
                    $scope.addModuleToLibrary(response.Controls[i]);
                }
            }).error(function (e) {
            console.log(e);
        });

        $scope.getallActivities();
        //$scope.getallUsers();
    };

    $scope.getallActivities = function () {
        $scope.activitylist = null;
        var client = $objectstore.getClient("com.duosoftware.test", "process_activities");
        client.onGetMany(function (data) {
            if (data) {
                console.log("");
                console.log("Activity JSON Received : ");
                console.log(data);
                $scope.activitylist = data;
            }
        });
        client.getByFiltering("*");
    }

    /*$scope.getallUsers = function () {
        $scope.userlist = null;
        var templist = [];
        var client = $objectstore.getClient("com.duosoftware.auth", "users", true);
        client.onGetMany(function (data) {
            if (data) {
                console.log("");
                console.log("User JSON Received : ");
                console.log(data);

                $.each(data, function (idx, user) {
                    if (user.UserID != "" && user.Name != "") {
                        var schema_id = $scope.createuuid();
                        var control = {
                            "library_id": user.UserID,
                            "Name": user.Name,
                            "Description": user.EmailAddress,
                            "Icon": "person",
                            "Variables": [],
                            "Type": "user",
                            "Category": "flowcontrol",
                            "ControlEditDisabled": false,
                            "SourceEndpoints": [{
                                "id": 0,
                                "location": "BottomCenter"
                            }],
                            "TargetEndpoints": [{
                                "id": 0,
                                "location": "TopCenter"
                            }],
                            "OtherData": {}
                        }
                        var m = $scope.createNewModule(schema_id, 0, 0, control, $state.current.name);
                        templist.push(m);
                    }
                });
                $scope.userlist = templist;
            }
        });
        client.getByFiltering("*");
    }*/

    // add a module to the library
    $scope.addModuleToLibrary = function (module) {
        //console.log("Add module " + module.Name + " to library, at position " + module.X + "," + module.Y + ", variables: " + module.Variables.length + " Type: " + module.Type);
        var library_id = $scope.library_uuid++;
        var schema_id = -1;
        module.schema_id = schema_id;
        $scope.library.push(module);
    };

    // add a module to the schema
    $scope.addModuleToSchema = function (library_id, posX, posY) {
        var schema_id = $scope.createuuid();
        var control;
        for (var i = 0; i < $scope.library.length; i++) {
            if ($scope.library[i].library_id == library_id) {
                control = angular.copy($scope.library[i]);
                break;
            }
        }
        if (angular.isUndefined(control)) {
            for (var i = 0; i < $scope.activitylist.length; i++) {
                if ($scope.activitylist[i].library_id == library_id) {
                    control = angular.copy($scope.activitylist[i]);
                }
            }
        }
        var m = $scope.createNewModule(schema_id, posX, posY, control, $state.current.name);
        dataHandler.addtoNodes(m);
    };

    $scope.addModuletoUI = function (library_id, posX, posY, data, jsPlumbInstance, loadingType) {

        var schema_id;
        var control;

        if (loadingType == "external") {
            schema_id = data.schema_id;
            control = data;
        } else if (loadingType == "internal") {
            schema_id = $scope.createuuid();
            for (var i = 0; i < $scope.library.length; i++) {
                if ($scope.library[i].library_id == library_id) {
                    control = angular.copy($scope.library[i]);
                    break;
                }
            }
            if (angular.isUndefined(control)) {
                for (var i = 0; i < $scope.activitylist.length; i++) {
                    if ($scope.activitylist[i].library_id == library_id) {
                        control = angular.copy($scope.activitylist[i]);
                        break;
                    }
                }
                for (var i = 0; i < $scope.userlist.length; i++) {
                    if ($scope.userlist[i].library_id == library_id) {
                        control = angular.copy($scope.userlist[i]);
                        break;
                    }
                }
            }
        }

        var output = document.getElementById('container');
        var element = document.createElement("div");
        var eleTitle = document.createElement("div");
        
        var eleIcon = document.createElement("ng-md-icon");
        
        var eleTrue = document.createElement("div");
        var eleFalse = document.createElement("div");
        var eleForeach = document.createElement("div");

        element.setAttribute("id", schema_id);
        element.setAttribute("class", "item " + control.Type);
        element.setAttribute("style", "left:10px ; top: 10px");
        
        eleIcon.setAttribute("icon",control.Icon);

        eleTitle.setAttribute("class", "title");
        eleTitle.innerHTML = control.Name;

        if (control.library_id == "2") {
            var truesideUUID = "";
            var falsesideUUID = "";
            if (control.OtherData.TrueStateUUID != "" && control.OtherData.FalseStateUUID != "") {
                truesideUUID = control.OtherData.TrueStateUUID;
                falsesideUUID = control.OtherData.FalseStateUUID;
            } else {
                truesideUUID = $scope.createuuid();
                falsesideUUID = $scope.createuuid();
                control.OtherData.TrueStateUUID = truesideUUID;
                control.OtherData.FalseStateUUID = falsesideUUID;
            }
            dataHandler.addState(truesideUUID, $state);
            dataHandler.addState(falsesideUUID, $state);

            var ifconnectionObj = {
                id: schema_id,
                "true": truesideUUID,
                "false": falsesideUUID
            };
            dataHandler.addtoIfConnections(ifconnectionObj);

            eleTrue.setAttribute("id", truesideUUID);
            eleTrue.setAttribute("class", "connect");

            eleFalse.setAttribute("id", falsesideUUID);
            eleFalse.setAttribute("class", "connect");

            element.appendChild(eleFalse);
            element.appendChild(eleTitle);
            element.appendChild(eleTrue);

            $(eleTrue).bind('click', moduleObj, function (event) {
                $scope.changeState(truesideUUID);
            });

            $(eleFalse).bind('click', moduleObj, function (event) {
                $scope.changeState(falsesideUUID);
            });
        } else if (control.library_id == "5") {
            var foreachUUID = "";
            if (control.OtherData.ForeachUUID != "") {
                foreachUUID = control.OtherData.ForeachUUID;
            } else {
                foreachUUID = $scope.createuuid();
                control.OtherData.ForeachUUID = foreachUUID;
            }

            dataHandler.addState(foreachUUID, $state);
            eleForeach.setAttribute("id", foreachUUID);
            eleForeach.setAttribute("class", "connect");

            element.appendChild(eleTitle);
            element.appendChild(eleForeach);

            $(eleForeach).bind('click', moduleObj, function (event) {
                $scope.changeState(foreachUUID);
            });

            var forloop = {
                id: schema_id,
                "forloopState": foreachUUID,
            };
            dataHandler.addtoForloop(forloop);

        } else {
            element.appendChild(eleIcon);
            element.appendChild(eleTitle);
        }

        output.appendChild(element);

        var tempObj = document.getElementById(schema_id);
        var newX = posX; // - (tempObj.offsetWidth / 2);
        var newY = posY; // - (tempObj.offsetHeight / 2);
        tempObj.setAttribute("style", "left:" + newX + "px ; top: " + newY + "px");
        //jsPlumb.setId(element,schema_id);

        jsPlumbInstance.draggable(element, {
            containment: "parent"
        });

        //jsPlumb.draggable(jsPlumb.getSelector(".container .item"), { grid: [20, 20] });	


        for (var i = 0; i < control.SourceEndpoints.length; i++) {
            var sourceEndpointID;
            if (control.SourceEndpoints[i].id == 0) {
                sourceEndpointID = $scope.createuuid();
                control.SourceEndpoints[i].id = sourceEndpointID;
            }
            jsPlumbInstance.addEndpoint(element, $scope.defaultStyleSource, {
                anchor: control.SourceEndpoints[i].location,
                uuid: control.SourceEndpoints[i].id
            });
        }
        for (var j = 0; j < control.TargetEndpoints.length; j++) {
            var targetEndpointID;
            if (control.TargetEndpoints[j].id == 0) {
                targetEndpointID = $scope.createuuid();
                control.TargetEndpoints[j].id = targetEndpointID;
            }
            jsPlumbInstance.addEndpoint(element, $scope.defaultStyleTarget, {
                anchor: control.TargetEndpoints[j].location,
                uuid: control.TargetEndpoints[j].id
            });
        }

        var moduleObj;
        if (loadingType == "internal") {
            moduleObj = $scope.createNewModule(schema_id, posX, posY, control, $state.current.name);
            dataHandler.addtoNodes(moduleObj);
        } else {
            moduleObj = control;
        }
        $(element).bind('click', moduleObj, function (event) {
            $scope.openModule(moduleObj);
        });

    };

    $scope.addConnectionToUI = function (event, connection, loadType) {

        if (loadType == "auto") {
            jsPlumb.connect({
                id: connection.id,
                uuids: [connection.sourceUUID, connection.targetUUID]
            });
        } else if (loadType == "manual") {
            var connection = event.connection;
            var type = event.connection.getType();
            var sourcemoduleObj = dataHandler.getModuleByID(connection.sourceId);
            var targetmoduleObj = dataHandler.getModuleByID(connection.targetId);
            var sourceUUID = "",
                targetUUID = "";

            /*if (sourcemoduleObj.library_id == "2") {
                var ifcondition = $scope.getIfConditionByID(connection.sourceId);
                var sourceUUIDleft = dataHandler.getEndpointsForItem(connection.sourceId, "source", "left");
                $scope.addConnection(connection.id, connection.sourceId, connection.targetId, sourceUUIDleft, ifcondition.falseUUID);

                var sourceUUIDright = dataHandler.getEndpointsForItem(connection.sourceId, "source", "right");
                $scope.addConnection(connection.id, connection.sourceId, connection.targetId, sourceUUIDright, ifcondition.trueUUID);
                $scope.GlobalExecutedIfs.push(connection.sourceId);
            } else {
                
            }*/

            sourceUUID = dataHandler.getEndpointsForItem(connection.sourceId, "source", "default");
            targetUUID = dataHandler.getEndpointsForItem(connection.targetId, "target", "default");

            $scope.addConnection(connection.id, connection.sourceId, connection.targetId, sourceUUID, targetUUID);
        }
    };

    $scope.removeControl = function (selectedModule, event) {
        var endpoints = jsPlumb.getEndpoints(selectedModule.schema_id);

        var confirm = $mdDialog.confirm()
            .title('Are you sure?')
            .content('The "' + selectedModule.Name + '" control will be removed with its data. Are you sure you want to continue?')
            .ariaLabel('Lucky day')
            .ok('Remove it!')
            .cancel('OMG! No')
            .targetEvent(event);

        $mdDialog.show(confirm).then(function () {

            for (var j = 0; j < endpoints.length; j++) {
                jsPlumb.deleteEndpoint(endpoints[j]);
            }

            jsPlumb.detachAllConnections(selectedModule.schema_id);

            var elem = document.getElementById(selectedModule.schema_id);
            elem.remove();
            dataHandler.removeFromSchema(selectedModule);
            $scope.selectedModule = null;
            $mdSidenav('right').close()
                .then(function () {
                    console.log("close LEFT is done");
                });

            // stop event propagation, so it does not directly generate a new state
            event.stopPropagation();

            $scope.showToast("Control removed.");
            console.log("control removed.");

        }, function () {

        });
    };

    $scope.createNewModule = function (schema_id, posX, posY, control, parentView) {
        var m = new module(
            control.library_id,
            schema_id,
            parentView,
            control.Name,
            control.Description,
            posX,
            posY,
            control.Icon,
            control.Variables,
            control.Type,
            control.Category,
            control.ControlEditDisabled,
            control.SourceEndpoints,
            control.TargetEndpoints,
            control.OtherData
        );
        return m;
    }

    $scope.jsplumbInitiate = function () {
        jsPlumb.importDefaults({
            // default drag options
            DragOptions: {
                cursor: 'pointer'
            },
            // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
            // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
            ConnectionOverlays: [
         ["Arrow", {
                    location: 1
                }]
        ],
            Container: "container"
        });

        console.log("Set up jsPlumb listeners (should be only done once)");
        jsPlumb.bind("connection", function (info) {
            if ($scope.allowAddManualConnections) {


            }
            console.log(info);
            $scope.addConnectionToUI(info, {}, "manual");
        });

        jsPlumb.bind("connectionDetached", function (info) {
            if ($scope.allowDetachManualConnections) {
                //alert("connection detached.");
                console.log(info);
                dataHandler.removeConnection(info.connection);
            }
        });
    }

    // the initiateing method of the application
    $scope.init = function () {
            $scope.initiateApp();
            $scope.redraw();
            jsPlumb.bind("ready", function () {
                $scope.jsplumbInitiate();
                $interval(function () {
                    
                }, 1000);
                $scope.HideBusyContainer();
            });
    }

    $scope.initiateApp = function () {
        if ($scope.IsinIframe() == true) {
            console.log("App running mode : Inside IFrame");
        } else {
            console.log("App running mode : External");
            var logoutObj = {
                link: '',
                title: 'Logout',
                icon: 'exit_to_app'
            }
            $scope.admin.push(logoutObj);
            $scope.validateLogin();
        }
        console.log("");
    }

    $scope.IsinIframe = function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    $scope.validateLogin = function () {
        //sessionStorage.setItem("LoggedUser","shehanproductions@ymail.com");
        //sessionStorage.removeItem("LoggedUser");
        var session = sessionStorage.getItem("LoggedUser");
        if (session != null) {
            console.log("user logged in");
            $scope.showToast("Welcome back " + sessionStorage.getItem("LoggedUser") + "");
        } else {
            console.log("user not logged in. Redirecting to login page.");
            window.location = "login.html";
        }
    }

    $scope.ZoomIn = function () {
        var ZoomInValue = parseInt(document.getElementById("container").style.zoom) + 10 + '%'
        document.getElementById("container").style.zoom = ZoomInValue;
        return false;
    }

    $scope.ZoomOut = function () {
        var ZoomOutValue = parseInt(document.getElementById("container").style.zoom) - 10 + '%'
        document.getElementById("container").style.zoom = ZoomOutValue;
        return false;
    }

    $scope.Zoomorg = function () {
        var ZoomOutValue = parseInt(100) + '%'
        document.getElementById("container").style.zoom = ZoomOutValue;
        return false;
    }

    $scope.openBox = function () {
        var left = document.getElementById("toolboxControl").style.left;
        if(left == ""){
            document.getElementById("toolboxControl").style.left = "0px";
        }
        else if(left == "-350px"){
            document.getElementById("toolboxControl").style.left = "0px";
        }
        else if(left == "0px"){
            document.getElementById("toolboxControl").style.left = "-350px";
        }
    }

    $scope.closeBox = function () {
        document.getElementById("toolboxControl").style.left = "-350px";
    }

    $scope.openModule = function (module) {
        if (angular.isDefined(module)) {
            $scope.$apply(function () {
                if (module.Name == "Start" || module.Name == "Stop") {
                    $scope.tabdata.selectedIndex = 1;
                    $scope.tabdata.propertiesLocked = true;
                    $scope.tabdata.manageLocked = false;
                } else {
                    $scope.tabdata.selectedIndex = 0;
                    $scope.tabdata.propertiesLocked = false;
                    $scope.tabdata.manageLocked = false;
                }

                $scope.selectedModule = null;
                $scope.selectedModule = angular.fromJson(module);
            });
            $mdSidenav('right').toggle()
                .then(function () {
                    console.log("toggle RIGHT is done");
                });
            console.log("Element clicked : ", module);
        }
    }

    $scope.$on('propertyUpdated', function (event, data) {
        console.log('Broadcast recived:', data);
        dataHandler.updateCollectionData(data);
    });

    $scope.insertPairToObject = function (newPair, event) {
        if (angular.isDefined(newPair)) {
            if (angular.isDefined($scope.selectedModule) && $scope.selectedModule != null) {
                console.log("New Pair added : ", newPair);
                $scope.selectedModule.Variables.push({
                    Key: newPair.Key,
                    Value: newPair.Value,
                    Type: "Textbox"
                });
                newPair.Key = "";
                newPair.Value = "";
            } else {
                $scope.showAlert(event, "Please select a control module to insert data.", "Opps..");
            }
        } else {
            $scope.showAlert(event, "Please fill the above fields before inserting.", "Opps..");
        }
    }


    $scope.closeVariableWindow = function (pair) {
        $scope.clearPair(pair);
        $scope.hideVariableDialog();
    }

    $scope.removePair = function (pair) {
        var index = $scope.selectedModule.Variables.indexOf(pair)
        $scope.selectedModule.Variables.splice(index, 1);
        console.log("The following variable removed : ", pair);
    }

    $scope.clearVariables = function (ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure?')
            .content('All of the variables will be removed. Are you sure you want to continue?')
            .ariaLabel('Lucky day')
            .ok('Yes Please!')
            .cancel('OMG! No')
            .targetEvent(ev);

        $mdDialog.show(confirm).then(function () {
            $scope.selectedModule.Variables = [];
            console.log("Variable list cleared.");
            $scope.showToast("Variable list cleared.");
        }, function () {

        });
    }

    $scope.execute = function (event) {
        if ($scope.validateCanvas()) {
            $scope.saveFlowchart(event);
        }
    }

    $scope.validateCanvas = function () {
        console.log("Validate method executed.");
        return true;
    }

    $scope.jsonObjtoLoad = {
        "ID": "079e",
        "Name": "Sample one",
        "Description": "sample one which can take a very long sentance",
        "JSONData": "{\"nodes\":[{\"blockId\":\"2f17\",\"nodedata\":{\"library_id\":0,\"schema_id\":\"2f17\",\"Name\":\"Start\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini/48/Cut-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[],\"Type\":\"start\",\"Category\":\"flowcontrol\",\"X\":\"425px\",\"Y\":\"45px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[{\"id\":\"ba72\",\"location\":\"BottomCenter\"}],\"TargetEndpoints\":[]}},{\"blockId\":\"55f0\",\"nodedata\":{\"library_id\":1,\"schema_id\":\"55f0\",\"Name\":\"Stop\",\"Icon\":\"http://icons.iconarchive.com/icons/custom-icon-design/mini/48/Faq-icon.png\",\"Description\":\"this is a test description\",\"Variables\":[],\"Type\":\"stop\",\"Category\":\"flowcontrol\",\"X\":\"476px\",\"Y\":\"252px\",\"ControlEditDisabled\":true,\"SourceEndpoints\":[],\"TargetEndpoints\":[{\"id\":\"c06b\",\"location\":\"TopCenter\"}]}}],\"connections\":[{\"id\":\"con_25\",\"sourceId\":\"2f17\",\"targetId\":\"55f0\"}],\"ifconditions\":[]}"
    };

    $scope.getFlowDataForState = function (stateName) {
        // get objects which is regarding to the statename and return the object
        var nodes = dataHandler.getNodesForState(stateName);
        var connections = dataHandler.getConnectionsForState(stateName);
        var data = {
            JSONData: {
                "nodes": nodes,
                "connections": connections
            }
        }
        $scope.loadFlowchart(data);

    }

    $scope.loadFlowchart = function (data) {
        console.log("Loaded JSON data :", JSON.stringify(data.JSONData));
        var output = document.getElementById('container');
        output.innerHTML = "";
        //$scope.loadedProcessObj = data;
        var flowChartJson = data.JSONData;
        var flowChart = angular.fromJson(flowChartJson);
        var nodes = flowChart.nodes;
        var connections = flowChart.connections;

        $.each(nodes, function (index, elem) {
            //var posX = elem.nodedata.X.substring(0, elem.nodedata.X.length - 2);
            //var posY = elem.nodedata.Y.substring(0, elem.nodedata.Y.length - 2);

            var posX = elem.X;
            var posY = elem.Y;

            $scope.addModuletoUI(elem.library_id, posX, posY, elem, jsPlumb, "external");
        });

        // $scope.allowAddManualConnections = false;
        $.each(connections, function (index, elem) {
            $scope.addConnectionToUI({}, elem, "auto");
        });
        //$scope.allowAddManualConnections = true;
        /*if (nodes.length > 0) {
            $scope.showToast("Process design loaded successfully.");
        }*/
        $scope.HideBusyContainer();
    }

    $scope.clearFlowChart = function (ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure mate?')
            .content('All the content on the canvas will be removed. cannot revert this action once done!')
            .ariaLabel('Lucky day')
            .ok('Please do it!')
            .cancel('OMG! No')
            .targetEvent(ev);

        $mdDialog.show(confirm).then(function () {
            $scope.clearcanvas();
            $scope.showToast("Reset successful.");
        }, function () {

        });
    };

    $scope.clearcanvas = function () {
        dataHandler.resetFactory();
        $scope.allowDetachManualConnections = false;
        jsPlumb.reset();
        $scope.jsplumbInitiate();
        var output = document.getElementById('container');
        output.innerHTML = "";
        $scope.selectedModule = null;
        $scope.closeBox();
        $scope.loadedProcessObj = null;
        $scope.allowDetachManualConnections = true;
        // clear all method should be added to factory
    }

    $scope.showAlert = function (ev, message, title) {
        $mdDialog.show(
            $mdDialog.alert()
            .title(title)
            .content(message)
            .ariaLabel('Password notification')
            .ok('Got it!')
            .targetEvent(ev)
        );
    };

    $scope.showDialog = function (ev, message, title) {
        $mdDialog.show({
             controller: DialogController,
              templateUrl: 'partials/publish_success.html',
               parent: angular.element(document.body),
              targetEvent: ev,
              locals : {
                    message : message
                }
        });
    };

function DialogController($scope, $mdDialog, message) {
    $scope.message = message;
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
};

    $scope.showToast = function (message) {
        $mdToast.show(
            $mdToast.simple()
            .content(message)
            .position("bottom right")
            .hideDelay(3000)
        );
    };

    $scope.createuuid = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };

    $scope.publishProcessDesign = function (saveObject, event) {

        /*var saveObject = {
            "ID": $scope.loadedProcessObj.ID,
            "Name": $scope.loadedProcessObj.Name,
            "Description": $scope.loadedProcessObj.Description,
            "JSONData": flowChartJson
        }*/
        //$scope.loadedProcessObj = saveObject;
        var flowChartJson = JSON.stringify(saveObject.JSONData);
        var flowname = saveObject.Name;
        flowname = flowname.replace(' ', '');
        var URL = "http://192.168.1.194:8093/BuildFlow/";
        var actualURL = URL + flowChartJson + "/" + flowname + "/1234";

        $http.get(actualURL).
        success(function (data, status, headers, config) {
            if (data.Status) {
                $scope.showDialog(event, data.Message, "Success!!");
            } else {
                $scope.showAlert(event, data.Message, "Opps..");
            }
            $scope.HideBusyContainer();
            /*$mdDialog.show(
                $mdDialog.alert()
                .title("More Details")
                .content(data.Message)
                .ok('Got it!')
                .targetEvent(event)
            );*/
        }).
        error(function (data, status, headers, config) {
            $scope.showToast("Opps.. There was an error");
            console.log("");
            console.log(data);
            console.log("..........");
            console.log(status);
            console.log("..........");
            console.log(headers);
            console.log("..........");
            console.log(config);
            console.log("");
            $scope.HideBusyContainer();
        });

        console.log("Starting flow publish..");
        console.log(JSON.stringify(flowChartJson));
        console.log("");
    };

    $scope.showAdvancedMessage = function (ev) {
        $mdDialog.show({
                controller: 'MessageController',
                templateUrl: './partials/dialog-template.html',
                targetEvent: ev,
            })
            .then(function (answer) {
                $scope.alert = 'You said the information was "' + answer + '".';
            }, function () {
                $scope.alert = 'You cancelled the dialog.';
            });
    };

    $scope.showActivityWindow = function (ev) {
        $mdDialog.show({
                controller: 'ActivityController',
                templateUrl: './partials/manage-activity-template.html',
                targetEvent: ev,
            })
            .then(function (saveEvent) {
                $scope.ShowBusyContainer("Saving activitiy details");
                $scope.saveActivity(saveEvent);
            }, function () {

            });
    };

    $scope.showOpenWindow = function (ev) {
        $mdDialog.show({
                controller: 'OpenController',
                templateUrl: './partials/open-template.html',
                targetEvent: ev,
            })
            .then(function (open) {
                var element = document.getElementById("container");
                if (element.childNodes.length == 0) {
                    $scope.ShowBusyContainer("Opening workflow to your environment");
                    $scope.loadedProcessObj = open.data;
                    dataHandler.setFlowObject(open.data.JSONData);
                    $scope.getFlowDataForState($state.current.name);
                } else {
                    var confirm = $mdDialog.confirm()
                        .title('Are you sure?')
                        .content('Opening this process will clear out the canvas. Are you sure you want to continue?')
                        .ariaLabel('Lucky day')
                        .ok('Please do it!')
                        .cancel('OMG! No')
                        .targetEvent(ev);

                    $mdDialog.show(confirm).then(function () {
                        $scope.clearcanvas();
                        $scope.loadedProcessObj = open.data;
                        dataHandler.setFlowObject(open.data.JSONData);
                        $scope.getFlowDataForState($state.current.name);
                        //$scope.loadFlowchart(open.data);
                    }, function () {

                    });
                }
            }, function () {
                // call the function which should call after the window is closed.
            });
    };

    $scope.showSaveWindow = function (ev, mode) {

        if ($scope.loadedProcessObj != null) {
            $scope.updateFlowchart(ev, mode);
        } else {
            $mdDialog.show({
                    controller: 'SaveController',
                    templateUrl: './partials/save-template.html',
                    targetEvent: ev,
                })
                .then(function (saveEvent) {
                    $scope.ShowBusyContainer("Saving workflow, hold on a minute");
                    $scope.saveNewFlowchart(saveEvent, mode, ev);
                }, function () {

                });
        }
    };

    $scope.showPublishWindow = function (ev) {
        $mdDialog.show({
                controller: 'PublishController',
                templateUrl: './partials/publish-template.html',
                targetEvent: ev,
            })
            .then(function (open) {
                $scope.ShowBusyContainer("Publishing workflow, hold on a minute");
                console.log(open);
                var processcode = open.data.code;
                var flowChartJson = dataHandler.getSaveJson();
                var flowID = "";
                var flowname = "";
                var flowdescription = "";
                if ($scope.loadedProcessObj == null) {
                    flowID = $scope.createuuid();
                    flowname = "TempPublish_" + $scope.createuuid();
                    flowdescription = "Temp flow which is not being saved.";
                } else {
                    flowID = $scope.loadedProcessObj.ID;
                    flowname = $scope.loadedProcessObj.Name;
                    flowdescription = $scope.loadedProcessObj.Description;
                }

                var saveObject = {
                    "ID": $scope.createuuid(),
                    "Name": flowname,
                    "Description": flowdescription,
                    "JSONData": flowChartJson
                }
                $scope.publishProcessDesign(saveObject, ev);

                var processMapping = {
                    "ID": $scope.createuuid(),
                    "ProcessCode": processcode,
                    "WorkflowID": flowID
                }
                $scope.sendMappingToObjectStore(processMapping, ev);
            }, function () {
                // call the function which should call after the window is closed.
            });
    };

    $scope.saveNewFlowchart = function (saveevent, mode, event) {
        console.log("");
        console.log("Saving chart..");

        var flowChartJson = dataHandler.getSaveJson();

        var saveObject = {
            "ID": $scope.createuuid(),
            "Name": saveevent.data.name,
            "Description": saveevent.data.description,
            "JSONData": flowChartJson
        }

        if (angular.isDefined(parent.codiad)) {
            parent.codiad.editor.setContent(saveObject);
            $scope.showToast("Successfully exported to DevStudio.");
        } else {
            $scope.sendProcessToObjectStore(saveObject, mode, event);
        }
        console.log(JSON.stringify(saveObject));
    }

    $scope.updateFlowchart = function (saveevent, mode) {
        console.log("");
        console.log("Updating chart..");
        var flowChartJson = dataHandler.getSaveJson();

        var saveObject = {
            "ID": $scope.loadedProcessObj.ID,
            "Name": $scope.loadedProcessObj.Name,
            "Description": $scope.loadedProcessObj.Description,
            "JSONData": flowChartJson
        }

        if (angular.isDefined(parent.codiad)) {
            parent.codiad.editor.setContent(saveObject);
            $scope.showToast("Successfully exported to DevStudio.");
        } else {
            $scope.updateProcessInObjectStore(saveObject, mode, saveevent);
        }
        console.log(JSON.stringify(saveObject));
    };


    $scope.sendProcessToObjectStore = function (saveObj, mode, event) {
        var client = $objectstore.getClient("com.duosoftware.test", "process_flows");
        client.onComplete(function (data) {
            $scope.HideBusyContainer();
            $scope.loadedProcessObj = saveObj;
            $scope.showToast("Successfully saved in Objectstore.");
            if (mode == "save") {
                $scope.clearcanvas();
            }
            if (mode == "publish") {
                $scope.publishProcessDesign(saveObj, event);
            }
        });
        client.onError(function (data) {
            $scope.showToast("Oppss. There was an error storing in objectstore.");
        });
        client.insert([saveObj], {
            KeyProperty: "ID"
        });
    }

    $scope.updateProcessInObjectStore = function (saveObj, mode, event) {
        var client = $objectstore.getClient("com.duosoftware.test", "process_flows");
        client.onComplete(function (data) {
            $scope.showToast("Successfully updated in Objectstore.");
            if (mode == "publish") {
                $scope.publishProcessDesign(saveObj, event);
            }
        });
        client.onError(function (data) {
            $scope.showToast("Oppss. There was an error storing in objectstore.");
        });
        client.update([saveObj], {
            KeyProperty: "ID"
        });
    }

    $scope.sendMappingToObjectStore = function (saveObj, event) {
        var client = $objectstore.getClient("com.duosoftware.test", "process_mapping");
        client.onComplete(function (data) {
            $scope.showToast("Workflow mapped to the given processcode.");
        });
        client.onError(function (data) {
            $scope.showToast("Oppss. There was an error storing in objectstore.");
        });
        client.insert([saveObj], {
            KeyProperty: "ID"
        });
    }

    $scope.saveActivity = function (saveevent) {

        console.log("");
        console.log("Saving activity...");
        if (angular.isDefined(saveevent)) {
            var saveObj = new module(
                $scope.createuuid(),
                0,
                'default',
                saveevent.data.Name,
                saveevent.data.Description,
                0,
                0,
                'extension', [],
                'activity',
                'activity',
                true, [{
                    "id": 0,
                    "location": "BottomCenter"
                }], [{
                    "id": 0,
                    "location": "TopCenter"
                }], {}
            );
            console.log(saveObj);

            $scope.sendActivityToObjectStore(saveObj);
        } else {
            $scope.showAlert(saveevent.event, "Please fill the activity details before inserting.", "Opps..");
            $scope.HideBusyContainer();
        }
    };

    $scope.sendActivityToObjectStore = function (saveObj) {
        var client = $objectstore.getClient("com.duosoftware.test", "process_activities");
        client.onComplete(function (data) {
            $scope.HideBusyContainer();
            $scope.showToast("Successfully saved in Objectstore.");
            $scope.getallActivities();
        });
        client.onError(function (data) {
            $scope.HideBusyContainer();
            $scope.showToast("Oppss. There was an error storing in objectstore.");
        });
        client.insert([saveObj], {
            KeyProperty: "library_id"
        });
    };

    $scope.showAddVariableWindow = function (ev) {

        $mdDialog.show({
                controller: 'VariableController',
                templateUrl: './partials/add-variable-template.html',
                targetEvent: ev,
            })
            .then(function (saveEvent) {
                $scope.insertPairToObject(saveEvent.data, saveEvent.event);
            }, function () {

            });
    };

    $scope.logoutUser = function () {
        sessionStorage.removeItem("LoggedUser");
        window.location = "index.html";
    }

    $scope.menu = [
        {
            link: '',
            title: 'Toolbar',
            icon: 'create'
    },
        {
            link: '',
            title: 'Back to Drawboard',
            icon: 'navigate_before'
    },
        {
            link: '',
            title: 'Reset',
            icon: 'clear'
    },
        {
            link: '',
            title: 'Activities',
            icon: 'swap_vert_circle'
    }
  ];
    $scope.admin = [
        {
            link: '',
            title: 'Save',
            icon: 'save'
    },
        {
            link: '',
            title: 'Open',
            icon: 'folder_open'
    },
        {
            link: '',
            title: 'Publish',
            icon: 'launch'
    },
        {
            link: '',
            title: 'Settings',
            icon: 'settings'
    },
        {
            link: '',
            title: 'Help',
            icon: 'help'
    }
  ];

    $scope.mainMenuClick = function ($index, $event) {
        var clickedItem = $scope.menu[$index];
        if (clickedItem.title == "Toolbar") {
            $scope.openBox();
        } else if (clickedItem.title == "Reset") {
            $scope.clearFlowChart($event);
        } else if (clickedItem.title == "Activities") {
            $scope.showActivityWindow($event);
        } else if (clickedItem.title == "Back to Drawboard") {
            $scope.changeState('drawboard');
        }
    }

    $scope.adminMenuClick = function ($index, $event) {
        var clickedItem = $scope.admin[$index];
        if (clickedItem.title == "Save") {
            $scope.showSaveWindow($event, "save");
        } else if (clickedItem.title == "Publish") {
            $scope.showPublishWindow($event);
        } else if (clickedItem.title == "Open") {
            $scope.showOpenWindow($event);
        } else if (clickedItem.title == "Logout") {
            $scope.logoutUser();
        }
    }
}]);


app.directive('postRender', ['$timeout', function ($timeout) {
    var def = {
        restrict: 'A',
        terminal: true,
        transclude: true,
        link: function ($scope, element, attrs) {
            $timeout($scope.redraw, 0); //Calling a $scoped method
        }
    };
    return def;
}]);





//
// This directive should allow an element to be dragged onto the main canvas. Then after it is dropped, it should be
// painted again on its original position, and the full module should be displayed on the dragged to location.
//
app.directive('plumbMenuItem', function () {
    return {
        replace: true,
        controller: 'mainController',
        link: function ($scope, element, attrs) {
            //console.log("Add plumbing for the 'menu-item' element");

            // jsPlumb uses the containment from the underlying library, in our case that is jQuery.

            jsPlumb.draggable(element, {
                containment: "parent"
            });
        }
    };
});

app.directive('droppable', function ($compile) {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {


            element.droppable({
                drop: function (event, ui) {
                    console.log("Make this element droppable");
                    // angular uses angular.element to get jQuery element, subsequently data() of jQuery is used to get
                    // the data-identifier attribute
                    var dragIndex = angular.element(ui.draggable).data('identifier'),
                        dragEl = angular.element(ui.draggable),
                        dropEl = angular.element(this);

                    // if dragged item has class menu-item and dropped div has class drop-container, add module 
                    if (dragEl.hasClass('menu-item') && dropEl.hasClass('container')) {
                        console.log("Drag event on " + dragIndex);
                        $scope.addModuletoUI(dragIndex, event.pageX, event.pageY, {}, jsPlumb, "internal");
                    }
                    /*$scope.$apply();*/
                }
            });
        }
    };
});

app.directive('draggable', function () {
    return {
        // A = attribute, E = Element, C = Class and M = HTML Comment
        restrict: 'A',
        //The link function is responsible for registering DOM listeners as well as updating the DOM.
        link: function ($scope, element, attrs) {
            //console.log("Let draggable item snap back to previous position");
            element.draggable({
                // let it go back to its original position
                revert: true,
            });
        }
    };
}); // Code goes here
