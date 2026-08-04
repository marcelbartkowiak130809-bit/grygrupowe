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
  const birthSection = profile.birthDate
    ? `<section class="account-info-row"><div><span class="muted">Data urodzenia</span><b>${escapeHtml(profile.birthDate)}</b><p class="tiny">Zmiana wymaga prosby do administracji.</p></div><button class="ghost" id="birth-change-request">Zmien</button></section>`
    : `<section class="account-info-row"><div><span class="muted">Data urodzenia</span><b>nie podano</b><p class="tiny">Mozesz dodac ja raz samodzielnie. Pozniejsza zmiana wymaga administracji.</p></div><form id="birth-add-form" class="inline-date-form"><input id="birth-add-date" type="date" required><button class="primary" type="submit">Dodaj</button></form></section>`;
  backdrop.innerHTML=`<section class="modal account-modal enter" role="dialog" aria-modal="true" aria-labelledby="account-title">
    <div class="modal-title"><div><p class="eyebrow">TWOJE KONTO</p><h2 id="account-title">${escapeHtml(profile.nick)}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div>
    <div class="account-summary"><div><span class="muted">Status</span><b>${profile.nickOnly?"Gosc":"Konto zapisane"}</b></div><div><span class="muted">${profile.nickOnly?"Coiny sesyjne":"Coiny"}</span><b>$${profile.nickOnly?profile.sessionMoney||0:profile.money||0}</b></div></div>
    ${profile.nickOnly ? "" : birthSection}
    <section class="avatar-editor"><div>${avatarHtml(profile,"account-avatar")}<div><b>Zdjecie profilowe</b><p class="muted">Ramki i aury beda widoczne wokol zdjecia.</p></div></div><label class="file-button">Wybierz zdjecie<input id="avatar-file" type="file" accept="image/*"></label>${profile.avatarImage?'<button class="ghost" id="remove-avatar">Usun zdjecie</button>':""}</section>
    <label class="check account-colorblind-setting"><input id="colorblind-mode" type="checkbox" ${profile.colorblindMode?"checked":""}> Tryb daltonisty dla sekwencji</label>
    ${profile.nickOnly?'<p class="guest-note"><b>Zaloguj sie na konto, zeby zapisywac coiny i kupowac efekty.</b></p>':`<details class="password-box"><summary>Zmien haslo</summary><form id="password-form"><label for="new-password">Nowe haslo</label><input id="new-password" type="password" placeholder="minimum 3 znaki"><button class="primary full">Zapisz nowe haslo</button></form></details>`}
    <div class="account-actions">${profile.nickOnly?'<button class="primary" id="upgrade-account">Zaloguj sie na konto</button>':`<button class="ghost" id="open-inbox">Inbox${inboxCount ? ` (${inboxCount})` : ""}</button>${isAdmin?'<button class="primary" id="open-admin-panel">Panel admina</button>':""}`}<button class="danger" id="account-logout">Wyloguj</button></div>
  </section>`;
  const close=()=>actions.closeModal(backdrop);backdrop.querySelector("[data-close]").addEventListener("click",close);
  $("#account-logout",backdrop).addEventListener("click",()=>{close();actions.logout();});$("#upgrade-account",backdrop)?.addEventListener("click",()=>{close();actions.openAuth({title:"Zaloguj sie na konto"});});
  $("#avatar-file",backdrop).addEventListener("change",async event=>{await actions.setAvatar(event.target.files[0]);close();});$("#remove-avatar",backdrop)?.addEventListener("click",()=>{actions.removeAvatar();close();});
  $("#password-form",backdrop)?.addEventListener("submit",async event=>{event.preventDefault();if(await actions.changePassword($("#new-password",backdrop).value))close();});
  $("#open-inbox",backdrop)?.addEventListener("click",()=>{close();actions.openInbox();});
  $("#open-admin-panel",backdrop)?.addEventListener("click",()=>{close();actions.openAdminPanel();});
  $("#birth-change-request",backdrop)?.addEventListener("click",()=>{close();actions.openBirthDateRequest();});
  $("#colorblind-mode",backdrop)?.addEventListener("change",event=>actions.setColorblindMode(event.target.checked));
  $("#birth-add-form",backdrop)?.addEventListener("submit",event=>{event.preventDefault();if(actions.setOwnBirthDate($("#birth-add-date",backdrop).value))close();});
  return backdrop;
}
