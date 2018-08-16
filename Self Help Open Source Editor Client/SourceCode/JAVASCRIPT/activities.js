/**
 * Retrieves the Activity List corresponding to the given Period
 * @param Period The period you want info for.
 * @returns {Sheet} Sheet if valid, otherwise null
 */
function getActivityList_(Period) {
    var aclist = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('actURL'));
    var sheets = aclist.getSheets();
    for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getName() === String(Period))
            return sheets[i];
    }
    return null;
}

/**
 * Gets All Activities
 * @param Period For given Activity Period
 * @returns {Array} Array of Jobs
 */
function getAllActivities(Period) {

    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["STUDENT"])
        return allActivities_(Period, UserData[studentData["UUID"] - 1]);
    else {
        writeLog("User lacks privilege: Get All Activities");
        throw new Error("User lacks privilege");
    }

}

/**
 * Gets All Activities
 * @param Period For given Activity Period
 * @returns {Array} Array of Jobs
 */
function deanAllActivities(Period, UUID) {

    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["STUDENT"])
        return allActivities_(Period, UUID);
    else {
        writeLog("User lacks privilege: Get All Activities");
        throw new Error("User lacks privilege");
    }

}

/**
 * Gets all activities with UUID parameter to indicate registration
 * @param Period
 * @param UUID
 * @returns
 */
function allActivities_(Period, UUID) {

    var actlists = getActivityList_(Period);

    var num = 0;
    if (actlists) {

        var maxact = actlists.getLastRow();

        var ActivityData = actlists.getSheetValues(2, actData["UAID"], maxact, actData["LENGTH"]); //[[]]

        var ReturnData = [
            []
        ];
        var num = 0;
        for (var set = 0; set < ActivityData.length; set++) {
            if (ActivityData[set][actData["UAID"] - 1] && ActivityData[set][actData["NAME"] - 1]) {
                ReturnData[num] = ActivityData[set];
                num++;
            }
        }

        var myData = deanGetActivities(Period, UUID);

    }

    if (ReturnData && ReturnData.length > 0) {
        ReturnData.sort(
            function (x, y) {
                return x[actData["NAME"] - 1].localeCompare(y[actData["NAME"] - 1]);
            }
        );
        return [ReturnData, myData];
    } else
        return -1;

}

/**
 * Gets user activity data
 * @param Period for given period
 * @returns JSON parsed object or -1 if invalid
 */
function getUserActivities(Period) {
    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["STUDENT"])
        return getActivities_(Period, UserData[studentData["UUID"] - 1]);
    else {
        writeLog("User lacks privilege: Get User Activities");
        throw new Error("User lacks privilege");
    }
}

/**
 * Gets user activity data
 * @param Period for given period
 * @returns JSON parsed object or -1 if invalid
 */
function deanGetActivities(Period, UUID) {
    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] === accessLevels["ADMIN"] || UserData[studentData["ACCESS"] - 1] === accessLevels["DEAN"])
        return getActivities_(Period, UUID);
    else {
        writeLog("User lacks privilege: Dean Get Activities");
        throw new Error("User lacks privilege");
    }
}

function getActivities_(Period, UUID) {
    var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
    var maxclass = classlists.getLastRow();
    var classdata = classlists.getSheetValues(2, 1, maxclass, studentData["LENGTH"]);

    for (var i = 0; i < classdata.length; i++) {
        if (classdata[i][studentData["UUID"] - 1] === UUID) {
            var ret = classlists.getRange(2 + i, studentData[Period.toUpperCase()]).getValue();
            if (ret)
                return JSON.parse(ret);
            return -1;
        }
    }
}

/**
 * Stores user activity object as JSON string
 * @param Period for given period
 * @param Data JSON object
 */
function setUserActivities(Period, Data) {
    var UserData = retrieveUserData();
    if (getRegistrationStatus() === "Enabled" && UserData[studentData["ACCESS"] - 1] === accessLevels["ADMIN"] ||
        UserData[studentData["ACCESS"] - 1] <= accessLevels["STUDENT"] && UserData[studentData["ACCESS"] - 1] >= accessLevels["PREFECT"])
        setActivities_(Period, Data, UserData[studentData["UUID"] - 1]);
    else {
        writeLog("User lacks privilege: Set User Activities");
        throw new Error("User lacks privilege");
    }

}

/**
 * Function for dean registrar to modify student data
 * @param Period for given period
 * @param Data JSON object
 * @param UUID Student
 */
function deanSetActivities(Period, Data, UUID) {
    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] === accessLevels["ADMIN"] || UserData[studentData["ACCESS"] - 1] === accessLevels["DEAN"])
        setActivities_(Period, Data, UUID);
    else {
        writeLog("User lacks privilege: Dean Set Activities");
        throw new Error("User lacks privilege");
    }

}

