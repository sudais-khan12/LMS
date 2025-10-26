import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - LMS Platform",
  description: "Sign in or create an account to access your LMS dashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
