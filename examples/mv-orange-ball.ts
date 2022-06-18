/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */

/* eslint-disable no-console */

import { AirSimClient } from '../src/airsim';
// import { delay } from '../src/utils';
import { Vehicle } from '../src/vehicle';


async function main() {
  const OBJ = 'OrangeBall';
  // const OBJ = 'Cone_5';

  const airsim = new AirSimClient(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  // await airsim.enableApiControl();

  const scale = await airsim.getObjectScale(OBJ);
  console.log('Orange ball scale: ', scale);

  scale.x *= 0.5;
  scale.y *= 0.5;
  scale.z *= 0.5;
  // await airsim.setObjectScale(OBJ, scale);

  let pose = await airsim.getObjectPose(OBJ);
  console.log('pose1: ', pose);
  if (pose) {
    pose.position.x += 40;
    pose.position.y += 40;
    await airsim.setObjectPose(OBJ, pose, true);

    pose = await airsim.getObjectPose(OBJ);
    console.log('pose2: ', pose);
  }
  // const objectNames = await airsim.getSceneObjects();
  // //'TemplateCube_Rounded_'
  // let objs = objectNames.filter(name => name.startsWith('TemplateCube_Rounded_'));
  // objs = objectNames;
  // for (let i=0; i < objs.length; i++) {
  // // objs.forEach( async nm => {
  //   await delay(500);
  //   const name = objs[i];
  //   try {
  //     const pose = await airsim.getObjectPose(name);
  //     pose.orientation.z_val += 0.7;
  //     pose.position.x_val += 50;
  //     console.log(name, ' ', pose);
  //     await airsim.setObjectPose(name, pose, false);
  //   } catch(e: any) {
  //     console.log('namexxxxxx: ', name);
  //     console.error('error: ', e);
  //   }
  
  //   if (pose) {
  //     pose.orientation.z_val += 0.7;
  //     console.log(name, ' ', pose);
  //     await airsim.setObjectPose(name, pose, false);
  //   } else {
  //     console.log('NOT FOUND: ', name);
  //   }
  // });


  airsim.close();
}

main();
