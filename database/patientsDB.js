var mongoose = require('mongoose');
var patients = mongoose.createConnection('mongodb://localhost/patients');

patients.on('error', console.error.bind(console, 'connection error:'));
patients.once('open', function() {
  // we're connected!
});


var generalPatient = mongoose.Schema({
    //Patient data
    id: {
        type: Number,
        required: true,
        unique: true
    },
    givenName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    sex: {
        type: String,
        required: true,
    },
    birthdate: {
        type: Date,
        required: true,
    },
    height: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    father: {
        type: String,
        required: false
    },
    mother: {
        type: String,
        required: false
    }
  });
var Patient = patients.model('Patient', generalPatient);

var getPatient = function(patient_name, route_callbck){
    Patient.find({name: patient_name}, function(err, res){
        if(err){
            route_callback(null, "error" + err);
        }
        else {
            route_callbck(res, null);
        }
    });
  };

var getPatientById = function(id, route_callbck){
    Patient.find({id: id}, function(err, res){
        if(err){
            route_callbck(null, "error" + err);
        }
        else {
            route_callbck(res, null);
        }
    });
};

var putPatient= function(patientJSON, route_callbck){
    var dateNow = Date.now();
    var dob = new Date(patientJSON.birthdateYear, patientJSON.birthdateMonth,patientJSON.birthdateDay);
    var newPatient = new Patient({
        id: dateNow,
        givenName: patientJSON.givenName,
        firstName: patientJSON.firstName,
        lastName: patientJSON.lastName,
        sex: patientJSON.sex,
        birthdate: dob,
        height: patientJSON.height,
        weight: patientJSON.weight,
        father: patientJSON.father,
        mother: patientJSON.mother
    });
    // Here we save this line into the MongoDB Database
    newPatient.save(function (err, patient) {
        if (err) return console.error(err);
        console.log("success");
        route_callbck("success", null);
      });
};
var getPatientKeys = function(search, field, route_callbck){
    var key = new RegExp("^" + search);
    //console.log(key);
    Patient.find({[field]: key}, function(err, res){
        if(err){
            route_callback(null, "error" + err);
        }
        else {
            //console.log(res);
            route_callbck(res, null);
        }
    });
};
var patientsDB = {
    putPatient: putPatient,
    getPatient: getPatient,
    getPatientKeys: getPatientKeys,
    getPatientById: getPatientById
};

module.exports = patientsDB;

