// ping.ts - Runs AirSim ping command
import { AirSim } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

async function main() {
  // create airsim client; assumes AirSim server is on localhost
  const airsim = new AirSim(Vehicle);
  
  let result = await airsim.connect();
  console.log('connected: ', result);

  console.log('Calling ping');
  result = await airsim.ping();
  console.log(`result: ${result}`);

  await airsim.confirmConnection();
  airsim.close();
}

main();