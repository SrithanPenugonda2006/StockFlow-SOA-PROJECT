import React from 'react';
import { Check, Circle } from 'lucide-react';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const result = evaluatePasswordStrength(password);
  const satisfiedCount = result.requirements.filter((r) => r.satisfied).length;

  return (
    <div className="flex flex-col gap-2 p-3 sm:p-3.5 bg-[#F7F8FA]/70 border border-gray-200 rounded-xl text-left w-full">
      {/* Strength Bar & Level Label */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-gray-800">Strength:</span>
          <span className={`font-bold tracking-wide ${result.textColorClass}`}>{result.level}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
          <div
            className={`h-full transition-all duration-300 ${result.colorClass}`}
            style={{ width: `${password ? result.percentage : 0}%` }}
            role="progressbar"
            aria-valuenow={result.score}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label={`Password strength: ${result.level}`}
          />
        </div>
      </div>

      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        Password strength is {result.level}. {satisfiedCount} of {result.requirements.length} requirements met.
      </div>

      {/* Requirements Checklist */}
      <div className="flex flex-col gap-2 pt-1 border-t border-gray-200/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
          Password requirements:
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1.5 text-xs">
          {result.requirements.map((req) => (
            <li
              key={req.id}
              className={`flex items-center gap-2 transition-colors ${
                req.satisfied ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {req.satisfied ? (
                <Check className="w-3.5 h-3.5 text-gray-900 shrink-0" aria-hidden="true" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-gray-500 shrink-0" aria-hidden="true" />
              )}
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
