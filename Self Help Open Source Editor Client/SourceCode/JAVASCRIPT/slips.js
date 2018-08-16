//writes a slip
function SubmitSlip(UUID, SlipType, Text, P1, P2, P3, P4, R, CitPer) {
    //preconditions to check slips for functions:
    if (typeof SlipType === 'string' && P1.charAt(0) !== "=" || P1 == null)
        console.log("type");
    if (typeof Text === 'string')
        Text = Text.trim();

    if (
        typeof UUID === 'string' && UUID.charAt(0) !== "=" &&
        typeof SlipType === 'string' && SlipType.charAt(0) !== "=" || typeof SlipType === 'number' &&
        typeof Text === 'string' && Text.charAt(0) !== "=" &&
        (typeof P1 === 'string' && P1.charAt(0) !== "=" || P1 == null) &&
        (typeof P2 === 'string' && P2.charAt(0) !== "=" || P2 == null) &&
        (typeof P3 === 'string' && P3.charAt(0) !== "=" || P3 == null) &&
        (typeof P4 === 'string' && P4.charAt(0) !== "=" || P4 == null) &&
        (typeof R === 'string' && R.charAt(0) !== "=" || R == null) &&
        typeof CitPer === 'string' && CitPer.charAt(0) !== "=") {

        var UserData = retrieveUserData();

        const unableToWriteBadSlip = UserData[studentData["ACCESS"] - 1] == accessLevels["CAPTAIN"] && UserData[studentData["GRADE"] - 1] < 11 && SlipType === 2;

        if (UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["CAPTAIN"] && unableToWriteBadSlip === true) {
            //var lock = LockService.getPublicLock();

            //LOCK CODE FORMERLY USED TO INHIBIT REFIRING (GOOGLE PROBLEM) SEEMS TO HAVE BEEN FIXED.
            //var lock = LockService.getUserLock();
            //lock.waitLock(3000); //3 second delay

            var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL'));
            var cursheet = curslips.getActiveSheet();
            cursheet.insertRows(2);

            var time = new Date();

            var From = UserData[studentData["EMAIL"] - 1];

            var targetRange = cursheet.getRange(2, 1, 1, eslipData["LENGTH"]).setValues([
                [UUID, SlipType, From, Text, P1, P2, P3, P4, R, CitPer, time.getMonth() + 1 + "/" + time.getDate() + "/" + time.getYear()]
            ]);

            writeEmail_(UUID, numtoSlip[SlipType]);

        } else {
            writeLog("User lacks privilege: Write Slip");
            throw new Error("User lacks privilege");
        }

    } else {
        writeLog("Attempted to write Spreadsheet Function");
        throw new Error("Do not use = at beginning of text.");
    }
}


function getSpecificSlip(Row) {

    var UserData = retrieveUserData();

    var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
    var maxadvisor = advisorlists.getLastRow();
    var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, studentData["FIRST"]);

    var alladv = {}; //associative object
    var num = 0;
    for (var setadv = 0; setadv < advisordata.length; setadv++) {
        if (!advisordata[setadv][studentData["FIRST"] - 1] || !advisordata[setadv][studentData["LAST"] - 1]) {
            alladv[advisordata[setadv][studentData["UUID"] - 1]] = advisordata[setadv][studentData["FIRST"] - 1] + " " + advisordata[setadv][studentData["LAST"] - 1];
            num++;
        }
    }

    var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();

    var maxslips = curslips.getLastRow();

    var slipdata;

    if (!Row && curslips.getLastRow() - Row >= 1 && Row >= 1) {
        slipdata = curslips.getSheetValues(curslips.getLastRow() - Row + 1, 1, 1, eslipData["LENGTH"]);
    } else {
        //throw new Error( "Slip Index out of Range. Please Reload Script with " + PropertiesService.getScriptProperties().getProperty('execURL') );
        console.log("Slip Index out of Range: " + Row);
        return -1;
    }

    var slipID = slipdata[0][eslipData["UUID"] - 1];

    var returndata = [
        ["X"]
    ];

    var classlists;
    var maxclass;
    var classdata = [
        ["X"]
    ];

    num = 0;
    for (var check = 0; check < slipdata.length; check++) {

        //because the row is returned as a multidimensional array, it must be taken at the 0 index (for only the row)...
        returndata[num] = slipdata[check];

        if (num == 0) {
            classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
            maxclass = classlists.getLastRow();
            classdata = classlists.getSheetValues(2, 1, maxclass, studentData["LENGTH"]);
        }


        //Translate UUID To Name 
        for (var check2 = 0; check2 < classdata.length; check2++) {

            if (classdata[check2][studentData["UUID"] - 1] == slipdata[check][eslipData["UUID"] - 1]) {
                var nick1 = "";
                if (classdata[check2][studentData["NICKNAME"] - 1] != "") {
                    nick1 = " (" + classdata[check2][studentData["NICKNAME"] - 1] + ") ";
                }

                returndata[num][eslipData["UUID"] - 1] = classdata[check2][studentData["FIRST"] - 1] + " " + nick1 + classdata[check2][studentData["LAST"] - 1];

                var grade = classdata[check2][studentData["GRADE"] - 1] == null ? " (" + classdata[check2][studentData["GRADE"] - 1] + ")" : "";

                if (alladv[classdata[check2][studentData["ADVISOR"] - 1]] != null) {
                    returndata[num][returndata[num].length] = alladv[classdata[check2][studentData["ADVISOR"] - 1]] + grade; //set grade as final (really cheaty method :) )
                } else {
                    returndata[num][returndata[num].length] = grade; //set grade as final (really cheaty method :) )
                }

                break;
            }
        }

        num++;

    }

    if (num > 0) {

        if (slipID != UserData[studentData["UUID"] - 1] && UserData[studentData["ACCESS"] - 1] > accessLevels["FACULTY"]) {
            writeLog("User lacks privilege: View Slip Parameter: " + Row);
            //throw new Error( "User lacks privilege");
            console.log("User lacks privilege: View Slip Parameter: " + Row);
            return -1;
        } else {
            writeParamter(Row);
            return returndata;
        }
    } else {
        return -1;
    }
}

