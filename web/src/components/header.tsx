import { Marquee } from "@/src/components/ui/marquee"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 h-10 w-full overflow-hidden bg-[#0B3B76]">
      <Marquee
        repeat={1}
        pauseOnHover
        className="[--duration:50s]"
      >
        <span className="
          px-[100vw]
          text-sm
          font-medium
          text-white
          whitespace-nowrap
        ">
          +25 anos: um legado de confiança e credibilidade
        </span>
      </Marquee>
    </header>
  )
}
