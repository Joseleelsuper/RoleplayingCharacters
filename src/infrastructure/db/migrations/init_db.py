#!/usr/bin/env python3
"""
Script de inicialización de la base de datos.

Este script crea todas las tablas necesarias en la base de datos PostgreSQL
y puede poblar datos iniciales si es necesario.
"""

import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar módulos
root_dir = Path(__file__).parent.parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from src.infrastructure.db.database import create_tables, check_database_connection, engine
from src.infrastructure.db.models.base import Base
from src.infrastructure.config import settings
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def init_database():
    """
    Inicializa la base de datos creando todas las tablas.
    """
    logger.info("Iniciando inicialización de la base de datos...")
    
    # Verificar configuración
    if not settings.postgres_url:
        logger.error("POSTGRES_URL no está configurada. Verifica las variables de entorno.")
        return False
    
    logger.info(f"Conectando a la base de datos: {settings.postgres_url.split('@')[1] if '@' in settings.postgres_url else 'configuración oculta'}")
    
    # Verificar conexión
    if not check_database_connection():
        logger.error("No se pudo conectar a la base de datos")
        return False
    
    try:
        # Crear todas las tablas
        logger.info("Creando tablas...")
        create_tables()
        logger.info("✅ Tablas creadas exitosamente")
        
        # Verificar que las tablas se crearon
        from sqlalchemy import text
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            )
            tables = [row[0] for row in result]
            logger.info(f"Tablas creadas: {', '.join(tables)}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error al crear las tablas: {e}")
        return False


