"""
Cliente para datos estáticos de World of Darkness.

Este módulo proporciona datos estáticos para el sistema World of Darkness,
ya que no hay una API pública oficial disponible.
"""

from typing import Dict, List, Any
from functools import lru_cache

class WorldOfDarknessClient:
    """
    Cliente para datos estáticos de World of Darkness.
    
    Proporciona métodos para acceder a diferentes recursos del sistema
    como clanes (razas), disciplinas (habilidades), etc.
    """
    
    @staticmethod
    @lru_cache(maxsize=1)
    def get_clans() -> List[Dict[str, Any]]:
        """
        Obtiene todos los clanes de vampiros disponibles (equivalente a razas).

        Returns:
            List[Dict[str, Any]]: Lista de clanes
        """
        return [
            {
                "id": "brujah",
                "name": "Brujah",
                "description": "Rebeldes apasionados y filósofos iracundos, llevan la sangre de los guerreros.",
                "source": "wod"
            },
            {
                "id": "gangrel",
                "name": "Gangrel",
                "description": "Nómadas solitarios con afinidad a los animales y a la naturaleza.",
                "source": "wod"
            },
            {
                "id": "malkavian",
                "name": "Malkavian",
                "description": "Bendecidos y maldecidos con la locura y visiones proféticas.",
                "source": "wod"
            },
            {
                "id": "nosferatu",
                "name": "Nosferatu",
                "description": "Desfigurados por la Maldición, son maestros de la información y el sigilo.",
                "source": "wod"
            },
            {
                "id": "toreador",
                "name": "Toreador",
                "description": "Apasionados por el arte y la belleza, son los más humanos de los vampiros.",
                "source": "wod"
            },
            {
                "id": "tremere",
                "name": "Tremere",
                "description": "Magos convertidos en vampiros, organizados en una estructura hermética.",
                "source": "wod"
            },
            {
                "id": "ventrue",
                "name": "Ventrue",
                "description": "Nobles y aristocráticos, son los líderes naturales de la sociedad vampírica.",
                "source": "wod"
            }
        ]
    
    @staticmethod
    @lru_cache(maxsize=1)
    def get_disciplines() -> List[Dict[str, Any]]:
        """
        Obtiene todas las disciplinas disponibles (equivalente a habilidades/hechizos).

        Returns:
            List[Dict[str, Any]]: Lista de disciplinas
        """
        return [
            {
                "id": "animalism",
                "name": "Animalism",
                "description": "Control sobre las bestias y la propia Bestia interior.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "auspex",
                "name": "Auspex",
                "description": "Percepción sobrenatural y sentidos agudizados.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "celerity",
                "name": "Celerity",
                "description": "Velocidad y reflejos sobrehumanos.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "dominate",
                "name": "Dominate",
                "description": "Control mental y manipulación de la voluntad.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "fortitude",
                "name": "Fortitude",
                "description": "Resistencia sobrenatural y capacidad de soportar daño.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "obfuscate",
                "name": "Obfuscate",
                "description": "Ocultación y manipulación de la percepción.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "potence",
                "name": "Potence",
                "description": "Fuerza sobrehumana.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "presence",
                "name": "Presence",
                "description": "Manipulación emocional y carisma sobrenatural.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "protean",
                "name": "Protean",
                "description": "Transformación física y adaptación.",
                "level": 1,
                "source": "wod"
            },
            {
                "id": "thaumaturgy",
                "name": "Thaumaturgy",
                "description": "Magia de sangre de los Tremere.",
                "level": 1,
                "source": "wod"
            }
        ]
    
    @staticmethod
    @lru_cache(maxsize=1)
    def get_attributes() -> List[Dict[str, Any]]:
        """
        Obtiene todos los atributos disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de atributos
        """
        return [
            # Atributos Físicos
            {
                "id": "strength",
                "name": "Strength",
                "category": "physical",
                "description": "Fuerza física y poder muscular.",
                "source": "wod"
            },
            {
                "id": "dexterity",
                "name": "Dexterity",
                "category": "physical",
                "description": "Agilidad, coordinación y velocidad.",
                "source": "wod"
            },
            {
                "id": "stamina",
                "name": "Stamina",
                "category": "physical",
                "description": "Resistencia y capacidad de recuperación.",
                "source": "wod"
            },
            # Atributos Sociales
            {
                "id": "charisma",
                "name": "Charisma",
                "category": "social",
                "description": "Encanto personal y presencia.",
                "source": "wod"
            },
            {
                "id": "manipulation",
                "name": "Manipulation",
                "category": "social",
                "description": "Capacidad de influir en otros.",
                "source": "wod"
            },
            {
                "id": "appearance",
                "name": "Appearance",
                "category": "social",
                "description": "Atractivo físico y belleza.",
                "source": "wod"
            },
            # Atributos Mentales
            {
                "id": "perception",
                "name": "Perception",
                "category": "mental",
                "description": "Capacidad de observación y atención.",
                "source": "wod"
            },
            {
                "id": "intelligence",
                "name": "Intelligence",
                "category": "mental",
                "description": "Razonamiento, memoria y pensamiento analítico.",
                "source": "wod"
            },
            {
                "id": "wits",
                "name": "Wits",
                "category": "mental",
                "description": "Pensamiento rápido y reacción mental.",
                "source": "wod"
            }
        ]
    
    @staticmethod
    @lru_cache(maxsize=1)
    def get_abilities() -> List[Dict[str, Any]]:
        """
        Obtiene todas las habilidades disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de habilidades
        """
        return [
            # Talentos
            {
                "id": "alertness",
                "name": "Alertness",
                "category": "talent",
                "description": "Percepción y conciencia del entorno.",
                "source": "wod"
            },
            {
                "id": "athletics",
                "name": "Athletics",
                "category": "talent",
                "description": "Capacidad atlética general.",
                "source": "wod"
            },
            {
                "id": "brawl",
                "name": "Brawl",
                "category": "talent",
                "description": "Combate sin armas.",
                "source": "wod"
            },
            {
                "id": "empathy",
                "name": "Empathy",
                "category": "talent",
                "description": "Comprensión de emociones ajenas.",
                "source": "wod"
            },
            {
                "id": "expression",
                "name": "Expression",
                "category": "talent",
                "description": "Comunicación artística y emocional.",
                "source": "wod"
            },
            {
                "id": "intimidation",
                "name": "Intimidation",
                "category": "talent",
                "description": "Infundir miedo e imponer respeto.",
                "source": "wod"
            },
            {
                "id": "leadership",
                "name": "Leadership",
                "category": "talent",
                "description": "Capacidad para liderar y dirigir.",
                "source": "wod"
            },
            {
                "id": "streetwise",
                "name": "Streetwise",
                "category": "talent",
                "description": "Conocimiento de la vida en las calles.",
                "source": "wod"
            },
            {
                "id": "subterfuge",
                "name": "Subterfuge",
                "category": "talent",
                "description": "Engaño y manipulación sutil.",
                "source": "wod"
            },
            
            # Habilidades
            {
                "id": "animal_ken",
                "name": "Animal Ken",
                "category": "skill",
                "description": "Comprensión y manejo de animales.",
                "source": "wod"
            },
            {
                "id": "crafts",
                "name": "Crafts",
                "category": "skill",
                "description": "Creación y reparación de objetos.",
                "source": "wod"
            },
            {
                "id": "drive",
                "name": "Drive",
                "category": "skill",
                "description": "Manejo de vehículos.",
                "source": "wod"
            },
            {
                "id": "etiquette",
                "name": "Etiquette",
                "category": "skill",
                "description": "Protocolo social y buenos modales.",
                "source": "wod"
            },
            {
                "id": "firearms",
                "name": "Firearms",
                "category": "skill",
                "description": "Manejo de armas de fuego.",
                "source": "wod"
            },
            {
                "id": "melee",
                "name": "Melee",
                "category": "skill",
                "description": "Combate con armas cuerpo a cuerpo.",
                "source": "wod"
            },
            {
                "id": "performance",
                "name": "Performance",
                "category": "skill",
                "description": "Actuación y artes escénicas.",
                "source": "wod"
            },
            {
                "id": "security",
                "name": "Security",
                "category": "skill",
                "description": "Sistemas de seguridad y cerrajería.",
                "source": "wod"
            },
            {
                "id": "stealth",
                "name": "Stealth",
                "category": "skill",
                "description": "Sigilo y ocultación.",
                "source": "wod"
            },
            {
                "id": "survival",
                "name": "Survival",
                "category": "skill",
                "description": "Supervivencia en entornos hostiles.",
                "source": "wod"
            },
            
            # Conocimientos
            {
                "id": "academics",
                "name": "Academics",
                "category": "knowledge",
                "description": "Conocimientos académicos generales.",
                "source": "wod"
            },
            {
                "id": "computer",
                "name": "Computer",
                "category": "knowledge",
                "description": "Manejo de sistemas informáticos.",
                "source": "wod"
            },
            {
                "id": "finance",
                "name": "Finance",
                "category": "knowledge",
                "description": "Conocimiento de finanzas y economía.",
                "source": "wod"
            },
            {
                "id": "investigation",
                "name": "Investigation",
                "category": "knowledge",
                "description": "Capacidad para investigar y resolver misterios.",
                "source": "wod"
            },
            {
                "id": "law",
                "name": "Law",
                "category": "knowledge",
                "description": "Conocimiento de leyes y sistemas legales.",
                "source": "wod"
            },
            {
                "id": "medicine",
                "name": "Medicine",
                "category": "knowledge",
                "description": "Conocimientos médicos y de primeros auxilios.",
                "source": "wod"
            },
            {
                "id": "occult",
                "name": "Occult",
                "category": "knowledge",
                "description": "Conocimiento de lo sobrenatural y místico.",
                "source": "wod"
            },
            {
                "id": "politics",
                "name": "Politics",
                "category": "knowledge",
                "description": "Comprensión de sistemas políticos y relaciones de poder.",
                "source": "wod"
            },
            {
                "id": "science",
                "name": "Science",
                "category": "knowledge",
                "description": "Conocimiento científico general.",
                "source": "wod"
            },
        ]
    
    @staticmethod
    @lru_cache(maxsize=1)
    def get_backgrounds() -> List[Dict[str, Any]]:
        """
        Obtiene todos los trasfondos disponibles.

        Returns:
            List[Dict[str, Any]]: Lista de trasfondos
        """
        return [
            {
                "id": "allies",
                "name": "Allies",
                "description": "Personas influyentes que te apoyan.",
                "source": "wod"
            },
            {
                "id": "contacts",
                "name": "Contacts",
                "description": "Red de informantes y conocidos.",
                "source": "wod"
            },
            {
                "id": "fame",
                "name": "Fame",
                "description": "Reconocimiento público y celebridad.",
                "source": "wod"
            },
            {
                "id": "generation",
                "name": "Generation",
                "description": "Cercanía a Caín, el primer vampiro.",
                "source": "wod"
            },
            {
                "id": "herd",
                "name": "Herd",
                "description": "Grupo de mortales para alimentarse.",
                "source": "wod"
            },
            {
                "id": "influence",
                "name": "Influence",
                "description": "Poder en la sociedad mortal.",
                "source": "wod"
            },
            {
                "id": "mentor",
                "name": "Mentor",
                "description": "Guía y maestro vampírico.",
                "source": "wod"
            },
            {
                "id": "resources",
                "name": "Resources",
                "description": "Riqueza material y financiera.",
                "source": "wod"
            },
            {
                "id": "retainers",
                "name": "Retainers",
                "description": "Sirvientes y ayudantes leales.",
                "source": "wod"
            },
            {
                "id": "status",
                "name": "Status",
                "description": "Posición en la sociedad vampírica.",
                "source": "wod"
            }
        ]