function writeParamter(Row) {
    Utilities.sleep(10);
    writeLog("Slip Parameter Accessed: " + Row);
}



//gets all slips for a UUID, SlipType, or from  [or by reverse Row number!]
function getSlips(UUID, SlipType, From) {

    var UserData = retrieveUserData();
    if ((UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["DEAN"]) || (UUID != null && UserData[studentData["ACCESS"] - 1] == accessLevels["FACULTY"]) || (UUID != null && UserData[studentData["UUID"] - 1] == UUID && UserData[studentData["ACCESS"] - 1] >= accessLevels["PREFECT"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["STUDENT"])) {

        var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
        var maxadvisor = advisorlists.getLastRow();
        var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, studentData["FIRST"]);

        var alladv = {}; //associative object
        var num = 0;
        for (var setadv = 0; setadv < advisordata.length; setadv++) {
            if (advisordata[setadv][studentData["FIRST"] - 1] != "" || advisordata[setadv][studentData["LAST"] - 1] != "") {
                alladv[advisordata[setadv][studentData["UUID"] - 1]] = advisordata[setadv][studentData["FIRST"] - 1] + " " + advisordata[setadv][studentData["LAST"] - 1];
                num++;
            }
        }

        var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();

        var maxslips = curslips.getLastRow();

        var seach;
        var columnnum;
        if (UUID != null) {
            columnnum = eslipData["UUID"];
            search = UUID;
        } else if (SlipType != null) {
            columnnum = eslipData["SLIPTYPE"];
            search = SlipType;
        } else if (From != null) {
            columnnum = eslipData["FROM"];
            search = From;
        }

        var slipdata = curslips.getSheetValues(2, 1, maxslips, eslipData["LENGTH"]);

        var returndata = [
            ["X"]
        ];

        var classlists;
        var maxclass;
        var classdata = [
            ["X"]
        ];

        var num = 0;
        for (var check = 0; check < slipdata.length; check++) {

            //if the cell has the sought value
            if (slipdata[check][columnnum - 1] == search) {

                //because the row is returned as a multidimensional array, it must be taken at the 0 index (for only the row)...
                returndata[num] = slipdata[check];

                if (num == 0) {
                    classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
                    maxclass = classlists.getLastRow();
                    classdata = classlists.getSheetValues(2, 1, maxclass, studentData["LENGTH"]);
                }


                //Translate UUID To Name 
                for (var check2 = 0; check2 < classdata.length; check2++) {

                    if (classdata[check2][studentData["UUID"] - 1] == slipdata[check][eslipData["UUID"] - 1]) {
                        var nick1 = "";
                        if (classdata[check2][studentData["NICKNAME"] - 1] != "") {
                            nick1 = " (" + classdata[check2][studentData["NICKNAME"] - 1] + ") ";
                        }

                        returndata[num][eslipData["UUID"] - 1] = classdata[check2][studentData["FIRST"] - 1] + " " + nick1 + classdata[check2][studentData["LAST"] - 1];

                        var grade = classdata[check2][studentData["GRADE"] - 1] ? " (" + classdata[check2][studentData["GRADE"] - 1] + ")" : "";

                        if (alladv[classdata[check2][studentData["ADVISOR"] - 1]] != null) {
                            returndata[num][returndata[num].length] = alladv[classdata[check2][studentData["ADVISOR"] - 1]] + grade.trim(); //set grade as final (really cheaty method :) )
                        } else {
                            returndata[num][returndata[num].length] = grade.trim(); //set grade as final (really cheaty method :) )
                        }

                        break;
                    }
                }

                num++;

            }

        }

        if (num > 0) {
            return returndata;
        } else {
            return -1;
        }
    } else {
        writeLog("User lacks privilege: View Slips");
        throw new Error("User lacks privilege");
    }
}