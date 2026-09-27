import Image from "next/image";

const ICON_ASPECT = 1905 / 2000;

export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <Image
      src="/brand/logo-icon-cream.webp"
      alt="NODO"
      width={size}
      height={Math.round(size * ICON_ASPECT)}
      className="shrink-0"
      priority
    />
  );
}
