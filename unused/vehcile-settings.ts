
/* eslint-disable no-console */

import { AirSimClient } from 'airsim';
import { Vehicle } from 'vehicle';

async function main() {
  const airsim = new AirSimClient(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);
;

  console.log('Calling getSettingsString');
  const settings = await airsim.getSettingsString();
  console.log('settings: ', settings);

  console.log('client connection.');
  airsim.close();
}

main();
