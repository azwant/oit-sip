$(document).ready(function(){
	$('.homecontainer').hide();
	$('.loancontainer').hide();
	$('.returncontainer').hide();
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January=0
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	today = dd + '-' + mm + '-' + yyyy;
	var config = {
	    apiKey: "AIzaSyC2-NT9OurrHCp1DzhkNn1kyFBUkMvP35o",
	    authDomain: "oit-sip.firebaseapp.com",
	    databaseURL: "https://oit-sip.firebaseio.com/",
	    projectId: "oit-sip",
	    storageBucket: "oit-sip.appspot.com",
	    messagingSenderId: "916247169170"
	};
	firebase.initializeApp(config);
	//create firebase references
	var Auth = firebase.auth(); 
	var dbRef = firebase.database();
	var usersRef = dbRef.ref('users')
	var auth = null;
	// end config

	// begin login
	$('.submitforlogin').on('click', function (e) {
	    e.preventDefault();


	    if( $('.loginuser').val() != '' && $('.loginpass').val() != '' ){
	      //login the user
	      var data = {
	        email: $('.loginuser').val(),
	        password: $('.loginpass').val()
	      };
	      firebase.auth().signInWithEmailAndPassword(data.email, data.password)
	        .then(function(authData) {
	          console.log("Authenticated successfully with payload:", authData);
	          auth = authData;
	          // hine login container
	          $('.logincontainer').hide();
	          $('.homecontainer').show();
	          
	        })
	        .catch(function(error) {
	          alert("Login Failed!", error);
	          // $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']))
	        });
	    }
	});
	//  end of authentication

	// home funciton
	$('#homeloan').on('click', function (e) {
	    e.preventDefault();
	    $('.homecontainer').hide();
	    $('.loancontainer').show();

	});
	$('#homereturn').on('click', function (e) {
	    e.preventDefault();
	    $('.homecontainer').hide();
	    $('.returncontainer').show();

	});
	// end of home funciton

// begin customer search
	$('#customersearch').on('click', function (e) {
		e.preventDefault();
		usersRef.orderByChild('email').equalTo($('#customername').val()).on('value', function (snapshot) {
	      var value = snapshot.val();
	      if (value) {
	        // value is an object containing one or more of the users that matched your email query
	        // choose a user and do something with it
	        console.log(value);
	        alert("user found \n " + JSON.stringify(value));
	      } else {
	      	console.log("no user");
	      	alert("No User!!!!!");
	        // res.status(401)
	        //   .json({
	        //     error: 'No user found',
	        //   });
	      }
	    });
		console.log('complete search user');
	});
	$('#customersearchreturn').on('click', function (e) {
		e.preventDefault();
		dbRef.ref('loan').orderByChild('email').equalTo($('#customernamereturn').val()).on('value', function (snapshot) {
	      var value = snapshot.val();
	      if (value) {
	        // value is an object containing one or more of the users that matched your email query
	        // choose a user and do something with it
	        console.log(value);
	        alert("user found \n " + JSON.stringify(value));
	      } else {
	      	console.log("no user");
	      	alert("No User!!!!!");
	        // res.status(401)
	        //   .json({
	        //     error: 'No user found',
	        //   });
	      }
	    });
		console.log('complete search return user');
	});
	// end search customers

	// get qr code
	$('#getlatestqr').on('click', function (e) {
		e.preventDefault();
		dbRef.ref('qr').limitToLast(1).once("child_added", function(snap) {
		       console.log('new record', snap.val().code);
		       $('#itemcode').val(snap.val().code);
		});
		console.log('complete grab qr');
	});
	$('#fetchreturnqrcode').on('click', function (e) {
		e.preventDefault();
		dbRef.ref('returnqr').limitToLast(1).once("child_added", function(snap) {
		       console.log('new record', snap.val().code);
		       $('#returnqrcode').val(snap.val().code);
		});
		console.log('complete grab return qr');
	});
	// end get qr

	// begin submit form loan
	$('#formloan').on('click', function (e) {
		e.preventDefault();
		if( $('#customername').val() != '' && $('#itemcode').val() != '' && $('#loanduration').val() != '' ){
			var onMessageComplete = function(error) {
	            if (error) {
	                console.log('Sorry. Could not send message.');
	            } else {
	                console.log("Message has been sent.");
	            }
	        };
			var formdata = {
				duration: $('#loanduration').val(),
		        email: $('#customername').val(),
		        item: $('#itemcode').val(),
		        start_date: today,
		        status : 0
		      };
		    dbRef.ref('loan').push(formdata, onMessageComplete);
		    alert("Loan has been process");
			$('.loancontainer').hide();
			$('.returncontainer').hide();
			$('.logincontainer').hide();
			$('.homecontainer').show();
		}
	});
	$('#formreturn').on('click', function (e) {
		e.preventDefault();
		if( $('#customernamereturn').val() != '' && $('#returnqrcode').val() != '' ){
			// var onMessageComplete = function(error) {
	  //           if (error) {
	  //               console.log('Sorry. Could not send message.');
	  //           } else {
	  //               console.log("Message has been sent.");
	  //               // hide the form
	  //           }
	  //       };
	      	dbRef.ref('loan').orderByChild('email').equalTo($('#customernamereturn').val()).on("value", function (snapp) {
	      		// var allloan = snapp.val();
	      		snapp.forEach(function(childsnapp) {
	      			var key = childsnapp.key;
	      			var data = childsnapp.val();
	      			// console.log(key+ " :::: "+data);
	      			if (data.item == $('#returnqrcode').val() && data.status == 0) {
		      			console.log(key);
		      			console.dir(data);
		      			dbRef.ref('loan').child(key).update({ status: 1 });
		      			alert("successfully returned");
						$('.loancontainer').hide();
						$('.returncontainer').hide();
						$('.logincontainer').hide();
						$('.homecontainer').show();
			      	}else if(data.item == $('#returnqrcode').val() && data.status == 1){
			      		alert("Item already return");
			      	}else{
			      		alert("Item not found, please rescan");
			      	}
	      		});
	      	});
		}
	});
	// end form loan

// fallback procedure
	$('#homerunloan').on('click',function(e) {
		e.preventDefault();
		$('.logincontainer').hide();
		$('.loancontainer').hide();
		$('.returncontainer').hide();
		$('.homecontainer').show();
	});
	$('#homerunreturn').on('click',function(e) {
		e.preventDefault();
		$('.logincontainer').hide();
		$('.loancontainer').hide();
		$('.returncontainer').hide();
		$('.homecontainer').show();
	});
	$('#logout').on('click',function(e) {
		e.preventDefault();
		$('.loancontainer').hide();
		$('.returncontainer').hide();
		$('.homecontainer').hide();
		$('.logincontainer').show();
	});
	// end fallback procedure
});