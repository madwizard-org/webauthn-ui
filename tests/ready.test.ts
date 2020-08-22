import { ready, loaded } from '../src/ready';

// Setup fake DOM readyState
let state = 'loading';
Object.defineProperty(document, 'readyState', { get() { return state; }})


beforeEach(() => {
    state = 'loading';
});


async function enterInteractive()
{
    // Document loaded
    state = 'interactive';
    await document.dispatchEvent(new Event("DOMContentLoaded"));
}

async function enterComplete()
{
    // Document loaded
    state = 'complete';
    await window.dispatchEvent(new Event("load"));
}

test('ready() before DOM loaded', async () => {

    let readyResult : boolean|null = null;
    ready().then(() => { readyResult = true; }).catch(() => {readyResult = false; });

    expect(readyResult).toBe(null);
    await enterInteractive();
    expect(readyResult).toBe(true);
});


test('ready() after DOM loaded', async () => {
    await enterInteractive();

    let readyResult : boolean|null = null;
    await ready().then(() => { readyResult = true; }).catch(() => {readyResult = false; });

    expect(readyResult).toBe(true);
});


test('ready() after complete', async () => {
    await enterComplete();

    let readyResult : boolean|null = null;
    await ready().then(() => { readyResult = true; }).catch(() => {readyResult = false; });

    expect(readyResult).toBe(true);
});


test('loaded() before DOM loaded', async () => {

    let readyResult : boolean|null = null;
    loaded().then(() => { readyResult = true; }).catch(() => {readyResult = false; });

    expect(readyResult).toBe(null);
    await enterInteractive();
    expect(readyResult).toBe(null);
    await enterComplete();
    expect(readyResult).toBe(true);
});


test('loaded() after DOM loaded', async () => {
    await enterInteractive();

    let readyResult : boolean|null = null;
    loaded().then(() => { readyResult = true; }).catch(() => {readyResult = false; });
    expect(readyResult).toBe(null);

    await enterComplete();
    expect(readyResult).toBe(true);
});


test('loaded() after complete', async () => {
    await enterInteractive();
    await enterComplete();
    let readyResult : boolean|null = null;
    await loaded().then(() => { readyResult = true; }).catch(() => {readyResult = false; });
    expect(readyResult).toBe(true);
});