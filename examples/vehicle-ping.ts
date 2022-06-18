/* eslint-disable no-console */

import { AirSimClient } from '../src/airsim';
import { Vehicle } from '../src/vehicle';



async function main() {
  const airsim = new AirSimClient(Vehicle);
  
  console.log('Connecting');
  let result = await airsim.connect();
  console.log('connected: ', result);

  console.log('Calling ping');
  result = await airsim.ping();
  console.log(`result: ${result}`);

  await airsim.confirmConnection();

  console.log('Closing client connection.');
  airsim.close();

  console.log('Has session: ', airsim.hasSession());
}

main();
