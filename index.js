const Gpio = require('onoff').Gpio

const DEBOUNCE_TIMEOUT = 250
const GATE_DISTANCE_IN_INCHES = 5
const GATE_DISTANCE_IN_MILES = GATE_DISTANCE_IN_INCHES/63360  

//const gate1a = new Gpio(23, 'in', 'falling')
const gate1a = new Gpio(23, 'in', 'falling', {debounceTimeout: DEBOUNCE_TIMEOUT})
const gate1b = new Gpio(24, 'in', 'falling', {debounceTimeout: DEBOUNCE_TIMEOUT})

let start

gate1a.watch((err, value) => {
//  console.log(value, err)
  start = new Date()
//  console.log('timing...')
});

gate1b.watch((err, value) => {
  const ELAPSED_TIME_IN_HOURS = (new Date()-start)/1000/60/60
  const SPEED_IN_MPH = GATE_DISTANCE_IN_MILES/ELAPSED_TIME_IN_HOURS
  const SPEED_IN_MPH_ROUNDED = +(Math.round(SPEED_IN_MPH +'e+3') + 'e-3')
  console.log('mph: ', SPEED_IN_MPH_ROUNDED) 
});


console.log('started')

process.on('SIGINT', () => {
  gate1a.unexport()
  gate1b.unexport()
});

