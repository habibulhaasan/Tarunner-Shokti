import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import RouteGuard from "../components/RouteGuard";

export const metadata = {
  title: "তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ",
  description: "তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ-এর সদস্যদের জন্য অভিন্ন প্ল্যাটফর্ম।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RouteGuard>{children}</RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
