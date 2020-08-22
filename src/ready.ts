
function waitReadyState(alreadyDone: boolean, eventDispatcher: Window|Document, eventName: string): Promise<void>
{
    if (alreadyDone) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        let readyFunc = () => {
            eventDispatcher.removeEventListener(eventName, readyFunc);
            resolve();
        };
        eventDispatcher.addEventListener(eventName, readyFunc);
    });
}

export function ready<T>(): Promise<void> {
    return waitReadyState(document.readyState !== 'loading', document, 'DOMContentLoaded');
};


export function loaded(): Promise<void> {
    return waitReadyState(document.readyState === 'complete', window, 'load');
};

