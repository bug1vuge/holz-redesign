import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ScrollTrigger, SmoothScroll, useScroll } from "./lib/motion";
import { TextureDefs } from "./components/Door";
import { Header } from "./components/Header";
import { LeadProvider, Messengers } from "./components/Lead";
import { Cursor, Curtain, Footer, Preloader, useRouteCurtain } from "./components/Chrome";
import Home from "./home/Home";
import { CatalogIndex, CategoryPage } from "./pages/Catalog";
import ProductPage from "./pages/Product";
import { About, Article, Certificates, Contacts, Designers, Policy, Press, PromoPage, Promos, Reviews, Technology, WhereToBuy } from "./pages/Info";
import NotFound from "./pages/NotFound";

function Shell() {
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setReady(true), []);
  const { pathname } = useLocation();
  const { to } = useScroll();
  useRouteCurtain();

  useEffect(() => {
    to(0, { immediate: true });
    const t = setTimeout(() => ScrollTrigger.refresh(), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <TextureDefs />
      <Preloader onDone={done} />
      <Cursor />
      <Header />
      <Routes>
        <Route path="/" element={<Home ready={ready} />} />
        <Route path="/katalog" element={<CatalogIndex />} />
        <Route path="/katalog/:cat" element={<CategoryPage />} />
        <Route path="/katalog/:cat/:slug" element={<ProductPage />} />
        <Route path="/gde-kupit" element={<WhereToBuy />} />
        <Route path="/akcii" element={<Promos />} />
        <Route path="/akcii/:slug" element={<PromoPage />} />
        <Route path="/press" element={<Press />} />
        <Route path="/press/novosti" element={<Press type="news" />} />
        <Route path="/press/blog" element={<Press type="blog" />} />
        <Route path="/press/:slug" element={<Article />} />
        <Route path="/dizajneram" element={<Designers />} />
        <Route path="/o-kompanii" element={<About />} />
        <Route path="/o-kompanii/tehnologii" element={<Technology />} />
        <Route path="/o-kompanii/sertifikaty" element={<Certificates />} />
        <Route path="/o-kompanii/otzyvy" element={<Reviews />} />
        <Route path="/o-kompanii/kontakty" element={<Contacts />} />
        <Route path="/politika" element={<Policy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Messengers />
      <Curtain />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <SmoothScroll>
        <LeadProvider>
          <Shell />
        </LeadProvider>
      </SmoothScroll>
    </BrowserRouter>
  );
}
