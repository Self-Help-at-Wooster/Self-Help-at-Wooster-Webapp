

function lockJobElems() {
    //LOCK ALL ELEMENTS
    document.getElementById("StudentList").disabled = "true";
    document.getElementById("JobList").disabled = "true";
    document.getElementById("assigncbx").disabled = "true";
    document.getElementById("prefectcbx").disabled = "true";
    var x = document.getElementsByClassName("showgrades");
    for (var i = 0; i < x.length; i++) {
        x[i].disabled = "true";
    }
    var x = document.getElementsByName("jobstuffs");
    for (var i = 0; i < x.length; i++) {
        x[i].disabled = "true";
    }
    document.getElementById("showCreate").style.display="none";
}

function unlockJobElems() {
    document.getElementsByName("jobassignschool").forEach((btn) => {
        btn.removeAttribute("disabled");
    });
    document.getElementById("StudentList").removeAttribute("disabled");
    document.getElementById("JobList").removeAttribute("disabled");
    document.getElementById("assigncbx").removeAttribute("disabled");
    document.getElementById("prefectcbx").removeAttribute("disabled");
    var x = document.getElementsByClassName("showgrades");
    for (var i = 0; i < x.length; i++) {
        x[i].removeAttribute("disabled");
    }
    var x = document.getElementsByName("jobstuffs");
    for (var i = 0; i < x.length; i++) {
        x[i].removeAttribute("disabled");
    }
    document.getElementById("showCreate").style.display="block";
}

var jobStudents = [[]];
var jobAreas = [[]];

function loadSetJobs() {

    jobStudents = [[]];
    jobAreas = [[]];

    for (var i = document.getElementById("StudentList").options.length - 1; i > 0; i--)
        document.getElementById("StudentList").remove(i);

    for (var i = document.getElementById("JobList").options.length - 1; i > 0; i--)
        document.getElementById("JobList").remove(i);

    var cbxassign = document.getElementById("assigncbx");
    for (i = cbxassign.options.length - 1; i > 0; i--) {
        cbxassign.remove(i);
    }

    totalHidden = 0;
    UpdateCount();

    lockJobElems();

    if (SelectedFunction == FunctionType.CreateJobs) {
        google.script.run.withSuccessHandler(
            function(jobs) {
                if (jobs != -1) {
                    //var cbxassign = document.getElementById("assigncbx");

                    var set = 0;
                    for (var i = 0; i < jobs.length; i++) {

                        jobAreas[set] = jobs[i];
                        set++;
                    }
                    next();
                }

            }
        ).withFailureHandler(() => {
            showModal(0, "Action Failed");
        }).getAllJobs(citper);
    } else if (SelectedFunction == FunctionType.CreateAdvs) {
        google.script.run.withSuccessHandler(
            function(advs) {
                if (advs != -1) {
                    //var cbxassign = document.getElementById("assigncbx");

                    var set = 0;
                    for (var i = 0; i < advs.length; i++) {

                        jobAreas[set] = advs[i];
                        set++;
                    }
                    next();
                }

            }
        ).withFailureHandler(() => {
            showModal(0, "Action Failed");
        }).getAllAdvisories();

    }

    var StudentList = document.getElementById("StudentList");

    var next = function() {

        var getadv = false;
        if (SelectedFunction == FunctionType.CreateJobs) {
            getadv = true;
        }

        google.script.run.withSuccessHandler(
            function(stud) {

                var set = 0
                for (var i = 0; i < stud.length; i++) {
                    if (stud[i][STUDENT_DATA["LAST"] - 1] != "" && stud[i][STUDENT_DATA["FIRST"] - 1] != "") {
                        if ((SelectedFunction == FunctionType.CreateJobs && stud[i][STUDENT_DATA["JOB" + citper] - 1] == "") || (SelectedFunction == FunctionType.CreateAdvs && stud[i][STUDENT_DATA["ADVISOR"] - 1] == "")) {
                            var option = document.createElement("option");
                            var nick = "";
                            if (stud[i][STUDENT_DATA["NICKNAME"] - 1] != "") {
                                nick = " (" + stud[i][STUDENT_DATA["NICKNAME"] - 1] + ")";
                            }
                            if (SelectedFunction == FunctionType.CreateJobs) {
                                option.text = stud[i][STUDENT_DATA["LAST"] - 1] + ", " + stud[i][STUDENT_DATA["FIRST"] - 1] + nick + " " + stud[i][STUDENT_DATA["GRADE"] - 1] + " (" + stud[i][STUDENT_DATA["ADVISOR"] - 1] + ")";
                            } else if (SelectedFunction == FunctionType.CreateAdvs) {
                                option.text = stud[i][STUDENT_DATA["LAST"] - 1] + ", " + stud[i][STUDENT_DATA["FIRST"] - 1] + nick + " " + stud[i][STUDENT_DATA["GRADE"] - 1];
                            }

                            option.value = i;

                            option.grade = stud[i][STUDENT_DATA["GRADE"] - 1];

                            var cbxassign = document.getElementById("assigncbx");

                            StudentList.add(option);
                        }
                        jobStudents[set] = stud[i];
                        set++;
                    }
                }

                var boxes = document.getElementsByClassName("showgrades");

                if (selectedSchool == "US") {

                    boxes[boxes.length - 1].checked = false;
                    boxes[boxes.length - 2].checked = true;
                    filterGrades("US");
                    filterGrades("MS");
                } else {
                    boxes[boxes.length - 1].checked = true;
                    boxes[boxes.length - 2].checked = false;
                    filterGrades("US");
                    filterGrades("MS");
                }

                if (SelectedFunction == FunctionType.CreateJobs) {
                    var jobs = document.getElementById("assigncbx");

                    for (var i = 1; i < jobs.options.length; i++) {
                        var el = jobs.options[i];

                        if (school == "US" && el.innerHTML.indexOf("M.S.") < 0 || school == "MS" && el.innerHTML.indexOf("M.S.") >= 0) {

                            el.style.display = "block";
                        } else {
                            el.selected = false;
                            el.style.display = "none";
                        }
                    }

                    setCaptains();
                    setPrefectFilter();
                } else if (SelectedFunction == FunctionType.CreateAdvs) {
                    setAdvisors();
                }
                UpdateCount();

                unlockJobElems();

            }
        ).withFailureHandler(() => {
            showModal(0, "Action Failed");
        }).getAllStudents(getadv);
    }


}

