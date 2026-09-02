import { useNavigate, useParams, Link } from "react-router-dom";
import { Calendar, Film, Play, Ticket } from "lucide-react";
import "./Watch.css";

const movies = [
  { title: "The Last Emperor", genre: "Drama • 2h 18m", rating: "PG-13", trailerId: "8g18jFHCLXk", poster: "https://upload.wikimedia.org/wikipedia/en/5/59/DavidByrneTheLastEmperor.jpg", desc: "An epic historical drama following the final emperor of a great dynasty as he loses his throne to revolution and finds a new life as a humble gardener." },
  { title: "City of Shadows", genre: "Action • 1h 52m", rating: "R", trailerId: "zSWdZVtXT7E", poster: "https://dnm.nflximg.net/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABYd4I86-2pZPrZP9_8cWOF-BT1CHNqROzu6b62cRsH2mWOMHtY9I66uLFFvWHWHFt7qv8z-HwYZgi3_7Y_WQZzc2hysf4u9E8XWm.jpg", desc: "A rogue detective chases a trail of corruption through the neon-lit streets of a city that never sleeps." },
  { title: "Golden Dawn", genre: "Romance • 2h 05m", rating: "PG", trailerId: "8hP9D6kZseM", poster: "https://m.media-amazon.com/images/M/MV5BMzEwZmY3NWMtMDEzNS00MTc4LTkyYTctZDg0ZjZhYjkxODc5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", desc: "Two strangers meet at sunrise and discover that a single golden morning can change a lifetime." },
  { title: "Midnight Express", genre: "Thriller • 1h 45m", rating: "PG-13", trailerId: "2LqzF5WauAw", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSueUzcBljn6kw-_hIUGoPC2inhfwiFFs3Xp9JiRsrcE33DaZVbhKiBYsQ&s=10", desc: "A night train becomes a deadly trap when a passenger discovers a secret that everyone on board wants silenced." },
  { title: "Ocean's Whisper", genre: "Adventure • 2h 30m", rating: "PG", trailerId: "n9xhJrPXop4", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8lgfBgKYLei83FnnyKgSnaI_6NTE3eMBVu1gwI6pFLSyoVet1nAIDvi8&s=10", desc: "A young explorer follows the call of the deep sea on a voyage to protect a mythical underwater world." },
  { title: "The Silent Code", genre: "Mystery • 1h 58m", rating: "PG-13", trailerId: "YoHD9XEInc0", poster: "https://m.media-amazon.com/images/M/MV5BYTc1ODMwMDctYzc2Zi00ZDdlLWE3YWEtZWJhNmJmYmI0NjliXkEyXkFqcGc@._V1_.jpg", desc: "A cryptographer uncovers a message no one was meant to read, pulling her into a web of espionage." },
  { title: "Age of Wonders", genre: "Fantasy • 2h 20m", rating: "PG-13", trailerId: "w0HgHet0sxg", poster: "https://upload.wikimedia.org/wikipedia/en/e/e5/Aowboxart.jpg", desc: "In a kingdom ruled by magic, a young hero must unite the fractured clans against an ancient darkness." },
  { title: "Crimson Tide", genre: "Action • 1h 55m", rating: "R", trailerId: "TfBCe93T_ec", poster: "https://m.media-amazon.com/images/M/MV5BNTNhZDk2NmQtNDc3ZC00Nzk3LWFmNTctYTc0OWMyNGM0ZWYyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", desc: "A submarine crew faces a moral crisis when conflicting orders mean the difference between war and peace." },
  { title: "Paper Moon", genre: "Drama • 1h 47m", rating: "PG", trailerId: "2LqzF5WauAw", poster: "https://upload.wikimedia.org/wikipedia/en/7/71/Paper-moon_small.jpg", desc: "A bittersweet road trip through a Depression-era landscape between a con man and the girl who may be his daughter." },
  { title: "The Far Horizon", genre: "Sci-Fi • 2h 12m", rating: "PG-13", trailerId: "n9xhJrPXop4", poster: "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p2798_p_v12_al.jpg", desc: "The last crew of a dying Earth sets out across the stars to find a new home among the unexplored reaches." },
];

const normalize = (s) =>
  (s || "").toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export default function Watch() {
  const navigate = useNavigate();
  const { movieTitle } = useParams();
  const found = movies.find((m) => normalize(m.title) === normalize(movieTitle));
  const movie = found || { ...movies[0], title: decodeURIComponent(movieTitle || "Movie") };
  const trailerId = movie.trailerId;

  const related = movies.filter((m) => m.title !== movie.title && m.rating === movie.rating).concat(
    movies.filter((m) => m.title !== movie.title && m.rating !== movie.rating)
  ).slice(0, 4);

  return (
    <div className="wt-page">
      <header className="wt-header">
        <Link to="/" className="wt-logo">
          <span className="wt-logo-icon"><img src="/src/img/gemini-svg.svg" alt="" /></span>
          <span className="wt-logo-text">KHMER <b>CINEMA</b></span>
        </Link>
        <button className="wt-back" onClick={() => navigate(-1)}>← Back</button>
      </header>

      <main className="wt-main">
        <div className="wt-player-shell">
          <div className="wt-player-stage">
            <iframe
              key={trailerId}
              className="wt-video"
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0`}
              title={`${movie.title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="wt-body">
          <div className="wt-meta">
            <span className="wt-rating">{movie.rating}</span>
            <span className="wt-chip">{movie.genre.split("•")[1]?.trim()}</span>
            <span className="wt-chip now"><Calendar size={13} /> Now Showing</span>
          </div>

          <h1 className="wt-title">{movie.title}</h1>
          <p className="wt-genre">{movie.genre}</p>

          <p className="wt-desc">{movie.desc}</p>

          <div className="wt-actions">
            <button className="wt-btn wt-btn-primary" onClick={() => navigate(`/booking/${encodeURIComponent(movie.title)}`)}>
              <Ticket size={16} /> Get Tickets
            </button>
          </div>

          <p className="wt-tip">
            <Film size={15} /> This plays a placeholder online trailer. To use a specific trailer for{" "}
            <b>{movie.title}</b>, edit the <code>trailerId</code> in{" "}
             (a YouTube video ID, e.g. <code>8hP9D6kZseM</code>).
          </p>
        </div>
      </main>

      <section className="wt-related">
        <h2 className="wt-related-title">You might also like</h2>
        <div className="wt-related-grid">
          {related.map((m) => (
            <div className="wt-related-card" key={m.title} onClick={() => navigate(`/watch/${encodeURIComponent(m.title)}`)} style={{ cursor: "pointer" }}>
              <img className="wt-related-poster" src={m.poster} alt={m.title} loading="lazy" />
              <div className="wt-related-name">{m.title}</div>
              <div className="wt-related-genre">{m.genre}</div>
              <button className="wt-related-play"><Play size={13} /> Watch</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
