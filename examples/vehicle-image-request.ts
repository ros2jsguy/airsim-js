/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

import { AirSim } from '../src/airsim';
import { ImageRequest, ImageType } from '../src/internal-types';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  // await airsim.reset();

  const vehicles = await airsim.getVehicles();
  if (vehicles.length === 0) {
    console.error('Unable to locate vehicle.');
    await airsim.close();
    return;
  }

  const vehicle = vehicles[0];
  console.log('vehicle: ', vehicle);

  await vehicle.enableApiControl();
  console.log('API enabled');

  const imgRequest: ImageRequest = {
    camera_name: '0',
    image_type: ImageType.Scene,
    pixels_as_float: false,
    compress: false
  };

  const imgResponses = await vehicle.getImages([imgRequest]);
  console.log('responses: ', imgResponses);

  console.log('Closing client connection.');
  airsim.close();
}

main();