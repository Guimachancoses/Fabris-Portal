import { DockComponent } from "../components/dock-component";
import Header from "../components/header";
import Footer from "../components/footer";
import ContentSection from "../components/content-1";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Header />
      <ContentSection />
      <DockComponent />
      <Footer />
    </div>
  );
}