function setAdvisors() {

    var cbxassign = document.getElementById("assigncbx");
    cbxassign.selectedIndex = 0;
    selJobInd = -1;
    loadsetpeople();

    for (i = cbxassign.options.length - 1; i >= 1; i--) {
        cbxassign.remove(i);
    }

    for (var j = 0; j < jobAreas.length; j++) {

        if (jobAreas[j][STUDENT_DATA["GRADE"] - 1] != null && ((selectedSchool == "US" && parseInt(jobAreas[j][STUDENT_DATA["GRADE"] - 1]) >= 9) || (selectedSchool == "MS" && parseInt(jobAreas[j][STUDENT_DATA["GRADE"] - 1]) < 9)) && (jobAreas[j][STUDENT_DATA["FIRST"] - 1] != "" || jobAreas[j][STUDENT_DATA["LAST"] - 1] != "")) {
            var option = document.createElement("option");

            option.text = jobAreas[j][STUDENT_DATA["LAST"] - 1] + ", " + jobAreas[j][STUDENT_DATA["FIRST"] - 1] + " (" + jobAreas[j][STUDENT_DATA["GRADE"] - 1] + ")";


            option.value = jobAreas[j][STUDENT_DATA.UUID - 1]; //actually UFID
            cbxassign.add(option);
        }

    }

}

function setCaptains() {
    if (SelectedFunction == FunctionType.CreateJobs) {
        var cbxassign = document.getElementById("assigncbx");
        cbxassign.selectedIndex = 0;
        selJobInd = -1;
        loadsetpeople();

        document.getElementById("capt1").innerHTML = "";
        document.getElementById("capt2").innerHTML = "";

        for (i = cbxassign.options.length - 1; i >= 1; i--) {
            cbxassign.remove(i);
        }

        for (var j = 0; j < jobAreas.length; j++) {

            if (jobAreas[j][JOB_DATA.NAME - 1] != "") {
                var option = document.createElement("option");

                option.text = jobAreas[j][JOB_DATA.NAME - 1];

                for (var i = 0; i < jobStudents.length; i++) {
                    if (jobAreas[j][JOB_DATA.C1 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1] || jobAreas[j][JOB_DATA.C2 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1]) {

                        if (jobAreas[j][JOB_DATA.C2 - 1] != "") {

                            if (option.text == jobAreas[j][JOB_DATA.NAME - 1]) {
                                option.text = jobAreas[j][JOB_DATA.NAME - 1] + " (" + jobStudents[i][STUDENT_DATA["LAST"] - 1] + ", ";
                                continue;
                            }

                            if (jobAreas[j][JOB_DATA.C1 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1] || jobAreas[j][JOB_DATA.C2 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1]) {
                                option.text += jobStudents[i][STUDENT_DATA["LAST"] - 1] + ")";
                            }

                        } else {
                            option.text = jobAreas[j][JOB_DATA.NAME - 1] + " (" + jobStudents[i][STUDENT_DATA["LAST"] - 1] + ")";
                            break;
                        }

                    }

                }

                option.value = jobAreas[j][JOB_DATA["UJID"] - 1];

                cbxassign.add(option);
            }

        }
    }
}

