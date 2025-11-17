import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";

const KEY = ["three", "letter", "acronym"];

const LETTER_STATE = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
  PENDING: "pending",
};

export function App() {
  const [state, setState] = useState(initGameState(KEY));

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, []);

  function keyDownHandler(e) {
    if (e.key === "Backspace") {
      setState(handleBackspace);
      return;
    }
    const letter = getLetter(e);
    console.log("letter", letter);
    if (!letter) return;

    // update state to
    // place the letter in the current focus position
    // advance the focus
    setState(bindAddLetter(letter));
  }

  function isFocused(wordIndex, letterIndex) {
    return state.focus.word === wordIndex && state.focus.letter === letterIndex;
  }

  return html`
    <div id="game">
      ${state.text.map(
        (word, wordIndex) =>
          html`<div class="word">
            ${word.map(
              ({ display, state: letterState }, letterIndex) => html`
                <span
                  class="letter"
                  style="
                    color: ${letterState === LETTER_STATE.CORRECT ? "green" : "gray"};
                    border: 2px solid ${isFocused(wordIndex, letterIndex) ? "red" : "transparent"};
                  "
                >
                  ${display}
                </span>
              `
            )}
          </div>`
      )}
    </div>
  `;
}

function initGameState(words) {
  return {
    text: words.map((word) =>
      word.split("").map((letter, index) => ({
        key: letter,
        display: index === 0 ? letter : "_",
        state: index === 0 ? LETTER_STATE.CORRECT : LETTER_STATE.PENDING,
      }))
    ),
    focus: {
      word: 0,
      letter: 1,
    },
  };
}

function getLetter(keydownEvent) {
  if (keydownEvent.repeat) return false;
  if (keydownEvent.key.length > 1) return false;
  const match = keydownEvent.key.match(/[a-z]/i);
  return match ? match[0] : false;
}


function bindAddLetter(newLetter) {
    return function addLetter(oldState) {
      console.log('add letter')
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
          });
        }),
        focus: advanceFocus(oldState),
      };
    };
  }
// todo skip confirmed letters, advance until unconfirmed space
function advanceFocus(oldState) {
  // scan forwards through focus for empty letter
//   const prevWord = oldState.focus.word;
//   const prevLetter = oldState.focus.letter;

//   const newLetterFocus = prevLetter + 1;
//   const letterOutOfBounds = newLetterFocus >= state.text[prevWord].length;
//   if (letterOutOfBounds) {
//     const wordOutOfBounds = prevWord + 1 >= state.text.length;
//     if (wordOutOfBounds) {
//       return { word: prevWord, letter: prevLetter };
//     }
//     return { word: prevWord + 1, letter: 0 };
//   } else {
//     return { word: prevWord, letter: newLetterFocus };
//   }

  let indexToFocus = getNextIndex(oldState, [oldState.focus.word, oldState.focus.letter])
  let isEmpty = false;
  while(!isEmpty) {
    console.log('is not empty, next:', oldState.text[indexToFocus[0]][indexToFocus[1]] )
    const check = oldState.text[indexToFocus[0]][indexToFocus[1]].display === '_';
    console.log('check', check)
    if(check) {
        isEmpty = true;
    } else {
        console.log('calling getNextIndex with', indexToFocus)
        indexToFocus = getNextIndex(oldState, indexToFocus)
        console.log('updated indexToFocus to', indexToFocus)
    }
  }
  return {word: indexToFocus[0], letter: indexToFocus[1]};

}

function getNextIndex(oldState, [wordIndex, letterIndex]) {
    console.log('getNextIndex')
    const nextLetterIndex = letterIndex + 1;
    console.log('nextLetterIndex', nextLetterIndex)
    console.log('oldState.text[wordIndex].length', oldState.text[wordIndex].length)
    if(nextLetterIndex >= oldState.text[wordIndex].length) {

        const nextWordIndex = wordIndex + 1;
        if (nextWordIndex >= oldState.text.length) {
            console.log('dont change the index')
            return [wordIndex, letterIndex]
        } else {
            return [nextWordIndex, 0]
        }
    } else {
        return [wordIndex, nextLetterIndex]
    }
}

function handleBackspace(oldState) {
  // scan backwards through focus for unconfirmed letter, remove it
  let indexToRemove = getPreviousIndex(oldState, [oldState.focus.word, oldState.focus.letter]);
  let hasUnconfirmedLetter = false;
  while (!hasUnconfirmedLetter) {
    const check = indexHasUnconfirmedLetter(oldState, indexToRemove);
    if (check) {
      hasUnconfirmedLetter = true;
    } else {
      indexToRemove = getPreviousIndex(oldState, indexToRemove);
    }
  }

  return {
    text: oldState.text.map((word, wordIndex) => {
      return word.map((letter, letterIndex) => ({
        ...letter,
        display: wordIndex === indexToRemove[0] && letterIndex == indexToRemove[1] ? "_" : letter.display,
      }));
    }),
    focus: {
      word: indexToRemove[0],
      letter: indexToRemove[1],
    },
  };
}

function getPreviousIndex(oldState, [wordIndex, letterIndex]) {
  const prevLetterIndex = letterIndex - 1;
  if (prevLetterIndex < 0) {
    const prevWordIndex = wordIndex - 1;
    if (prevWordIndex < 0) {
      return [wordIndex, letterIndex];
    } else {
      return [prevWordIndex, oldState.text[prevWordIndex].length - 1];
    }
  } else {
    return [wordIndex, prevLetterIndex];
  }
}

function indexHasUnconfirmedLetter(oldState, [wordIndex, letterIndex]) {
  const position = oldState.text[wordIndex][letterIndex];
  console.log({ position });
  const hasUnconfirmedLetter = position.state !== LETTER_STATE.CORRECT && position.display !== "_";
  console.log({ wordIndex, letterIndex, position, hasUnconfirmedLetter });
  return hasUnconfirmedLetter;
}
