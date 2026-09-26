"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import GlassActionButton from "@/components/GlassActionButton";

const UNAVAILABLE = "Kamera tidak tersedia pada perangkat atau browser ini.";

function cameraErrorMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : "";
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "Akses kamera ditolak. Izinkan akses kamera pada browser untuk menggunakan fitur ini.";
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return UNAVAILABLE;
    case "NotReadableError":
    case "TrackStartError":
      return "Kamera tidak dapat digunakan. Tutup aplikasi lain yang menggunakan kamera, lalu coba lagi.";
    default:
      return "Kamera gagal dibuka. Silakan tutup kamera dan coba lagi.";
  }
}

type CameraCaptureProps = {
  disabled?: boolean;
  onCapture: (file: File) => void;
};

export default function CameraCapture({ disabled, onCapture }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const openCamera = () => {
    if (disabled) return;
    const input = inputRef.current;
    // Native capture is a browser hint, so use it only on touch-first devices
    // that expose capture support. Mouse/hover desktops always use a webcam.
    const supportsNativeCapture = input && "capture" in input &&
      navigator.maxTouchPoints > 0 &&
      window.matchMedia("(pointer: coarse) and (hover: none)").matches;

    if (supportsNativeCapture) {
      input.click();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openCamera}
        className="cursor-pointer rounded-3xl fd-upload border-dashed border flex flex-col items-center justify-center gap-3 md:gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Camera className="w-8 h-8 text-muted" />
        <span className="text-sm font-semibold text-secondary">Kamera</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file && !disabled) onCapture(file);
        }}
      />
      {isOpen && <CameraModal onCapture={onCapture} onClose={closeModal} />}
    </>
  );
}

function CameraModal({ onCapture, onClose }: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);
  const capturingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const close = useCallback(() => {
    activeRef.current = false;
    stopCamera();
    dialogRef.current?.close();
    onClose();
  }, [onClose, stopCamera]);

  useEffect(() => {
    let cancelled = false;
    activeRef.current = true;
    const dialog = dialogRef.current;
    const video = videoRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";

    const startCamera = async () => {
      try {
        if (!window.isSecureContext) {
          setError("Kamera memerlukan koneksi HTTPS atau localhost. Buka halaman melalui koneksi yang aman.");
          return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          setError(UNAVAILABLE);
          return;
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false,
          });
        } catch (error) {
          if (cancelled || !activeRef.current) return;
          // Retry only camera/constraint failures, never a denied permission.
          if (!(error instanceof Error) ||
            !["NotFoundError", "OverconstrainedError"].includes(error.name)) {
            throw error;
          }
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        // A permission prompt may resolve after closing or leaving the page.
        if (cancelled || !activeRef.current || !video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        stream.getVideoTracks().forEach((track) => {
          track.addEventListener("ended", () => {
            if (cancelled || !activeRef.current) return;
            stopCamera();
            setIsReady(false);
            setError("Koneksi kamera terputus. Silakan tutup kamera dan coba lagi.");
          }, { once: true });
        });
        video.srcObject = stream;
        await video.play();
      } catch (error) {
        if (cancelled || !activeRef.current) return;
        stopCamera();
        setIsReady(false);
        setError(cameraErrorMessage(error));
      }
    };

    void startCamera();
    window.addEventListener("pagehide", close);
    return () => {
      cancelled = true;
      activeRef.current = false;
      window.removeEventListener("pagehide", close);
      stopCamera();
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [close, stopCamera]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!activeRef.current || capturingRef.current || !isReady || !video ||
      video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

    capturingRef.current = true;
    setIsCapturing(true);
    setError(null);
    const captureFailed = () => {
      if (!activeRef.current) return;
      capturingRef.current = false;
      setIsCapturing(false);
      setError("Foto gagal diambil. Silakan coba lagi.");
    };

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        captureFailed();
        return;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!activeRef.current) return;
        if (!blob) {
          captureFailed();
          return;
        }
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        close();
        onCapture(file);
      }, "image/jpeg", 0.92);
    } catch {
      captureFailed();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="camera-title"
      aria-describedby="camera-description"
      className="m-auto w-[calc(100%-2rem)] max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border fd-surface fd-elevated text-foreground p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 id="camera-title" className="text-lg font-bold">Kamera</h2>
          <button type="button" aria-label="Tutup kamera" onClick={close} className="fd-button rounded-full p-3">
            <X size={20} />
          </button>
        </div>
        <p id="camera-description" className="text-sm text-secondary mb-4">Arahkan kamera ke ikan, lalu ambil foto untuk dianalisis.</p>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-label="Pratinjau kamera"
            className="h-full w-full object-contain"
            onPlaying={() => {
              const video = videoRef.current;
              if (activeRef.current && streamRef.current && video?.videoWidth && video.videoHeight) setIsReady(true);
            }}
          />
          {!isReady && !error && <p role="status" className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-white">Menyiapkan kamera. Izinkan akses jika diminta.</p>}
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <GlassActionButton
          fullWidth
          onClick={capturePhoto}
          disabled={!isReady || isCapturing}
          loading={isCapturing}
          loadingLabel="Mengambil foto..."
          icon={<Camera size={18} />}
          className="mt-5 py-4"
        >
          Ambil Foto
        </GlassActionButton>
        <p className="mt-3 text-center text-xs text-secondary">Anda juga dapat menutup kamera dan memilih foto melalui Galeri.</p>
      </div>
    </dialog>
  );
}