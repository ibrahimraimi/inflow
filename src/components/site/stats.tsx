"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Globe, 
  Github, 
  Activity, 
  Eye, 
  Layout 
} from "lucide-react";

interface StatItemProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: React.ElementType;
}

const StatItem = ({ label, value, suffix = "", decimals = 0, icon: Icon }: StatItemProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = value;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentCount = easedProgress * end;
      setDisplayValue(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value]);

  return (
    <div ref={countRef} className="flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-lg p-2 text-primary border">
        <Icon size={24} className="text-primary/50" />
      </div>
      <div className="text-4xl font-bold tracking-tight text-foreground">
        {displayValue.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

export function StatsSection() {
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const res = await fetch("https://api.github.com/repos/ibrahimraimi/inflow");
        const data = await res.json();
        if (data.stargazers_count) {
          setGithubStars(data.stargazers_count);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error);
      }
    };

    fetchStars();
  }, []);

  const stats = [
    {
      label: "Websites tracked",
      value: 100,
      suffix: "+",
      icon: Layout,
    },
    {
      label: "Page views analyzed",
      value: 2200,
      suffix: "+",
      valueTransform: (v: number) => 22, // Since suffix is M+
      displayValue: 22,
      icon: Eye,
    },
    {
      label: "Countries",
      value: 100,
      suffix: "+",
      icon: Globe,
    },
    {
      label: "GitHub stars",
      value: githubStars || 2,
      suffix: "",
      displayValue: 2,
      decimals: 1,
      icon: Github,
    },
    {
      label: "Uptime",
      value: 99.9,
      suffix: "%",
      decimals: 1,
      icon: Activity,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by developers and business worldwide
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, idx) => (
            <StatItem 
              key={idx}
              label={stat.label}
              value={stat.displayValue ?? stat.value}
              suffix={stat.suffix}
              decimals={stat.decimals}
              icon={stat.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