function setPrefectFilter() {
    if (SelectedFunction == FunctionType.CreateJobs) {
        var prefectcbx = document.getElementById("prefectcbx");

        var cbxassign = document.getElementById("assigncbx");
        cbxassign.selectedIndex = 0;
        loadsetpeople();
        for (i = cbxassign.options.length - 1; i >= 1; i--) {
            cbxassign.options[i].style.display = "none";

            if (selectedSchool == "US" && cbxassign.options[i].innerHTML.indexOf("M.S.") < 0 || selectedSchool == "MS" && cbxassign.options[i].innerHTML.indexOf("M.S.") >= 0) {

                if (prefectcbx.checked == false && cbxassign.options[i].innerHTML.toLowerCase().indexOf("proctor") == -1 && cbxassign.options[i].innerHTML.toLowerCase().indexOf("prefect") == -1) {
                    cbxassign.options[i].style.display = "block";
                } else if (prefectcbx.checked == true && (cbxassign.options[i].innerHTML.toLowerCase().indexOf("proctor") > -1 || cbxassign.options[i].innerHTML.toLowerCase().indexOf("prefect") > -1)) {
                    cbxassign.options[i].style.display = "block";
                }

            }
        }
    }
}

function updateCaptain() {
    if (SelectedFunction == FunctionType.CreateJobs) {
        var cbxassign = document.getElementById("assigncbx");

        if (cbxassign.selectedIndex > 0 && selJobInd != -1) {
            var option = cbxassign.options[cbxassign.selectedIndex];

            option.text = jobAreas[selJobInd][JOB_DATA.NAME - 1];

            for (var i = 0; i < jobStudents.length; i++) {

                if (jobAreas[selJobInd][JOB_DATA.C1 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1] || jobAreas[selJobInd][JOB_DATA.C2 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1]) {

                    if (jobAreas[selJobInd][JOB_DATA.C2 - 1] != "") {

                        if (option.text == jobAreas[selJobInd][JOB_DATA.NAME - 1]) {
                            option.text = jobAreas[selJobInd][JOB_DATA.NAME - 1] + " (" + jobStudents[i][STUDENT_DATA["LAST"] - 1] + ", ";
                            continue;
                        }

                        if (jobAreas[selJobInd][JOB_DATA.C1 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1] || jobAreas[selJobInd][JOB_DATA.C2 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1]) {
                            option.text += jobStudents[i][STUDENT_DATA["LAST"] - 1] + ")";
                        }

                    } else {
                        option.text = jobAreas[selJobInd][JOB_DATA.NAME - 1] + " (" + jobStudents[i][STUDENT_DATA["LAST"] - 1] + ")";
                        break;
                    }

                } //if not a captain of area, then must be worker, so reduce access level and previously assigned as captain
                else if (DemoteUUID != "" && DemoteUUID == jobStudents[i][STUDENT_DATA.UUID - 1] && jobStudents[i][STUDENT_DATA.ACCESS - 1] < ACCESS_LEVELS.STUDENT && (jobStudents[i][STUDENT_DATA["JOB" + citper] - 1] == jobAreas[selJobInd][JOB_DATA["UJID"] - 1] || jobStudents[i][STUDENT_DATA["JOB" + citper] - 1] == "")) {
                    jobStudents[i][STUDENT_DATA.ACCESS - 1] = ACCESS_LEVELS.STUDENT;
                    jobStudents[i].modified = true;
                    DemoteUUID = "";
                    //alert("demote");
                }

            }
        }
    }
}

