
/* eslint-disable no-console */

// Requires Blocks w/ Car1 setting

import { AirSimClient } from '../src/airsim';
import { Car } from '../src/car';
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

  const pose3 = await vehicle.getPose();
  
  const car = new Car('Car2');
  // create relative offset
  pose3.position.x += 20;
  pose3.position.y += 20;
  const result = await airsim.addVehicle(car, pose3);
  console.log('new vehicle created: ', result);
  
  airsim.close();
}

main();
