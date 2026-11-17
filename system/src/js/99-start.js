  /* ---------- Start: once the document is parsed, add the icon sprite and wire up what is there ---------- */
  function start() { sprite(); UI.init(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
