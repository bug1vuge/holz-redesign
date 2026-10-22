import { Link } from "react-router-dom";
import { Door } from "../components/Door";

export default function NotFound() {
  return (
    <main className="page nf">
      <div className="container nf__in">
        <div className="nf__door"><Door kind="hidden" finish="cashmere" variant={1} /></div>
        <div>
          <span className="eyebrow">Ошибка 404</span>
          <h1 className="h1">Эта дверь <span className="serif-i">никуда не ведёт</span></h1>
          <p className="lead">Страница переехала или её не существует. Попробуйте начать с каталога.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <Link to="/katalog" className="btn btn--dark">В каталог</Link>
            <Link to="/" className="btn btn--ghost">На главную</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
