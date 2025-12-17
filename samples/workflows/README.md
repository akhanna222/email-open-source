# Sample Workflows

This directory contains pre-built workflow examples demonstrating common use cases for the Workflow Agent Studio.

## Available Samples

### 1. OCR Document Processing from WhatsApp
**File:** `ocr-document-processing.json`
**Complexity:** Intermediate
**Use Case:** Document OCR and Analysis

**Flow:**
```
WhatsApp Document Trigger
    ↓
Extract Attachment (Transform/JS)
    ↓
OCR Processing (HTTP Request to OCR API)
    ↓
Analyze Document (OpenAI Chat)
    ↓  ↓
    ↓  Generate Summary (Prompt Template)
    ↓      ↓
    ↓      Send WhatsApp Reply
    ↓
Generate Embedding (OpenAI)
    ↓
Store in Vector DB (PostgreSQL pgvector)
```

**Key Features:**
- Receives documents via WhatsApp
- Extracts text using OCR
- LLM analysis and categorization
- Vector embedding for semantic search
- Auto-reply with summary
- Stores in PostgreSQL with pgvector

**Input/Output Flow:**
- Trigger: [] → [message]
- Extract: [message] → [document]
- OCR: [document] → [extracted_text]
- Analyze: [extracted_text, context] → [analysis, tokens_used]
- Embedding: [extracted_text] → [embedding]
- Vector Store: [extracted_text, embedding, metadata] → [vector_id, success]

---

### 2. Intelligent Email Scanning & Classification
**File:** `email-scanning-llm.json`
**Complexity:** Advanced
**Use Case:** Email Automation

**Flow:**
```
Gmail Inbox Trigger
    ↓
Extract Email Data (Set Fields)
    ↓
LLM Classification (Claude) - categorize: urgent/spam/inquiry/order
    ↓
Is Urgent? (Conditional)
    ↓           ↓
  TRUE        FALSE
    ↓           ↓
Alert Team   Check Keywords (Switch)
(Telegram)      ↓
    ↓           ↓
    └───→ Store in Database (PostgreSQL)
                ↓
            Vector Store + Auto-Reply (OpenAI)
                ↓
            Send Gmail Reply
```

**Key Features:**
- Multi-channel email processing
- AI-powered classification (Claude)
- Urgent/normal routing with conditional logic
- Keyword-based switching
- Automatic reply generation
- Vector storage for future semantic search
- Team alerts via Telegram

**Input/Output Flow:**
- Trigger: [] → [message]
- Extract: [message] → [email_data]
- Classify: [email_data, context] → [classification, confidence]
- Condition: [classification] → [true, false]
- Store: [email_data, classification] → [inserted_id, success]
- Auto-Reply: [email_data, classification] → [reply_text]

---

### 3. AI-Powered Customer Support Pipeline
**File:** `customer-support-ai.json`
**Complexity:** Advanced
**Use Case:** Customer Support Automation

**Flow:**
```
WhatsApp Query ──┐
                 ├──→ Merge Channels
Email Query ────┘        ↓
                    Generate Embedding (OpenAI)
                         ↓
                    Search Knowledge Base (pgvector)
                         ↓
                    Build Context Prompt
                         ↓
                    AI Agent Response (Claude)
                         ↓
                    Confidence Check (Conditional)
                         ↓           ↓
                       HIGH         LOW
                         ↓           ↓
                    Auto-Reply   Human Approval
                         ↓           ↓
                    Update KB    Send Human Response
                         ↓           ↓
                         └───→ Log Interaction
```

**Key Features:**
- Multi-channel support (WhatsApp + Email)
- Channel merging for unified processing
- Vector search of knowledge base
- Context-aware AI responses
- Confidence-based routing
- Human-in-the-loop for low confidence
- Automatic knowledge base updates
- Full interaction logging

**Input/Output Flow:**
- Triggers: [] → [message] (both channels)
- Merge: [message, message] → [unified_query]
- Embedding: [unified_query] → [embedding]
- Vector Search: [embedding, limit] → [results, scores]
- AI Response: [prompt, context] → [response, confidence]
- Condition: [confidence] → [true, false]
- Store: [unified_query, response, embedding] → [vector_id, success]

---

## How to Use

### In the UI:
1. Click "Load Sample" button in the header
2. Browse available sample workflows
3. Click "Load" on any sample to load it into the canvas
4. Modify nodes and connections as needed
5. Click "Save" to persist your changes

### Via API:
```bash
# List all samples
curl http://localhost:18000/workflows/samples/list

# Load specific sample
curl http://localhost:18000/workflows/samples/sample-ocr-workflow
```

## Common Patterns

### Data Flow Best Practices:
1. **Triggers** produce initial data (message, payload)
2. **Transformers** reshape data (extract fields, format)
3. **AI Nodes** analyze and generate (embeddings, responses)
4. **Conditions** route based on logic (urgent/normal, confidence)
5. **Actions** perform operations (send message, store data)
6. **Database Nodes** persist and query (PostgreSQL, Redis, pgvector)

### Input/Output Matching:
- Ensure output types match expected input types
- Use transform nodes to reshape data when needed
- Check node descriptions for required inputs/outputs

## Creating Your Own Samples

To create a new sample workflow:

1. Build your workflow in the UI
2. Save it
3. Export the JSON structure
4. Add to this directory with metadata:
   ```json
   {
     "id": "your-workflow-id",
     "name": "Your Workflow Name",
     "description": "Detailed description",
     "nodes": [...],
     "edges": [...],
     "metadata": {
       "tags": ["tag1", "tag2"],
       "use_case": "Your Use Case",
       "complexity": "basic|intermediate|advanced"
     }
   }
   ```

## Tags Reference

- **ocr** - Optical character recognition
- **email** - Email processing
- **whatsapp** - WhatsApp integration
- **llm-classification** - AI-powered classification
- **vector-db** - Vector database / semantic search
- **auto-reply** - Automatic response generation
- **multi-channel** - Multiple input channels
- **human-in-loop** - Human approval step
- **customer-support** - Customer support automation
- **document-processing** - Document handling
