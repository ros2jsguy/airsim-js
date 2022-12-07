/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */

import { Vector3 } from 'threejs-math';
import { AirSim } from '../../src/airsim';
import { DrivetrainType, LandedState } from '../../src/internal-types';
import { Multirotor } from '../../src/multirotor';
import { waitKey } from '../../src/utils';

async function main() {
  const airsim = new AirSim(Multirotor);
  
  console.log('Connecting');
  const result = await airsim.connect();
  console.log('connected: ', result);

  await airsim.reset();

  const drones = await airsim.getVehicles();
  if (drones.length < 1) {
    console.log('No drones found in sim');
    return;
  }

  const drone = drones[0];
  console.log('drone info: ', drone);

  const ballPose = await airsim.getObjectPose('OrangeBall');
  console.log('orange ball pose: ', ballPose);

  await drone.enableApiControl();
  await drone.arm();

  const z = -50;

  await waitKey('Press any key to takeoff');
  console.log('Takingoff');
  await drone.takeoff();
  await drone.moveToZ(z, 5);

  await waitKey('Press any key to fly flight path');
  await drone.moveOnPath(
    [
      new Vector3(125, 0, z),
      new Vector3(125, 125, z),
      // new Vector3(0, 125, z),
      new Vector3(0, 0, z)
    ],
    12,
    120,
    DrivetrainType.ForwardOnly,
    { is_rate: false, yaw_or_rate: 0 },
    20,
    1
  );

  console.log('Moving to origin');
  await drone.moveToPosition(new Vector3(0, 0, z), 1);

  console.log('Landing');
  await drone.moveToPosition(new Vector3(0, 0, -5), 3);
  await drone.land();

  let droneState =  await drone.getState();
  if (droneState.landed_state === LandedState.Flying) {
    waitKey('Continuing landing task using kinematic info');
    console.log('drone state: ', droneState);
    await drone.moveToZ(
        Math.abs(droneState.kinematics_estimated.position.z + 0.1),
        1,
        15);
  }

  droneState =  await drone.getState();
  console.log('Final state: ', droneState);

  await drone.disarm();
  await drone.disableApiControl();
  airsim.close();
  process.exit(0);
}

main();
