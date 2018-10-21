//function test(){
// SubmitSlip("1", "1", "Test", null, null, null, null, null, "1"); 
//}

//writes a slip
function SubmitSlip(UUID, SlipType, Text, P1, P2, P3, P4, R, CitPer) {
    //preconditions to check slips for functions:
    //if (P1 === null || typeof SlipType === 'string' && P1.charAt(0) !== "=" )
    //    console.log("type");
    if (typeof Text === 'string')
        Text = Text.trim();

    UUID = String(UUID);

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

        const unableToWriteBadSlip = UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.CAPTAIN && UserData[STUDENT_DATA["GRADE"] - 1] < 11 && SlipType === 2;

        if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.CAPTAIN && unableToWriteBadSlip === false) {
            //var lock = LockService.getPublicLock();

            //LOCK CODE FORMERLY USED TO INHIBIT REFIRING (GOOGLE PROBLEM) SEEMS TO HAVE BEEN FIXED.
            //var lock = LockService.getUserLock();
            //lock.waitLock(3000); //3 second delay

            var lock = LockService.getScriptLock();
            lock.waitLock(10000);

            var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL'));
            var cursheet = curslips.getActiveSheet();
            cursheet.insertRows(2);

            var time = new Date();

            var From = UserData[STUDENT_DATA["EMAIL"] - 1];

            var targetRange = cursheet.getRange(2, 1, 1, SLIP_DATA.LENGTH).setValues([[UUID, SlipType, From, Text, P1, P2, P3, P4, R, CitPer, time.getMonth() + 1 + "/" + time.getDate() + "/" + time.getYear()]]);

            SpreadsheetApp.flush();

            writeEmail_(UUID, NUM_TO_SLIP[SlipType]);


        } else {
            writeLog("User lacks privilege: Write Slip");
            throw new Error("User lacks privilege");
        }

    } else {
        writeLog("Attempted to write Spreadsheet Function");
        throw new Error("Do not use = at beginning of text.");
    }
}


function getSpecificSlip_(Row) {

    var UserData = retrieveUserData();

    var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
    var advisordata = advisorlists.getSheetValues(2, 1, advisorlists.getLastRow(), STUDENT_DATA.FIRST);

    var alladv = {}; //associative object
    var num = 0;
    for (var setadv = 0; setadv < advisordata.length; setadv++) {
        if (advisordata[setadv][STUDENT_DATA.FIRST - 1] || advisordata[setadv][STUDENT_DATA.LAST - 1]) {
            alladv[advisordata[setadv][STUDENT_DATA.UUID - 1]] = advisordata[setadv][STUDENT_DATA.FIRST - 1] + " " + advisordata[setadv][STUDENT_DATA.LAST - 1];
            num++;
        }
    }

    var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();

    var slipdata;

    if (Row && curslips.getLastRow() - Row >= 1 && Row >= 1) {
        slipdata = curslips.getSheetValues(curslips.getLastRow() - Row + 1, 1, 1, SLIP_DATA.LENGTH);
    } else {
        //throw new Error( "Slip Index out of Range. Please Reload Script with " + PropertiesService.getScriptProperties().getProperty('execURL') );
        console.log("Slip Index out of Range: " + Row);
        return -1;
    }

    var slipID = slipdata[0][SLIP_DATA.UUID - 1];

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
            classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);
        }


        //Translate UUID To Name 
        for (var check2 = 0; check2 < classdata.length; check2++) {

            if (classdata[check2][STUDENT_DATA.UUID - 1] == slipdata[check][SLIP_DATA.UUID - 1]) {
                var nick1 = "";
                if (classdata[check2][STUDENT_DATA["NICKNAME"] - 1] != "") {
                    nick1 = " (" + classdata[check2][STUDENT_DATA["NICKNAME"] - 1] + ") ";
                }

                returndata[num][SLIP_DATA.UUID - 1] = classdata[check2][STUDENT_DATA["FIRST"] - 1] + " " + nick1 + classdata[check2][STUDENT_DATA["LAST"] - 1];

                var grade = classdata[check2][STUDENT_DATA["GRADE"] - 1] ? " (" + classdata[check2][STUDENT_DATA["GRADE"] - 1] + ")" : "";

                if (alladv[classdata[check2][STUDENT_DATA["ADVISOR"] - 1]] != null) {
                    returndata[num][returndata[num].length] = alladv[classdata[check2][STUDENT_DATA["ADVISOR"] - 1]] + grade; //set grade as final (really cheaty method :) )
                } else {
                    returndata[num][returndata[num].length] = grade; //set grade as final (really cheaty method :) )
                }

                break;
            }
        }

        num++;

    }

    if (num > 0) {

        if (String(slipID) !== String(UserData[STUDENT_DATA.UUID - 1]) && UserData[STUDENT_DATA.ACCESS - 1] > ACCESS_LEVELS.FACULTY) {
            writeLog("User lacks privilege: View Slip Parameter: " + Row);
            //throw new Error( "User lacks privilege");
            console.log("User lacks privilege: View Slip Parameter: " + Row);
        } else {
            writeParameter(Row);
            return returndata;
        }
    }
    return -1;
}