def populate_initial_data():
    """
    Pobla la base de datos con datos iniciales si es necesario.
    """
    logger.info("Poblando datos iniciales...")
    
    try:
        from sqlalchemy.orm import sessionmaker
        from src.infrastructure.db.models import (
            AlignmentModel, RaceModel, BackgroundModel, SkillModel,
            LanguageModel, ProficiencyModel, ItemModel, SpellModel, ClassModel
        )
        
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Verificar si ya hay datos
        if db.query(AlignmentModel).count() > 0:
            logger.info("La base de datos ya contiene datos iniciales")
            db.close()
            return True
        
        # Crear alineaciones básicas
        alignments = [
            AlignmentModel(name="Lawful Good"),
            AlignmentModel(name="Neutral Good"),
            AlignmentModel(name="Chaotic Good"),
            AlignmentModel(name="Lawful Neutral"),
            AlignmentModel(name="True Neutral"),
            AlignmentModel(name="Chaotic Neutral"),
            AlignmentModel(name="Lawful Evil"),
            AlignmentModel(name="Neutral Evil"),
            AlignmentModel(name="Chaotic Evil"),
        ]
        
        for alignment in alignments:
            db.add(alignment)
        
        # Crear razas básicas
        races = [
            RaceModel(name="Human", trait_json={"ability_score_increase": {"all": 1}}),
            RaceModel(name="Elf", trait_json={"ability_score_increase": {"dexterity": 2}}),
            RaceModel(name="Dwarf", trait_json={"ability_score_increase": {"constitution": 2}}),
            RaceModel(name="Halfling", trait_json={"ability_score_increase": {"dexterity": 2}}),
        ]
        
        for race in races:
            db.add(race)
        
        # Crear trasfondos básicos
        backgrounds = [
            BackgroundModel(name="Acolyte", feature="Shelter of the Faithful"),
            BackgroundModel(name="Criminal", feature="Criminal Contact"),
            BackgroundModel(name="Folk Hero", feature="Rustic Hospitality"),
            BackgroundModel(name="Noble", feature="Position of Privilege"),
            BackgroundModel(name="Sage", feature="Researcher"),
            BackgroundModel(name="Soldier", feature="Military Rank"),
        ]
        
        for background in backgrounds:
            db.add(background)
        
        # Crear habilidades básicas
        skills = [
            SkillModel(name="Acrobatics", description="Dexterity-based skill"),
            SkillModel(name="Animal Handling", description="Wisdom-based skill"),
            SkillModel(name="Arcana", description="Intelligence-based skill"),
            SkillModel(name="Athletics", description="Strength-based skill"),
            SkillModel(name="Deception", description="Charisma-based skill"),
            SkillModel(name="History", description="Intelligence-based skill"),
            SkillModel(name="Insight", description="Wisdom-based skill"),
            SkillModel(name="Intimidation", description="Charisma-based skill"),
            SkillModel(name="Investigation", description="Intelligence-based skill"),
            SkillModel(name="Medicine", description="Wisdom-based skill"),
            SkillModel(name="Nature", description="Intelligence-based skill"),
            SkillModel(name="Perception", description="Wisdom-based skill"),
            SkillModel(name="Performance", description="Charisma-based skill"),
            SkillModel(name="Persuasion", description="Charisma-based skill"),
            SkillModel(name="Religion", description="Intelligence-based skill"),
            SkillModel(name="Sleight of Hand", description="Dexterity-based skill"),
            SkillModel(name="Stealth", description="Dexterity-based skill"),
            SkillModel(name="Survival", description="Wisdom-based skill"),
        ]
        
        for skill in skills:
            db.add(skill)
        
        # Crear idiomas básicos
        languages = [
            LanguageModel(name="Common", description="The most widely spoken language"),
            LanguageModel(name="Elvish", description="Language of the elves"),
            LanguageModel(name="Dwarvish", description="Language of the dwarves"),
            LanguageModel(name="Halfling", description="Language of the halflings"),
            LanguageModel(name="Draconic", description="Language of dragons"),
            LanguageModel(name="Orcish", description="Language of orcs"),
        ]
        
        for language in languages:
            db.add(language)
        
        # Crear clases básicas de D&D 5e
        classes = [
            ClassModel(
                name="Fighter",
                description="A master of martial combat, skilled with a variety of weapons and armor.",
                hit_die=10,
                primary_ability="Strength or Dexterity",
                saving_throw_proficiencies="Strength, Constitution",
                skill_proficiencies="Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Perception, Survival"
            ),
            ClassModel(
                name="Wizard",
                description="A scholarly magic-user capable of manipulating the structures of spells.",
                hit_die=6,
                primary_ability="Intelligence",
                saving_throw_proficiencies="Intelligence, Wisdom",
                skill_proficiencies="Arcana, History, Insight, Investigation, Medicine, Religion"
            ),
            ClassModel(
                name="Rogue",
                description="A scoundrel who uses stealth and trickery to overcome obstacles.",
                hit_die=8,
                primary_ability="Dexterity",
                saving_throw_proficiencies="Dexterity, Intelligence",
                skill_proficiencies="Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Performance, Persuasion, Sleight of Hand, Stealth"
            ),
            ClassModel(
                name="Cleric",
                description="A priestly champion who wields divine magic in service of a higher power.",
                hit_die=8,
                primary_ability="Wisdom",
                saving_throw_proficiencies="Wisdom, Charisma",
                skill_proficiencies="History, Insight, Medicine, Persuasion, Religion"
            ),
            ClassModel(
                name="Ranger",
                description="A warrior of the wilderness, skilled in tracking, survival, and combat.",
                hit_die=10,
                primary_ability="Dexterity and Wisdom",
                saving_throw_proficiencies="Strength, Dexterity",
                skill_proficiencies="Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, Survival"
            ),
            ClassModel(
                name="Barbarian",
                description="A fierce warrior of primitive background who can enter a battle rage.",
                hit_die=12,
                primary_ability="Strength",
                saving_throw_proficiencies="Strength, Constitution",
                skill_proficiencies="Animal Handling, Athletics, Intimidation, Nature, Perception, Survival"
            )
        ]
        
        for character_class in classes:
            db.add(character_class)
        
        db.commit()
        db.close()
        
        logger.info("✅ Datos iniciales poblados exitosamente")
        return True
        
    except Exception as e:
        logger.error(f"Error al poblar datos iniciales: {e}")
        if 'db' in locals():
            db.rollback()
            db.close()
        return False


def main():
    """
    Función principal del script de inicialización.
    """
    logger.info("=== Inicialización de Base de Datos ===")
    
    # Inicializar base de datos
    if not init_database():
        logger.error("❌ Error en la inicialización de la base de datos")
        sys.exit(1)
    
    # Poblar datos iniciales
    if not populate_initial_data():
        logger.error("❌ Error al poblar datos iniciales")
        sys.exit(1)
    
    logger.info("✅ Inicialización completada exitosamente")
    logger.info("La aplicación está lista para usar con PostgreSQL")


if __name__ == "__main__":
    main()