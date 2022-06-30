/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */

import { Vector3 } from '@ros2jsguy/three-math-ts';
import { AirSim } from '../../src/airsim';
import { delay } from '../../src/utils';
import { Vehicle } from '../../src/vehicle';



async function main() {
  const airsim = new AirSim(Vehicle);
  
  console.log('Connecting');
  const result = await airsim.connect();
  console.log('connected: ', result);

  const lights = await airsim.getSceneObjectNames('PointLight.*');
  console.log('lights: ', lights);
  const light = lights[0];
  const pose = await airsim.getObjectPose(light);
  const scale = new Vector3(1,1,1);

  await airsim.destroyObject(light);
  await delay(1000);

  const newLight = await airsim.spawnObject('PointLight', 'PointLightBP', pose, scale, false, true);
  await delay(1000);

  for (let i=0; i < 20; i++) {
    await airsim.setLightIntensity(newLight, i * 100);
    await delay(500);
  }

  airsim.close();
}

main();
