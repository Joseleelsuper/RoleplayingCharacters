/**
 * Clase para manejar los overlays de selección con información detallada
 */
class SelectionOverlay {
    constructor() {
        this.overlay = null;
        this.overlayTitle = null;
        this.overlayOptions = null;
        this.overlaySearch = null;
        this.currentType = null;
        this.currentData = [];
        this.filteredData = [];
        this.selectedValue = null;
        this.onSelectionCallback = null;
    }

    init() {
        this.overlay = document.getElementById('selection-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayOptions = document.getElementById('overlay-options');
        this.overlaySearch = document.getElementById('overlay-search');
        
        // Event listeners
        document.getElementById('overlay-close').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        
        this.overlaySearch.addEventListener('input', (e) => this.filterOptions(e.target.value));
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
                this.close();
            }
        });
        
        // Selection button listeners
        document.querySelectorAll('.selection-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.selectionType;
                this.openSelection(type);
            });
        });
    }

    openSelection(type) {
        this.currentType = type;
        this.selectedValue = null;
        
        // Get data from dataManager
        if (!window.dataManager || !window.dataManager.allData) {
            console.error('Data not loaded yet');
            return;
        }
        
        const dataKey = this.getDataKey(type);
        this.currentData = window.dataManager.allData[dataKey] || [];
        this.filteredData = [...this.currentData];
        
        // Set title
        this.overlayTitle.textContent = this.getTitle(type);
        
        // Clear search
        this.overlaySearch.value = '';
        
        // Render options
        this.renderOptions();
        
        // Show overlay
        this.overlay.classList.remove('hidden');
        this.overlaySearch.focus();
    }

    close() {
        this.overlay.classList.add('hidden');
        this.currentType = null;
        this.currentData = [];
        this.filteredData = [];
    }

    getDataKey(type) {
        const mapping = {
            'race': 'races',
            'class': 'classes',
            'background': 'backgrounds',
            'alignment': 'alignments'
        };
        return mapping[type] || type;
    }

    getTitle(type) {
        const titles = {
            'race': 'Seleccionar Raza',
            'class': 'Seleccionar Clase',
            'background': 'Seleccionar Trasfondo',
            'alignment': 'Seleccionar Alineamiento'
        };
        return titles[type] || 'Seleccionar';
    }

    filterOptions(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredData = [...this.currentData];
        } else {
            this.filteredData = this.currentData.filter(item => 
                item.name.toLowerCase().includes(term) ||
                (item.description && item.description.toLowerCase().includes(term))
            );
        }
        this.renderOptions();
    }

    renderOptions() {
        this.overlayOptions.innerHTML = '';
        
        if (this.filteredData.length === 0) {
            this.overlayOptions.innerHTML = '<p class="no-results">No se encontraron resultados</p>';
            return;
        }
        
        this.filteredData.forEach(item => {
            const optionCard = this.createOptionCard(item);
            this.overlayOptions.appendChild(optionCard);
        });
    }

    createOptionCard(item) {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.dataset.value = item.id || item.index;
        
        const icon = this.getIcon(this.currentType, item);
        const description = this.getDescription(item);
        const details = this.getDetails(this.currentType, item);
        
        card.innerHTML = `
            <div class="option-header">
                <div class="option-icon">${icon}</div>
                <div>
                    <h4 class="option-title">${item.name}</h4>
                    <p class="option-subtitle">${this.getSubtitle(this.currentType, item)}</p>
                </div>
            </div>
            ${description ? `<p class="option-description">${description}</p>` : ''}
            ${details ? `<div class="option-details">${details}</div>` : ''}
        `;
        
        card.addEventListener('click', () => this.selectOption(item));
        
        return card;
    }

    getIcon(type, item) {
        const icons = {
            'race': this.getRaceIcon(item),
            'class': this.getClassIcon(item),
            'background': '📜',
            'alignment': this.getAlignmentIcon(item)
        };
        return icons[type] || '📋';
    }

    getRaceIcon(race) {
        const raceIcons = {
            'human': '👤',
            'elf': '🧝',
            'dwarf': '🧔',
            'halfling': '🧙‍♂️',
            'dragonborn': '🐲',
            'gnome': '🧚',
            'half-elf': '🧝‍♀️',
            'half-orc': '👹',
            'tiefling': '😈'
        };
        return raceIcons[race.index] || '👤';
    }

    getClassIcon(classItem) {
        const classIcons = {
            'barbarian': '🪓',
            'bard': '🎵',
            'cleric': '⛪',
            'druid': '🌿',
            'fighter': '⚔️',
            'monk': '👊',
            'paladin': '🛡️',
            'ranger': '🏹',
            'rogue': '🗡️',
            'sorcerer': '✨',
            'warlock': '🔮',
            'wizard': '📚'
        };
        return classIcons[classItem.index] || '⚔️';
    }

    getAlignmentIcon(alignment) {
        const alignmentIcons = {
            'lawful-good': '⚖️',
            'neutral-good': '🕊️',
            'chaotic-good': '🌟',
            'lawful-neutral': '📏',
            'neutral': '⚪',
            'chaotic-neutral': '🎲',
            'lawful-evil': '👑',
            'neutral-evil': '💀',
            'chaotic-evil': '🔥'
        };
        return alignmentIcons[alignment.index] || '⚖️';
    }

    getSubtitle(type, item) {
        if (type === 'race') {
            return 'Raza';
        } else if (type === 'class') {
            return 'Clase';
        } else if (type === 'background') {
            return 'Trasfondo';
        } else if (type === 'alignment') {
            return 'Alineamiento';
        }
        return '';
    }

    getDescription(item) {
        if (item.description) {
            return item.description;
        }
        
        // Fallback descriptions for D&D 5e items without descriptions
        if (item.index) {
            return this.getDefaultDescription(item.index);
        }
        
        return '';
    }

    getDefaultDescription(index) {
        const descriptions = {
            // Races
            'human': 'Los humanos son la raza más adaptable y ambiciosa. Su versatilidad les permite destacar en cualquier profesión.',
            'elf': 'Los elfos son seres gráciles y longevos, con una conexión natural con la magia y la naturaleza.',
            'dwarf': 'Los enanos son resistentes y trabajadores, conocidos por su habilidad en la forja y su resistencia.',
            'halfling': 'Los medianos son pequeños pero valientes, con una suerte natural y amor por las comodidades.',
            'dragonborn': 'Los dracónidos combinan lo mejor de los dragones y humanoides, con aliento elemental.',
            'gnome': 'Los gnomos son pequeños pero ingeniosos, con una curiosidad natural y afinidad mágica.',
            'half-elf': 'Los semielfos combinan la versatilidad humana con la gracia élfica.',
            'half-orc': 'Los semiorcos luchan entre su herencia salvaje y su deseo de aceptación.',
            'tiefling': 'Los tieflings cargan con una herencia infernal, pero pueden elegir su propio destino.',
            
            // Classes
            'barbarian': 'Guerreros primitivos que canalizan su furia en combate devastador.',
            'bard': 'Maestros de la música, magia y conocimiento que inspiran a sus aliados.',
            'cleric': 'Campeones divinos que canalizan el poder de sus deidades.',
            'druid': 'Guardianes de la naturaleza que pueden transformarse en bestias.',
            'fighter': 'Maestros del combate con armas y tácticas militares.',
            'monk': 'Artistas marciales que dominan el ki y su propio cuerpo.',
            'paladin': 'Guerreros sagrados que luchan por la justicia y la rectitud.',
            'ranger': 'Exploradores y cazadores que protegen las tierras salvajes.',
            'rogue': 'Especialistas en sigilo, trampas y ataques precisos.',
            'sorcerer': 'Magos innatos que canalizan poder mágico natural.',
            'warlock': 'Conjuradores que obtienen poder de entidades sobrenaturales.',
            'wizard': 'Estudiosos de la magia que dominan hechizos a través del estudio.',
            
            // Alignments
            'lawful-good': 'Actúa según las reglas y hace lo correcto. El cruzado.',
            'neutral-good': 'Hace lo correcto sin estar atado por las reglas. El benefactor.',
            'chaotic-good': 'Actúa según su conciencia, sin importar las expectativas. El rebelde.',
            'lawful-neutral': 'Actúa según las reglas, tradiciones o códigos personales. El juez.',
            'neutral': 'Actúa naturalmente, sin prejuicios ni compulsiones. El indiferente.',
            'chaotic-neutral': 'Actúa según sus caprichos. El espíritu libre.',
            'lawful-evil': 'Toma lo que quiere dentro de un código de tradiciones. El dominador.',
            'neutral-evil': 'Hace lo que sea necesario para salirse con la suya. El malhechor.',
            'chaotic-evil': 'Actúa con violencia arbitraria, movido por su codicia. El destructor.'
        };
        
        return descriptions[index] || '';
    }

    getDetails(type, item) {
        if (type === 'class' && item.hit_die) {
            return `
                <div class="option-stats">
                    <div class="stat-item">
                        <span class="stat-label">Dado de Vida</span>
                        <span class="stat-value">d${item.hit_die}</span>
                    </div>
                </div>
            `;
        }
        
        if (type === 'race' && item.ability_score_bonuses) {
            const bonuses = item.ability_score_bonuses.map(bonus => 
                `+${bonus.bonus} ${bonus.ability_score.name}`
            ).join(', ');
            
            return `
                <div class="option-traits">
                    <strong>Bonificaciones:</strong>
                    <div class="trait-list">
                        ${bonuses.split(', ').map(bonus => `<span class="trait-tag">${bonus}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        return '';
    }

    selectOption(item) {
        this.selectedValue = item.id || item.index;
        
        // Update button text and hidden input
        const button = document.querySelector(`[data-selection-type="${this.currentType}"]`);
        const hiddenInput = document.getElementById(this.getHiddenInputId(this.currentType));
        
        if (button) {
            const textSpan = button.querySelector('.selection-text');
            if (textSpan) {
                textSpan.textContent = item.name;
            }
            button.classList.add('selected');
        }
        
        if (hiddenInput) {
            hiddenInput.value = this.selectedValue;
            
            // Trigger change event for validation
            const changeEvent = new Event('change', { bubbles: true });
            hiddenInput.dispatchEvent(changeEvent);
        }
        
        // Update preview if available
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }
        
        this.close();
    }

    getHiddenInputId(type) {
        const mapping = {
            'race': 'race',
            'class': 'character-class',
            'background': 'background',
            'alignment': 'alignment'
        };
        return mapping[type] || type;
    }
}

// Initialize selection overlay
window.selectionOverlay = new SelectionOverlay();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.selectionOverlay.init();
    });
} else {
    window.selectionOverlay.init();
}