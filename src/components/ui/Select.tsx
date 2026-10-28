import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { CONTROLE } from "./Input";

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(CONTROLE, "cursor-pointer", className)} {...props} />;
}
