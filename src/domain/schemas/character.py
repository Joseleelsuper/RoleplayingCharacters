from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CharacterAttributesCreate(BaseModel):
    """Schema para crear atributos de personaje"""
    strength: int = Field(..., ge=1, le=20, description="Fuerza del personaje")
    dexterity: int = Field(..., ge=1, le=20, description="Destreza del personaje")
    constitution: int = Field(..., ge=1, le=20, description="Constitución del personaje")
    intelligence: int = Field(..., ge=1, le=20, description="Inteligencia del personaje")
    wisdom: int = Field(..., ge=1, le=20, description="Sabiduría del personaje")
    charisma: int = Field(..., ge=1, le=20, description="Carisma del personaje")


class CharacterSkillCreate(BaseModel):
    """Schema para crear habilidades de personaje"""
    skill_id: UUID
    proficiency_bonus: int = Field(..., ge=0, description="Bonificador de competencia")


class CharacterLanguageCreate(BaseModel):
    """Schema para crear idiomas de personaje"""
    language_id: UUID


class CharacterProficiencyCreate(BaseModel):
    """Schema para crear competencias de personaje"""
    proficiency_id: UUID


class CharacterItemCreate(BaseModel):
    """Schema para crear objetos de personaje"""
    item_id: UUID
    quantity: int = Field(default=1, ge=1, description="Cantidad del objeto")
    equipped_flag: bool = Field(default=False, description="Si el objeto está equipado")


class CharacterSpellCreate(BaseModel):
    """Schema para crear hechizos de personaje"""
    spell_id: UUID
    level_slot: int = Field(..., ge=0, le=9, description="Nivel del slot de hechizo")
    prepared_flag: bool = Field(default=False, description="Si el hechizo está preparado")


class CharacterCreate(BaseModel):
    """Schema para crear un personaje"""
    name: str = Field(..., min_length=1, max_length=100, description="Nombre del personaje")
    player_name: Optional[str] = Field(None, max_length=100, description="Nombre del jugador")
    level: int = Field(default=1, ge=1, le=20, description="Nivel del personaje")
    alignment_id: Optional[UUID] = Field(None, description="ID de la alineación")
    race_id: Optional[UUID] = Field(None, description="ID de la raza")
    class_id: Optional[UUID] = Field(None, description="ID de la clase")
    background_id: Optional[UUID] = Field(None, description="ID del trasfondo")
    experience: int = Field(default=0, ge=0, description="Puntos de experiencia")
    is_anonymous: bool = Field(default=False, description="Si el personaje es anónimo")
    
    # Datos relacionados
    attributes: Optional[CharacterAttributesCreate] = None
    skills: Optional[List[CharacterSkillCreate]] = Field(default_factory=list)
    languages: Optional[List[CharacterLanguageCreate]] = Field(default_factory=list)
    proficiencies: Optional[List[CharacterProficiencyCreate]] = Field(default_factory=list)
    items: Optional[List[CharacterItemCreate]] = Field(default_factory=list)
    spells: Optional[List[CharacterSpellCreate]] = Field(default_factory=list)


class CharacterAttributesResponse(BaseModel):
    """Schema para respuesta de atributos de personaje"""
    character_id: UUID
    strength: int
    dexterity: int
    constitution: int
    intelligence: int
    wisdom: int
    charisma: int

    class Config:
        from_attributes = True


class CharacterResponse(BaseModel):
    """Schema para respuesta de personaje"""
    id: UUID
    user_id: Optional[UUID]
    name: str
    player_name: Optional[str]
    level: int
    alignment_id: Optional[UUID]
    race_id: Optional[UUID]
    class_id: Optional[UUID]
    background_id: Optional[UUID]
    experience: int
    is_anonymous: bool
    created_at: datetime
    updated_at: datetime
    
    # Datos relacionados (opcionales para evitar carga innecesaria)
    attributes: Optional[CharacterAttributesResponse] = None
    username: Optional[str] = Field(None, description="Nombre de usuario del creador")

    class Config:
        from_attributes = True


class CharacterListResponse(BaseModel):
    """Schema para lista de personajes"""
    characters: List[CharacterResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CharacterSearchRequest(BaseModel):
    """Schema para búsqueda de personajes"""
    query: Optional[str] = Field(None, description="Término de búsqueda")
    race_id: Optional[UUID] = Field(None, description="Filtrar por raza")
    class_id: Optional[UUID] = Field(None, description="Filtrar por clase")
    level_min: Optional[int] = Field(None, ge=1, le=20, description="Nivel mínimo")
    level_max: Optional[int] = Field(None, ge=1, le=20, description="Nivel máximo")
    include_anonymous: bool = Field(default=True, description="Incluir personajes anónimos")
    page: int = Field(default=1, ge=1, description="Página")
    page_size: int = Field(default=20, ge=1, le=100, description="Tamaño de página")