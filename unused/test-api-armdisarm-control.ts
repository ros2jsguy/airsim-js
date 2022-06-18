/* eslint-disable prefer-arrow-callback */

import { ok } from 'assert';
import { BasicClient } from './clients/basic-client';

describe('Sim api and armdisarm control tests', () => {
  let client: BasicClient;

  before(async () => {
    client = new BasicClient();
    await client.connect();
  });

  beforeEach(async () => {
    await client.reset();
  });

  after(async () => {
    await client.reset();
    client.close();
  });

  it('setApiControlEnabled() default param', async () => {
    await client.enableApiControl();
    const enabled = await client.isApiControlEnabled();
    ok(!enabled, 'Expected default sim api to be disabled');
  });

  it('setApiControlEnabled(true/false)', async () => {
    await client.enableApiControl(true);

    let enabled = await client.isApiControlEnabled();
    ok(enabled, 'Expected sim api to be enabled');

    await client.enableApiControl(false);
    enabled = await client.isApiControlEnabled();
    ok(!enabled, 'Expected sim api to be disenabled');
  });

  it('armDisarm(true/false)', async () => {

    let armed = await client.armDisarm(true);
    ok(armed, 'Expected sim armedDisarmed to be armed');

    armed = await client.armDisarm(false);
    ok(armed, 'Expected sim armedDisarmed to be disarmed');
  });

});
