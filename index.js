/**
* Hotwheels speed trap. The setup consists of a Raspberry Pi and two infrared gates. As the 
* car passes the first gate the timer is started. Upon passing through the second gate the 
* elapsed run time is calculated and reported. 
* 
* Note: You can activate the averages mode by setting NUM_TRIAL_RUNS greater than one. In 
* this mode, the average speed will also be reported on the final trial run.
*
* @version 2.0.0
*
* @author Braden Bush
* @author Dan Bush
*/

const Gpio = require('onoff').Gpio

const NUM_TRIAL_RUNS = 3 		// if > 1 will average runs
const GATE_DISTANCE_IN_INCHES = 50	// distance between the gates in inches
                                        
const GATE_DISTANCE_IN_MILES = GATE_DISTANCE_IN_INCHES/63360                                                                                                       
const DEBOUNCE_TIMEOUT = 500

// Configure the start gate to GPIO 23 and the end gate to GPIO 24.
//
// IR sensors are configured by dialing the onboard potentiometer by starting with the 
// signal LOW and then dialing until the SIGNAL goes HIGH. Orignally we configured the 
// reverse but, ultimatly we got better results with the various cars this way.

const GATE_START = new Gpio(23, 'in', 'both', {debounceTimeout: DEBOUNCE_TIMEOUT})
const GATE_FINISH = new Gpio(24, 'in', 'both', {debounceTimeout: DEBOUNCE_TIMEOUT})

// Setup global timing flags and variables.
let timing = false
let numRuns = 0
let startTime
let ACCUMULATIVE_RUN_TIME = 0

// Calculates speed in miles per hour given the elapsed time and the known distance between
// the gates.
function calculateSpeedInMPH(elapsedTime) {
  const AVERAGE_TIME_IN_HOURS = elapsedTime/1000/60/60
  const SPEED_IN_MPH = +(Math.round(GATE_DISTANCE_IN_MILES/AVERAGE_TIME_IN_HOURS +'e+3') + 'e-3')
  return SPEED_IN_MPH
}

// Resets the associated timing flags and global variables.
function reset() {
  timing = false
  numRuns = 0
  startTime = 0
  ACCUMULATIVE_RUN_TIME = 0
}

// Start gate handeling.
GATE_START.watch((err, value) => {
  timing = true
  startTime = new Date()
});

// Finish gate handeling.
GATE_FINISH.watch((err, value) => {
  if (!timing) {
    console.warn('Finish gate tripped before the start gate!')
  }
  else {
    numRuns++
    const ELAPSED_RUN_TIME = new Date()-startTime
    if (NUM_TRIAL_RUNS > 1) {
      ACCUMULATIVE_RUN_TIME += ELAPSED_RUN_TIME
      console.log(calculateSpeedInMPH(ELAPSED_RUN_TIME) + ' mph (' +numRuns+' of '+NUM_TRIAL_RUNS+')')
      if (numRuns === NUM_TRIAL_RUNS) {
        const AVERAGE_ELAPSED_TIME = ACCUMULATIVE_RUN_TIME/NUM_TRIAL_RUNS
        console.log('average mph: '+ calculateSpeedInMPH(AVERAGE_ELAPSED_TIME))
        reset()
      }
    }
    else {
      console.log(calculateSpeedInMPH(ELAPSED_RUN_TIME)+' mph')
      reset()
    }
  }
});

// Releases resources on exit.
process.on('SIGINT', () => {
  GATE_START.unexport()
  GATE_FINISH.unexport()
});

console.log('Start you engines!')
