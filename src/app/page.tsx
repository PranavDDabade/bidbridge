"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { CheckCircle2, Zap, BarChart3, Lock, Mic2, TrendingUp } from "lucide-react";

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!role) router.replace("/onboarding");
    else router.replace(role === "buyer" ? "/buyer/dashboard" : "/seller/inbox");
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-amber-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
              BidBridge
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 text-amber-700 hover:text-amber-800 font-medium transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-200 transition-all font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            ✨ AI-Powered Procurement Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
              Connect Buyers & Sellers
            </span>
            <br />
            <span className="text-gray-900">Instantly Across Procurement</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Post material requests with voice input. Let AI extract the details. Receive competitive bids in real-time.
            Award the best offer with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-xl hover:shadow-amber-200 transition-all font-semibold text-lg"
            >
              Start Trading Now
            </Link>
            <button className="px-8 py-4 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-all font-semibold">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
            <div>
              <div className="text-3xl font-bold text-amber-700">2M+</div>
              <div className="text-gray-600 text-sm">RFQs Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-700">50K+</div>
              <div className="text-gray-600 text-sm">Active Traders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-700">92%</div>
              <div className="text-gray-600 text-sm">Satisfaction</div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl p-8 border border-amber-200 shadow-lg">
            <div className="bg-white rounded-lg p-6 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">For Buyers</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>✓ Post requests by voice or text</p>
                    <p>✓ AI extracts key details automatically</p>
                    <p>✓ Review & edit with confidence scores</p>
                    <p>✓ Receive & compare multiple bids</p>
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">For Sellers</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>✓ Browse open RFQs in real-time</p>
                    <p>✓ Submit competitive bids instantly</p>
                    <p>✓ Update bids while RFQ is active</p>
                    <p>✓ Track bid status & history</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Why Choose BidBridge?</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Everything you need for modern B2B procurement</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                <Mic2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Voice & Text Input</h3>
              <p className="text-gray-600">Describe what you need. We handle the rest. Works on any device.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Parsing</h3>
              <p className="text-gray-600">Gemini LLM extracts items, qty, location & deadline automatically.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Bids</h3>
              <p className="text-gray-600">Watch bids arrive instantly. Award the best offer in seconds.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Confidence Scores</h3>
              <p className="text-gray-600">See how confident the AI was. Review & edit before submitting.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600">ABAC rules prevent tampering. Your data stays protected.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Dashboard</h3>
              <p className="text-gray-600">Track RFQs, bids & activity. Real-time updates across devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Create RFQ</h3>
              <p className="text-gray-600 text-sm">Post your request using voice or text</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AI Extracts</h3>
              <p className="text-gray-600 text-sm">AI automatically parses details & assigns confidence</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Review & Edit</h3>
              <p className="text-gray-600 text-sm">Check details, edit if needed, submit</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                4
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Receive Bids</h3>
              <p className="text-gray-600 text-sm">Award the best offer instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Procurement?</h2>
          <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of buyers and sellers using BidBridge for faster, smarter procurement.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-amber-700 rounded-lg hover:shadow-xl transition-all font-bold text-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 py-12 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="font-bold text-amber-700">BidBridge</span>
              </div>
              <p className="text-gray-600 text-sm">AI-powered B2B marketplace</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-amber-600">Features</a></li>
                <li><a href="#" className="hover:text-amber-600">Pricing</a></li>
                <li><a href="#" className="hover:text-amber-600">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-amber-600">About</a></li>
                <li><a href="#" className="hover:text-amber-600">Blog</a></li>
                <li><a href="#" className="hover:text-amber-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-amber-600">Privacy</a></li>
                <li><a href="#" className="hover:text-amber-600">Terms</a></li>
                <li><a href="#" className="hover:text-amber-600">Help</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-200 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2026 BidBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}