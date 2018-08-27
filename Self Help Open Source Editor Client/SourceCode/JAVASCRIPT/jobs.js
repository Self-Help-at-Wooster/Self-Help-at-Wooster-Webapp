/**
 * Get all workers for a given UJID & Citizenship Period
 * @param UJID
 * @param CIT
 * @returns
 */
function getWorkers(UJID, CIT) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.CAPTAIN) {

        var Workers = [["No data Available", "N/A", "N/A", "N/A"]];

        var num = 0;

        var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
        var maxclass = classlists.getLastRow();
        var classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);

        var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
        var maxadvisor = advisorlists.getLastRow();
        var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, STUDENT_DATA["FIRST"]);

        for (var check = 0; check < classdata.length; check++) {

            if (classdata[check][STUDENT_DATA["JOB" + CIT] - 1] == UJID) {

                Workers[num] = classdata[check];
                //get the full advisor name and replace it
                for (var check2 = 0; check2 < advisordata.length; check2++) {
                    if (advisordata[check2][STUDENT_DATA.UUID - 1] == classdata[check][STUDENT_DATA["ADVISOR"] - 1]) {
                        Workers[num][STUDENT_DATA["ADVISOR"] - 1] = advisordata[check2][STUDENT_DATA["FIRST"] - 1] + " " + advisordata[check2][STUDENT_DATA["LAST"] - 1];
                        break;
                    }
                }
                num++;
            }

        }

        if (num > 0) {
            Workers.sort(function (x, y) {
                return sortStudents_(x, y);
            });
            return Workers;
        } else
            return -1;

    } else {
        writeLog("User lacks privilege: Get Workers");
        throw new Error("User lacks privilege");
    }

}

/**
 * Retrieves the Job List corresponding to the given Citizenship Period
 * @param Cit 
 * @returns
 */
function getJobList(Cit) {
    var jblist = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('jobdatURL'));
    var sheets = jblist.getSheets();

    for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getName() === String("CIT" + Cit))
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
function getJobs(UUID, Cit) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.CAPTAIN) {

        var joblists = getJobList(Cit);

        var num = 0;
        if (joblists) {

            var maxjob = joblists.getLastRow();
            var jobdata = joblists.getSheetValues(2, JOB_DATA["UJID"], maxjob, JOB_DATA["LENGTH"]);

            var ReturnData = [
                []
            ];

            for (var check = 0; check < jobdata.length; check++) {

                //all captain, proctor, and prefect values
                var positiondata = jobdata[check].slice(JOB_DATA.C1 - 1, JOB_DATA["P2"]); //noninclusive upper bound

                if (positiondata.indexOf(UUID) >= 0 || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.ADMIN) {
                    ReturnData[num] = jobdata[check];
                    num++;
                }

            }

        }

        if (num > 0) {
            ReturnData.sort(
                function (x, y) {
                    return x[JOB_DATA.NAME - 1].localeCompare(y[JOB_DATA.NAME - 1]);
                }
            );
            return ReturnData;
        } else
            return -1;
    } else {
        writeLog("User lacks privilege: Get Jobs");
        throw new Error("User lacks privilege");
    }

}

/**
 * Gets All Jobs for use by JobAssign
 * @param Cit For given Citizenship Period
 * @returns Array of Jobs
 */
