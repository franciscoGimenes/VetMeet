import "server-only";
import { BUCKET_FOTOS } from "@/lib/conta";
import { BUCKET_REDE } from "@/lib/rede";
import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

// Apaga a conta e tudo o que é dela. Arquivos primeiro (foto do perfil e
// fotos da Rede, na pasta do usuário); depois a conta, que leva junto, em
// cascata, o perfil, os locais, os vínculos, os aceites e a Rede (posts,
// curtidas e comentários). Registros de contato e de denúncia ficam sem o
// nome (trigger veterinarians_anonimiza). Usado pelo próprio veterinário e
// pelo admin.
export async function excluirUsuario(admin: Admin, userId: string) {
  for (const bucket of [BUCKET_FOTOS, BUCKET_REDE]) {
    // list() devolve até 100 por vez: repete até esvaziar a pasta.
    for (let i = 0; i < 20; i++) {
      const { data: arquivos } = await admin.storage.from(bucket).list(userId, { limit: 100 });
      if (!arquivos?.length) break;
      await admin.storage.from(bucket).remove(arquivos.map((a) => `${userId}/${a.name}`));
    }
  }
  return admin.auth.admin.deleteUser(userId);
}
