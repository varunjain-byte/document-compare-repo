
# Deploying AI4Doc Portal on Windows

This guide explains how to package and run the "Document Compare / AI4Doc Portal" application on a Windows machine using Docker and WSL 2.

## Prerequisites

1.  **Windows 10/11 Professional or Enterprise**.
2.  **Docker Desktop for Windows**: [Download Here](https://www.docker.com/products/docker-desktop/).
3.  **WSL 2 (Windows Subsystem for Linux)**:
    *   Open PowerShell as Administrator and run: `wsl --install`
    *   Restart your computer if prompted.
    *   Ensure "Use the WSL 2 based engine" is CHECKED in Docker Desktop Settings > General.
    *   Ensure your specific distro (e.g., "Ubuntu") is toggled ON in Docker Desktop Settings > Resources > WSL Integration.

## Step 1: Clone the Repository

**CRITICAL**: You must clone this repository **inside the WSL 2 filesystem**, NOT on the Windows C: drive (`/mnt/c/...`).
Running from the Windows filesystem will result in extreme slowness and potential file permission errors.

1.  Open your WSL terminal (e.g., Ubuntu).
2.  Navigate to your home directory:
    ```bash
    cd ~
    ```
3.  Clone the repository:
    ```bash
    git clone <your-repo-url> docu-compare-zf
    cd docu-compare-zf
    ```

## Step 2: Configure Environment

1.  Create a `.env` file in the root directory. You can copy the example if provided, or use the following defaults:

    ```bash
    # Root .env file
    NEXT_PUBLIC_API_HOSTNAME=http://localhost:8000
    ```

2.  (Optional) If you have specific API keys for backend services (like Cohere, Google Drive), update:
    *   `src/backend/config/secrets.yaml`
    *   `src/backend/config/configuration.yaml`
    
    *Note: The default docker-compose configuration uses local services (Postgres, Mongo, MinIO), so external keys are usually optional for basic local testing.*

## Step 3: Run with Docker Compose

1.  In the root directory (`~/docu-compare-zf`), run:
    ```bash
    docker compose up --build
    ```

2.  Wait for the build to complete. The first time will take several minutes as it downloads base images (Python, Node, Postgres, etc.) and installs dependencies.

3.  Look for "Started" messages for `frontend` and `backend`.

## Step 4: Access the Application

*   **Frontend**: Open your browser (Chrome/Edge on Windows) and go to:
    [http://localhost:4000](http://localhost:4000)
    
*   **Backend API Docs**:
    [http://localhost:8000/docs](http://localhost:8000/docs)

*   **MinIO Console** (Storage Browser):
    [http://localhost:9001](http://localhost:9001)
    *   User: `minioadmin`
    *   Pass: `minioadmin`

## Troubleshooting

### "Start Parsing" button does nothing?
*   Check the backend logs in your terminal. Ensure the `backend` service is running without errors.
*   Ensure the `minio` service is healthy.

### Port Conflicts?
*   If port `5432` (Postgres) or `6379` (Redis) is already in use on your Windows host, you may need to stop your local services or modify `docker-compose.yml` to map to different host ports (e.g., `"5435:5432"`).

### Slow Performance?
*   Verify you are running from `\\wsl$\Ubuntu\home\...` and NOT `C:\Users\...`.
*   Increase RAM allocated to WSL 2 in `.wslconfig` if needed (default is 50% of system RAM).
