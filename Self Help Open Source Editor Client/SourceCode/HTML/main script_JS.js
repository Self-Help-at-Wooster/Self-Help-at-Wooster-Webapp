
    //Dictionaries for Column Values
    const ACCESS_LEVELS = Object.freeze({ADMIN: 1, DEAN: 2, FACULTY: 3, PREFECT: 4, PROCTOR: 5, CAPTAIN: 6, STUDENT : 7});
    const STUDENT_DATA = Object.freeze({UUID: 1, EMAIL: 2, ACCESS: 3, GRADE: 4, LAST: 5, FIRST : 6, NICKNAME: 7, ADVISOR: 8, JOB1: 9, JOB2: 10, JOB3: 11, JOB4: 12, JOB5: 13, JOB6: 14, LENGTH : 14});
    //advisorData = STUDENT_DATA until First (where it ends)
    const SLIP_DATA = Object.freeze({UUID: 1, SLIPTYPE: 2, FROM: 3, TEXT: 4, P1: 5, P2: 6, P3: 7, P4: 8, R:9, CIT: 10, DATE: 11, LENGTH: 11 });
    const JOB_DATA = Object.freeze({UJID: 1, NAME: 2, C1: 3, C2: 4, P1: 5, P2: 6, POINTER: 7, LENGTH: 7 });
    const NUM_TO_SLIP = ["","Good Slip", "Bad Slip", "Job Rec"];
    const setupData = Object.freeze({CURCIT: 1, C1: 2, C2: 3, C3: 4, C4: 5, C5: 6, C6: 7, CEND: 8, FALL: 9, WINTER: 10, SPRING: 11,
        SOTWURL: 12, SOTWTXT: 13, CLASSLIST: 14, FACLIST: 15, JOBDAT: 16, ACTURL: 17, ESLIPDAT: 18, LOGURL: 19, EXECURL: 20, MAILGROUP: 21, REGISTER: 22, REGSPREAD: 23, LENGTH: 23});
    const ACTIVITY_DATA = Object.freeze({UAID: 1, NAME: 2, TYPE: 3, REQ: 4, CAP: 5, CUR: 6, LENGTH: 6});
    const NUM_TO_ACTIVITY = ["","Sport","Art Intensive","Monday Art","Independent Activity"];
    
    function getAccessLevel(){
        return activeUser[STUDENT_DATA.ACCESS-1];
    }

    const FunctionType = Object.freeze({
        ViewJob: 1, 
        ViewSlips: 2, 
        WriteSlips: 3, 
        FacSlips: 4, 
        AllSlips: 5, 
        AdvSnap: 6, 
        JobSnap: 7, 
        WriteEmail: 8, 
        CreateJobs: 9, 
        CreateAdvs: 10, 
        SetAct: 11,
        DeanAct: 12
        });
    
    var SelectedFunction = 0;

    //SUPER FREEZY CHILLY SIBERIAN GULAG GOODNESS
    // To do so, we use this function.
    function deepFreeze(obj) {

        // Retrieve the property names defined on obj
        var propNames = Object.getOwnPropertyNames(obj);

        // Freeze properties before freezing self
        propNames.forEach(function(name) {
            var prop = obj[name];

            // Freeze prop if it is an object
            if (typeof prop === 'object' && prop !== null)
                deepFreeze(prop);
        });

        obj.writable = false;

        // Freeze self (no-op if already frozen)
        "use strict";
        return Object.freeze(obj);
    }

    var activeUser = [];

    var activeSetup = {
        execURL: "",
        mailGroup: "",
        badcurcit: ""
    };

    var registrationStatus;
    
    var stop = 0;

    function stopThat() {
        stop++;

        if (stop === 5) {
            stop = 0;
            showModal(0, "You found the ham in the spam!");
            //setTimeout(function(){window.location.href = String(activeSetup.execURL); /*window.location.reload(true);*/},5000);
        }
    }

    var userSlips = [];

    var login = false;

    //test mobile browsers
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    window.addEventListener("load", function() {

         google.script.run
            .withFailureHandler(() => {
                showModal(0, "Failed to load User Email");
            })
            .withSuccessHandler(updateButton)
            .withUserObject(document.getElementById("btnload"))
            .getEmail();

        google.script.run
            .withFailureHandler(() => {
                showModal(0, "Failed to setup data");
            })
            .withSuccessHandler(getSetup)
            .getSetupData();

        google.script.run
            .withSuccessHandler(checkParameters)
            .getParameterData();

        var setList = ["StudentList", "JobList"];

        for (var set = 0; set < setList.length; set++) {
            document.getElementById(setList[set]).addEventListener("click", function(event) {
                showSelected(event);
            });
            document.getElementById(setList[set]).addEventListener("mousemove", function(event) {
                showSelected(event);
            });
            document.getElementById(setList[set]).addEventListener("keyup", function(event) {
                showSelected(event);
            });

            document.getElementById(setList[set]).addEventListener("blur", function(e) {
                document.getElementById("ListCount").style.display = "none";
            });

            document.getElementById(setList[set]).addEventListener("mouseout", function(e) {
                document.getElementById("ListCount").style.display = "none";
            });

            document.getElementById(setList[set]).addEventListener("mousewheel", function(e) {
                if (e.ctrlKey) {
                    e.preventDefault();
                    var sender = e.target || e.srcElement;
                    while (["StudentList", "JobList"].indexOf(sender.id) == -1) {
                        sender = sender.parentNode;
                    }
                    sender.scrollTop += 100 * Math.sign(-1 * e.wheelDelta);
                }
            });
        }

    });

    // When the user scrolls down 20px from the top of the document, show the button
    document.addEventListener("scroll", scrollFunction, false);
    document.addEventListener("touchmove", scrollFunction, false);

    var test = 0;

    function scrollFunction() {

        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20 || parent.window.pageYOffset > 20) {
            document.getElementById("topbtn").style.display = "block";
        } else {
            document.getElementById("topbtn").style.display = "none";
        }
    }

    // When the user clicks on the button, scroll to the top of the document
    function topFunction() {
        document.body.scrollTop = 0; // For Chrome, Safari and Opera 
        document.documentElement.scrollTop = 0; // For IE and Firefox
    }

    //Finds y value of given object
    function findPos(obj) {
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return [curtop];
        }
    }
    
    function updateRegStatus(){
        google.script.run.withSuccessHandler( function(x) {
            document.getElementById("regstatus").innerHTML = "Registration is currently " + x;
            document.getElementById("sturegstatus").innerHTML = "Registration is currently " + x;
            registrationStatus = x;
        } )
        .getRegistrationStatus();
    }

    function getSetup(setup) {

        activeSetup.execURL = setup[setupData["EXECURL"] - 1];
        activeSetup.mailGroup = setup[setupData["MAILGROUP"] - 1];
        registrationStatus = setup[setupData["REGISTER"] - 1];

        //add dates to citizenship period checkbox
        var citpers = setup.slice(setupData["C1"] - 1, setupData["CEND"]);

        for (var check = 0; check < citpers.length; check++) {

            try {
                document.getElementById("citper").options[check + 1].innerHTML += ": " + citpers[check];
            } catch (ex) {}
        }
        

       document.getElementById("seasonselect").options[1].innerHTML += ": " + setup[setupData["FALL"]-1];
       document.getElementById("seasonselect").options[2].innerHTML += ": " + setup[setupData["WINTER"]-1];
       document.getElementById("seasonselect").options[3].innerHTML += ": " + setup[setupData["SPRING"]-1];
       document.getElementById("regstatus").innerHTML = "Registration is currently " + setup[setupData["REGISTER"] - 1];
       document.getElementById("sturegstatus").innerHTML = "Registration is currently " + setup[setupData["REGISTER"] - 1];
       document.getElementById("regspread").innerHTML = '<a target="_blank" href=' + setup[setupData["REGSPREAD"]-1] + ">View Registration Spreadsheet</a>";
    
       /*var seasons = setup.slice(setupData["FALL"] - 1, setupData["SPRING"]);

       //determine season
       var time = new Date();
       for (var check = 0; check < seasons.length - 1; check++) {
           try {
               var dt1 = String(seasons[check]);
               var month1 = dt1.slice(0, dt1.indexOf("/"));
               dt1 = dt1.slice(dt1.indexOf("/") + 1);
               var day1 = dt1.slice(0, dt1.indexOf("/"));
               dt1 = dt1.slice(dt1.indexOf("/") + 1);
               var year1 = dt1;

               var t1 = new Date();
               t1.setYear(year1);
               t1.setDate(day1);
               t1.setMonth(month1 - 1);
               
               var dt2 = String(seasons[check+1]);
               var month2 = dt2.slice(0, dt2.indexOf("/"));
               dt2 = dt2.slice(dt2.indexOf("/") + 1);
               var day2 = dt2.slice(0, dt2.indexOf("/"));
               dt2 = dt2.slice(dt2.indexOf("/") + 1);
               var year2 = dt2;

               var t2 = new Date();
               t2.setYear(year2);
               t2.setDate(day2);
               t2.setMonth(month2 - 1);

               if(time > t1 && time > t2)
                   document.getElementById("seasonselect").options[check + 1].disabled = true;
    
           } catch (ex) {}
       }*/

       
        //determine current citizenship period
        if (setup[setupData["CURCIT"] - 1]) //manual overide if not null
            citper = setup[setupData["CURCIT"] - 1];
        else {
            var time = new Date();

            for (var check = 0; check < citpers.length; check++) {
                try {
                    var dt1 = String(citpers[check]);
                    var month1 = dt1.slice(0, dt1.indexOf("/"));
                    dt1 = dt1.slice(dt1.indexOf("/") + 1);
                    var day1 = dt1.slice(0, dt1.indexOf("/"));
                    dt1 = dt1.slice(dt1.indexOf("/") + 1);
                    var year1 = dt1;

                    var t1 = new Date();
                    t1.setYear(year1);
                    t1.setDate(day1);
                    t1.setMonth(month1 - 1);

                    if (check != citpers.length - 1) {
                        if (citpers[check + 1] == "" && t1 <= time) {
                            citper = check + 1;
                            break;
                        }

                        var dt2 = String(citpers[check + 1]);
                        var month2 = dt2.slice(0, dt2.indexOf("/"));
                        dt2 = dt2.slice(dt2.indexOf("/") + 1);
                        var day2 = dt2.slice(0, dt2.indexOf("/"));
                        dt2 = dt2.slice(dt2.indexOf("/") + 1);
                        var year2 = dt2;

                        var t2 = new Date();
                        t2.setYear(year2);
                        t2.setDate(day2);
                        t2.setMonth(month2 - 1);
                    } else {
                        citper = check + 1;
                        break;
                    }
                    if (t1 <= time && t2 > time) {
                        citper = check + 1;
                        break;
                    }
                } catch (ex) {}
            }
        }

        document.getElementById("citper").selectedIndex = citper + 1;
        activeSetup.badcurcit = citper;

        deepFreeze(activeSetup);

        document.getElementById("myftrp").innerHTML += ", Song of the week: " + '<a target="_blank" href="' + setup[setupData["SOTWURL"] - 1] + '">' + setup[setupData["SOTWTXT"] - 1] + "</a>";

}

