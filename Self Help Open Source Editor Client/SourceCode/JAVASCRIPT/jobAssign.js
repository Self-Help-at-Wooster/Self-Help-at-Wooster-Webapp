/**
 * Tests to see if Self Help has access to spreadsheet
 * @param spreadlink URL
 * @returns either fails or succeeds
 */
function testURL(spreadlink) {
    var newList = SpreadsheetApp.openByUrl(spreadlink);
}

function setJobAssignments(students, jobs, citper, school, spreadlink) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.ADMIN || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.DEAN || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.PREFECT) {

        try {
            var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
            var maxclass = classlists.getLastRow();
            var classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);

            for (var i = 0; i < classdata.length; i++) {
                for (var j = 0; j < students.length; j++) {
                    if (students[j][STUDENT_DATA.UUID - 1] == classdata[i][STUDENT_DATA.UUID - 1]) {
                        //check if job assignment is different
                        if (classdata[i][
                            [STUDENT_DATA["JOB" + citper] - 1]
                        ] != students[j][STUDENT_DATA["JOB" + citper] - 1]) {
                            classlists.getRange(2 + i, STUDENT_DATA["JOB" + citper]).setValue(students[j][STUDENT_DATA["JOB" + citper] - 1]);
                        }
                        //check if access level has been changes
                        if (classdata[i][
                            [STUDENT_DATA.ACCESS - 1]
                        ] != students[j][STUDENT_DATA.ACCESS - 1]) {
                            classlists.getRange(2 + i, STUDENT_DATA.ACCESS).setValue(students[j][STUDENT_DATA.ACCESS - 1]);
                        }
                        break;
                    }
                }
            }

            var jblist = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('jobdatURL'));

            var sheets = jblist.getSheets();

            var joblists;

            for (var i = 0; i < sheets.length; i++) {
                if (sheets[i].getName() == String("CIT" + citper)) {
                    joblists = sheets[i];
                }
            }

            var num = 0;

            if (joblists != null) {
                var maxjob = joblists.getLastRow();
                var jobsData = joblists.getSheetValues(2, 1, maxjob, JOB_DATA["LENGTH"]);

                for (var i = 0; i < jobsData.length; i++) {
                    for (var j = 0; j < jobs.length; j++) {
                        if (jobs[j][JOB_DATA["UJID"] - 1] == jobsData[i][JOB_DATA["UJID"] - 1]) {

                            //C1 and C2
                            joblists.getRange(2 + i, JOB_DATA.C1, 1, 2).setValues([
                                [jobs[j][JOB_DATA.C1 - 1], jobs[j][JOB_DATA.C2 - 1]]
                            ]);

                            break;
                        }
                    }
                }

            }

            if (spreadlink != "") {
                jobMake(citper, school, spreadlink);
            }
        } catch (e) {
            throw new Error("Failed to Set Data: " + e);
        }

    } else {
        writeLog("User lacks privilege: Set Job Assignments");
        throw new Error("User lacks privilege");
    }


}


//Creates Job Spreadsheet and populates Job List

