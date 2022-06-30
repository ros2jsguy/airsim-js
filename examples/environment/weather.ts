/* eslint-disable no-console */

import { AirSim } from '../../src/airsim';
import { WeatherParameter } from '../../src/internal-types';
import { waitKey } from '../../src/utils';
import { Vehicle } from '../../src/vehicle';



async function main() {
  const airsim = new AirSim(Vehicle);
  
  console.log('Connecting');
  await airsim.connect();
  console.log('connected');

  await airsim.enableWeather();

  await waitKey('Press any key to enable rain at 25%');
  await airsim.setWeatherParameter(WeatherParameter.Rain, 0.25);
  
  await waitKey('Press any key to enable rain at 75%');
  await airsim.setWeatherParameter(WeatherParameter.Rain, 0.75);
  
  await waitKey('Press any key to enable snow at 50%');
  await airsim.setWeatherParameter(WeatherParameter.Snow, 0.50);
  
  await waitKey('Press any key to enable maple leaves at 50%');
  airsim.setWeatherParameter(WeatherParameter.MapleLeaf, 0.50);
  
  await waitKey('Press any key to set all effects to 0%');
  await airsim.setWeatherParameter(WeatherParameter.Rain, 0.0);
  await airsim.setWeatherParameter(WeatherParameter.Snow, 0.0);
  await airsim.setWeatherParameter(WeatherParameter.MapleLeaf, 0.0);
  
  await waitKey('Press any key to enable dust at 50%');
  await airsim.setWeatherParameter(WeatherParameter.Dust, 0.50);
  
  await waitKey('Press any key to enable fog at 50%');
  await airsim.setWeatherParameter(WeatherParameter.Fog, 0.50);
  
  await waitKey('Press any key to disable all weather effects');
  await airsim.disableWeather();

  await airsim.reset();
  airsim.close();
}

main();
