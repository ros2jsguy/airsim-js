
/* eslint-disable no-console */

import { AirSimClient } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSimClient(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const cameras = (await airsim.getSceneObjects()).filter((obj) => obj.toLowerCase().includes('camera'));
  console.log('Cameras: ');
  cameras.forEach((camera) => console.log(`  ${camera}`));

  airsim.close();
}

main();
