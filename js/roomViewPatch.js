const snapshots = new WeakMap();
const managed = "[data-host-announcement-anchor],[data-adsense-public]";

function syncPlayers(list, before, next) {
  const rows = new Map([...list.children].map(row => [row.dataset.playerUid, row]));
  const previous = new Map([...before.children].map(row => [row.dataset.playerUid, row]));
  const desired = [...next.children];
  const remaining = new Set(desired.map(row => row.dataset.playerUid));
  for (const [uid, row] of rows) {
    if (!remaining.has(uid)) row.remove();
  }
  desired.forEach((nextRow, index) => {
    const uid = nextRow.dataset.playerUid;
    const row = rows.get(uid);
    const updated = row ? syncNode(row, previous.get(uid), nextRow) : nextRow.cloneNode(true);
    if (list.children[index] !== updated) list.insertBefore(updated, list.children[index] || null);
  });
}

function syncNode(node, before, next) {
  if (!before || before.nodeType !== next.nodeType || before.nodeName !== next.nodeName || before.id !== next.id) {
    const replacement = next.cloneNode(true);
    node.replaceWith(replacement);
    return replacement;
  }
  if (before.isEqualNode(next)) return node;
  if (node.nodeType !== 1) {
    node.nodeValue = next.nodeValue;
    return node;
  }
  for (const attribute of before.attributes) {
    if (!next.hasAttribute(attribute.name)) node.removeAttribute(attribute.name);
  }
  for (const attribute of next.attributes) {
    if (before.getAttribute(attribute.name) !== attribute.value) node.setAttribute(attribute.name, attribute.value);
  }
  if (node.matches(managed)) return node;
  if (node.matches(".room-player-list")) {
    syncPlayers(node, before, next);
    return node;
  }
  const oldChildren = [...before.childNodes], liveChildren = [...node.childNodes];
  next.childNodes.forEach((child, index) => {
    if (liveChildren[index]) syncNode(liveChildren[index], oldChildren[index], child);
    else node.append(child.cloneNode(true));
  });
  for (const extra of liveChildren.slice(next.childNodes.length)) extra.remove();
  if (node.matches("input, select, textarea") && before.value !== next.value) node.value = next.value;
  if (node.matches('input[type="checkbox"],input[type="radio"]') && before.checked !== next.checked) node.checked = next.checked;
  return node;
}

export function patchRoomView(root, key, html) {
  const template = root.ownerDocument.createElement("template");
  template.innerHTML = html;
  const next = template.content.firstElementChild;
  const previous = snapshots.get(root);
  if (!previous || previous.key !== key || previous.node.parentNode !== root) {
    const node = next.cloneNode(true);
    root.replaceChildren(node);
    snapshots.set(root, {key, node, markup:next});
    return true;
  }
  const node = syncNode(previous.node, previous.markup, next);
  snapshots.set(root, {key, node, markup:next});
  return false;
}
