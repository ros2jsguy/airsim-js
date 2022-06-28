
/* eslint-disable no-console */

import { AirSim } from '../src/airsim';
import { Multirotor } from '../src/multirotor';

async function main() {

  const airsim = new AirSim(Multirotor);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const drones = await airsim.getVehicles();
  if (drones.length === 0) {
    console.error('Unable to locate a drone.');
    await airsim.close();
    return;
  }

  const drone = drones[0];
  await drone.enableApiControl();

  console.log('takeoff');
  let result = await drone.takeoff(5);
  console.log('takeoff result ', result);

  const pose = await drone.getPose();
  console.log('pose: ', pose.position);
  
  console.log('land');
  result = await drone.land(30);
  console.log('land result: ', result);

  await drone.disableApiControl();
  airsim.close();
}

main();
