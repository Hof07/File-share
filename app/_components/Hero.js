"use client"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PricingCards from "../(dashboard)/(routes)/upgrade/_components/Card";

function TypingEffect({ words }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (index === words.length) return;
    if (
      subIndex === words[index].length + 1 &&
      !reverse
    ) {
      setTimeout(() => setReverse(true), 1000);
      return;
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  useEffect(() => {
    const blinkTimeout = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkTimeout);
  }, []);

  return (
    <span>
      {`${words[index].substring(0, subIndex)}${blink ? "|" : " "}`}
    </span>
  );
}

function FAQItem({ question, answer, delay }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="border border-indigo-200 rounded-lg p-4 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="font-semibold text-indigo-700 flex justify-between items-center">
        {question}
        <span>{open ? "−" : "+"}</span>
      </div>
      {open && <p className="mt-2 text-gray-700">{answer}</p>}
    </motion.div>
  );
}

function StatisticCard({ number, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="bg-indigo-50 p-8 rounded-xl shadow-lg text-center"
    >
      <h3 className="text-4xl font-bold text-indigo-700">{number}</h3>
      <p className="text-indigo-500 mt-2">{label}</p>
    </motion.div>
  );
}

function TestimonialCard({ name, role, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto"
    >
      <p className="text-gray-700 italic mb-4">"{text}"</p>
      <div className="flex items-center space-x-4">
        <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
          {name[0]}
        </div>
        <div>
          <p className="font-semibold text-indigo-700">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function FullLandingPage() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-400 text-white min-h-screen flex flex-col justify-center items-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold mb-4"
        >
          Upload, Save,{" "}
          <TypingEffect words={["Share", "Protect", "Send"]} />
        </motion.h1>
        <p className="max-w-xl mx-auto text-lg mb-12">
          Secure and simple file sharing for everyone.
        </p>
        <button className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-indigo-50 transition">
          Get Started
        </button>
        <div className="absolute bottom-10 animate-bounce">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-screen-xl mx-auto px-6 sm:px-10 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-center text-gray-900 mb-12"
        >
          Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Easy Upload",
              desc: "Drag & drop files or select from your device instantly.",
              icon: "📁",
            },
            {
              title: "Secure Sharing",
              desc: "Optional password protection for your sensitive files.",
              icon: "🔒",
            },
            {
              title: "Fast Delivery",
              desc: "Generate links or send files via email quickly.",
              icon: "🚀",
            },
          ].map(({ title, desc, icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
            >
              <div className="text-5xl mb-4">{icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Supabase Section */}
      <section className="bg-indigo-50 py-20 px-6 sm:px-10">
  <motion.h2
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-4xl font-extrabold text-indigo-700 mb-12 text-center"
  >
    Why Choose Share.io?
  </motion.h2>
  <div className="max-w-4xl mx-auto space-y-8 text-gray-700 text-lg leading-relaxed">
    <motion.p
      initial={{ x: -50, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      Share.io is your reliable cloud file sharing platform that makes uploading, saving, and sharing files incredibly easy and secure.
    </motion.p>
    <motion.p
      initial={{ x: 50, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      Powered by Supabase’s realtime database and authentication, Share.io offers seamless performance with high security and real-time collaboration features.
    </motion.p>
    <motion.p
      initial={{ x: -50, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      Easily share files with password protection and email notifications, so your data stays safe and you stay connected.
    </motion.p>
    <motion.p
      initial={{ x: 50, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      With an intuitive interface and fast upload speeds, Share.io saves you time and hassle — making file sharing effortless for everyone.
    </motion.p>
    <motion.p
      initial={{ x: -50, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      Whether you’re sharing documents for work, photos with friends, or large media files, Share.io keeps your data private and accessible anywhere.
    </motion.p>
  </div>
</section>


      {/* Statistics Section */}
      <section className="py-20 bg-white px-6 sm:px-10">
        <motion.h2
          className="text-4xl font-extrabold text-center text-indigo-900 mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Our Impact
        </motion.h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <StatisticCard number="10K+" label="Files Shared" delay={0} />
          <StatisticCard number="5K+" label="Active Users" delay={0.2} />
          <StatisticCard number="99.9%" label="Uptime" delay={0.4} />
          <StatisticCard number="50+" label="Countries Served" delay={0.6} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-indigo-100 py-20 px-6 sm:px-10">
        <motion.h2
          className="text-4xl font-extrabold text-indigo-700 text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          What Users Say
        </motion.h2>
        <div className="max-w-6xl mx-auto space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
          <TestimonialCard
            name="Alice Johnson"
            role="Product Manager"
            text="Share.io made it effortless to send large files securely. Highly recommended!"
            delay={0}
          />
          <TestimonialCard
            name="Ravi Patel"
            role="Developer"
            text="Integrating Supabase was seamless, and the real-time updates are amazing."
            delay={0.2}
          />
          <TestimonialCard
            name="Sita Sharma"
            role="Designer"
            text="The UI is clean, and the upload speed is fantastic. Loved the experience!"
            delay={0.4}
          />
        </div>
      </section>
        
      <section>
  <motion.h1
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-4xl text-center mt-7 font-bold mb-8"
  >
    Pricing
  </motion.h1>

  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
  >
    <PricingCards />
  </motion.div>
</section>

      {/* FAQ Section */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-20">
        <motion.h2
          className="text-4xl font-extrabold text-center text-indigo-900 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FAQItem
            question="Is my data safe with Share.io?"
            answer="Yes, we use secure encryption and Supabase’s robust security features to protect your files."
            delay={0}
          />
          <FAQItem
            question="Do I need to create an account?"
            answer="No, you can upload and share files instantly without signing up."
            delay={0.1}
          />
          <FAQItem
            question="What file types can I upload?"
            answer="You can upload documents, images, videos, code files, and many more."
            delay={0.2}
          />
          <FAQItem
            question="Is there a file size limit?"
            answer="Currently, the max file size is 5GB per upload."
            delay={0.3}
          />
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="bg-indigo-600 text-white py-16 px-6 sm:px-10 text-center rounded-t-lg">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-4"
        >
          Stay Updated with Share.io
        </motion.h2>
        <p className="max-w-xl mx-auto mb-6">
          Join our newsletter to receive the latest features, updates, and offers.
        </p>
        <form
          className="flex justify-center max-w-md mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you for subscribing!");
            e.target.reset();
          }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="px-4 py-3 rounded-l-lg w-full max-w-sm text-indigo-900 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-white text-indigo-600 px-6 py-3 rounded-r-lg font-semibold hover:bg-indigo-50 transition"
          >
            Subscribe
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-indigo-200 px-6 sm:px-10 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-bold text-xl mb-4">About Share.io</h3>
            <p className="text-gray-300 text-sm">
              Share.io is a secure file sharing platform powered by Supabase and React. We believe in privacy, ease of use, and speed.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Contact Us</h3>
            <p className="text-sm">Email: support@share.io</p>
            <p className="text-sm mt-2">Phone: +91 123 456 7890</p>
            <p className="text-sm mt-2">Address: 123 Share Street, Mumbai, India</p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Follow Us</h3>
            <div className="flex space-x-4 text-indigo-300">
              <a href="#" aria-label="Facebook" className="hover:text-white transition">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 10-11.5 9.87v-7H8v-3h2.5v-2.3c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 3h-2.3v7A10 10 0 0022 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-white transition">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.1.85 4.52 4.52 0 001.97-2.5 9.14 9.14 0 01-2.9 1.1 4.52 4.52 0 00-7.7 4.12 12.8 12.8 0 01-9.3-4.7 4.52 4.52 0 001.4 6 4.48 4.48 0 01-2-.56v.06a4.52 4.52 0 003.6 4.43 4.48 4.48 0 01-2 .07 4.52 4.52 0 004.2 3.15 9 9 0 01-6.7 1.87 12.8 12.8 0 006.9 2.02c8.3 0 12.9-6.9 12.9-12.9v-.58A9.22 9.22 0 0023 3z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-white transition">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 3a1 1 0 110 2 1 1 0 010-2zm-5 2.5A4.5 4.5 0 1111.5 16 4.5 4.5 0 0112 7.5zM7 8a5 5 0 005 5 5 5 0 00-5-5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <p className="text-center mt-10 text-indigo-400 text-sm">
          &copy; {new Date().getFullYear()} Share.io. All rights reserved.
        </p>
      </footer>
    </>
  );
}
