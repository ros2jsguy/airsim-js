
/* eslint-disable no-console */

import { AirSimClient } from 'airsim';
import { Vehicle } from 'vehicle';


async function main() {
  const airsim = new AirSimClient(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  const vehicles = await airsim.getVehicles();
  console.log('Vechicles: ', vehicles);

  const assets = await airsim.getAssets();
  console.log('assets: ', assets);

  const sceneObjs = await airsim.getSceneObjects();
  console.log('scene objects: ');
  sceneObjs.forEach((obj) => console.log(obj));

  airsim.close();
}

main();
