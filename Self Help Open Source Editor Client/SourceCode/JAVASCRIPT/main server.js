//Dictionaries for Column Values.
var ACCESS_LEVELS = Object.freeze({ADMIN: 1, DEAN: 2, FACULTY: 3, PREFECT: 4, PROCTOR: 5, CAPTAIN: 6, STUDENT: 7});
var STUDENT_DATA = Object.freeze({UUID: 1, EMAIL: 2, ACCESS: 3, GRADE: 4, LAST: 5, FIRST : 6, NICKNAME: 7, ADVISOR: 8, 
JOB1: 9, JOB2: 10, JOB3: 11, JOB4: 12, JOB5: 13, JOB6: 14, FALL: 15, WINTER: 16, SPRING: 17, LENGTH : 17});
//advisorData = STUDENT_DATA until First (where it ends)
var SLIP_DATA = Object.freeze({UUID: 1, SLIPTYPE: 2, FROM: 3, TEXT: 4, P1: 5, P2: 6, P3: 7, P4: 8, R:9, CIT: 10, DATE: 11, LENGTH: 11 });
var JOB_DATA = Object.freeze({UJID: 1, NAME: 2, C1: 3, C2: 4, P1: 5, P2: 6, POINTER: 7, LENGTH: 7 });
var NUM_TO_SLIP = ["","Good Slip", "Bad Slip", "Job Rec"];
var setupData = Object.freeze({CURCIT: 1, C1: 2, C2: 3, C3: 4, C4: 5, C5: 6, C6: 7, CEND: 8, FALL: 9, WINTER: 10, SPRING: 11,
SOTWURL: 12, SOTWTXT: 13, CLASSLIST: 14, FACLIST: 15, JOBDAT: 16, ACTURL: 17, ESLIPDAT: 18, LOGURL: 19, EXECURL: 20, MAILGROUP: 21, REGISTER: 22, REGSPREAD: 23, LENGTH: 23});
var ACTIVITY_DATA = Object.freeze({UAID: 1, NAME: 2, TYPE: 3, REQ: 4, CAP: 5, CUR: 6, LENGTH: 6});
var NUM_TO_ACTIVITY = ["","Sport","Art Intensive","Monday Art","Independent Activity"];

/**
 * HTML GET Method - mandated for Execution.
 * @param {Object} e Optional Request / Parameters Object
 * @returns {HTML.HTMLOutput} Evaluated HTML Output
 */
