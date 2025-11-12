import { render } from "preact";
import { html } from "htm/preact";
import { useState } from "preact/hooks";
console.log("Hello, world!");

const KEY = ["chief", "product", "officer"];

const LETTER_STATE = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
  PENDING: "pending",
}

function initGameState(words) {
  return words.map(
    (word) => word.split("").map(
        (letter, index) => ({ 
            letter: index === 0 ? letter : '_', 
            state: index === 0 ? LETTER_STATE.CORRECT : LETTER_STATE.PENDING 
        })
    )
  );
}

export function App() {
  const [state, setState] = useState(initGameState(KEY));
  const [focus, setFocus] = useState([0, 0]);

  return html`
    <div id="game">
      ${state.map(
        (word) =>
          html`<div class="word">
            ${word.map(({letter, state}) => html`
                <span class="letter" style="color: ${state === LETTER_STATE.CORRECT ? 'green' : 'gray'}">
                    ${letter}
                </span> 
            `)}
            
          </div>`
      )}
    </div>
  `;
}

render(html`<${App} />`, document.getElementById("game"));
