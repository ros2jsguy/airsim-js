
// detect OrangeBall
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

import { AirSim } from '../src/airsim';
// import { ImageType } from '../src/image';
// import { DetectionSearch } from '../src/internal-types';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicles = await airsim.getVehicles();
  if (vehicles.length === 0) {
    console.error('Unable to locate vehicle.');
    await airsim.close();
    return;
  }

  const vehicle = vehicles[0];
  console.log('vehicle: ', vehicle);

  // await vehicle.enableApiControl();
  // console.log('API enabled');

  await airsim.session.simSetDetectionFilterRadius('0', 0, 200*100);
  await airsim.session.simAddDetectionFilterMeshName('0', 0, 'Cylinder*');
  const detections = await airsim.session.simGetDetections('0', 0);

  // const search: DetectionSearch =  {
  //   cameraName: 'front_center',
  //   imageType: ImageType.Scene,
  //   meshName: 'Orange*',
  //   radius: 10000
  // };

  // await vehicle.startDetectionSearch(search);

  // const detections = await vehicle.findDetections(search);
  console.log('Detections: ', detections);

  // vehicle.disableApiControl();

  console.log('Closing client connection.');
  airsim.close();
}

main();