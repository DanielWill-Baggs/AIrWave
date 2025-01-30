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
import { useState, useRef, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useDropzone } from "react-dropzone";

export default function Page() {
  const [transcription, setTranscription] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const recordingRef = useRef(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to adjust textarea height
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height to auto
    textarea.style.height = `${Math.max(textarea.scrollHeight, 240)}px`;
  };

  useEffect(() => {
    const transcriptionTextarea = document.getElementById(
      "transcription-textarea"
    ) as HTMLTextAreaElement;
    if (transcriptionTextarea) {
      adjustTextareaHeight(transcriptionTextarea);
    }
  }, [transcription]);

  useEffect(() => {
    const aiResponseTextarea = document.getElementById(
      "ai-response-textarea"
    ) as HTMLTextAreaElement;
    if (aiResponseTextarea) {
      adjustTextareaHeight(aiResponseTextarea);
    }
  }, [aiResponse]);

  const uploadAudio = async (file: File) => {
    console.log("uploadAudio function is called");
    setLoading(true); // Start loading
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/process_audio", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTranscription(data.transcription);
        setAiResponse(data.response);
      } else {
        throw new Error("Failed to upload audio");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const Loader = () => (
    <div className="loader-container flex justify-center items-center">
      <div className="w-32 h-32 relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-xl animate-pulse"></div>

        <div className="w-full h-full relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-spin blur-sm"></div>

          <div className="absolute inset-1 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-12 bg-cyan-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]"></div>
              <div className="w-1.5 h-12 bg-blue-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.1s]"></div>
              <div className="w-1.5 h-12 bg-indigo-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.2s]"></div>
              <div className="w-1.5 h-12 bg-purple-500 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.3s]"></div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
          </div>
        </div>

        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping delay-100"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-500 rounded-full animate-ping delay-200"></div>
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-300"></div>
      </div>
    </div>
  );

  const onDrop = (acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);
    const file = acceptedFiles[0];
    if (file) {
      setAudioFile(file);
      uploadAudio(file);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File selected:", event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      uploadAudio(file);
    }
  };

  const handleMicClick = () => {
    if (recordingRef.current) {
      console.log("Stopping recording...");
      stopRecording();
      recordingRef.current = false;
    } else {
      console.log("Starting recording...");
      startRecording();
      recordingRef.current = true;
    }
  };

  let chunks: Blob[] = [];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioRecorderRef.current = new MediaRecorder(stream);

      audioRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      audioRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        chunks = [];
      };

      audioRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = async () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
    }
    setRecording(false);

    if (audioBlob) {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      try {
        const response = await fetch("http://127.0.0.1:5000/process_audio", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Transcription:", result.transcription);
        console.log("AI Response:", result.response);
      } catch (error) {
        console.error("Error uploading the audio file:", error);
      }
    }
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
            <div className="rounded-xl">
              <textarea
                id="transcription-textarea"
                className="w-full p-4 bg-slate-700 text-white rounded-lg resize-none overflow-hidden"
                placeholder="Transcription will appear here..."
                value={transcription}
                onChange={(e) => {
                  setTranscription(e.target.value);
                  adjustTextareaHeight(e.target);
                }}
                style={{ lineHeight: "1.5", padding: "1rem" }}
              />
            </div>
            <div className="rounded-xl">
              {loading ? (
                <div className="flex justify-center items-center h-60">
                  <Loader />
                </div>
              ) : (
                <div className="relative rounded-xl h-60">
                  <Image
                    className="rounded-xl"
                    src="/AIrwave.jpg"
                    alt="AIrwave"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            <div className="rounded-xl">
              <textarea
                id="ai-response-textarea"
                className="w-full p-4 bg-slate-700 text-white rounded-lg resize-none overflow-hidden"
                placeholder="AI's response will appear here..."
                value={aiResponse}
                onChange={(e) => {
                  setAiResponse(e.target.value);
                  adjustTextareaHeight(e.target);
                }}
                style={{ lineHeight: "1.5", padding: "1rem" }}
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
              Click on the microphone icon to start speaking. You can also drag
              and drop or manually upload an audio file.
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
