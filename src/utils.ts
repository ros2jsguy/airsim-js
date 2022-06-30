/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */

export function delay(millis: number): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise<void>(resolve => setTimeout(resolve, millis));
}

export function waitKey(msgOrTimeout?: string | number, timeout?: number): Promise<void> {
  let timeoutInterval = 0;

  if (msgOrTimeout) {
    if (typeof msgOrTimeout === 'string') {
      timeoutInterval = timeout;
      console.log(msgOrTimeout);
    } else {
      timeoutInterval = msgOrTimeout;
    }
  } 

  process.stdin.setRawMode(true);
  return new Promise(resolve => {
    let timer: NodeJS.Timeout;
    if (timeoutInterval > 0) {
      timer = setTimeout(resolve, timeoutInterval);
    }

    // eslint-disable-next-line no-promise-executor-return
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      if (timeout) clearTimeout(timer);
      resolve();
    });
  });
}
