export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gh-bg-subtle px-3 py-6 sm:px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
