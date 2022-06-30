/* eslint-disable no-console */

import { AirSim } from '../../src/airsim';
import { delay } from '../../src/utils';
import { Vehicle } from '../../src/vehicle';

async function runConsoleCmd(airsim: AirSim<Vehicle>, cmd: string) {
  await airsim.runConsoleCommand(cmd);
  console.log(`Running Unreal Console cmd ${cmd}  and sleeping for 1 second`);
  await delay(1000);
}

async function main() {
  const airsim = new AirSim(Vehicle);
  
  console.log('Connecting');
  await airsim.connect();
  console.log('connected');

  await runConsoleCmd(airsim, 'stat fps');
  await runConsoleCmd(airsim, 'stat unit');
  await runConsoleCmd(airsim, 'stat unitGraph');
  await runConsoleCmd(airsim, 'show COLLISION');
  await runConsoleCmd(airsim, 'show CollisionVisibility');
  await runConsoleCmd(airsim, 'stat game');
  await runConsoleCmd(airsim, 'show COLLISION');
  await runConsoleCmd(airsim, 'show CollisionVisibility');
  await runConsoleCmd(airsim, 'stat game');
  await runConsoleCmd(airsim, 'stat unitGraph');
  await runConsoleCmd(airsim, 'stat unit');
  await runConsoleCmd(airsim, 'stat fps');

  airsim.close();
  console.log('Completed');
}

main();
