const EMAIL_TO_NAME = {
  'agnieszka.kasprzyk@example.com': 'Agnieszka Kasprzyk',
  'aleksandra.kmiec@example.com': 'Aleksandra Kmieć',
  'ania.cetnar@example.com': 'Ania Cetnar',
  'antoni.zieciak@example.com': 'Antoni Zięciak',
  'aurelia.wiacek@example.com': 'Aurelia Wiącek',
  'gosia.palewicz@example.com': 'Gosia Palewicz',
  'jagoda.michta@example.com': 'Jagoda Michta',
  'jakub.nalezinski@example.com': 'Jakub Nalezinski',
  'julek.mietelski@example.com': 'Julek Mietelski',
  'julia.marosz@example.com': 'Julia Marosz',
  'karolina.golab@example.com': 'Karolina Gołąb',
  'karolina.kozlowska@example.com': 'Karolina Kozłowska',
  'kasia.kuzma@example.com': 'Kasia Kuźma',
  'kuba.zajac@example.com': 'Kuba Zając',
  'maciej.kulawik@example.com': 'Maciej Kulawik',
  'magda.labaj@example.com': 'Magda Łabaj',
  'maja.gutowska@example.com': 'Maja Gutowska',
  'malgorzata.spisak@example.com': 'Małgorzata Spisak',
  'malgorzata.wszolek@example.com': 'Małgorzata Wszołek',
  'mateusz.branowicz@example.com': 'Mateusz Branowicz',
  'natalia.roz@example.com': 'Natalia Róż',
  'paulina.czarnik@example.com': 'Paulina Czarnik',
  'paulina.wasko@example.com': 'Paulina Waśko',
  'szymon.ozog@example.com': 'Szymon Ożóg',
  'weronika.mysliwy@example.com': 'Weronika Myśliwy',
  'wiktor.krol@example.com': 'Wiktor Król',
  'wiktoria.urban@example.com': 'Wiktoria Urban',
  'wiktoria.wawrow@example.com': 'Wiktoria Wawrów',
  'wojtek.dabek@example.com': 'Wojtek Dąbek',
  'zuzanna.rudny@example.com': 'Zuzanna Rudny',
};

function fallbackNameFromEmail(email) {
  const localPart = String(email || '').split('@')[0] || '';
  if (!localPart) {
    return 'Użytkownik';
  }

  return localPart
    .split(/[._-]/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export function getDisplayNameFromEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) {
    return 'Użytkownik';
  }
  return EMAIL_TO_NAME[normalized] || fallbackNameFromEmail(normalized);
}

export { EMAIL_TO_NAME };
