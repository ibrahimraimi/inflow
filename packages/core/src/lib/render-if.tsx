type RenderIfProps = {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RenderIf({
  condition,
  children,
  fallback = null,
}: RenderIfProps) {
  return condition ? <>{children}</> : <>{fallback}</>;
}
