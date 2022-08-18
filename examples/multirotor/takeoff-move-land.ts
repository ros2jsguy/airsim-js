/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */

import { Vector3 } from 'threejs-math';
import { AirSim } from '../../src/airsim';
import { Multirotor } from '../../src/multirotor';
import { waitKey } from '../../src/utils';

async function main() {
  const airsim = new AirSim(Multirotor);
  
  console.log('Connecting');
  const result = await airsim.connect();
  console.log('connected: ', result);

  // await airsim.reset();

  const drones = await airsim.getVehicles();
  if (drones.length < 1) {
    console.log('No drones found in sim');
    return;
  }

  const drone = drones[0];
  console.log('drone info: ', drone);

  await drone.enableApiControl();
  await drone.arm();

  await waitKey('Press any key to takeoff');
  console.log('Takingoff');
  await drone.takeoff();
  await drone.moveToZ(-50, 5);

  console.log('rotate: ', await drone.rotateToYaw(90.0));
  await waitKey('Hovering! Press any key to rotate');
  console.log('rotate: ', await drone.rotateToYaw(0.0));

  await waitKey('Hovering! Press any key to move');
  console.log('Moving');
  await drone.moveToPosition(new Vector3(20, 100, -50), 5);
  await drone.hover();

  // TOOOOO slow
  // await waitKey('Hovering! Press any key to go home');
  // console.log('Going Home');
  // await drone.goHome();

  await waitKey('Hovering! Press any key to land');
  console.log('Landing');
  await drone.moveToZ(-2, 5);
  await drone.moveToZ(0.01, 0.5);
  console.log('landing: ', await drone.land());

  await waitKey('Landed! Press any key to quit');
  console.log('drone state: ', await drone.getState());
  airsim.close();
  process.exit(0);
}

main();