function setActivities_(Period, Data, UUID) {
    var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
    var maxclass = classlists.getLastRow();
    var classdata = classlists.getSheetValues(2, 1, maxclass, studentData["LENGTH"]);

    var decrementInfo = {};

    for (var i = 0; i < classdata.length; i++) {
        if (classdata[i][studentData["UUID"] - 1] === UUID) {

            var ret = classdata[i][studentData[Period.toUpperCase()] - 1];
            if (ret)
                decrementInfo = JSON.parse(classdata[i][studentData[Period.toUpperCase()] - 1]);

            if (updateActivityEnrollment_(Period, decrementInfo, Data)) //check to make sure enrollment is valid
                classlists.getRange(2 + i, studentData[Period.toUpperCase()]).setValue(JSON.stringify(Data)); //update all if so
            else //otherwise break if one is off
                throw new Error("One or more are full");
            break;
        } else if (i === classdata.length - 1)
            throw new Error("Failed to set info");
    }
}

/**
 * Updates the enrollment changed activities based on new and old user info
 * @param Period
 * @param oldInfo
 * @param newInfo
 * @returns value indicating valid enrollment
 */
function updateActivityEnrollment_(Period, oldInfo, newInfo) {
    var actlists = getActivityList_(Period);

    if (actlists) {
        var maxact = actlists.getLastRow();

        var ActivityData = actlists.getSheetValues(2, actData["UAID"], maxact, actData["LENGTH"]);

        oldInfoVals = {};
        newInfoVals = {};
        if (oldInfo)
            var oldInfoVals = [oldInfo.Activity, oldInfo.MondayArt, oldInfo.Club];
        if (newInfo)
            var newInfoVals = [newInfo.Activity, newInfo.MondayArt, newInfo.Club];

        for (var set = 0; set < ActivityData.length; set++) {

            var UAIDstr = String(ActivityData[set][actData["UAID"] - 1]);

            if (oldInfoVals.indexOf(UAIDstr) != newInfoVals.indexOf(UAIDstr)) {
                var curEnroll = ActivityData[set][actData["CUR"] - 1] ? parseInt(ActivityData[set][actData["CUR"] - 1]) : 0;
                if (oldInfoVals.indexOf(UAIDstr) >= 0 && curEnroll >= 1)
                    actlists.getRange(2 + set, actData["CUR"]).setValue(curEnroll - 1);
                if (newInfoVals.indexOf(UAIDstr) >= 0) {

                    var cap = ActivityData[set][actData["CAP"] - 1] ? parseInt(ActivityData[set][actData["CAP"] - 1]) : 0;
                    var cur = ActivityData[set][actData["CUR"] - 1] ? parseInt(ActivityData[set][actData["CUR"] - 1]) : 0;

                    if (cap - cur > 0) //if spots are left
                        actlists.getRange(2 + set, actData["CUR"]).setValue(curEnroll + 1);
                    else
                        return false;
                }
            }

        }

    }
    return true;
}

/**
 * Gets all students in a given activity
 * @param Period
 * @param UAID
 * @returns 2D array of students
 */
function getActivityMembers(Period, UAID) {
    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] === accessLevels["ADMIN"] || UserData[studentData["ACCESS"] - 1] === accessLevels["DEAN"]) {
        var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
        var maxclass = classlists.getLastRow();
        var classdata = classlists.getSheetValues(2, 1, maxclass, studentData["LENGTH"]);

        var ReturnData = [
            []
        ];

        for (var i = 0; i < classdata.length; i++) {
            if (classdata[i][studentData[Period.toUpperCase()] - 1] === UAID) {
                ReturnData[ReturnData.length] = classdata[i];
            }
        }

        ReturnData.sort(function (x, y) {
            return sortStudents_(x, y);
        });
        return ReturnData;
    } else {
        writeLog("User lacks privilege: View Activity Members");
        throw new Error("User lacks privilege");
    }
}

/**
 * @returns gets current registration status
 */
function getRegistrationStatus() {
    var setuplist = SpreadsheetApp.openByUrl("https://docs.google.com/a/woosternet.org/spreadsheets/d/1-h7EDv0-fxFdrfmaZtpMHA2oABKIRQ3uMSCixJ89-b4/edit?usp=sharing"); //CONSTANT URL FOR SETUP LIST! DO NOT MODIFY
    var cursheet = setuplist.getActiveSheet();
    var max = cursheet.getLastRow();
    var reg = cursheet.getSheetValues(setupData["REGISTER"], 2, 1, 1)[0][0];
    return reg;
}

/**
 * Flips registration to opposite state
 * @returns current registration status
 */
