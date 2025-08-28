(function(){
  const min = 1;
  const max = 100;
  const maxAttempts = 7;

  const input = document.getElementById('guessInput');
  const guessBtn = document.getElementById('guessBtn');
  const resetBtn = document.getElementById('resetBtn');
  const feedback = document.getElementById('feedback');
  const attemptsEl = document.getElementById('attempts');
  const remainingEl = document.getElementById('remaining');
  const maxA1 = document.getElementById('maxAttempts');
  const maxA2 = document.getElementById('maxAttempts2');
  const progress = document.getElementById('progress');
  const lowBoundEl = document.getElementById('lowBound');
  const highBoundEl = document.getElementById('highBound');
  const rangeHint = document.getElementById('rangeHint');
  const history = document.getElementById('history');
  const bestEl = document.getElementById('best');
  const confettiBox = document.querySelector('.confetti');

  let secret, attempts, lowBound, highBound, over, best = null;

  function rand(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function init(newRound = true){
    secret = rand(min, max);
    attempts = 0; lowBound = min; highBound = max; over = false;
    attemptsEl.textContent = attempts;
    remainingEl.textContent = maxAttempts - attempts;
    maxA1.textContent = maxAttempts; maxA2.textContent = maxAttempts;
    feedback.textContent = '';
    feedback.className = 'feedback';
    input.value = '';
    input.disabled = false; guessBtn.disabled = false;
    updateRange();
    updateProgress();
    history.innerHTML = '';
    info('Tip: Press Enter to submit.');
  }

  function info(text){
    document.getElementById('infoText').innerHTML = text;
  }

  function updateProgress(){
    const pct = (attempts / maxAttempts) * 100;
    progress.style.width = pct + '%';
    remainingEl.textContent = Math.max(0, maxAttempts - attempts);
    attemptsEl.textContent = attempts;
  }

  function updateRange(){
    lowBoundEl.textContent = lowBound;
    highBoundEl.textContent = highBound;
  }

  function addHistory(guess, relation){
    const item = document.createElement('div');
    item.className = 'history-item';
    const tag = relation === 0 ? '✅ Correct' : relation < 0 ? '📉 Too low' : '📈 Too high';
    item.innerHTML = `<div><strong>${guess}</strong> <small>${new Date().toLocaleTimeString()}</small></div><div>${tag}</div>`;
    history.prepend(item);
  }

  function celebrate(){
    confettiBox.innerHTML = '';
    const bits = 80;
    const colors = ['#7aa2ff','#5cf0c1','#ffd166','#ff7b7b','#c084fc'];
    for(let i=0;i<bits;i++){
      const s = document.createElement('span');
      s.style.left = Math.random()*100+'%';
      s.style.background = colors[i%colors.length];
      s.style.opacity = 1;
      s.animate([
        { transform: `translateY(-20px) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(${400+Math.random()*200}px) rotate(${Math.random()*720-360}deg)`, opacity: 0 }
      ], { duration: 1200 + Math.random()*800, easing:'cubic-bezier(.2,.7,.2,1)' });
      confettiBox.appendChild(s);
    }
  }

  function endGame(win){
    over = true; input.disabled = true; guessBtn.disabled = true;
    if(win){
      feedback.textContent = `🎉 Correct! You guessed it in ${attempts} ${attempts===1?'attempt':'attempts'}.`;
      feedback.className = 'feedback correct';
      if(best === null || attempts < best){ best = attempts; bestEl.textContent = best; }
      celebrate();
    } else {
      feedback.textContent = `😢 Out of attempts! The number was ${secret}.`;
      feedback.className = 'feedback out';
    }
  }

  function handleGuess(){
    if(over) return;
    const val = Number(input.value.trim());
    if(!Number.isInteger(val) || val < min || val > max){
      feedback.textContent = '❌ Please enter a valid number between 1 and 100.';
      feedback.className = 'feedback out';
      input.focus();
      return;
    }
    attempts++;
    updateProgress();
    if(val === secret){
      addHistory(val, 0);
      endGame(true);
      return;
    }
    if(val < secret){
      feedback.textContent = '📉 Too low!';
      feedback.className = 'feedback low';
      addHistory(val, -1);
      lowBound = Math.max(lowBound, val + 1);
      info(`Try a higher number. New range: <strong>${lowBound}</strong> – <strong>${highBound}</strong>.`);
    } else {
      feedback.textContent = '📈 Too high!';
      feedback.className = 'feedback high';
      addHistory(val, 1);
      highBound = Math.min(highBound, val - 1);
      info(`Try a lower number. New range: <strong>${lowBound}</strong> – <strong>${highBound}</strong>.`);
    }
    updateRange();
    input.select();
    if(attempts >= maxAttempts){ endGame(false); }
  }

  // Events
  guessBtn.addEventListener('click', handleGuess);
  resetBtn.addEventListener('click', () => init(true));
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') handleGuess();
  });
  window.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase() === 'r') init(true);
  });

  // Persist best score
  try{
    const stored = localStorage.getItem('guess-best');
    if(stored) best = Number(stored);
  }catch{}
  const bestObserver = new MutationObserver(()=>{
    try{ if(best!==null) localStorage.setItem('guess-best', String(best)); }catch{}
  });
  bestObserver.observe(document.getElementById('best'), { childList:true });
  if(best!==null) bestEl.textContent = best;

  // Start game
  init(true);
})();
