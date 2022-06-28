/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */

/* eslint-disable no-console */


// Requires Blocks w/ Car1 setting

import { AirSim } from '../src/airsim';
import * as Utils from '../src/utils';
import { Vehicle } from '../src/vehicle';

async function main() {

  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  await airsim.reset();

  const vehicles = await airsim.getVehicles();
  if (vehicles.length === 0) {
    console.error('Unable to locate car.');
    await airsim.close();
    return;
  }

  const vehicle = vehicles[0];
  console.log('Vehicle: ', vehicle);

  await vehicle.enableApiControl();

  const pose = await vehicle.getPose();
  console.log('vehcicle pose', pose);

  for (let i = 0; i < 5; i++) {
    // create relative offset
    pose.position.x += 1;
    pose.position.z = -0.8;
    // pose.position.y += 1;
    // pose.orientation.z += 0.1;
    await vehicle.setPose(pose);
    await Utils.delay(1000);
  }
  
  await vehicle.disableApiControl();

  await Utils.delay(1000);
  airsim.close();
}

main();
