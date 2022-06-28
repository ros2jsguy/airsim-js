
/* eslint-disable no-console */

import { AirSim } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

// '10.249.1.223'

async function main() {
  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicles = await airsim.getVehicles();
  console.log('Vechicles: ', vehicles);

  airsim.close();
}

main();
