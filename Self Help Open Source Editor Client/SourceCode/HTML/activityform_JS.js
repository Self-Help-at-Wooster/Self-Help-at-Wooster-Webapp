

function checkCoreqs(){
    document.getElementById('saveActInfo').style.display='block';
    
    var cbxAct = document.getElementById("cbxAct");
    var cbxMart = document.getElementById("cbxMart");
    
    if(cbxAct.selectedIndex > 0 && cbxAct.options[cbxAct.selectedIndex].dataset.coreq){
        if(cbxAct.options[cbxAct.selectedIndex].dataset.coreq == 4 && cbxMart.selectedIndex <= 0){
            showModal(0, "Please select your required other thing that you should do because it's required and I say so.");
        }
    }
        
}

function disableActivities(){
    document.getElementById("cbxAct").disabled = "true";
    document.getElementById("cbxMart").disabled = "true";
    document.getElementById("cbxClub").disabled = "true";
    document.getElementById("seasonselect").disabled = "true";
    document.getElementById("spinact").style.display = "block";
    document.getElementById("showacttable").style.display = "none";
    document.getElementById("saveActInfo").style.display = "none";
}

function enableActivities(){
    document.getElementById("cbxAct").removeAttribute("disabled");
    document.getElementById("cbxMart").removeAttribute("disabled");
    document.getElementById("cbxClub").removeAttribute("disabled");
    document.getElementById("seasonselect").removeAttribute("disabled");
    document.getElementById("spinact").style.display = "none";
}

/**
 * Gets the activities for the selected period
 */
function getPeriodActivities(){
    updateRegStatus();
    var cbxAct = document.getElementById("cbxAct");
    var cbxMart = document.getElementById("cbxMart");
    var cbxClub = document.getElementById("cbxClub");
    removeSelectOptions(cbxAct);
    removeSelectOptions(cbxMart);
    removeSelectOptions(cbxClub);
    
    var cbxPeriod = document.getElementById("seasonselect");
    var selectedPeriod = cbxPeriod.options[cbxPeriod.selectedIndex].value;

    document.getElementById("showacttable").style.display = "none";
    
    if(selectedPeriod && cbxPeriod.selectedIndex > 0){
        disableActivities();
        if(SelectedFunction == FunctionType.DeanAct){
            google.script.run.withSuccessHandler(function(Info) {LoadActivityInfo(Info)})
             .withFailureHandler(() => showModal(0, "Action Failed"))
             .deanAllActivities(selectedPeriod, slipfor);
        }
        else{
         google.script.run.withSuccessHandler(function(Info) {LoadActivityInfo(Info)})
         .withFailureHandler(() => showModal(0, "Action Failed"))
         .getAllActivities(selectedPeriod);
        }
    }		
}

/**
 * Adds activity info to select boxes
 * Loads user activity data
 */
function LoadActivityInfo(Info){

    if(Info != -1){
        var cbxAct = document.getElementById("cbxAct");
        var cbxMart = document.getElementById("cbxMart");
        var cbxClub = document.getElementById("cbxClub");
        removeSelectOptions(cbxAct);
        removeSelectOptions(cbxMart);
        removeSelectOptions(cbxClub);
        
        var Activities = Info[0];
        var MyInfo = Info[1];

        for(var i = 0; i < Activities.length; i++){
            var act = Activities[i];
            var option = document.createElement("option");
            
                if(!act[ACTIVITY_DATA["CAP"]-1])
                    act[ACTIVITY_DATA["CAP"]-1] = "0";
                if(!act[ACTIVITY_DATA["CUR"]-1])
                    act[ACTIVITY_DATA["CUR"]-1] = "0";
            
               var slots = parseInt(act[ACTIVITY_DATA["CAP"]-1]) - parseInt(act[ACTIVITY_DATA["CUR"]-1]);
               
               option.text = act[ACTIVITY_DATA["NAME"]-1] + ": " + slots + " left"; 
               option.value = act[ACTIVITY_DATA["UAID"]-1];
               option.dataset.coreq = act[ACTIVITY_DATA["REQ"]-1];
               
            if(MyInfo && MyInfo != -1 && MyInfo.Activity == act[ACTIVITY_DATA["UAID"]-1])
               option.selected = true;
            else if(MyInfo && MyInfo != -1 && MyInfo.MondayArt == act[ACTIVITY_DATA["UAID"]-1])
               option.selected = true;
            else if(MyInfo && MyInfo != -1 && MyInfo.Club == act[ACTIVITY_DATA["UAID"]-1])
               option.selected = true;
            else if(act[ACTIVITY_DATA["CAP"]-1] && act[ACTIVITY_DATA["CAP"]-1] <= act[ACTIVITY_DATA["CUR"]-1] ){//disabled if enrollment is full
                option.disabled = true;
                option.text = "FULL! " + option.text;
            }
               
            if(act[ACTIVITY_DATA["TYPE"]-1] >= 1 && act[ACTIVITY_DATA["TYPE"]-1] <= 3)//IS, Sport, Art Intensive
                cbxAct.add(option);
            else if(act[ACTIVITY_DATA["TYPE"]-1] == 4)//Monday Art
                cbxMart.add(option);
            else if(act[ACTIVITY_DATA["TYPE"]-1] == 5)//Club
                cbxClub.add(option);
        }
        document.getElementById("showacttable").style.display = "block";
    }
    
    if(registrationStatus == "Enabled")
        enableActivities();
    document.getElementById("spinact").style.display = "none";
    document.getElementById("seasonselect").removeAttribute("disabled");
}

/**
 * Remove all options from a given select form
 */
function removeSelectOptions(selectbox){
    var i;
    for(i = selectbox.options.length - 1; i >= 1; i--)//don't remove the blank option
        selectbox.remove(i);
}

/**
 * Submits updated activity info to server
 */
function saveActivityInfo(){
    var cbxAct = document.getElementById("cbxAct");
    var cbxMart = document.getElementById("cbxMart");
    var cbxClub = document.getElementById("cbxClub");
    
    var activity = cbxAct.options[cbxAct.selectedIndex].value;
    var mart = cbxMart.options[cbxMart.selectedIndex].value;
    var club = cbxClub.options[cbxClub.selectedIndex].value;
    
    var userData = {};
    userData.Activity = activity;
    userData.MondayArt = mart;
    userData.Club = club;
    
    var cbxPeriod = document.getElementById("seasonselect");
    var selectedPeriod = cbxPeriod.options[cbxPeriod.selectedIndex].value;
    
    if(SelectedFunction == FunctionType.DeanAct){
        google.script.run
        .withSuccessHandler(() => {showModal(0, "You have successfully updated your activity info for " + selectedPeriod + "!");  getPeriodActivities(); })
        .withFailureHandler(() => {showModal(0, "Action Failed"); getPeriodActivities(); })
        .deanSetActivities(selectedPeriod, userData, slipfor); //send UUID		
    }
    else{
        google.script.run
        .withSuccessHandler(() => {showModal(0, "You have successfully updated your activity info for " + selectedPeriod + "!");  getPeriodActivities(); })
        .withFailureHandler(() => {showModal(0, "Action Failed"); getPeriodActivities(); })
        .setUserActivities(selectedPeriod, userData);
    }
}
