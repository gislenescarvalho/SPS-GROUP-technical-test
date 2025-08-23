import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormField from '../components/FormField';

describe('FormField Component', () => {
  const defaultProps = {
    label: 'Test Label',
    name: 'test',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    test('deve renderizar com label', () => {
      render(<FormField {...defaultProps} />);
      
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    test('deve renderizar com label obrigatório', () => {
      render(<FormField {...defaultProps} required />);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('deve renderizar com placeholder', () => {
      render(<FormField {...defaultProps} placeholder="Digite aqui..." />);
      
      expect(screen.getByPlaceholderText('Digite aqui...')).toBeInTheDocument();
    });

    test('deve renderizar com valor inicial', () => {
      render(<FormField {...defaultProps} value="Valor inicial" />);
      
      expect(screen.getByDisplayValue('Valor inicial')).toBeInTheDocument();
    });

    test('deve renderizar com erro', () => {
      render(<FormField {...defaultProps} error="Campo obrigatório" />);
      
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    test('deve renderizar com tipo específico', () => {
      render(<FormField {...defaultProps} type="email" />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('type', 'email');
    });

    test('deve renderizar como textarea quando type é textarea', () => {
      render(<FormField {...defaultProps} type="textarea" />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveStyle('min-height: 100px');
    });

    test('deve renderizar como select quando type é select', () => {
      const options = [
        { value: 'option1', label: 'Opção 1' },
        { value: 'option2', label: 'Opção 2' }
      ];
      
      render(<FormField {...defaultProps} type="select" options={options} />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Opção 1')).toBeInTheDocument();
      expect(screen.getByText('Opção 2')).toBeInTheDocument();
    });
  });

  describe('Interação', () => {
    test('deve chamar onChange quando valor muda', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormField {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByLabelText('Test Label');
      await user.type(input, 'test');
      
      expect(onChange).toHaveBeenCalled();
    });

    test('deve chamar onChange com evento correto', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormField {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByLabelText('Test Label');
      await user.type(input, 'a');
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'test'
          })
        })
      );
    });

    test('deve lidar com mudança em textarea', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<FormField {...defaultProps} type="textarea" onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'texto longo');
      
      expect(onChange).toHaveBeenCalled();
    });

    test('deve lidar com mudança em select', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const options = [
        { value: 'option1', label: 'Opção 1' },
        { value: 'option2', label: 'Opção 2' }
      ];
      
      render(<FormField {...defaultProps} type="select" options={options} onChange={onChange} />);
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option2');
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'test'
          })
        })
      );
    });
  });

  describe('Acessibilidade', () => {
    test('deve ter id único baseado no name', () => {
      render(<FormField {...defaultProps} name="unique-name" />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('id', 'field-unique-name');
    });

    test('deve ter atributo required quando especificado', () => {
      render(<FormField {...defaultProps} required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });

    test('deve ter atributo disabled quando especificado', () => {
      render(<FormField {...defaultProps} disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('disabled');
    });

    test('deve ter aria-describedby quando há erro', () => {
      render(<FormField {...defaultProps} error="Campo obrigatório" />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-describedby', 'field-test-error');
    });

    test('deve ter role alert no elemento de erro', () => {
      render(<FormField {...defaultProps} error="Campo obrigatório" />);
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Campo obrigatório');
    });
  });

  describe('Estados especiais', () => {
    test('deve ter atributo disabled quando especificado', () => {
      render(<FormField {...defaultProps} disabled />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('disabled');
    });

    test('deve mostrar asterisco quando campo é obrigatório', () => {
      render(<FormField {...defaultProps} required />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('deve mostrar mensagem de erro quando há erro', () => {
      render(<FormField {...defaultProps} error="Campo obrigatório" />);
      
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  describe('Casos edge', () => {
    test('deve lidar com label vazio', () => {
      render(<FormField {...defaultProps} label="" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('deve lidar com name vazio', () => {
      render(<FormField {...defaultProps} name="" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'field-');
    });

    test('deve renderizar sem quebrar quando onChange é undefined', () => {
      render(<FormField {...defaultProps} onChange={undefined} />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('name', 'test');
    });

    test('deve lidar com options vazio em select', () => {
      render(<FormField {...defaultProps} type="select" options={[]} />);
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    test('deve lidar com value null', () => {
      render(<FormField {...defaultProps} value={null} />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveValue('');
    });

    test('deve lidar com value undefined', () => {
      render(<FormField {...defaultProps} value={undefined} />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveValue('');
    });
  });

  describe('Integração com validação', () => {
    test('deve mostrar erro como string', () => {
      render(<FormField {...defaultProps} error="Erro simples" />);
      
      expect(screen.getByText('Erro simples')).toBeInTheDocument();
    });

    test('deve não mostrar erro quando error é null', () => {
      render(<FormField {...defaultProps} error={null} />);
      
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });

    test('deve não mostrar erro quando error é undefined', () => {
      render(<FormField {...defaultProps} error={undefined} />);
      
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });
  });

  describe('Atributos HTML', () => {
    test('deve aplicar minLength', () => {
      render(<FormField {...defaultProps} minLength={3} />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('minLength', '3');
    });

    test('deve aplicar maxLength', () => {
      render(<FormField {...defaultProps} maxLength={50} />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('maxLength', '50');
    });

    test('deve aplicar pattern', () => {
      render(<FormField {...defaultProps} pattern="[A-Za-z]+" />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
    });
  });

  describe('Estilização', () => {
    test('deve ter estrutura básica correta', () => {
      render(<FormField {...defaultProps} />);
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});
