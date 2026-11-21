import { escapeHtml } from './utils.js?v=20261121-7';

const prices = { hint: 100, nudge: 75, solution: 150 };

export function minecraftHintPurchase(profile, key) {
  const match = /^(?:backpack-[1-9][0-9]*-(hint)|alex-[1-3]-[1-9][0-9]*-(nudge|solution))$/.exec(key);
  if (!match) return { error: 'Ta podpowiedź jest niedostępna.' };
  if (!profile) return { error: 'Wejdź na konto lub zagraj pod nickiem, żeby kupić podpowiedź.' };
  if (profile.minecraftHints?.[key] === true) return {};

  const field = profile.nickOnly ? 'sessionMoney' : 'money';
  const balance = Number(profile[field]) || 0;
  const price = prices[match[1] || match[2]];
  if (balance < price) return { error: `Potrzebujesz $${price}. Masz $${balance}.` };
  return {
    patch: {
      [field]: balance - price,
      minecraftHints: { ...profile.minecraftHints, [key]: true },
    },
  };
}

export function minecraftHintPanel(root, actions, { key, hint, solution, available = true }) {
  const options = solution
    ? [['nudge', 'Wskazówka', hint], ['solution', 'Rozwiązanie krok po kroku', solution]]
    : [['hint', 'Wskazówka', hint]];
  const current = root.querySelector('[data-minecraft-hints]');
  const open = current?.getAttribute('data-minecraft-hints') === key && current.hasAttribute('open');
  return `<details class="minecraft-hints" data-minecraft-hints="${key}" ${available && open ? 'open' : ''} ${available ? '' : 'hidden'}>
    <summary>Podpowiedzi <span>${options.map(([tier]) => `$${prices[tier]}`).join(' / ')}</span></summary>
    <div class="minecraft-hint-options">${options.map(([tier, label, content]) => {
      const id = `${key}-${tier}`;
      return actions.hasMinecraftHint?.(id)
        ? `<div class="minecraft-hint-answer"><strong>${label}</strong><p>${escapeHtml(content)}</p></div>`
        : `<button class="ghost" type="button" data-minecraft-buy-hint="${id}" ${available ? '' : 'disabled'}>${label} <b>$${prices[tier]}</b></button>`;
    }).join('')}</div>
    <p class="minecraft-hint-status" role="status"></p>
  </details>`;
}

export function bindMinecraftHints(root, actions, redraw) {
  root.querySelectorAll('[data-minecraft-buy-hint]').forEach(button => {
    button.onclick = () => {
      const panel = button.closest('[data-minecraft-hints]');
      const error = actions.buyMinecraftHint
        ? actions.buyMinecraftHint(button.dataset.minecraftBuyHint)
        : 'Zakup podpowiedzi jest teraz niedostępny.';
      if (error) {
        panel.querySelector('[role="status"]').textContent = error;
        return;
      }
      redraw();
      const updated = root.querySelector('[data-minecraft-hints]');
      updated?.querySelector('summary')?.focus({ preventScroll: true });
      const status = updated?.querySelector('[role="status"]');
      if (status) status.textContent = 'Podpowiedź odblokowana.';
    };
  });
}
