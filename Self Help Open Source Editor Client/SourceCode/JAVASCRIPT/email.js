//var myURL = "https://script.google.com/a/macros/woosterschool.org/s/AKfycbwekMjjfWNzrHSV5Oac-mUwTIyzaYjokPcJ4CNacsArvmIUPJk/exec";
/**
 * Emails Job Recommendation Request
 * @param {string} UUID UUID of student missing Job Rec
 * @param {number} Cit For What Citizenship Period
 */
function SubmitRecRequest(UUID, Cit) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.FACULTY) {

        
        var fromFirst = "";
        var fromNickname = "";
        var fromLast = "";

        if (UserData[STUDENT_DATA.FIRST - 1])
            fromFirst = UserData[STUDENT_DATA.FIRST - 1] + " ";
        if (UserData[STUDENT_DATA.NICKNAME - 1])
            fromNickname = "(" + UserData[STUDENT_DATA.NICKNAME - 1] + ") ";
        if (UserData[STUDENT_DATA.LAST - 1])
            fromLast = UserData[STUDENT_DATA.LAST - 1];

        //Person who requested the rec
        var fromFullName = fromFirst + fromNickname + fromLast;

        var fromEmail = UserData[STUDENT_DATA.EMAIL - 1];

        //Student who is missing their rec
        var johnDoe = getColumnData(STUDENT_DATA.UUID, UUID, false)[0];
        var johnDoeNickname = "";
        if (johnDoe[STUDENT_DATA.NICKNAME - 1])
            johnDoeNickname = " (" + johnDoe[STUDENT_DATA.NICKNAME - 1] + ")";

        var johnDoeName = johnDoe[STUDENT_DATA.FIRST - 1] + johnDoeNickname + " " + johnDoe[STUDENT_DATA.LAST - 1];
        var job = johnDoe[STUDENT_DATA["JOB" + Cit] - 1];

        var jobdata = getJobData(job, false, johnDoe, Cit);

        var Capt1 = jobdata[JOB_DATA.C1 - 1];
        var Capt2 = jobdata[JOB_DATA.C2 - 1];

        var siteURL = PropertiesService.getScriptProperties().getProperty('execURL');

        if (Capt1)
            notifyCaptain_(Capt1, fromFullName, fromEmail, Cit, johnDoeName, siteURL);
        if (Capt2)
            notifyCaptain_(Capt2, fromFullName, fromEmail, Cit, johnDoeName, siteURL);
    } else {
        writeLog("User lacks privilege: Request job recs");
        throw new Error("User lacks privilege");
    }

}

/**
 * Sends Request to Captain and their Advisor
 * @param {array} Capt student data
 */
function notifyCaptain_(Capt, From, FromEmail, Cit, MissName, siteURL) {
    
    var CaptData = getColumnData(STUDENT_DATA.UUID, Capt, false)[0];
    var CEmail = CaptData[STUDENT_DATA["EMAIL"] - 1];
    var CName = CaptData[STUDENT_DATA["FIRST"] - 1];

    if (CaptData[STUDENT_DATA["NICKNAME"] - 1])
        CName += " (" + CaptData[STUDENT_DATA["NICKNAME"] - 1] + ")";
    var CFullName = CName + " " + CaptData[STUDENT_DATA["LAST"] - 1];

    var Adv = getFacultyData(STUDENT_DATA.UUID, CaptData[STUDENT_DATA["ADVISOR"] - 1])[0];
    var AEmail = Adv[STUDENT_DATA["EMAIL"] - 1];
    var AName = Adv[STUDENT_DATA["FIRST"] - 1];

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
    } catch (ex) {
        console.log("Failed send stu rec request: " + ex);
    }

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
    } catch (ex) {
        console.log("Failed send adv rec request: " + ex);
    }
}