function getAllJobs(Cit) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.PREFECT) {

        var joblists = getJobList(Cit);

        var num = 0;
        if (joblists) {

            var maxjob = joblists.getLastRow();

            var jobdata = joblists.getSheetValues(2, JOB_DATA["UJID"], maxjob, JOB_DATA["LENGTH"]);

            var ReturnData = [
                []
            ];

            for (var check = 0; check < jobdata.length; check++) {
                ReturnData[num] = jobdata[check];
                num++;
            }

        }

        if (num > 0) {
            ReturnData.sort(
                function (x, y) {
                    return x[JOB_DATA.NAME - 1].localeCompare(y[JOB_DATA.NAME - 1]);
                }
            );
            return ReturnData;
        } else
            return -1;
    } else {
        writeLog("User lacks privilege: Get All Jobs");
        throw new Error("User lacks privilege");
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
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.STUDENT) {

        var joblists = getJobList(Cit);

        var returndata = [];

        if (joblists) {

            var jobdata = joblists.getSheetValues(2, JOB_DATA["UJID"], joblists.getLastRow(), JOB_DATA["LENGTH"]);

            for (var check = 0; check < jobdata.length; check++) {

                if (jobdata[check][JOB_DATA["UJID"] - 1] == UJID) {

                    returndata = jobdata[check];

                    //if you are the captain, your slip writer is either p1 (proctor) or p2 (prefect)
                    if (UUID) {
                        if (returndata[JOB_DATA["P1"] - 1] != "" && (UUID == parseInt(returndata[JOB_DATA.C1 - 1]) || UUID == parseInt(returndata[JOB_DATA.C2 - 1]))) {
                            returndata[JOB_DATA.C1 - 1] = returndata[JOB_DATA["P1"] - 1];
                            returndata[JOB_DATA.C2 - 1] = "";
                        } else if ((returndata[JOB_DATA["P1"] - 1] == "" && (UUID == parseInt(returndata[JOB_DATA.C1 - 1]) || UUID == parseInt(returndata[JOB_DATA.C2 - 1]))) || parseInt(UUID) == parseInt(returndata[JOB_DATA["P1"] - 1])) {
                            returndata[JOB_DATA.C1 - 1] = returndata[JOB_DATA["P2"] - 1];
                            returndata[JOB_DATA.C2 - 1] = "";
                        }
                    }

                    if (TranslateCaptNames && (returndata[JOB_DATA.C1 - 1] || returndata[JOB_DATA.C2 - 1])) { //TranslateCaptNames captain names       

                            var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
                            var maxclass = classlists.getLastRow();
                            var classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);

                            for (var studentCheck = 0; studentCheck < classdata.length; studentCheck++) {
                                if (classdata[studentCheck][STUDENT_DATA.UUID - 1] == returndata[JOB_DATA.C1 - 1] && returndata[JOB_DATA.C1 - 1]) {
                                    var nick1 = " (" + classdata[studentCheck][STUDENT_DATA.NICKNAME - 1] + ") " || " ";

                                    returndata[JOB_DATA.C1 - 1] = classdata[studentCheck][STUDENT_DATA["FIRST"] - 1] + nick1 + classdata[studentCheck][STUDENT_DATA["LAST"] - 1];

                                    if (returndata[JOB_DATA.C2 - 1])
                                        break;
                                } else if (classdata[studentCheck][STUDENT_DATA.UUID - 1] == returndata[JOB_DATA.C2 - 1] && returndata[JOB_DATA.C2 - 1]) {
                                    var nick2 = " (" + classdata[studentCheck][STUDENT_DATA.NICKNAME - 1] + ") " || " ";
                                    returndata[JOB_DATA.C2 - 1] = classdata[studentCheck][STUDENT_DATA["FIRST"] - 1] + nick2 + classdata[studentCheck][STUDENT_DATA["LAST"] - 1];
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
function getJobSnapshot(jobID, Cit) {
    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.ADMIN || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.PREFECT || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.PROCTOR || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.CAPTAIN) {

        var JobSnapshot = [
            ["No data Available", "", "", "N/A", "N/A", "N/A", "N/A"]
        ];

        var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();
        var maxslips = curslips.getLastRow();
        var slipdata = curslips.getSheetValues(2, 1, maxslips, SLIP_DATA.LENGTH);

        var myworkers = getWorkers(jobID, Cit);

        if (myworkers === -1)
            return JobSnapshot;

        var num = 0;
        for (var get = 0; get < myworkers.length; get++) {

            var stud = myworkers[get];
            if (stud[STUDENT_DATA["FIRST"] - 1] || stud[STUDENT_DATA["LAST"] - 1]) {

                var WorkerInfo = [];
                var Nick = "";
                if (stud[STUDENT_DATA["NICKNAME"] - 1])
                    Nick = "(" + stud[STUDENT_DATA["NICKNAME"] - 1] + ") ";

                WorkerInfo[0] = stud[STUDENT_DATA["FIRST"] - 1] + " ";
                WorkerInfo[1] = Nick;
                WorkerInfo[2] = stud[STUDENT_DATA["LAST"] - 1];
                WorkerInfo[3] = stud[STUDENT_DATA["GRADE"] - 1];
                WorkerInfo[4] = stud[STUDENT_DATA["ADVISOR"] - 1];

                var jr = "No";
                for (var check = 0; check < slipdata.length; check++) {
                    if (stud[STUDENT_DATA.UUID - 1] == slipdata[check][SLIP_DATA.UUID - 1]) {
                        if (slipdata[check][SLIP_DATA.SLIPTYPE - 1] == 3 && Cit == slipdata[check][SLIP_DATA.CIT - 1]) {
                            jr = "Yes";
                            break;
                        }
                    }
                }
                WorkerInfo[5] = jr;
                WorkerInfo[6] = stud[STUDENT_DATA.UUID - 1];

                JobSnapshot[num] = WorkerInfo;
                num++;
            }
        }

        JobSnapshot.sort(
            function (x, y) {
                if (x[3] < y[3])
                    return 1;
                else if (x[3] > y[3])
                    return -1;
                return x[0].localeCompare(y[0]);
            }
        );

        return JobSnapshot;
    } else {
        writeLog("User lacks privilege: Job Snapshot");
        throw new Error("User lacks privilege");
    }

}