function writeParameter(Row) {
    //Utilities.sleep(10);
    writeLog("Slip Parameter Accessed: " + Row);
}



//gets all slips for a UUID, SlipType, or from  [or by reverse Row number!]
function getSlips(UUID, SlipType, From) {

    var UserData = retrieveUserData();
    if ((UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.DEAN) || (UUID != null && UserData[STUDENT_DATA.ACCESS - 1] == ACCESS_LEVELS.FACULTY) || (UUID != null && UserData[STUDENT_DATA.UUID - 1] == UUID && UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.PREFECT && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.STUDENT)) {

        var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
        var maxadvisor = advisorlists.getLastRow();
        var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, STUDENT_DATA["FIRST"]);

        var alladv = {}; //associative object
        var num = 0;
        for (var setadv = 0; setadv < advisordata.length; setadv++) {
            if (advisordata[setadv][STUDENT_DATA["FIRST"] - 1] != "" || advisordata[setadv][STUDENT_DATA["LAST"] - 1] != "") {
                alladv[advisordata[setadv][STUDENT_DATA.UUID - 1]] = advisordata[setadv][STUDENT_DATA["FIRST"] - 1] + " " + advisordata[setadv][STUDENT_DATA["LAST"] - 1];
                num++;
            }
        }

        var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();

        var maxslips = curslips.getLastRow();

        var seach;
        var columnnum;
        if (UUID != null) {
            columnnum = SLIP_DATA.UUID;
            search = UUID;
        } else if (SlipType != null) {
            columnnum = SLIP_DATA.SLIPTYPE;
            search = SlipType;
        } else if (From != null) {
            columnnum = SLIP_DATA.FROM;
            search = From;
        }

        var slipdata = curslips.getSheetValues(2, 1, maxslips, SLIP_DATA.LENGTH);

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
                    classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);
                }


                //Translate UUID To Name 
                for (var check2 = 0; check2 < classdata.length; check2++) {

                    if (classdata[check2][STUDENT_DATA.UUID - 1] == slipdata[check][SLIP_DATA.UUID - 1]) {
                        var nick1 = "";
                        if (classdata[check2][STUDENT_DATA["NICKNAME"] - 1] != "") {
                            nick1 = " (" + classdata[check2][STUDENT_DATA["NICKNAME"] - 1] + ") ";
                        }

                        returndata[num][SLIP_DATA.UUID - 1] = classdata[check2][STUDENT_DATA["FIRST"] - 1] + " " + nick1 + classdata[check2][STUDENT_DATA["LAST"] - 1];

                        var grade = classdata[check2][STUDENT_DATA["GRADE"] - 1] ? " (" + classdata[check2][STUDENT_DATA["GRADE"] - 1] + ")" : "";

                        if (alladv[classdata[check2][STUDENT_DATA["ADVISOR"] - 1]] != null) {
                            returndata[num][returndata[num].length] = alladv[classdata[check2][STUDENT_DATA["ADVISOR"] - 1]] + grade; //set grade as final (really cheaty method :) )
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
