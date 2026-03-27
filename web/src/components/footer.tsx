import Image from "next/image";

export default function FooterSection() {
  return (
    <footer className="fixed bottom-0 left-0 z-0 w-full h-[100px] md:h-[165px] overflow-hidden sm:h-[10px]">
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
        <span
          className="
            absolute bottom-2
            left-1/2 -translate-x-1/2
            text-xs text-white/80
            md:bottom-4
            md:left-auto md:right-6 md:translate-x-2
            md:text-sm
          "
        >
          © {new Date().getFullYear()} — Criado por{" "}
          <a
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
