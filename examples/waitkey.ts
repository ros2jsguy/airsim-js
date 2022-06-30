/* eslint-disable no-console */

import { waitKey } from '../src/utils';

async function main() {
  await waitKey('wait key (5 sec)', 5000);
  
  await waitKey('wait key (indefinitely)');
  
  console.log('wait key (5 sec) - waitkey(5000)');
  await waitKey(5000);

  console.log('wait key (indefinetly) - no args');
  await waitKey();
  
  console.log('complete');
  process.exit(0);
}

main();
