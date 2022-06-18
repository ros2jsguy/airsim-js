
/* eslint-disable no-console */

import { AirSimClient, LogSeverity } from 'airsim';
import { Vehicle } from 'vehicle';

async function main() {
  const airsim = new AirSimClient(Vehicle);
  
  console.log('Connecting');
  const result = await airsim.connect();
  console.log('connected: ', result);

  await airsim.printLogMessage('msg1', 'X', LogSeverity.DEBUG);
  await airsim.printLogMessage('msg2', 'Y', LogSeverity.INFO);
  await airsim.printLogMessage('msg3', 'Z', LogSeverity.WARN);
  await airsim.printLogMessage('msg4', 'Z1', LogSeverity.ERROR);

  airsim.close();
}

main();
