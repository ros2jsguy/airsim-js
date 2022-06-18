
import {ok, notEqual} from 'assert';
import { AirSimClient } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

describe('Connectivity tests', () => {

  it('connect test', async () => {
    const airsim = new AirSimClient<Vehicle>();
    const result = await airsim.connect();
    ok(result, 'Client.connect failed');
    airsim.close();
  });

});

describe('Connectivity tests', () => {
  let airsim: AirSimClient<Vehicle>;
  
  before(async () => {
    airsim = new AirSimClient<Vehicle>();
      await airsim.connect();
    });
    
  after(() => {
      airsim.close();
    });

  it('ping test', async () => {
      const result = await airsim.ping();
      ok(result, 'Client.ping failed');
    });

  it('ping closed connection test', async () => {
    await airsim.close();
    const result = await airsim.ping();
    notEqual(result, false, 'Invalid state');
  });

});
