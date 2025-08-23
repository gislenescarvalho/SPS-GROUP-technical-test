import { renderHook, act } from '@testing-library/react';
import useApi from '../../hooks/useApi';

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('estado inicial', () => {
    test('deve ter estado inicial correto', () => {
      const mockFunction = jest.fn();
      const { result } = renderHook(() => useApi(mockFunction));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.execute).toBe('function');
    });
  });

  describe('execução bem-sucedida', () => {
    test('deve executar função e retornar dados', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockFunction = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useApi(mockFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('execução com erro', () => {
    test('deve lidar com erro na execução', async () => {
      const errorMessage = 'Erro na requisição';
      const mockFunction = jest.fn().mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useApi(mockFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch (err) {
          // Esperado que lance erro
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
    });
  });

  describe('função reset', () => {
    test('deve limpar todos os estados', async () => {
      const mockFunction = jest.fn().mockResolvedValue('test');
      const { result } = renderHook(() => useApi(mockFunction));

      await act(async () => {
        await result.current.execute();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});