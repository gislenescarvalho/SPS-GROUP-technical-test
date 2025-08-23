import React from 'react';

const FormField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  options = [],
  minLength,
  maxLength,
  pattern,
  onBlur,
  validateOnBlur = true,
  ...props
}) => {
  const inputId = `field-${name}`;
  
  const baseInputStyle = {
    width: "100%",
    padding: "var(--spacing-sm)",
    border: error ? "1px solid var(--danger-color)" : "1px solid var(--border-color)",
    borderRadius: "4px",
    backgroundColor: disabled ? "var(--background-secondary)" : "var(--background-color)",
    color: disabled ? "var(--text-secondary)" : "var(--text-color)",
    fontSize: "var(--font-size-medium)",
    boxSizing: "border-box",
    minHeight: "44px",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease"
  };

  const handleBlur = (e) => {
    if (validateOnBlur && onBlur) {
      onBlur(e);
    }
  };

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={inputId}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          style={baseInputStyle}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          style={{
            ...baseInputStyle,
            minHeight: "100px",
            resize: "vertical"
          }}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      );
    }

    return (
      <input
        id={inputId}
        type={type}
        name={name}
        defaultValue={onChange ? undefined : (value || '')}
        value={onChange ? (value || '') : undefined}
        onChange={onChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        style={baseInputStyle}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
    );
  };

  return (
    <div style={{ marginBottom: "var(--spacing-md)" }}>
      <label 
        htmlFor={inputId}
        style={{ 
          display: "block", 
          marginBottom: "var(--spacing-sm)", 
          fontWeight: "bold",
          color: "var(--text-color)",
          fontSize: "var(--font-size-medium)"
        }}
      >
        {label}
        {required && <span style={{ color: "var(--danger-color)" }}> *</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <div 
          id={`${inputId}-error`}
          style={{
            color: "var(--danger-color)",
            fontSize: "var(--font-size-small)",
            marginTop: "var(--spacing-xs)",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-xs)"
          }}
          role="alert"
          aria-live="polite"
        >
          <span style={{ fontSize: "14px" }}>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
