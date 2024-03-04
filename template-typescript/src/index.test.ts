import { vi } from 'vitest';

import { sleep } from './index';

describe('sleep', () => {
  const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { input: 0.1, timeout: 100 },
    { input: undefined, timeout: 100 },
  ])('should halt the execution for $input', async ({ input, timeout }) => {
    const fn = async () => {
      await sleep(input);

      return 'finished';
    };

    await expect(fn()).resolves.toBe('finished');
    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), timeout);
  });
});
