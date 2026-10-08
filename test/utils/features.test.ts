import { renderHook } from '@testing-library/react';
import { useFeatures } from '../../src/utils/features';
import type { SemVerOrLatest } from '../../src/utils/helpers/version';

describe('features', () => {
  const getFeatures = (serverVersion: SemVerOrLatest) => {
    const { result } = renderHook(() => useFeatures(serverVersion));
    return result.current;
  };

  it.each([
    ['5.0.99', false],
    ['5.1.0', true],
    ['5.2.0', true],
    ['latest', true],
  ] as const)('enables browserRedirectConditions for server version %s', (serverVersion, enabled) => {
    expect(getFeatures(serverVersion).browserRedirectConditions).toBe(enabled);
  });
});
