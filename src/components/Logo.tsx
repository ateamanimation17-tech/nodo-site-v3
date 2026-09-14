export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <path
        d="M24 2 44 13v22L24 46 4 35V13z"
        stroke="url(#nodo-hex)"
        strokeWidth="1.4"
      />
      <path
        d="M15 32V16h3.4l11 12.2V16H33v16h-3.3L18.6 19.7V32z"
        fill="url(#nodo-n)"
      />
      <defs>
        <linearGradient id="nodo-hex" x1="4" y1="2" x2="44" y2="46">
          <stop offset="0" stopColor="#e8c874" />
          <stop offset="1" stopColor="#8f7527" />
        </linearGradient>
        <linearGradient id="nodo-n" x1="15" y1="16" x2="33" y2="32">
          <stop offset="0" stopColor="#e8c874" />
          <stop offset="1" stopColor="#c9a23c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
