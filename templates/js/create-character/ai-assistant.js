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

    // simple in-memory conversation
    const history = [];

    function buildCurrentState() {
      const getSelected = (selector, itemClass, nameClass) => Array.from(document.querySelectorAll(`${selector} .${itemClass}.selected`)).map(el => el.querySelector(`.${nameClass}`)?.textContent?.trim()).filter(Boolean);
      const attrs = ['strength','dexterity','constitution','intelligence','wisdom','charisma'].reduce((acc,id)=>{ const v = parseInt(document.getElementById(id)?.value||''); if(!isNaN(v)) acc[id]=v; return acc; }, {});
      return {
        name: document.getElementById('character-name')?.value?.trim() || null,
        player_name: document.getElementById('player-name')?.value?.trim() || null,
        game_type: document.getElementById('selected-game-type')?.value || 'custom',
        level: parseInt(document.getElementById('level')?.value || '1') || 1,
        race: document.querySelector('[data-selection-type="race"] .selection-text')?.textContent?.trim() || null,
        class: document.querySelector('[data-selection-type="class"] .selection-text')?.textContent?.trim() || null,
        background: document.querySelector('[data-selection-type="background"] .selection-text')?.textContent?.trim() || null,
        alignment: document.querySelector('[data-selection-type="alignment"] .selection-text')?.textContent?.trim() || null,
        attributes: attrs,
        skills: getSelected('#skills-list','skill-item','skill-name'),
        languages: getSelected('#languages-list','language-item','language-name'),
        proficiencies: getSelected('#proficiencies-list','proficiency-item','proficiency-name'),
        items: getSelected('#starting-equipment-list','equipment-item','equipment-name'),
        spells: getSelected('#spells-list','spell-item','spell-name')
      };
    }

    askBtn.addEventListener('click', async () => {
      const gameType = document.getElementById('selected-game-type')?.value || 'custom';
      const text = prompt.value.trim();
      if (!text) return;
      out.innerText = 'Consultando IA...';
      try {
        history.push({ role: 'user', content: text });
        const payload = { game_type: gameType, prompt: text, history: history.slice(-10), current_state: buildCurrentState() };
        const res = await fetch('/api/ai/advice', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        const message = data.message || JSON.stringify(data);
        out.innerText = message;
        history.push({ role: 'assistant', content: message });
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
        history.push({ role: 'user', content: prompt.value.trim() || 'auto-build' });
        const res = await fetch('/api/ai/auto-build', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_type: gameType, preferences: prefs, history: history.slice(-10), current_state: buildCurrentState() })
        });
        const plan = await res.json();
        out.innerText = plan.rationale ? plan.rationale : 'Plan recibido. Aplicando...';
        applyPlan(plan);
        if (plan.rationale) history.push({ role: 'assistant', content: plan.rationale });
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

      // lists: skills, languages, proficiencies, items, spells by names (respetando límites)
      function toggleList(containerSel, itemClass, names, limitGetter) {
        if (!Array.isArray(names) || names.length === 0) return;
        const map = new Map();
        document.querySelectorAll(`${containerSel} .${itemClass}`).forEach(el => {
          const nameEl = el.querySelector(`.${itemClass.replace('-item','-name')}`);
          const name = nameEl?.textContent?.trim();
          if (name) map.set(name.toLowerCase(), el);
        });
        let max = Number.POSITIVE_INFINITY;
        let current = document.querySelectorAll(`${containerSel} .${itemClass}.selected`).length;
        if (typeof limitGetter === 'function' && window.dataManager) {
          try { max = limitGetter.call(window.dataManager); } catch (_) {}
        }
        for (const n of names) {
          if (current >= max) break;
          const el = map.get(String(n).toLowerCase());
          if (el && !el.classList.contains('selected')) { el.click(); current++; }
        }
      }

      const applyLists = () => {
        toggleList('#skills-list', 'skill-item', plan.skills, window.dataManager?.getSkillsLimits);
        toggleList('#languages-list', 'language-item', plan.languages, window.dataManager?.getLanguagesLimits);
        toggleList('#proficiencies-list', 'proficiency-item', plan.proficiencies, window.dataManager?.getProficienciesLimits);
        toggleList('#starting-equipment-list', 'equipment-item', plan.items);
        toggleList('#spells-list', 'spell-item', plan.spells, function() { return window.dataManager?.getSpellsLimits?.() ?? Number.POSITIVE_INFINITY; });
      };

      if (!window.dataManager?.dataPopulated) {
        const once = () => { document.removeEventListener('dataLoaded', once); setTimeout(applyLists, 50); };
        document.addEventListener('dataLoaded', once);
      } else {
        applyLists();
      }

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
