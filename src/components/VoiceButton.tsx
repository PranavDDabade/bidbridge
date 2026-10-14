"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function VoiceButton({ onText }: { onText: (t: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  if (!supported) return null; // hidden on unsupported browsers, typing still works

  function start() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.onresult = (e: any) => onText(e.results[0][0].transcript);
    rec.onerror = () => {
      toast.error("Couldn't hear that. Try again or type instead.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  return (
    <Button
      type="button"
      variant={listening ? "destructive" : "outline"}
      onClick={() => (listening ? recRef.current?.stop() : start())}
    >
      {listening ? "Listening... tap to stop" : "🎤 Speak"}
    </Button>
  );
}