function doGet(e) {

    //Slip ID Parameter used to open specific slips by link for quick access. 
    //In form ?SlipID=... at end of URL
    if (!e.parameter.SlipID)
        PropertiesService.getUserProperties().setProperty("SlipID", e.parameter.SlipID);
    else
        PropertiesService.getUserProperties().setProperty("SlipID", "");

    if (e.parameter.update)
        updateURLS_();

    var client = HtmlService.createTemplateFromFile("main client").evaluate();
    client.setTitle("Self-Help at Wooster");
    client.setFaviconUrl("https://image.ibb.co/e26hgn/new_Self_Help_Logo.png");
    client.addMetaTag('viewport', 'width=device-width, initial-scale=.35');
    return client; //Set current HTML UI
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Event triggered hourly to delete duplicate slips.
 */
function destroyDuplicateSlips() {
    updateURLS_(); //also update the URLS

    var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL')).getActiveSheet();
    var maxslips = curslips.getLastRow();
    var slipdata = curslips.getSheetValues(2, 1, maxslips, SLIP_DATA.LENGTH);

    for (var check = slipdata.length - 1; check >= 1; check--) {
        if (slipdata[check][SLIP_DATA.UUID - 1] === slipdata[check - 1][SLIP_DATA.UUID - 1] && //same uuid
            slipdata[check][SLIP_DATA.FROM - 1] === slipdata[check - 1][SLIP_DATA.FROM - 1] && //from same person
            slipdata[check][SLIP_DATA["TEXT"] - 1] === slipdata[check - 1][SLIP_DATA["TEXT"] - 1] //same text
        ) {
            //Logger.log(check);
            curslips.deleteRow(check + 1);
            writeLog("Destroyed a duplicate @ " + check + 1);
        }
    }
}

/**
 * Updates the latest URL data from the Setup information
 */
function updateURLS_() {
    var data = getSetupData();
    PropertiesService.getScriptProperties().setProperty('classlistURL', data[setupData["CLASSLIST"] - 1]);
    PropertiesService.getScriptProperties().setProperty('faclistURL', data[setupData["FACLIST"] - 1]);
    PropertiesService.getScriptProperties().setProperty('eslipdatURL', data[setupData["ESLIPDAT"] - 1]);
    PropertiesService.getScriptProperties().setProperty('jobdatURL', data[setupData["JOBDAT"] - 1]);
    PropertiesService.getScriptProperties().setProperty('sotwURL', data[setupData["SOTWURL"] - 1]);
    PropertiesService.getScriptProperties().setProperty('sotwTXT', data[setupData["SOTWTXT"] - 1]);
    PropertiesService.getScriptProperties().setProperty('logURL', data[setupData["LOGURL"] - 1]);
    PropertiesService.getScriptProperties().setProperty('execURL', data[setupData["EXECURL"] - 1]);
    PropertiesService.getScriptProperties().setProperty('actURL', data[setupData["ACTURL"] - 1]);
    PropertiesService.getScriptProperties().setProperty('regURL', data[setupData["REGSPREAD"] - 1]);

    //Temporarily set to this dev URL
    //PropertiesService.getScriptProperties().setProperty('execURL', "https://script.google.com/a/macros/woosterschool.org/s/AKfycbyQvd1cYl9N1B5tegmJ3pKgs-bCIFZ0yyN4MM-ltas/dev" );

    PropertiesService.getScriptProperties().setProperty('mailGroup', data[setupData["MAILGROUP"] - 1]);
}

/**
 * Gets the User Email
 * @returns {String} or returns -1 if it is null
 */
function getEmail() {
    var UserEmail = Session.getActiveUser().getEmail();
    if (!UserEmail)
        return -1;
    return UserEmail;
}



/**
 * Gets data from Setup Spreadsheet
 * @returns {Object} Setup Array
 */
function getSetupData() {
    var setuplist = SpreadsheetApp.openByUrl("https://docs.google.com/a/woosternet.org/spreadsheets/d/1-h7EDv0-fxFdrfmaZtpMHA2oABKIRQ3uMSCixJ89-b4/edit?usp=sharing"); //CONSTANT URL FOR SETUP LIST! DO NOT MODIFY
    var cursheet = setuplist.getActiveSheet();
    var max = cursheet.getLastRow();
    var data = cursheet.getSheetValues(1, 2, setupData["LENGTH"], 1);
    var transform = [];
    data.forEach(function (element) {
        transform[transform.length] = element[0];
    });
    return transform;
}

function getParameterData() {

    var transform = [];
    var SlipID = PropertiesService.getUserProperties().getProperty("SlipID");
    if (!SlipID) {
        var slipVal = getSpecificSlip(parseInt(SlipID));

        if (slipVal !== -1) {
            var oSlipID = {};
            oSlipID.name = "SlipID";
            oSlipID.value = slipVal;

            transform.push(oSlipID);
        }
        return transform;
    }

    if (transform.length > 0)
        return transform;
    else
        return -1;
}

/**
 * Get Active User Data (based upon User Email)
 * @returns {Array} User Data, -1 if not found
 */
function getPermission() {

    var email = getEmail();
    console.log(email);
    if (email !== -1) {
        var activeUser;
        if (email.toLowerCase().indexOf("woosterschool.org") > 0) //look for faculty if woosterschool.org is domain
            activeUser = getFacultyData(STUDENT_DATA["EMAIL"], email);
        else
            activeUser = getColumnData(STUDENT_DATA["EMAIL"], email, false);

        if (activeUser !== -1) {
            //only one instance of each email, so use the first index
            PropertiesService.getUserProperties().setProperty(String(email), String(activeUser));
            return activeUser[0];
        }

    }
    return -1;
}

/**
 * Optains the stored User Data
 * @returns {array} of User Data
 */
function retrieveUserData() {
    var getUser = PropertiesService.getUserProperties().getProperty(getEmail());
    getUser.replace(/[\[\]']+/g, '');
    getUser = getUser.split(",");
    return getUser;
}

var getColumnDataLastData = [];
var getColumnDataLastCol = -1;


/**
 * Gets the column data based upon finding a specific value in the given column
 * @param {number} columnNum The column number to search
 * @param {any} value The value you are looking for.
 * @param {boolean} translateadvisor Whether or not to translate the advisor info.
 * @returns {Array} 2D array of row to column data, -1 if noting found.
 */
function getColumnData(columnNum, value, translateadvisor) {

    var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL'));
    var cursheet = classlists.getActiveSheet();

    if (columnNum !== getColumnDataLastCol) {
        var max = cursheet.getLastRow() - 1;
        getColumnDataLastData = cursheet.getSheetValues(2, columnNum, max, 1);
        getColumnDataLastCol = columnNum;
    }

    var ColumnData = [
        []
    ];

    var num = 0;
    for (var check = 0; check < getColumnDataLastData.length; check++) {

        if (getColumnDataLastData[check] == value ){ //if the cell has the sought value
            ColumnData[num] = cursheet.getSheetValues(check + 2, 1, 1, STUDENT_DATA["LENGTH"])[0];
            num++;
        }
    }
    if (num > 0)
        return ColumnData;
    else
        return -1;
}

//gets data for advisor stuff
function getFacultyData(column, value) {

    var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
    var maxadvisor = advisorlists.getLastRow() - 1;
    var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, STUDENT_DATA["FIRST"]);

    var userdata = [
        []
    ];

    var num = 0;
    for (var check = 0; check < advisordata.length; check++) {

        if (advisordata[check][column - 1] === value) { //if the cell has the sought value
            userdata[num] = advisordata[check];
            num++;
        }
    }
    if (num > 0)
        return userdata;
    else
        return -1;
}

/**
 * Sort Students Comparator
 * @param {Array} x Left Component
 * @param {Array} y Right Component
 * @returns {number} Integer Comparison
 */
function sortStudents_(x, y) {
    if (x[STUDENT_DATA["GRADE"] - 1] < y[STUDENT_DATA["GRADE"] - 1])
        return 1;
    if (x[STUDENT_DATA["GRADE"] - 1] > y[STUDENT_DATA["GRADE"] - 1])
        return -1;
     
    return x[STUDENT_DATA["LAST"] - 1].localeCompare(y[STUDENT_DATA["LAST"] - 1]);
}

//gets every single student in the spreadsheet and convert advisor name
function getAllStudents(convertadv) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.CAPTAIN) {
        var classlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('classlistURL')).getActiveSheet();
        var maxclass = classlists.getLastRow();
        var classdata = classlists.getSheetValues(2, 1, maxclass, STUDENT_DATA["LENGTH"]);

        var advisorlists = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('faclistURL')).getActiveSheet();
        var maxadvisor = advisorlists.getLastRow();
        var advisordata = advisorlists.getSheetValues(2, 1, maxadvisor, STUDENT_DATA["FIRST"]);

        var alladv = {}; //associative object
        var num = 0;
        for (var setadv = 0; setadv < advisordata.length; setadv++) {
            if (advisordata[setadv][STUDENT_DATA["FIRST"] - 1] !== "" || advisordata[setadv][STUDENT_DATA["LAST"] - 1] !== "") {
                alladv[advisordata[setadv][STUDENT_DATA.UUID - 1]] = advisordata[setadv][STUDENT_DATA["FIRST"] - 1] + " " + advisordata[setadv][STUDENT_DATA["LAST"] - 1];
                num++;
            }
        }

        //Note that multidemensional arrays in javascript are just arrays of arrays.
        var userdata = [
            []
        ];
        num = 0;

        for (var set = 0; set < classdata.length; set++) {
            //ensure that this is actually a person
            if (classdata[set][STUDENT_DATA["FIRST"] - 1] !== "" || classdata[set][STUDENT_DATA["LAST"] - 1] !== "") {
                //because the row is returned as a multidimensional array, it must be taken at the 0 index (for only the row)...
                userdata[num] = classdata[set];

                //load corresponding advisor name
                if (convertadv === true && alladv[userdata[num][STUDENT_DATA["ADVISOR"] - 1]] !== null) {
                    userdata[num][STUDENT_DATA["ADVISOR"] - 1] = alladv[userdata[num][STUDENT_DATA["ADVISOR"] - 1]];
                }

                num++;
            }
        }

        userdata.sort(function (x, y) { return sortStudents_(x, y); });

        return userdata;
    } else {
        writeLog("User lacks privilege: Get All Students");
        throw new Error("User lacks privilege");
    }
}

/**
 * Writes to the activity log
 * @param {string} log String
 */
function writeLog(log) {
    var ScriptID = ScriptApp.getScriptId();
    if (ScriptID !== "1n3epqcZQ6cQPNXbkhZ0erPxWVbRKcgiJmom8dljUr6bEYrUhCCCHXzKr" &&
        ScriptID !== "1HKHL5pViG8GNi-aR7U8d4NQUpSngWZwpI66xbt0p_i9eBtLnk6fnUzAd"    ) { //not the dev versions

        log = log.trim();

        if (log.charAt(0) === "=") //remove any equals signs
            log = log.replace("0", "");

        var actlist = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('logURL'));
        var cursheet = actlist.getActiveSheet();
        cursheet.insertRows(2);
        var time = new Date();

        cursheet.getRange(2, 1, 1, 4).setValues([
            [Session.getActiveUser().getEmail(), time.toLocaleTimeString(), time.getMonth() + 1 + "/" + time.getDate() + "/" + time.getYear(), log]
        ]);

        SpreadsheetApp.flush();
    }
}


