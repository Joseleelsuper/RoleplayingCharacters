(() => {
  function el(tag, props = {}, children = []) {
    const n = document.createElement(tag);
    Object.assign(n, props);
    for (const c of children) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    return n;
  }

  function mountUI() {
    const sidebar = document.querySelector('.character-preview');
    if (!sidebar) return;
    const panel = el('div', { className: 'ai-panel' });
    const title = el('h4', { className: 'ai-title', innerText: '🤖 Asistente IA' });
    const prompt = el('textarea', { className: 'ai-input', placeholder: 'Describe tu idea (p.ej., mago elfo de nivel 3 centrado en control)...' });
    const row = el('div', { className: 'ai-actions' });
    const askBtn = el('button', { type: 'button', className: 'btn btn-secondary btn-sm', innerText: 'Pedir consejo' });
    const autoBtn = el('button', { type: 'button', className: 'btn btn-primary btn-sm', innerText: 'Autocompletar con IA' });
    const out = el('div', { className: 'ai-output' });
    row.append(askBtn, autoBtn);
    panel.append(title, prompt, row, out);
    const summary = sidebar.querySelector('.character-summary');
    if (summary && summary.parentNode) {
      summary.parentNode.insertBefore(panel, summary);
    } else {
      sidebar.append(panel);
    }

    askBtn.addEventListener('click', async () => {
      const gameType = document.getElementById('selected-game-type')?.value || 'custom';
      const text = prompt.value.trim();
      if (!text) return;
      out.innerText = 'Consultando IA...';
      try {
        const res = await fetch('/api/ai/advice', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_type: gameType, prompt: text })
        });
        const data = await res.json();
        out.innerText = data.message || JSON.stringify(data);
      } catch (e) {
        out.innerText = 'Error al consultar IA';
      }
    });

    autoBtn.addEventListener('click', async () => {
      const gameType = document.getElementById('selected-game-type')?.value || 'custom';
      const name = document.getElementById('character-name')?.value?.trim();
      const player = document.getElementById('player-name')?.value?.trim();
      const lvl = parseInt(document.getElementById('level')?.value || '1');
      const prefs = { game_type: gameType, name, player_name: player, level: isNaN(lvl) ? 1 : lvl, note: prompt.value.trim() };
      out.innerText = 'Creando plan con IA...';
      try {
        const res = await fetch('/api/ai/auto-build', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_type: gameType, preferences: prefs })
        });
        const plan = await res.json();
        out.innerText = plan.rationale ? plan.rationale : 'Plan recibido. Aplicando...';
        applyPlan(plan);
      } catch (e) {
        out.innerText = 'Error al crear plan con IA';
      }
    });
  }

  function applyPlan(plan) {
    if (!plan || typeof plan !== 'object') return;
    try {
      // game type
      const gt = plan.game_type; if (gt) { const hidden = document.getElementById('selected-game-type'); if (hidden) { hidden.value = gt; document.dispatchEvent(new CustomEvent('gameTypeSelected', { detail: { gameType: gt } })); } }
      // basic
      if (plan.name) document.getElementById('character-name').value = plan.name;
      if (plan.player_name) document.getElementById('player-name').value = plan.player_name;
      if (plan.level) { const level = document.getElementById('level'); level.value = String(plan.level); document.dispatchEvent(new CustomEvent('levelChanged', { detail: { level: plan.level } })); }

      // helper to select by name from overlay data
      function selectByName(type, name) {
        if (!name) return;
        const map = { race: 'race', class: 'class', background: 'background', alignment: 'alignment' };
        const dataKey = { race: 'races', class: 'classes', background: 'backgrounds', alignment: 'alignments' }[type];
        const list = window.dataManager?.allData?.[dataKey] || [];
        const found = list.find(x => (x.name || '').toLowerCase() === String(name).toLowerCase() || (x.index || '').toLowerCase() === String(name).toLowerCase());
        if (!found) return;
        const hiddenId = { race: 'race', class: 'character-class', background: 'background', alignment: 'alignment' }[type];
        const hidden = document.getElementById(hiddenId);
        if (hidden) hidden.value = found.id || found.index;
        const btn = document.querySelector(`[data-selection-type="${type}"] .selection-text`);
        if (btn) btn.textContent = found.name;
        if (type === 'class') document.dispatchEvent(new CustomEvent('classSelected', { detail: { class: found, id: found.id || found.index, name: found.name } }));
        if (type === 'race') document.dispatchEvent(new CustomEvent('raceSelected', { detail: { race: found, id: found.id || found.index, name: found.name } }));
        if (type === 'background') document.dispatchEvent(new CustomEvent('backgroundSelected', { detail: { background: found, id: found.id || found.index, name: found.name } }));
      }

      selectByName('race', plan.race);
      selectByName('class', plan.class);
      selectByName('background', plan.background);
      selectByName('alignment', plan.alignment);

      // attributes
      if (plan.attributes) {
        const attrs = plan.attributes;
        const ids = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
        ids.forEach(id => { if (typeof attrs[id] === 'number') { const input = document.getElementById(id); if (input) { input.value = String(attrs[id]); input.dispatchEvent(new Event('input', { bubbles: true })); } } });
      }

      // lists: skills, languages, proficiencies, items, spells by names
      function toggleList(containerSel, itemClass, names) {
        if (!Array.isArray(names) || names.length === 0) return;
        const map = new Map();
        document.querySelectorAll(`${containerSel} .${itemClass}`).forEach(el => { const name = el.querySelector(`.${itemClass.replace('-item','-name')}`)?.textContent?.trim(); if (name) map.set(name.toLowerCase(), el); });
        names.forEach(n => {
          const el = map.get(String(n).toLowerCase());
          if (el && !el.classList.contains('selected')) el.click();
        });
      }

      toggleList('#skills-list', 'skill-item', plan.skills);
      toggleList('#languages-list', 'language-item', plan.languages);
      toggleList('#proficiencies-list', 'proficiency-item', plan.proficiencies);
      toggleList('#starting-equipment-list', 'equipment-item', plan.items); // best-effort

      // spells: group across levels by name
      toggleList('#spells-list', 'spell-item', plan.spells);

      if (window.previewManager) window.previewManager.updatePreview();
    } catch (e) {
      // no-op
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountUI);
  } else {
    mountUI();
  }
})();
