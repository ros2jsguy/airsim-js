/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */

/**
 * Simulate a delay by awaiting on a Promise wrapped timeout.
 * @param millis - The time of the delay (milliseconds)
 * @returns A Promise<Timeout>
 */
export function delay(millis: number): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise<void>(resolve => setTimeout(resolve, millis));
}

/**
 * A Promise that presents an optional message on the console and waits for a
 * period of time for keyboard input to resume. 
 * @param msgOrTimeout - The message to log to the user console or a timeout (seconds)
 * @param timeout - The number of milliseconds to wait before resuming, 
 *                  a value < 1 will wait until keyboard input event before resuming.
 * @returns A Promise<void> to await on.
 */
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
