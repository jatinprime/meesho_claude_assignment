import { DataHandler } from '../dataHandler';

describe('DataHandler', () => {
  let handler: DataHandler;

  beforeEach(() => {
    handler = new DataHandler();
  });

  it('should return a user correctly after network delay (verifying await fixes)', async () => {
    const user = await handler.getUser(1);
    expect(user).toBeDefined();
    expect(user?.name).toBe('Alice');
  });

  it('should return undefined for a non-existent user', async () => {
    const user = await handler.getUser(999);
    expect(user).toBeUndefined();
  });

  it('should return a promise for getUser, confirming async API (await regression check)', () => {
    const result = handler.getUser(1);
    expect(result).toBeInstanceOf(Promise);
  });

  it('should count active users correctly and terminate the loop (infinite loop regression check)', () => {
    const activeCount = handler.getActiveUsersCount();
    expect(activeCount).toBe(1);
  });
});
