'use client';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  optionLabels?: [string, string];
}

export default function ToggleSwitch({
  isOn,
  onToggle,
  optionLabels = ['', ''],
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center cursor-pointer" onClick={onToggle}>
      <span className={`mr-2 text-sm ${!isOn ? 'font-bold' : ''}`}>
        {optionLabels[0]}
      </span>
      <div
        className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors ${isOn ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isOn ? 'translate-x-6' : ''}`}
        />
      </div>
      <span className={`ml-2 text-sm ${isOn ? 'font-bold' : ''}`}>
        {optionLabels[1]}
      </span>
    </div>
  );
}