function AddCaptain(from) {
    if (SelectedFunction == FunctionType.CreateJobs) {
        if (selJobInd != -1) {

            var studentL = "";
            if (from == '1') {
                studentL = document.getElementById('StudentList');
            } else {
                studentL = document.getElementById('JobList');
            }

            var selectedOption = -1;
            var t = 0;
            for (i = studentL.options.length - 1; i >= 0; i--) {
                if (studentL.options[i].selected == true && studentL.options[i].text != "") {
                    t++;
                    selectedOption = i;
                }
            }

            if (t == 1) {

                var studSel = studentL.options[selectedOption].value;

                if (jobAreas[selJobInd][JOB_DATA.C1 - 1] == "") {
                    jobAreas[selJobInd].modified = true;

                    jobAreas[selJobInd][JOB_DATA.C1 - 1] = jobStudents[studentL.options[selectedOption].value][STUDENT_DATA.UUID - 1];
                    document.getElementById("capt1").innerHTML = jobStudents[studSel][STUDENT_DATA["FIRST"] - 1] + " " + jobStudents[studSel][STUDENT_DATA["LAST"] - 1];

                    if (jobStudents[studSel][STUDENT_DATA.ACCESS - 1] > ACCESS_LEVELS.PROCTOR && jobAreas[selJobInd][JOB_DATA.NAME - 1].toLowerCase().indexOf("proctor") != -1) {
                        jobStudents[studSel][STUDENT_DATA.ACCESS - 1] = ACCESS_LEVELS.PROCTOR;
                        jobStudents[studSel].modified = true;
                    } else if (jobStudents[studSel][STUDENT_DATA.ACCESS - 1] > ACCESS_LEVELS.PREFECT && jobAreas[selJobInd][JOB_DATA.NAME - 1].toLowerCase().indexOf("prefect") != -1) {
                        jobStudents[studSel][STUDENT_DATA.ACCESS - 1] = ACCESS_LEVELS.PREFECT;
                        jobStudents[studSel].modified = true;
                    } else if (jobStudents[studSel][STUDENT_DATA.ACCESS - 1] > ACCESS_LEVELS.CAPTAIN) {
                        jobStudents[studSel][STUDENT_DATA.ACCESS - 1] = ACCESS_LEVELS.CAPTAIN;
                        jobStudents[studSel].modified = true;
                    }

                    updateCaptain();
                } else if (!jobAreas[selJobInd][JOB_DATA.C2 - 1]) {
                    if (jobAreas[selJobInd][JOB_DATA.C1 - 1] != jobStudents[studentL.options[selectedOption].value][STUDENT_DATA.UUID - 1]) {
                        jobAreas[selJobInd].modified = true;

                        jobAreas[selJobInd][JOB_DATA.C2 - 1] = jobStudents[studentL.options[selectedOption].value][STUDENT_DATA.UUID - 1];
                        document.getElementById("capt2").innerHTML = jobStudents[studSel][STUDENT_DATA["FIRST"] - 1] + " " + jobStudents[studSel][STUDENT_DATA["LAST"] - 1];

                        if (jobStudents[studSel][STUDENT_DATA.ACCESS - 1] > ACCESS_LEVELS.PROCTOR && jobAreas[selJobInd][JOB_DATA.NAME - 1].toLowerCase().indexOf("proctor") != -1) {
                            jobStudents[studSel][STUDENT_DATA.ACCESS - 1] = ACCESS_LEVELS.PROCTOR;
                            jobStudents[studSel].modified = true;
                        } else if (jobStudents[studSel][STUDENT_DATA.ACCESS - 1] > ACCESS_LEVELS.PREFECT && jobAreas[selJobInd][JOB_DATA.NAME - 1].toLowerCase().indexOf("prefect") != -1) {
                            jobStudents[studSel][STUDENT_DATA.ACCESS - 1] = ACCESS_LEVELS.PREFECT;
                            jobStudents[studSel].modified = true;
                        } else if (jobStudents[studSel][STUDENT_DATA.ACCESS - 1] > ACCESS_LEVELS.CAPTAIN) {
                            jobStudents[studSel][STUDENT_DATA.ACCESS - 1] = ACCESS_LEVELS.CAPTAIN;
                            jobStudents[studSel].modified = true;
                        }

                        updateCaptain();
                    }
                } else {
                    showModal(0, "Please Remove A Captain First (Click Their Name)");
                }

            } else if (selectedOption != -1) {
                showModal(0, "Please Set Only One Captain at a Time!");
            }

        }
    }
}


