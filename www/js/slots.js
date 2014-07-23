var tweenObject;
var stopTweenObject;
var tweenObjectListener;
var stopTweenObjectListener;

var slotsRolling = false;

var prize = 0;
var rollCounter = 0;
var slotsCurrentlyRolling = 3;

var NUMBER_OF_SLOTS = 3;
var NUMBER_OF_ROLLS = 6;
var SLOT_POSITION_1 = -159;
var SLOT_POSITION_2 = -319;
var SLOT_POSITION_3 = -480;
var SLOT_SPEED = .25;
var COUNTER_STOP_OFFSET = 2;
var SOUND_STOP_OFFSET = 5;
var ANIMATION_DELAY = 200;

var landedPositionArray = new Array();
var landingPossibilitesArray = new Array (SLOT_POSITION_1, SLOT_POSITION_2, SLOT_POSITION_3);
var blueWinArray = new Array (SLOT_POSITION_3, SLOT_POSITION_2, SLOT_POSITION_1);
var blackWinArray = new Array (SLOT_POSITION_1, SLOT_POSITION_3, SLOT_POSITION_2);
var orangeWinArray = new Array (SLOT_POSITION_2, SLOT_POSITION_1, SLOT_POSITION_3);
var winArray = new Array (blueWinArray, blackWinArray, orangeWinArray);
var prizeArray = new Array ('blue', 'black', 'orange');
var backgrounColorArray = new Array ('rgba(22,91,152,.5)', 'rgba(0,0,0,.5)', 'rgba(255,153,0,.5)');

$(document).ready(function() {
	$('.modal').click(function() {
		hideModal();
	});
	$('.button').click(function() {
		if(!slotsRolling) {
			slotsRolling = true;
			// SET DELAY TO SYNCH TO END OF START SOUND
			document.getElementById('startSound').play();
			setTimeout('rollSlots()', ANIMATION_DELAY);
		}
	});
});

function rollSlots() {
	document.getElementById('rollSound').play();
	for(var i=1; i<=slotsCurrentlyRolling; i++) {
		var iconSet = 'icons'+i;
		// ONLY FIRST TWEEN OBJECT GETS LISTENER FOR EFFICIENCY
		// SINCE THEY SHARE THE SAME ANIMATION TIMES
		if(i==1) {
			tweenObject = new Tween(document.getElementById(iconSet).style, 'top', null, 0, SLOT_POSITION_3, SLOT_SPEED, 'px');
			tweenObjectListener = new Object();
			tweenObjectListener.onMotionFinished = function(){
			   onLoopTweenComplete();
			};
			tweenObject.addListener(tweenObjectListener);
			tweenObject.start();
		} else {
			var newTween = new Tween(document.getElementById(iconSet).style, 'top', null, 0, SLOT_POSITION_3, SLOT_SPEED, 'px');
			newTween.start();
		}
	}
}

function onLoopTweenComplete() {
	tweenObject.removeListener(tweenObjectListener);
	// IF ROLL COUNTER IS MET, STOP SLOTS ONE BY ONE
	if(rollCounter >= NUMBER_OF_ROLLS){
		var stoppedSlot = 'icons'+slotsCurrentlyRolling;
		stopSlot(stoppedSlot);
		slotsCurrentlyRolling--;
		// THIS SETS THE ROLL COUNT BACK TO STAGGER STOPPING THE SLOTS ONE BY ONE.
		rollCounter = COUNTER_STOP_OFFSET;
	}
	// THIS IS A HACK TO SYNCH THE 'STOP' SOUND OF THE SLOT
	if(rollCounter == SOUND_STOP_OFFSET){
		document.getElementById('stopSound').play();
	}
	rollCounter++;
	if(slotsRolling){
		rollSlots();
	}
}

function stopSlot(stoppedSlot) {
	// CHOOSE RANDOM STOP POSITION FOR THE SLOT
	var randomPosition = Math.floor(Math.random()*landingPossibilitesArray.length);
	var stopPosition = landingPossibilitesArray[randomPosition];
	landedPositionArray.push(stopPosition);
	// BOUNCE SLOT TO STOP POSITION
	stopTweenObject = new Tween(document.getElementById(stoppedSlot).style, 'top', Tween.elasticEaseOut, 0, stopPosition, SLOT_SPEED, 'px');
	stopTweenObjectListener = new Object();
	stopTweenObjectListener.onMotionFinished = function(){
		onStopTweenComplete();
	};
	stopTweenObject.addListener(stopTweenObjectListener);
	stopTweenObject.start();
}

function onStopTweenComplete() {
	stopTweenObject.removeListener(stopTweenObjectListener);
	// AFTER LAST SLOT BOUNCE IS STOPPED, CHECK FOR WIN
	if(slotsCurrentlyRolling == 0) {
		document.getElementById('rollSound').pause();
		if(checkForWin()) {
			// HACK TO FIX FIREFOX AUDIO LOOP BUG
			// SENDING THE AUDIO TO 200MS IN INSTEAD OF BEGINNING
			document.getElementById('winSound').addEventListener('ended', function(){
			this.currentTime = .2;
			}, false);
			document.getElementById('winSound').play();
			showModal();
		}
		resetSlots();
	}
}

function checkForWin() {
	var win = true;
	for (var i=0; i<winArray.length; i++) {
		// IF FIRST VALUES MATCH, PRIZE IS DETERMINED.
		if (winArray[i][0] == landedPositionArray[0]) {
			prize = i;
	    	for(var j=0; j<NUMBER_OF_SLOTS; j++) {
				if(winArray[i][j] != landedPositionArray[j]){
					win = false;
					break;
				}
			}
	    }
	}
	return win;	
}

function resetSlots() {
	rollCounter = 0;
	slotsCurrentlyRolling = NUMBER_OF_SLOTS;
	landedPositionArray = new Array();
	slotsRolling = false;
}

function showModal() {
	$('.modalMessage').text('Congratulations, you won the '+ prizeArray[prize] + ' prize!');
	$('.modalBg').css("background",backgrounColorArray[prize]);
	$('.modal').css("visibility","visible");
}

function hideModal() {
	document.getElementById('winSound').currentTime = 0;
	document.getElementById('winSound').pause();
	$('.modal').css("visibility","hidden");
}