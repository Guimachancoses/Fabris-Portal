import Image from "next/image";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 z-0 w-full h-[120px] md:h-[200px] overflow-hidden">
      <div className="relative h-full w-full rounded-t-3xl overflow-hidden shadow-2xl">
        {/* Imagem de fundo */}
        <Image
          src="/Fabrispuma_25_anos.jpg"
          alt="Fabris Puma 25 anos"
          fill
          sizes="100vw"
          className="pointer-events-none select-none object-cover object-[center_62%]"
          priority
        />

        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/85" />

        {/* Texto no canto direito */}
        <span className="absolute bottom-2 md:bottom-4 right-4 md:right-6 text-xs md:text-sm text-white/80">
          © {new Date().getFullYear()} — Criado por{" "}
          <a
            // href="https://www.linkedin.com/in/guilherme-machancoses-772986233/"
            // target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white hover:underline"
          >
            GuiMac
          </a>{" "}
          🪓
        </span>
      </div>
    </footer>
  );
}
