"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  Shield,
  Zap,
  Globe,
  UserCheck,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Manage Courses",
    description:
      "Create, organize, and track all your educational content in one place.",
  },
  {
    icon: Users,
    title: "Student Management",
    description:
      "Track student progress, attendance, and performance with detailed analytics.",
  },
  {
    icon: GraduationCap,
    title: "Teacher Tools",
    description:
      "Powerful tools for creating assignments, grading, and managing classes.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Real-time insights and reports to help you make data-driven decisions.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security to protect your data and privacy.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Lightning-fast performance with 99.9% uptime guarantee.",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "School Administrator",
    content:
      "This platform has transformed how we manage our school. The admin dashboard is intuitive and powerful.",
  },
  {
    name: "Michael Chen",
    role: "High School Teacher",
    content:
      "Creating and managing courses has never been easier. My students love the interface too!",
  },
  {
    name: "Emma Williams",
    role: "University Student",
    content:
      "The student dashboard is so clean and easy to use. I can track all my courses and assignments in one place.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small schools",
    features: [
      "Up to 100 students",
      "5 courses",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Professional",
    price: "$49/month",
    description: "Best for growing institutions",
    features: [
      "Unlimited students",
      "Unlimited courses",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LMS Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Modern Learning Management System
          </h1>
          <p className="text-xl text-muted-foreground">
            Empower your educational institution with a comprehensive platform
            designed for administrators, teachers, and students.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Everyone
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage your educational institution
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card/80 backdrop-blur-md border border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Who is this for Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Who is this for?
          </h2>
          <p className="text-lg text-muted-foreground">
            Designed for every role in your educational institution
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/80 backdrop-blur-md border border-border/50">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete control over your LMS. Manage users, courses, generate
                reports, and configure system settings.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-md border border-border/50">
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create engaging courses, manage classes, track attendance, and
                grade assignments efficiently.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-md border border-border/50">
            <CardHeader>
              <UserCheck className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Easy access to your courses, assignments, and progress. Learn at
                your own pace with our intuitive interface.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className="bg-card/80 backdrop-blur-md border border-border/50 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="text-4xl font-bold">{plan.price}</div>
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground">
            See how our platform is transforming education
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-card/80 backdrop-blur-md border border-border/50"
            >
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  &quot;{testimonial.content}&quot;
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-md border border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-lg">
              Join thousands of educational institutions using our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-md border-t border-border/50">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">LMS Platform</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering educational institutions worldwide
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Updates
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 LMS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
