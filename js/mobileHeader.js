// Move the actual controls, not clones: existing handlers and badge IDs survive.
export function bindMobileHeader(header) {
  if (!header) return () => {};
  const brand = header.querySelector('.brand-zone'), nav = header.querySelector('.top-actions');
  const originalBrand = [...brand.children], originalActions = [...nav.children];
  const account = nav.querySelector('#account'), money = nav.querySelector('.money');
  const oldAccountLabel = account?.getAttribute('aria-label');
  const media = window.matchMedia('(max-width:720px)');
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'mobile-header-toggle';
  toggle.setAttribute('aria-label','Otwórz menu'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls','mobile-top-menu');
  toggle.innerHTML = '<span aria-hidden="true">☰</span><small>Menu</small>';
  if (nav.querySelector('.friends-count,.topbar-alert-badge')) toggle.classList.add('has-notifications');
  header.append(toggle); nav.id = 'mobile-top-menu'; nav.setAttribute('aria-label','Menu strony');
  let open = false;
  const close = (focus = false) => {
    open = false; header.classList.remove('mobile-menu-open');
    toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Otwórz menu');
    if (focus) toggle.focus({preventScroll:true});
  };
  const arrange = () => {
    close(); header.classList.toggle('is-mobile-header',media.matches);
    if (media.matches) {
      if (money) brand.append(money); if (account) { brand.append(account); account.setAttribute('aria-label','Konto'); }
    } else {
      originalBrand.forEach(node => brand.append(node)); originalActions.forEach(node => nav.append(node));
      if (account) { if (oldAccountLabel === null) account.removeAttribute('aria-label'); else account.setAttribute('aria-label',oldAccountLabel); }
    }
  };
  const press = () => {
    if (open) {close(); return;}
    open = true; header.classList.add('mobile-menu-open');
    toggle.setAttribute('aria-expanded','true'); toggle.setAttribute('aria-label','Zamknij menu');
  };
  const outside = event => { if (open && !header.contains(event.target)) close(); };
  const escape = event => { if (open && event.key === 'Escape') { event.preventDefault(); close(true); } };
  const selected = event => { if (event.target.closest('button')) close(); };
  toggle.addEventListener('click',press); nav.addEventListener('click',selected);
  media.addEventListener('change',arrange); document.addEventListener('pointerdown',outside); document.addEventListener('keydown',escape);
  arrange();
  return () => { media.removeEventListener('change',arrange); document.removeEventListener('pointerdown',outside); document.removeEventListener('keydown',escape); nav.removeEventListener('click',selected); toggle.removeEventListener('click',press); };
}