var DemoteUUID = "";

function removeCaptain(c) {
    if (SelectedFunction == FunctionType.CreateJobs) {
        DemoteUUID = "";

        if (selJobInd != -1) {
            if (c == '1') {

                DemoteUUID = jobAreas[selJobInd][JOB_DATA.C1 - 1];

                jobAreas[selJobInd][JOB_DATA.C1 - 1] = "";
                document.getElementById("capt1").innerHTML = "";

                if (!jobAreas[selJobInd][JOB_DATA.C1 - 1]) {

                    jobAreas[selJobInd].modified = true;

                    jobAreas[selJobInd][JOB_DATA.C1 - 1] = jobAreas[selJobInd][JOB_DATA.C2 - 1];
                    document.getElementById("capt1").innerHTML = document.getElementById("capt2").innerHTML;
                    jobAreas[selJobInd][JOB_DATA.C2 - 1] = "";
                    document.getElementById("capt2").innerHTML = "";

                    //jobStudents[studSel][STUDENT_DATA.ACCESS-1] = ACCESS_LEVELS.CAPTAIN;

                    updateCaptain();
                }
            } else {
                jobAreas[selJobInd].modified = true;

                DemoteUUID = jobAreas[selJobInd][JOB_DATA.C2 - 1];


                jobAreas[selJobInd][JOB_DATA.C2 - 1] = "";
                document.getElementById("capt2").innerHTML = "";
                updateCaptain();
            }
        }
    }
}

var selJobInd = -1;

function loadsetpeople() {

    if (SelectedFunction == FunctionType.CreateJobs) {
        document.getElementById("capt1").innerHTML = "";
        document.getElementById("capt2").innerHTML = "";
    }

    var cbxassign = document.getElementById("assigncbx");

    if (cbxassign.selectedIndex > 0) {
        var finder = cbxassign.options[cbxassign.selectedIndex].value;
        //alert(finder);

        var JobList = document.getElementById("JobList");
        for (i = JobList.options.length - 1; i > 0; i--) {
            JobList.remove(i);
        }

        //UJID AND UFID HAVE SAME INDEX SO SAME FINDER!
        selJobInd = -1;
        for (var j = 0; j < jobAreas.length; j++) {
            if (SelectedFunction == FunctionType.CreateJobs && jobAreas[j][JOB_DATA["UJID"] - 1] == String(finder)) {
                selJobInd = j;
            } else if (SelectedFunction == FunctionType.CreateAdvs && jobAreas[j][STUDENT_DATA.UUID - 1] == String(finder)) {
                selJobInd = j;
            }
        }

        for (var i = 0; i < jobStudents.length; i++) {

            if (SelectedFunction == FunctionType.CreateJobs && jobAreas[selJobInd][JOB_DATA.C1 - 1] != "" && jobAreas[selJobInd][JOB_DATA.C1 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1]) {
                document.getElementById("capt1").innerHTML = jobStudents[i][STUDENT_DATA["FIRST"] - 1] + " " + jobStudents[i][STUDENT_DATA["LAST"] - 1];
            } else if (SelectedFunction == FunctionType.CreateJobs && jobAreas[selJobInd][JOB_DATA.C2 - 1] != "" && jobAreas[selJobInd][JOB_DATA.C2 - 1] == jobStudents[i][STUDENT_DATA.UUID - 1]) {
                document.getElementById("capt2").innerHTML = jobStudents[i][STUDENT_DATA["FIRST"] - 1] + " " + jobStudents[i][STUDENT_DATA["LAST"] - 1];
            }

            if ((SelectedFunction == FunctionType.CreateAdvs && String(jobStudents[i][STUDENT_DATA["ADVISOR"] - 1]) == String(finder)) || (SelectedFunction == FunctionType.CreateJobs && jobStudents[i][STUDENT_DATA["JOB" + citper] - 1] == String(finder))) {

                var option = document.createElement("option");
                var nick = "";
                if (jobStudents[i][STUDENT_DATA["NICKNAME"] - 1] != "") {
                    nick = " (" + jobStudents[i][STUDENT_DATA["NICKNAME"] - 1] + ")";
                }

                if (SelectedFunction == FunctionType.CreateJobs) {
                    option.text = jobStudents[i][STUDENT_DATA["LAST"] - 1] + ", " + jobStudents[i][STUDENT_DATA["FIRST"] - 1] + nick + " " + jobStudents[i][STUDENT_DATA["GRADE"] - 1] + " (" + jobStudents[i][STUDENT_DATA["ADVISOR"] - 1] + ")";
                } else if (SelectedFunction == FunctionType.CreateAdvs) {
                    option.text = jobStudents[i][STUDENT_DATA["LAST"] - 1] + ", " + jobStudents[i][STUDENT_DATA["FIRST"] - 1] + nick + " " + jobStudents[i][STUDENT_DATA["GRADE"] - 1];
                }
                option.value = i;

                option.grade = jobStudents[i][STUDENT_DATA["GRADE"] - 1];

                JobList.add(option);

            }
        }
    } else {

        for (var i = document.getElementById("JobList").options.length - 1; i > 0; i--) {
            document.getElementById("JobList").remove(i);
        }
        document.getElementById("lblJobList").innerHTML = "Students in Job: " + String(document.getElementById("JobList").length - 1);
    }
    UpdateCount();
}

