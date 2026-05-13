import { useState, useMemo, useRef } from "react";
import GROUPS from './ingredients.json';

function nk(s) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

const CAT_RULES = [
  ['Protein',        /\bchicken|\bbeef\b|\bpork|\blamb|\bturkey|\bsalmon|\btuna|\bcod\b|\bshrimp|\bbass|\bflounder|\bhalibut|\btrout|\bbranzino|\bsnapper|\bhake|\bpollock|\bsable|\banchov|colatura|\bclam|\bmussel|\blobster|\bsquid|\bscallop|\beggs?\b|\bbacon|\bpancetta|\bguanciale|\bsalami|\bham\b|\bprosciutto|\bchorizo|\bsausage|\bcrab|arctic char|rotisserie|\bribs?\b|brisket|skirt steak|flank steak|sirloin|tri.tip|osso buco|\bshank/i],
  ['Herbs',          /\bbasil|\bcilantro|\bmint|\bparsley|\bdill|\bthyme|\brosemary|\btarragon|\bchives|\boregano|\bmarjoram|bay leave|\bsage|\blavender|\bchervil|\bperilla|\blemongrass|fennel frond|\bherbs?|dried mint|dried oregano|scallion green|\bmakrut/i],
  ['Nuts & Seeds',   /\balmond|\bwalnut|\bcashew|\bpecan|\bhazelnut|\bpistachio|\bpeanut|\bpepita|\bsesame|sunflower seed|\bflaxseed|hemp seed|\bchia|\bcoconut|pine nut/i],
  ['Spices & Chiles',/\bpowder|\bflakes?|\bchiles?|aleppo|urfa|maras|silk chile|gochugaru|\bsichuan|\bpeppercorns?|\bpaprika|\bcumin|\bcoriander|\bcardamom|\bcinnamon|\bturmeric|\bsumac|\bcayenne|star anise|\bnutmeg|\bjalapeño|\bserrano|\bfresno|\bhabanero|thai chile|garam masala|\bberbere|five.spice|espelette|pimentón|\bchipotle|\bguajillo|\bancho|\bpasilla|\btaviche|\bmsg\b|citric acid|\bamchur|furikake|anise seed|caraway|black pepper|fennel seed/i],
  ['Dairy & Cheese', /\bbutter|\bheavy cream|half.and.half|\bmilk|\byogurt|\blabneh|\bmozzarella|parmigiano|\bpecorino|\bfeta|\bricotta|\bburrata|\bcheddar|gruyère|\bmanchego|\bhalloumi|\bghee|\bbuttermilk|grana padano|\bcotija|\bqueso|\bscamorza|\bmanouri|\bpaneer|\bgouda|monterey jack|\bskyr|crème fraîche|sour cream|ciliegine|cottage cheese|cream cheese/i],
  ['Legumes',        /cannellini|flageolet|pinto bean|black bean|white bean|butter bean|lima bean|\bgigante|\bchickpeas?|\blentils?|black.eyed pea|runner bean|cranberry bean|\bayocote|corona bean|\btarbais|mung bean|\btofu/i],
  ['Fruit',          /\bapple|\bpear|\bpeach|\bnectarine|\bberr|\bcherr|\bfig|\bdate|\braisin|\bapricot|\bplum|\bbanana|\bcantaloupe|\bhoneydew|\bwatermelon|\bpomelo|\bgrapefruit|\borange|\blemon|\blime|strawberr|\bpomegranate|\bpersimmon|\bcurrant|gooseberr|blood orange|barberr|\bcitrus/i],
  ['Grains & Bread', /\brice|\bfarro|\bbarley|\bquinoa|\bbulgur|\bspelt|wheat berr|\boats?|\bpolenta|\bgrits|\bnoodle|\bspaghetti|\brigatoni|\bfusilli|\borzo|\bditalini|\bfregola|\bfreekeh|\bteff|\bflour|\bbread|\bfocaccia|\bpita|\borecchiette|\bgemelli|\bpaccheri|\blumache|\bbucatini|\bfettuccine|\blinguine|\bcavatappi|\bcalamarata|\bradiatore|\bmafaldine|\bpanko|breadcrumb|\bpasta|baguette|ciabatta|anelli/i],
  ['Vegetables',     /\bkale|\bspinach|\bbroccoli|\bcauliflower|\bcarrots?|\bcelery|\bfennel|\bzucchini|\beggplant|\bsquash|\bpotatoes?|\bbeets?|tomato|\bcabbage|\blettuce|\barugula|\bendive|\bradicchio|\bescarole|\basparagus|\bcorn|\bleek|\bonion|\bgarlic|\bshallot|\bscallions?|\bradish|\bdaikon|\bcucumber|\bartichoke|bok choy|\bwatercress|\bromaine|\bmushroom|bean sprout|\bromanesco|\bkohlrabi|\bparsnip|\bbrussels|\bchard|\bcollard|\bchicory|frisée|\btreviso|little gem|pea shoot|wax bean|snap pea|snow pea|green bean|romano bean|long bean|bell pepper|\bpoblano|\bcubanelle|\bnardello|\bpiparra|\bpeperoncini|banana pepper|sweet pepper|\bramp|\bkoginut|\bhoneynut|acorn squash|butternut|broccolini|mustard green|castelfranco|chioggia/i],
  ['Pantry', null],
];

