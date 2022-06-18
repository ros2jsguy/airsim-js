/* eslint-disable no-console */
// Requires Blocks w/ Car1 setting

import { AirSimClient } from '../src/airsim';
import { CAR } from '../src/constants';
import { Vehicle } from '../src/vehicle';

async function main() {

  const airsim = new AirSimClient(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicle = await airsim.getVehicle(CAR);
  if (!vehicle) {
    console.error('Unable to locate car.');
    await airsim.close();
    return;
  }
  
  await vehicle.enableApiControl();

  console.log('home: ', await vehicle.getHome());
  console.log('pose: ', await vehicle.getPose());

  await vehicle.disableApiControl();
  airsim.close();
}

main();