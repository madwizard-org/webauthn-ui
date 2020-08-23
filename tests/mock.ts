import WebAuthnUI from '../src';


export class ReadyStateMocker
{
    state = 'loading';

    constructor() {
        // Setup fake DOM readyState
        let that = this;
        Object.defineProperty(document, 'readyState', { get() { return that.state; }})
    }

    resetLoading() {
        this.state = 'loading';
    }


    async enterInteractive()
    {
        // Document loaded
        this.state = 'interactive';
        await document.dispatchEvent(new Event("DOMContentLoaded"));
    }

    async enterComplete()
    {
        // Document loaded
        this.state = 'complete';
        await window.dispatchEvent(new Event("load"));
    }
}

interface LoadedModule {
    WebAuthnUI : WebAuthnUI;
    autoSucceeded: boolean|null;
    autoPromise: Promise<void>;
}


export async function importModule() : Promise<LoadedModule>
{
    const module = await import('../src/index');

    let obj : LoadedModule = {
        WebAuthnUI: module.default,
        autoSucceeded : null,
        autoPromise: module.default.autoPromise
    };
    module.default.autoPromise
        .then(() => { obj.autoSucceeded = true; } )
        .catch(() => { obj.autoSucceeded = false; } );
    return obj;
}
