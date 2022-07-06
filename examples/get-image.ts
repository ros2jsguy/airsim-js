/* eslint-disable no-console */
import { AirSim } from '../src/airsim';
import { ImageType } from '../src/image';
import * as Utils from '../src/utils';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle, undefined, '10.249.1.223');
  
  console.log('Connecting');
  const result = await airsim.connect();
  console.log('connected: ', result);

  const img = await airsim.getImage('front_center', ImageType.Scene);
  console.log('image: ', img);

  await Utils.delay(1000);
  
  console.log('Closing client connection.');
  airsim.close();

  console.log('Has session: ', airsim.hasSession());
}

main();
