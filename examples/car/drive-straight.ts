
/* eslint-disable no-console */

import { AirSim } from '../../src/airsim';
import { Car } from '../../src/car';
import { CarControls, DEFAULT_CAR_CONTROLS } from '../../src/internal-types';
import * as Utils from '../../src/utils';

async function main() {
  const airsim = new AirSim(Car);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  await airsim.reset();

  const cars = await airsim.getVehicles();
  if (cars.length === 0) {
    console.error('Unable to locate car.');
    await airsim.close();
    return;
  }

  const car = cars[0];
  console.log('Car: ', car);

  await car.enableApiControl();

  const state = await car.getState();
  console.log('state: ', state);

  const control: CarControls = {
    ...DEFAULT_CAR_CONTROLS,
    throttle: 1.0
  };

  await car.setControls(control);
  await Utils.delay(2000);

  console.log('done');

  await car.disableApiControl();
  airsim.close();
}

main();
