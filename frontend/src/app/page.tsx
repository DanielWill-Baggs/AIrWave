"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/ui/modetoggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Mic, Terminal, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useDropzone } from "react-dropzone";

const uploadAudio = async (file: File) => {
  const formData = new FormData();
  formData.append("audio", file);

  const response = await fetch("/api/upload-audio", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Upload successful:", data);
  } else {
    console.error("Upload failed.");
  }
};

export default function Page() {
  // States for transcription and AI response
  const [transcription, setTranscription] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setAudioFile(file);
      uploadAudio(file); // Upload the file when it's dropped
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file);
    }
  };

  const handleMicClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioRecorderRef.current = new MediaRecorder(stream);
    audioRecorderRef.current.ondataavailable = (event) => {
      const chunks = [event.data];
      const blob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(blob);
    };

    audioRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    audioRecorderRef.current?.stop();
    setRecording(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "audio/*": [] },
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b z-10">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="text-lg font-semibold font-[family-name:var(--font-geist-sans)]">
              Airwave
            </div>
            <div className="text-sm font-light">
              Realtime Voice-Powered AI Application
            </div>
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 z-20">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="rounded-xl ">
              <textarea
                className="w-full h-60 p-4 bg-slate-700 text-white rounded-lg"
                placeholder="Transcription will appear here..."
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
              />
            </div>
            <div className="relative rounded-xl h-60">
              <Image
                className="rounded-xl"
                src="/AIrwave.jpg"
                alt="AIrwave"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="rounded-xl ">
              <textarea
                className="w-full h-60 p-4 bg-slate-700 text-white rounded-lg"
                placeholder="AI's response will appear here..."
                value={aiResponse}
                onChange={(e) => setAiResponse(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-white">
            <Mic className="w-5 h-5" />
            <span className="font-semibold">Speak!</span>
          </div>

          <Card className="w-full min-h-[300px] bg-slate-800/50 border-slate-700 flex flex-col items-center justify-center p-8">
            <div
              {...getRootProps()}
              className="flex flex-col items-center text-center space-y-4"
            >
              <input {...getInputProps()} className="hidden" />
              <div className="p-4 rounded-full bg-slate-700/50">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">
                  Drop Audio Here
                </h3>
                <p className="text-sm text-slate-400">- or -</p>
                <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Click to Upload
                </button>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
              onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4 text-slate-400" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
              onClick={handleMicClick}
            >
              <Mic className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
          <Button className="bg-sky-400 border-sky-700 hover:bg-sky-700">
            Send
          </Button>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Don't Forget To Add Your API Key!</AlertTitle>
            <AlertDescription>
              Click on the microphone icon to start speaking. You can also
              upload an audio file.
            </AlertDescription>
            <AlertDescription>
              Supported audio files include mp3, mp4, mpeg, mpga, m4a, wav, and
              webm file types.
            </AlertDescription>
          </Alert>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
