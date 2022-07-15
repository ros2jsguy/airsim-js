/* eslint-disable no-plusplus */
/* eslint-disable no-console */
import { AirSim } from '../src/airsim';
import { ImageType } from '../src/image';
import { Vehicle } from '../src/vehicle';

// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
const fps = require('fps');

async function main() {
  const airsim = new AirSim(Vehicle, undefined, '10.249.1.223');
  
  console.log('Connecting');
  const result = await airsim.connect();
  console.log('connected: ', result);

  const MAX_IMG_CNT = 10000;
  const ticker = fps();
  ticker.on('data', (framerate: number) => console.log('fps', framerate));
  for (let i = 0; i < MAX_IMG_CNT; i++) {
    // eslint-disable-next-line no-await-in-loop
    await airsim.getImage('front_center', ImageType.Scene);
    ticker.tick();
  }
  
  await airsim.reset();
  console.log('Closing client connection.');
  airsim.close();
}

main();
