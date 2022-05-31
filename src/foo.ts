
import { Client, TcpClient } from "msgpack-rpc-node";

export async function main() {

  const client = new Client(TcpClient,41451,'127.0.0.1');
  let c = await client.connect();

  console.log('connect: ' + c);

  console.log('Calling ping');
  let result = await client.call('ping');
  console.log('result: ' + result);

  // result = await client.call('getMinRequiredClientVersion');
  // console.log('result: ' + result);

  // result = await client.call('simPause', true);
  // console.log('result: ' + result);

  // result = await client.call('simIsPaused');
  // console.log('result: ' + result);

  // result = await client.call('simPause', false);
  // console.log('result: ' + result);

  // result = await client.call('simIsPaused');
  // console.log('result: ' + result);

  // result = await client.call('getHomeGeoPoint', '');
  // console.log('result: ' + result);

}

main();