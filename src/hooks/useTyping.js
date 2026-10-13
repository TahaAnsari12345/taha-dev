import { useEffect, useState } from 'react';

/** Types and deletes through `phrases` forever. With `still` it just rotates whole phrases. */
export default function useTyping(phrases, { still = false, type = 55, erase = 28, hold = 1700 } = {}) {
  const [text, setText] = useState(still ? phrases[0] : '');

  useEffect(() => {
    if (still) {
      let i = 0;
      const id = setInterval(() => {
        i = (i + 1) % phrases.length;
        setText(phrases[i]);
      }, 3200);
      return () => clearInterval(id);
    }

    let i = 0;
    let n = 0;
    let deleting = false;
    let timer;
    const tick = () => {
      const full = phrases[i];
      n += deleting ? -1 : 1;
      setText(full.slice(0, n));
      let delay = deleting ? erase : type;
      if (!deleting && n === full.length) {
        deleting = true;
        delay = hold;
      } else if (deleting && n === 0) {
        deleting = false;
        i = (i + 1) % phrases.length;
        delay = 350;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [phrases, still, type, erase, hold]);

  return text;
}
