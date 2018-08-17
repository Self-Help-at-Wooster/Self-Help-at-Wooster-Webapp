//var myURL = "https://script.google.com/a/macros/woosterschool.org/s/AKfycbwekMjjfWNzrHSV5Oac-mUwTIyzaYjokPcJ4CNacsArvmIUPJk/exec";
/**
 * Emails Job Recommendation Request
 * @param UUID UUID of student missing Job Rec
 * @param Cit For What Citizenship Period
 */
function SubmitRecRequest(UUID, Cit) {

    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["FACULTY"]) {

        var Nick = "";
        var First = "";
        var Last = "";

        if (UserData[studentData["NICKNAME"] - 1]) //check not empty
            Nick = "(" + UserData[studentData["NICKNAME"] - 1] + ") ";
        if (UserData[studentData["FIRST"] - 1] != "" && UserData[studentData["FIRST"] - 1])
            First = UserData[studentData["FIRST"] - 1] + " ";
        if (UserData[studentData["LAST"] - 1] != "" && UserData[studentData["LAST"] - 1])
            Last = UserData[studentData["LAST"] - 1] + " ";

        //Person who requested the rec
        var From = First + Nick + Last;
        var FromEmail = UserData[studentData["EMAIL"] - 1];

        //Student who is missing their rec
        var Miss = getColumnData(studentData["UUID"], UUID, false)[0];
        var Nick = "";
        if (Miss[studentData["NICKNAME"] - 1])
            Nick = " (" + Miss[studentData["NICKNAME"] - 1] + ")";

        var MissName = Miss[studentData["FIRST"] - 1] + Nick + " " + Miss[studentData["LAST"] - 1];
        var job = Miss[studentData["JOB" + Cit] - 1];

        var jobdata = getJobData(job, false, Miss, Cit);

        var Capt1 = jobdata[jobData["C1"] - 1];
        var Capt2 = jobdata[jobData["C2"] - 1];

        if (Capt1)
            notifyCaptain_(Capt1, From, FromEmail, Cit, MissName);
        if (Capt2)
            notifyCaptain_(Capt2, From, FromEmail, Cit, MissName);
    } else {
        writeLog("User lacks privilege: Request job recs");
        throw new Error("User lacks privilege");
    }

}

/**
 * Sends Request to Captain and their Advisor
 * @param Capt 
 * @returns
 */
function notifyCaptain_(Capt, From, FromEmail, Cit, MissName) {
    var siteURL = PropertiesService.getScriptProperties().getProperty('execURL');

    var CaptData = getColumnData(studentData["UUID"], Capt, false)[0];
    var CEmail = CaptData[studentData["EMAIL"] - 1];
    var CName = CaptData[studentData["FIRST"] - 1];

    if (CaptData[studentData["NICKNAME"] - 1])
        CName += " (" + CaptData[studentData["NICKNAME"] - 1] + ")";
    var CFullName = CName + " " + CaptData[studentData["LAST"] - 1];

    var Adv = getFacultyData(studentData["UUID"], CaptData[studentData["ADVISOR"] - 1])[0];
    var AEmail = Adv[studentData["EMAIL"] - 1];
    var AName = Adv[studentData["FIRST"] - 1];

    try { //captain
        if (CEmail) {

            var returnData = [CName, MissName, Cit, From, FromEmail, siteURL, siteURL];
            var html = HtmlService.createTemplateFromFile('stuRecRequest');

            html.data = returnData;
            var template = html.evaluate().getContent();

            MailApp.sendEmail({
                to: CEmail,
                subject: "Missing Job Recommendation (Self Help At Wooster)",
                htmlBody: template
            });
        }
    } catch (ex) { }

    try { //advisor
        if (AEmail) {
            var returnData = [AName, CFullName, MissName, Cit, From, FromEmail, siteURL];
            var html = HtmlService.createTemplateFromFile('advRecRequest');

            html.data = returnData;
            var template = html.evaluate().getContent();

            MailApp.sendEmail({
                to: AEmail,
                subject: "Missing Job Recommendation From " + CFullName + " (Self Help At Wooster)",
                htmlBody: template
            });
        }
    } catch (ex) { }
}

