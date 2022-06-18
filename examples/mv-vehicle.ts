
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

  console.log('Vehicle: ', vehicle);

  await vehicle.enableApiControl();

  const pose = await vehicle.getPose();
  console.log('vehcicle pose', pose);

  // create relative offset
  pose.position.x += 1;
  pose.position.y += 2;
  pose.position.z -= 3;
  pose.orientation.z += 0.1;
  await vehicle.setPose(pose, true);
  
  await vehicle.disableApiControl();
  airsim.close();
}

main();
