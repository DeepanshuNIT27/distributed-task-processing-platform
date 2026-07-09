import { Server, Cpu, Layers, Activity } from "lucide-react";

export default function AuthIllustration() {
  return (
    <div className="hidden lg:flex flex-col justify-center p-12 bg-[#050816] border-r border-slate-800 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C3AED]/20 blur-[100px] rounded-full mix-blend-screen" />

      <div className="relative z-10 max-w-lg mx-auto">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A855F7] mb-6">
          Distributed Image Processing Platform
        </h1>
        <p className="text-slate-400 text-lg mb-12">
          A high-performance system powered by Redis queues and background
          worker pools to scale your image processing tasks.
        </p>

        <div className="space-y-6">
          <FeatureCard
            icon={<Activity className="text-[#A855F7]" />}
            title="Real-time Updates"
            desc="Socket.io integration for live task status and timeline updates."
          />
          <FeatureCard
            icon={<Layers className="text-[#7C3AED]" />}
            title="Redis Queue Powered"
            desc="Robust job management using BullMQ for fault tolerance."
          />
          <FeatureCard
            icon={<Cpu className="text-[#A855F7]" />}
            title="Background Workers"
            desc="Dedicated worker pools to handle heavy image processing seamlessly."
          />
          <FeatureCard
            icon={<Server className="text-[#7C3AED]" />}
            title="Scalable Architecture"
            desc="Built for high concurrency and enterprise-grade reliability."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
        {icon}
      </div>
      <div>
        <h3 className="text-slate-200 font-semibold">{title}</h3>
        <p className="text-slate-400 text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}
