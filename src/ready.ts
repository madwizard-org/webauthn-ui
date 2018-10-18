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
