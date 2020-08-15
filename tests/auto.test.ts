beforeEach(() => {

});



test('auto', async () => {

    // Fake loading dom state
    let state = 'loading';
    Object.defineProperty(document, 'readyState', { get() { return state; }})

    document.body.innerHTML =`<div id="test" class="webauthn-detect"></div>`

    // Import module
    await import('../src/index');

    // No auto code run yet
    expect(document.getElementById('test').classList.value).toBe('webauthn-detect');

    // Document loaded
    state = 'interactive';
    await document.dispatchEvent(new Event("DOMContentLoaded"));

    /// Auto code run
    expect(document.getElementById('test').classList.value).toBe('webauthn-detect webauthn-unsupported');

});