function showSelected(e) {

    document.getElementById("ListCount").style.display = "block";
    document.getElementById("ListCount").style.left = String(e.clientX) + "px";
    document.getElementById("ListCount").style.top = e.clientY + "px";

    //var list = document.getElementById("StudentList").hasFocus() ? document.getElementById("StudentList"): document.getElementById("JobList")
    var sender = e.target || e.srcElement;
    while (["StudentList", "JobList"].indexOf(sender.id) == -1) {
        sender = sender.parentNode;
    }

    var t = 0;
    for (var i = sender.length - 1; i >= 0; i--) {
        if (sender.options[i].selected == true && sender.options[i].text != "") {
            t++;

        }
    }
    document.getElementById("ListCountVal").innerHTML = String(t);
}


function clearJobSetForm() {

    document.getElementById("prefectcbx").checked = false;
    document.getElementById("capt1").innerHTML = "";
    document.getElementById("capt2").innerHTML = "";

    var boxes = document.getElementsByClassName("showgrades");

    boxes[boxes.length - 1].checked = false;
    boxes[boxes.length - 2].checked = false;

    for (var i = 0; i < 7; i++) {
        boxes[i].checked = true;
    }
    //spreadlink = "";
    //document.getElementById("jobspread").value = "Spreadsheet URL:";
    for (var i = document.getElementById("StudentList").options.length - 1; i > 0; i--) {
        document.getElementById("StudentList").remove(i);
    }

    for (var i = document.getElementById("JobList").options.length - 1; i > 0; i--) {
        document.getElementById("JobList").remove(i);
    }

    var cbxassign = document.getElementById("assigncbx");
    for (i = cbxassign.options.length - 1; i > 0; i--) {
        cbxassign.remove(i);
    }

    totalHidden = 0;
    UpdateCount();

}

var selectedSchool = "";

function getSchool(school) {

    if (SelectedFunction == FunctionType.CreateJobs) {
        if (citper >= 1) {
            document.getElementsByName("jobassignschool").forEach((btn) => {
                btn.disabled = "true";
            });
            selectedSchool = school;

            clearJobSetForm();
            loadsetpeople();
            loadSetJobs();
        } else {
            showModal(0, "Please Select a Cit Period First!");
        }
    } else if (SelectedFunction == FunctionType.CreateAdvs) {
        selectedSchool = school;

        clearJobSetForm();
        loadsetpeople();
        loadSetJobs();

    }

}

function filterGrades(filter) {
    var boxes = document.getElementsByClassName("showgrades");

    if (filter == "MS") {
        for (var i = 4; i < 7; i++) {
            boxes[i].checked = boxes[boxes.length - 1].checked;
        }
    }

    if (filter == "US") {
        for (var i = 0; i < 4; i++) {
            boxes[i].checked = boxes[boxes.length - 2].checked;
        }
    }

    disableGrades();

}

var totalHidden = 0;

