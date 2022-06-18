
/* eslint-disable no-console */

import { MultirotorClient } from '../clients/multirotor-client';
import { MULTIROTOR } from '../src/constants';


async function main() {
  const vehicle = MULTIROTOR;

  const client = new MultirotorClient();
  const connectResult = await client.connect();
  console.log(`Connecting: ${connectResult}`);

  await client.enableApiControl(true);
  
  let result = await client.takeoff(5, vehicle);
  console.log('takeoff: ', result);

  const pose = await client.simGetVehiclePose(MULTIROTOR);
  console.log('pose: ', pose.position);
  
  // moveToPositionAsync(self, x, y, z, velocity, timeout_sec = 3e+38, drivetrain = DrivetrainType.MaxDegreeOfFreedom, yaw_mode = YawMode(),
  // lookahead = -1, adaptive_lookahead = 1, vehicle_name = ''):
  // return self.client.call_async('moveToPosition', x, y, z, velocity, timeout_sec, drivetrain, yaw_mode, lookahead, adaptive_lookahead, vehicle_name)

  result = await client.land(30, vehicle);
  console.log('land: ', result);

  await client.enableApiControl(false);
  client.close();
}

main();
