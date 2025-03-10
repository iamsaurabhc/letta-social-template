import React from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Share2, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30" />
        <div className="relative mx-auto max-w-screen-xl px-4 py-28 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block">Automate Your</span>
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Social Media Presence
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              Leverage AI-powered agents to create, schedule, and manage your social media content across all platforms. Stay ahead of the curve with intelligent automation.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-opacity"
              >
                <Link href="/dashboard/automation">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-blue-200 dark:border-blue-800"
              >
                <Link href="/dashboard">
                  View Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our AI Social Automation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl transform group-hover:scale-[1.02] transition-transform" />
              <div className="relative p-6 space-y-4">
                <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Bot className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold">Intelligent Agents</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI-powered agents that understand your brand voice and create engaging content automatically.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl transform group-hover:scale-[1.02] transition-transform" />
              <div className="relative p-6 space-y-4">
                <div className="inline-block p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold">Smart Automation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Set up automated posting schedules and let our AI handle content creation and optimization.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl transform group-hover:scale-[1.02] transition-transform" />
              <div className="relative p-6 space-y-4">
                <div className="inline-block p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Share2 className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold">Multi-Platform Support</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage all your social media accounts from one central dashboard with platform-specific optimization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500 to-indigo-500">
        <div className="mx-auto max-w-screen-xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Social Media Strategy?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using AI to streamline their social media presence and engage with their audience more effectively.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-white/90"
          >
            <Link href="/dashboard/automation">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}