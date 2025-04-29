'use client';

export default function FormField({ 
  label, 
  type = 'text', 
  name, 
  value = '', 
  onChange, 
  options = [], 
  ...props 
}) {
  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900"
          {...props}
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
          name={name}
          value={value}
          onChange={onChange}
          {...props}
        />
      ) : (
        <input
          type={type}
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
          name={name}
          value={value}
          onChange={onChange}
          {...props}
        />
      )}
    </div>
  );
}