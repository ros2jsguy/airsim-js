
/* eslint-disable no-console */

import { AirSim } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle);
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

  await airsim.plotPoints([pose3.position], [0,0,0,1], 30);

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

  const vehiclePose = await vehicle.getPose();
  const vehiclePosition = vehiclePose.position;


  const endPt = vehiclePosition.clone();
  const LEN = 20;
  endPt.setX(endPt.x + LEN);
  await airsim.plotArrows([vehiclePosition],[endPt]);

  await airsim.plotTransforms([pose3], 100, 5, true);

  await airsim.plotStrings(['X'], [pose3.position]);

  vehicle.disableApiControl();
  airsim.close();
}

main();
