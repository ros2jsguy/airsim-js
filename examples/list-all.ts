
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

  const assets = await airsim.getAssets();
  console.log('Assets: ', assets);


  const sceneObjs = await airsim.getSceneObjectNames();
  console.log('Scene objects: ');
  sceneObjs.forEach((obj) => console.log(obj));

  airsim.close();
}

main();
