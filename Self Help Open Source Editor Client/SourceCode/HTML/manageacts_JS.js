

/**
 * Toggle activity registration by calling server
 */
function togglereg(){
	google.script.run
	.withSuccessHandler((result) => {
		document.getElementById("regstatus").innerHTML = "Registration is currently " + result;
		document.getElementById("sturegstatus").innerHTML = "Registration is currently " + result;
		showModal(0, "Success!");
	})
	.withFailureHandler(() => showModal(0, "Action Failed"))
	.toggleRegistration();
}

/**
 * Update Activity Spreadsheet
 */
function updateActs(){
	
	document.getElementById("createactlist").value = "Making - Please Wait";
    document.getElementById("createactlist").style.backgroundColor = "#800000";
    document.getElementById("createactlist").disabled = "true";
	
	 google.script.run.withSuccessHandler(() => {
         document.getElementById("createactlist").removeAttribute("disabled");
         document.getElementById("createactlist").value = "Update Registration Spreadsheet";
         document.getElementById("createactlist").style.backgroundColor = "#32CD32";
         showModal(0, "Success!");
     }).withFailureHandler(() => {
         document.getElementById("createactlist").removeAttribute("disabled");
         document.getElementById("createactlist").value = "Update Registration Spreadsheet";
         document.getElementById("createactlist").style.backgroundColor = "#32CD32";
         showModal(0, "Operation Failed. Please Try Again or Reload the Page");
     }).makeActivitySpreadsheet();
}
