import { Button } from "@repo/ui/components/button";
import {
  Zap,
  Shield,
  BarChart3,
  Workflow,
  Globe,
  Lock,
  Layers,
  Cpu,
} from "lucide-react";

const FEATURES_TOP = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Sub-second response times with edge computing and smart caching.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption and SSO support.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Real-time dashboards and custom reports for data-driven decisions.",
  },
  {
    icon: Workflow,
    title: "Smart Automations",
    description:
      "AI-powered workflows that adapt to your team\u2019s processes.",
  },
] as const;

const FEATURES_BOTTOM = [
  {
    icon: Globe,
    title: "Global CDN",
    description: "Deploy to 200+ edge locations for worldwide performance.",
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Fine-grained permissions with role-based access management.",
  },
  {
    icon: Layers,
    title: "Version Control",
    description: "Built-in versioning with branching and merge capabilities.",
  },
  {
    icon: Cpu,
    title: "AI Assistant",
    description: "Intelligent suggestions that help your team move faster.",
  },
] as const;

export function DarkFeatures() {
  return (
    <div className="px-6 py-12">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-neutral-950 text-white">
        {/* First dark section */}
        <div className="px-8 pt-16 md:px-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-light tracking-tight md:text-5xl">
              Powerful under the hood
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Built for scale from day one. Every feature is designed to grow
              with your team and your ambitions.
            </p>
            <div className="mt-8">
              <Button
                variant="outline"
                className="rounded-full border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
              >
                Learn more
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <div className="flex items-center justify-center rounded-t-3xl border border-neutral-800 bg-neutral-900 px-8 py-24">
              <p className="text-sm text-neutral-500">
                Analytics Dashboard Preview
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES_TOP.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3">
                <feature.icon className="size-5 text-neutral-400" />
                <h3 className="text-sm font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Second dark section */}
        <div className="mt-24 px-8 pb-16 md:px-16">
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-light tracking-tight md:text-4xl">
                Designed for{" "}
                <span className="text-neutral-400">modern teams</span>
              </h2>
              <p className="text-lg leading-relaxed text-neutral-400">
                Every interaction is crafted to reduce friction and amplify your
                team&apos;s output. From onboarding to advanced workflows, Acme
                adapts to how you work.
              </p>
              <ul className="flex flex-col gap-3 text-sm text-neutral-400">
                <li>Collaborative editing in real-time</li>
                <li>Customizable workflows per team</li>
                <li>Integrates with 50+ tools out of the box</li>
              </ul>
            </div>

            <div className="flex items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900 px-8 py-24">
              <p className="text-sm text-neutral-500">Team Workspace Preview</p>
            </div>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES_BOTTOM.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3">
                <feature.icon className="size-5 text-neutral-400" />
                <h3 className="text-sm font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
