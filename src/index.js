import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { StarRating } from "./StarRating";
import './index.css';
import App from './App';

const Test = () => {
  const [movieRated, setMovieRated] = useState(0);
  return (
    <>
      <StarRating
        maxRating={5}
        messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
        defaultRating={5}
        onSetRating={setMovieRated}
      />
      <p>This movie was rated {movieRated} stars</p>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={5}
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
      defaultRating={5}
      className={"test"}
    />
    <Test /> */}
  </React.StrictMode>
);
