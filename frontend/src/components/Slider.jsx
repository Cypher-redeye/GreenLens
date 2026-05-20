export const Slider = ({ min, max, step, value, onChange, label }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
      />
      <span className="text-sm text-gray-500">{value}</span>
    </div>
  );
};

export default Slider;