function categorize(itemName) {
  const s = itemName.toLowerCase();
  for (const [cat, re] of CAT_RULES) {
    if (!re || re.test(s)) return cat;
  }
  return 'Pantry';
}

const ALL_CATS = CAT_RULES.map(([cat]) => cat);

const itemMap = {};
GROUPS.forEach((g, gi) => {
  g.items.forEach(item => {
    const k = nk(item);
    if (!itemMap[k]) {
      itemMap[k] = { display: item, groupIdxs: [] };
    } else {
      const cur = itemMap[k].display;
      if (item[0] && item[0] === item[0].toUpperCase() && cur[0] === cur[0].toLowerCase())
        itemMap[k].display = item;
    }
    if (!itemMap[k].groupIdxs.includes(gi))
      itemMap[k].groupIdxs.push(gi);
  });
});

const ALL_ITEMS = Object.values(itemMap)
  .map(v => v.display)
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

export default function SpinIts() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [catFilter, setCatFilter] = useState(null);
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  const result = useMemo(() => {
    if (!selected) return null;
    const k = nk(selected);
    const entry = itemMap[k];
    if (!entry) return null;
    const swapMap = {};
    entry.groupIdxs.forEach(gi => {
      GROUPS[gi].items.forEach(item => {
        const ik = nk(item);
        if (ik !== k) swapMap[ik] = item;
      });
    });
    const swaps = Object.values(swapMap).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const notes = entry.groupIdxs.filter(gi => GROUPS[gi].note).map(gi => GROUPS[gi].note);
    return { display: entry.display, swaps, note: notes[0] || null };
  }, [selected]);

  const filteredItems = useMemo(() => {
    if (!catFilter) return [];
    return ALL_ITEMS.filter(i => categorize(i) === catFilter);
  }, [catFilter]);

  function handleInput(e) {
    const v = e.target.value;
    setQuery(v);
    if (!v.trim()) { setSuggestions([]); setShowSugg(false); return; }
    const nv = nk(v);
    const hits = ALL_ITEMS.filter(item => nk(item).includes(nv)).slice(0, 10);
    setSuggestions(hits);
    setShowSugg(hits.length > 0);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { pick(query); }
    if (e.key === 'Escape') setShowSugg(false);
  }

  function pick(name) {
    setQuery(name);
    setSelected(name);
    setShowSugg(false);
    setSuggestions([]);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  function highlight(text, q) {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((p, i) =>
      nk(p) === nk(q)
        ? <strong key={i} style={{ textDecoration: 'underline', fontWeight: 600 }}>{p}</strong>
        : p
    );
  }

  const s = {
    wrap: { maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem 4rem', fontFamily: "'DM Sans', sans-serif", color: '#111', background: '#fff' },
    head: { textAlign: 'center', paddingBottom: '1.5rem', borderBottom: '2px solid #111', marginBottom: '2rem' },
    eyebrow: { fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif" },
    title: { fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(2rem,6vw,2.6rem)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' },
    em: { fontStyle: 'italic', fontWeight: 400 },
    sub: { fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginTop: '0.6rem' },
    searchWrap: { position: 'relative', marginBottom: '1.75rem' },
    input: { width: '100%', padding: '0.8rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', border: '1.5px solid #111', background: '#fff', color: '#111', outline: 'none', borderRadius: 0, boxSizing: 'border-box' },
    sugg: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #111', borderTop: 'none', maxHeight: 220, overflowY: 'auto', zIndex: 50 },
    suggItem: { padding: '0.55rem 1rem', fontSize: '0.88rem', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#111' },
    card: { border: '1.5px solid #111', marginBottom: '2rem' },
    cardHead: { background: '#111', color: '#fff', padding: '1rem 1.25rem', display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' },
    cardLabel: { fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.5, flexShrink: 0 },
    cardName: { fontFamily: "'Libre Baskerville', serif", fontSize: '1.3rem', fontStyle: 'italic', flex: 1, minWidth: 0 },
    cardCount: { fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.55, marginLeft: 'auto', flexShrink: 0 },
    cardBody: { padding: '1.1rem 1.25rem' },
    cardInto: { fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#999', marginBottom: '0.75rem' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
    tag: { border: '1.5px solid #111', padding: '0.32rem 0.75rem', fontSize: '0.83rem', cursor: 'pointer', color: '#111', background: 'transparent', fontFamily: "'DM Sans', sans-serif", borderRadius: 0 },
    note: { marginTop: '0.85rem', padding: '0.6rem 0.8rem', background: '#fffde7', borderLeft: '3px solid #f0c040', fontSize: '0.78rem', color: '#7a6000', fontStyle: 'italic', lineHeight: 1.5 },
    noResult: { textAlign: 'center', padding: '2.5rem 1rem' },
    noResultBig: { fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', fontSize: '1rem', marginBottom: '0.3rem', color: '#888' },
    divider: { border: 'none', borderTop: '1px solid #eee', margin: '1.75rem 0' },
    browseLabel: { fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.75rem' },
    cats: { display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' },
    catBtn: (active) => ({ background: active ? '#111' : 'none', border: '1px solid', borderColor: active ? '#111' : '#ddd', color: active ? '#fff' : '#999', padding: '0.22rem 0.65rem', fontSize: '0.72rem', letterSpacing: '0.04em', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", borderRadius: 0 }),
    pills: { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' },
    pill: { background: 'none', border: '1px solid #e0e0e0', color: '#111', padding: '0.28rem 0.65rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", borderRadius: 0 },
    browseHint: { fontSize: '0.8rem', color: '#bbb', padding: '0.5rem 0' },
    foot: { textAlign: 'center', marginTop: '3rem', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ccc', borderTop: '1px solid #eee', paddingTop: '1.5rem' },
  };

  return (
    <div style={s.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={s.head}>
        <p style={s.eyebrow}>Food Processing · Carla Lalli</p>
        <h1 style={s.title}>Spin <em style={s.em}>Its</em></h1>
        <p style={s.sub}>Ingredient swap database · {GROUPS.length} swap groups</p>
      </div>

      <div style={s.searchWrap}>
        <input
          ref={inputRef}
          style={s.input}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length && setShowSugg(true)}
          placeholder="Search any ingredient — e.g. anchovies, kale, mirin…"
          autoComplete="off"
          spellCheck={false}
        />
        {showSugg && suggestions.length > 0 && (
          <div style={s.sugg}>
            {suggestions.map(h => (
              <div key={h} style={s.suggItem} onMouseDown={() => pick(h)}>
                {highlight(h, query)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={resultRef}>
        {result ? (
          result.swaps.length > 0 ? (
            <div style={s.card}>
              <div style={s.cardHead}>
                <span style={s.cardLabel}>swapping</span>
                <span style={s.cardName}>{result.display}</span>
                <span style={s.cardCount}>{result.swaps.length} swap{result.swaps.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={s.cardBody}>
                <p style={s.cardInto}>try instead →</p>
                <div style={s.tags}>
                  {result.swaps.map(sw => (
                    <button key={sw} style={s.tag} onClick={() => pick(sw)}
                      onMouseEnter={e => { e.target.style.background = '#111'; e.target.style.color = '#fff'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#111'; }}>
                      {sw}
                    </button>
                  ))}
                </div>
                {result.note && <div style={s.note}>⚠ {result.note}</div>}
              </div>
            </div>
          ) : (
            <div style={{ ...s.card, ...s.noResult }}>
              <p style={s.noResultBig}>No swaps on file for "{result.display}"</p>
            </div>
          )
        ) : selected ? (
          <div style={{ ...s.card, ...s.noResult }}>
            <p style={s.noResultBig}>Nothing found for "{selected}"</p>
            <p style={{ fontSize: '0.8rem', color: '#bbb' }}>Try browsing below.</p>
          </div>
        ) : null}
      </div>

      <hr style={s.divider} />
      <p style={s.browseLabel}>Browse by category</p>
      <div style={s.cats}>
        {ALL_CATS.map(cat => (
          <button key={cat} style={s.catBtn(catFilter === cat)}
            onClick={() => setCatFilter(catFilter === cat ? null : cat)}>
            {cat}
          </button>
        ))}
      </div>
      <div style={s.pills}>
        {catFilter
          ? filteredItems.map(i => (
              <button key={i} style={s.pill} onClick={() => pick(i)}
                onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                onMouseLeave={e => e.target.style.background = 'none'}>
                {i}
              </button>
            ))
          : <p style={s.browseHint}>Select a category above to browse ingredients.</p>
        }
      </div>

      <p style={s.foot}>Spin Its · All swaps bidirectional unless noted</p>
    </div>
  );
}
