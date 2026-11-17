// Game-request form: sends to Web3Forms (the same inbox as the in-game form)
(function () {
  const KEY = 'a17a1508-386f-400c-895f-073c01b9d7a0';
  const form = document.getElementById('reqForm'); if (!form) return;
  const msg = document.getElementById('reqMsg'), btn = document.getElementById('reqSend');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idea = document.getElementById('reqIdea').value.trim(), email = document.getElementById('reqEmail').value.trim();
    if (!idea) return;
    if (!navigator.onLine) { msg.textContent = 'You are offline. Please send your idea when you are connected.'; return; }
    btn.disabled = true; msg.textContent = 'Sending…';
    try {
      const body = { access_key: KEY, subject: 'New game request (Lyman Learning website)', from_name: 'Lyman Learning website', idea };
      if (email) body.email = email;
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('failed');
      form.innerHTML = '<p class="req-msg">Thank you! We got your idea.</p>';
    } catch (err) { msg.textContent = 'Hmm, that did not send. Please try again in a minute.'; btn.disabled = false; }
  });
})();

// Game finder: subject buttons (alphabetical) + search by name or keyword
(function () {
  const list = document.getElementById('gameList'), bar = document.getElementById('subjects'), search = document.getElementById('gameSearch');
  if (!list) return;
  let subject = 'All';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const subjects = ['All', ...window.SUBJECTS.slice().sort((a, b) => a.localeCompare(b))];
  bar.innerHTML = subjects.map((s, i) => `<button role="tab" class="sub sub${i % 9}" data-s="${esc(s)}" aria-selected="${s === subject}">${esc(s)}</button>`).join('');
  bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; subject = b.dataset.s; render(); });
  search.addEventListener('input', render);
  const card = (g) => `<article class="game">
      <a href="${esc(g.url)}" class="game-img"><span class="tape" aria-hidden="true"></span><img src="${esc(g.image)}" alt="${esc(g.name)}" loading="lazy" width="1100" height="700"></a>
      <div class="game-body">
        <p class="game-subject">${esc(g.subject)}</p>
        <h3>${esc(g.name)} <span>${esc(g.subtitle)}</span></h3>
        <p>${esc(g.description)}</p>
        <ul class="tags">${[g.subject, ...g.alsoTeaches].map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <ul class="game-facts">${g.facts.map((f) => `<li>${f}</li>`).join('')}</ul>
        <a class="btn btn-primary" href="${esc(g.url)}">Play ${esc(g.name)}</a>
      </div></article>`;
  const coming = (empty) => `<article class="game coming"><div class="game-body">
      <h3>${empty ? 'No games here yet' : 'More games are growing'}</h3>
      <p>${empty ? 'We have not made a game for this yet — want to help us choose what is next?' : 'We are building new games all the time, and we love ideas from families like yours.'}</p>
      <a class="btn btn-ghost" href="#request">Request a game</a></div></article>`;
  function render() {
    bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', b.dataset.s === subject));
    const q = search.value.trim().toLowerCase();
    const hits = window.GAMES.filter((g) => (subject === 'All' || g.subject === subject) &&
      (!q || [g.name, g.subtitle, g.subject, ...g.alsoTeaches, ...g.keywords, g.description].join(' ').toLowerCase().includes(q)));
    list.innerHTML = hits.map(card).join('') + coming(!hits.length);
  }
  render();
})();
