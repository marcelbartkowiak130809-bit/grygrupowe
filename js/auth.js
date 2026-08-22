import { $, avatarHtml, escapeHtml, icon } from "./utils.js?v=20260605-5";

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
    ? `<section class="account-info-row"><div><span class="muted">Data urodzenia</span><b>${escapeHtml(profile.birthDate)}</b><p class="tiny">Zmiana wymaga prosby do administracji.</p></div><button class="ghost" id="birth-change-request">Zmien</button></section>`
    : `<section class="account-info-row"><div><span class="muted">Data urodzenia</span><b>nie podano</b><p class="tiny">Mozesz dodac ja raz samodzielnie. Pozniejsza zmiana wymaga administracji.</p></div><form id="birth-add-form" class="inline-date-form"><input id="birth-add-date" type="date" required><button class="primary" type="submit">Dodaj</button></form></section>`;
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
    </div>
  </section>`;
  const close=()=>actions.closeModal(backdrop);backdrop.querySelector("[data-close]").addEventListener("click",close);
  $("#account-logout",backdrop).addEventListener("click",()=>{close();actions.logout();});$("#upgrade-account",backdrop)?.addEventListener("click",()=>{close();actions.openAuth({title:"Zaloguj sie na konto"});});
  $("#avatar-file",backdrop).addEventListener("change",async event=>{await actions.setAvatar(event.target.files[0]);close();});$("#remove-avatar",backdrop)?.addEventListener("click",()=>{actions.removeAvatar();close();});
  $("#password-form",backdrop)?.addEventListener("submit",async event=>{event.preventDefault();if(await actions.changePassword($("#new-password",backdrop).value))close();});
  $("#open-inbox",backdrop)?.addEventListener("click",()=>{close();actions.openInbox();});
  $("#open-admin-panel",backdrop)?.addEventListener("click",()=>{close();actions.openAdminPanel();});
  $("#birth-change-request",backdrop)?.addEventListener("click",()=>{close();actions.openBirthDateRequest();});
  backdrop.querySelectorAll("[data-privacy-setting]").forEach(input=>input.addEventListener("change",event=>actions.setProfilePrivacy?.(event.target.dataset.privacySetting,event.target.checked)));
  backdrop.querySelectorAll("[data-account-tab]").forEach(tab=>tab.addEventListener("click",()=>{const target=tab.dataset.accountTab;backdrop.querySelectorAll("[data-account-tab]").forEach(item=>{const active=item===tab;item.classList.toggle("is-active",active);item.setAttribute("aria-selected",String(active));});backdrop.querySelectorAll("[data-account-panel]").forEach(panel=>{const active=panel.dataset.accountPanel===target;panel.classList.toggle("is-active",active);panel.hidden=!active;});}));
  $("#birth-add-form",backdrop)?.addEventListener("submit",event=>{event.preventDefault();if(actions.setOwnBirthDate($("#birth-add-date",backdrop).value))close();});
  return backdrop;
}
