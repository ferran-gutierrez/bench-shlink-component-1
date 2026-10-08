import { renderHook } from '@testing-library/react';
import { useFeatures } from '../../src/utils/features';

describe('features', () => {
  it('REQ-1 enables browserRedirectConditions for Shlink 5.1.0 and newer', () => {
    const { result } = renderHook(() => useFeatures('5.1.0'));

    expect((result.current as Record<string, boolean>).browserRedirectConditions).toBe(true);
  });

  it('REQ-1 disables browserRedirectConditions for Shlink 5.0.0', () => {
    const { result } = renderHook(() => useFeatures('5.0.0'));

    expect((result.current as Record<string, boolean>).browserRedirectConditions).toBe(false);
  });
});
