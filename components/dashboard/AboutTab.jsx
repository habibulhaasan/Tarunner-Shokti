"use client";

import { Layers, ShieldCheck, Link2, Mail, Target, Eye, Rocket, MessageCircle } from "lucide-react";

const APP_VERSION = "1.0.0"; // TODO: রিলিজ অনুযায়ী আপডেট করুন

export default function AboutTab() {
  return (
    <div className="about-tab">
      <div className="about-card about-card-full">
        <h2>তারুণ্যের শক্তি ফার্মাসিস্ট পরিষদ</h2>
        <div className="about-version">ভার্সন {APP_VERSION}</div>
        <p className="about-description">
          দেশজুড়ে ফার্মাসিস্টদের পেশাগত মর্যাদা, কল্যাণ ও ঐক্যের জন্য একটি অভিন্ন
          ডিজিটাল প্ল্যাটফর্ম — যেখানে সকল সদস্য পরস্পরের সাথে যুক্ত থাকতে পারেন।
        </p>
      </div>

      <div className="about-card">
        <h3><Target size={16} /> লক্ষ্য</h3>
        <p className="about-description">
          দেশের সকল ফার্মাসিস্টকে একটি ঐক্যবদ্ধ ও শক্তিশালী নেটওয়ার্কের আওতায়
          নিয়ে আসা, পেশাগত মর্যাদা ও কল্যাণ নিশ্চিত করা এবং স্বাস্থ্যসেবা খাতে
          ইতিবাচক ভূমিকা রাখা।
        </p>
      </div>

      <div className="about-card">
        <h3><Eye size={16} /> ভিশন</h3>
        <p className="about-description">
          এমন একটি বাংলাদেশ গড়া, যেখানে প্রতিটি ফার্মাসিস্ট যোগ্য পেশাগত মর্যাদা,
          নিরাপদ কর্মপরিবেশ ও সমান সুযোগ পাবেন — এবং তরুণ ফার্মাসিস্টরাই নেতৃত্ব
          দেবেন দেশের ভবিষ্যৎ স্বাস্থ্যখাতে।
        </p>
      </div>

      <div className="about-card">
        <h3><Rocket size={16} /> ভবিষ্যৎ পরিকল্পনা</h3>
        <ul className="about-list">
          <li>নিয়মিত রক্তদান ক্যাম্প ও স্বাস্থ্য সচেতনতা কর্মসূচি</li>
          <li>সদস্য কল্যাণ তহবিল সম্প্রসারণ ও স্বচ্ছ হিসাব-নিকাশ</li>
          <li>পেশাগত প্রশিক্ষণ, সেমিনার ও কর্মশালা আয়োজন</li>
          <li>সরকারি-বেসরকারি পর্যায়ে ফার্মাসিস্টদের অধিকার আদায়ে প্রতিনিধিত্ব</li>
        </ul>
      </div>

      <div className="about-card">
        <h3><Layers size={16} /> আপনি এখানে যা করতে পারবেন</h3>
        <ul className="about-list">
          <li>সদস্য ডিরেক্টরি — বিভাগ, কর্মস্থল, ঠিকানা অনুযায়ী ফিল্টার করে খুঁজুন</li>
          <li>রক্তদানের তথ্য যোগ করুন, পরবর্তী রক্তদানের তারিখ ট্র্যাক করুন</li>
          <li>কল্যাণ তহবিলে অনুদান দিন এবং ব্যয়ের হিসাব দেখুন</li>
          <li>পরিচালনা পরিষদের সদস্য ও তাদের দায়িত্ব দেখুন</li>
          <li>অফিসিয়াল স্মারক ও নোটিশ দেখুন ও প্রিন্ট করুন</li>
          <li>দ্রুত খুঁজে পাওয়ার জন্য সদস্যদের ফেভারিটে যুক্ত করুন</li>
          <li>রিয়াল টাইম নোটিফিকেশন এবং সরাসরি ফিডব্যাক পাঠানোর সুবিধা</li>
        </ul>
      </div>

      <div className="about-card about-card-full about-security-note">
        <h3><ShieldCheck size={16} /> গোপনীয়তা ও তথ্য নিরাপত্তা</h3>
        <p>
          ডিরেক্টরিতে আপনার প্রয়োজনীয় তথ্য আপনি নিজে (মাই প্রোফাইলের
          প্রাইভেসি টগল থেকে) অন/অফ করতে পারবেন। নাম,
          ব্লাড গ্রুপ, ডিপার্টমেন্ট, সেশনের মতো লকড ফিল্ডগুলো সদস্যদের তথ্যের
          সঠিকতা বজায় রাখতে শুধুমাত্র অ্যাডমিন পরিবর্তন করতে পারেন — আপনার
          প্রোফাইলে ঠিক কী তথ্য সংরক্ষিত আছে তা সবসময় মাই প্রোফাইল ট্যাব থেকে
          দেখতে পারবেন। আপনার সংরক্ষিত তথ্য শুধুমাত্র তৃতীয় পক্ষের নিকট শেয়ার করা হবে না।
        </p>
      </div>

      <div className="about-card about-card-full">
        <h3>ডেভেলপার</h3>
        {/* TODO: প্রকৃত ডেভেলপার তথ্য দিয়ে প্রতিস্থাপন করুন */}
        <div className="about-dev-name">Habibul Hasan Hasib</div>
        <div className="about-dev-role">Ex-Student</div>
        <div className="about-dev-links">
          <a href="https://facebook.com/habibulhaasan" target="_blank" rel="noopener noreferrer" className="about-dev-link">
            <Link2 size={15} /> facebook.com/habibulhaasan
          </a>
          <a href="mailto:hasanthp@gmail.com" className="about-dev-link">
            <Mail size={15} /> hasanthp@gmail.com
          </a>
          <a href="https://wa.me/8801601767234" target="_blank" rel="noopener noreferrer" className="about-dev-link">
            <MessageCircle size={15} /> 01601767234 (WhatsApp)
          </a>
        </div>
      </div>
    </div>
  );
}
