import { render } from "preact";
import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";

const KEY = ["chief", "product", "officer"];

const LETTER_STATE = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
  PENDING: "pending",
}

function initGameState(words) {
  return {
    text: words.map(
      (word) => word.split("").map(
        (letter, index) => ({
          key: letter,
          display: index === 0 ? letter : '_',
          state: index === 0 ? LETTER_STATE.CORRECT : LETTER_STATE.PENDING
        })
      )
    ),
    focus: {
      word: 0,
      letter: 1,
    },
  }
}

export function App() {
  const [state, setState] = useState(initGameState(KEY));
  // const [[wordFocus, letterFocus], setFocus] = useState([0, 1]);

  useEffect(() => {
    const keyhandler = (e) => {
      const letter = getLetter(e);
      console.log('letter', letter);
      if (!letter) return;

      // update state to 
      // place the letter in the current focus position
      // advance the focus
      setState(updateState(letter));
      // setFocus(updateFocus);
    }

    document.addEventListener('keydown', keyhandler);
    return () => document.removeEventListener('keydown', keyhandler);
  }, []);

  function updateFocus(prevWord, prevLetter) {
    const newLetterFocus = prevLetter + 1;
    const letterOutOfBounds = newLetterFocus >= state.text[prevWord].length;
    if (letterOutOfBounds) {
      const wordOutOfBounds = prevWord + 1 >= state.text.length;
      if (wordOutOfBounds) {
        return { word: prevWord, letter: prevLetter };
      }
      const nextFocus = { word: prevWord + 1, letter: 0 };
      console.log('setting focus to', nextFocus);
      return nextFocus;
    } else {
      const nextFocus = { word: prevWord, letter: newLetterFocus };
      console.log('setting focus to', nextFocus);
      return nextFocus;
    }
  }

  function updateState(newLetter) {
    return function (oldState) {
      return {
        text: oldState.text.map((word, wordIndex) => {
          return word.map((letter, letterIndex) => {
            if (wordIndex === oldState.focus.word && letterIndex === oldState.focus.letter) {
              return {
                ...letter,
                display: newLetter,
              };
            }
            return letter;
          })
        }),
        focus: updateFocus(oldState.focus.word, oldState.focus.letter),
      }
    }
  }

  function isFocused(wordIndex, letterIndex) {
    return state.focus.word === wordIndex && state.focus.letter === letterIndex;
  }

  return html`
    <div id="game">
      ${state.text.map(
    (word, wordIndex) =>
      html`<div class="word">
            ${word.map(({ display, state: letterState }, letterIndex) => html`
                <span 
                  class="letter" 
                  style="
                    color: ${letterState === LETTER_STATE.CORRECT ? 'green' : 'gray'};
                    border: 2px solid ${isFocused(wordIndex, letterIndex) ? 'red' : 'transparent'};
                  ">
                    ${display}
                </span> 
            `)}
            
          </div>`
  )}
    </div>
  `;
}

function getLetter(keydownEvent) {
  if (keydownEvent.repeat) return false;
  if (keydownEvent.key.length > 1) return false;
  const match = keydownEvent.key.match(/[a-z]/i)
  return match ? match[0] : false;

}

render(html`<${App} />`, document.getElementById("game"));

