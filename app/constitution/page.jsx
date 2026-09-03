import Link from "next/link";
import Image from "next/image";
import { Download, FileText } from "lucide-react";

const CONSTITUTION_ID = "1I6JF6EugtF3e7Y9-y7rGXXVsMTiM98Xn";
const CONSTITUTION_PREVIEW_URL = `https://drive.google.com/file/d/${CONSTITUTION_ID}/preview`;
const CONSTITUTION_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${CONSTITUTION_ID}`;

export const metadata = {
  title: "সংগঠনের গঠনতন্ত্র | তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ",
  description: "তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ-এর সংগঠনের গঠনতন্ত্র পড়ুন।",
};

export default function ConstitutionPage() {
  return (
    <div className="landing-shell constitution-shell">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div className="landing-nav-logo-wrap">
              <Image src="/logo.png" alt="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ" fill className="landing-nav-logo" sizes="36px" priority />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span className="landing-brand-text" style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", lineHeight: "1.2", textDecoration: "none" }}>
                তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ
              </span>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#64748b", marginTop: "2px", textDecoration: "none" }}>
                অরাজনৈতিক ও তরুণ পেশাজীবি সংগঠন
              </span>
            </div>
          </Link>
        </div>
        <div className="landing-nav-actions">
          <Link href="/#mission" className="landing-nav-link">লক্ষ্য ও ভিশন</Link>
          <Link href="/about-us" className="landing-nav-link">আমাদের কথা</Link>
          <Link href="/committee" className="landing-nav-link">কমিটি</Link>
          <Link href="/notices" className="landing-nav-link">নোটিশ</Link>
          <Link href="/constitution" className="landing-nav-link active">গঠনতন্ত্র</Link>
          <Link href="/#contact" className="landing-nav-link">যোগাযোগ</Link>
          <Link href="/login" className="landing-nav-link">লগ ইন</Link>
          <Link href="/register" className="btn landing-nav-cta">রেজিস্টার</Link>
        </div>
      </nav>

      <main className="constitution-main">
        <div className="constitution-heading">
          <div>
            <span className="section-subtitle">প্রাতিষ্ঠানিক দলিল</span>
            <h1 className="landing-section-title">সংগঠনের গঠনতন্ত্র</h1>
          </div>
          <a className="btn btn-primary-blue constitution-download" href={CONSTITUTION_DOWNLOAD_URL} download>
            <Download size={17} />
            ডাউনলোড করুন
          </a>
        </div>

        <div className="constitution-viewer-wrap">
          <div className="constitution-viewer-label">
            <FileText size={18} />
            <span>গঠনতন্ত্র পড়ুন</span>
          </div>
          <iframe
            className="constitution-viewer"
            src={CONSTITUTION_PREVIEW_URL}
            title="তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ-এর গঠনতন্ত্র"
            allow="autoplay"
          />
        </div>
      </main>

      <footer className="landing-footer">
        © {new Date().getFullYear()} তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ। সর্বস্বত্ব সংরক্ষিত।
        <span className="landing-footer-developer">
          Developed by <strong>Code Caplet™</strong> · <a href="mailto:lab.codecaplet@gmail.com">lab.codecaplet@gmail.com</a>
        </span>
      </footer>
    </div>
  );
}
