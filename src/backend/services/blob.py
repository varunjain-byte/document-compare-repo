import boto3
from botocore.exceptions import ClientError
from backend.config.settings import Settings
from fastapi import UploadFile
import io

class BlobService:
    _instance = None

    def __init__(self):
        settings = Settings()
        # Default to environment variables or Settings defaults
        import os
        self.endpoint_url = os.environ.get("BLOB_ENDPOINT_URL") or getattr(settings, 'blob_endpoint_url', 'http://minio:9000')
        self.access_key = os.environ.get("BLOB_ACCESS_KEY") or getattr(settings, 'blob_access_key', 'minioadmin')
        self.secret_key = os.environ.get("BLOB_SECRET_KEY") or getattr(settings, 'blob_secret_key', 'minioadmin')
        self.bucket_name = os.environ.get("BLOB_BUCKET_NAME") or getattr(settings, 'blob_bucket_name', 'docu-compare-assets')

        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name='us-east-1' # MinIO ignores this but boto3 requires it
        )
        
        self.ensure_bucket_exists()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = BlobService()
        return cls._instance

    def ensure_bucket_exists(self):
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            # Bucket likely does not exist, try to create it
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            except ClientError as e:
                print(f"Failed to create bucket {self.bucket_name}: {e}")

    async def upload_file(self, file: UploadFile, object_name: str = None) -> str:
        """
        Uploads a FastAPI UploadFile to Blob Storage.
        Returns the object key.
        """
        if object_name is None:
            object_name = file.filename

        file_content = await file.read()
        
        # Reset file cursor for further processing if needed, though we consumed it here
        # await file.seek(0) 

        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=object_name,
            Body=file_content,
            ContentType=file.content_type
        )
        return object_name

    def get_file_url(self, object_name: str) -> str:
        """
        Generate a presigned URL for the file (optional, or just return path)
        """
        try:
            response = self.s3_client.generate_presigned_url('get_object',
                                                            Params={'Bucket': self.bucket_name,
                                                                    'Key': object_name},
                                                            ExpiresIn=3600)
            return response
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return ""
            
    def get_file_stream(self, object_name: str):
        """
        Get a file stream from blob storage
        """
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=object_name)
            return response['Body']
        except ClientError as e:
            print(f"Error getting file stream: {e}")
            return None

def get_blob_service():
    return BlobService.get_instance()
