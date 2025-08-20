(function () {
  const container = document.querySelector('.my-character-container');
  const downloadBtn = document.getElementById('download-character-btn');
  const backBtn = document.getElementById('back-btn');

  if (!container || !downloadBtn || !backBtn) return;

  // Recolecta los datos del personaje desde el DOM renderizado
  function collectCharacterData() {
    const name = document.querySelector('.character-name')?.textContent?.trim() || '';
    const playerName = document.querySelector('.player-name')?.textContent?.replace('Jugador:','').trim() || '';

    // Badges básicos
    const badges = Array.from(document.querySelectorAll('.character-basic-info .info-badge')).map(b => b.textContent.trim());
    const levelBadge = badges.find(b => /^Nivel\s+\d+$/i.test(b)) || '';
    const levelMatch = levelBadge.match(/(\d+)/);
    const level = levelMatch ? parseInt(levelMatch[1], 10) : 1;

    const race = badges.find(b => b !== levelBadge) || '';

    // Clase y alineamiento si existen badges adicionales
    let characterClass = '';
    let alignment = '';
    const basicInfo = document.querySelector('.character-basic-info');
    if (basicInfo) {
      const spans = Array.from(basicInfo.querySelectorAll('.info-badge'));
      // Heurística simple por posición: [race?, class?, level, alignment?]
      if (spans.length >= 2) {
        characterClass = spans[1]?.textContent?.trim() || '';
      }
      if (spans.length >= 4) {
        alignment = spans[3]?.textContent?.trim() || '';
      }
    }

    // Atributos
    const attrs = {};
    const attrMap = {
      'Fuerza': 'strength',
      'Destreza': 'dexterity',
      'Constitución': 'constitution',
      'Inteligencia': 'intelligence',
      'Sabiduría': 'wisdom',
      'Carisma': 'charisma'
    };

    document.querySelectorAll('.attributes-grid .attribute-item').forEach(item => {
      const label = item.querySelector('.attribute-name')?.textContent?.trim();
      const value = item.querySelector('.attribute-value')?.textContent?.trim();
      if (label && value && attrMap[label]) {
        attrs[attrMap[label]] = parseInt(value, 10);
      }
    });

    // Listas
    const listText = (selector, nameSelector) => Array.from(document.querySelectorAll(selector)).map(el => el.querySelector(nameSelector)?.textContent?.trim()).filter(Boolean);

    const skills = listText('.skills-list .skill-item', '.skill-name');
    const languages = listText('.languages-list .language-item', '.language-name');
    const proficiencies = listText('.proficiencies-list .proficiency-item', '.proficiency-name');

    const items = Array.from(document.querySelectorAll('.items-list .item-item')).map(el => ({
      name: el.querySelector('.item-name')?.textContent?.trim() || '',
      quantity: parseInt((el.querySelector('.item-quantity')?.textContent?.replace('x','') || '1').trim(), 10)
    }));

    const spells = Array.from(document.querySelectorAll('.spells-list .spell-item')).map(el => ({
      name: el.querySelector('.spell-name')?.textContent?.trim() || '',
      level: parseInt((el.querySelector('.spell-level')?.textContent?.replace(/[^0-9]/g, '') || '0').trim(), 10)
    }));

    return {
      id: container.getAttribute('data-character-id') || '',
      name,
      player_name: playerName,
      level,
      experience: 0,
      race,
      character_class: characterClass,
      background: '',
      alignment,
      attributes: Object.keys(attrs).length ? attrs : undefined,
      skills,
      languages,
      proficiencies,
      items,
      spells
    };
  }

  function downloadCharacter() {
    const characterData = collectCharacterData();
    const dataStr = JSON.stringify(characterData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    const safeName = (characterData.name || 'character').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${safeName}_character.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  downloadBtn.addEventListener('click', downloadCharacter);
  backBtn.addEventListener('click', () => window.history.back());
})();
