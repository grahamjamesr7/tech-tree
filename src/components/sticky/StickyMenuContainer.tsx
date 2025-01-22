import React, { ReactNode } from "react";

export default function StickyMenuContainer({
  isVisible,
  children,
}: {
  isVisible: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute -left-20 top-0 ml-5 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 items-center">
        {children}
      </div>
    </div>
  );
}
