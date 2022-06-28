
/* eslint-disable no-console */


import { AirSim } from '../src/airsim';
import { Vehicle } from '../src/vehicle';


async function main() {

  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicles = await airsim.getVehicles();
  console.log('Vehicles: ', vehicles);

  const vehicle = vehicles[0];
  await vehicle.enableApiControl();

  const pose = await vehicle.getPose();
  console.log('vehicle pose: ', pose);

  await airsim.plotStrings(
    ['hello'],
    [pose.position],
    5,
    [1,0,0,1],
    5
  );
  
  await vehicle.disableApiControl();

  airsim.close();
}

main();
