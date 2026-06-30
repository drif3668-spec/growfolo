import sys
from pathlib import Path

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Growfolo API"
    app_env: str = "development"
    database_url: str = "sqlite:///./growfolo.db"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    frontend_url: str = "http://localhost:3000"
    resend_api_key: str = ""
    # Accepts MAIL_FROM (primary) or EMAIL_FROM (fallback) env var.
    # Default uses the verified growol.store domain.
    email_from: str = Field(
        default="Growfolo Support <support@growol.store>",
        validation_alias=AliasChoices("MAIL_FROM", "EMAIL_FROM"),
    )
    upload_dir: str = "uploads"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def _validate_production(self) -> "Settings":
        if self.app_env == "production":
            if self.database_url.startswith("sqlite"):
                print(
                    "\n[FATAL] SQLite is not allowed in production.\n"
                    "Set DATABASE_URL to a PostgreSQL connection string in your environment.\n"
                    "Example: postgresql://user:pass@host/dbname?sslmode=require\n",
                    file=sys.stderr,
                )
                sys.exit(1)
            if self.jwt_secret == "change-me-in-production":
                print(
                    "\n[FATAL] JWT_SECRET is set to the default insecure value.\n"
                    "Generate a strong secret: openssl rand -hex 32\n",
                    file=sys.stderr,
                )
                sys.exit(1)
        return self

    @property
    def is_postgres(self) -> bool:
        return self.database_url.startswith(("postgresql", "postgres"))

    @property
    def upload_path(self) -> Path:
        path = Path(self.upload_dir)
        try:
            path.mkdir(parents=True, exist_ok=True)
        except (PermissionError, OSError):
            # Serverless / read-only filesystem — fall back to /tmp
            path = Path("/tmp/uploads")
            path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
