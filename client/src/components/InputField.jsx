const InputField = ({ label, value, onChange, type = "text" }) => (
  <div className="input-group">
    <label>{label}</label>
    <input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default InputField;
