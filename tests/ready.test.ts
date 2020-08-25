import { ready, loaded } from '../src/ready';
import { ReadyStateMocker } from './mock';

const stateMock = new ReadyStateMocker();

beforeEach(() => {
  stateMock.resetLoading();
});

test('ready() before DOM loaded', async () => {
  let readyResult : boolean|null = null;
  ready().then(() => { readyResult = true; }).catch(() => { readyResult = false; });

  expect(readyResult).toBe(null);
  await stateMock.enterInteractive();
  expect(readyResult).toBe(true);
});

test('ready() after DOM loaded', async () => {
  await stateMock.enterInteractive();

  let readyResult : boolean|null = null;
  await ready().then(() => { readyResult = true; }).catch(() => { readyResult = false; });

  expect(readyResult).toBe(true);
});

test('ready() after complete', async () => {
  await stateMock.enterComplete();

  let readyResult : boolean|null = null;
  await ready().then(() => { readyResult = true; }).catch(() => { readyResult = false; });

  expect(readyResult).toBe(true);
});

test('loaded() before DOM loaded', async () => {
  let readyResult : boolean|null = null;
  loaded().then(() => { readyResult = true; }).catch(() => { readyResult = false; });

  expect(readyResult).toBe(null);
  await stateMock.enterInteractive();
  expect(readyResult).toBe(null);
  await stateMock.enterComplete();
  expect(readyResult).toBe(true);
});

test('loaded() after DOM loaded', async () => {
  await stateMock.enterInteractive();

  let readyResult : boolean|null = null;
  loaded().then(() => { readyResult = true; }).catch(() => { readyResult = false; });
  expect(readyResult).toBe(null);

  await stateMock.enterComplete();
  expect(readyResult).toBe(true);
});

test('loaded() after complete', async () => {
  await stateMock.enterInteractive();
  await stateMock.enterComplete();
  let readyResult : boolean|null = null;
  await loaded().then(() => { readyResult = true; }).catch(() => { readyResult = false; });
  expect(readyResult).toBe(true);
});