//sends notice to student
function writeEmail_(UUID, SlipType) {

    var UserData = retrieveUserData();
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.CAPTAIN) {

        var siteURL = PropertiesService.getScriptProperties().getProperty('execURL');
        var SlipID;
        var address;

        var nickname = "";
        var firstname = "";
        var lastname = "";

        if (UserData[STUDENT_DATA.FIRST - 1])
            firstname = UserData[STUDENT_DATA.FIRST - 1] + " ";
        if (UserData[STUDENT_DATA.LAST - 1])
            lastname = UserData[STUDENT_DATA.LAST - 1] + " ";
        if (UserData[STUDENT_DATA.NICKNAME - 1])
            nickname = "(" + UserData[STUDENT_DATA.NICKNAME - 1] + ") ";

        var fromName = firstname + nickname + lastname;
        var fromEmail = UserData[STUDENT_DATA.EMAIL - 1];

        var recipData = getColumnData(STUDENT_DATA.UUID, String(UUID), false)[0];

        var recipName = recipData[STUDENT_DATA.FIRST - 1];
        var recipEmail = recipData[STUDENT_DATA["EMAIL"] - 1];

        var FromNick = "";
        if (recipData[STUDENT_DATA.NICKNAME - 1])
            FromNick = " (" + recipData[STUDENT_DATA.NICKNAME - 1] + ")";

        recipName += FromNick;

        var RecipFullName = recipName + " " + recipData[STUDENT_DATA["LAST"] - 1];

        try {

            var curslips = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('eslipdatURL'));
            var cursheet = curslips.getActiveSheet();
            SlipID = String(cursheet.getLastRow() - 1);
            address = PropertiesService.getScriptProperties().getProperty('execURL') + '?SlipID=' + SlipID;

            var stuSlipData = { Name: recipName, Slip: SlipType, From: fromName, FromEmail: fromEmail, SlipURL: address, SiteURL:siteURL };
            var stuSlipHtml = HtmlService.createTemplateFromFile('e_StuSlip');
            stuSlipHtml.data = stuSlipData;
            var stuSlipContent = stuSlipHtml.evaluate().getContent();

            MailApp.sendEmail({
                to: recipEmail,
                subject: "New ESlip! (Self Help At Wooster)",
                htmlBody: stuSlipContent
            });
        } catch (ex) {
            console.log("Failed send stu slip: " + ex);
        }

        try {
            if (recipData) {
                var Adv = recipData[STUDENT_DATA.ADVISOR - 1];

                var advisor = getFacultyData(STUDENT_DATA.UUID, Adv)[0];

                var advSlipData = {
                    Name: advisor[STUDENT_DATA.FIRST - 1],
                    Student: RecipFullName,
                    Slip: SlipType,
                    From: fromName,
                    FromEmail: fromEmail,
                    SlipURL: address,
                    SiteURL: siteURL
                };

                var advSlipHtml = HtmlService.createTemplateFromFile('e_AdvSlip');

                advSlipHtml.data = advSlipData;
                var advSlipContent = advSlipHtml.evaluate().getContent();

                MailApp.sendEmail({
                    to: advisor[STUDENT_DATA.EMAIL - 1],
                    subject: "New ESlip! (Self Help At Wooster)",
                    htmlBody: advSlipContent
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
    if (UserData[STUDENT_DATA.ACCESS - 1] >= ACCESS_LEVELS.ADMIN && UserData[STUDENT_DATA.ACCESS - 1] <= ACCESS_LEVELS.PREFECT) {

        //var recip = PropertiesService.getScriptProperties().getProperty('mailGroup');
        var parse = recip.split(",");
        var modrecip = "";
        for (var i = 0; i < parse.length; i++) {
            var str = parse[i].trim().toLowerCase();
            if (str.indexOf("woosternet.org") >= 0 || str.indexOf("woosterschool.org") >= 0)
                modrecip += str + " ,";
        }
        if (modrecip) { //sanitize user input to remove any non-wooster emails, weird spacing, and formatting
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