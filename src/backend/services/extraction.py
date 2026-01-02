import aiohttp
import os
from backend.services.mongo import get_mongo_service
from backend.config.settings import Settings

class ExternalExtractionService:
    _instance = None

    def __init__(self):
        settings = Settings()
        # Retrieve OpenShift service URL from env or settings
        # We need this URL from the user, defaulting to placeholder for now
        self.extraction_service_url = os.environ.get("EXTRACTION_SERVICE_URL") or "http://openshift-service-placeholder/api/extract"
        self.callback_url = os.environ.get("EXTRACTION_CALLBACK_URL") or "http://backend:8000/api/extraction/callback"

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ExternalExtractionService()
        return cls._instance

    async def trigger_extraction(self, file_id: str, blob_path: str):
        """
        Call the external service to start extraction.
        """
        mongo_service = get_mongo_service()
        
        payload = {
            "file_id": file_id,
            "blob_path": blob_path,
            "callback_url": self.callback_url
        }
        if "placeholder" in self.extraction_service_url:
            print(f"Mocking extraction trigger for {file_id}")
            # Mock success
            await mongo_service.update_file_status(file_id, "PROCESSING")
            return True

        try:
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(self.extraction_service_url, json=payload) as response:
                    if response.status == 200 or response.status == 202:
                        await mongo_service.update_file_status(file_id, "PROCESSING")
                        return True
                    else:
                        error_text = await response.text()
                        print(f"Extraction trigger failed: {response.status} - {error_text}")
                        await mongo_service.update_file_status(file_id, "FAILED_TRIGGER")
                        return False
        except Exception as e:
            print(f"Exception triggering extraction: {e}")
            await mongo_service.update_file_status(file_id, "FAILED_TRIGGER")
            return False

def get_extraction_service():
    return ExternalExtractionService.get_instance()
