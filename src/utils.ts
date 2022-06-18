/* eslint-disable import/prefer-default-export */

export function delay(millis: number): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise<void>(resolve => setTimeout(resolve, millis));
}
