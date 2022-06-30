/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */

// import { Vector3 } from '@ros2jsguy/three-math-ts';
import { AirSim } from '../../src/airsim';
// import { delay } from '../../src/utils';
import { Vehicle } from '../../src/vehicle';



async function main() {
  const airsim = new AirSim(Vehicle);
  
  console.log('Connecting');
  const result = await airsim.connect();
  console.log('connected: ', result);

  // tbd

  airsim.close();
}

main();
