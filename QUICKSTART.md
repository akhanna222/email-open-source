# 🚀 Quick Start Guide

## Starting the Application

### Option 1: Using the Startup Script (Recommended)

```bash
# Start backend (from project root)
./start-backend.sh

# In a new terminal, start frontend
cd apps/web
npm run dev
```

### Option 2: Manual Start

**Backend:**
```bash
# Install dependencies (first time only)
pip install -r requirements-dev.txt

# Start API server
cd apps/api
uvicorn main:app --reload --host 0.0.0.0 --port 18000
```

**Frontend:**
```bash
cd apps/web
npm install  # First time only
npm run dev
```

## Access the Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:18000
- **API Docs**: http://localhost:18000/docs

## Testing Execution

### 1. Test Simple Workflow (No API Keys)

1. Open http://localhost:3000
2. Click **"Samples"** button
3. Load: **"Simple Test Workflow (No API Keys Required)"**
4. Click **"Execute"** button
5. ✅ Should succeed with green success modal

### 2. Test Error Messages

1. Load: **"Test Missing Parameters (Will Show Clear Errors)"**
2. Click **"Execute"**
3. ❌ Should show clear error: "Missing required parameter: 'url'"

### 3. Test Real API Calls

Create a workflow with:
- **Manual Trigger** → **HTTP Request**
- Configure HTTP Request:
  - URL: `https://api.github.com/users/github`
  - Method: `GET`
- Click **"Execute"**
- ✅ Should fetch real data from GitHub API

## Troubleshooting

### "Failed to fetch" Error

**Problem**: Frontend can't connect to backend

**Solutions**:
1. ✅ Check backend is running: http://localhost:18000/health
2. ✅ Restart backend: `./start-backend.sh`
3. ✅ Check console for errors: Browser DevTools → Console tab
4. ✅ Verify ports: Backend on 18000, Frontend on 3000

### "Missing API Key" Errors

**Problem**: LLM or Gmail nodes need credentials

**Solutions**:
1. Get OpenAI API key: https://platform.openai.com/api-keys
2. Get Anthropic API key: https://console.anthropic.com/settings/keys
3. Configure in node Parameters tab
4. For Gmail: Use App Password (not regular password)
   - Create at: https://myaccount.google.com/apppasswords

### Node.js Not Found (Transform JS)

**Problem**: JavaScript execution needs Node.js

**Solution**:
```bash
# Install Node.js
# macOS: brew install node
# Ubuntu: sudo apt install nodejs
# Windows: Download from nodejs.org
```

## Dependencies Required

### Backend (Python)
- `httpx` - HTTP requests ✅ (pre-installed)
- `openai` - OpenAI API (optional)
- `anthropic` - Anthropic API (optional)
- `aiosmtplib` - Email sending (optional)

### System
- Python 3.8+ ✅
- Node.js 16+ (for Transform JS nodes only)
- npm 8+ ✅

## Next Steps

1. ✅ Try the simple test workflow
2. ✅ Create your own workflow
3. ✅ Add API keys for LLM nodes
4. 📖 Read the full documentation in `/docs`
5. 🎨 Customize node schemas in `/packages/shared/schemas/nodes`

## Getting Help

- **Issues**: https://github.com/anthropics/claude-code/issues
- **API Docs**: http://localhost:18000/docs (when running)
- **Check logs**: Backend terminal for execution details
