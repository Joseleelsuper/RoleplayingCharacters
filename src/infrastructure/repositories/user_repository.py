"""
Repositorio de usuarios implementado con SQLAlchemy.

Esta implementación pertenece a la capa de infraestructura y expone
operaciones necesarias para la autenticación y gestión de usuarios.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy import text, exists

from ..db.database import SessionLocal
from ..db.models.user import UserModel


class UserRepository:
    """Repositorio para operaciones de usuarios."""

    def email_exists(self, email: str) -> bool:
        with SessionLocal() as db:
            return db.query(exists().where(UserModel.email == email)).scalar()

    def username_exists(self, username: str) -> bool:
        with SessionLocal() as db:
            return db.query(exists().where(UserModel.username == username)).scalar()

    def create_user(
        self,
        user_id: str,
        username: str,
        email: str,
        password_hash: str,
        created_at: datetime,
    ) -> bool:
        with SessionLocal() as db:
            uuid_obj = UUID(user_id)
            insert_query = text(
                """
                INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
                VALUES (:id, :username, :email, :password_hash, :created_at, :updated_at)
                """
            )
            db.execute(
                insert_query,
                {
                    "id": uuid_obj,
                    "username": username,
                    "email": email,
                    "password_hash": password_hash,
                    "created_at": created_at,
                    "updated_at": created_at,
                },
            )
            db.commit()
            return True

    # Métodos con nombres alineados a la interfaz opcional
    def find_by_email(self, email: str) -> Optional[dict]:
        return self.find_user_by_email(email)

    def find_by_username(self, username: str) -> Optional[dict]:
        with SessionLocal() as db:
            select_query = text(
                """
                SELECT id, username, email, password_hash, created_at
                FROM users
                WHERE username = :username
                LIMIT 1
                """
            )
            result = db.execute(select_query, {"username": username}).fetchone()
            if result:
                return {
                    "id": str(result.id),
                    "username": result.username,
                    "email": result.email,
                    "password_hash": result.password_hash,
                    "created_at": result.created_at.isoformat(),
                }
            return None

    def save(self, command) -> dict:
        # Este método cumple con una interfaz genérica si se necesitara
        raise NotImplementedError

    def find_user_by_email(self, email: str) -> Optional[dict]:
        with SessionLocal() as db:
            select_query = text(
                """
                SELECT id, username, email, password_hash, created_at
                FROM users
                WHERE email = :email
                LIMIT 1
                """
            )
            result = db.execute(select_query, {"email": email}).fetchone()
            if result:
                return {
                    "id": str(result.id),
                    "username": result.username,
                    "email": result.email,
                    "password_hash": result.password_hash,
                    "created_at": result.created_at.isoformat(),
                }
            return None

    def find_user_by_id(self, user_id: str) -> Optional[dict]:
        with SessionLocal() as db:
            select_query = text(
                """
                SELECT id, username, email, created_at
                FROM users
                WHERE id = :user_id
                LIMIT 1
                """
            )
            result = db.execute(select_query, {"user_id": UUID(user_id)}).fetchone()
            if result:
                return {
                    "id": str(result.id),
                    "username": result.username,
                    "email": result.email,
                    "created_at": result.created_at.isoformat(),
                }
            return None
