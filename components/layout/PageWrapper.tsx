import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <main
      className={cn(
        "max-w-lg mx-auto px-4 pt-4 pb-24 min-h-[calc(100vh-3.5rem)]",
        className
      )}
    >
      {children}
    </main>
  );
}
