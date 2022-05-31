
import * as fs from 'fs';

import { AirSimClient, CarClient } from "./airsim-client";
import { CarControls, Pose } from "./types";
// const { createCanvas, loadImage } = require('canvas');

const CAR = 'PhysXCar';

export async function main() {
  // const canvas = createCanvas(200, 200);

  const client = new CarClient();

  console.log('Connecting: ' + await client.connect());

  await client.reset();

  console.log('Calling ping');
  let result = await client.ping();
  console.log('result: ' + result);

  console.log('simIsPaused');
  result = await client.simPause();
  result = await client.simIsPaused();
  console.log('simIsPaused result: ' + result);

  console.log('simIsPaused resumed');
  result = await client.simPause(false);
  result = await client.simIsPaused();
  console.log('simIsPaused result: ' + result);

  result = await client.isApiControlEnabled();
  console.log('isApiControlEnabled result: ' + result);
  await client.enableApiControl(true);
  result = await client.isApiControlEnabled();
  console.log('isApiControlEnabled result: ' + result);

  let settings = await client.getSettingsString();
  console.log('settings: ', settings);

  let y1 = await client.simGetWorldExtents();
  console.log('world extend: ', JSON.stringify(y1));

  let y = await client.simListAssets();
  console.log('scene assets: ' + y);

  console.log();
  console.log()
  console.log();

  let x = await client.simListSceneObjects('PhysXCar*');
  console.log('scene cars: ' + x);
  x = await client.simListSceneObjects();
  console.log('cameras: ' + x);

  // result = await client.simDestroyObject(CAR);
  // console.log('PhysXCar destroyed: ' + result);

  let z = await client.getCarState(CAR) as any;
  console.log('Car state : ' + JSON.stringify(z));

  let geoPt = await client.getHomeGeoPoint(CAR) as any;
  console.log('geopt result: ' + geoPt.latitude);

  let pose = await client.simGetVehiclePose(CAR) as Pose;
  console.log('car pose: ', JSON.stringify(pose));

  // pose = {
  //   "position": 
  //     {"x_val":0.0,
  //      "y_val":0.0,
  //      "z_val":0.0
  //     },
  //   "orientation":
  //     {"w_val":1,
  //      "x_val":0.0,
  //      "y_val":0.0,
  //      "z_val":0.70
  //     }
  // }
  // await client.simSetVehiclePose(pose, true, CAR);
  // for (let i=0; i < 1000000; i++) {
  //   pose.orientation.z_val -= 0.01;
  //   await client.simSetVehiclePose(pose, true, CAR);
  //   console.log(i);
  // }

  // await client.simSetTimeOfDay(true, '2022-05-27 18:00:00');

  let cctl = await client.getCarControls(CAR);
  console.log('car controls: ', cctl);

  let carCtl: CarControls = {
      throttle: 0.0,
      steering: 0.0,
      brake: 0.0,
      handbrake: false,
      is_manual_gear: false,
      manual_gear: 0,
      gear_immediate: true
  }

  client.setCarControls(carCtl, CAR);


  // let cam0 = await client.simGetImage('0', 0, CAR);
  // let cam0data: Uint8Array = cam0 as Uint8Array;
  // console.log('cam0 len: ', cam0data.length);
  // fs.writeFileSync("test0.png", cam0data, 'binary');

  // let cam1 = await client.simGetImage('1', 0);
  // let cam1data: Uint8Array = cam0 as Uint8Array;
  // console.log('cam1 len: ', cam1data.length);
  // fs.writeFileSync("test1.png", cam0data, 'binary');

  setTimeout( ()=>client.close(), 5000);

}

main();