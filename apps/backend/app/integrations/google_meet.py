import json
import uuid
from datetime import datetime, timedelta

from app.config import settings


class GoogleMeetError(Exception):
    pass


class GoogleMeetClient:
    @property
    def is_configured(self) -> bool:
        raw = settings.GOOGLE_SERVICE_ACCOUNT_JSON.strip()
        return bool(raw and raw != "{}")

    def create_meeting(self, title: str, consultation_id: str) -> str:
        if self.is_configured:
            return self._create_via_calendar_api(title, consultation_id)

        if settings.GOOGLE_MEET_DEV_URL:
            url = settings.GOOGLE_MEET_DEV_URL.strip().rstrip("/")
            if url.endswith("/new"):
                raise GoogleMeetError(
                    "GOOGLE_MEET_DEV_URL invalide : meet.google.com/new ne permet pas "
                    "de rejoindre une réunion. Créez une réunion sur meet.google.com "
                    "et copiez le lien complet (ex. https://meet.google.com/abc-defg-hij)."
                )
            return settings.GOOGLE_MEET_DEV_URL

        raise GoogleMeetError(
            "Configurez GOOGLE_MEET_DEV_URL dans le fichier .env à la racine du projet "
            "(ex. https://meet.google.com/abc-defg-hij), puis redémarrez le backend."
        )

    def _create_via_calendar_api(self, title: str, consultation_id: str) -> str:
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
        except ImportError as exc:
            raise GoogleMeetError(
                "Dépendances Google manquantes : pip install google-api-python-client google-auth"
            ) from exc

        info = json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)
        creds = service_account.Credentials.from_service_account_info(
            info,
            scopes=["https://www.googleapis.com/auth/calendar"],
        )
        if settings.GOOGLE_CALENDAR_IMPERSONATE:
            creds = creds.with_subject(settings.GOOGLE_CALENDAR_IMPERSONATE)

        service = build("calendar", "v3", credentials=creds, cache_discovery=False)
        start = datetime.utcnow()
        end = start + timedelta(hours=2)
        calendar_id = settings.GOOGLE_CALENDAR_ID or "primary"

        event = {
            "summary": title,
            "description": f"ARTEK Connect Santé — consultation {consultation_id}",
            "start": {"dateTime": start.strftime("%Y-%m-%dT%H:%M:%SZ"), "timeZone": "UTC"},
            "end": {"dateTime": end.strftime("%Y-%m-%dT%H:%M:%SZ"), "timeZone": "UTC"},
            "conferenceData": {
                "createRequest": {
                    "requestId": str(uuid.uuid4()),
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            },
        }

        created = (
            service.events()
            .insert(calendarId=calendar_id, body=event, conferenceDataVersion=1)
            .execute()
        )

        for entry in created.get("conferenceData", {}).get("entryPoints", []):
            if entry.get("entryPointType") == "video":
                return entry.get("uri", "")

        hangout = created.get("hangoutLink")
        if hangout:
            return hangout

        raise GoogleMeetError("Lien Google Meet introuvable dans la réponse Calendar API")


google_meet_client = GoogleMeetClient()
