/**
 * Gets all Advisees for given UFID
 * @param UFID Advisor ID
 * @returns Array of Advisees
 */
function getAdvisees(UFID) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.FACULTY) {

        var adv = getFacultyData(STUDENT_DATA.UUID, UFID);
        if (adv != -1) {

            var advname = adv[0][STUDENT_DATA["FIRST"] - 1] + " " + adv[0][STUDENT_DATA["LAST"] - 1];

            var Advisees = [[]];

            var num = 0;

            var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
            var maxclass = classlists.getLastRow();
            var classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);

            for (var check = 0; check < classdata.length; check++) {

                if ((classdata[check][STUDENT_DATA["FIRST"] - 1] || classdata[check][STUDENT_DATA["LAST"] - 1]) && classdata[check][STUDENT_DATA["ADVISOR"] - 1] == UFID) {
                    Advisees[num] = classdata[check];
                    Advisees[num][STUDENT_DATA["ADVISOR"] - 1] = advname;
                    num++
                }

            }
        }

        if (num > 0)
            return Advisees;
        return -1;

    }
    else {
        writeLog("User lacks privilege: Get Advisees");
        throw new Error("User lacks privilege");
    }

}

/**
 * Get All Advisories
 * @returns Array of Advisory Arrays
 */
function getAllAdvisories() {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.FACULTY) {
        var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
        var maxadvisor = advisorlists.getLastRow();
        var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, STUDENT_DATA["FIRST"] + 1);

        var userdata = [[]];
        var num = 0;
        for (var set = 0; set < advisordata.length; set++) {
            if (advisordata[set][STUDENT_DATA["FIRST"] - 1] != "" || advisordata[set][STUDENT_DATA["LAST"] - 1] != "") {
                userdata[num] = advisordata[set];
                num++;
            }
        }

        if (num > 0)
            userdata.sort(
                function (x, y) {
                    if (x[STUDENT_DATA["GRADE"] - 1] < y[STUDENT_DATA["GRADE"] - 1]) {
                        return 1;
                    }
                    else if (x[STUDENT_DATA["GRADE"] - 1] > y[STUDENT_DATA["GRADE"] - 1]) {
                        return -1;
                    }
                    else {
                        return x[STUDENT_DATA["FIRST"] - 1].localeCompare(y[STUDENT_DATA["FIRST"] - 1]);
                    }

                }
            );
        return userdata;
        return -1
    }
    else {
        writeLog("User lacks privilege: Get All Advisories");
        throw new Error("User lacks privilege");
    }
}

/**
 * Get Advisory Snapshot
 * @param {string} advisorID UFID of Advisor
 * @param {number} citper For Given Citizenship Period
 * @returns {Array} Student info: name, job area, Total Good Slips, Total Bad Slips, and Has Job Rec
 */
function getAdvSnapshot(advisorID, citper) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.ADMIN || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.DEAN || UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.FACULTY) {

        var theret = [["No data Available", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A"]];

        var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
        var maxclass = classlists.getLastRow();
        var classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);

        var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();
        var maxslips = curslips.getLastRow();
        var slipdata = curslips.getSheetValues(2, 1, maxslips, SLIP_DATA.LENGTH);



        var num = 0;
        for (var get = 0; get < classdata.length; get++) {
            if (classdata[get][STUDENT_DATA["ADVISOR"] - 1] == advisorID) {

                var stud = classdata[get];
                if (stud[STUDENT_DATA["FIRST"] - 1] || stud[STUDENT_DATA["LAST"] - 1]) {

                    var loctheret = ["No data Available"];
                    var nick = "";
                    if (stud[STUDENT_DATA["NICKNAME"] - 1])
                        nick = "(" + stud[STUDENT_DATA["NICKNAME"] - 1] + ") ";
                    loctheret[0] = stud[STUDENT_DATA["FIRST"] - 1] + " " + nick + stud[STUDENT_DATA["LAST"] - 1];

                    if (parseInt(citper) < 7) {
                        var studjob = getJobData(stud[STUDENT_DATA["JOB" + citper] - 1], true, stud[STUDENT_DATA.UUID - 1], citper);

                        loctheret[1] = studjob[JOB_DATA.NAME - 1];
                        loctheret[2] = studjob[JOB_DATA.C1 - 1];
                        if (studjob[JOB_DATA.C2 - 1]) //add the other captain
                            loctheret[2] += " & " + studjob[JOB_DATA.C2 - 1];
                    }

                    var TotalGood = 0;
                    var TotalBad = 0;
                    var HasJobRec = "No";

                    if (citper == 7)
                        HasJobRec = "N/A";

                    for (var check = 0; check < slipdata.length; check++) {
                        if (stud[STUDENT_DATA.UUID - 1] == slipdata[check][SLIP_DATA.UUID - 1]) {
                            if (slipdata[check][SLIP_DATA.SLIPTYPE - 1] == 1 && (citper == slipdata[check][SLIP_DATA.CIT - 1] ^ citper == 7))
                                TotalGood++;
                            else if (slipdata[check][SLIP_DATA.SLIPTYPE - 1] == 2 && (citper == slipdata[check][SLIP_DATA.CIT - 1] ^ citper == 7))
                                TotalBad++;
                            else if (slipdata[check][SLIP_DATA.SLIPTYPE - 1] == 3 && citper == slipdata[check][SLIP_DATA.CIT - 1])
                                HasJobRec = "Yes";

                        }
                    }
                    loctheret[3] = TotalGood;
                    loctheret[4] = TotalBad;
                    loctheret[5] = HasJobRec;
                    loctheret[6] = stud[STUDENT_DATA.UUID - 1];

                    theret[num] = loctheret;
                    num++;
                }
            }
        }

        theret.sort(
            function (x, y) {
                return x[0].localeCompare(y[0]);
            }
        );

        return theret;
    }
    else {
        writeLog("User lacks privilege: Advisory Snapshot");
        throw new Error("User lacks privilege");
    }

}