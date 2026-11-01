"use client";

import { useEffect, useRef, useState } from "react";
import type { Result } from "@zxing/library";

export default function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let reader: InstanceType<typeof import("@zxing/library").BrowserMultiFormatReader> | null = null;

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/library");
        reader = new BrowserMultiFormatReader();
        if (stopped || !videoRef.current) return;
        await reader.decodeFromVideoDevice(null, videoRef.current, (result: Result | undefined, err) => {
          if (result) {
            onDetected(result.getText());
          }
          // err fires continuously while nothing is found — ignore it, it's not fatal
          void err;
        });
      } catch {
        if (!stopped) setError("Couldn't access the camera. Check your browser's camera permission and try again.");
      }
    }

    start();

    return () => {
      stopped = true;
      reader?.reset();
    };
  }, [onDetected]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div className="card p-5 max-w-sm w-full">
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">Scan barcode</p>
          <button onClick={onClose} className="btn-ghost rounded-full px-3 py-1.5 text-xs">
            Close
          </button>
        </div>
        {error ? (
          <p className="text-sm text-[color:var(--ink-dim)]">{error}</p>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              style={{ aspectRatio: "4/3", background: "#000" }}
              muted
              autoPlay
            />
            <p className="text-xs text-[color:var(--ink-faint)] mt-2 text-center">
              Point your camera at the product barcode
            </p>
          </>
        )}
      </div>
    </div>
  );
}