function disableGrades() {

    var grades = [];

    var boxes = document.getElementsByClassName("showgrades");

    for (var i = 0; i < boxes.length; i++) {
        var el = boxes[i];
        if (el.checked)
            grades[grades.length] = String(el.value);
    }

    totalHidden = 0;

    var people = document.getElementById("StudentList");
    for (var i = 1; i < people.options.length; i++) {
        var el = people.options[i];

        if (grades.indexOf(String(el.grade)) > -1) {
            el.style.display = "block";
        } else {
            el.selected = false;
            el.style.display = "none";
            totalHidden += 1;
        }
    }

    UpdateCount();
}

function SelectMoveRows(SS1, SS2) {
    var SelID = '';
    var SelText = '';

    var cbxassign = document.getElementById("assigncbx");

    if (cbxassign.selectedIndex > 0) {
        // Move rows from SS1 to SS2 from bottom to top
        for (i = SS1.options.length - 1; i >= 0; i--) {
            if (SS1.options[i].selected == true && SS1.options[i].text != "") {
                SelID = SS1.options[i].value;

                if (SS1.id == "StudentList") {
                    if (SelectedFunction == FunctionType.CreateJobs) {
                        jobStudents[SelID][STUDENT_DATA["JOB" + citper] - 1] = cbxassign.options[cbxassign.selectedIndex].value;
                    } else if (SelectedFunction == FunctionType.CreateAdvs) {
                        jobStudents[SelID][STUDENT_DATA["ADVISOR"] - 1] = cbxassign.options[cbxassign.selectedIndex].value;
                    }
                } else {
                    if (SelectedFunction == FunctionType.CreateJobs) {
                        jobStudents[SelID][STUDENT_DATA["JOB" + citper] - 1] = "";
                    } else if (SelectedFunction == FunctionType.CreateAdvs) {
                        jobStudents[SelID][STUDENT_DATA["ADVISOR"] - 1] = "";
                    }
                }

                jobStudents[SelID].modified = true;

                SelText = SS1.options[i].text;

            }
        }

        for (var i = SS1.options.length - 1; i > 0; i--) {
            SS1.remove(i);
        }

        for (var i = SS2.options.length - 1; i > 0; i--) {
            SS2.remove(i);
        }

        for (var i = 0; i < jobStudents.length; i++) {
            var option = document.createElement("option");
            var nick = "";
            if (jobStudents[i][STUDENT_DATA["NICKNAME"] - 1] != "") {
                nick = " (" + jobStudents[i][STUDENT_DATA["NICKNAME"] - 1] + ")";
            }
            if (SelectedFunction == FunctionType.CreateJobs) {
                option.text = jobStudents[i][STUDENT_DATA["LAST"] - 1] + ", " + jobStudents[i][STUDENT_DATA["FIRST"] - 1] + nick + " " + jobStudents[i][STUDENT_DATA["GRADE"] - 1] + " (" + jobStudents[i][STUDENT_DATA["ADVISOR"] - 1] + ")";
            } else if (SelectedFunction == FunctionType.CreateAdvs) {
                option.text = jobStudents[i][STUDENT_DATA["LAST"] - 1] + ", " + jobStudents[i][STUDENT_DATA["FIRST"] - 1] + nick + " " + jobStudents[i][STUDENT_DATA["GRADE"] - 1];
            }

            option.value = i;

            option.grade = jobStudents[i][STUDENT_DATA["GRADE"] - 1];

            if ((SelectedFunction == FunctionType.CreateAdvs && jobStudents[i][STUDENT_DATA["ADVISOR"] - 1] == cbxassign.options[cbxassign.selectedIndex].value) || (SelectedFunction == FunctionType.CreateJobs && jobStudents[i][STUDENT_DATA["JOB" + citper] - 1] == cbxassign.options[cbxassign.selectedIndex].value)) {
                document.getElementById("JobList").add(option);
            } else if ((SelectedFunction == FunctionType.CreateAdvs && jobStudents[i][STUDENT_DATA["ADVISOR"] - 1] == "") || (SelectedFunction == FunctionType.CreateJobs && jobStudents[i][STUDENT_DATA["JOB" + citper] - 1] == "")) {
                document.getElementById("StudentList").add(option);
            }

        }
        disableGrades();
    }

    UpdateCount();
}

function UpdateCount() {
    document.getElementById("lblStudList").innerHTML = "Students Remaining: " + String(document.getElementById("StudentList").length - 1 - totalHidden);
    if (SelectedFunction == FunctionType.CreateJobs) 
        document.getElementById("lblJobList").innerHTML = "Students in Job: " + String(document.getElementById("JobList").length - 1);
    else
        document.getElementById("lblJobList").innerHTML = "Students in Advisory: " + String(document.getElementById("JobList").length - 1);
}

