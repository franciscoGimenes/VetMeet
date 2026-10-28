import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Destino do link mágico: troca o código pela sessão e segue para o painel.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destino = request.nextUrl.clone();
  destino.search = "";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      destino.pathname = "/admin";
      return NextResponse.redirect(destino);
    }
    console.error("auth callback:", error.message);
  }

  destino.pathname = "/admin/login";
  destino.searchParams.set("erro", "link");
  return NextResponse.redirect(destino);
}
