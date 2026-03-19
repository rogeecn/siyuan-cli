import { jest } from '@jest/globals';
import { requestConfirmation } from '../../src/core/confirm.js';

describe('requestConfirmation', () => {
  test('skips confirmation when yes flag is provided', async () => {
    const confirm = jest.fn<() => Promise<boolean>>().mockResolvedValue(false);

    await expect(requestConfirmation({ yes: true }, confirm)).resolves.toBeUndefined();
    expect(confirm).not.toHaveBeenCalled();
  });

  test('requires confirmation by default', async () => {
    const confirm = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);

    await expect(requestConfirmation({}, confirm)).resolves.toBeUndefined();
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  test('throws when confirmation is declined', async () => {
    const confirm = jest.fn<() => Promise<boolean>>().mockResolvedValue(false);

    await expect(requestConfirmation({}, confirm)).rejects.toThrow('Command aborted by user');
  });
});
