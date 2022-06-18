
/* eslint-disable no-console */

import { AirSimClient } from 'airsim';

async function main() {
  const client = new AirSimClient<Vehicle>();
  const connectResult = await client.connect();
  console.log(`Connecting: ${connectResult}`);

  const extent = await client.simGetWorldExtents();
  console.log('World Extend');
  console.log('min: ', extent[0]);
  console.log('max: ', extent[1]);
  
  client.close();
}

main();
