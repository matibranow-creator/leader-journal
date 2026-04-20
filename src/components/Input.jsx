export default function Input({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
  rows = 4,
  ...props
}) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea
          id={id}
          className="field-control textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          {...props}
        />
      ) : (
        <input
          id={id}
          className="field-control"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      )}
    </label>
  );
}
