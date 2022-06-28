
/* eslint-disable no-console */

import { AirSim } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);
;

  console.log('Calling getSettingsString');
  const settings = await airsim.getSettingsString();
  console.log('settings: ', settings);

  airsim.close();
}

main();
