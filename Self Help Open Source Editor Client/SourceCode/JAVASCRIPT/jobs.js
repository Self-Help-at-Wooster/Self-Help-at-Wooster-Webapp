/**
 * Get all workers for a given UJID & Citizenship Period
 * @param UJID
 * @param CIT
 * @returns
 */
function getWorkers(UJID, CIT){

  var UserData = retrieveUserData();
  if(UserData[studentData["ACCESS"]-1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"]-1] <= accessLevels["CAPTAIN"] ){
  
    var Workers = [[]];
    
    var num = 0;

      var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
      var maxclass = classlists.getLastRow();
      var classdata = classlists.getSheetValues(2, 1,maxclass, studentData["LENGTH"]);
      
      var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
      var maxadvisor = advisorlists.getLastRow();
      var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, studentData["FIRST"]);
      
      for(var check = 0; check < classdata.length; check++){
    
        if(classdata[check][studentData["JOB" + CIT]-1] == UJID){
        
          Workers[num] = classdata[check];
    	  //get the full advisor name and replace it
          for(var check2 = 0; check2 < advisordata.length ; check2++){
            if(advisordata[check2][studentData["UUID"]-1] == classdata[check][studentData["ADVISOR"]-1]){
            	Workers[num][studentData["ADVISOR"]-1] = advisordata[check2][studentData["FIRST"]-1] + " " + advisordata[check2][studentData["LAST"]-1];
                break;
            }
          }
          num++  
        }
        
      }
    
      if(num > 0){
        Workers.sort(function (x, y) {return sortStudents_(x,y)} );
        return Workers;    
      }
      else
    	  return -1;
    
    }
  else{
    writeLog("User lacks privilege: Get Workers");
    throw new Error( "User lacks privilege");
  }

}

/**
 * Retrieves the Job List corresponding to the given Citizenship Period
 * @param Cit 
 * @returns
 */
function getJobList(Cit){
	var jblist = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('jobdatURL')); 
    var sheets = jblist.getSheets();
     
    for(var i = 0; i < sheets.length; i++){
	     if(sheets[i].getName() == String("CIT" + Cit) )
	    	 return sheets[i];
    }
    return null;
}


/**
 * Gets each job a person has for a given citizenship period
 * @param UUID UUID of student
 * @param Cit For given Citizenship Period
 * @returns Array of Jobs
 */
