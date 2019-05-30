var dataTable;

$(document).ready(function(){
	dataTable = $('.table').DataTable({
    	"language": {
            "lengthMenu": "Show _MENU_ entries",
            "zeroRecords": "No results found in your search",
            "searchPlaceholder": "Search email",
            "infoEmpty": "No data available in table",
            "search": "Search Report:",
        },
    });
    //Verifies if there is currently an authenticated user, so when reloading the page does not close the current session
    var currentUser = JSON.parse(localStorage.getItem('current_user'));
    if(currentUser){
    	$("#user").val(currentUser.username);
    	authenticateUser();
    }
    eventHandlers();
});

function authenticateUser(){
	// stored username from the register form
	var username = $("#user").val();
	// try to get the user
    var user = JSON.parse(localStorage.getItem(username));
    if(user){
    	if(user.username == username) {
    			$('#modalText').text('You are loged in');
    	        $("#modal").modal("show");
    	        $("#form").hide();
    	        localStorage.setItem('current_user',JSON.stringify(user));
    	        //$("#rightElements").html('<ul id="rightElements" class="nav navbar-nav navbar-right"> <li class="nav-item"><a id="right_item1" class="nav-link" href="#"><i class="fa fa-user"></i> ' + user.username + '</a></li><li class="nav-item"><a id="right_item2" class="nav-link" href="#"><i class="fas fa-sign-out-alt"></i> Log out</a></li></ul>');
    	        $("#right_item1").html('<a id="right_item1" class="nav-link" href="#"><i class="fa fa-user"></i> ' + user.username + '</a>');         	       
    	        $("#right_item2").html('<a id="right_item2" class="nav-link" href="#"><i class="fas fa-sign-out-alt"></i> Log out</a>');
    	        $(".form-inline").css('visibility','visible');
    	        $("#checkReports").css('display','block');
    	        fillTable(user);
    	        //$("#right_item2").text('Log out');
    	    }
    }else{
    	$('#modalText').text('Error! Username not found');
    	$("#modal").modal("show");
    }
}

function registerUser(){
	//this function registers a new user in local storage
	var username = $("#user").val();
	if(username != ""){
		var newUser = new User(username);
	    localStorage.setItem(username,JSON.stringify(newUser));
	    $('#modalText').html("Your account has been registered. To access your account, use the following password: <strong>" + newUser.password + "</strong>");
    	$("#modal").modal("show");
    	$("#form").hide();
	}else{
		$('#modalText').text('Missing data! Please try again');
    	$("#modal").modal("show");
	}
}

function loginButtonAction(){
	//actions related to Login button
	var action = $("#txtAction").text();
	var username = $("#user").val();
	switch(action){
		case 'Sign In':
			var password = $("#pass").val();
			if(username !== "" && password !== ""){
				authenticateUser();
			}else{
				$('#modalText').text('Missing data! Please try again');
    			$("#modal").modal("show");
			}
			break;
		case 'Sign Up':
			if(username !== ""){
				registerUser();
			}else{
				$('#modalText').text('Missing data! Please try again');
    			$("#modal").modal("show");
			}
			break;
		default: break;	
	}
}


