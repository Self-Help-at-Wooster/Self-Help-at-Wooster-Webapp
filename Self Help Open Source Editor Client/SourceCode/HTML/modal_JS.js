
	function showModal(modaltype, message) {
		if (modaltype === 1) {
	
			if (isMobile) {
				message = message.replace("<br>", " ");//format for mobile
				var rsp = confirm(message);
				if (rsp) {
					setTimeout(function() {
						document.getElementById("modal-btnYes").click();
					}, 10);
				}
			} else {
				document.getElementById("modal-btnYes").style.display = "inline";
				document.getElementById("modal-btnNo").style.display = "inline";
				document.getElementById("modal-btnOkay").style.display = "none";
			}
		} else {
			if (isMobile)
				alert(message);
			else {
				document.getElementById("modal-btnYes").style.display = "none";
				document.getElementById("modal-btnNo").style.display = "none";
				document.getElementById("modal-btnOkay").style.display = "block";
			}
		}
	
		if (!isMobile) {
			document.getElementById("modal-text").innerHTML = message;
	
			setTimeout(function() {
				document.getElementById("myModal").style.display = "table";
			}, 10);
		}
	}