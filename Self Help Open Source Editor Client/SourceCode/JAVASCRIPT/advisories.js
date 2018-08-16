/**
 * Gets all Advisees for given UFID
 * @param UFID Advisor ID
 * @returns Array of Advisees
 */
function getAdvisees(UFID){

  var UserData = retrieveUserData();
  if(UserData[studentData["ACCESS"]-1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"]-1] <= accessLevels["FACULTY"] ){
  
    var adv = getFacultyData(studentData["UUID"], UFID);
    if(adv != -1){
	
      var advname = adv[0][studentData["FIRST"]-1] + " " + adv[0][studentData["LAST"]-1];
      
      var Advisees = [[]];
      
      var num = 0;
      
      var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
      var maxclass = classlists.getLastRow();
      var classdata = classlists.getSheetValues(2, 1,maxclass, studentData["LENGTH"]);
      
      for(var check = 0; check < classdata.length ; check++){
        
        if( (classdata[check][studentData["FIRST"]-1] || classdata[check][studentData["LAST"]-1] ) && classdata[check][studentData["ADVISOR"]-1] == UFID){
          Advisees[num] = classdata[check];
          Advisees[num][studentData["ADVISOR"]-1] = advname;
          num++
        }
        
      }
    }
  
      if(num > 0)
    	  return Advisees;    
      return -1;
      
  }
  else{
      writeLog("User lacks privilege: Get Advisees");
      throw new Error( "User lacks privilege");
  }

}

/**
 * Get All Advisories
 * @returns Array of Advisory Arrays
 */
function getAllAdvisories(){
  
	var UserData = retrieveUserData();
    if(UserData[studentData["ACCESS"]-1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"]-1] <= accessLevels["FACULTY"] ){
	    var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
	    var maxadvisor = advisorlists.getLastRow();
	    var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, studentData["FIRST"]+1);
	    
	    var userdata = [[]];
	    var num = 0;
	      for(var set = 0; set < advisordata.length ; set++){     
	        if(advisordata[set][studentData["FIRST"]-1] != "" || advisordata[set][studentData["LAST"]-1] != ""){
	        	userdata[num] = advisordata[set];
	        	num++;
	        }
	      }
	    
	      if(num > 0)
		      userdata.sort(
	              function(x, y)
	              {
	                if(x[studentData["GRADE"]-1] < y[studentData["GRADE"]-1]){
	                 return 1; 
	                }
	                else if(x[studentData["GRADE"]-1] > y[studentData["GRADE"]-1]){
	                return -1;
	                }
	                  else{
	                    return x[studentData["FIRST"]-1].localeCompare(y[studentData["FIRST"]-1]);
	                  }
	                  
	              }
	            );
	    	  return userdata;
	      return -1
     }
     else{
    	 writeLog("User lacks privilege: Get All Advisories");
    	 throw new Error( "User lacks privilege");
     }
}

/**
 * Get Advisory Snapshot
 * @param advisorID UFID of Advisor
 * @param citper For Given Citizenship Period
 * @returns Array of Student info: name, job area, Total Good Slips, Total Bad Slips, and Has Job Rec
 */
function getAdvSnapshot(advisorID, citper){		

	  var UserData = retrieveUserData();
	  if(UserData[studentData["ACCESS"]-1] == accessLevels["ADMIN"] || UserData[studentData["ACCESS"]-1] == accessLevels["DEAN"] || UserData[studentData["ACCESS"]-1] == accessLevels["FACULTY"]){
	
		  var theret = [["X"]];		
		  
		  var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
		  var maxclass = classlists.getLastRow();
		  var classdata = classlists.getSheetValues(2, 1,maxclass, studentData["LENGTH"]);
		  
		  var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();
		  var maxslips = curslips.getLastRow();
		  var slipdata = curslips.getSheetValues(2, 1,maxslips, eslipData["LENGTH"]);
		  
		  var num = 0;
		  for(var get = 0; get < classdata.length; get++){
		    if(classdata[get][studentData["ADVISOR"]-1] == advisorID){
		      
		        var stud = classdata[get];
		         if(stud[studentData["FIRST"]-1] != "" || stud[studentData["LAST"]-1] != ""){
		          
		          var loctheret = ["X"];		
		          var nick = "";		
		          if(stud[studentData["NICKNAME"]-1])		
		        	  nick = "(" + stud[studentData["NICKNAME"]-1] + ") ";		
		          loctheret[0] = stud[studentData["FIRST"]-1] + " " + nick + stud[studentData["LAST"]-1];		
		          
		          if(citper != 7){
		            var studjob = getJobData(stud[studentData["JOB" + citper]-1],true,stud[studentData["UUID"]-1], citper);		
		            Logger.log(stud[studentData["JOB" + citper]-1]);		
		            loctheret[1] = studjob[jobData["NAME"]-1];		
		            loctheret[2] = studjob[jobData["C1"]-1];		
		            if(studjob[jobData["C2"]-1] != ""){		
		              loctheret[2] +=  " & " + studjob[jobData["C2"]-1];		
		            }		
		          }
		          
		          var TotalGood = 0;		
		          var TotalBad = 0;		
		          var HasJobRec = "No";
		          
		          if(citper == 7)
		        	  HasJobRec = "N/A";
		          
		          for(var check = 0; check < slipdata.length ; check++){
		            if(stud[studentData["UUID"]-1] == slipdata[check][eslipData["UUID"]-1]){
		              if(slipdata[check][eslipData["SLIPTYPE"]-1] == 1 && (citper == slipdata[check][eslipData["CIT"]-1] ^ citper == 7))
		                  TotalGood++;
		              else if(slipdata[check][eslipData["SLIPTYPE"]-1] == 2 && (citper == slipdata[check][eslipData["CIT"]-1] ^ citper == 7))
		                  TotalBad++
		              else if(slipdata[check][eslipData["SLIPTYPE"]-1] == 3 && citper == slipdata[check][eslipData["CIT"]-1])
		                  HasJobRec = "Yes";
		              
		            }
		          }
		          loctheret[3] = TotalGood;		
		          loctheret[4] = TotalBad;		
		          loctheret[5] = HasJobRec;
		          loctheret[6] = stud[studentData["UUID"]-1];		
		          
		          theret[num] = loctheret;		
		          num++;
		        }
		    }
		  }
		  
	      theret.sort(
	        function(x, y)
	        {
	          return x[0].localeCompare(y[0]);
	        }
	      );
		  	
		  return theret;		
	}
	else{
	    writeLog("User lacks privilege: Advisory Snapshot");
	    throw new Error( "User lacks privilege");
	}
	  
}