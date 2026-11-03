import { FormNovaSenha } from "@/components/conta/Conta";
import { Card } from "@/components/ui";

export const metadata = { title: "Nova senha" };

export default function NovaSenha() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-h1 text-text">Nova senha</h1>
      <Card padding="lg" className="mt-6 md:mt-8">
        <FormNovaSenha />
      </Card>
    </div>
  );
}
