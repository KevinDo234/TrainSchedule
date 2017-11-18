var config = {
	apiKey: "AIzaSyAopZfst-EKZaeEpVa-7RHCQyAxdnej5RQ",
	authDomain: "donut-firebase.firebaseapp.com",
	databaseURL: "https://donut-firebase.firebaseio.com",
	projectId: "donut-firebase",
	storageBucket: "donut-firebase.appspot.com",
	messagingSenderId: "280213799261"
};
firebase.initializeApp(config);

var database = firebase.database();

var trainNumber;
var trainLine;
var trainDestination;
var trainDeparture;
var nextTrain;
var minutesAway;
var trainFrequency;
var trainTiming;
var trainPlatform;
var currentTime = moment();
console.log('CURRENT TIME: ' + moment(currentTime).format('hh:mm:ss A'));

var model = {

	pushNewTrain: () => {


		database.ref().push({

			trainDeparture: trainDeparture,
		    trainDestination: trainDestination,
		    trainFrequency: trainFrequency,
		    trainLine: trainLine,
		    trainNumber: trainNumber,
		    trainPlatform: trainPlatform,
		    dateAdded: firebase.database.ServerValue.TIMESTAMP

		});

		model.pullChildFromDatabase();

	},

	pullChildFromDatabase: () => {

		var filter = database.ref().orderByChild("dateAdded").limitToLast(1)

		filter.once("child_added", function(childSnapshot) {

			trainNumber = childSnapshot.val().trainNumber
			trainLine = childSnapshot.val().trainLine
			trainDestination = childSnapshot.val().trainDestination
			trainDeparture = childSnapshot.val().trainDeparture
			trainFrequency = childSnapshot.val().trainFrequency
			trainPlatform = childSnapshot.val().trainPlatform


			view.updateTrainScheduleTable();
		});

	},

	initialDatabasePull: () => {

		database.ref().on("value", function(snapshot) {
				var trains = snapshot.val();

			
				$('#train-schedule-body').empty();

				for (var index in trains){
					trainNumber = trains[index].trainNumber
					trainLine = trains[index].trainLine
					trainDestination = trains[index].trainDestination
					trainDeparture = trains[index].trainDeparture
					trainFrequency = trains[index].trainFrequency
					trainPlatform = trains[index].trainPlatform

					controller.nextArrival();
					controller.minutesAway();
					view.updateTrainScheduleTable();
				};

		}, function(errorObject) {
      		console.log("Errors handled: " + errorObject.code);

		});
	}

}
$(document).ready(function(){

	controller.captureFormFields();
	model.initialDatabasePull();
	setInterval(function() {model.initialDatabasePull()}, 60000);
	view.updateCurrentTime();
	setInterval(function() {view.updateCurrentTime()}, 1000);

});

var view = {

	
	updateTrainScheduleTable: () => {

		controller.convertFrequency();

		$('#train-schedule-body').append(
			'<tr>'+
				'<th scope="row">' + trainNumber + '</th>' +
				'<td>' + trainLine + '</td>' +
				'<td>' + trainDestination + '</td>' +
				'<td>' + nextTrain + '</td>' +
				'<td>' + minutesAway + '</td>' +
				'<td>' + trainFrequency + '</td>' +
				'<td>' + trainPlatform + '</td>' +
			'</tr>'
			);
	},
	updateCurrentTime: () => {
		$('.currentTime').text(moment().format('h:mm:ss A'))
	}
};
let controller = {

 	captureFormFields: () => {
 		$('body').on("click", ".button-add", () => {
   		event.preventDefault();

 			trainNumber = $('#train-number').val().trim();
 			trainLine = $('#train-line').val().trim();
 			trainDestination = $('#train-destination').val().trim();
 			trainDeparture = $('#train-departure').val().trim();
 			trainFrequency = $('#train-frequency').val().trim();
 			trainPlatform = $('#train-platform').val().trim();

 			controller.nextArrival();
 			controller.minutesAway();

 			$('.form-control').val("");

 			model.pushNewTrain();

 		});
 	},


 	nextArrival: () => {
	    var trainDepartureCoverted = moment(trainDeparture, "hh:mm").subtract(1, 'years');
	    var currentTime = moment();
	    var diffTime = moment().diff(moment(trainDepartureCoverted), "minutes");
	    var timeRemainder = diffTime % trainFrequency;
	    var timeInMinutesTillTrain = trainFrequency - timeRemainder;
	    nextTrain = moment().add(timeInMinutesTillTrain, 'minutes');
	    nextTrain = moment(nextTrain).format('h:mm A');
	},

	minutesAway: () => {
	    var trainDepartureCoverted = moment(trainDeparture, "hh:mm").subtract(1, 'years');
	    var currentTime = moment();
	    var diffTime = moment().diff(moment(trainDepartureCoverted), "minutes");
	    var timeRemainder = diffTime % trainFrequency;
	    minutesAway = trainFrequency - timeRemainder;
	    minutesAway = moment().startOf('day').add(minutesAway, 'minutes').format('HH:mm');
	    return moment(minutesAway).format('HH:mm');
	},
	convertFrequency: () => {
		trainFrequency = moment().startOf('day').add(trainFrequency, 'minutes').format('HH:mm');
	}

 };