import { $, avatarHtml, escapeHtml, icon } from "./utils.js?v=20260822-1";

const historyDate = value => {
  const date = new Date(Number.isFinite(Number(value)) ? Number(value) : value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pl-PL", { day:"2-digit", month:"2-digit", year:"numeric" });
};
const historyResult = value => {
  const result = String(value || "").toLowerCase();
  if (["win", "wygrana"].includes(result)) return { label:"Wygrana", className:"is-win" };
  if (["draw", "remis"].includes(result)) return { label:"Remis", className:"is-draw" };
  if (["loss", "przegrana"].includes(result)) return { label:"Przegrana", className:"is-loss" };
  return { label:"Rozegrano", className:"" };
};
const accountHistoryMarkup = profile => {
  const history = Array.isArray(profile.gameHistory) ? profile.gameHistory.slice(-8).reverse() : [];
  return `<section class="public-profile-section account-history-section"><div class="section-heading"><div><p class="eyebrow">HISTORIA GIER</p><h3>Ostatnie gry</h3></div><span class="badge">${history.length}</span></div>${history.length ? `<div class="account-game-history">${history.map(item => { const result = historyResult(item.result); const date = historyDate(item.playedAt || item.createdAt); const points = Number.isFinite(Number(item.points)) ? `${Number(item.points)} pkt` : ""; return `<div class="account-game-history-row"><div><b>${escapeHtml(item.modeName || item.mode || "Gra")}</b><small>${escapeHtml([date, points].filter(Boolean).join(" · "))}</small></div><strong class="${result.className}">${result.label}</strong></div>`; }).join("")}</div>` : `<p class="muted">Nie rozegrano jeszcze żadnej gry.</p>`}</section>`;
};

export function avatarCropModal(file) {
  return new Promise(resolve => {
    if (!file?.type?.startsWith("image/") || file.size > 8 * 1024 * 1024) return resolve(null);
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => resolve(null);
      image.onload = () => {
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop avatar-crop-backdrop";
        backdrop.innerHTML = `<section class="modal avatar-crop-modal enter" role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title"><div class="modal-title"><div><p class="eyebrow">ZDJĘCIE PROFILOWE</p><h2 id="avatar-crop-title">Dopasuj zdjęcie</h2></div><button class="icon-btn" data-avatar-crop-cancel aria-label="Anuluj">${icon("x",18)}</button></div><p class="muted avatar-crop-help">Przeciągnij zdjęcie i ustaw kadr. Możesz też je powiększyć.</p><div class="avatar-crop-stage" aria-label="Podgląd kadru"><img alt="Podgląd zdjęcia"><span class="avatar-crop-window" aria-hidden="true"></span></div><label class="avatar-crop-zoom" for="avatar-crop-zoom"><span>Powiększenie</span><output id="avatar-crop-zoom-value">100%</output><input id="avatar-crop-zoom" type="range" min="1" max="3" step="0.01" value="1"></label><div class="modal-actions"><button class="ghost" data-avatar-crop-cancel>Anuluj</button><button class="primary" data-avatar-crop-save>Ustaw zdjęcie</button></div></section>`;
        const stage = backdrop.querySelector(".avatar-crop-stage");
        const preview = backdrop.querySelector(".avatar-crop-stage img");
        const zoomInput = backdrop.querySelector("#avatar-crop-zoom");
        const zoomValue = backdrop.querySelector("#avatar-crop-zoom-value");
        const viewport = 280;
        const baseScale = Math.max(viewport / image.naturalWidth, viewport / image.naturalHeight);
        let zoom = 1;
        let offsetX = 0;
        let offsetY = 0;
        let drag = null;
        const dimensions = () => ({ width:image.naturalWidth * baseScale * zoom, height:image.naturalHeight * baseScale * zoom });
        const clampOffset = () => {
          const {width,height} = dimensions();
          offsetX = Math.min(0, Math.max(viewport - width, offsetX));
          offsetY = Math.min(0, Math.max(viewport - height, offsetY));
        };
        const renderPreview = () => {
          const {width,height} = dimensions();
          clampOffset();
          preview.style.width = `${width}px`;
          preview.style.height = `${height}px`;
          preview.style.transform = `translate(${offsetX}px,${offsetY}px)`;
          zoomValue.value = `${Math.round(zoom * 100)}%`;
          zoomValue.textContent = zoomValue.value;
        };
        const centerPreview = () => {
          const {width,height} = dimensions();
          offsetX = (viewport - width) / 2;
          offsetY = (viewport - height) / 2;
          renderPreview();
        };
        const finish = result => { backdrop.remove(); resolve(result); };
        preview.src = reader.result;
        document.body.append(backdrop);
        centerPreview();
        stage.addEventListener("pointerdown", event => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          drag = { pointerId:event.pointerId, clientX:event.clientX, clientY:event.clientY, offsetX, offsetY };
          stage.setPointerCapture?.(event.pointerId);
          stage.classList.add("is-dragging");
        });
        stage.addEventListener("pointermove", event => {
          if (!drag || drag.pointerId !== event.pointerId) return;
          offsetX = drag.offsetX + event.clientX - drag.clientX;
          offsetY = drag.offsetY + event.clientY - drag.clientY;
          renderPreview();
        });
        const stopDrag = event => { if (drag?.pointerId === event.pointerId) { drag = null; stage.classList.remove("is-dragging"); } };
        stage.addEventListener("pointerup", stopDrag);
        stage.addEventListener("pointercancel", stopDrag);
        zoomInput.addEventListener("input", () => {
          const oldScale = baseScale * zoom;
          const centerSourceX = (viewport / 2 - offsetX) / oldScale;
          const centerSourceY = (viewport / 2 - offsetY) / oldScale;
          zoom = Number(zoomInput.value) || 1;
          const newScale = baseScale * zoom;
          offsetX = viewport / 2 - centerSourceX * newScale;
          offsetY = viewport / 2 - centerSourceY * newScale;
          renderPreview();
        });
        backdrop.querySelectorAll("[data-avatar-crop-cancel]").forEach(button => button.addEventListener("click", () => finish(null)));
        backdrop.addEventListener("click", event => { if (event.target === backdrop) finish(null); });
        backdrop.querySelector("[data-avatar-crop-save]").addEventListener("click", () => {
          const {width,height} = dimensions();
          finish({ viewport, offsetX, offsetY, displayWidth:width, displayHeight:height });
        });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function authModal(actions, options = {}) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal auth-modal enter" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <div class="modal-title"><div><p class="eyebrow">KONTO GRACZA</p><h2 id="auth-title">${options.title || "Zaloguj sie, aby grac"}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div>
    <p class="muted">${options.description || "Nick i haslo wystarcza. Nowe konto utworzymy automatycznie."}</p>
    <form id="auth-form"><label for="auth-nick">Nick</label><input id="auth-nick" autocomplete="username" placeholder="np. Gracz123" maxlength="18"><label for="auth-password">Haslo</label><input id="auth-password" autocomplete="current-password" placeholder="minimum 3 znaki" type="password"><label for="auth-birth-date">Data urodzenia przy nowym koncie albo koncie bez daty</label><input id="auth-birth-date" type="date"><p class="tiny">Jesli konto juz ma date, zostaw puste. Date bez potwierdzenia dodasz tylko raz.</p><button class="primary full">Zaloguj / utworz konto</button></form>
    <div class="auth-divider"><span>albo</span></div><button id="guest-login" class="ghost full">Graj tylko po nicku</button>
    <p class="tiny">Mozesz zostawic nick pusty. Wtedy dostaniesz unikalny nick, np. gracz_K7M2PX.</p>
    <p class="guest-note">Tryb goscia pozwala grac i nalicza coiny sesyjne. <b>Zaloguj sie na konto, zeby zapisywac coiny i kupowac efekty.</b></p>
  </section>`;
  const close=()=>actions.closeModal(backdrop);backdrop.querySelector("[data-close]").addEventListener("click",close);
  $("#auth-form",backdrop).addEventListener("submit",async event=>{event.preventDefault();if(await actions.login($("#auth-nick",backdrop).value,$("#auth-password",backdrop).value,"account",$("#auth-birth-date",backdrop).value))close();});
  $("#guest-login",backdrop).addEventListener("click",async()=>{if(await actions.login($("#auth-nick",backdrop).value,"","nickOnly"))close();});
  return backdrop;
}

export function accountModal(profile, actions) {
  const backdrop=document.createElement("div");backdrop.className="modal-backdrop";
  const isAdmin = String(profile.nick || "").toLowerCase() === "panda";
  const inboxCount = Array.isArray(profile.inbox) ? profile.inbox.length : 0;
  const privacy = { historyPublic:true, statsPublic:true, friendsPublic:true, ...(profile.privacy || {}) };
  const honor = { nicePlayer:0, goodOpponent:0, greatHost:0, notVerySmart:0, poorSport:0, ...(profile.honorCounts || {}) };
  const birthSection = profile.birthDate
    ? `<section class="account-info-row birth-date-card"><div class="birth-date-main"><span class="birth-date-icon" aria-hidden="true">🎂</span><div><span class="muted">Data urodzenia</span><b class="birth-date-value">${escapeHtml(profile.birthDate)}</b></div></div><button class="ghost" id="birth-change-request">Zmień</button></section>`
    : `<section class="account-info-row birth-date-card"><div class="birth-date-main"><span class="birth-date-icon" aria-hidden="true">🎂</span><div><span class="muted">Data urodzenia</span><b class="birth-date-value">Nie podano</b></div></div><form id="birth-add-form" class="inline-date-form"><input id="birth-add-date" type="date" required><button class="primary" type="submit">Dodaj</button></form></section>`;
  backdrop.innerHTML=`<section class="modal account-modal enter" role="dialog" aria-modal="true" aria-labelledby="account-title">
    <div class="modal-title"><div><p class="eyebrow">TWOJE KONTO</p><h2 id="account-title">${escapeHtml(profile.nick)}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div>
    <div class="account-summary"><div><span class="muted">Status</span><b>${profile.nickOnly?"Gosc":"Konto zapisane"}</b></div><div><span class="muted">${profile.nickOnly?"Coiny sesyjne":"Coiny"}</span><b>$${profile.nickOnly?profile.sessionMoney||0:profile.money||0}</b></div></div>
    <nav class="account-tabs" role="tablist" aria-label="Sekcje konta"><button type="button" class="account-tab is-active" data-account-tab="private" role="tab" aria-selected="true">Ustawienia konta</button><button type="button" class="account-tab" data-account-tab="public" role="tab" aria-selected="false">Statystyki publiczne</button></nav>
    <div class="account-tab-panel is-active" data-account-panel="private" role="tabpanel">
      ${profile.nickOnly ? "" : birthSection}
      <section class="avatar-editor"><div>${avatarHtml(profile,"account-avatar")}<div><b>Zdjecie profilowe</b><p class="muted">Ramki i aury beda widoczne wokol zdjecia.</p></div></div><label class="file-button">Wybierz zdjecie<input id="avatar-file" type="file" accept="image/*"></label>${profile.avatarImage?'<button class="ghost" id="remove-avatar">Usun zdjecie</button>':""}</section>
      <section class="privacy-settings"><div class="section-heading"><div><p class="eyebrow">PRYWATNOŚĆ</p><h3>Widoczność profilu</h3></div><span class="badge">3 ustawienia</span></div><p class="muted">Domyślnie wszystko jest publiczne. Prywatne informacje nie trafiają do katalogu profili.</p><label class="privacy-setting"><span><b>Historia gier</b><small>Ostatnie rozegrane gry i historia wyników.</small></span><input type="checkbox" data-privacy-setting="historyPublic" ${privacy.historyPublic?"checked":""}></label><label class="privacy-setting"><span><b>Statystyki</b><small>Łączna liczba gier, zwycięstw i porażek.</small></span><input type="checkbox" data-privacy-setting="statsPublic" ${privacy.statsPublic?"checked":""}></label><label class="privacy-setting"><span><b>Lista znajomych</b><small>Lista osób dodanych do znajomych.</small></span><input type="checkbox" data-privacy-setting="friendsPublic" ${privacy.friendsPublic?"checked":""}></label></section>
      ${profile.nickOnly?'<p class="guest-note"><b>Zaloguj sie na konto, zeby zapisywac coiny i kupowac efekty.</b></p>':`<details class="password-box"><summary>Zmien haslo</summary><form id="password-form"><label for="new-password">Nowe haslo</label><input id="new-password" type="password" placeholder="minimum 3 znaki"><button class="primary full">Zapisz nowe haslo</button></form></details>`}
      <div class="account-actions">${profile.nickOnly?'<button class="primary" id="upgrade-account">Zaloguj sie na konto</button>':`<button class="ghost" id="open-inbox">Inbox${inboxCount ? ` (${inboxCount})` : ""}</button>${isAdmin?'<button class="primary" id="open-admin-panel">Panel admina</button>':""}`}<button class="danger" id="account-logout">Wyloguj</button></div>
    </div>
    <div class="account-tab-panel" data-account-panel="public" role="tabpanel" hidden>
      <section class="honor-summary"><div class="section-heading"><div><p class="eyebrow">HONOR</p><h3>Otrzymane wyróżnienia</h3></div><span class="badge">${honor.nicePlayer + honor.goodOpponent + honor.greatHost + honor.notVerySmart + honor.poorSport}</span></div><p class="muted">Wyróżnienia otrzymane od innych graczy po zakończeniu gier.</p><div class="honor-summary-grid"><div class="honor-count"><span>👍</span><strong>${honor.nicePlayer}</strong><small>Miły gracz</small></div><div class="honor-count"><span>🧠</span><strong>${honor.goodOpponent}</strong><small>Dobry przeciwnik</small></div><div class="honor-count"><span>🎉</span><strong>${honor.greatHost}</strong><small>Świetny host</small></div><div class="honor-count honor-count-negative"><span>🤦</span><strong>${honor.notVerySmart}</strong><small>Niezbyt inteligentny</small></div><div class="honor-count honor-count-negative"><span>🙄</span><strong>${honor.poorSport}</strong><small>Uciążliwy gracz</small></div></div></section>
       ${profile.privacy?.statsPublic === false ? `<p class="muted">Twoje statystyki są prywatne.</p>` : `<section class="public-account-stats"><div class="section-heading"><div><p class="eyebrow">WYNIKI</p><h3>Statystyki gier</h3></div></div><div class="public-stat-grid"><div><strong>${Number(profile.gameStats?.played)||0}</strong><small>Rozegrane</small></div><div><strong>${Number(profile.gameStats?.wins)||0}</strong><small>Wygrane</small></div><div><strong>${Number(profile.gameStats?.losses)||0}</strong><small>Przegrane</small></div></div></section>`}
       ${accountHistoryMarkup(profile)}
    </div>
  </section>`;
  const close=()=>actions.closeModal(backdrop);backdrop.querySelector("[data-close]").addEventListener("click",close);
  $("#account-logout",backdrop).addEventListener("click",()=>{close();actions.logout();});$("#upgrade-account",backdrop)?.addEventListener("click",()=>{close();actions.openAuth({title:"Zaloguj sie na konto"});});
  $("#avatar-file",backdrop).addEventListener("change",async event=>{const file=event.target.files[0];event.target.value="";const crop=await avatarCropModal(file);if(!crop)return;await actions.setAvatar(file,crop);close();});$("#remove-avatar",backdrop)?.addEventListener("click",()=>{actions.removeAvatar();close();});
  $("#password-form",backdrop)?.addEventListener("submit",async event=>{event.preventDefault();if(await actions.changePassword($("#new-password",backdrop).value))close();});
  $("#open-inbox",backdrop)?.addEventListener("click",()=>{close();actions.openInbox();});
  $("#open-admin-panel",backdrop)?.addEventListener("click",()=>{close();actions.openAdminPanel();});
  $("#birth-change-request",backdrop)?.addEventListener("click",()=>{close();actions.openBirthDateRequest();});
  backdrop.querySelectorAll("[data-privacy-setting]").forEach(input=>input.addEventListener("change",event=>actions.setProfilePrivacy?.(event.target.dataset.privacySetting,event.target.checked)));
  backdrop.querySelectorAll("[data-account-tab]").forEach(tab=>tab.addEventListener("click",()=>{const target=tab.dataset.accountTab;backdrop.querySelectorAll("[data-account-tab]").forEach(item=>{const active=item===tab;item.classList.toggle("is-active",active);item.setAttribute("aria-selected",String(active));});backdrop.querySelectorAll("[data-account-panel]").forEach(panel=>{const active=panel.dataset.accountPanel===target;panel.classList.toggle("is-active",active);panel.hidden=!active;});}));
  $("#birth-add-form",backdrop)?.addEventListener("submit",event=>{event.preventDefault();if(actions.setOwnBirthDate($("#birth-add-date",backdrop).value))close();});
  return backdrop;
}
