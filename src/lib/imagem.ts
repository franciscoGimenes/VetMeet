// Preparo de imagens no navegador antes do envio ao Storage.
// Desenhar no canvas e reencodar descarta todos os metadados do arquivo
// original (EXIF, inclusive a localização GPS), e a orientação da câmera é
// aplicada antes, para a foto não sair deitada.

export type ImagemPronta = { blob: Blob; largura: number; altura: number; extensao: "webp" | "jpg" };

export async function prepararImagem(
  arquivo: File,
  { lado, quadrada = false, qualidade = 0.82 }: { lado: number; quadrada?: boolean; qualidade?: number },
): Promise<ImagemPronta> {
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  // Recorte: quadrado central (foto de perfil) ou a imagem inteira.
  const recorteL = quadrada ? Math.min(bitmap.width, bitmap.height) : bitmap.width;
  const recorteA = quadrada ? recorteL : bitmap.height;
  const escala = Math.min(1, lado / Math.max(recorteL, recorteA));
  const largura = Math.max(1, Math.round(recorteL * escala));
  const altura = Math.max(1, Math.round(recorteA * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  canvas
    .getContext("2d")!
    .drawImage(bitmap, (bitmap.width - recorteL) / 2, (bitmap.height - recorteA) / 2, recorteL, recorteA, 0, 0, largura, altura);
  bitmap.close();

  const gerar = (tipo: string) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, qualidade));
  // Safari não gera WebP no canvas (devolve PNG): nesse caso vai JPEG.
  const webp = await gerar("image/webp");
  if (webp?.type === "image/webp") return { blob: webp, largura, altura, extensao: "webp" };
  const jpeg = await gerar("image/jpeg");
  if (!jpeg) throw new Error("não foi possível processar a imagem");
  return { blob: jpeg, largura, altura, extensao: "jpg" };
}

export const TAMANHO_ORIGINAL_MAX = 20 * 1024 * 1024;
