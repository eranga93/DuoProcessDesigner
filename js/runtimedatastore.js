/* use strict */

app.factory('dataHandler', function(){
    
    var GlobalNodes = [];
    var GlobalConnections = [];
    var GlobalIfConditions = [];
    var GlobalForloops = [];
    var currentState = "";
    
    function CheckIfAllReadyExists_node(schema_id){
        var flag = false;
        for (var i = 0; i < GlobalNodes.length; i++) 
        {
            if (GlobalNodes[i].schema_id == schema_id) {
                flag = true;
                GlobalNodes.splice(i, 1);
                break;
            }
        }
        return flag;
    };
    
    function CheckIfAllReadyExists_connection(connection){
        var flag = false;
        for (var i = 0; i < GlobalConnections.length; i++) 
        {
            if (GlobalConnections[i].sourceId == connection.sourceId && GlobalConnections[i].targetId == connection.targetId) {
                flag = true;
                GlobalConnections.splice(i, 1);
            }
        }
        return flag;
    };
    
    function CheckIfAllReadyExists_ifconnection(id){
        var flag = false;
        for (var i = 0; i < GlobalIfConditions.length; i++) 
        {
            if (GlobalIfConditions[i].id == id) {
                flag = true;
            }
        }
        return flag;
    };
    
    function RemoveGlobalNode(schema_id){
        for (var i = 0; i < GlobalNodes.length; i++) 
        {
            if (GlobalNodes[i].schema_id == schema_id) {
                GlobalNodes.splice(i, 1);
                break;
            }
        }
    };
    
    function RemoveGlobalConnection(id){
        for (var i = 0; i < GlobalConnections.length; i++) 
        {
            if (GlobalConnections[i].id == id) {
                GlobalConnections.splice(i, 1);
            }
        }
    };
    
    function RemoveGlobalIfConnection(id){
        for (var i = 0; i < GlobalIfConditions.length; i++) 
        {
            if (GlobalIfConditions[i].id == id) {
                GlobalIfConditions.splice(i, 1);
            }
        }
    };
    
    function CheckIfAllReadyExists_state(URL,states){
        var flag = false;
        for (var i = 0; i < states.length; i++) 
        {
            if (states[i].name == URL) {
                flag = true;
            }
        }
        return flag;
    };
    
    return {
        setCurrentState: function(text){
            currentState = text;
        },
        getCurrentState: function(){
            return currentState;
        },
        getSaveJson: function(){
            var flowChart = {};
            flowChart.nodes = GlobalNodes;
            flowChart.connections = GlobalConnections;
            flowChart.ifconditions = GlobalIfConditions;
            flowChart.forloops = GlobalForloops;
            return flowChart;
        },
        setFlowObject: function(savedata){
            // add the nodes, connections and if conditions to the factory global variable. if already exists the schema_id remove it and add it again.
            $.each(savedata.nodes, function (idx, node) {
                if(CheckIfAllReadyExists_node(node.schema_id)){
                    //RemoveGlobalNode(node.schema_idh);
                    GlobalNodes.push(node);
                }
                else{
                    GlobalNodes.push(node);
                }
            });
            $.each(savedata.connections, function (idx, con) {
                if(CheckIfAllReadyExists_connection(con)){
                    //RemoveGlobalConnection(con.id);
                    GlobalConnections.push(con);
                }
                else{
                    GlobalConnections.push(con);
                }
            });
        },
        addtoNodes: function(data){
            if(!CheckIfAllReadyExists_node(data.id)){
                GlobalNodes.push(data);
            }
            else{
                GlobalNodes.push(data);
            }
        },
        addtoConnections: function(data){
            if(!CheckIfAllReadyExists_connection(data)){
                GlobalConnections.push(data);
            }
            else{
                GlobalConnections.push(data);
            }
        },
        removeConnection: function(data){
            for (var i = 0; i < GlobalConnections.length; i++) 
            {
                if (GlobalConnections[i].sourceId == data.sourceId && GlobalConnections[i].targetId == data.targetId) {
                    GlobalConnections.splice(i, 1);
                    break;
                }
            }
        },
        addtoIfConnections: function(data){
            if(CheckIfAllReadyExists_ifconnection(data.id)){
                RemoveGlobalIfConnection(data.id);
                GlobalIfConditions.push(data);
            }
            else{
                GlobalIfConditions.push(data);
            }
        },
        addtoForloop: function(data){
            GlobalForloops.push(data);
        },
        resetFactory: function(){
            GlobalNodes = [];
            GlobalConnections = [];
            GlobalIfConditions = [];
            GlobalForloops = [];
        },
        removeFromSchema: function (module) {
            console.log("Remove state " + module.schema_id + " in array of length " + GlobalNodes.length);
            for (var i = 0; i < GlobalNodes.length; i++) {
                if (GlobalNodes[i].schema_id == module.schema_id) {
                    GlobalNodes.splice(i, 1);
                    break;
                }
            }
            if(module.library_id = "2"){
                for (var i = 0; i < GlobalIfConditions.length; i++) {
                    if (GlobalIfConditions[i].id == module.schema_id) {
                        GlobalIfConditions.splice(i, 1);
                        break;
                    }
                }
            }
            if(module.library_id = "5"){
                for (var i = 0; i < GlobalForloops.length; i++) {
                    if (GlobalForloops[i].id == module.schema_id) {
                        GlobalForloops.splice(i, 1);
                        break;
                    }
                }
            }
            console.log("Remove state at position " + i);
        },
        updateCollectionData: function (data) {
            var module;
            for (var i = 0; i < GlobalNodes.length; i++) {
                if (GlobalNodes[i].schema_id == data.schema_id) {
                    module = GlobalNodes[i];
                    break;
                }
            }
            for (var property in data.data) {
                if (data.data.hasOwnProperty(property)) {
                    for (var i = 0; i < module.Variables.length; i++) {
                        if (module.Variables[i].Key == property) {
                            module.Variables[i].Value = data.data[property];
                        }
                    }
                }
            }
        },
        getNodesForState: function(parentView)
        {
            var returnNodes = [];
            for (var i = 0; i < GlobalNodes.length; i++) {
                if (GlobalNodes[i].parentView == parentView) {
                    returnNodes.push(GlobalNodes[i]);
                }
            }
            return returnNodes;
        },
        getConnectionsForState: function(parentView)
        {
            var returnConnections = [];
            for (var i = 0; i < GlobalConnections.length; i++) {
                if (GlobalConnections[i].parentView == parentView) {
                    returnConnections.push(GlobalConnections[i]);
                }
            }
            return returnConnections;
        },
        getModuleByID: function (id) 
        {
            var returnObj;
            for (var i = 0; i < GlobalNodes.length; i++) {
                if (GlobalNodes[i].schema_id == id) {
                    returnObj = GlobalNodes[i];
                    break;
                }
            }
            return returnObj;
        },
        getEndpointsForItem: function (id, type, location) {
            var returnObj;
            var module;
            for (var i = 0; i < GlobalNodes.length; i++) {
                if (GlobalNodes[i].schema_id == id) {
                    module = GlobalNodes[i];
                    break;
                }
            }
            switch (location) {
            case "default":
                if (type == "source") {
                    for (var i = 0; i < module.SourceEndpoints.length; i++) {
                        returnObj = module.SourceEndpoints[i].id;
                    }
                }
                if (type == "target") {
                    for (var j = 0; j < module.TargetEndpoints.length; j++) {
                        returnObj = module.TargetEndpoints[j].id
                    }
                }
                break;
            case "left":
                if (type == "source") {
                    for (var i = 0; i < module.SourceEndpoints.length; i++) {
                        var sourceend = module.SourceEndpoints[i];
                        if (sourceend.location == "LeftMiddle") {
                            returnObj = module.SourceEndpoints[i].id;
                        }
                    }
                }
                break;
            case "right":
                if (type == "source") {
                    for (var i = 0; i < module.SourceEndpoints.length; i++) {
                        var sourceend = module.SourceEndpoints[i];
                        if (sourceend.location == "RightMiddle") {
                            returnObj = module.SourceEndpoints[i].id;
                        }
                    }
                }
                break;
            }

            console.log("Get connections for '" + id + "' has completed.");
            return returnObj;
        },
        addState: function(URL,state)
        {
            var states = state.get();
            if(!CheckIfAllReadyExists_state(URL,states))
            {
                app.stateProvider.state(URL, {
                    url: "/"+URL
                });
            }
        }
    }               
});