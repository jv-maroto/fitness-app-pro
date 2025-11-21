import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
}) => {
  const { theme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all ${
          theme === 'dark'
            ? 'bg-slate-800/50 border border-slate-600/50 text-white hover:border-cyan-500/50'
            : 'bg-white/70 border border-slate-300/50 text-slate-900 hover:border-cyan-500/50'
        }`}
        style={{
          boxShadow: isOpen
            ? '0 0 20px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            : 'inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-xl overflow-hidden ${
            theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'
          }`}
          style={{
            backdropFilter: 'blur(12px)',
            border: '1px solid transparent',
            backgroundImage:
              theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(30,41,59,0.95)), linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.95)), linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            boxShadow:
              '0 0 30px rgba(6, 182, 212, 0.2), 0 10px 40px rgba(0,0,0,0.3)',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left transition-all ${
                option.value === value
                  ? theme === 'dark'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-cyan-500/20 text-cyan-700'
                  : theme === 'dark'
                  ? 'text-white hover:bg-slate-700/50'
                  : 'text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
