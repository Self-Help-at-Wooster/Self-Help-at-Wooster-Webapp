/**
 * Sets advisory assignments for students
 * @param students
 * @param advs
 * @param school
 * @param spreadlink
 */
function setAdvAssignments(students, advs, school, spreadlink){

	var UserData = retrieveUserData();
    if(UserData[studentData["ACCESS"]-1] == accessLevels["ADMIN"] || UserData[studentData["ACCESS"]-1] == accessLevels["DEAN"]){
    
    try{
      var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
      var maxclass = classlists.getLastRow();
      var classdata = classlists.getSheetValues(2, 1,maxclass, studentData["LENGTH"]);
       
      for(var i = 0; i < classdata.length; i++){
        for(var j = 0; j < students.length; j++){
          if(students[j][studentData["UUID"]-1] == classdata[i][studentData["UUID"]-1]){
            //check if advisory assignment is different
            if(classdata[i][[studentData["ADVISOR"]-1]] != students[j][studentData["ADVISOR"]-1] )
              classlists.getRange(2 + i, studentData["ADVISOR"]).setValue(students[j][studentData["ADVISOR"]-1]);
            break;
          }
        }
      }
      if(spreadlink != "")
          advMake(school, spreadlink);
    }
    catch(e){
       throw new Error("Failed to Set Data: " + e);
    }
      
    }
  else{
    writeLog("User lacks privilege: Set Advisory Assignments");
    throw new Error("User lacks privilege");
  } 
  
}

/**
 * Generates advisory list
 * @param school
 * @param spreadlink
 */
function advMake(school, spreadlink){

	var UserData = retrieveUserData();
    if(UserData[studentData["ACCESS"]-1] == accessLevels["ADMIN"] || UserData[studentData["ACCESS"]-1] == accessLevels["DEAN"] ){

       try{    
          var thespread = SpreadsheetApp.openByUrl(spreadlink);
          
          thespread.rename("Advisory List (" + school + ")");
          
          var newList = thespread.getActiveSheet();
          newList.setName("Advisory List")

          if(spreadlink == ""){
            newList.getParent().addEditor(getEmail());
            newList.setName("Job List");
          }
          //else{console.log(spreadlink);}
          
          newList.clear(); //clear the spreadsheet
          
          //Open Faculty List
          var faclist = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet(); 

          var num = 0;  
          if(faclist != null){
            
              var maxfac = faclist.getLastRow(); 
              
              var facdata = faclist.getSheetValues(2, studentData["UUID"], maxfac, studentData["FIRST"]);
              
                var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
                var maxclass = classlists.getLastRow();
                var classdata = classlists.getSheetValues(2, 1,maxclass, studentData["LENGTH"]);
                
                classdata.sort(function (x, y) {return sortStudents_(x,y)} );
              
              //Sort by grade then by last name (same way as system)
              facdata.sort(function (x, y) {return sortStudents_(x,y)} );
              
              var down = 0;
              
              	  var lastgrade;
              	  var hspace = 0;
              
                  for(var check = 0; check < facdata.length ; check++){
                    
                    if( (school == "US" && parseInt(facdata[check][studentData["GRADE"]-1]) >= 9 ||
                        school == "MS" && parseInt(facdata[check][studentData["GRADE"]-1]) < 9) &&
                        facdata[check][studentData["GRADE"]-1] &&
                        (facdata[check][studentData["FIRST"]-1] || facdata[check][studentData["LAST"]-1] ) ){
                    	
                    	if(!lastgrade)//if lastgrade is null
                    		lastgrade = facdata[check][studentData["GRADE"]-1];
                    	else if(lastgrade != facdata[check][studentData["GRADE"]-1]){
                    		lastgrade = facdata[check][studentData["GRADE"]-1];
                    		hspace++;
                    		down = 0; //reset down
                    	}
                    	
                      newList.getRange(1 + down, 1 + 2 * hspace, 1, 1).setValue([facdata[check][studentData["FIRST"]-1]] + " " + [facdata[check][studentData["LAST"]-1]] + " - " + [facdata[check][studentData["GRADE"]-1]] );
                    
                    var locdown = down;
                    var captains = "";
                    for(var workerpop = 0; workerpop < classdata.length ; workerpop++){
                      
                        if(classdata[workerpop][studentData["ADVISOR"]-1] != "" && classdata[workerpop][studentData["ADVISOR"]-1] == facdata[check][studentData["UUID"]-1]){
                          locdown++;
                          var person = "";
                          var nick = classdata[workerpop][studentData["NICKNAME"]-1] != "" ? " (" + classdata[workerpop][studentData["NICKNAME"]-1] + ") " : " ";
                          person = classdata[workerpop][studentData["FIRST"]-1] + nick + classdata[workerpop][studentData["LAST"]-1] + " - " + classdata[workerpop][studentData["GRADE"]-1];
                          newList.getRange(1 + locdown, 1 + 2 * hspace , 1, 1).setValue(person);
                        }
                      
                    }
                    

                      newList.getRange(1 + down, 1 + 2 * hspace, 1, 1).setBackground("#ffff00");
                      down = locdown + 2;
                      
                    }

                  }
              
                for(var i = 1; i <= 1 + 2 * hspace; i++)
	                newList.autoResizeColumn(parseInt(i));

            }
        }    
        catch(e){
          throw new Error( "Failed to Create Spreadsheet: " + e);
        }
        
    }
    else{
      writeLog("User lacks privilege: Job Spreadsheet");
      throw new Error("User lacks privilege");
    } 
}