import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { destinoSeguro } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Destino dos links de e-mail (confirmação de cadastro, recuperação de senha,
// link de acesso do painel) e do login com LinkedIn: troca o código pela
// sessão e segue para `next`.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const proximo = destinoSeguro(params.get("next"));
  const destino = request.nextUrl.clone();
  destino.search = "";

  const supabase = await createClient();
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const tipo = params.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && tipo
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })
      : { error: new Error(params.get("error_description") ?? "link sem código") };

  if (!error) {
    return NextResponse.redirect(new URL(proximo, request.nextUrl.origin));
  }

  console.error("auth callback:", error.message);
  destino.pathname = proximo.startsWith("/admin") ? "/admin/login" : "/entrar";
  destino.searchParams.set("erro", "link");
  return NextResponse.redirect(destino);
}
