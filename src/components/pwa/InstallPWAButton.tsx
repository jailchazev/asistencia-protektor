"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const canInstall = useMemo(() => !!deferredPrompt && !isInstalled, [deferredPrompt, isInstalled]);

  useEffect(() => {
    // Detectar si ya está instalada (standalone)
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        // iOS Safari
        (window.navigator as any).standalone === true;

      setIsInstalled(!!isStandalone);
    };

    checkInstalled();

    // Si el navegador soporta beforeinstallprompt (Chrome/Edge Android)
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // 🔥 Importante: evita el mini-infobar automático
      setIsSupported(true);
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    // Re-check por si cambia el display-mode
    const interval = setInterval(checkInstalled, 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      clearInterval(interval);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    // Si aceptó, ya se instalará (y appinstalled se dispara)
    if (choice.outcome !== "accepted") {
      // Si lo rechazó, igual limpiamos para evitar bugs
      setDeferredPrompt(null);
    }
  };

  // Si ya está instalada, no mostrar nada
  if (isInstalled) return null;

  // Si no lo soporta (Safari iOS, algunos navegadores), muestra guía mínima
  if (!isSupported && typeof window !== "undefined") {
    return (
      <div className="text-sm text-gray-600">
        Si no ves “Instalar”, abre el menú ⋮ del navegador y elige{" "}
        <b>“Agregar a pantalla de inicio”</b>.
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={!canInstall}
      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${
        canInstall
          ? "bg-primary-600 text-white border-primary-600 hover:bg-primary-700"
          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
      }`}
    >
      Instalar App
    </button>
  );
}