function jobMake(citper, school, spreadlink) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.ADMIN || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.DEAN || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.PREFECT) {

        try {
            //Existing Spreadsheet for current session

            //Old line of code that used to generate new spreadsheets.
            //var newList = spreadlink == "" ? SpreadsheetApp.create("Citizenship " + citper + " (" + school + ")").getActiveSheet() : SpreadsheetApp.openByUrl(spreadlink).insertSheet("Job List " + SpreadsheetApp.openByUrl(spreadlink).getNumSheets() , 0);

            var thespread = SpreadsheetApp.openByUrl(spreadlink);

            thespread.rename("Job List (" + school + ")");

            var newList;

            if (thespread.getNumSheets() == 1 && thespread.getActiveSheet().getName() == "Sheet1") {
                newList = thespread.getActiveSheet();
                newList.setName("Job List 0")

                //clear the spreadsheet
                newList.clear();
            } else {
                newList = thespread.insertSheet("Job List " + SpreadsheetApp.openByUrl(spreadlink).getNumSheets(), 0);
            }

            if (spreadlink == "") {
                newList.getParent().addEditor(getEmail());
                newList.setName("Job List");
            } else {
                console.log(spreadlink);
            }

            //Open Job List and get correct sheet by citizenship period
            var jblist = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('jobdatURL'));

            var sheets = jblist.getSheets();

            var joblists;

            for (var i = 0; i < sheets.length; i++) {
                if (sheets[i].getName() == String("CIT" + citper)) {
                    joblists = sheets[i];
                }
            }

            var num = 0;

            if (joblists != null) {

                var maxjob = joblists.getLastRow();

                var jobdata = joblists.getSheetValues(2, JOB_DATA["UJID"], maxjob, JOB_DATA["LENGTH"]);

                var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
                var maxclass = classlists.getLastRow();
                var classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);

                classdata.sort(function (x, y) {
                    return sortStudents_(x, y)
                });

                jobdata.sort(
                    function (x, y) {
                        return x[1].localeCompare(y[1]);
                    }
                );

                var down = 0;

                var functionOne = function setJobList(search, across) {

                    var found = false;

                    for (var check = 0; check < jobdata.length; check++) {

                        if (jobdata[check][JOB_DATA["POINTER"] - 1] == search) {
                            found = true;
                            //Logger.log(jobdata[check][JOB_DATA["UJID"]-1]);

                            newList.getRange(1 + down, 1 + across, 1, 1).setValues([
                                [jobdata[check][JOB_DATA.NAME - 1]]
                            ]);

                            var locdown = down;
                            var captains = "";
                            for (var workerpop = 0; workerpop < classdata.length; workerpop++) {

                                if (classdata[workerpop][STUDENT_DATA.UUID - 1] != "" && (classdata[workerpop][STUDENT_DATA.UUID - 1] == jobdata[check][JOB_DATA.C1 - 1] || classdata[workerpop][STUDENT_DATA.UUID - 1] == jobdata[check][JOB_DATA.C2 - 1])) {
                                    //newList.getRange(1 + down, 1 + across, 1, 1).setValue(newList.getRange(1 + down, 1 + across, 1, 1).getValue() + ": " + classdata[workerpop][STUDENT_DATA["FIRST"]-1] );
                                    if (captains != "") {
                                        captains += " & ";
                                    }

                                    var nick = classdata[workerpop][STUDENT_DATA["NICKNAME"] - 1] != "" ? " (" + classdata[workerpop][STUDENT_DATA["NICKNAME"] - 1] + ") " : " ";
                                    captains += classdata[workerpop][STUDENT_DATA["FIRST"] - 1] + nick + classdata[workerpop][STUDENT_DATA["LAST"] - 1];
                                } else if (classdata[workerpop][STUDENT_DATA["JOB" + citper] - 1] == jobdata[check][JOB_DATA["UJID"] - 1]) {
                                    locdown++;
                                    var person = "";
                                    var nick = classdata[workerpop][STUDENT_DATA["NICKNAME"] - 1] != "" ? " (" + classdata[workerpop][STUDENT_DATA["NICKNAME"] - 1] + ") " : " ";
                                    person = classdata[workerpop][STUDENT_DATA["FIRST"] - 1] + nick + classdata[workerpop][STUDENT_DATA["LAST"] - 1] + " - " + classdata[workerpop][STUDENT_DATA["GRADE"] - 1];
                                    newList.getRange(1 + locdown, 1 + across, 1, 1).setValue(person);
                                }

                            }

                            if (captains != "") {
                                newList.getRange(1 + down, 1 + across, 1, 1).setValue(newList.getRange(1 + down, 1 + across, 1, 1).getValue() + ": " + captains);
                            }

                            if (search == "MS") {
                                newList.getRange(1 + down, 1, 1, 1).setBackground("#ffff00");
                                down = locdown + 2;

                            } else if (search == "SP") {

                                newList.getRange(1 + down, 1, 1, 1).setBackground("#800000");
                                newList.getRange(1 + down, 1, 1, 1).setFontColor("white");
                                down = locdown + 2;

                                functionOne(jobdata[check][JOB_DATA["UJID"] - 1], 0);
                            } else if (jobdata[check][JOB_DATA.NAME - 1].toLowerCase().indexOf("prefect") > -1) {

                                newList.getRange(1 + down, 1, 1, 1).setBackground("#ff0000");
                                newList.getRange(1 + down, 1, 1, 1).setFontColor("white");
                                down = locdown + 2;

                                functionOne(jobdata[check][JOB_DATA["UJID"] - 1], 1);
                            } else if (jobdata[check][JOB_DATA.NAME - 1].toLowerCase().indexOf("proctor") > -1) {

                                newList.getRange(1 + down, 1 + across, 1, 1).setBackground("#ff9900");
                                down = locdown + 2;

                                functionOne(jobdata[check][JOB_DATA["UJID"] - 1], 2);
                            } else {

                                newList.getRange(1 + down, 1 + across, 1, 1).setBackground("#ffff00");
                                down = locdown + 2;

                            }

                        }

                    }

                    if (found == false) {
                        down++;
                    }
                };

                if (school == "US") {
                    functionOne("SP", parseInt(0));
                } else {
                    functionOne("MS", parseInt(0));
                }

                newList.autoResizeColumn(1);
                newList.autoResizeColumn(2);
                newList.autoResizeColumn(3);
            }
        } catch (e) {
            throw new Error("Failed to Create Spreadsheet: " + e);
        }

    } else {
        writeLog("User lacks privilege: Job Spreadsheet");
        throw new Error("User lacks privilege");
    }
}