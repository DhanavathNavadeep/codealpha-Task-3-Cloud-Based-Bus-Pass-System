import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def save_uploaded_file(file_obj):
    """
    Saves file to local uploads directory or AWS S3 based on configuration.
    """
    if not file_obj or file_obj.filename == '':
        return None

    filename = secure_filename(file_obj.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    
    use_s3 = current_app.config.get('USE_S3', False)

    if use_s3:
        # Mock S3 upload logic or boto3 call if credentials present
        s3_bucket = current_app.config.get('AWS_S3_BUCKET')
        region = current_app.config.get('AWS_REGION', 'us-east-1')
        return f"https://{s3_bucket}.s3.{region}.amazonaws.com/documents/{unique_filename}"
    else:
        # Save to local upload folder
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, unique_filename)
        file_obj.save(file_path)
        return f"/uploads/{unique_filename}"
