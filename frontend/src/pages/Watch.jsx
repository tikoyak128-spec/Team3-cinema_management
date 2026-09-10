import { useNavigate, useParams, Link } from "react-router-dom";
import { Calendar, Play, Ticket } from "lucide-react";
import { usePrefs } from "../context/PrefsContext";
import LangSwitch from "../components/LangSwitch";

const movies = [
  { title: "Avengers: Endgame", genre: "Action • 3h 01m", rating: "8.4", trailerId: "TcMBFSGVi1c", poster: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg", descKey: "watch.descAvengers" },
  { title: "Spider-Man: No Way Home", genre: "Action • 2h 28m", rating: "8.2", trailerId: "JfVOs4VSpmA", poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", descKey: "watch.descSpiderMan" },
  { title: "Free Guy", genre: "Comedy • 1h 55m", rating: "7.1", trailerId: "X2m-08cOAbc", poster: "https://image.tmdb.org/t/p/w500/dxraF0qPr1OEgJk17ltQTO84kQF.jpg", descKey: "watch.descFreeGuy" },
  { title: "The Conjuring", genre: "Horror • 1h 52m", rating: "7.5", trailerId: "k10ETZ41q5o", poster: "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg", descKey: "watch.descConjuring" },
  { title: "Titanic", genre: "Romance • 3h 15m", rating: "7.9", trailerId: "2e-eXJ6HgkQ", poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", descKey: "watch.descTitanic" },
  { title: "Inside Out", genre: "Animation • 1h 35m", rating: "8.1", trailerId: "yRUAzGQ3nSY", poster: "https://image.tmdb.org/t/p/w500/j91LJmcWo16CArFOoapsz84bwxb.jpg", descKey: "watch.descInsideOut" },
  { title: "Interstellar", genre: "Science Fiction • 2h 49m", rating: "8.7", trailerId: "zSWdZVtXT7E", poster: "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg", descKey: "watch.descInterstellar" },
  { title: "Avatar", genre: "Science Fiction • 2h 42m", rating: "8.0", trailerId: "5PSNL1qE6VY", poster: "https://image.tmdb.org/t/p/w500/gKY6q7SjCkAU6FqvqWybDYgUKIF.jpg", descKey: "watch.descAvatar" },
  { title: "The Last Emperor", genre: "Drama • 2h 18m", rating: "PG-13", trailerId: "8g18jFHCLXk", poster: "https://upload.wikimedia.org/wikipedia/en/5/59/DavidByrneTheLastEmperor.jpg", descKey: "watch.descLastEmperor" },
  { title: "City of Shadows", genre: "Action • 1h 52m", rating: "R", trailerId: "zSWdZVtXT7E", poster: "https://dnm.nflximg.net/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABYd4I86-2pZPrZP9_8cWOF-BT1CHNqROzu6b62cRsH2mWOMHtY9I66uLFFvWHWHFt7qv8z-HwYZgi3_7Y_WQZzc2hysf4u9E8XWm.jpg", descKey: "watch.descCityShadows" },
  { title: "Golden Dawn", genre: "Romance • 2h 05m", rating: "PG", trailerId: "8hP9D6kZseM", poster: "https://m.media-amazon.com/images/M/MV5BMzEwZmY3NWMtMDEzNS00MTc4LTkyYTctZDg0ZjZhYjkxODc5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", descKey: "watch.descGoldenDawn" },
  { title: "Midnight Express", genre: "Thriller • 1h 45m", rating: "PG-13", trailerId: "2LqzF5WauAw", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSueUzcBljn6kw-_hIUGoPC2inhfwiFFs3Xp9JiRsrcE33DaZVbhKiBYsQ&s=10", descKey: "watch.descMidnightExpress" },
  { title: "Ocean's Whisper", genre: "Adventure • 2h 30m", rating: "PG", trailerId: "n9xhJrPXop4", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8lgfBgKYLei83FnnyKgSnaI_6NTE3eMBVu1gwI6pFLSyoVet1nAIDvi8&s=10", descKey: "watch.descOceansWhisper" },
  { title: "The Silent Code", genre: "Mystery • 1h 58m", rating: "PG-13", trailerId: "YoHD9XEInc0", poster: "https://m.media-amazon.com/images/M/MV5BYTc1ODMwMDctYzc2Zi00ZDdlLWE3YWEtZWJhNmJmYmI0NjliXkEyXkFqcGc@._V1_.jpg", descKey: "watch.descSilentCode" },
  { title: "Age of Wonders", genre: "Fantasy • 2h 20m", rating: "PG-13", trailerId: "w0HgHet0sxg", poster: "https://upload.wikimedia.org/wikipedia/en/e/e5/Aowboxart.jpg", descKey: "watch.descAgeOfWonders" },
  { title: "Crimson Tide", genre: "Action • 1h 55m", rating: "R", trailerId: "TfBCe93T_ec", poster: "https://m.media-amazon.com/images/M/MV5BNTNhZDk2NmQtNDc3ZC00Nzk3LWFmNTctYTc0OWMyNGM0ZWYyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", descKey: "watch.descCrimsonTide" },
  { title: "Paper Moon", genre: "Drama • 1h 47m", rating: "PG", trailerId: "2LqzF5WauAw", poster: "https://upload.wikimedia.org/wikipedia/en/7/71/Paper-moon_small.jpg", descKey: "watch.descPaperMoon" },
  { title: "The Far Horizon", genre: "Sci-Fi • 2h 12m", rating: "PG-13", trailerId: "n9xhJrPXop4", poster: "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p2798_p_v12_al.jpg", descKey: "watch.descFarHorizon" },
];

const normalize = (s) =>
  (s || "").toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export default function Watch() {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const { movieTitle } = useParams();
  const found = movies.find((m) => normalize(m.title) === normalize(movieTitle));
  const movie = found || { ...movies[0], title: decodeURIComponent(movieTitle || "Movie") };
  const trailerId = movie.trailerId;

  const related = movies.filter((m) => m.title !== movie.title && m.rating === movie.rating).concat(
    movies.filter((m) => m.title !== movie.title && m.rating !== movie.rating)
  ).slice(0, 4);

  return (
    <div className="[font-family:'Mulish','Kantumruy_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] bg-[var(--app-page)] text-[var(--app-ink)] min-h-screen flex flex-col">
      <header className="sticky top-0 z-[100] bg-[var(--app-header)] backdrop-blur-[12px] border-b border-[var(--app-edge)] flex items-center justify-between px-7 h-[68px]">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <span className="text-[26px]"><img src="/src/img/gemini-svg.svg" alt="" /></span>
          <span className="text-lg font-extrabold tracking-[2px] text-[var(--app-ink)] [&_b]:text-[#e50914]">KHMER <b>CINEMA</b></span>
        </Link>
        <div className="flex items-center gap-3">
          <LangSwitch size="sm" />
          <button className="bg-transparent border border-[var(--app-edge2)] text-[var(--app-ink2)] py-2 px-3.5 rounded-[10px] text-[13px] font-bold cursor-pointer transition-all duration-200 hover:text-[var(--app-ink)] hover:border-[var(--app-edge2)]" onClick={() => navigate(-1)}>← {t("watch.back")}</button>
        </div>
      </header>

      <main className="flex-1 max-w-[1020px] w-full mx-auto p-4 sm:p-7">
        <div className="bg-black border border-[var(--app-edge)] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="relative w-full aspect-video bg-black">
            <iframe
              key={trailerId}
              className="w-full h-full border-none block bg-black"
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0`}
              title={`${movie.title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="pt-6">
          <div className="flex gap-2.5 flex-wrap mb-3.5">
            <span className="bg-[rgba(229,9,20,0.14)] border border-[rgba(229,9,20,0.3)] text-[#e50914] py-1.5 px-3.5 text-[13px] font-extrabold rounded-lg">{movie.rating}</span>
            <span className="bg-[var(--app-panel2)] border border-[var(--app-edge2)] text-[var(--app-ink2)] py-1.5 px-3.5 text-[13px] font-semibold rounded-[20px]">{movie.genre.split("•")[1]?.trim()}</span>
            <span className="bg-[var(--app-panel2)] text-[#22c55e] border border-[rgba(34,197,94,0.3)] py-1.5 px-3.5 text-[13px] font-semibold rounded-[20px] flex items-center gap-1"><Calendar size={13} /> {t("nav.nowShowing")}</span>
          </div>

          <h1 className="text-[24px] sm:text-[34px] font-black tracking-[0.5px]">{movie.title}</h1>
          <p className="text-[var(--app-mute)] text-[15px] mt-1.5">{movie.genre}</p>

          <p className="text-[var(--app-ink2)] text-[15px] leading-[1.6] mt-3.5 max-w-[700px]">{t(movie.descKey)}</p>

          <div className="flex gap-3 mt-[22px] flex-wrap">
            <button className="border-none cursor-pointer py-[13px] px-6 text-sm font-bold rounded-xl transition-all duration-200 inline-flex items-center gap-2 bg-[#e50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)] hover:bg-[#f40612] hover:-translate-y-0.5" onClick={() => navigate(`/booking/${encodeURIComponent(movie.title)}`)}>
              <Ticket size={16} /> {t("home.getTickets")}
            </button>
          </div>

          {/* <p className="mt-3 text-[var(--app-mute)] text-[13px] [&_code]:bg-[var(--app-panel2)] [&_code]:py-0.5 [&_code]:px-1.5 [&_code]:rounded-[5px] [&_code]:text-[var(--app-ink)] [&_code]:border [&_code]:border-[var(--app-edge2)]">
            <Film size={15} /> {t("watch.notePre")}{" "}
            <b>{movie.title}</b>, {t("watch.noteMid")} <code>trailerId</code>{" "}
            {t("watch.notePost")} <code>8hP9D6kZseM</code>.
          </p> */}
        </div>
      </main>

      <section className="max-w-[1020px] w-full mx-auto py-4 px-4 pb-10 sm:py-5 sm:px-7 sm:pb-[60px]">
        <h2 className="text-xl font-extrabold mb-[18px]">{t("watch.youMightAlsoLike")}</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[18px]">
          {related.map((m) => (
            <div className="bg-[var(--app-panel)] border border-[var(--app-edge)] rounded-[14px] p-3 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-[rgba(229,9,20,0.4)] cursor-pointer" key={m.title} onClick={() => navigate(`/watch/${encodeURIComponent(m.title)}`)}>
              <img className="w-full aspect-[2/3] object-cover rounded-lg bg-[var(--app-panel2)] mb-2.5" src={m.poster} alt={m.title} loading="lazy" />
              <div className="text-sm font-bold">{m.title}</div>
              <div className="text-xs text-[var(--app-mute)] mt-1">{m.genre}</div>
              <button
                type="button"
                className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-brand text-white p-[10px] text-[13px] font-bold rounded-xl cursor-pointer transition-all duration-200 shadow-[0_2px_10px_rgba(229,9,20,0.25)] hover:bg-brand-hover hover:shadow-[0_4px_16px_rgba(229,9,20,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/watch/${encodeURIComponent(m.title)}`);
                }}
              >
                <Play size={14} className="fill-current" /> {t("nowShowing.watch")}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
