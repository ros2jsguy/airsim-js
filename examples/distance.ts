
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
  
  await vehicle.enableApiControl();
  const dist = await vehicle.getDistanceSensorData('Distance');
  console.log('dist: ', dist);

  // const lidar = await vehicle.getLidarData('Lidar');
  // console.log('lidar: ', lidar);
  // console.log('point_cloud size: ', lidar.point_cloud.length);
  // lidar.point_cloud.forEach(element => console.log(element));
    
  await vehicle.disableApiControl();
  await airsim.close();
}

main();
