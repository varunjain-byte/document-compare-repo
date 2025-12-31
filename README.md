# Document Comparison Toolkit

A powerful, AI-accelerated toolkit for analyzing, validating, and comparing complex documents (PDFs). Built on top of the Cohere Toolkit, this application provides specialized workflows for financial and legal document analysis.

## Features

### 1. Delta Compare (Version Tracking)
Track changes effectively across different versions of the *same* document.
-   **Visual Diffing**: See side-by-side comparisons of text changes.
-   **Table analysis**: Detect changes in numerical data within tables.
-   **Image/Figure detection**: Identify modifications to charts and images.

### 2. Similarity Matcher (Cross-Document Analysis)
Find similarities and relationships between *different* documents.
-   **Structural Similarity**: Compare the layout and hierarchy of documents.
-   **Content Overlap**: Identify shared terminology and significantly similar paragraphs.
-   **Job History**: Track past comparison jobs and export results.

### 3. Document Validator
Ensure documents meet specific compliance or structural standards before processing.
-   **Automated Checks**: Verify required sections, headers, and formatting.
-   **Exception Flagging**: Quickly identify and resolve parsing errors.

### 4. Build Pipeline (Parse PDFs)
-   **OCR & Extraction**: robust text and table extraction from PDFs.
-   **Zoning**: Intelligent segmentation of document areas.

## 🚀 Easiest Setup (Quick Start)

Follow these steps to get running on a new machine.

### Prerequisites
-   **Git**
-   **Docker Desktop** (Make sure it is running)

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/varunjain-byte/document-compare-repo.git
    cd document-compare-repo
    ```

2.  **Run the First-Run Setup**
    This single command installs dependencies, sets up the environment, migrates the database, and starts the servers.

    **On Mac/Linux:**
    ```bash
    make first-run
    ```

    **On Windows:**
    Use **Git Bash** or **PowerShell** and run:
    ```bash
    make first-run
    ```
    > [!TIP]
    > If `make` is not available on Windows, you can install it via [Chocolatey](https://chocolatey.org/) (`choco install make`) or use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install).

3.  **Configure API Keys**
    -   During setup, you may be prompted for keys.
    -   Ensure your `.env` file has a valid `COHERE_API_KEY`.

4.  **Access the App**
    -   Frontend: [http://localhost:4000](http://localhost:4000)
    -   Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

-   `src/interfaces/coral_web`: Next.js Frontend application.
-   `src/backend`: Python FastAPI backend.
-   `src/community`: Community tools and integrations.

## ☁️ Deployment

You can deploy this application to Render with a single click.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1.  Click the button above.
2.  Provide your **Cohere API Key** when prompted.
3.  Render will automatically build and deploy the Database, Backend, and Frontend.


## Development Commands

-   `make up`: Start all services (backend, frontend, db, redis).
-   `make down`: Stop all services.
-   `make logs`: View server logs.
-   `make migration message="description"`: Create a new database migration.
-   `make migrate`: Apply database migrations.
