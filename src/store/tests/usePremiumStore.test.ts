import { usePremiumStore } from '../usePremiumStore';

describe('usePremiumStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    usePremiumStore.getState().deactivateSubscription();
    usePremiumStore.getState().resetDailyPdfOps();
  });

  it('initiates in free tier with zero daily operations', () => {
    const state = usePremiumStore.getState();
    expect(state.tier).toBe('free');
    expect(state.isActive).toBe(false);
    expect(state.dailyPdfOps).toBe(0);
    expect(state.canPerformPdfOp()).toBe(true);
  });

  it('activates subscription and updates tier to premium', () => {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    
    usePremiumStore.getState().activateSubscription('yearly', expiry.toISOString());
    
    const state = usePremiumStore.getState();
    expect(state.tier).toBe('premium');
    expect(state.isActive).toBe(true);
    expect(state.plan).toBe('yearly');
    expect(state.expiresAt).toBe(expiry.toISOString());
    expect(state.canPerformPdfOp()).toBe(true);
  });

  it('deactivates subscription and reverts to free tier', () => {
    const expiry = new Date().toISOString();
    usePremiumStore.getState().activateSubscription('monthly', expiry);
    usePremiumStore.getState().deactivateSubscription();

    const state = usePremiumStore.getState();
    expect(state.tier).toBe('free');
    expect(state.isActive).toBe(false);
    expect(state.plan).toBeUndefined();
    expect(state.expiresAt).toBeUndefined();
  });

  it('tracks daily PDF operations up to the limit for free tier', () => {
    const store = usePremiumStore.getState();
    
    // We should be able to increment 5 times
    expect(store.incrementPdfOps()).toBe(true); // 1
    expect(store.incrementPdfOps()).toBe(true); // 2
    expect(store.incrementPdfOps()).toBe(true); // 3
    expect(store.incrementPdfOps()).toBe(true); // 4
    expect(store.incrementPdfOps()).toBe(true); // 5

    // 6th increment should fail
    expect(store.incrementPdfOps()).toBe(false);
    expect(store.canPerformPdfOp()).toBe(false);
  });

  it('allows unlimited operations for premium users', () => {
    usePremiumStore.getState().activateSubscription('monthly', new Date().toISOString());
    const store = usePremiumStore.getState();

    // Perform more than 5 operations
    for (let i = 0; i < 10; i++) {
      expect(store.incrementPdfOps()).toBe(true);
    }
    expect(store.canPerformPdfOp()).toBe(true);
  });
});
