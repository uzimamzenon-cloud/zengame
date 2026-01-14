
import React from 'react';

interface VoiceIndicatorProps {
  isActive: boolean;
  color: string;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isActive, color }) => {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${color} ${
            isActive ? 'animate-bounce' : 'h-1 opacity-50'
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isActive ? `${Math.random() * 20 + 10}px` : '4px'
          }}
        />
      ))}
    </div>
  );
};

export default VoiceIndicator;
