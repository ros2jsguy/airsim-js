/* eslint-disable prefer-arrow-callback */

import { ok } from 'assert';
import { AirSim } from '../src/airsim';
import { Vehicle } from '../src/vehicle';

describe('Sim control tests', () => {
  let airsim: AirSim<Vehicle>;

  before(async () => {
    airsim = new AirSim(Vehicle);
    await airsim.connect();
  });

  beforeEach(async () => {
    await airsim.pause();
  });
  
  afterEach(async () => {
    await airsim.resume();
  });

  after(() => {
    airsim.close();
  });

  it('simPause() default param', async () => {
    const paused = airsim.isPaused();
    ok(paused, 'Expected sim to be paused');
  });

  it('simPause(true/false)', async () => {
    await airsim.pause();
    let paused = await airsim.isPaused();
    ok(paused, 'Expected sim to be paused');

    await airsim.resume();
    paused = await airsim.isPaused();
    ok(!paused, 'Expected sim to be active');
  });

  // eslint-disable-next-line func-names
  it('simContinueForTime', async function () {
    await airsim.pause();
    let paused = await airsim.isPaused();
    ok(paused, 'Expected sim to be paused');

    await airsim.continueForTime(1.0);
    paused = await airsim.isPaused();
    ok(!paused, 'Expected sim to be active for 1 second');

    setTimeout(async () => {
      paused = await airsim.isPaused();
      ok(paused, 'Expected sim to be paused after 1 seconds of execution');
    }, 1100);
    
  });

  // eslint-disable-next-line func-names
  it('simContinueForFrames', async function () {
    await airsim.continueForFrames(10);
    let paused = await airsim.isPaused();
    ok(!paused, 'Expected sim to be active for 1 second');

    setTimeout(async () => {
      paused = await airsim.isPaused();
      ok(paused, 'Expected sim to be paused after 1 seconds of execution');
      airsim.close();
    }, 500);
  });

});
