"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(
  () => import("react-lottie-player").then((mod) => mod.default),
  { ssr: false }
);

export default function LottiePlayerClient(
  props: React.ComponentProps<typeof Lottie>
) {
  return <Lottie {...props} />;
}