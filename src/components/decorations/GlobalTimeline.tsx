import React from "react";

const GlobalTimeline: React.FC = () => {
  return (
    <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
      <div className="h-full w-8 relative flex flex-col">
        {/* "Now" label at top */}
        <div className="py-4">
          <div className="text-sm text-center font-bold text-white">
            Now
          </div>
        </div>

        {/* Timeline line container */}
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <svg className="h-full w-full" preserveAspectRatio="xMidYStretch">
              {/* Timeline line */}
              <line
                x1="50%"
                y1="0"
                x2="50%"
                y2="100%"
                stroke="#94a3b8"
                strokeWidth="3"
                strokeDasharray="25,25"
              />
            </svg>
          </div>
        </div>

        {/* "Future" label at bottom */}
        <div className="py-4">
          <div className="text-sm text-center font-bold text-white">
            Future
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalTimeline;
