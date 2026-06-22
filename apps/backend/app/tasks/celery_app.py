from celery import Celery

from app.config import settings

celery_app = Celery(
    "artek",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Bangui",
    enable_utc=True,
)
