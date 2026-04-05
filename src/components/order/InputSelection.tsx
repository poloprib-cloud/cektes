import InputFields from "@/components/order/InputFields";
import { Info } from "lucide-react";

interface InputSelectionProps {
  gameConfig: any;
  inputs: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  idRef: React.RefObject<HTMLDivElement>;
  serverRef: React.RefObject<HTMLDivElement>;
  openGuideDrawer: () => void;
}

export default function InputSelection({
  gameConfig,
  inputs,
  handleInputChange,
  idRef,
  serverRef,
  openGuideDrawer,
}: InputSelectionProps) {
  return (
    <section
      className="relative scroll-mt-20 rounded-xl bg-background shadow-sm ring-1 ring-border md:scroll-mt-[7.5rem]"
      id="2"
    >
      <div className="flex items-center rounded-t-xl bg-muted px-4 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-my-color font-semibold text-white">
          1
        </div>
        <h2 className="ml-3 text-sm font-semibold text-card-foreground">
          Masukkan Data Akun
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputFields
            gameConfig={gameConfig}
            inputs={inputs}
            handleInputChange={handleInputChange}
            idRef={idRef}
            serverRef={serverRef}
          />
        </div>

        {(gameConfig?.guide_text || gameConfig?.guide_image) && (
          <div
            onClick={openGuideDrawer}
            className="flex items-center gap-2 cursor-pointer w-fit rounded-md border border-border bg-muted/40 px-4 py-2 text-xs text-card-foreground transition hover:bg-my-color/10 hover:shadow-sm"
          >
            <Info className="h-4 w-4" />
            <span className="italic">Cara Menemukan ID</span>
          </div>
        )}
      </div>
    </section>
  );
}