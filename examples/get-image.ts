import { AirSim } from '../src/airsim';
import * as Utils from '../src/utils';
import { Vehicle } from '../src/vehicle';
import { ImageType } from '../src/image';

async function main() {
  const airsim = new AirSim(Vehicle, undefined, '10.249.1.223');
  
  console.log('Connecting');
  let result = await airsim.connect();
  console.log('connected: ', result);

  const img = await airsim.getImage('0', ImageType.Scene);
  console.log('image: ', img);

  await Utils.delay(1000);
  
  console.log('Closing client connection.');
  airsim.close();

  console.log('Has session: ', airsim.hasSession());
}

main();
