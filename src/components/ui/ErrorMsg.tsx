import { cn } from "@/lib/utils";

interface ErrorMsgProps {
  message?: string | string[];
  className?: string;
}

export function ErrorMsg({ message, className }: ErrorMsgProps) {
  if (!message) return null;

  const displayMessage = Array.isArray(message) ? message[0] : message;

  return (
    <p className={cn("text-[11px] font-medium text-destructive mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1", className)}>
      {displayMessage}
    </p>
  );
}
