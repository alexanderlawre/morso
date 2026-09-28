"use client";

// App-wide loading indicator: the real Morso brand mark (a serif "M" with
// a leaf sprouting from it — see scripts/brand-source/mark-source.png,
// the approved artwork; same traced path as public/brand/svg/mark-*.svg and
// the favicon), gently pulsing in place.
const GLYPH_VIEWBOX = "0 0 323 288";
const GLYPH_PATH =
  "M 285.500 1.137 C 245.749 6.158, 217.502 27.616, 209.076 59.191 C 206.829 67.610, 205.991 77.500, 207.525 77.500 C 208.089 77.500, 212.648 73, 217.657 67.500 C 228.250 55.869, 240.535 45.073, 249.234 39.750 C 257.299 34.815, 258.501 34.982, 251.840 40.112 C 245.950 44.648, 215 75.677, 215 77.046 C 215 78.592, 243.063 75.010, 255.348 71.896 C 290.130 63.081, 311.848 46.363, 319.957 22.162 C 322.112 15.731, 323.111 3.532, 321.671 1.250 C 320.741 -0.223, 296.856 -0.297, 285.500 1.137 M 9 89.854 L 9 95.731 15.874 96.223 C 23.533 96.771, 29.452 99.231, 32.182 103 C 35.797 107.992, 36.098 114.972, 35.776 186.218 C 35.440 260.666, 35.523 259.485, 30.228 265.196 C 27.450 268.193, 20.952 270, 12.951 270 L 8 270 8 275.500 L 8 281 45 281 L 82 281 82 275.644 L 82 270.289 74.556 269.726 C 63.295 268.874, 59.144 265.999, 56.791 257.423 C 55.097 251.247, 54.446 121.649, 56.112 122.204 C 56.813 122.438, 72.487 158.253, 90.943 201.793 L 124.500 280.956 133.618 280.978 L 142.736 281 175.762 201.785 C 193.927 158.217, 209.301 122.400, 209.928 122.191 C 210.774 121.909, 210.994 139.233, 210.783 189.656 C 210.510 255.197, 210.432 257.636, 208.500 261.500 C 205.903 266.694, 201.155 268.991, 191.513 269.720 L 184 270.289 184 275.644 L 184 281 229.500 281 L 275 281 275 275.645 L 275 270.290 268.089 269.711 C 259.777 269.014, 254.207 266.373, 251.500 261.845 C 249.548 258.580, 249.500 256.718, 249.500 183.968 C 249.500 113.709, 249.606 109.202, 251.342 105.350 C 253.756 99.997, 258.884 97.122, 267.444 96.323 L 274 95.711 274 89.855 L 274 84 239.122 84 L 204.243 84 197.122 101.250 C 193.206 110.737, 179.961 142.997, 167.690 172.937 C 155.420 202.877, 144.937 227.521, 144.395 227.702 C 143.854 227.882, 130.109 195.736, 113.852 156.265 L 84.293 84.500 46.647 84.238 L 9 83.976 9 89.854";

function GlyphMark({ color }: { color: string }) {
  return <path d={GLYPH_PATH} fill={color} fillRule="evenodd" />;
}

/**
 * App-wide loading indicator. Renders the Morso leaf-mark in a gentle
 * pulse loop, in a fixed color per theme, so every loading state in the
 * app looks the same.
 */
export function LoadingOrb({
  size = 20,
  theme = "light",
  className,
  "aria-label": ariaLabel,
}: {
  size?: 20 | 64;
  /** Mark color: "light" = near-black (default, for light backgrounds),
   * "dark" = white (for dark backgrounds, e.g. the black Apple button). */
  theme?: "light" | "dark";
  className?: string;
  "aria-label"?: string;
}) {
  const color = theme === "dark" ? "#FFFFFF" : "#101010";

  return (
    <svg
      width={size}
      height={size}
      viewBox={GLYPH_VIEWBOX}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={className}
    >
      <g className="animate-loading-mark">
        <GlyphMark color={color} />
      </g>
    </svg>
  );
}