var autoWriteID;
var autoWriteCit;
var autoWriteJID;

    function checkParameters(parameterData) {
        if (parameterData !== -1) {

            var param = parameterData[0];

            if (param.name === "SlipID") {
                document.getElementById("viewslips").style.display = "block";
                document.getElementById("spins").style.display = "block";

                var slip = param.value;
                displaySlips(slip);	
            } else if (param.name === "WriteID") {

                autoWriteID = param.id;
                autoWriteCit = param.cit;
                autoWriteJID = param.jid;
                getFunction();
                
            }
        }
    }

    function updateButton(email, button) {
        if (!login) {
            google.script.run.withSuccessHandler(
                function(returnedUser) {
                    if (returnedUser != -1) {
                        google.script.run.writeLog("Successful Login");

                        if (isMobile)
                            document.getElementById("mobile").innerHTML = "Mobile Browser Detected. Please ensure that message dialogs are enabled for full functionality.";

                        login = true;
                        button.value = "Welcome: " + email;
                        for (var set = 0; set < returnedUser.length; set++)
                            activeUser[set] = returnedUser[set];

                        activeUser = deepFreeze(activeUser);

                        if (getAccessLevel() === ACCESS_LEVELS.ADMIN) {
                            document.getElementById("AuthenticationLevel").innerHTML = "Access Level: Administrator";
                            adminOptions();
                        } else if (getAccessLevel() === ACCESS_LEVELS.DEAN) {
                            document.getElementById("AuthenticationLevel").innerHTML = "Access Level: Dean";
                            deanOptions();
                        } else if (getAccessLevel() === ACCESS_LEVELS.FACULTY) {
                            document.getElementById("AuthenticationLevel").innerHTML = "Access Level: Faculty";
                            facultyOptions();
                        } else if (getAccessLevel() === ACCESS_LEVELS.PREFECT) {
                            document.getElementById("AuthenticationLevel").innerHTML = "Access Level: Prefect";
                            prefectOptions();
                        } else if (getAccessLevel() === ACCESS_LEVELS.PROCTOR) {
                            document.getElementById("AuthenticationLevel").innerHTML = "Access Level: Proctor";
                            proctorOptions();
                        } else if (getAccessLevel() === ACCESS_LEVELS.CAPTAIN) {
                            document.getElementById("AuthenticationLevel").innerHTML = "Access Level: Captain";
                            studentOptions();
                            captainOptions();
                        } else if (getAccessLevel() === ACCESS_LEVELS.STUDENT) {
                            document.getElementById("AuthenticationLevel").innerHTML = "Access Level: Student";
                            studentOptions();
                        } else
                            document.getElementById("AuthenticationLevel").innerHTML = "Access Level: None";

                        getFunction();

                        document.getElementById("showfunc").style.display = "block";
                    } else {
                        google.script.run.writeLog("Failed Client Login: Email not found");
                        showModal(0, "Sorry, your account was not found. Please contact a network administrator.");
                    }

                }
            )
            .withFailureHandler(() => showModal(0, "Failed to load User Data"))
            .getPermission();
        }
    }
    
    function studentOptions(){
        createOption("Where do I work?", FunctionType.ViewJob);
        createOption("View Slips & Job Recs", FunctionType.ViewSlips);
    }
    function captainOptions(){
        createOption("Write Slips & Job Recs", FunctionType.WriteSlips);
        createOption("View Jobs Snapshot", FunctionType.JobSnap);
    }
    function proctorOptions(){
        captainOptions();
        createOption("View Slips & Job Recs", FunctionType.ViewSlips);
    }
    function prefectOptions(){
        proctorOptions();
        createOption("Create Job List", FunctionType.CreateJobs);
        createOption("Compose Email", FunctionType.WriteEmail);
    }
    function facultyOptions(){
        createOption("View Advisory Snapshot", FunctionType.AdvSnap);
        createOption("View Student Slips & Job Recs", FunctionType.FacSlips);
        createOption("Write Slips & Job Recs", FunctionType.WriteSlips);
        createOption("Compose Email", FunctionType.WriteEmail);
    }
    function deanOptions(){
        facultyOptions();
        createOption("Create Job List", FunctionType.CreateJobs);
        createOption("Create Advisory List", FunctionType.CreateAdvs);
        createOption("View All Slips", FunctionType.AllSlips);
        createOption("Manage Activity Module", FunctionType.DeanAct);
    } 
    function createOption(message, value){
        var cbxfunc = document.getElementById("cbxFunction");
        var option = document.createElement("option");
        option.text = message;
        option.value = value;
        cbxfunc.add(option);
    }
    function adminOptions(){
        createOption("Manage Activity Module", FunctionType.DeanAct);
        createOption("Create Job List", FunctionType.CreateJobs);
        createOption("Create Advisory List", FunctionType.CreateAdvs);
        createOption("Where do I work?", FunctionType.ViewJob);
        createOption("View Jobs Snapshot", FunctionType.JobSnap);
        createOption("View Advisory Snapshot", FunctionType.AdvSnap);
        createOption("View Activity Data", FunctionType.SetAct);
        createOption("View Slips & Job Recs", FunctionType.ViewSlips);
        createOption("View Student Slips & Job Recs", FunctionType.FacSlips);
        createOption("View All Slips", FunctionType.AllSlips);
        createOption("Write Slips & Job Recs", FunctionType.WriteSlips);
        createOption("Compose Email", FunctionType.WriteEmail);
    }

    function getFunction() {

        var cbxfunc = document.getElementById("cbxFunction");

        if (autoWriteID && cbxfunc.selectedIndex <= 0) {

            for (var i = 0; i < cbxfunc.options.length; i++) {
                if (cbxfunc.options[i].value == FunctionType.JobSnap)
                    cbxfunc.options[i].selected = true;
            }
        }

        if (SelectedFunction != cbxfunc.options[cbxfunc.selectedIndex].value) {

            clearElements();
            SelectedFunction = cbxfunc.options[cbxfunc.selectedIndex].value;

            if (SelectedFunction == FunctionType.ViewSlips) { //view E-Slips
                if (getAccessLevel() >= ACCESS_LEVELS.ADMIN && getAccessLevel() != ACCESS_LEVELS.FACULTY && getAccessLevel() != ACCESS_LEVELS.DEAN) {
                    document.getElementById("viewslips").style.display = "block";
                    document.getElementById("spins").style.display = "block";
                    getslips(activeUser[STUDENT_DATA.UUID - 1], null, null);
                }
            } else if (SelectedFunction == FunctionType.WriteSlips) { //write E-Slips
                if (getAccessLevel() >= ACCESS_LEVELS.ADMIN && getAccessLevel() < ACCESS_LEVELS.STUDENT) {
                    document.getElementById("showcit").style.display = "block";
                    getPeriod();
                }
            } else if (SelectedFunction == FunctionType.ViewJob) { //student view job
                if (getAccessLevel() == ACCESS_LEVELS.STUDENT || getAccessLevel() == ACCESS_LEVELS.CAPTAIN || getAccessLevel() == ACCESS_LEVELS.ADMIN) {
                    document.getElementById("showcit").style.display = "block";
                    getPeriod();
                }
            } else if (SelectedFunction == FunctionType.FacSlips) { //advisor view E-Slips
                if (getAccessLevel() >= ACCESS_LEVELS.ADMIN && getAccessLevel() <= ACCESS_LEVELS.PREFECT) {
                    document.getElementById("showstudents").style.display = "block";
                    getPeriod();
                    addWorkers();
                }
            } else if (SelectedFunction == FunctionType.AdvSnap) { //advisor view advisory
                if (getAccessLevel() == ACCESS_LEVELS.FACULTY || getAccessLevel() == ACCESS_LEVELS.DEAN || getAccessLevel() == ACCESS_LEVELS.ADMIN) {
                    document.getElementById("showcit").style.display = "block";
                    document.getElementById("showstudents").style.display = "block";
                    document.getElementById("instr").innerHTML = "Please select an advisory:";
                    document.getElementById("student").style.display = "none";
                    document.getElementById("studentsearch").style.display = "none";
                    document.getElementById("filter").style.display = "none";
                    document.getElementById("filtername").style.display = "none";
                    document.getElementById("showjdata").style.display = "none";
                    document.getElementById("showadvdata").style.display = "block";
                    getPeriod();
                    if (autoWriteCit)
                        document.getElementById("citper").selectedIndex = autoWriteCit;
                }
            } else if (SelectedFunction == FunctionType.AllSlips) { //dean viewing all slips in system
                if (getAccessLevel() == ACCESS_LEVELS.DEAN || getAccessLevel() == ACCESS_LEVELS.ADMIN) {
                    document.getElementById("showallslips").style.display = "block";
                }
            }
            else if (SelectedFunction == FunctionType.JobSnap) { //job captain view job
                if (getAccessLevel() >= ACCESS_LEVELS.PREFECT && getAccessLevel() <= ACCESS_LEVELS.CAPTAIN || getAccessLevel() == ACCESS_LEVELS.ADMIN) {
                    document.getElementById("showcit").style.display = "block";
                    document.getElementById("showstudents").style.display = "block";
                    document.getElementById("instr").innerHTML = "Please select a job area:";
                    document.getElementById("student").style.display = "none";
                    document.getElementById("studentsearch").style.display = "none";
                    document.getElementById("filter").style.display = "none";
                    document.getElementById("filtername").style.display = "none";
                    document.getElementById("showadvdata").style.display = "none";
                    document.getElementById("showjdata").style.display = "block";
                    getPeriod();
                }

            } else if (SelectedFunction == FunctionType.WriteEmail) { //write email
                if (getAccessLevel() >= ACCESS_LEVELS.ADMIN && getAccessLevel() <= ACCESS_LEVELS.PREFECT) {

                    document.getElementById("showMsg").style.display = "block";

                    document.getElementById("msgRecip").style.maxWidth = "100%";
                    document.getElementById("msgRecip").style.width = "1200px";
                    document.getElementById("msgRecip").style.height = "30px";
                    document.getElementById("msgRecip").value = String(activeSetup.mailGroup);

                    document.getElementById("msgSub").style.maxWidth = "100%";
                    document.getElementById("msgSub").style.width = "1200px";
                    document.getElementById("msgSub").style.height = "30px";
                    document.getElementById("msgSub").value = "i.e. New Citizenship Period";

                    document.getElementById("msgText").style.maxWidth = "100%";
                    document.getElementById("msgText").style.width = "1200px";
                    document.getElementById("msgText").value = "i.e.\nHi all, \n" +
                    "Citizenship Period [num] begins on [date]!\n\n" +
                    "Please check the link below to know where you work, as it's good to be in the right place the first day --\n" +
                    "so take special note if you have lunchtime jobs!\n\n" +
                    "Job Captains - you can easily view who works in your areas by selecting View Jobs Snapshot. \n" +
                    "Also, Recs are due on [date]! \n\nThanks, [FROM]";
                }
            } else if (SelectedFunction == FunctionType.CreateJobs) { //set job
                if (getAccessLevel() == ACCESS_LEVELS.ADMIN || getAccessLevel() == ACCESS_LEVELS.DEAN || getAccessLevel() == ACCESS_LEVELS.PREFECT) {
                    document.getElementById("showjobassign").style.display = "block";
                    document.getElementById("showcit").style.display = "block";
                    if (citper >= 7) {
                        citper = 1;
                    } else {
                        citper = parseInt(activeSetup.badcurcit); //+ 1;
                        if (citper >= 7) {
                            citper = 1;
                        }
                    }
                    document.getElementById("citper").selectedIndex = parseInt(citper);

                    var els = document.getElementsByClassName("jobassignonly");
                    for (var i = 0; i < els.length; i++) {
                        els[i].style.display = "inline-block";
                    }

                    document.getElementById("captassign").style.display = "table";
                    document.getElementById("advpopinstr").style.display = "none";

                    document.getElementById("lbljobareas").innerHTML = "Job Areas: &nbsp";
                    document.getElementById("lblprefectcbx").innerHTML = "Proctors/ Prefects";
                    document.getElementById("JobList").size = "19";

                    UpdateCount();
                    getPeriod();
                }
            } else if (SelectedFunction == FunctionType.CreateAdvs) {
                if (getAccessLevel() == ACCESS_LEVELS.ADMIN || getAccessLevel() == ACCESS_LEVELS.DEAN) {

                    document.getElementById("showjobassign").style.display = "block";
                    document.getElementById("advpopinstr").style.display = "block";

                    var els = document.getElementsByClassName("jobassignonly");
                    for (var i = 0; i < els.length; i++) {
                        els[i].style.display = "none";
                    }

                    document.getElementById("lbljobareas").innerHTML = "Advisories:";
                    document.getElementById("lblprefectcbx").innerHTML = "";
                    document.getElementById("JobList").size = "20";
                    UpdateCount();

                    document.getElementsByName("jobassignschool").forEach((btn) => {
                        btn.checked = false;
                    });
                    clearJobSetForm();
                    lockJobElems();
                }

            } else if (SelectedFunction == FunctionType.SetAct) {
                updateRegStatus();
                document.getElementById("activities").style.display = "block";
                if(registrationStatus == "Enabled")
                    document.getElementById("actinstr").innerHTML = "You can review or change your info here";
                else
                    document.getElementById("actinstr").innerHTML = "Activity registration is currently disabled by registrar";
            }
            else if (SelectedFunction == FunctionType.DeanAct) {
                document.getElementById("manageact").style.display = "block";
                document.getElementById("showstudents").style.display = "block";
                document.getElementById("actinstr").innerHTML = "You can review or change student info here";
                addWorkers();
            }

        }
    }

    //clears all elements below the select function
    function clearElements() {

        document.getElementsByName("jobassignschool").forEach((btn) => {
            btn.checked = false;
        });
        clearJobSetForm();
        document.getElementById("showjobassign").style.display = "none";

        incompleteSlip = false;
        checkSlipInputs();

        var cbxjobs = document.getElementById("filterbyarea");
        if (getAccessLevel() == ACCESS_LEVELS.ADMIN && SelectedFunction == FunctionType.JobSnap) { //job captain data is now variable by cit, so have it reload for students
            for (i = cbxjobs.options.length - 1; i > 0; i--)
                cbxjobs.remove(i);
        }
        
        document.getElementById("activities").style.display = "none";
        document.getElementById("manageact").style.display = "none";

        //remove all children from element, then hide it!!!
        document.getElementById("showMsg").style.display = "none";

        document.getElementById("student").size = "1";
        document.getElementById("studentsearch").style.display = "inline";

        document.getElementById("studentsearch").removeAttribute("disabled");
        document.getElementById("studentsearch").value = "Type to Find!";

        document.getElementById("showadvdata").style.display = "none";
        document.getElementById("submitrequests").style.display = "none";

        document.getElementById("showjdata").style.display = "none";

        document.getElementById("showjobinfo").style.display = "none";
        document.getElementById("student").style.display = "block";

        document.getElementById("instr").innerHTML = "Please select a student:";

        var tab = document.getElementById("tableslips");
        for (var del = tab.rows.length - 1; del > 0; del--)
            tab.deleteRow(del);

        document.getElementById("viewslips").style.display = "none";

        tab = document.getElementById("jobinfo");
        for (del = tab.rows.length - 1; del > 0; del--)
            tab.deleteRow(del);

        document.getElementById("showallslips").style.display = "none";
        document.getElementById("cbxallslips").selectedIndex = 0;

        document.getElementById("citper").selectedIndex = citper;
        document.getElementById("citper").removeAttribute("disabled");
        document.getElementById("showcit").style.display = "none";

        document.getElementById("filterbyarea").removeAttribute("disabled");

        var cbxstud = document.getElementById("student");
        var length = cbxstud.options.length;
        for (i = cbxstud.options.length - 1; i > 0; i--) {
            cbxstud.remove(i);
        }

        document.getElementById("student").removeAttribute("disabled");
        document.getElementById("filter").style.display = "inline";
        document.getElementById("filter").removeAttribute("disabled");
        document.getElementById("filter").checked = false;
        document.getElementById("filtername").style.display = "inline";
        document.getElementById("showstudents").style.display = "none";

        document.getElementById("showsliptype").removeAttribute("disabled");

        var form = document.getElementById("showsliptype");

        var slipradios = document.getElementsByName('SlipType');
        for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
            slipradios[dis].removeAttribute("disabled");
            slipradios[dis].checked = false;
        }
        form.style.display = "none";

        slipradios = document.getElementsByName("rating");
        for (dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
            slipradios[dis].removeAttribute("disabled");
            slipradios[dis].checked = false;
        }
        document.getElementById("showrec").style.display = "none";

        document.getElementById("blurb").readOnly = false;
        document.getElementById("blurb").removeAttribute("disabled");
        document.getElementById("blurb").innerHTML = "";
        document.getElementById("showblurb").style.display = "none";

        document.getElementById("submiteslip").style.display = "block";
    }

    function loadJob(myUJID) {
        var tab = document.getElementById("jobinfo");
        for (var del = tab.rows.length - 1; del > 0; del--)
            tab.deleteRow(del);

        document.getElementById("showjobinfo").style.display = "block";

        google.script.run.withSuccessHandler(
            function(job) {

                var tab = document.getElementById("jobinfo");
                var row = tab.insertRow(1);
                var name = row.insertCell(0);
                var capt = row.insertCell(1);

                if (job != -1) {
                    name.innerHTML = job[JOB_DATA.NAME - 1];
                    capt.innerHTML = job[JOB_DATA.C1 - 1];

                    
                    if (job[JOB_DATA.C2 - 1] != "")
                        capt.innerHTML += " & " + job[JOB_DATA.C2 - 1];
                }

                if (name.innerHTML == "")
                    name.innerHTML = "No Data Available";
                if (capt.innerHTML == "")
                    capt.innerHTML = "No Data Available";

                enableinput();
            }
        )
        .withFailureHandler(() => showModal(0, "Action Failed"))
        .getJobData(myUJID, true, "", citper);

    }

    //loads all slips based upon a certain type
    function getallslips() {
        if (getAccessLevel() == ACCESS_LEVELS.DEAN || getAccessLevel() == ACCESS_LEVELS.ADMIN) {
            var cbxallslips = document.getElementById("cbxallslips");
            var selindex = cbxallslips.options[cbxallslips.selectedIndex].value;

            var tab = document.getElementById("tableslips");
            for (var del = tab.rows.length - 1; del > 0; del--)
                tab.deleteRow(del);
            factClear();

            if (selindex > 0) {
                document.getElementById("viewslips").style.display = "block";
                disableinput();
                document.getElementById("spins").style.display = "block";
                getslips(null, selindex, null);
            } else
                document.getElementById("viewslips").style.display = "none";

        }
    }

    //gets all slips for a user based on UUID
    function getslips(UUID, t, f) {
        google.script.run.withSuccessHandler(
            function(slip) {
                displaySlips(slip);		
            }
        )
        .withFailureHandler(() => showModal(0, "Action Failed"))
        .getSlips(UUID, t, f);
    }
    
    function displaySlips(slip){
        for (var i = slip.length - 1; i >= 0; i--) {

            userSlips[i] = slip[i];

            var tab = document.getElementById("tableslips");
            var row = tab.insertRow(1);
            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            var date = row.insertCell(0);
            var cit = row.insertCell(1);
            var forwho = row.insertCell(2);
            var forgrade = row.insertCell(3);
            var typ = row.insertCell(4);
            var fro = row.insertCell(5);
            var sub = row.insertCell(6);

            cit.innerHTML = slip[i][SLIP_DATA.CIT - 1];
            date.innerHTML = slip[i][SLIP_DATA.DATE - 1];
            forwho.innerHTML = slip[i][SLIP_DATA.UUID - 1];
            forgrade.innerHTML = slip[i][slip[i].length - 1];
            typ.innerHTML = NUM_TO_SLIP[slip[i][SLIP_DATA.SLIPTYPE - 1]];
            fro.innerHTML = '<a target="_top" href="mailto:' + slip[i][SLIP_DATA.FROM-1] + '">' + slip[i][SLIP_DATA.FROM-1] + "</a>";

            var radioInput = document.createElement('input');
            radioInput.setAttribute('type', 'radio');
            radioInput.setAttribute('class', "rbtn");
            radioInput.setAttribute('name', "selaslip");
            radioInput.setAttribute('value', i);
            radioInput.style.display = "inline-block";
            sub.value = i; //set value for sub and radio button!
            
            sub.style.textAlign = "center";

            sub.appendChild(radioInput);
            sub.addEventListener('click', function(e){
                document.getElementsByName('selaslip')[e.target.value].checked = true;
                getSelectedSlip();
            });
            sub = null;
        }
        document.getElementById("spins").style.display = "none";
        enableinput();
    }

    //loads the slip seleted from the table
    function getSelectedSlip() {

        var radios = document.getElementsByName('selaslip');

        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                var theindex = radios[i].value;

                document.getElementById("showcit").style.display = "none";

                document.getElementById("showsliptype").style.display = "none";

                var form = document.getElementById("showsliptype");

                form.elements["SlipType"].value = userSlips[theindex][SLIP_DATA.SLIPTYPE - 1];

                var slipradios = document.getElementsByName('SlipType');
                for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
                    slipradios[dis].disabled = true;
                }

                getSlipType();

                if (slipType == 3) {
                    var form1 = document.getElementById("completes");
                    var form2 = document.getElementById("continuously");
                    var form3 = document.getElementById("initiative");
                    var form4 = document.getElementById("behavior");
                    var form5 = document.getElementById("rating");

                    form1.elements["rating"].value = userSlips[theindex][SLIP_DATA["P1"] - 1];
                    form2.elements["rating"].value = userSlips[theindex][SLIP_DATA["P2"] - 1];
                    form3.elements["rating"].value = userSlips[theindex][SLIP_DATA["P3"] - 1];
                    form4.elements["rating"].value = userSlips[theindex][SLIP_DATA["P4"] - 1];
                    form5.elements["rating"].value = userSlips[theindex][SLIP_DATA["R"] - 1];

                    var slipradios = document.getElementsByName("rating");
                    for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++)
                        slipradios[dis].disabled = true;
                }

                document.getElementById("showblurb").style.display = "inline-block";
                document.getElementById("blurb").value = userSlips[theindex][SLIP_DATA["TEXT"] - 1];
                document.getElementById("blurb").readOnly = true;
                document.getElementById("blurb").disabled = true;

                document.getElementById("submiteslip").style.display = "none";

                if(slipType == 3)
                    document.getElementById("showrec").scrollIntoView(true);
                else
                    document.getElementById("blurb").scrollIntoView(true);
                
                // only one radio can be logically checked, don't check the rest
                break;
            }
        }

    }

    


    var loadingad = false;

    //figures out which cit period you selected
    var citper = -1;
    var seljob = -1;

    function getPeriod() {
        var cbxcit = document.getElementById("citper");

        if (SelectedFunction == FunctionType.CreateJobs && cbxcit.selectedIndex >= 1
         || (cbxcit.selectedIndex != -1 && cbxcit.options[cbxcit.selectedIndex].value != 0 && document.getElementById("student").selectedIndex >= 1))
            citper = cbxcit.options[cbxcit.selectedIndex].value;
        else if (cbxcit.options[cbxcit.selectedIndex].value < 1)
            document.getElementById("citper").selectedIndex = citper;

        if (autoWriteCit) {
            document.getElementById("citper").selectedIndex = autoWriteCit;
            autoWriteCit = null;
        }

        if (SelectedFunction == FunctionType.CreateJobs) {

            if (citper >= 1 && citper <= 6) {
                clearJobSetForm();
                lockJobElems();
            } else {
                showModal(0, "Cannot Make Job List for Cit " + citper);
                citper = 1;
                clearJobSetForm();
                document.getElementById("citper").selectedIndex = citper;
            }
            document.getElementsByName("jobassignschool").forEach((btn) => {
                btn.checked = false;
            });

        } else if (cbxcit.options[cbxcit.selectedIndex].value != 0 && document.getElementById("student").selectedIndex < 1) {

            if (!loadingad) {

                disableinput();
                //clear the student list each time
                citper = -1;
                var cbxstud = document.getElementById("student");

                var length = cbxstud.options.length;
                for (i = cbxstud.options.length - 1; i > 0; i--) {
                    cbxstud.remove(i);
                }

                var cbxjobs = document.getElementById("filterbyarea");

                //job captain data is now variable by cit, so have it reload for students
                if (getAccessLevel() > ACCESS_LEVELS.FACULTY || (getAccessLevel() == ACCESS_LEVELS.ADMIN && SelectedFunction == FunctionType.JobSnap)) { 
                    var length = cbxjobs.options.length;
                    for (i = cbxjobs.options.length - 1; i > 0; i--) {
                        cbxjobs.remove(i);
                    }
                }

                citper = cbxcit.options[cbxcit.selectedIndex].value;
                if (citper != 0) {
                    if (SelectedFunction == FunctionType.WriteSlips) {
                        addWorkers();
                        document.getElementById("showstudents").style.display = "block";
                    } else if (SelectedFunction == FunctionType.ViewJob) {
                        if (citper != 7)
                            loadJob(activeUser[STUDENT_DATA["JOB" + citper] - 1]);
                        else
                            loadJob("-1");
                    }
                }

                if (cbxjobs.options.length == 1) {

                    if (getAccessLevel() != ACCESS_LEVELS.STUDENT) {
                        if ((getAccessLevel() != ACCESS_LEVELS.FACULTY && getAccessLevel() != ACCESS_LEVELS.DEAN && getAccessLevel() != ACCESS_LEVELS.ADMIN) || (getAccessLevel() == ACCESS_LEVELS.ADMIN && (SelectedFunction == FunctionType.JobSnap))) {

                            if (SelectedFunction == FunctionType.JobSnap) {
                                document.getElementById("spinj").style.display = "block";
                                loadingad = true; //loading ad also for loadingj
                            }

                            google.script.run.withSuccessHandler(function (Jobs) { JobsListFilter(Jobs);})
                            .withFailureHandler(() => showModal(0, "Action Failed"))
                            .getJobs(activeUser[STUDENT_DATA.UUID - 1], citper);
                        } else if (getAccessLevel() == ACCESS_LEVELS.FACULTY || getAccessLevel() == ACCESS_LEVELS.DEAN || getAccessLevel() == ACCESS_LEVELS.ADMIN) {

                            if (SelectedFunction == FunctionType.AdvSnap) {
                                document.getElementById("spina").style.display = "block";
                                loadingad = true;
                            }

                            document.getElementById("filtername").innerHTML = "Advisory Only";
                            google.script.run.withSuccessHandler(function (Advs) { AdvisoryListFilter(Advs); })
                            .withFailureHandler(() => showModal(0, "Action Failed"))
                            .getAllAdvisories();
                        }
                    }

                } else
                    loadit();

            } else
                cbxcit.selectedIndex = citper + 1;

        }


    }
    
    function JobsListFilter(jobs){
        if (jobs != -1) {

            var autoSelect;

          var cbxjobs = document.getElementById("filterbyarea");
          for (var i = 0; i < jobs.length; i++) {
              if (jobs[i][JOB_DATA.NAME - 1] != "") {
                  var option = document.createElement("option");

                  option.text = jobs[i][JOB_DATA.NAME - 1];
                  option.value = jobs[i][JOB_DATA["UJID"] - 1];
                  if (option.value === autoWriteJID)
                      autoSelect = option;
                  cbxjobs.add(option);
              }
          }
            loadit();
            if (autoSelect) {
                autoWriteJID = null;
                loadingad = false;
                autoSelect.selected = true;
                getJobAreas();
            }
      } else {
          document.getElementById("spinj").style.display = "none";
          loadingad = false;
          enableinput();
      }
    }
    
    function AdvisoryListFilter(advisories){
      if (advisories != -1) {
          var cbxjobs = document.getElementById("filterbyarea");
          for (var i = 0; i < advisories.length; i++) {
              if (advisories[i][STUDENT_DATA["GRADE"] - 1] != "") {
                  var option = document.createElement("option");

                  option.text = advisories[i][STUDENT_DATA["FIRST"] - 1] + " " + advisories[i][STUDENT_DATA["LAST"] - 1] + " (" + advisories[i][STUDENT_DATA["GRADE"] - 1] + ")";
                  option.value = advisories[i][STUDENT_DATA.UUID - 1]; //technically a UFID val...
                  cbxjobs.add(option);
                  if (advisories[i][STUDENT_DATA.UUID - 1] == activeUser[STUDENT_DATA.UUID - 1]) {
                      option.selected = true; //quick set advisory
                      seljob = activeUser[STUDENT_DATA.UUID - 1];
                  }
              }
          }
          loadit();
          loadingad = false;
      } else {
          document.getElementById("spina").style.display = "none";
          loadingad = false;
          enableinput();
      }
    }

    function loadit() {
        if (SelectedFunction == FunctionType.AdvSnap || SelectedFunction == FunctionType.JobSnap) {
            document.getElementById("filter").checked = true;
            addWorkers();
        }
    }

    function disableinput() {
        document.getElementById("cbxFunction").disabled = true;
        document.getElementById("studentsearch").disabled = true;
        document.getElementById("citper").disabled = true;
        document.getElementById("student").disabled = true;
        document.getElementById("filterbyarea").disabled = true;
        document.getElementById("cbxallslips").disabled = true;
        document.getElementById("filter").disabled = true;
    }

    function enableinput() {
        document.getElementById("cbxFunction").removeAttribute("disabled");
        document.getElementById("citper").removeAttribute("disabled");
        document.getElementById("student").removeAttribute("disabled");
        document.getElementById("filterbyarea").removeAttribute("disabled");
        document.getElementById("cbxallslips").removeAttribute("disabled");
        document.getElementById("filter").removeAttribute("disabled");
    }

    //clears stuff for faculty viewing student E-slips
    function factClear() {
        if (SelectedFunction == FunctionType.FacSlips || SelectedFunction == FunctionType.AdvSnap || SelectedFunction == FunctionType.JobSnap || SelectedFunction == FunctionType.AllSlips) {

            var tab = document.getElementById("tableslips");
            for (var del = tab.rows.length - 1; del > 0; del--)
                tab.deleteRow(del);

            var tab = document.getElementById("advdata");
            for (var del = tab.rows.length - 1; del > 0; del--)
                tab.deleteRow(del);

            var tab = document.getElementById("jdata");
            for (var del = tab.rows.length - 1; del > 0; del--)
                tab.deleteRow(del);

            var form = document.getElementById("showsliptype");

            var slipradios = document.getElementsByName('SlipType');
            for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
                slipradios[dis].removeAttribute("disabled");
                slipradios[dis].checked = false;
            }
            form.style.display = "none";

            var slipradios = document.getElementsByName("rating");
            for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
                slipradios[dis].removeAttribute("disabled");
                slipradios[dis].checked = false;
            }
            document.getElementById("showrec").style.display = "none";

            document.getElementById("blurb").readOnly = false;
            document.getElementById("blurb").removeAttribute("disabled");
            document.getElementById("blurb").innerHTML = "";
            document.getElementById("showblurb").style.display = "none";

            document.getElementById("submiteslip").style.display = "block";
        }
    }

    //Populate cbx with students/ citizenship period
    function addWorkers() {

        document.getElementById("student").size = "1";
        disableinput();

        if (getAccessLevel() >= ACCESS_LEVELS.ADMIN && getAccessLevel() < ACCESS_LEVELS.STUDENT) {

            factClear();
            
            var cbxjobs = document.getElementById("filterbyarea");
            if (cbxjobs.length == 2) {
                cbxjobs.selectedIndex = "1";
                seljob = cbxjobs.options[cbxjobs.selectedIndex].value;
            }

            var filteron = document.getElementById("filter");
            var cbxworkers = document.getElementById("student");
            var length = cbxworkers.options.length;
            for (i = cbxworkers.options.length - 1; i > 0; i--)
                cbxworkers.remove(i);

            document.getElementById("studentsearch").disabled = "true";
            document.getElementById("studentsearch").value = "";

            //if the filter is on, then only show corresponding people
            if (filteron.checked && cbxjobs.selectedIndex > 0) {

                if ((getAccessLevel() != ACCESS_LEVELS.FACULTY && getAccessLevel() != ACCESS_LEVELS.DEAN && getAccessLevel() != ACCESS_LEVELS.ADMIN) 
                 || (getAccessLevel() == ACCESS_LEVELS.ADMIN && SelectedFunction == FunctionType.JobSnap) /*this bit is for admin testing*/) {
                    if (SelectedFunction != FunctionType.JobSnap) {
                        google.script.run.withSuccessHandler(function (Workers) { FilterWorkers(Workers); })
                        .withFailureHandler(() => showModal(0, "Action Failed"))
                        .getWorkers(seljob, citper);

                    } else { //SelectedFunction = 8

                        document.getElementById("spinj").style.display = "block";
                        loadingad = true;

                        google.script.run.withSuccessHandler(function (Workers) { PopulateJobSnapshot(Workers); })
                        .withFailureHandler(() => showModal(0, "Action Failed"))
                        .getJobSnapshot(seljob, citper);
                    }

                } else {//Faculty Options *note seljob is actually the UFID here.

                    if (SelectedFunction == FunctionType.FacSlips || SelectedFunction == FunctionType.WriteSlips) {
                        google.script.run.withSuccessHandler(function (Advisees) { FilterAdvisees(Advisees);})
                        .withFailureHandler(() => showModal(0, "Action Failed"))
                        .getAdvisees(seljob);
                    } else if (SelectedFunction == FunctionType.AdvSnap) {
                        document.getElementById("spina").style.display = "block";
                        loadingad = true;
                        document.getElementById('submitrequests').style.display = 'none';

                        google.script.run.withSuccessHandler(function (Advisees) { PopulateAdvisorySnapshot(Advisees);})
                        .withFailureHandler(() => showModal(0, "Action Failed"))
                        .getAdvSnapshot(seljob, citper);
                    }
                }
            } else if (!filteron.checked) { //if filter is off, then load all students
                document.getElementById("studentsearch").value = "Type to Find!";

                google.script.run.withSuccessHandler(function (Students) { PopulateAllStudents(Students);})     
                .withFailureHandler(() => showModal(0, "Action Failed"))
                .getAllStudents(true);
            } else {
                document.getElementById("spinj").style.display = "none";
                document.getElementById("spina").style.display = "none";
                enableinput();
            }
        }

    }
    
    function FilterWorkers(Workers){
        PopulateAllStudents(Workers);//these have same implementation
        enableinput();
    }
    
    function FilterAdvisees(Advisees){
        PopulateAllStudents(Advisees);//these have same implementation
        enableinput();
    }
    
    function PopulateAllStudents(Students){
        for (var i = 0; i < Students.length; i++) {
         var student = Students[i];
            if (student[STUDENT_DATA["LAST"] - 1] != "" && student[STUDENT_DATA["FIRST"] - 1] != "") {
                var option = document.createElement("option");
                var nick = " ";
                if (student[STUDENT_DATA["NICKNAME"] - 1] != "")
                    nick = " (" + student[STUDENT_DATA["NICKNAME"] - 1] + ") ";
                var advisor = student[STUDENT_DATA["ADVISOR"] - 1] != "" ? " (" + student[STUDENT_DATA["ADVISOR"] - 1] + ")" : "";
                option.text = student[STUDENT_DATA["FIRST"] - 1] + nick + student[STUDENT_DATA["LAST"] - 1] +  " " + student[STUDENT_DATA["GRADE"] - 1] + advisor;
                option.value = student[0];
                document.getElementById("student").add(option);
            }
        }
        enableinput();
        document.getElementById("studentsearch").removeAttribute("disabled");
   }
    
