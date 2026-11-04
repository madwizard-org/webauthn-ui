function waitReadyState(
  alreadyDone: boolean,
  eventDispatcher: Window | Document,
  eventName: string,
): Promise<void> {
  if (alreadyDone) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const readyFunc = () => {
      eventDispatcher.removeEventListener(eventName, readyFunc);
      resolve();
    };
    eventDispatcher.addEventListener(eventName, readyFunc);
  });
}

export function ready(): Promise<void> {
  return waitReadyState(
    document.readyState !== 'loading',
    document,
    'DOMContentLoaded',
  );
}

export function loaded(): Promise<void> {
  return waitReadyState(document.readyState === 'complete', window, 'load');
}