function getJobs(UUID, Cit){
    
	var UserData = retrieveUserData();
    if(UserData[studentData["ACCESS"]-1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"]-1] <= accessLevels["CAPTAIN"] ){
      
	  var joblists = getJobList(Cit);
      
      var num = 0; 
      if(joblists){
      
        var maxjob = joblists.getLastRow(); 
        var jobdata = joblists.getSheetValues(2, jobData["UJID"], maxjob, jobData["LENGTH"]);
         
        var ReturnData = [[]];
        
        for(var check = 0; check < jobdata.length ; check++){
          
          //all captain, proctor, and prefect values
          var positiondata = jobdata[check].slice(jobData["C1"]-1, jobData["P2"]); //noninclusive upper bound

            if(positiondata.indexOf(UUID) >= 0  || UserData[studentData["ACCESS"]-1] == accessLevels["ADMIN"]){
            	ReturnData[num] = jobdata[check];
            	num++;
            }
            
        }
      
      }
      
      if(num > 0){
    	ReturnData.sort(
    		function(x, y) {
    			return x[jobData["NAME"]-1].localeCompare(y[jobData["NAME"]-1]);
			}
        );
      return ReturnData;
      }
      else
    	  return -1;
    }
  else{
    writeLog("User lacks privilege: Get Jobs");
    throw new Error( "User lacks privilege");
  }    
    
}

/**
 * Gets All Jobs for use by JobAssign
 * @param Cit For given Citizenship Period
 * @returns Array of Jobs
 */
function getAllJobs(Cit){
    
	var UserData = retrieveUserData();
    if(UserData[studentData["ACCESS"]-1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"]-1] <= accessLevels["PREFECT"] ){
      
	  var joblists = getJobList(Cit);
      
      var num = 0; 
      if(joblists){
      
        var maxjob = joblists.getLastRow(); 
        
        var jobdata = joblists.getSheetValues(2, jobData["UJID"], maxjob, jobData["LENGTH"]);
         
        var ReturnData = [[]];
        
        for(var check = 0; check < jobdata.length ; check++){
        	ReturnData[num] = jobdata[check];
            num++;
        }
      
      }
      
      if(num > 0){
    	  ReturnData.sort(
            function(x, y) {
              return x[jobData["NAME"]-1].localeCompare(y[jobData["NAME"]-1]);
            }
          );
    	  return ReturnData;
      }
      else
    	  return -1;
    }
  else{
    writeLog("User lacks privilege: Get All Jobs");
    throw new Error( "User lacks privilege");
  }    
    
}

/**
 * Retrieves all the job data for a given UJID
 * @param UJID UJID to check
 * @param TranslateCaptNames Boolean to Translate Captain names
 * @param UUID UUID of person making this call
 * @param Cit For citizenship period
 * @returns JobData array
 */
function getJobData(UJID, TranslateCaptNames, UUID, Cit) {

	var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["STUDENT"]) {
    	
    	var joblists = getJobList(Cit);

        var returndata = [];

        if (joblists) {

            var maxjob = joblists.getLastRow();

            var jobdata = joblists.getSheetValues(2, jobData["UJID"], maxjob, jobData["LENGTH"]);

            for (var check = 0; check < jobdata.length; check++) {

                if (jobdata[check][jobData["UJID"]-1] == UJID) {

                    returndata = jobdata[check];

                    //if you are the captain, your slip writer is either p1 (proctor) or p2 (prefect)
                    if (UUID) {
                        if (returndata[jobData["P1"] - 1] != "" && (UUID == parseInt(returndata[jobData["C1"] - 1]) || UUID == parseInt(returndata[jobData["C2"] - 1]))) {
                            returndata[jobData["C1"] - 1] = returndata[jobData["P1"] - 1];
                            returndata[jobData["C2"] - 1] = "";
                        } else if ((returndata[jobData["P1"] - 1] == "" && (UUID == parseInt(returndata[jobData["C1"] - 1]) || UUID == parseInt(returndata[jobData["C2"] - 1]))) || parseInt(UUID) == parseInt(returndata[jobData["P1"] - 1])) {
                            returndata[jobData["C1"] - 1] = returndata[jobData["P2"] - 1];
                            returndata[jobData["C2"] - 1] = "";
                        }
                    }


                    if (TranslateCaptNames == true) {//TranslateCaptNames captain names

                        if (returndata[jobData["C1"] - 1] || returndata[jobData["C2"] - 1] ) {

                            var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
                            var maxclass = classlists.getLastRow();
                            var classdata = classlists.getSheetValues(2, 1, maxclass, studentData["LENGTH"]);

                            for (var check2 = 0; check2 < classdata.length; check2++) {
                                if (classdata[check2][studentData["UUID"] - 1] == returndata[jobData["C1"] - 1] && returndata[jobData["C1"] - 1]) {
                                    var nick1 = "";
                                    if (classdata[check2][studentData["NICKNAME"] - 1] != "") 
                                        nick1 = "(" + classdata[check2][studentData["NICKNAME"] - 1] + ") ";
                                    returndata[jobData["C1"] - 1] = classdata[check2][studentData["FIRST"] - 1] + " " + nick1 + classdata[check2][studentData["LAST"] - 1];

                                    if (returndata[jobData["C2"] - 1] == "")
                                        break;
                                } else if (classdata[check2][studentData["UUID"] - 1] == returndata[jobData["C2"] - 1] && returndata[jobData["C2"] - 1]) {
                                    var nick2 = "";
                                    if (classdata[check2][studentData["NICKNAME"] - 1] != "")
                                        nick2 = "(" + classdata[check2][studentData["NICKNAME"] - 1] + ") ";
                                    returndata[jobData["C2"] - 1] = classdata[check2][studentData["FIRST"] - 1] + " " + nick2 + classdata[check2][studentData["LAST"] - 1];
                                }
                            }
                        }

                    }

                    break;
                }

            }

        }

        if (returndata.length > 1) 
            return returndata;
        else
            return -1;

    } else {
        writeLog("User lacks privilege: Get Job Data");
        throw new Error("User lacks privilege");
    }

}

/**
 * Gets Info for Jobs Snapshot
 * Students
 * Advisor Names
 * Has Job Rec
 * @param jobID UJID
 * @param Cit For citizenship period
 * @returns Array of Info Arrays
 */
function getJobSnapshot(jobID, Cit){	
	var JobSnapshot = [[]];		
	  
    var UserData = retrieveUserData();
	if(UserData[studentData["ACCESS"]-1] == accessLevels["ADMIN"] || UserData[studentData["ACCESS"]-1] == accessLevels["PREFECT"] || UserData[studentData["ACCESS"]-1] == accessLevels["PROCTOR"] || UserData[studentData["ACCESS"]-1] == accessLevels["CAPTAIN"]){

	  var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();
	  var maxslips = curslips.getLastRow();
	  var slipdata = curslips.getSheetValues(2, 1,maxslips, eslipData["LENGTH"]);
	  
	  var myworkers = getWorkers(jobID,Cit);
	  
	  var num = 0;
	  for(var get = 0; get < myworkers.length; get++){
	    
	    var stud = myworkers[get];
	    if(stud[studentData["FIRST"]-1] || stud[studentData["LAST"]-1] ){
	    
	      var WorkerInfo = [];		
	      var Nick = "";		
	      if(stud[studentData["NICKNAME"]-1])
	        Nick = "(" + stud[studentData["NICKNAME"]-1] + ") ";		
	      
	      WorkerInfo[0] = stud[studentData["FIRST"]-1] + " ";
	      WorkerInfo[1] = Nick;
	      WorkerInfo[2] = stud[studentData["LAST"]-1];	
	      WorkerInfo[3] = stud[studentData["GRADE"]-1];
	      WorkerInfo[4] = stud[studentData["ADVISOR"]-1];
	      
	      var jr = "No";	
	      for(var check = 0; check < slipdata.length ; check++){
	         if(stud[studentData["UUID"]-1] == slipdata[check][eslipData["UUID"]-1]){
	            if(slipdata[check][eslipData["SLIPTYPE"]-1] == 3 && Cit == slipdata[check][eslipData["CIT"]-1]){
	              jr = "Yes";
	              break;
	            }
	         }
	      }	
	      WorkerInfo[5] = jr;
	      WorkerInfo[6] = stud[studentData["UUID"]-1];		
	      
	      JobSnapshot[num] = WorkerInfo;		
	      num++;	
	    }
	  }
	  
	  JobSnapshot.sort(
          function(x, y)
          {
            if(x[3] < y[3])
            	return 1; 
            else if(x[3] > y[3])
            	return -1;
            return x[0].localeCompare(y[0]);    
          }
       );
      return JobSnapshot;
	}
	else{
		writeLog("User lacks privilege: Job Snapshot");
		throw new Error( "User lacks privilege");
	}

}