"use client";

import Link from "next/link";
import { useActionState, useId, type ReactNode } from "react";
import {
  criarConta,
  entrar,
  entrarComLinkedIn,
  recuperarSenha,
  type EstadoAuth,
} from "@/app/entrar/actions";
import { Button, Field, Input, fieldProps } from "@/components/ui";
import { SENHA_MIN } from "@/lib/senha";
import { DECLARACAO_CRMV } from "@/lib/termos";

export function Alerta({ tom = "erro", children }: { tom?: "erro" | "ok"; children: ReactNode }) {
  return tom === "erro" ? (
    <p role="alert" className="rounded-control bg-error/10 px-4 py-3 text-small text-error-strong ring-1 ring-error/30 ring-inset">
      {children}
    </p>
  ) : (
    <p role="status" className="rounded-control bg-primary-soft px-4 py-3 text-small text-text ring-1 ring-primary/20 ring-inset">
      {children}
    </p>
  );
}

// Checkbox com texto ao lado; a linha inteira é o alvo de toque.
export function Aceite({
  name,
  erro,
  children,
}: {
  name: string;
  erro?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-small text-text">
        <input
          type="checkbox"
          name={name}
          value="sim"
          required
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className="mt-0.5 size-5 shrink-0 rounded-mark border-border-strong accent-primary"
        />
        <span>{children}</span>
      </label>
      {erro && (
        <p id={`${id}-erro`} className="mt-1 text-small text-error-strong">
          {erro}
        </p>
      )}
    </div>
  );
}

export function BotaoLinkedIn({ children = "Entrar com LinkedIn" }: { children?: ReactNode }) {
  return (
    <form action={entrarComLinkedIn}>
      <Button type="submit" variant="secondary" block>
        {children}
      </Button>
    </form>
  );
}

export function Separador() {
  return (
    <p className="my-6 flex items-center gap-3 text-small text-text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
      ou
    </p>
  );
}

const linkTexto = "font-medium text-primary underline underline-offset-4";

export function FormEntrar({ aviso }: { aviso?: ReactNode }) {
  const [estado, acao, enviando] = useActionState<EstadoAuth, FormData>(entrar, {});
  const id = useId();
  return (
    <form action={acao} className="space-y-4">
      {estado.erro ? <Alerta>{estado.erro}</Alerta> : aviso}
      <Field id={`${id}-email`} label="E-mail">
        <Input id={`${id}-email`} name="email" type="email" autoComplete="email" required defaultValue={estado.email} />
      </Field>
      <Field id={`${id}-senha`} label="Senha">
        <Input id={`${id}-senha`} name="senha" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" block disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-center">
        <Link href="/entrar/recuperar" className="inline-flex min-h-11 items-center text-small font-medium text-primary hover:underline">
          Esqueci minha senha
        </Link>
      </p>
    </form>
  );
}

export function FormCadastro() {
  const [estado, acao, enviando] = useActionState<EstadoAuth, FormData>(criarConta, {});
  const id = useId();
  const erros = estado.erros ?? {};

  if (estado.enviado) {
    return (
      <Alerta tom="ok">
        Enviamos um link de confirmação para <strong className="font-semibold">{estado.email}</strong>. Abra o
        e-mail neste mesmo navegador para ativar a conta e preencher seu perfil. Não chegou? Confira o spam.
      </Alerta>
    );
  }

  return (
    <form action={acao} noValidate className="space-y-4">
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      <Field id={`${id}-email`} label="E-mail" error={erros.email}>
        <Input
          {...fieldProps(`${id}-email`, { error: erros.email })}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={estado.email}
        />
      </Field>
      <Field id={`${id}-senha`} label="Senha" error={erros.senha} hint={`Pelo menos ${SENHA_MIN} caracteres.`}>
        <Input
          {...fieldProps(`${id}-senha`, { error: erros.senha, hint: "sim" })}
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={SENHA_MIN}
        />
      </Field>
      <Aceite name="declaracao" erro={erros.declaracao}>
        {DECLARACAO_CRMV}
      </Aceite>
      <Aceite name="termos" erro={erros.termos}>
        Li e aceito os{" "}
        <Link href="/termos" target="_blank" className={linkTexto}>
          Termos de Uso
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" target="_blank" className={linkTexto}>
          Política de Privacidade
        </Link>
        .
      </Aceite>
      <Button type="submit" size="lg" block disabled={enviando}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}

export function FormRecuperar() {
  const [estado, acao, enviando] = useActionState<EstadoAuth, FormData>(recuperarSenha, {});
  const id = useId();
  if (estado.enviado) {
    return (
      <Alerta tom="ok">
        Se <strong className="font-semibold">{estado.email}</strong> tiver conta no VetMeet, enviamos um link para
        criar uma nova senha. Abra o e-mail neste mesmo navegador.
      </Alerta>
    );
  }
  return (
    <form action={acao} className="space-y-4">
      {estado.erro && <Alerta>{estado.erro}</Alerta>}
      <Field id={`${id}-email`} label="E-mail" error={estado.erros?.email}>
        <Input
          {...fieldProps(`${id}-email`, { error: estado.erros?.email })}
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={estado.email}
        />
      </Field>
      <Button type="submit" block disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar link"}
      </Button>
    </form>
  );
}
