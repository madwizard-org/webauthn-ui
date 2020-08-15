beforeEach(() => {

});



test('auto', async () => {

    document.body.innerHTML =`<div id="test" class="webauthn-detect"></div>`

    // Load module
    await import('../src/index');


    expect(document.getElementById('test').classList.value).toBe('webauthn-detect webauthn-unsupported');

});
