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
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const fn = async () => {
      await sleep(input);

      return 'finished';
    };

    expect(await fn()).toBe('finished');
    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), timeout);
  });
});
