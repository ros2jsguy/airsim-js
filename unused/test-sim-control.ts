/* eslint-disable prefer-arrow-callback */

import { ok, notEqual, doesNotThrow } from 'assert';
import { BasicClient } from '../src/clients/basic-client';

describe('Sim control tests', () => {
  let client: BasicClient;

  before(async () => {
    client = new BasicClient();
    await client.connect();
  });

  beforeEach(async () => {
    await client.simPause(false);
  });
  
  afterEach(async () => {
    await client.simPause(false);
  });

  after(() => {
    client.close();
  });

  it('simPause() default param', async () => {
    const paused = client.simIsPaused();
    ok(paused, 'Expected sim to be paused');
  });

  it('simPause(true/false)', async () => {
    await client.simPause(true);
    let paused = await client.simIsPaused();
    ok(paused, 'Expected sim to be paused');

    await client.simPause(false);
    paused = await client.simIsPaused();
    ok(!paused, 'Expected sim to be active');
  });

  // eslint-disable-next-line func-names
  it('simContinueForTime', async function () {
    await client.simPause(true);
    let paused = await client.simIsPaused();
    ok(paused, 'Expected sim to be paused');

    await client.simContinueForTime(1.0);
    paused = await client.simIsPaused();
    ok(!paused, 'Expected sim to be active for 1 second');

    setTimeout(async () => {
      paused = await client.simIsPaused();
      ok(paused, 'Expected sim to be paused after 1 seconds of execution');
    }, 1100);
    
  });

  // eslint-disable-next-line func-names
  it('simContinueForFrames', async function () {
    await client.simContinueForFrames(10);
    let paused = await client.simIsPaused();
    ok(!paused, 'Expected sim to be active for 1 second');

    setTimeout(async () => {
      paused = await client.simIsPaused();
      ok(paused, 'Expected sim to be paused after 1 seconds of execution');
      client.close();
    }, 500);
  });

});
