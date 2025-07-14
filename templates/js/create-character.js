// Refactorización completa del JS para la página de creación de personajes
// Carga datos de la API y los muestra en los selects y contenedores

class CharacterCreator {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.cacheElements();
            this.clearAll();
            this.setupNavigation();
            this.loadAllData();
            this.setupPreview();
            this.setupAttributeControls();
            this.setupExperienceControls();
        });
    }

    cacheElements() {
        this.selects = {
            race: document.getElementById('race'),
            class: document.getElementById('character-class'),
            background: document.getElementById('background'),
            alignment: document.getElementById('alignment'),
        };
        this.containers = {
            skills: document.getElementById('skills-container'),
            languages: document.getElementById('languages-container'),
            proficiencies: document.getElementById('proficiencies-container'),
        };
        this.tabs = document.querySelectorAll('.tab-button');
        this.sections = document.querySelectorAll('.form-section');
        this.attributes = document.querySelectorAll('.attribute-control');
        this.experience = document.querySelector('.experience-control');
    }

    clearAll() {
        Object.values(this.selects).forEach(select => {
            if (select) {
                select.innerHTML = select.querySelector('option') ? select.querySelector('option').outerHTML : '';
            }
        });
        Object.values(this.containers).forEach(container => {
            if (container) container.innerHTML = '';
        });
    }

    setupAttributeControls() {
        this.attributes.forEach(attr => {
            const incrementButton = attr.querySelector('.increment');
            const decrementButton = attr.querySelector('.decrement');
            const valueDisplay = attr.querySelector('.value');

            let value = 10;
            valueDisplay.textContent = value;

            incrementButton.addEventListener('click', () => {
                value++;
                valueDisplay.textContent = value;
            });

            decrementButton.addEventListener('click', () => {
                if (value > 0) {
                    value--;
                    valueDisplay.textContent = value;
                }
            });

            valueDisplay.setAttribute('type', 'text'); // Eliminar flechas por defecto
        });
    }

    setupExperienceControls() {
        const incrementButton = this.experience.querySelector('.increment');
        const decrementButton = this.experience.querySelector('.decrement');
        const valueDisplay = this.experience.querySelector('.value');

        let value = 0;
        valueDisplay.textContent = value;

        incrementButton.addEventListener('click', () => {
            value++;
            valueDisplay.textContent = value;
        });

        decrementButton.addEventListener('click', () => {
            if (value > 0) {
                value--;
                valueDisplay.textContent = value;
            }
        });

        valueDisplay.setAttribute('type', 'text'); // Eliminar flechas por defecto
    }

    async loadAllData() {
        try {
            const endpoints = {
                race: '/api/races',
                class: '/api/classes',
                background: '/api/backgrounds',
                alignment: '/api/alignments',
                skills: '/api/skills',
                languages: '/api/languages',
                proficiencies: '/api/proficiencies',
            };
            const results = await Promise.all(Object.entries(endpoints).map(([key, url]) => fetch(url).then(r => r.json())));
            // Selects
            this.populateSelect(this.selects.race, results[0], 'race');
            this.populateSelect(this.selects.class, results[1], 'class');
            this.populateSelect(this.selects.background, results[2], 'background');
            this.populateSelect(this.selects.alignment, results[3], 'alignment');
            // Contenedores
            this.populateSkills(results[4]);
            this.populateLanguages(results[5]);
            this.populateProficiencies(results[6]);
        } catch (err) {
            this.showError('Error cargando datos de la API.');
        }
    }

    setupNavigation() {
        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.tabs.forEach(t => t.classList.remove('active'));
                this.sections.forEach(s => s.classList.add('hidden'));
                tab.classList.add('active');
                this.sections[index].classList.remove('hidden');
            });
        });
    }

    populateSelect(select, options, type) {
        if (!select) return;
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.id;
            option.textContent = `${opt.name} (${opt.source})`;
            select.appendChild(option);
        });
    }

    populateSkills(skills) {
        const container = this.containers.skills;
        if (!container) return;
        skills.forEach(skill => {
            const div = document.createElement('div');
            div.textContent = `${skill.name} (${skill.source})`;
            container.appendChild(div);
        });
    }

    populateLanguages(languages) {
        const container = this.containers.languages;
        if (!container) return;
        languages.forEach(language => {
            const div = document.createElement('div');
            div.textContent = `${language.name} (${language.source})`;
            container.appendChild(div);
        });
    }

    populateProficiencies(proficiencies) {
        const container = this.containers.proficiencies;
        if (!container) return;
        proficiencies.forEach(prof => {
            const div = document.createElement('div');
            div.textContent = `${prof.name} (${prof.source})`;
            container.appendChild(div);
        });
    }

    setupPreview() {
        // Implementación de la vista previa del personaje
    }

    showError(msg) {
        alert(msg);
    }
}

new CharacterCreator();
