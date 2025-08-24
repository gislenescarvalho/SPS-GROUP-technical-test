import { renderHook, act } from '@testing-library/react';
import useApi from '../../hooks/useApi';

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve ter estado inicial correto', () => {
    const mockFunction = jest.fn();
    const { result } = renderHook(() => useApi(mockFunction));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('deve executar função e retornar dados', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useApi(mockFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});