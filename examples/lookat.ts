/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */

import { Vector3 } from 'threejs-math';
import { AirSim } from '../src/airsim';
import { delay } from '../src/utils';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const ballPose = await airsim.getObjectPose('OrangeBall');
  console.log('orange ball pose: ', ballPose);

  const vehicles = await airsim.getVehicles();
  if (vehicles.length === 0) {
    console.error('Unable to locate vehicle.');
    await airsim.close();
    return;
  }

  const target = ballPose.position;

  const vehicle = vehicles[0];
  console.log('Vehicle: ', vehicle);

  let cameraName = 'back_center';
  let cameraInfo = await vehicle.getCameraInfo(cameraName);
  console.log('camera: ', cameraInfo);

  for (let i=0; i < 1000; i++) {
    const cameraPose = await vehicle.cameraLookAt(cameraName, target);

    const vehiclePose = await vehicle.getPose();
    const vehicleVec = (new Vector3(1,0,0)).applyQuaternion(vehiclePose.orientation);
    let arrowEndPt = vehicleVec.clone().setLength(1).add(vehiclePose.position);
    await airsim.plotArrows(
      [vehiclePose.position], 
      [arrowEndPt],
      'red',
      1,
      3
    );

    const cameraVec = vehicleVec.applyQuaternion(cameraPose.orientation);
    arrowEndPt = cameraVec.setLength(1).add(vehiclePose.position);
    await airsim.plotArrows(
      [vehiclePose.position],
      [arrowEndPt],
      'green',
      2,
      3
    );

    await delay(500);
  }

  console.log('done');
  airsim.close();
}

main();
