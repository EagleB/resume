// Language switching. English text lives in the HTML itself (so crawlers and
// no-JS visitors get it); this file only holds the Italian translations.
// Each translatable element carries data-i18n="key" (innerHTML) and/or
// data-i18n-attr="attr:key" (attribute). The English original is captured
// from the DOM on load and restored when switching back.
(function () {
  const IT = {
    'nav.about': 'Chi sono',
    'nav.skills': 'Competenze',
    'nav.contact': 'Contatti',
    'nav.toggle': 'Apri/chiudi il menu',
    'nav.home': 'Simone Belfiore — home',
    'lang.label': 'Lingua',
    'theme.toggle': 'Passa al tema chiaro/scuro',
    'rail.label': 'Contatta Simone Belfiore',
    'rail.linkedinAria': 'Profilo LinkedIn',
    'rail.emailAria': 'Invia un’email',
    'rail.cvAria': 'Scarica il CV in PDF',
    'rail.email': 'Scrivimi',
    'rail.cv': 'Scarica CV',
    'hero.photoAlt': 'Ritratto di Simone Belfiore',
    'hero.eyebrow': 'Digital Program Manager · AI &amp; Tech Governance',
    'hero.tagline': 'Trasformazione digitale aziendale &middot; Strategia AI &middot; Gestione della qualità',
    'hero.p1': 'Guido la trasformazione digitale dell’organizzazione Qualità di <strong>Brembo N.V.</strong>, riportando direttamente al Chief Quality Officer. Governo le iniziative di digitalizzazione trasversali, i portafogli di programmi di AI e automazione e l’ottimizzazione dei KPI attraverso l’abilitazione tecnologica strategica — coordinando progetti di trasformazione di alto livello che sfruttano AI ed ecosistemi low-code (ecosistema Microsoft, LLM) in più stabilimenti globali.',
    'hero.p2': 'Faccio da ponte tra il C-Level aziendale, l’IT interna e i fornitori di sviluppo esterni, ridisegnando i processi qualità legacy in flussi digitali scalabili e guidando l’adozione su scala aziendale attraverso il change management e il monitoraggio continuo dei KPI.',
    'hero.p3': 'Percorso: oltre 3 anni come Supplier Quality Engineer in Brembo, gestendo i fornitori di mechatronics per il progetto Sensify; tesi magistrale in Stellantis sull’Additive Manufacturing.',
    'hero.badge': 'In riporto al Chief Quality Officer, Brembo N.V.',
    'skills.title': 'Competenze &amp; certificazioni',
    'skills.c1.h': 'Program Management',
    'skills.c1.p': 'Governance di portafoglio su stabilimenti globali, allineamento degli stakeholder, delivery guidata dai KPI.',
    'skills.c2.h': 'Trasformazione digitale',
    'skills.c2.p': 'Ridisegno dei processi legacy in flussi digitali scalabili, change management su scala aziendale.',
    'skills.c3.h': 'Strategia AI',
    'skills.c3.p': 'Roadmap per l’adozione di LLM e low-code (ecosistema Microsoft) per compliance, reporting e analisi.',
    'cert.title': 'Certificazioni',
    'cert.1': 'Introduction to AI',
    'cert.2': 'Qualifica di auditor VDA 6.3',
    'cert.3': 'AI Agents Fundamentals',
    'cert.4': 'Databases and SQL for Data Science with Python',
    'langs.title': 'Lingue',
    'langs.1': 'Italiano — Madrelingua',
    'langs.2': 'Inglese — Livello professionale',
    'langs.3': 'Tedesco — Elementare',
    'edu.title': 'Formazione',
    'edu.1.name': 'Università di Trento — Laurea Magistrale in Ingegneria Meccatronica',
    'edu.1.date': '<time itemprop="dateCreated" datetime="2019-09">Set 2019</time> – <time datetime="2021-12">Dic 2021</time>',
    'edu.2.name': 'TH Aschaffenburg University of Applied Sciences — Scambio Erasmus+, Industrial Engineering &amp; International Technical Sales Management',
    'edu.2.date': '<time itemprop="dateCreated" datetime="2021-03">Mar 2021</time> – <time datetime="2021-08">Ago 2021</time>',
    'edu.3.name': 'Università di Trento — Laurea Triennale in Ingegneria Industriale',
    'edu.3.date': '<time itemprop="dateCreated" datetime="2015-09">Set 2015</time> – <time datetime="2019-09">Set 2019</time>',
    'contact.title': 'Contatti',
    'contact.cv': 'Scarica il CV (PDF)',
    'contact.note': 'Italia — aperto a opportunità di trasformazione digitale aziendale e AI governance.',
    // <head> metadata
    'meta.title': 'Simone Belfiore — Digital Program Manager',
    'meta.description': 'Simone Belfiore — Digital Program Manager e Digital Transformation Lead in Brembo N.V., specializzato in trasformazione digitale aziendale, strategia AI, program/programme management, PMO e gestione della qualità per OEM automotive globali e fornitori Tier 1. Ingegnere Meccatronico (Università di Trento), aperto a opportunità di trasformazione digitale e AI governance in Italia, UE e all’estero.',
    'meta.ogTitle': 'Simone Belfiore — Digital Program Manager | Strategia AI e trasformazione digitale',
    'meta.ogDescription': 'Digital Program Manager in Brembo N.V.: guido la trasformazione digitale aziendale, i portafogli di programmi AI e automazione e la gestione della qualità negli stabilimenti automotive globali. Aperto a nuove opportunità.',
    'meta.twDescription': 'Trasformazione digitale aziendale, strategia AI e gestione della qualità per OEM automotive globali in Brembo N.V.'
  };

  const CV = { en: 'Profile_short.pdf', it: 'Profile_short_IT.pdf' };
  const CV_NAME = { en: 'Simone-Belfiore-CV.pdf', it: 'Simone-Belfiore-CV-IT.pdf' };
  const STORAGE_KEY = 'cv-lang';

  const metaSelectors = {
    'meta.description': 'meta[name="description"]',
    'meta.ogTitle': 'meta[property="og:title"]',
    'meta.ogDescription': 'meta[property="og:description"]',
    'meta.twDescription': 'meta[name="twitter:description"]'
  };

  // Capture English originals once.
  const en = {};
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    en[el.dataset.i18n] = el.innerHTML.trim().replace(/\s+/g, ' ');
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const [attr, key] = el.dataset.i18nAttr.split(':');
    en[key] = el.getAttribute(attr);
  });
  en['meta.title'] = document.title;
  Object.keys(metaSelectors).forEach((key) => {
    const m = document.querySelector(metaSelectors[key]);
    if (m) en[key] = m.getAttribute('content');
  });

  const t = (lang, key) => (lang === 'it' && IT[key] != null ? IT[key] : en[key]);

  function applyLanguage(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.innerHTML = t(lang, el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const [attr, key] = el.dataset.i18nAttr.split(':');
      el.setAttribute(attr, t(lang, key));
    });

    document.title = t(lang, 'meta.title');
    Object.keys(metaSelectors).forEach((key) => {
      const m = document.querySelector(metaSelectors[key]);
      if (m) m.setAttribute('content', t(lang, key));
    });
    const locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.setAttribute('content', lang === 'it' ? 'it_IT' : 'en_US');

    // CV download follows the language
    document.querySelectorAll('.cv-link').forEach((a) => {
      a.setAttribute('href', CV[lang]);
      a.setAttribute('download', CV_NAME[lang]);
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
  }

  function setLanguage(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
    applyLanguage(lang);
  }

  function initialLanguage() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl === 'it' || fromUrl === 'en') return fromUrl;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'it' || saved === 'en') return saved;
    } catch (e) { /* ignore */ }
    return (navigator.language || '').toLowerCase().startsWith('it') ? 'it' : 'en';
  }

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  const start = initialLanguage();
  if (start !== 'en') applyLanguage(start);
})();
