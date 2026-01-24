/**
 * Busca figuredata em https://www.habbo.com/gamedata/figuredata/1,
 * compara com complete_mock_data.json e adiciona itens faltantes por categoria.
 * Categoria 'sh' (sapatos) é ignorada — o editor usa lista canônica do serviço.
 */

import { parseStringPromise } from 'xml2js';
import fs from 'fs/promises';
import path from 'path';

const FIGUREDATA_URL = 'https://www.habbo.com/gamedata/figuredata/1';
const MOCK_PATH = path.join(process.cwd(), 'public', 'complete_mock_data.json');

/** Cor padrão para thumbnail por categoria (paleta 1=pele, 2=cabelo, 3=roupas) */
const DEFAULT_COLOR = {
  hd: '1',
  hr: '40',
  ha: '1408', he: '1408', ea: '1408', fa: '1408',
  ch: '1408', lg: '82', cc: '1408', ca: '1408', cp: '1408', wa: '1408',
};

function pickColor(meta, category) {
  const def = DEFAULT_COLOR[category] || '1408';
  if (meta.colorable !== '1') return def;
  const c = meta.colors;
  if (Array.isArray(c) && c.length) return String(c[0].id ?? c[0]);
  if (c && typeof c === 'object' && c.id) return String(c.id);
  return def;
}

function buildImageUrl(category, figureId, colorId, gender) {
  const g = gender === 'F' ? 'F' : 'M'; // U usa M para thumbnail
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${colorId}&gender=${g}&size=m&headonly=0`;
}

async function fetchAndParseFigureData() {
  const res = await fetch(FIGUREDATA_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`figuredata: HTTP ${res.status}`);
  const xml = await res.text();
  const raw = await parseStringPromise(xml, { explicitArray: false, mergeAttrs: true });
  return raw;
}

/**
 * Agrupa sets por (type, id). Quando o mesmo id existe para M e F (ou U),
 * mescla em um único meta com gender 'U' para aparecer em ambos os gêneros.
 */
function extractOfficialSets(raw) {
  const byType = {};
  const settypeNode = raw?.figuredata?.sets?.settype ?? raw?.figuredata?.settype;
  if (!settypeNode) return byType;
  const settypes = Array.isArray(settypeNode) ? settypeNode : [settypeNode];
  for (const st of settypes) {
    const type = st.type;
    const sets = Array.isArray(st.set) ? st.set : [st.set];
    const filtered = sets.filter((s) => s && s.selectable === '1');
    const groupBy = new Map(); // id -> { genders: Set, meta: first }
    for (const s of filtered) {
      const id = String(s.id);
      const g = (s.gender || 'U').toUpperCase();
      const meta = {
        id,
        gender: g,
        club: String(s.club || '0'),
        colorable: String(s.colorable || '0'),
        colors: s.color
          ? Array.isArray(s.color)
            ? s.color.map((c) => ({ id: String(c.id ?? c) }))
            : [{ id: String(s.color.id ?? s.color) }]
          : [],
      };
      if (!groupBy.has(id)) {
        groupBy.set(id, { genders: new Set([g]), meta });
      } else {
        const entry = groupBy.get(id);
        entry.genders.add(g);
      }
    }
    const list = [];
    for (const [id, { genders, meta }] of groupBy) {
      let gender = meta.gender;
      if (genders.has('U') || (genders.has('M') && genders.has('F'))) gender = 'U';
      else if (genders.has('M')) gender = 'M';
      else if (genders.has('F')) gender = 'F';
      list.push({ ...meta, gender });
    }
    byType[type] = list;
  }
  return byType;
}

async function run() {
  console.log('Fetching figuredata from', FIGUREDATA_URL, '...');
  const raw = await fetchAndParseFigureData();
  const official = extractOfficialSets(raw);
  const types = Object.keys(official);
  console.log('Official settypes:', types.join(', '));

  const mockRaw = await fs.readFile(MOCK_PATH, 'utf-8');
  const mock = JSON.parse(mockRaw);
  const categories = mock.categories || [];

  let totalAdded = 0;
  const skipCategories = new Set(['sh']);

  for (const cat of categories) {
    const cid = cat.id;
    if (skipCategories.has(cid)) {
      console.log(`Skip ${cid} (uses canonical list)`);
      continue;
    }
    const officialList = official[cid];
    if (!officialList || !officialList.length) continue;

    const officialIds = new Set(officialList.map((s) => s.id));
    const metaMap = new Map(officialList.map((s) => [s.id, s]));
    const currentIds = new Set((cat.items || []).map((i) => i.figureId));
    const missing = [...officialIds].filter((id) => !currentIds.has(id)).sort((a, b) => Number(a) - Number(b));

    const items = [...(cat.items || [])];

    // Atualizar gender de itens existentes: se figuredata diz U (ou M+F), forçar U para aparecer em M e F
    let updated = 0;
    for (const it of items) {
      const m = metaMap.get(it.figureId);
      if (!m || m.gender !== 'U') continue;
      if (it.gender !== 'U') {
        it.gender = 'U';
        updated++;
      }
    }
    if (updated) console.log(`${cid}: updated ${updated} existing items to gender U`);

    for (const figureId of missing) {
      const m = metaMap.get(figureId);
      const colorId = pickColor(m, cid);
      const gender = m.gender; // M, F ou U (já mesclado em extractOfficialSets)
      const colorable = m.colorable === '1';
      const club = m.club === '2' ? '2' : m.club === '1' ? '1' : '0';
      const item = {
        id: `${cid}-${figureId}`,
        figureId,
        category: cid,
        gender,
        club,
        colorable: colorable ? '1' : '0',
        selectable: '1',
        imageUrl: buildImageUrl(cid, figureId, colorId, gender),
        isSelectable: true,
        isColorable: colorable,
      };
      items.push(item);
      totalAdded++;
    }
    items.sort((a, b) => Number(a.figureId) - Number(b.figureId));
    cat.items = items;
    if (missing.length) console.log(`${cid}: +${missing.length} (${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''})`);
    else if (!updated) console.log(`${cid}: none missing`);
  }

  await fs.writeFile(MOCK_PATH, JSON.stringify(mock, null, 2), 'utf-8');
  console.log('Done. Total added:', totalAdded);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
