import { escapeHtml } from './utils.js?v=20261121-7';
import { ALEX_COOLDOWN, alexClock, alexTimeBoards, chapterClockKey } from './alexSpeedrunState.js?v=20261118-20';

const controllers = new WeakMap();
const boardLabels = ['Rozdział 1', 'Rozdział 2', 'Rozdział 3', 'Cała historia'];
const storageKey = player => `grygrupowe-alex-ranked:${player}`;
const timestampLabel = ms => {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 3600)} godz. ${Math.floor(seconds / 60) % 60} min ${seconds % 60} s`;
};

export function alexSpeedrun(root, player, actions, hooks) {
  let controller = controllers.get(root);
  if (!controller || controller.player !== player) {
    controller = makeController(root, player, actions);
    controllers.set(root, controller);
  }
  controller.hooks = hooks;
  return controller;
}

function makeController(root, player, actions) {
  const key = storageKey(player);
  const pendingKey = `${key}:pending`;
  let id = '', pendingId = '';
  try {
    id = localStorage.getItem(key) || '';
    pendingId = localStorage.getItem(pendingKey) || '';
  } catch {}
  let record, busy = false, error = '', board = 'chapter1', rows;
  let boardOpen = false, boardLoading = false, boardError = '', request = 0, timer;
  let observed = '', chapter = 1, done = false;
  const controller = { player, html, bind, canMove, observe, practice };
  const run = () => record?.run;
  const isOwnRun = () => Boolean(id && run()?.id === id);
  const now = () => actions.alexRankNow?.() ?? Date.now();
  const refresh = () => {
    if (root.isConnected && controllers.get(root) === controller && root.querySelector('.journey-page')) {
      controller.hooks.refresh();
    }
  };
  const cooldown = () => Math.max(0, (run()?.reservedAt || 0) + ALEX_COOLDOWN - now());
  const targetStep = () => (chapter - 1) * 3;
  const canLoad = () => actions.alexRankingEligible?.() && (actions.alexRankingReady?.() ?? true);
  const loadStatusIfNeeded = () => {
    if (record === undefined && observed !== 'status' && (id || actions.alexRankingEligible?.()) &&
        (actions.alexRankingReady?.() ?? true)) {
      observed = 'status';
      queueMicrotask(fetchStatus);
    }
  };
  root.addEventListener('alex-rank-ready', () => {
    if (controllers.get(root) !== controller) return;
    loadStatusIfNeeded();
    refresh();
  });

  async function move(type, number = chapter) {
    const result = await actions.alexRankMove?.({ type, chapter: number, id: type === 'reserve' ? pendingId : id });
    if (!result?.run) throw Error('Nie udało się połączyć z rankingiem.');
    record = result;
    return result.run;
  }

  function setId(value) {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
    id = value;
  }

  function clearPending() {
    localStorage.removeItem(pendingKey);
    pendingId = '';
  }

  async function work(task) {
    if (busy) return;
    busy = true;
    error = '';
    refresh();
    try { await task(); }
    catch (failure) {
      error = failure?.code === 'PERMISSION_DENIED'
        ? 'Serwer odrzucił zapis. Odśwież status podejścia i spróbuj ponownie.'
        : failure?.message || 'Nie udało się zapisać podejścia.';
    } finally {
      busy = false;
      refresh();
    }
  }

  function fetchStatus() {
    return work(async () => {
      record = await actions.alexRankStatus?.() ?? null;
      observed = '';
    });
  }

  function reserve() {
    const confirmed = controller.hooks.confirmReset('Rozpocząć podejście rankingowe? Zacznie się od rozdziału 1 i zastąpi bieżący postęp.');
    if (!confirmed) return;
    return work(async () => {
      pendingId ||= crypto.randomUUID();
      localStorage.setItem(pendingKey,pendingId);
      const reserved = await move('reserve');
      if (reserved.id !== pendingId) {
        clearPending();
        throw Error(`Następne podejście za ${timestampLabel(cooldown())}.`);
      }
      controller.hooks.reset();
      setId(pendingId);
      clearPending();
      observed = '';
    });
  }

  function practice() {
    if (!controller.hooks.confirmReset('Zacząć całą historię od nowa poza rankingiem? Zastąpi to bieżący postęp.')) return;
    return work(() => {
      controller.hooks.reset();
      setId('');
      clearPending();
      observed = '';
    });
  }

  function canMove(number) {
    return !id || (isOwnRun() && run().step === (number - 1) * 3 + 1);
  }

  function begin() {
    const expected = targetStep() + 1;
    return work(async () => {
      const updated = await move('begin');
      if (updated.id !== id || updated.step !== expected) throw Error('Nie udało się uruchomić pomiaru tego rozdziału.');
    });
  }

  function finish() {
    const number = chapter, expected = targetStep();
    return work(async () => {
      if (run().step === expected + 1) await move('finish', number);
      if (isOwnRun() && run().step === expected + 2) await move('publish', number);
      if (!isOwnRun() || run().step < expected + 3) throw Error('Nie udało się zapisać wyniku.');
      if (boardOpen) void loadBoard();
    });
  }

  function observe(number, completed) {
    chapter = number;
    done = completed;
    loadStatusIfNeeded();
    if (!id) return;
    if (!completed || !isOwnRun() || ![targetStep() + 1, targetStep() + 2].includes(run().step)) return;
    if (observed === `finish-${number}`) return;
    observed = `finish-${number}`;
    queueMicrotask(finish);
  }

  async function loadBoard() {
    const serial = ++request;
    boardLoading = true;
    boardError = '';
    rows = undefined;
    refresh();
    try {
      const result = await actions.alexRankLeaders?.(board);
      if (serial === request) rows = result || [];
    } catch {
      if (serial === request) boardError = 'Ranking jest chwilowo niedostępny.';
    } finally {
      if (serial === request) { boardLoading = false; refresh(); }
    }
  }

  function html() {
    const ranked = isOwnRun(), step = run()?.step ?? -1, expected = targetStep();
    let status = 'Trening';
    let buttons = '';
    if (id && record === undefined) {
      status = 'Sprawdzanie podejścia rankingowego';
      buttons = '<button class="ghost" data-alex-rank-status>Sprawdź połączenie</button>';
    } else if (id && !ranked) {
      status = 'To podejście zostało zastąpione. Możesz kontynuować poza rankingiem.';
      buttons = '<button class="ghost" data-alex-rank-detach>Kontynuuj trening</button>';
    } else if (ranked) {
      status = 'Podejście rankingowe';
      if (step === expected && !done) buttons = '<button class="primary" data-alex-rank-begin>Rozpocznij pomiar</button>';
      if (step === expected + 1 && !done) status += ' · <time data-alex-rank-clock></time>';
      if (done && [expected + 1, expected + 2].includes(step)) buttons = '<button class="ghost" data-alex-rank-finish>Zapisz wynik</button>';
      if (step >= expected + 3) {
        status = `Wynik zapisany · ${alexClock(run()[chapterClockKey(chapter)].end - run()[chapterClockKey(chapter)].start)}`;
        if (step === 9) status += ` · Cała historia ${alexClock(alexTimeBoards.slice(0,3).reduce((sum,k) => sum + run()[k].end - run()[k].start,0))}`;
      } else if (step < expected) status = 'Najpierw ukończ i zapisz poprzedni rozdział.';
    }
    const remaining = cooldown();
    const eligible = actions.alexRankingEligible?.();
    buttons += `<button class="ghost" data-alex-rank-practice>Powtórz całą historię</button>`;
    if (canLoad() && (pendingId && run()?.id === pendingId || !remaining)) {
      buttons += `<button class="ghost" data-alex-rank-reserve>${pendingId && run()?.id===pendingId?'Wznów rozpoczęcie podejścia':'Nowe podejście rankingowe'}</button>`;
    }
    const availability = eligible
      ? canLoad() ? 'Nowe podejście rankingowe co 5 godzin.' : 'Podejście rankingowe wymaga połączenia z serwerem.'
      : 'Do rankingu potrzebujesz zalogowanego konta.';
    return `<section class="alex-speedrun" aria-label="Rankingi czasu">
      <div class="alex-rank-toolbar"><div><strong>${status}</strong>
        ${remaining ? `<small data-alex-rank-cooldown>Następny start za ${timestampLabel(remaining)}</small>` : `<small>${availability}</small>`}
      </div><div class="alex-rank-actions">${buttons}</div></div>
      <p class="alex-rank-feedback" role="status">${escapeHtml(busy ? 'Łączenie z rankingiem…' : error)}</p>
      <details class="alex-rank-board" ${boardOpen?'open':''}>
        <summary>⏱ Rankingi czasu</summary>
        <div class="alex-rank-tabs" role="group" aria-label="Wybierz ranking">${alexTimeBoards.map((key,index) => `<button class="ghost" type="button" data-alex-rank-board="${key}" aria-pressed="${key === board}">${boardLabels[index]}</button>`).join('')}</div>
        <div class="alex-rank-rows" aria-live="polite">${boardLoading?'Ładowanie…':boardError?`${boardError} <button class="ghost" data-alex-rank-reload>Odśwież</button>`:rows?.length?`<ol>${rows.map(row => `<li ${row.uid===player?'class="own"':''}><span>${escapeHtml(row.nick)}</span><b>${alexClock(row.time)}</b></li>`).join('')}</ol>`:'Brak wyników.'}</div>
      </details>
    </section>`;
  }

  function bind() {
    const on = (attribute, callback) => {
      const button = root.querySelector(`[data-alex-rank-${attribute}]`);
      if (button) { button.disabled = busy; button.onclick = callback; }
    };
    on('status', fetchStatus);
    on('reserve', reserve);
    on('practice', practice);
    on('begin', begin);
    on('finish', finish);
    on('detach', () => work(() => setId('')));
    on('reload', loadBoard);
    const details = root.querySelector('.alex-rank-board');
    if (details) details.ontoggle = () => {
      if (details.open === boardOpen) return;
      boardOpen = details.open;
      if (boardOpen) {
        void loadBoard();
        if (record === undefined && !id && actions.alexRankingEligible?.()) void fetchStatus();
      }
    };
    root.querySelectorAll('[data-alex-rank-board]').forEach(button => {
      button.onclick = () => { board = button.dataset.alexRankBoard; void loadBoard(); };
    });
    clearTimeout(timer);
    const label = root.querySelector('[data-alex-rank-cooldown]');
    const clock = root.querySelector('[data-alex-rank-clock]');
    const tick = () => {
      if (!label?.isConnected && !clock?.isConnected) return;
      const remaining = cooldown();
      if (label) {
        if (!remaining) { refresh(); return; }
        label.textContent = `Następny start za ${timestampLabel(remaining)}`;
      }
      if (clock) clock.textContent = alexClock(Math.max(0, now() - run()[chapterClockKey(chapter)].start));
      timer = setTimeout(tick, clock ? 250 : Math.min(1000, remaining));
      timer.unref?.();
    };
    tick();
  }

  return controller;
}
