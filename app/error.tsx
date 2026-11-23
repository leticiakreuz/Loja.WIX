"use client";

export default function CatalogError({ reset }: { reset: () => void }) {
  return (
    <main className="wrap section" role="alert">
      <h1>Vamos tentar novamente?</h1>
      <p>Não conseguimos carregar o catálogo agora. Tente novamente em instantes.</p>
      <button className="primary" onClick={reset}>Tentar novamente</button>
    </main>
  );
}
