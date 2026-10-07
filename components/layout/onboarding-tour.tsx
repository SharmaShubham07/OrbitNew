"use client";

import * as React from "react";
import { Sparkles, CheckCircle2, Circle, ArrowRight, X, User, Users, PenTool, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    // Check if user has seen onboarding tour in localStorage
    const seen = localStorage.getItem("orbit_tour_completed");
    if (!seen) {
      // Delay slightly for initial page load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to Orbit",
      subtitle: "Editorial Social for High-Craft Professionals",
      description: "Orbit is structured around Domain Circles instead of generic feeds. Experience warm typography, high-signal discussions, and magazine-grade post layouts.",
      icon: Sparkles,
      actionLabel: "Explore Features",
    },
    {
      title: "Post Template Studio",
      subtitle: "Craft 16+ Editorial Layouts",
      description: "Create pull quotes, book reviews, milestone posters, and carousels with on-canvas live editing and instant PNG export.",
      icon: Layout,
      actionLabel: "Next Step",
    },
    {
      title: "Interactive Network & Circles",
      subtitle: "Connect with Verified Peers",
      description: "Discover experts within your domain circle, collaborate, and exchange direct messages seamlessly.",
      icon: Users,
      actionLabel: "Complete Tour",
    },
  ];

  const handleFinish = () => {
    localStorage.setItem("orbit_tour_completed", "true");
    setIsOpen(false);
    setIsDismissed(true);
  };

  if (!isOpen || isDismissed) return null;

  const current = steps[currentStep];
  const Icon = current.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-6 rounded-3xl bg-surface border-2 border-primary shadow-editorial-lift animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-primary">
            STEP {currentStep + 1} OF {steps.length}
          </span>
        </div>
        <IconButton label="Close tour" size="sm" onClick={handleFinish}>
          <X className="w-3.5 h-3.5" />
        </IconButton>
      </div>

      <div className="space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <Icon className="w-5 h-5" />
        </div>

        <div>
          <h4 className="font-serif text-lg font-bold text-foreground">
            {current.title}
          </h4>
          <p className="font-mono text-[11px] text-primary uppercase tracking-wide">
            {current.subtitle}
          </p>
        </div>

        <p className="text-xs text-muted-text leading-relaxed">
          {current.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-border-hairline flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                currentStep === idx ? "w-4 bg-primary" : "bg-border-hairline"
              }`}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep((p) => p + 1);
            } else {
              handleFinish();
            }
          }}
          className="gap-1.5 text-xs font-mono"
        >
          <span>{current.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
