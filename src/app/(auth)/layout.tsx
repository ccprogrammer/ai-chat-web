export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] min-h-[100vh] items-center justify-center bg-gh-bg-subtle px-3 py-4 sm:px-4 sm:py-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
