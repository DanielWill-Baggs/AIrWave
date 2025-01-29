import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/ui/modetoggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b z-10">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="text-lg font-semibold font-[family-name:var(--font-geist-sans)]">
              AIrwave
            </div>
            <div className="text-sm font-light">
              Realtime Voice-Powered AI Application
            </div>
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 z-20">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="relative rounded-xl bg-muted/50">
              <Image
                className="rounded-xl"
                src="/AIrwave.jpg"
                alt="AIrwave"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
