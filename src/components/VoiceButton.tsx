"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SILENCE_MS = 1800;

export default function VoiceButton({
  onText,
  onLive,
}: {
  onText: (t: string) => void;
  onLive?: (t: string) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  const recRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const restartingRef = useRef(false);
  const finalRef = useRef("");
  const latestRef = useRef("");

  const onTextRef = useRef(onText);
  const onLiveRef = useRef(onLive);

  useEffect(() => {
    onTextRef.current = onText;
    onLiveRef.current = onLive;
  }, [onText, onLive]);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setSupported(!!SR);

    return () => {
      activeRef.current = false;

      if (timerRef.current) clearTimeout(timerRef.current);

      try {
        recRef.current?.abort();
      } catch {}

      recRef.current = null;
    };
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function finish() {
    if (!activeRef.current) return;

    activeRef.current = false;
    restartingRef.current = false;
    clearTimer();
    setListening(false);

    const rec = recRef.current;
    recRef.current = null;

    try {
      rec?.stop();
    } catch {}

    const result = (
      finalRef.current || latestRef.current
    ).trim();

    if (result) onTextRef.current(result);
  }

  function start() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR || activeRef.current) return;

    activeRef.current = true;
    restartingRef.current = false;
    finalRef.current = "";
    latestRef.current = "";
    setListening(true);

    function createRecognition() {
      if (!activeRef.current) return;

      const rec = new SR();
      rec.lang = "en-IN";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        let interim = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const text = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalRef.current += text + " ";
          } else {
            interim += text;
          }
        }

        const text = (
          finalRef.current + interim
        ).trim();

        latestRef.current = text;
        onLiveRef.current?.(text);

        // Restart the silence countdown after speech results.
        clearTimer();

        timerRef.current = setTimeout(() => {
          finish();
        }, SILENCE_MS);
      };

      rec.onerror = (event: any) => {
        if (
          event.error === "aborted" ||
          event.error === "no-speech"
        ) {
          return;
        }

        activeRef.current = false;
        clearTimer();
        setListening(false);

        toast.error(
          event.error === "not-allowed"
            ? "Allow microphone access in your browser settings."
            : event.error === "network"
              ? "Speech recognition needs an internet connection."
              : "Voice recognition failed. Please try again."
        );
      };

      rec.onend = () => {
        if (!activeRef.current || restartingRef.current) return;

        restartingRef.current = true;

        setTimeout(() => {
          restartingRef.current = false;

          if (activeRef.current) {
            createRecognition();
          }
        }, 200);
      };

      recRef.current = rec;

      try {
        rec.start();
      } catch {
        activeRef.current = false;
        setListening(false);
        toast.error("Could not start the microphone. Please try again.");
      }
    }

    createRecognition();
  }

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant={listening ? "destructive" : "outline"}
      onClick={() => (listening ? finish() : start())}
    >
      {listening ? "🎙️ Listening..." : "🎤 Speak"}
    </Button>
  );
}
