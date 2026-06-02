import { $, avatarHtml, icon } from "./utils.js";

export function authModal(actions, options = {}) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal auth-modal enter" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <div class="modal-title"><div><p class="eyebrow">KONTO GRACZA</p><h2 id="auth-title">${options.title || "Zaloguj się, aby grać"}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div>
    <p class="muted">${options.description || "Nick i hasło wystarczą. Nowe konto utworzymy automatycznie."}</p>
    <form id="auth-form"><label for="auth-nick">Nick</label><input id="auth-nick" autocomplete="username" placeholder="np. panda" maxlength="18"><label for="auth-password">Hasło</label><input id="auth-password" autocomplete="current-password" placeholder="minimum 3 znaki" type="password"><button class="primary full">Zaloguj / utwórz konto</button></form>
    <div class="auth-divider"><span>albo</span></div><button id="guest-login" class="ghost full">Graj tylko po nicku</button>
    <p class="tiny">Możesz zostawić nick pusty. Wtedy dostaniesz unikalny nick, np. gracz_K7M2PX.</p>
    <p class="guest-note">Tryb gościa pozwala grać i nalicza coiny sesyjne. <b>Zaloguj się na konto, żeby zapisywać coiny i kupować efekty.</b></p>
  </section>`;
  const close=()=>actions.closeModal(backdrop);backdrop.querySelector("[data-close]").addEventListener("click",close);
  $("#auth-form",backdrop).addEventListener("submit",async event=>{event.preventDefault();if(await actions.login($("#auth-nick",backdrop).value,$("#auth-password",backdrop).value,"account"))close();});
  $("#guest-login",backdrop).addEventListener("click",async()=>{if(await actions.login($("#auth-nick",backdrop).value,"","nickOnly"))close();});
  return backdrop;
}

export function accountModal(profile, actions) {
  const backdrop=document.createElement("div");backdrop.className="modal-backdrop";
  backdrop.innerHTML=`<section class="modal account-modal enter" role="dialog" aria-modal="true" aria-labelledby="account-title">
    <div class="modal-title"><div><p class="eyebrow">TWOJE KONTO</p><h2 id="account-title">${profile.nick}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div>
    <div class="account-summary"><div><span class="muted">Status</span><b>${profile.nickOnly?"Gość":"Konto zapisane"}</b></div><div><span class="muted">${profile.nickOnly?"Coiny sesyjne":"Coiny"}</span><b>$${profile.nickOnly?profile.sessionMoney||0:profile.money||0}</b></div></div>
    <section class="avatar-editor"><div>${avatarHtml(profile,"account-avatar")}<div><b>Zdjęcie profilowe</b><p class="muted">Ramki i aury będą widoczne wokół zdjęcia.</p></div></div><label class="file-button">Wybierz zdjęcie<input id="avatar-file" type="file" accept="image/*"></label>${profile.avatarImage?'<button class="ghost" id="remove-avatar">Usuń zdjęcie</button>':""}</section>
    ${profile.nickOnly?'<p class="guest-note"><b>Zaloguj się na konto, żeby zapisywać coiny i kupować efekty.</b></p>':`<details class="password-box"><summary>Zmień hasło</summary><form id="password-form"><label for="new-password">Nowe hasło</label><input id="new-password" type="password" placeholder="minimum 3 znaki"><button class="primary full">Zapisz nowe hasło</button></form></details>`}
    <div class="account-actions">${profile.nickOnly?'<button class="primary" id="upgrade-account">Zaloguj się na konto</button>':""}<button class="danger" id="account-logout">Wyloguj</button></div>
  </section>`;
  const close=()=>actions.closeModal(backdrop);backdrop.querySelector("[data-close]").addEventListener("click",close);
  $("#account-logout",backdrop).addEventListener("click",()=>{close();actions.logout();});$("#upgrade-account",backdrop)?.addEventListener("click",()=>{close();actions.openAuth({title:"Zaloguj się na konto"});});
  $("#avatar-file",backdrop).addEventListener("change",async event=>{await actions.setAvatar(event.target.files[0]);close();});$("#remove-avatar",backdrop)?.addEventListener("click",()=>{actions.removeAvatar();close();});
  $("#password-form",backdrop)?.addEventListener("submit",async event=>{event.preventDefault();if(await actions.changePassword($("#new-password",backdrop).value))close();});
  return backdrop;
}