function eventHandlers(){
	//handles the events of the components
	$("#register").click(function(){
		var txtAction = $("#txtAction");
		var btnLogin = $("#btnLogin");
		if(txtAction.text() == 'Sign In' && btnLogin.val() == 'Log in'){
			txtAction.text('Sign Up');
			btnLogin.val('Sign Up');
		}else{
			txtAction.text('Sign In');
			btnLogin.val('Log in');
		}
	});

	$("#right_item1").click(function(){
		var currentUser = localStorage.getItem('current_user');
		if(currentUser === null){
			$("#txtAction").text('Sign In');
			$("#btnLogin").val('Log in');
			$("#pass").css('display','inline');
			$("#passSpan").css('display','inline');
			$("#form").css('display','inline');
		}
	});

	$("#right_item2").click(function(){
		var table = $("#table");
		if(table.css('display') != 'none'){
			table.css('display','none'); 
		}
		$("#checkReports").css('display','none');
		var currentUser = localStorage.getItem('current_user');
		if(currentUser === null){
			$("#txtAction").text('Sign Up');
			$("#btnLogin").val('Sign Up');
			$("#pass").css('display','none');
			$("#passSpan").css('display','none');
			$("#form").css('display','inline');
		}else{
			$("#right_item1").html('<a id="right_item1" class="nav-link" href="#"><i class="fas fa-sign-in-alt"></i> Login</a>');         	       
    	    $("#right_item2").html('<a id="right_item2" class="nav-link" href="#"><i class="fa fa-user"></i> Sign Up</a>');
			localStorage.removeItem('current_user');
			dataTable.rows().remove().draw();
			$('#modalText').text('Logged out successfully');
    	    $("#modal").modal("show");
    	    $(".form-inline").css('visibility','hidden');
    	    $("#rightElements").attr('class','nav navbar-nav navbar-right');
		}
	});
	$("#btnSearch").click(function () {
		//gets the json object according to the specified email
			var email = $("#email").val();
			if(email){
	          $.ajax({
	          	url: "https://www.beenverified.com/hk/dd/teaser/email?email=" + $("#email").val(),
	          		data: {
	          			query: "beer"
	          		},
	          		type: "GET",
	          		dataType: "jsonp",
	          		success: function(respuesta){
	          			console.log("Recibes: ", respuesta);
	          			var current_user = JSON.parse(localStorage.getItem('current_user'));
	          			var data = new Object();
	          			data.names = respuesta.names;
	          			data.gender = respuesta.gender;
	          			data.addresses = respuesta.addresses;
	          			data.phones = respuesta.phones;
	          			data.emails = respuesta.emails;
	          			data.jobs = respuesta.jobs;
	          			data.social = respuesta.social;
	          			var r = new Report(current_user.username,$("#email").val(),data);
	          			current_user.reports.push(r);
	          			localStorage.setItem(current_user.username,JSON.stringify(current_user));
	          			localStorage.setItem('current_user',JSON.stringify(current_user));
	          			$('#modalText').text('Done! Please check your reports');
	    				$("#modal").modal("show");
	          			updateTable(current_user);
	          		}
	          	});
	    	}else{
	    		$('#modalText').text('Please enter an email!');
	    		$("#modal").modal("show");
	    	}
	});
	$("#checkReports").click(function(){
		var form = $("#form");
		var table = $("#table");
		if(form.css('display') != 'none'){
			form.css('display','none'); 
		}else if(table.css('display') == 'none'){
			$('#table').css('display','inline');
		}else{
			$('#table').css('display','none');
		}
		
		
	});

}

function fillTable(currentUser){
	//Fill the current user's report table if you has associated reports when logging in
	if(currentUser.reports.length !== 0){
		$("#tableBody").html('');
		var email;
		for(var i = 0; i < currentUser.reports.length; i++){
			email = currentUser.reports[i].requestedUser;
	        dataTable.row.add( [
	        		 email,
	        		 '<button onclick="viewReport(this)" type="button" class="btn btn-success">View report</button>'
	                ] ).draw();
	    }
	}
}

function updateTable(currentUser){
	//Updates the report table when searching for a new one

	if(currentUser.reports.length === 1){
		$("#tableBody").html('');
	}
	var email = currentUser.reports[currentUser.reports.length - 1].requestedUser;
	dataTable.row.add( [
		 email,
		 '<button onclick="viewReport(this)" type="button" class="btn btn-success">View report</button>'
        ] ).draw();
}

function viewReport(elem){
	var btn = $(elem);
	var email = btn.parent().prev().text();
	var current_user = JSON.parse(localStorage.getItem('current_user'));
	var nd = 'No data found';
	for(var i = 0; i < current_user.reports.length; i++){
		if(current_user.reports[i].requestedUser === email){
			var data = $.isEmptyObject(current_user.reports[i].data.names) == false ? current_user.reports[i].data.names[0]["full"] : nd; 
			$("#menu1").html('</br><p>' + data + '</p></br>');

			data = $.isEmptyObject(current_user.reports[i].data.gender) == false ? current_user.reports[i].data.gender : nd;
			$("#menu2").html('</br><p>' + data + '</p></br>');

			data = $.isEmptyObject(current_user.reports[i].data.addresses) == false ? current_user.reports[i].data.addresses[0]["full"] : nd;
			$("#menu3").html('</br><p>' + data + '</p></br>');

			data = $.isEmptyObject(current_user.reports[i].data.phones) == false ? current_user.reports[i].data.phones[0]["number"] : nd;
			$("#menu4").html('</br><p>' + data + '</p></br>');

			data = $.isEmptyObject(current_user.reports[i].data.emails) == false ? current_user.reports[i].data.emails[0]["email_address"] : nd;
			$("#menu5").html('</br><p>' + data + '</p></br>');

			data = $.isEmptyObject(current_user.reports[i].data.jobs) == false ? current_user.reports[i].data.jobs : nd;
			$("#menu6").html('</br><p>' + data + '</p></br>');

			data = $.isEmptyObject(current_user.reports[i].data.social) == false ? current_user.reports[i].data.social : nd;
			$("#menu7").html('</br><p>' + data + '</p></br>');
			break;

		}
	}
	$("#modal2").modal("show");
}



//////////////////////////////////////////////////////////////Classes//////////////////////////////////////////////////////////////

class User{
	constructor(username){
		this.username = username;
		this.password = 'BV-API-Challenge';
		this.reports = new Array();
	}
}

class Report {
  constructor (user, requestedUser, data) {
    this.user = user;
    this.requestedUser = requestedUser;
    this.data = data;
  }
}
