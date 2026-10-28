# Deploy do VetMeet (Vercel + Supabase)

## Visão geral

- **App:** Next.js na Vercel, conectado ao GitHub (cada push na `main` publica).
- **Banco:** projeto Supabase em nuvem. O schema vive em `supabase/migrations`;
  os dados de demonstração em `supabase/seed.sql`.
- **Projeto atual (`vetmeet`, ref `xieishahvlzatkbuppch`):** já tem todas as
  migrations, o seed demo e o admin cadastrado. Pode ser usado como produção
  direto; nesse caso pule a parte 2 e faça só a parte 3.

## 1. Publicar o código

1. Crie um repositório **privado** no GitHub e envie o projeto:
   ```bash
   git remote add origin https://github.com/<usuario>/vetmeet.git
   git push -u origin main
   ```
2. Na Vercel: **Add New → Project → Import** o repositório. A Vercel detecta o
   Next.js; não mude build nem output.
3. Antes de clicar em Deploy, abra **Environment Variables** e cadastre:

   | Variável | Valor | Onde achar |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Supabase → Project Settings → Data API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave *publishable* | Supabase → Project Settings → API Keys |
   | `SUPABASE_SERVICE_ROLE_KEY` | chave *secret* | Supabase → Project Settings → API Keys |
   | `ADMIN_EMAILS` | seu e-mail | e-mails que podem pedir link do `/admin` |
   | `NEXT_PUBLIC_SITE_URL` | `https://seu-dominio` | só quando tiver domínio próprio |

   Sem `NEXT_PUBLIC_SITE_URL`, o site usa o domínio de produção da Vercel
   (`*.vercel.app`) em sitemap e metadados. `SUPABASE_PROJECT_REF` e
   `SUPABASE_DB_URL` **não** vão para a Vercel: são só para scripts locais.

4. Deploy. Ao trocar variáveis depois, faça **Redeploy** (variáveis
   `NEXT_PUBLIC_*` entram no build).

## 2. Banco de produção (só se for um projeto Supabase novo)

Pré-requisito: senha do banco (Project Settings → Database) e login no CLI.

```bash
npx supabase login
npx supabase link --project-ref <ref-de-producao>   # pede a senha do banco

npx supabase db push --dry-run                      # confere o que será aplicado
npx supabase db push --include-seed                 # migrations + seed demo
```

`db push` aplica, em ordem, só as migrations que ainda não estão no banco, e
registra cada uma no histórico do projeto. `--include-seed` roda o
`supabase/seed.sql`, que é reexecutável (apaga os demos antes de recriar).

Alternativa ao seed pelo CLI: preencha `SUPABASE_DB_URL` no `.env.local` com a
connection string de produção (Connect → Session pooler) e rode
`npm run db:seed`.

Depois, no **SQL Editor** do projeto, cadastre o admin:

```sql
insert into public.admins (email) values ('seu-email@exemplo.com');
```

## 3. Configurar o login do painel (Supabase → Authentication)

1. **URL Configuration**
   - *Site URL:* `https://seu-dominio` (ou `https://<projeto>.vercel.app`)
   - *Redirect URLs* (adicione todas):
     - `https://seu-dominio/auth/callback`
     - `https://<projeto>.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (desenvolvimento)

   Sem isso o link do e-mail volta para a Site URL e o login não completa.
2. **Sign In / Providers → Email:** deixe ativo. Depois do primeiro login,
   desative **Allow new users to sign up**: o admin já existe e ninguém mais
   precisa criar conta.
3. O e-mail padrão do Supabase tem limite baixo de envios por hora. Para um
   único admin basta; com mais gente, configure SMTP próprio (Auth → SMTP).

## 4. Conferir depois do deploy

- [ ] `/` e `/buscar?local=suzano&especie=gatos` carregam com resultados
- [ ] `/sitemap.xml` e `/robots.txt` usam o domínio certo
- [ ] Compartilhar o link no WhatsApp mostra a imagem do VetMeet
- [ ] `/sou-veterinario`: enviar um cadastro de teste e vê-lo no `/admin`
- [ ] `/admin`: pedir o link, entrar, ver os números e baixar o CSV
- [ ] No Supabase, Advisors → Security sem alertas novos

## Mudanças de schema no futuro

```bash
npx supabase migration new nome_da_mudanca   # cria o arquivo em supabase/migrations
# escreva o SQL, depois:
npx supabase db push                          # aplica no projeto linkado
npm run db:types                              # regenera src/types/database.ts
```

Nunca edite uma migration já aplicada; crie outra.

## Avisos

- **Plano gratuito do Supabase pausa o projeto após 7 dias sem uso.** Durante a
  validação, o tráfego costuma evitar isso; se pausar, reative em Project →
  Restore. Para produção com usuários reais, considere o plano pago.
- Para remover todos os perfis demo quando houver profissionais reais:
  `npm run db:remove-demo` (cliques e buscas registrados são preservados).
