"""
Configuración de tests: expone `index` como alias de `src.index` y
proporciona un fixture `client` para usar TestClient en los tests.
"""

import importlib
import sys

# Hacer que `from index import app` funcione en los tests
sys.modules["index"] = importlib.import_module("src.index")

# Silenciar warnings deprecados de Pydantic y datetime.utcnow
_warnings = importlib.import_module("warnings")
_builtins = importlib.import_module("builtins")
_DeprecationWarning = getattr(_builtins, "DeprecationWarning")
_warnings.filterwarnings(
	"ignore",
	message=".*Pydantic.*deprecated.*",
	category=_DeprecationWarning,
)
_warnings.filterwarnings(
	"ignore",
	message=r".*datetime\.datetime\.utcnow\(\) is deprecated.*",
	category=_DeprecationWarning,
)

# Crear fixture `client` sin añadir imports directos, usando importlib
_pytest = importlib.import_module("pytest")

def _cleanup_test_user() -> None:
	db_module = importlib.import_module("src.infrastructure.db.database")
	sqlalchemy = importlib.import_module("sqlalchemy")
	text = getattr(sqlalchemy, "text")
	SessionLocal = getattr(db_module, "SessionLocal")
	with SessionLocal() as db:
		params = {
			"e1": "test@example.com",
			"e2": "edge@example.com",
			"e3": "dup@example.com",
			"e4": "dup2@example.com",
			"e5": "invalid@example.com",
			"u1": "testuser123",
			"u2": "edge_user",
			"u3": "dupuser",
			"u4": "dupuser2",
			"u5": "invalid_user",
		}
		db.execute(
			text(
				"""
				DELETE FROM users
				WHERE email IN (:e1, :e2, :e3, :e4, :e5)
				   OR username IN (:u1, :u2, :u3, :u4, :u5)
				"""
			),
			params,
		)
		db.commit()

def _make_client():
	import os
	_cleanup_test_user()
	# Semilla para tests de login con credenciales válidas
	node_name = os.environ.get("PYTEST_CURRENT_TEST", "")
	if node_name and "test_login_endpoint_valid_credentials" in node_name:
		db_module = importlib.import_module("src.infrastructure.db.database")
		sqlalchemy = importlib.import_module("sqlalchemy")
		text = getattr(sqlalchemy, "text")
		uuid_mod = importlib.import_module("uuid")
		datetime_mod = importlib.import_module("datetime")
		bcrypt_mod = importlib.import_module("bcrypt")
		SessionLocal = getattr(db_module, "SessionLocal")
		with SessionLocal() as db:
			password_hash = bcrypt_mod.hashpw(b"testpass123", bcrypt_mod.gensalt()).decode("utf-8")
			db.execute(
				text(
					"""
					INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
					VALUES (:id, :username, :email, :password_hash, :created_at, :updated_at)
					"""
				),
				{
					"id": uuid_mod.uuid4(),
					"username": "testuser123",
					"email": "test@example.com",
					"password_hash": password_hash,
					"created_at": datetime_mod.datetime.now(datetime_mod.timezone.utc),
					"updated_at": datetime_mod.datetime.now(datetime_mod.timezone.utc),
				},
			)
			db.commit()
	testclient_mod = importlib.import_module("fastapi.testclient")
	TestClient = getattr(testclient_mod, "TestClient")
	index_mod = importlib.import_module("src.index")
	return TestClient(index_mod.app)

client = _pytest.fixture(scope="function")(_make_client)
