/* eslint-disable prefer-arrow-callback */

import { ok } from 'assert';
import { BasicClient } from '../src/clients/basic-client';
import { Vector3r, WeatherParameter } from '../src/clients/types';

describe('Sim weather api', () => {
  let client: BasicClient;

  before(async () => {
    client = new BasicClient();
    await client.connect();
  });

  beforeEach(async () => {
    
  });

  after(async () => {
    client.close();
  });

  it('simEnableWeather() default param', async () => {
    await client.simPause(false);
    await client.simEnableWeather();
  });

  // it('simEnableWeather(true/false) default param', async () => {
  //   await client.simEnableWeather(false);
  //   await client.simEnableWeather(true);
  //   await client.simEnableWeather(false);
  // });

  it('simSetWind()', async () => {
    await client.simPause(false);
    await client.simEnableWeather();
    await client.simSetWeatherParameter(WeatherParameter.Snow, 0);
    await client.simSetWeatherParameter(WeatherParameter.Fog, 0.1);

    // let wind: Vector3r = { x_val: 0.1, y_val: 0.1, z_val: 0 };
    // await client.simSetWind(wind);

    const wind = { x_val: 0, y_val: 0, z_val: 0 };
    await client.simSetWind(wind);
  });

});
