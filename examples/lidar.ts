
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
// Requires Blocks w/ Car1 settings

import { AirSim } from '../src/airsim';
import * as Utils from '../src/utils';
import { Vehicle } from '../src/vehicle';

async function main() {

  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicle = (await airsim.getVehicles())[0];
  if (!vehicle) {
    console.error('Unable to locate car.');
    await airsim.close();
    return;
  }
  
  await vehicle.enableApiControl();

  const lidar = await vehicle.getLidarData('Lidar');
  console.log('lidar: ', lidar.point_cloud.length);
  for (let i=0; i < lidar.point_cloud.length / 3; i++) {
    console.log( lidar.point_cloud[i * 3],  lidar.point_cloud[i * 3 + 1],  lidar.point_cloud[i * 3 + 2]);
  }
  // console.log('point_cloud size: ', lidar.point_cloud.length);
  // lidar.point_cloud.forEach(element => console.log(element));
    
  await vehicle.disableApiControl();

  await Utils.delay(1000);
  airsim.close();
}

main();
