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
      <div className="bg-slate-800 rounded-lg shadow-xl p-2 flex flex-col gap-2 items-center border border-slate-600">
        {children}
      </div>
    </div>
  );
}
