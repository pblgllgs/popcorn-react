import { useEffect, useState } from "react";
import { StarRating } from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f7c7d00a";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  /*
  useEffect(() => {
    console.log("After intial render")
  }, [])

  useEffect(() => {
    console.log("After every render")
  })

  useEffect(() => {
    console.log("conditionally")
  }, [query])
  */
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        handleCloseMovie();
        console.log("CLOSING");
      }
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const getMovies = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error("Something went wrong");
        }
        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("Movie not found");
        }
        setMovies(data.Search);
        setError("");
      } catch (err) {
        console.error(err.message);
        if (err.name !== "AbortError") {
          setError(err.message);
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    handleCloseMovie()
    getMovies();
    return () => {
      controller.abort();
    };
  }, [query]);

  const handleSelected = (id) => {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  };

  const handleCloseMovie = (id) => {
    setSelectedId(null);
  };

  const ErrorMessage = ({ message }) => {
    return <p className="error">{message}</p>;
  };

  const handleAddWatched = (movie) => {
    setWatched((watched) => [...watched, movie]);
  };

  const handleDeleteWatched = (id) => {
    setWatched((watched) => watched.filter((m) => m.imdbID !== id));
  };
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {loading && <Loading />}
          {!loading && !error && (
            <MovieList onHandleSelectedId={handleSelected} movies={movies} />
          )}
          {error && <ErrorMessage />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              onHandleWatched={handleAddWatched}
              onHandleCloseMovie={handleCloseMovie}
              selectedId={selectedId}
              watched={watched}
              onCloseMovie={handleCloseMovie}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onHandleDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

const Loading = () => {
  return <p className="loader">Loading...</p>;
};

const NavBar = ({ children }) => {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
};

const Logo = () => {
  return (
    <>
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
    </>
  );
};

const NumResults = ({ movies }) => {
  return (
    <>
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    </>
  );
};

const Search = ({ query, setQuery }) => {
  
  return (
    <>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </>
  );
};

const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <div className="box" style={{ overflowY: "hidden", overflowX: "hidden" }}>
        <button
          className="btn-toggle"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? "–" : "+"}
        </button>
        {isOpen && children}
      </div>
    </>
  );
};

const MovieList = ({ movies, onHandleSelectedId }) => {
  return (
    <>
      <ul className="list" style={{ overflowY: "hidden", overflowX: "hidden" }}>
        {movies?.map((movie) => (
          <Movie
            onHandleSelectedId={onHandleSelectedId}
            movie={movie}
            key={movie.imdbID}
          />
        ))}
      </ul>
    </>
  );
};

const Movie = ({ movie, onHandleSelectedId }) => {
  return (
    <>
      <li key={movie.imdbID} onClick={() => onHandleSelectedId(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </li>
    </>
  );
};

const MovieDetails = ({
  watched,
  onHandleWatched,
  selectedId,
  onHandleCloseMovie,
  onCloseMovie,
}) => {
  const [movieSelected, setMovieSelected] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Poster: poster,
    Runtime: runtime,
    Year: year,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieSelected;

  useEffect(() => {
    const getMovie = async () => {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovieSelected(data);
      setIsLoading(false);
    };
    getMovie();
  }, [selectedId]);

  const handleAdd = () => {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onHandleWatched(newWatchedMovie);
    onHandleCloseMovie();
  };

  useEffect(() => {
    const callback = (e) => {
      if (e.code === "Escape") {
        onCloseMovie();
        console.log("CLOSING");
      }
    };

    document.addEventListener("keydown", callback);
    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [onCloseMovie]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return () => {
      console.log(`Clean up effect for movie ${title}`);
      return (document.title = "UsePopcorn");
    };
  }, [title]);

  return (
    <>
      <div className="details">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <header>
              <button className="btn-back" onClick={onHandleCloseMovie}>
                &larr;
              </button>
              <img src={poster} alt={title} />
              <div className="details-overview">
                <h2>{title}</h2>
                <p>
                  {released}&bull; {runtime}
                </p>
                <p>{genre}</p>
                <p>
                  <span>☢</span>
                  {imdbRating} IMDB rating
                </p>
              </div>
            </header>
            <section>
              <div className="rating">
                {!isWatched ? (
                  <>
                    <StarRating
                      maxRating={10}
                      size={30}
                      defaultRating={imdbRating}
                      onSetRating={setUserRating}
                    />
                    {userRating > 0 && (
                      <button
                        className="btn-add"
                        onClick={() => handleAdd(movieSelected)}
                      >
                        watched
                      </button>
                    )}
                  </>
                ) : (
                  <p>
                    You rated with movie {watchedUserRating}
                    <span>⭐</span>
                  </p>
                )}
              </div>
              <p>{plot}</p>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
            </section>
          </>
        )}
      </div>
    </>
  );
};

const WatchedSummary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  const [movieRated, setMovieRated] = useState(0);
  return (
    <>
      <div className="summary">
        <h2>Movies you watched</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched.length} movies</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(2)}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime} min</span>
          </p>
        </div>
        <StarRating
          maxRating={5}
          size={32}
          messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
          defaultRating={5}
          className={"test"}
          onSetRating={setMovieRated}
        />
      </div>
    </>
  );
};

const WatchedMoviesList = ({ watched, onHandleDeleteWatched }) => {
  return (
    <>
      <ul className="list" style={{ overflowY: "hidden", overflowX: "hidden" }}>
        {watched.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            onHandleDeleteWatched={onHandleDeleteWatched}
          />
        ))}
      </ul>
    </>
  );
};

const WatchedMovie = ({ movie, onHandleDeleteWatched }) => {
  return (
    <>
      <li key={movie.imdbID}>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button
            className="btn-delete"
            onClick={() => onHandleDeleteWatched(movie.imdbID)}
          >
            X
          </button>
        </div>
      </li>
    </>
  );
};
