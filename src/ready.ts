export function ready<T>(value?): Promise<T> {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            let readyFunc = () => {
                document.removeEventListener('DOMContentLoaded', readyFunc);
                resolve(value);
            };
            document.addEventListener('DOMContentLoaded', readyFunc);
        } else {
            resolve(value);
        }
    });
};


export function loaded(timeout? : number): Promise<boolean> {
    return new Promise((resolve) => {
        if (document.readyState !== 'complete') {
            let timeoutHandle = null;
            let loadFunc = () => readyFunc(true);
            let readyFunc = (isLoaded : boolean) => {
                window.removeEventListener('load', loadFunc);
                if (timeoutHandle !== null) {
                    window.clearTimeout(timeoutHandle);
                    timeoutHandle = null;
                }
                resolve(isLoaded);
            };

            window.addEventListener('load', loadFunc);
            if (timeout !== undefined) {
                timeoutHandle = window.setTimeout(() => readyFunc(false), timeout);
            }
        } else {
            resolve(true);
        }
    });
};

