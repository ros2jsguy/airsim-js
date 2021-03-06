
/* eslint-disable no-console */
// Requires Blocks w/ Car1 settings

import { AirSim } from '../src/airsim';
import * as Utils from '../src/utils';
import { Vehicle } from '../src/vehicle';

async function main() {

  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicle = await airsim.getVehicles()[0];
  if (!vehicle) {
    console.error('Unable to locate car.');
    await airsim.close();
    return;
  }
  
  await vehicle.enableApiControl();

  const dist = await vehicle.getDistanceSensorData('Distance');
  console.log('dist: ', dist);
  
  await vehicle.disableApiControl();
  
  await Utils.delay(1000);
  airsim.close();
}

main();
