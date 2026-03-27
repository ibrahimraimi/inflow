import React from "react";

interface RenderIfProps {
  condition: boolean;
  children: React.ReactNode;
}

export const RenderIf: React.FC<RenderIfProps> = ({ condition, children }) => {
  if (!condition) return null;
  return <>{children}</>;
};