var spreadlink = "";

function submitSpreadsheet() {

    if (document.getElementById("jobspread").value != "" && document.getElementById("jobspread").value != "Spreadsheet URL:") {
        spreadlink = document.getElementById("jobspread").value;

        document.getElementById("jobspread").disabled = true;

        google.script.run.withSuccessHandler(() => {
            document.getElementById("jobspread").style.color = "blue";
            document.activeElement.blur();
            document.getElementById("jobspread").disabled = false;
        }).withFailureHandler(() => {

            spreadlink = "";
            document.getElementById("jobspread").value = "Spreadsheet URL:";
            document.getElementById("jobspread").style.color = "black";
            showModal(0, "Invalid URL or self.help@woosterschool.org does not have access.");
            document.getElementById("jobspread").disabled = false;
        }).testURL(spreadlink);


    } else {

        if (document.getElementById("jobspread").value == "" || spreadlink != "") {
            document.getElementById("jobspread").value = "Spreadsheet URL:";
        } else {
            document.getElementById("jobspread").value = "";
        }
        document.getElementById("jobspread").style.color = "black";
        spreadlink = "";
    }

}

function setJobs() {

    if ((citper >= 1 && citper <= 6) || SelectedFunction == FunctionType.CreateAdvs) {
        if (jobStudents.length > 1) {

            var modjobStudents = [[]];
            var modjobAreas = [[]];

            var modstudnum = 0;
            for (var i = 0; i < jobStudents.length; i++) {
                if (jobStudents[i].hasOwnProperty("modified")) {
                    modjobStudents[modstudnum] = jobStudents[i];
                    //delete jobStudents[i].modified;
                    modstudnum++;
                }
            }

            var modjobnum = 0;
            for (var i = 0; i < jobAreas.length; i++) {
                if (jobAreas[i].hasOwnProperty("modified")) {
                    modjobAreas[modjobnum] = jobAreas[i];
                    //delete jobAreas[i].modified;
                    modjobnum++;
                }

            }
            if (modstudnum + modjobnum > 0 || spreadlink != "") {

                lockJobElems();
                //document.body.style.cursor = "wait";
                document.getElementById("savejoblist").value = "Saving - Please Wait";
                document.getElementById("savejoblist").style.backgroundColor = "#800000";
                document.getElementById("savejoblist").disabled = "true";

                if (SelectedFunction == FunctionType.CreateJobs) {
                    google.script.run.withSuccessHandler(() => {
                        document.getElementById("savejoblist").removeAttribute("disabled");
                        document.getElementById("savejoblist").value = "Save Changes";
                        document.getElementById("savejoblist").style.backgroundColor = "#32CD32";

                        getSchool(selectedSchool);
                    }).withFailureHandler(() => {
                        document.getElementById("savejoblist").removeAttribute("disabled");
                        document.getElementById("savejoblist").value = "Save Changes";
                        document.getElementById("savejoblist").style.backgroundColor = "#32CD32";

                        unlockJobElems();
                        showModal(0, "Operation Failed. Please Try Again or Reload the Page");
                    }).setJobAssignments(modjobStudents, modjobAreas, citper, selectedSchool, spreadlink);
                } else if (SelectedFunction == FunctionType.CreateAdvs) {
                    google.script.run.withSuccessHandler(() => {
                        document.getElementById("savejoblist").removeAttribute("disabled");
                        document.getElementById("savejoblist").value = "Save Changes";
                        document.getElementById("savejoblist").style.backgroundColor = "#32CD32";

                        getSchool(selectedSchool);
                    }).withFailureHandler(() => {
                        document.getElementById("savejoblist").removeAttribute("disabled");
                        document.getElementById("savejoblist").value = "Save Changes";
                        document.getElementById("savejoblist").style.backgroundColor = "#32CD32";

                        unlockJobElems();
                        showModal(0, "Operation Failed. Please Try Again or Reload the Page");
                    }).setAdvAssignments(modjobStudents, modjobAreas, selectedSchool, spreadlink);
                }
            } else {
                showModal(0, "Please Make a Change First!");
            }
        } else {
            showModal(0, "Please Wait!");
        }
    } else {
        showModal(0, "Cannot Make Job List for Cit " + citper);
    }

}