function toggleRegistration() {
    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] === accessLevels["ADMIN"] || UserData[studentData["ACCESS"] - 1] === accessLevels["DEAN"]) {
        var setuplist = SpreadsheetApp.openByUrl("https://docs.google.com/a/woosternet.org/spreadsheets/d/1-h7EDv0-fxFdrfmaZtpMHA2oABKIRQ3uMSCixJ89-b4/edit?usp=sharing"); //CONSTANT URL FOR SETUP LIST! DO NOT MODIFY
        var cursheet = setuplist.getActiveSheet();
        var max = cursheet.getLastRow();
        var reg = cursheet.getSheetValues(setupData["REGISTER"], 2, 1, 1)[0][0];
        if (reg === "Enabled") {
            cursheet.getRange(setupData["REGISTER"], 2).setValue("Disabled");
            return "Disabled";
        } else {
            cursheet.getRange(setupData["REGISTER"], 2).setValue("Enabled");
            return "Enabled";
        }
    } else {
        writeLog("User lacks privilege: Toggle Registration");
        throw new Error("User lacks privilege");
    }
}

/**
 * Populates Activity List Information for each season
 */
function makeActivitySpreadsheet() {
    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] === accessLevels["ADMIN"] || UserData[studentData["ACCESS"] - 1] === accessLevels["DEAN"]) {

        var actsheet = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('regURL'));

        var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
        var maxclass = classlists.getLastRow();
        var classdata = classlists.getSheetValues(2, 1, maxclass, studentData["LENGTH"]);

        var Periods = ["Fall", "Winter", "Spring"];

        for (var p = 0; p < Periods.length; p++) {

            var Period = Periods[p];

            var actlists = getActivityList_(Period);
            var maxact = actlists.getLastRow();

            var ActivityData = actlists.getSheetValues(2, actData["UAID"], maxact, actData["LENGTH"]); //[[]]

            ActivityData.sort(function (a, b) {
                if (a[actData["TYPE"] - 1] < b[actData["TYPE"] - 1])
                    return -1;
                else if (a[actData["TYPE"] - 1] > b[actData["TYPE"] - 1])
                    return 1;
                return String(a[actData["NAME"] - 1]).localeCompare(String(b[actData["NAME"] - 1]));
            });

            var activityDict = {};

            for (var set = 0; set < ActivityData.length; set++) {
                if (ActivityData[set][actData["UAID"] - 1] && ActivityData[set][actData["NAME"] - 1]) {
                    activityDict[ActivityData[set][actData["UAID"] - 1]] = ActivityData[set]; //set activity ID as index of activity data
                    activityDict[ActivityData[set][actData["UAID"] - 1]].people = [];
                }
            }

            var registry = actsheet.getSheetByName(Period);
            if (!registry) {
                actsheet.insertSheet(Period, p);
                var registry = actsheet.getSheetByName(Period);
            }
            registry.clear();

            //append students to activities
            for (var i = 0; i < classdata.length; i++) {

                var ret = classdata[i][studentData[Period.toUpperCase()] - 1];
                if (ret) {
                    var actdata = JSON.parse(ret);

                    var name = classdata[i][studentData["FIRST"] - 1] + " ";
                    if (classdata[i][studentData["NICKNAME"] - 1])
                        name += "(" + classdata[i][studentData["NICKNAME"] - 1] + ") ";
                    name += classdata[i][studentData["LAST"] - 1] + " - " + classdata[i][studentData["GRADE"] - 1];

                    if (activityDict[actdata.Activity])
                        activityDict[actdata.Activity].people.push(name);
                    if (activityDict[actdata.MondayArt])
                        activityDict[actdata.MondayArt].people.push(name);
                    if (activityDict[actdata.Club])
                        activityDict[actdata.Club].people.push(name);
                }
            }

            registry.setName(Period);
            var i = 0;
            var horiz = 0;
            var type = null;
            for (var key in activityDict) {
                var act = activityDict[key];

                //place each activity type in its own column
                if (!type)
                    type = act[actData["TYPE"] - 1];
                else if (type != act[actData["TYPE"] - 1]) {
                    type = act[actData["TYPE"] - 1];
                    i = 0;
                    horiz++;
                }
                var openslots = parseInt(act[actData["CAP"] - 1]) - parseInt(act[actData["CUR"] - 1]);
                if (!openslots) //if it's null just make it the cap
                    openslots = parseInt(act[actData["CAP"] - 1]);
                registry.getRange(i + 1, 1 + horiz * 2).setValue(act[actData["NAME"] - 1] + ": " + openslots + " slots left");
                registry.getRange(i + 1, 1 + horiz * 2).setBackground("#ffff00");
                for (var j = 0; j < act.people.length; j++) {
                    i++;
                    registry.getRange(i + 1, 1 + horiz * 2).setValue(act.people[j]);
                }
                i = i + 2;
            }
            //autosize all columns
            for (var i = 1; i <= 1 + 2 * horiz; i++)
                registry.autoResizeColumn(i);

        }

    } else {
        writeLog("User lacks privilege: Create Activity Spreadsheet");
        throw new Error("User lacks privilege");
    }
}