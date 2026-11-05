"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./Button";

// Botão de envio que mostra o carregando sozinho. Com vários botões no mesmo
// formulário (name/value diferentes), só o que foi tocado gira; os outros
// ficam travados até a resposta.
export function BotaoEnviar({
  textoCarregando,
  children,
  disabled,
  ...props
}: Omit<ComponentProps<typeof Button>, "type" | "carregando"> & { textoCarregando?: string }) {
  const { pending, data } = useFormStatus();
  const esteBotao = pending && (!props.name || data?.get(props.name) === String(props.value ?? ""));
  return (
    <Button type="submit" carregando={esteBotao} disabled={disabled || pending} {...props}>
      {esteBotao && textoCarregando ? textoCarregando : children}
    </Button>
  );
}
