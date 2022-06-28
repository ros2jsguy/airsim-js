
/* eslint-disable no-console */

import { Vector3 } from '@ros2jsguy/three-math-ts';
import { AirSim } from '../src/airsim';
import { WeatherParameter } from '../src/internal-types';
import { Vehicle } from '../src/vehicle';

async function main() {
  const airsim = new AirSim(Vehicle);
  const connectResult = await airsim.connect();
  console.log(`Connecting: ${connectResult}`);

  await airsim.enableWeather();
  await airsim.setWeatherParameter(WeatherParameter.Snow, 0);
  await airsim.setWeatherParameter(WeatherParameter.Fog, 0.1);

  const wind = new Vector3();
  await airsim.setWind(wind);
  
  airsim.close();
}

main();