function PopulateJobSnapshot(Workers) {
    var autoSelect;

        for (var set = Workers.length - 1; set >= 0; set--) {
            var worker = Workers[set];
            if (worker != [] && worker) {//empty array
                var tab = document.getElementById("jdata");
           
                var row = tab.insertRow(1);
                var student = row.insertCell(0);
                var grade = row.insertCell(1);
                var advisor = row.insertCell(2);
                var rec = row.insertCell(3);
                var writebtn = row.insertCell(4);
               
                student.innerHTML = worker[0] + worker[1] + worker[2];
                grade.innerHTML = worker[3];
                advisor.innerHTML = worker[4];
                rec.innerHTML = worker[5];
                
                var radioInput = document.createElement('input');
                radioInput.setAttribute('type', 'radio');
                radioInput.setAttribute('class', "rbtn");
                radioInput.setAttribute('name', "writeareq");
                radioInput.setAttribute('value', worker[6]);
                radioInput.dataset.loopvalue = set;
                radioInput.dataset.valuename = worker[0] + worker[1] + worker[2] + worker[3] + " (" + worker[4] + ")";
                radioInput.style.display = "inline-block";
                writebtn.dataset.loopvalue = set;

                if (worker[6] === autoWriteID) {
                    autoSelect = radioInput;
                    autoWriteID = null;
                    autoWriteJID = null;
                    autoWriteCit = null;
                }

                writebtn.style.textAlign = "center";
                writebtn.appendChild(radioInput);
                if (worker[5] == "No") {
                    writebtn.addEventListener('click', function(e){
                        document.getElementsByName('writeareq')[e.target.dataset.loopvalue].checked = true;
                        submitrecwrites();
                    });
                }
                else{
                    radioInput.disabled = "true";
                }
                sub = null;

            }
        }
        enableinput();
        loadingad = false;
        document.getElementById("spinj").style.display = "none";
    if (autoSelect) {
            autoWriteID = null;
            autoSelect.checked = true;
            autoSelect.click();
        }
     }
    
    function PopulateAdvisorySnapshot(Advisees){
        
        for (var set = Advisees.length - 1; set >= 0; set--) {
            var advisee = Advisees[set];
            if (advisee != [] && advisee) {
                var tab = document.getElementById("advdata");
                var row = tab.insertRow(1);
                var Adviseesent = row.insertCell(0);
                var job = row.insertCell(1);
                var capt = row.insertCell(2);
                var good = row.insertCell(3);
                var bad = row.insertCell(4);
                var rec = row.insertCell(5);
                var reqbtn = row.insertCell(6);

                Adviseesent.innerHTML = advisee[0];
                job.innerHTML = advisee[1];
                capt.innerHTML = advisee[2];
                good.innerHTML = advisee[3];
                bad.innerHTML = advisee[4];
                rec.innerHTML = advisee[5];
                
                var radioInput = document.createElement('input');
                radioInput.setAttribute('type', 'checkbox');
                radioInput.setAttribute('class', "chbx");
                radioInput.setAttribute('name', "selareq");
                radioInput.setAttribute('value', advisee[6]);
                radioInput.dataset.loopvalue = set;
                radioInput.style.display = "inline-block";
                reqbtn.dataset.loopvalue = set; //set value for sub and radio button!
                
                radioInput.addEventListener('click', function(e){
                    e.preventDefault();
                    e = null;
                });
                
                reqbtn.style.textAlign = "center";
                reqbtn.appendChild(radioInput);

                if (advisee[5] == "No" && advisee[2] != "" && citper != 7) {

                    reqbtn.addEventListener('mouseup', function(e){//use mouseup here so default checkbox behavior stops
                        if(!document.getElementsByName('selareq')[e.target.dataset.loopvalue].checked)
                            document.getElementsByName('selareq')[e.target.dataset.loopvalue].checked = true;
                        else
                            document.getElementsByName('selareq')[e.target.dataset.loopvalue].checked = false;
                        
                        var boxes = document.getElementsByName("selareq");

                        var clicked = false;
                        for (var check = 0; check < boxes.length; check++) {
                            if (boxes[check].checked == true) {
                                clicked = true;
                                break;
                            }
                        }

                        if (clicked)
                            document.getElementById("submitrequests").style.display = 'block';
                        else
                            document.getElementById("submitrequests").style.display = 'none';

                    });
                } else {
                    radioInput.disabled = "true";
                }

            }

        }
        enableinput();
        loadingad = false;
        document.getElementById("spina").style.display = "none";
    }

    function getJobAreas() {
        var cbxjobs = document.getElementById("filterbyarea");
        seljob = cbxjobs.options[cbxjobs.selectedIndex].value;
        if (document.getElementById("filter").checked == true) {
            addWorkers();
            clearSlipInfo();
        }
    }

    //figures out who you selected in the cbx
    var slipfor;

    function getStudent() {

        document.getElementById("student").size = "1";

        var cbxstud = document.getElementById("student");
        if (cbxstud.selectedIndex >= 1) {
            
            if (SelectedFunction == FunctionType.DeanAct) {
                document.getElementById("activities").style.display = "block";
                slipfor = cbxstud.options[cbxstud.selectedIndex].value;
                getPeriodActivities();
            }
            else if (SelectedFunction != FunctionType.FacSlips) {
                if (cbxstud.options[cbxstud.selectedIndex].value != 0) {
                    var form = document.getElementById("showsliptype");

                    var slipradios = document.getElementsByName('SlipType');
                    for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
                        slipradios[dis].checked = false;
                    }
                    form.style.display = "none";

                    var slipradios = document.getElementsByName("rating");
                    for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
                        slipradios[dis].checked = false;
                    }
                    document.getElementById("showrec").style.display = "none";

                    document.getElementById("blurb").value = "";
                    document.getElementById("showblurb").style.display = "none";

                    document.getElementById("submiteslip").style.display = "block";

                    slipfor = cbxstud.options[cbxstud.selectedIndex].value;
                    document.getElementById("showsliptype").style.display = "block";
                }
            } else if (SelectedFunction == FunctionType.FacSlips) {
                document.getElementById("viewslips").style.display = "block";
                document.getElementById("spins").style.display = "block";
                factClear();
                getslips(cbxstud.options[cbxstud.selectedIndex].value, null, null);
            }
        } else {
            document.getElementById("showsliptype").style.display = "none";

            var slipradios = document.getElementsByName("rating");
            for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
                slipradios[dis].checked = false;
            }
            document.getElementById("showrec").style.display = "none";

            document.getElementById("blurb").value = "";
            document.getElementById("showblurb").style.display = "none";

            document.getElementById("submiteslip").style.display = "none";

            var tab = document.getElementById("tableslips");
            for (var del = tab.rows.length - 1; del > 0; del--) {
                tab.deleteRow(del);
            }
            document.getElementById("viewslips").style.display = "none";
        }
    }

    var confirmslipperiod = false;
    var confirmrecperiod = false;

    //figures out which sliptype you selected and shows corresponding HTML
    var slipType;

    var JobSlipString = 'Please address the following:<br>1. Job Area 2. Commitment to job 3. Effort and enthusiasm 4. Areas of strength 5. Areas that the student might improve upon in the future.';
    
    function getSlipType() {

        incompleteSlip = false;
        checkSlipInputs();

        var slipbtns = document.getElementsByName("SlipType");
        var anycheck = false;
        for (var i = 0; i < slipbtns.length; i++) {
            if (slipbtns[i].checked == true) {
                slipType = slipbtns[i].value;
                anycheck = true;
            }
        }

        if (anycheck == false)
            slipType = 0;

        if (slipType == 3) {

            if (citper == 7 && (SelectedFunction != FunctionType.ViewSlips && SelectedFunction != FunctionType.FacSlips && SelectedFunction != FunctionType.AllSlips)) {
                showModal(0, "You Cannot Write Job Recs for End of Year. Setting to Citizenship 6.");
                citper = 6;
                document.getElementById("citper").selectedIndex = 6;
            }

            if (citper >= activeSetup.badcurcit && confirmrecperiod == false && (SelectedFunction == FunctionType.WriteSlips || SelectedFunction == FunctionType.JobSnap)) {

                document.getElementById("showrec").style.display = "none";
                document.getElementById("blurb").value = "";
                document.getElementById("showblurb").style.display = "none";
                var slipbtns = document.getElementsByName("SlipType");
                for (var i = 0; i < slipbtns.length; i++)
                    if (slipbtns[i].value == slipType)
                        slipbtns[i].checked = false;

                document.getElementById("modal-btnYes").onclick = function () {
                    document.getElementById('myModal').style.display = 'none';
                    confirmrecperiod = true;

                    var slipbtns = document.getElementsByName("SlipType");
                    for (var i = 0; i < slipbtns.length; i++)
                        if (slipbtns[i].value == slipType)
                            slipbtns[i].checked = true;

                    document.getElementById("showrec").style.display = "inline-block";
                    document.getElementById("slipinfo").innerHTML = JobSlipString;
                    document.getElementById("showblurb").style.display = "inline-block";
                    document.getElementById("student").scrollIntoView(true);
                };

                showModal(1, "Current Citizeship Period: " + activeSetup.badcurcit + "<br>Selected Citzenship Period (" + citper + ") has not ended yet. Are you sure your want to write a job rec for this period?");

            } else {

                document.getElementById("showrec").style.display = "inline-block";
                document.getElementById("slipinfo").innerHTML = JobSlipString;
                document.getElementById("showblurb").style.display = "inline-block";
            }
        } else if (slipType == 2 || slipType == 1) {

            //prevent grades below 8 from writing bad slips
            var validbad = true;
            if (getAccessLevel() == ACCESS_LEVELS.CAPTAIN && parseInt(activeUser[STUDENT_DATA["GRADE"] - 1]) < 11 && slipType == 2) {
                slipType = 0;
                validbad = false;
                document.getElementById("showrec").style.display = "none";
                document.getElementById("blurb").value = "";
                document.getElementById("showblurb").style.display = "none";
                showModal(0, "Sorry, only Faculty and Grades 11-12 can write bad slips. Please contact your advisor if you desire to write a bad slip.");
                for (var i = 0; i < slipbtns.length; i++)
                    slipbtns[i].checked = false;
            }
            if (validbad == true) {
                if (citper > activeSetup.badcurcit && activeSetup.badcurcit != 7 && confirmslipperiod == false && (SelectedFunction == FunctionType.WriteSlips || SelectedFunction == FunctionType.JobSnap)) {
                    document.getElementById("showrec").style.display = "none";
                    document.getElementById("blurb").value = "";
                    document.getElementById("showblurb").style.display = "none";
                    var slipbtns = document.getElementsByName("SlipType");
                    for (var i = 0; i < slipbtns.length; i++)
                        if (slipbtns[i].value == slipType)
                            slipbtns[i].checked = false;

                    document.getElementById("modal-btnYes").onclick = function () {
                        document.getElementById('myModal').style.display = 'none';
                        confirmslipperiod = true;

                        var slipbtns = document.getElementsByName("SlipType");
                        for (var i = 0; i < slipbtns.length; i++)
                            if (slipbtns[i].value == slipType)
                                slipbtns[i].checked = true;

                        document.getElementById("showrec").style.display = "none";
                        document.getElementById("slipinfo").innerHTML = "Please address the reason for giving this slip.";
                        document.getElementById("showblurb").style.display = "inline-block";
                        document.getElementById("student").scrollIntoView(true);
                    };

                    showModal(1, "Current Citizeship Period: " + activeSetup.badcurcit + "<br>Selected Citzenship Period (" + citper + ") has not started yet. Are you sure your want to write a job rec for this period?");

                } else {
                    document.getElementById("showrec").style.display = "none";
                    document.getElementById("slipinfo").innerHTML = "Please address the reason for giving this slip.";
                    document.getElementById("showblurb").style.display = "inline-block";
                    document.getElementById("student").scrollIntoView(true);
                }

            }


        }
    }

    var incompleteSlip = false;

    function checkSlipInputs() {

        if (SelectedFunction == FunctionType.WriteSlips || SelectedFunction == FunctionType.JobSnap) {

            var form1 = document.getElementById("completes");
            var form2 = document.getElementById("continuously");
            var form3 = document.getElementById("initiative");
            var form4 = document.getElementById("behavior");
            var form5 = document.getElementById("rating");
            var P1 = form1.elements["rating"].value;
            var P2 = form2.elements["rating"].value;
            var P3 = form3.elements["rating"].value;
            var P4 = form4.elements["rating"].value;
            var R = form5.elements["rating"].value;

            var blurb = document.getElementById("blurb").value;
            
            if (P1 == "" && incompleteSlip)
                form1.style.color = "red";
            else
                form1.style.color = "black";
            
            if (P2 == "" && incompleteSlip)
                form2.style.color = "red";
            else
                form2.style.color = "black";

            if (P3 == "" && incompleteSlip)
                form3.style.color = "red";
            else
                form3.style.color = "black";

            if (P4 == "" && incompleteSlip)
                form4.style.color = "red";
            else
                form4.style.color = "black";

            if (R == "" && incompleteSlip)
                form5.style.color = "red";
            else
                form5.style.color = "black";

            if (blurb == "" && incompleteSlip)
                document.getElementById("slipinfo").style.color = "red";
            else 
                document.getElementById("slipinfo").style.color = "black";

        }
    }

    //writes ESlip to database
    function sendESlip() {
        if (getAccessLevel() >= ACCESS_LEVELS.ADMIN && getAccessLevel() <= ACCESS_LEVELS.CAPTAIN) {

            var form1 = document.getElementById("completes");
            var form2 = document.getElementById("continuously");
            var form3 = document.getElementById("initiative");
            var form4 = document.getElementById("behavior");
            var form5 = document.getElementById("rating");
            if (slipType == 3) {
                var P1 = form1.elements["rating"].value;
                var P2 = form2.elements["rating"].value;
                var P3 = form3.elements["rating"].value;
                var P4 = form4.elements["rating"].value;
                var R = form5.elements["rating"].value;
            }
            var blurb = document.getElementById("blurb").value;

            var cbxcit = document.getElementById("citper");
            var cbxstud = document.getElementById("student");

            if (typeof blurb === 'string' && blurb.charAt(0) === "=")
                showModal(0, "Do not use = at beginning of text.");
            else if ((((P1 == "" || P2 == "" || P3 == "" || P4 == "" || R == "" || blurb == "") && slipType == 3) 
                     || blurb == "" || cbxcit.selectedIndex < 1 || (cbxstud.selectedIndex < 1 && SelectedFunction != FunctionType.JobSnap)) || slipType < 1) {
                showModal(0, "Please enter all fields!");
                incompleteSlip = true;
                checkSlipInputs();
            } else {

                document.getElementById("modal-btnYes").onclick = function () {
                    document.getElementById('myModal').style.display = 'none';

                    document.getElementById("submiteslip").disabled = true;

                    google.script.run.withSuccessHandler(() => {

                        showModal(0, "You Have successfully submitted your " + NUM_TO_SLIP[slipType]);
                        document.getElementById("submiteslip").disabled = false;
                        //clear after submit
                        if (SelectedFunction != FunctionType.JobSnap)
                            getStudent();
                        else {
                            var slipradios = document.getElementsByName("rating");
                            for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++)
                                slipradios[dis].checked = false;
                            document.getElementById("showrec").style.display = "none";

                            document.getElementById("blurb").value = "";
                            document.getElementById("showblurb").style.display = "none";

                            document.getElementById("submiteslip").style.display = "block";
                            slipfor = "";

                            getPeriod();
                        }

                    })
                        .withFailureHandler(() => showModal(0, "Action Failed"))
                        .SubmitSlip(slipfor, slipType, blurb, P1, P2, P3, P4, R, citper);


                };

                if (SelectedFunction != FunctionType.JobSnap)
                    showModal(1, "Are you sure you want to submit a " + NUM_TO_SLIP[slipType] + " for " + cbxstud.options[cbxstud.selectedIndex].text + " for (CIT" + citper + ")?");
                else {
                    var slipradios = document.getElementsByName('writeareq');
                    for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
                        if (slipradios[dis].checked)
                            showModal(1, "Are you sure you want to submit a " + NUM_TO_SLIP[slipType] + " for " + slipradios[dis].dataset.valuename + " for (CIT" + citper + ")?");
                    }
                }

            }

        }

    }

    var ClickedReqCount = 0;
    var SubmittedReqCount = 0;

    function submitreqrecs() {
        if (getAccessLevel() == ACCESS_LEVELS.FACULTY || getAccessLevel() == ACCESS_LEVELS.DEAN || getAccessLevel() == ACCESS_LEVELS.ADMIN) {

            if (SelectedFunction == FunctionType.AdvSnap) {
                var boxes = document.getElementsByName("selareq");

                ClickedReqCount = 0;
                SubmittedReqCount = 0;

                for (var check = 0; check < boxes.length; check++) {
                    if (boxes[check].checked) {
                        ClickedReqCount++;
                        break;
                    }
                }

                if (ClickedReqCount > 0) {

                    document.getElementById("modal-btnYes").onclick = function () {
                        document.getElementById('myModal').style.display = 'none';

                        document.getElementById("submitrequests").disabled = true;

                        for (var check = 0; check < boxes.length; check++) {
                            if (boxes[check].checked) {

                                google.script.run.withSuccessHandler(() => {
                                    SubmittedReqCount++;

                                    if (ClickedReqCount == SubmittedReqCount)
                                        showModal(0, "You have successfully submitted your Job Recommendation Requests!");
                                    document.getElementById("submitrequests").disabled = false;

                                })
                                .withFailureHandler(() => {
                                    showModal(0, "Action Failed");
                                    document.getElementById("submitrequests").disabled = false;
                                })
                                .SubmitRecRequest(boxes[check].value, citper);

                            }
                        }

                    };

                    showModal(1, "Are you sure you want to request these job recs? This action will also notify their captains' advisors!");
                } else
                    showModal(0, "You haven't selected any students to submit requests for. Please check any number of bright boxes next to a 'No' to select!");
            }
        } 
    }

    function submitrecwrites() {
        if (getAccessLevel() >= ACCESS_LEVELS.PREFECT && getAccessLevel() <= ACCESS_LEVELS.CAPTAIN || getAccessLevel() == ACCESS_LEVELS.ADMIN) {

            var slipradios = document.getElementsByName('writeareq');
            for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++) {
                if (slipradios[dis].checked) {
                    
                    slipfor = slipradios[dis].value;
                    slipType = 3;
                    
                    var slipradios = document.getElementsByName("rating");
                    for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++)
                        slipradios[dis].checked = false;
                    document.getElementById("showrec").style.display = "none";

                    document.getElementById("blurb").value = "";
                    document.getElementById("showblurb").style.display = "none";

                    document.getElementById("submiteslip").style.display = "block";

                    document.getElementById("showrec").style.display = "inline-block";
                    document.getElementById("slipinfo").innerHTML = JobSlipString;
                    document.getElementById("showblurb").style.display = "inline-block";
                    
                    document.getElementById("showrec").scrollIntoView(true);
                }
            }

        }

    }

    function setMsg() {
        if (getAccessLevel() >= ACCESS_LEVELS.ADMIN && getAccessLevel() < ACCESS_LEVELS.PREFECT) {

            var recip = document.getElementById("msgRecip").value;
            var sub = document.getElementById("msgSub").value;
            var txt = document.getElementById("msgText").value;

            if (recip != "") {
                if (recip != "" && sub != "" && txt != "") {


                    document.getElementById("modal-btnYes").onclick = function () {
                        document.getElementById('myModal').style.display = 'none';

                        google.script.run.withSuccessHandler(() => {
                            showModal(0, "Message Sent!");

                            document.getElementById("msgSub").value = "";
                            document.getElementById("msgText").value = "";
                            SelectedFunction = 0;
                            clearElements();
                            document.getElementById("cbxFunction").selectedIndex = 0;

                        })
                            .withFailureHandler(() => showModal(0, "Action Failed"))
                            .massEmail(recip, sub, txt);

                    };

                    showModal(1, "Are you sure you want to send this message? Your email will be recorded.");
                } else {
                    showModal(0, "Please enter all fields!");
                }
            } else {
                showModal(0, "Email Recipients Have Not Been Set By Technology!");
            }

        } 

    }
    
    function clearSlipInfo(){
        var form = document.getElementById("showsliptype");
        var slipradios = document.getElementsByName('SlipType');
        for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++)
            slipradios[dis].checked = false;
        form.style.display = "none";

        var slipradios = document.getElementsByName("rating");
        for (var dis = 0, dislength = slipradios.length; dis < dislength; dis++)
            slipradios[dis].checked = false;
        document.getElementById("showrec").style.display = "none";

        document.getElementById("blurb").value = "";
        document.getElementById("showblurb").style.display = "none";

        document.getElementById("submiteslip").style.display = "block";
        slipfor = "";
    }

    var loadedstudents = false;
    var studentoptions = [];
    var studentvalues = [];

    function searchforstudent() {
        var cbx = document.getElementById("student");

        if (!loadedstudents) {
            for (var each = 1; each < cbx.options.length; each++) {
                studentoptions[each] = cbx.options[each].text;
                studentvalues[each] = cbx.options[each].value;
            }
            loadedstudents = true;
        }

        //CLEARS SLIP INFO WHEN PICKING NEW NAME
        clearSlipInfo();
        /**************************************************************/

        var mytext = document.getElementById("studentsearch").value;
        if (mytext != "") {
            cbx.size = "6";
            for (var each = cbx.options.length - 1; each > 0; each--)
                cbx.remove(each);

            for (var each = 1; each < studentoptions.length; each++) {
                var split = mytext.toLowerCase().split(" "); //split string by spaces
                var t = 0;
                for(var check = 0; check < split.length; check++){//check each split string
                    if (studentoptions[each].toLowerCase().includes(split[check]) )
                        t++; //increment tally for each incuded word
                    if(t==split.length){ //only show if tally is split size
                        var option = document.createElement("option");
                        option.text = studentoptions[each];
                        option.value = studentvalues[each];
                        cbx.add(option);
                    }
                }

            }

        } else if (mytext == "")
            returnAllStuds();

    }

    function returnAllStuds() {
        document.getElementById("student").size = "1";
        var cbx = document.getElementById("student");
        for (var each = cbx.options.length - 1; each > 0; each--)
            cbx.remove(each);

        for (var each = 1; each < studentoptions.length; each++) {
            var option = document.createElement("option");
            option.text = studentoptions[each];
            option.value = studentvalues[each];
            cbx.add(option);
        }
    }
    
    function studentSearchKey(event){
        var thestud = document.getElementById('student');
        if (event.keyCode == 13) {//enter
            if(thestud.options.length >= 2){
                thestud.selectedIndex = 1; 
                thestud.focus(); 
                getStudent(); 
            }
        }	
        else if (event.keyCode == 40)//down
            thestud.selectedIndex = thestud.selectedIndex+1; 	
        else if (event.keyCode == 38)//up
            thestud.selectedIndex = thestud.selectedIndex-1;    	
        return false;
    }
