
/* eslint-disable no-console */

import { AirSimClient } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSimClient(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicles = await airsim.getVehicles();
  console.log('Vehicles: ', vehicles);

  const vehicle = await airsim.getVehicle(vehicles[0].name);
  if (!vehicle) {
    console.log('Unable to detect vehicle');
    airsim.close();
    return;
  }

  await vehicle.enableApiControl();
  const pose3 = await vehicle.getPose();

  await airsim.plotPoints([pose3.position], [0,1,0,1], 10);
  // const LEN = 1;
  // await client.simPlotLineStrip(
  //   [
  //     carPose.position, 
  //     {x_val: carPose.position.x_val+1000, y_val:carPose.position.y_val, z_val: carPose.position.z_val},
  //     {x_val: carPose.position.x_val+1000, y_val:carPose.position.y_val+1000, z_val: carPose.position.z_val}
  //   ],
  //   [0,1,1,1],
  //   10,
  //   10);

    // await client.simPlotArrows(
    //   [carPosition, carPosition, carPosition],
    //   [{x_val: carPosition.x_val+LEN, y_val: carPosition.y_val, z_val: carPosition.z_val},
    //    {x_val: carPosition.x_val, y_val: carPosition.y_val+LEN, z_val: carPosition.z_val},
    //    {x_val: carPosition.x_val, y_val: carPosition.y_val, z_val: carPosition.z_val-LEN}],
    //   [1,0,1,1],
    //   2,
    //   20,
    //   5,
    //   true);

  await airsim.plotTransforms([pose3], 100, 5, 0, true);

  await airsim.plotStrings(
    ['X'],
    [pose3.position],
    
  );

  vehicle.disableApiControl();
  airsim.close();
}

main();
