/* eslint-disable no-console */
// Requires Blocks w/ Car1 setting

import { AirSim } from '../src/airsim';
import * as Utils from '../src/utils';
import { Vehicle } from '../src/vehicle';

async function main() {

  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicles = await airsim.getVehicles();
  if (vehicles.length === 0) {
    console.error('Unable to locate car.');
    await airsim.close();
    return;
  }
  
  const vehicle = vehicles[0];
  await vehicle.enableApiControl();

  console.log('home: ', await vehicle.getHome());
  console.log('pose: ', await vehicle.getPose());

  await vehicle.disableApiControl();

  await Utils.delay(1000);
  airsim.close();
}

main();