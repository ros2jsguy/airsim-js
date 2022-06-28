/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */

/* eslint-disable no-console */

import { AirSim } from '../../src/airsim';
import { Car } from '../../src/car';
import { CarControls, DEFAULT_CAR_CONTROLS } from '../../src/internal-types';
import * as Utils from '../../src/utils';

async function main() {
  const airsim = new AirSim(Car);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  // await airsim.reset();

  const cars = await airsim.getVehicles();
  if (cars.length === 0) {
    console.error('Unable to locate car.');
    await airsim.close();
    return;
  }

  const car = cars[0];
  console.log('Car: ', car);

  await car.enableApiControl();
  console.log('API enabled');

  const control: CarControls = {
    ...DEFAULT_CAR_CONTROLS
  };

  for (let i = 0; i < 3; i++) {
    let state = await car.getState();
    console.log(`Speed: ${state.speed}, Gear: ${state.gear}`);

    // go forward
    control.throttle = 0.5;
    control.steering = 0;
    await car.setControls(control);
    console.log('Go Forward');
    await Utils.delay(3000);

    // go forward-right
    control.throttle = 0.5;
    control.steering = 1;
    await car.setControls(control);
    console.log('Go Forward steer Right');
    await Utils.delay(3000);

    // go reverse
    control.throttle = -0.5;
    control.is_manual_gear= true;
    control.manual_gear = -1;
    control.steering = 0;
    await car.setControls(control);
    console.log('Go Reverse');
    await Utils.delay(5000);
    control.is_manual_gear= false;
    control.manual_gear = 0;

    // apply brakes
    control.brake = 1;
    await car.setControls(control);
    console.log('Apply brakes');
    await Utils.delay(3000);
    control.brake = 0;
  }

  console.log('done');

  await car.disableApiControl();
  await airsim.reset();
  airsim.close();
}

main();
