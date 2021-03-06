var patientsDB = require('../database/patientsDB.js');
var weightDB = require('../database/weightDB.js');
var problemListDB = require('../database/problemListDB.js');
var allergyDB = require('../database/allergyDB.js');
var immRecordDB = require('../database/immRecordDB.js');
var pharmacyDB = require('../database/pharmacyDB.js');
var users = require('../database/usersDB.js');
var sess;

var createAccount = function(req, res) {
		sess = req.session;
	  var username = req.body.username;
	  var password = req.body.password;
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
	  // in case fields are blank
	  if (username == "") {
	  		res.render('signup.ejs', {message: "Please enter a username"});
	  	}
	  	else if (password == "") {
	  		res.render('signup.ejs', {message: "Please enter a password"});
	  	}
	  	else if (firstname == "") {
	  		res.render('signup.ejs', {message: "Please enter a first name"});
			}
			else if (lastname == "") {
	  		res.render('signup.ejs', {message: "Please enter a last name"});
	  	}
	  	else {
	  		users.get_user(username, function(data, err) {
			  	if (data) {
			    	res.render('signup.ejs', {message: 'That username is already taken'});
			  	}
			    else {
			        // put command here
			    	users.add_user(username, password, firstname, lastname, function(data, err) {
			    		if (err) {
			    	      res.render('login.ejs', {message: 'Error: did not put'});
							} else if (data) {
								sess.username = username;
								res.redirect('/patientSearch');
							} else {
								res.render('login.ejs', {message: 'error did not put 2'});
							}
			    	});
			    }
			});
	  }
};
	
var checkLogin = function(req, res) {
	sess = req.session;
	// get username and password
	  var userInputUsername = req.body.usernameInputField;
    var userInputPassword = req.body.passwordInputField;
    console.log("username: " + userInputUsername + " password: " + userInputPassword);
	  users.check_login(userInputUsername, userInputPassword, function(data, err) {
	    if (err) {
        res.render('login.ejs', {message: "Please enter a username"});
      }else if(data=="n/a"){
        res.render('login.ejs', {message: "Sorry, incorrect username or password"});
	    } else if (data) {
	    	// check if the password matches with the username
        sess.username = userInputUsername;
        res.redirect('/patientSearch');
      }
	  });
	};

var logout = function(req, res) {
	// logout by destroying session
	req.session.destroy(function(err) {
			if(err) {
			} else {
				res.redirect('/');
			}
	});
}

var getUser = function(req, res) {
	sess = req.session;
  var username = req.body.username;
		// First get all keys in the posts table, then get the associated value for each key.
	users.getUser(username, function(data, err) {
		if (err) {

		} else if (data) {
			res.send(data);
	}});
};

var getSignup = function (req, res) {
  res.render('signup.ejs', {message: ''});
}

// this function renders login.ejs first now
var getMain = function (req, res) {
  res.render('login.ejs', {message: ""});
}

// renders the form page which is used to submit a new patient
var getForm = function (req, res) {
  res.render('form.ejs');
}

// renders the patientSearch page which has a search bar
var getSearchPatients = function (req, res) {
  sess = req.session;
  if(sess.username){
    console.log(sess.username);
    users.get_user(sess.username, function(data, err){
      if(err){
        res.render("login.ejs", {message: "Please enter a username and password"});
      } else {
        res.render('patientSearch.ejs', {firstname: data.firstname, lastname: data.lastname} );
      }
    });
  } else {
    res.render("login.ejs", {message: "Please login"});
  }
}

var getPharmacy = function (req, res) {
  console.log("getAllPharmacy called in routes")
  pharmacyDB.getAllPharmacy(function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log("pharmacy routes data: " + data);
      res.render('pharmacy.ejs', { data: data });
    }
  });
}


var getDispensary = function (req, res) {
  res.render('dispensary.ejs');
}

var getAnyPatientPage = function (req, res) {
  var id = decodeURI(req.params.id); // gets id from url
  var age = '100';
  if(sess){
    if(sess.username){
      console.log(sess.username);
      users.get_user(sess.username, function(data, err){
        if(err){
          res.render("login.ejs", {message: "Please enter a username and password"});
        } else {
          var firstname = data.firstname;
          var lastname = data.lastname;
          patientsDB.getPatientById(id, function (data, err) {
            if (err) {
              console.log(err);
            } else {
              // render the patientPage with the returned data
              res.render('template.ejs', { data: data[0], age: age, firstname: firstname, lastname: lastname });
            }
          });
        }
      });
    }
  }
  else {
    res.render("login.ejs", {message: "Please enter a username and password"});
  }
  
}


var getWccForm = function (req, res) {
  console.log('here')
  console.log(req.body)
  var id = decodeURI(req.params.id); // gets id from url
  var age = req.body.age;
  console.log('age: ' + age);
  patientsDB.getPatientById(id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      // render the patientPage with the returned data
      console.log('here')
      res.render('template.ejs', { data: data[0], age: req.body.age });
    }
  });
}



// saves a new patient to the database, and returns patient data 
// params: a JSON of data from form
// returns: patient data (why though??? unclear)
// used in form.ejs in views
var submitPatient = function (req, res) {
  console.log(req.body);
  patientsDB.putPatient(req.body, function (data, err) {
    if (err) {
      console.log("error")
    }
    else if (data) {
      console.log("send")
      res.send({
        message: '',
        patient: data
      });
    }
    else {
    }
  })
  res.render('form.ejs')
}

