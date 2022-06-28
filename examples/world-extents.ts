
/* eslint-disable no-console */

import { AirSim } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const extent = await airsim.getWorldExtents();
  console.log('World Extend');
  console.log('min: ', extent[0]);
  console.log('max: ', extent[1]);
  
  airsim.close();
}

main();
