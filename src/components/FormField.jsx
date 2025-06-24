function FormField({ type, placeholder, value, onChange, error, ...props }) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field"
        {...props}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default FormField;