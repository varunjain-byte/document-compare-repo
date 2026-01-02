from typing import Any, Dict, Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from backend.config.settings import Settings

class MongoService:
    _instance = None
    
    def __init__(self):
        settings = Settings()
        # Handle case where MONGO_URL might not be in Settings class yet if it's dynamic
        mongo_url = getattr(settings.database, 'mongo_url', 'mongodb://mongo:27017')
        # Allow env var override just in case, though usually Settings should handle it
        import os
        if "MONGO_URL" in os.environ:
             mongo_url = os.environ["MONGO_URL"]
             
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client.docu_compare
        self.files_collection = self.db.files

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MongoService()
        return cls._instance

    async def create_file_metadata(self, file_data: Dict[str, Any]) -> str:
        """
        Create a new file metadata entry.
        """
        result = await self.files_collection.insert_one(file_data)
        return str(result.inserted_id)

    async def get_file_metadata(self, file_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve file metadata by ID.
        """
        # Assuming file_id is stored as _id string or we need ObjectId conversion
        # For simplicity in this migration let's assume we store IDs as strings provided by us or UUIDs
        # If using Mongo ObjectId: from bson import ObjectId; ObjectId(file_id)
        return await self.files_collection.find_one({"_id": file_id})

    async def update_file_status(self, file_id: str, status: str) -> bool:
        """
        Update the status of a file.
        """
        result = await self.files_collection.update_one(
            {"_id": file_id},
            {"$set": {"status": status}}
        )
        return result.modified_count > 0

    async def list_files(self, user_id: str) -> List[Dict[str, Any]]:
        """
        List all files for a user.
        """
        cursor = self.files_collection.find({"user_id": user_id})
        return await cursor.to_list(length=100)

    async def get_files_by_conversation_id(self, conversation_id: str) -> List[Dict[str, Any]]:
        """
        List all files for a conversation.
        """
        cursor = self.files_collection.find({"conversation_id": conversation_id})
        return await cursor.to_list(length=100)
        
    async def delete_file(self, file_id: str) -> bool:
        """
        Delete a file by ID.
        """
        result = await self.files_collection.delete_one({"_id": file_id})
        return result.deleted_count > 0

def get_mongo_service():
    return MongoService.get_instance()
