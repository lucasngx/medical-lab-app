import LoginLayout from "@/components/layout/LoginLayout";

export default function RootLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LoginLayout>{children}</LoginLayout>;
}