//used to render the patient page depending on the url of the patient that was clicked
//params: patient url with id embedded in url
var getPatient = function (req, res) {
  var id = decodeURI(req.params.id); // gets id from url
  patientsDB.getPatientById(id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      // render the patientPage with the returned data
      res.render('template.ejs', { data: data[0], url: 'patientPage' });
    }
  });
};

// this function finds all the patients starting with the input
// it will then return the data back in JSON format
var getPatientKeys = function (req, res) {
  // get the field and the search data from the body
  var search = req.body.search;
  var field = req.body.field;
  //console.log('get patient: ' + search + 'by: ' + field);
  // pass the fields in the getPatientKeys function in patientsDB
  patientsDB.getPatientKeys(search, field, function(data, err){
    if(err){
      alert("Error from getPatientKeys, patients DB, in routes.js -> getPatientKeys")
    }
    else if(data){
      res.send({
        message: '',
        patient: data
      });
    }
    else {
      alert("No data or error in routes.js -> getPatientKeys")
    }
  });
}

// display the weight page
var getWeightPage = function (req, res) {
  res.render('weight.ejs');
};

var getAllWeights = function (req, res) {
  var id = req.body.id;
  weightDB.getAllWeights(id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log("data1: " + data);
      res.send({ data: data });
    }
  });
};
var submitNewWeight = function (req, res) {
  var id = req.body.id;
  // check to see if there is already data in the table
  weightDB.getAllWeights(id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      // if there is no data in the table yet
      if (data.length == 0) {
        // we create a new entry here
        weightDB.putNewWeightHistory(req.body.id, req.body.weight, req.body.date, function (data, err) {
          if (err) {
            console.log(err);
          } else {
            res.send({ data: data });
          }
        });
      }
      // if there is already data in the table so we need to update it
      else {
        // this function takes in existing data and updates it
        weightDB.putWeightEntry(req.body.id, req.body.weight, req.body.date, function (data, err) {
          if (err) {
            console.log("error")
          }
          else if (data) {
            res.send({
              data: data
            });
          }
        });
      }
    }
  });
};

var submitNewTest = function (req, res) {
  console.log(req.body)
  var data = req.body
  res.send({ data: data })
}

//functions for allergy problems
var getAllAllergy = function (req, res) {
  console.log("getAllAllergy called in routes")
  var id = req.body.id;
  allergyDB.getAllAllergy(id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log("allergy routes data: " + data);
      res.send({ data: data });
    }
  });
};

var submitNewAllergy = function (req, res) {
  console.log("submitNewAllergy called in routes")
  var id = req.body.id;
  // check to see if there is already data in the table
  allergyDB.getAllAllergy(id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      // if there is no data in the table yet
      if (data.length == 0) {
        // we create a new entry here
        allergyDB.putNewAllergy(req.body.id, req.body.allergen,
          req.body.allergySymptoms, req.body.allergySeverity, req.body.allergyDateOnset,
          req.body.allergyNotes, function (data, err) {
            if (err) {
              console.log(err);
            } else {
              res.send({ data: data });
            }
          });
      }
      // if there is already data in the table so we need to update it
      else {
        // this function takes in existing data and updates it
        allergyDB.putAllergyEntry(req.body.id, req.body.allergen,
          req.body.allergySymptoms, req.body.allergySeverity, req.body.allergyDateOnset,
          req.body.allergyNotes, function (data, err) {
            if (err) {
              console.log("error")
            }
            else if (data) {
              res.send({
                data: data
              });
            }
          });
      }
    }
  });
};

var editAllergy = function (req, res) {
  console.log("editAllergy called in routes")
  // this function takes in existing data and updates it
  allergyDB.editAllergy(req.body.id, req.body.allergen,
    req.body.allergySymptoms, req.body.allergySeverity, req.body.allergyDateOnset,
    req.body.allergyNotes, req.body.preEditData, function (data, err) {
      if (err) {
        console.log("error")
      }
      else if (data) {
        res.send({
          data: data
        });
      }
    });
};


var deleteAllergy = function (req, res) {
  console.log("deleteAllergy called in routes")
  allergyDB.deleteAllergy(req.body.id, req.body.preEditData, function (data, err) {
    if (err) {
      console.log("error")
    }
    else if (data) {
      res.send({
        data: data
      });
    }
  });
};


// this method handles the get_main request from app.js and reroutes it to the getMain function above
var routes = {
  get_any_patient_page: getAnyPatientPage,
  get_main: getMain,
  get_form: getForm,
  get_wcc_form: getWccForm,
  get_weight_page: getWeightPage,
  get_patient_page: getPatient,
  get_pharmacy_page: getPharmacy,
  get_dispensary: getDispensary,
  submit_patient: submitPatient,
  get_patient_keys: getPatientKeys,
  get_patient_search: getSearchPatients,
  get_all_weights: getAllWeights,
  submit_weight: submitNewWeight,
  submit_test: submitNewTest,
  get_all_allergy: getAllAllergy,
  submit_allergy: submitNewAllergy,
  delete_allergy: deleteAllergy,
  edit_allergy: editAllergy,
  get_signup: getSignup,
  get_user: getUser,
  logout: logout,
  check_login: checkLogin,
  create_account: createAccount
};

module.exports = routes;
