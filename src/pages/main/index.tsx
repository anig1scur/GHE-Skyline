import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const [author, setAuthor] = useState<string>("");
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(thisYear - 1);
  const navigate = useNavigate();
  return (
    <div className='skyline-index'>
      <nav>
        <a
          id='title'
          className='nav-title'>
          GitHub Skyline
        </a>
      </nav>
      <div
        className='selection-screen'
        id='selectionScreen'>
        <h1>
          What would <strong>Your</strong> skyline look like?
        </h1>
        <h3>Create a 3D model from your GitHub contributions.</h3>
        <div className='skyline'>
          <span className='select'>
            <select
              defaultValue={year}
              onChange={(e) => {
                setYear(parseInt(e.target.value));
              }}
              required>
              {Array.from(Array(10).keys()).map((i) => (
                <option
                  key={i}
                  value={thisYear - i}>
                  {thisYear - i}
                </option>
              ))}
            </select>
          </span>
          <input
            type='text'
            required
            placeholder='GitHub Username'
            onChange={(e) => {
              setAuthor(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                if (!(author && year)) {
                  alert("Please input your username and year");
                } else {
                  navigate(`/${author}/${year}`);
                }
              }
            }}
          />
          <button
            className='btn-ghc'
            type='submit'
            onClick={() => {
              if (!(author && year)) {
                alert("Please input your username and year");
              }
              navigate(`/${author}/${year}`);
            }}>
            Create!
          </button>
        </div>
      </div>

      <div className='buttons-options'>
        <button
          className='btn-ghc'
          id='download'
          title="Download the City's 3D model as a STL file">
          <i className='fa-solid fa-download'></i>
        </button>
        <button
          className='btn-ghc'
          id='autorotate'
          title='Toggle auto-rotate'>
          <i className='fa-solid fa-rotate'></i>
        </button>
        <p className='options-caption'>Shadow preset</p>
        <input
          id='shadowPreset'
          type='range'
          min='1'
          max='2'
          value='1'
        />
      </div>

      <div
        id='displayInfo'
        className='display-info'></div>

      <div className='mobile-rotate'>
        <h4>Please rotate your device</h4>
        <span className='ico-anim'>
          <i className='fa-solid fa-mobile'></i>
        </span>
        <p className='caption'>For the best experience, visit this website on desktop.</p>
      </div>

      <footer>
        <a
          href='https://github.com/anig1scur/e-Skyline/issues'
          className='footer-link'>
          <i className='fa-solid fa-bug'></i>
          Report a bug
        </a>
      </footer>
    </div>
  );
};

export default Main;
