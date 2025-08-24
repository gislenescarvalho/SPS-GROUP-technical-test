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

  test('deve renderizar com label', () => {
    render(<FormField {...defaultProps} />);
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('deve renderizar com erro', () => {
    render(<FormField {...defaultProps} error="Campo obrigatório" />);
    
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  test('deve chamar onChange quando valor muda', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<FormField {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByLabelText('Test Label');
    await user.type(input, 'test');
    
    expect(onChange).toHaveBeenCalled();
  });
});
