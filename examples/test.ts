
/* eslint-disable no-console */

import { AirSim } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);


  const img = await airsim.session.simGetImage('0', 3);
  console.log(img);


  // const names = await airsim.getSceneObjectNames();
  // names.forEach(name => console.log(name));

  // console.log('foobar: ', await airsim.getSceneObjectNames('foobar'));
  // console.log('pose: ', await airsim.getObjectPose('PhysXCar_camera_driver'));

  // const info = await airsim.session.simGetCameraInfo('xxxxx1', 'Car1', false);
  // const info1 = await airsim.session.simGetCameraInfo('fixed1', '', true);
  // console.log('cameraInfo:', info1);

  // const info1 = await airsim.session.simGetCameraInfo('cam1', 'Car1', false);
  // console.log('cameraInfo:', info1);

  // const info2 = await airsim.session.simGetCameraInfo(0, 'Car2', false);
  // console.log('cameraInfo:', info2);

  // console.log( await airsim.getObjectPose('Car1_camera_driver'));

  console.log('done');

  airsim.close();
}

main();
