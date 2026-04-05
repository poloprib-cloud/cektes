import { cn } from "@/lib/utils";

type Method = "email" | "whatsapp";

type Props = {
  value: Method;
  onChange: (v: Method) => void;
  emailLabel?: string;
  whatsappLabel?: string;
  disabled?: boolean;
};

export default function MethodToggle({
  value,
  onChange,
  emailLabel = "Email",
  whatsappLabel = "WhatsApp",
  disabled,
}: Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 rounded-md border p-1 bg-muted/30",
        disabled && "opacity-60 pointer-events-none"
      )}
      role="tablist"
      aria-label="Metode"
    >
      <button
        type="button"
        onClick={() => onChange("email")}
        className={cn(
          "h-9 rounded-sm text-sm font-medium transition",
          value === "email" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"
        )}
        role="tab"
        aria-selected={value === "email"}
      >
        {emailLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("whatsapp")}
        className={cn(
          "h-9 rounded-sm text-sm font-medium transition",
          value === "whatsapp" ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"
        )}
        role="tab"
        aria-selected={value === "whatsapp"}
      >
        {whatsappLabel}
      </button>
    </div>
  );
}
