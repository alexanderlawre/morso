import Image from "next/image";

// Renders both the black and white wordmark SVGs and lets CSS (see
// .wordmark-light/.wordmark-dark in globals.css, keyed off the
// html[data-theme] attribute) show the right one. Pure CSS instead of
// picking a src in JS so it works identically in server and client
// components with zero hydration-mismatch/flash risk — the browser
// already knows which one to paint before anything executes.
export function Wordmark({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <>
      <Image
        src="/brand/svg/wordmark-black.svg"
        alt="Morso"
        width={864}
        height={286}
        className={`wordmark-light ${className ?? ""}`}
        priority={priority}
      />
      <Image
        src="/brand/svg/wordmark-white.svg"
        alt="Morso"
        width={864}
        height={286}
        className={`wordmark-dark ${className ?? ""}`}
        priority={priority}
      />
    </>
  );
}
