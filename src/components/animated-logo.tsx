"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SESSION_KEY = "morso-title-intro-shown";

// Renders without the animation class during SSR/first paint (avoids a
// hydration mismatch), then adds it post-mount only the first time this
// browser session sees the header — subsequent navigations within the same
// session don't replay it.
export function AnimatedLogo() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setAnimate(true);
  }, []);

  return (
    <Link
      href="/dashboard"
      className={`-my-2 -ml-1 flex items-center rounded-lg px-1 py-2 ${
        animate ? "animate-title-intro" : ""
      }`}
    >
      <Image
        src="/brand/svg/wordmark-black.svg"
        alt="Morso"
        width={864}
        height={286}
        className="h-7 w-auto"
        priority
      />
    </Link>
  );
}