//sends notice to student
function writeEmail_(UUID, SlipType) {

       var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["CAPTAIN"]) {

        var siteURL = PropertiesService.getScriptProperties().getProperty('execURL');
        var SlipID;
        var address;

        var Nick = "";
        var First = "";
        var Last = "";

        if (UserData[studentData["FIRST"] - 1])
            First = UserData[studentData["FIRST"] - 1] + " ";
        if (UserData[studentData["LAST"] - 1])
            Last = UserData[studentData["LAST"] - 1] + " ";
        if (UserData[studentData["NICKNAME"] - 1])
            Nick = "(" + UserData[studentData["NICKNAME"] - 1] + ") ";

        var From = First + Nick + Last;
        var FromEmail = UserData[studentData["EMAIL"] - 1];

        var Recip = getColumnData(studentData["UUID"], UUID, false)[0];

        var RecipName = Recip[studentData["FIRST"] - 1];
        var RecipEmail = Recip[studentData["EMAIL"] - 1];

        var Nick = "";
        if (Recip[studentData["NICKNAME"] - 1] != "")
            Nick = " (" + Recip[studentData["NICKNAME"] - 1] + ")";
        RecipName += Nick;
        var RecipFullName = RecipName + " " + Recip[studentData["LAST"] - 1];
        try {

            var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL'));
            var cursheet = curslips.getActiveSheet();
            SlipID = String(cursheet.getLastRow() - 1);
            address = PropertiesService.getScriptProperties().getProperty('execURL') + '?SlipID=' + SlipID;

            var returnData = [RecipName, SlipType, From, FromEmail, address, siteURL];
            var html = HtmlService.createTemplateFromFile('stuSlip');

            html.data = returnData;
            var template = html.evaluate().getContent();

            MailApp.sendEmail({
                to: RecipEmail,
                subject: "New ESlip! (Self Help At Wooster)",
                htmlBody: template
            });
        } catch (ex) {
            console.log("Failed send stu slip: " + ex);
        }

        try {
            if (Recip) {
                var Adv = Recip[studentData["ADVISOR"] - 1];

                var advisor = getFacultyData(studentData["UUID"], Adv);

                var returnData = [advisor[0][studentData["FIRST"] - 1], RecipFullName, SlipType, From, FromEmail, address, siteURL];
                var html = HtmlService.createTemplateFromFile('advSlip');

                html.data = returnData;
                var template = html.evaluate().getContent();

                MailApp.sendEmail({
                    to: advisor[0][studentData["EMAIL"] - 1],
                    subject: "New ESlip! (Self Help At Wooster)",
                    htmlBody: template
                });

            }
        } catch (ex) {
            console.log("Failed send adv slip: " + ex);
        }

    } else {
        writeLog("User lacks privilege: Write Email");
        throw new Error("User lacks privilege");
    }
}


function massEmail(recip, header, text) {

    var UserData = retrieveUserData();
    if (UserData[studentData["ACCESS"] - 1] >= accessLevels["ADMIN"] && UserData[studentData["ACCESS"] - 1] <= accessLevels["PREFECT"]) {

        //var recip = PropertiesService.getScriptProperties().getProperty('mailGroup');
        var parse = recip.split(",");
        var modrecip = "";
        for (var i = 0; i < parse.length; i++) {
            var str = parse[i].trim().toLowerCase();
            if (str.indexOf("woosternet.org") >= 0 || str.indexOf("woosterschool.org") >= 0)
                modrecip += str + " ,";
        }
        if (modrecip != "") { //sanitize user input to remove any non-wooster emails, weird spacing, and formatting
            modrecip = modrecip.substring(0, modrecip.length - 1);

            Logger.log(recip);
            MailApp.sendEmail(modrecip, header, text + "\nWritten By: " + getEmail() + "\n\nThis message was generated using the Selp Help System. Access Via: " + PropertiesService.getScriptProperties().getProperty('execURL'));
            MailApp.sendEmail("self.help@woosterschool.org", "[COPY] " + header, "THIS IS A RECORDED COPY OF ANOTHER MESSAGE\n" + text + "\nWritten By: " + getEmail() + "\n\nThis message was generated using the Selp Help System. Access Via: " + PropertiesService.getScriptProperties().getProperty('execURL'));
            writeLog("Sent Message to All");
        } else {
            throw new Error("No wooster emails");
        }
    } else {
        writeLog("User lacks privilege: Mass Email");
        throw new Error("User lacks privilege");
    }

}