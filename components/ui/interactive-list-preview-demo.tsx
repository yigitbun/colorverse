"use client";

import InteractiveListPreview from "@/components/ui/interactive-list-preview";

const items = [
  { client: "Aurora UI", platform: "Next.js", services: "Motion design, page transitions, UI systems", img: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=900&q=80" },
  { client: "Neon Flow", platform: "React", services: "Interactive UI, scroll animations, effects library", img: "https://images.unsplash.com/photo-1557682260-96773eb01377?auto=format&fit=crop&w=900&q=80" },
  { client: "Hyperiux", platform: "UI Library", services: "Animations, interactive components, futuristic experiences", img: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?auto=format&fit=crop&w=900&q=80" },
];

export default function InteractiveListPreviewDemo() {
  return <InteractiveListPreview items={items} bgColor="#11131b" />;
}
