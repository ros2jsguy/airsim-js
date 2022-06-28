
/* eslint-disable no-console */

// Requires Blocks w/ Car1 setting

import { AirSim } from '../src/airsim';
import { Car } from '../src/car';
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

  const pose3 = await vehicle.getPose();
  
  const car = new Car('Car2');
  // create relative offset
  pose3.position.x += 20;
  pose3.position.y += 20;
  const result = await airsim.addVehicle(car, pose3);
  console.log('new vehicle created: ', result);
  
  await vehicle.disableApiControl();

  airsim.close();
}

main();
