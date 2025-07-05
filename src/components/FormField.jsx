import React from 'react';

function FormField({ type, placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{placeholder}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field"
        required
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default FormField;