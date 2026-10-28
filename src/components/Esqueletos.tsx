const bloco = "animate-pulse rounded-card bg-border/70";

export function EsqueletoBusca() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6" aria-busy="true">
      <div className={`${bloco} h-16`} />
      <div className="mt-6 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
        <div className={`${bloco} hidden h-96 lg:block`} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${bloco} h-64`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EsqueletoPerfil() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6" aria-busy="true">
      <div className={`${bloco} h-32`} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className={`${bloco} h-96`} />
        <div className={`${bloco} hidden h-64 lg:block`} />
      </div>
    </div>
  );
}
