# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# SignalDesk
## AI-Powered Support Ticket Intelligence

**Project Type:** Full-Stack Machine Learning & NLP SaaS Application  
**Version:** 2.0 (Architecture Migration: React + FastAPI + Neon PostgreSQL)  
**Development Priority:** Production-Grade MVP  
**Deployment Targets:** Vercel (Frontend), Render (FastAPI Backend), Neon (PostgreSQL Database)  
**Primary Purpose:** High-performance, intelligent customer support ticket categorization, triage, and operational analytics powered by genuine Scikit-learn NLP models.

---

# 1. Product Vision

SignalDesk is an intelligent customer support ticket analysis platform that uses Natural Language Processing (NLP) and Machine Learning to automatically understand, classify, and analyze customer support requests.

The platform helps support teams eliminate manual ticket categorization, identify ticket patterns, and understand customer support workload through an interactive analytics dashboard.

The system uses a genuinely trained machine learning model (Logistic Regression & Naive Bayes) rather than relying on external LLM APIs for its core classification functionality.

# 2. Project Objectives

The primary objectives are:

1. Maintain and deploy an NLP-based text classification model with Scikit-learn.
2. Build an asynchronous, modular FastAPI REST API backend.
3. Move persistent ticket history and analytics storage to PostgreSQL (Neon).
4. Build a high-performance React (Vite + TypeScript + Tailwind CSS) frontend.
5. Replicate the visual design hierarchy: warm off-white canvas, botanical green accents (#0E5E44), and Lucide vector iconography.
6. Provide real-time ticket classification and transparent rule-based priority assessments.
7. Support custom dataset upload with column mapping and model retraining.
8. Prepare deployment configurations for Vercel, Render, and Neon.

# 3. Target Users

### 3.1 Support Team Members
- Submit and analyze customer support tickets in real-time.
- View predicted categories and transparent priority explanations.
- Review historical triage results.

### 3.2 Support Managers
- Monitor category and priority distributions via live interactive charts.
- Identify complaint patterns and workload bottlenecks.
- Track incoming ticket velocity and operational urgency.

### 3.3 Project Administrator & ML Engineers
- Inspect actual held-out test evaluation metrics (Accuracy, Macro-F1, Confusion Matrix).
- Monitor dataset statistics across 11,920+ authentic inquiries.
- Upload custom datasets and retrain classification models.

# 4. Technology Stack (V2 Architecture)

| Component | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Fast, responsive Single Page Application (SPA) |
| **Language (Frontend)** | TypeScript | Strict type safety and clear API contracts |
| **Styling** | Tailwind CSS | Utility-first CSS with custom botanical green tokens |
| **UI Components & Icons**| Lucide React | Uniform 1.75px stroke-width SVG icons |
| **Charts** | Recharts | Animated, interactive category donut & priority bar charts |
| **Animations** | Framer Motion | Smooth layout transitions and feedback states |
| **Backend Framework** | FastAPI (Python 3.11+) | Async high-concurrency RESTful API |
| **Data Validation** | Pydantic v2 | Robust request/response schema validation |
| **Database ORM** | SQLAlchemy 2.0 | Parameterized, production-grade database access |
| **Database** | PostgreSQL / Neon | Serverless PostgreSQL with pooling and instant branching |
| **Machine Learning** | Scikit-learn | Logistic Regression & Multinomial Naive Bayes |
| **NLP & Preprocessing**| NLTK, TF-IDF | Tokenization, lemmatization, negation-preserving stopwords |
| **Model Persistence** | Joblib | Pre-fitted vectorizer and classifier artifacts |
| **Deployment** | Vercel (UI), Render (API) | Cloud hosting with automated CI/CD and health checks |
| **Version Control** | Git & GitHub | Remote repo: Aswinsaipalakonda/SignalDesk |

---

# 5. Core Functional Modules

## Module 1: Dataset Management

The system must support loading and processing customer support ticket datasets.

### Requirements
- Load CSV datasets.
- Display dataset information.
- Identify missing values.
- Remove duplicate records.
- Identify invalid or empty ticket messages.
- Handle missing category labels.
- Display category distribution.
- Generate a cleaned dataset.

### Expected Dataset Structure

The preferred input schema:

| Column | Description |
|---|---|
| ticket_id | Unique ticket identifier |
| ticket_text | Customer complaint or message |
| category | Target classification label |
| priority | Optional priority label |
| created_at | Optional ticket creation date |

The application must support datasets with different column names through a configurable column-mapping interface.

If priority labels are absent, the model must not invent them.

### Dataset fallback

Use a publicly available customer support ticket dataset with suitable text and category labels.

If a suitable downloadable dataset is unavailable, create a clearly documented synthetic dataset for development and demonstration. Never represent synthetic data as real customer data.

## Module 2: Data Preprocessing

Implement a reusable preprocessing pipeline.

### Text preprocessing steps

1. Convert text to lowercase.
2. Remove unnecessary whitespace.
3. Remove HTML tags if present.
4. Remove URLs.
5. Remove unnecessary special characters while preserving meaningful text.
6. Tokenize text.
7. Remove stopwords where appropriate.
8. Apply lemmatization where appropriate.

Important: Preserve negation words such as "not", "never" and "no", because they can change the meaning of a customer complaint.

### Data preprocessing operations

- Handle missing values.
- Remove duplicate tickets.
- Handle inconsistent category labels.
- Check class distribution.
- Split data into training and testing sets.

Use a stratified train-test split where the dataset permits it.

Avoid data leakage: fit the TF-IDF vectorizer only on the training data.

## Module 3: NLP Feature Engineering

Implement TF-IDF vectorization.

### TF-IDF

Term Frequency-Inverse Document Frequency converts textual information into numerical features that machine learning algorithms can process.

Requirements:
- Use Scikit-learn TfidfVectorizer.
- Support unigrams and bigrams.
- Configure maximum vocabulary size.
- Configure minimum document frequency.
- Save the fitted vectorizer.
- Reuse the same vectorizer for incoming tickets.

The vectorizer must never be refitted on individual incoming tickets.

## Module 4: Machine Learning Model Training

Train and compare at least two classification algorithms.

### Model A: Multinomial Naive Bayes
Purpose:
- Establish a baseline text classification model.
- Provide a fast and simple classification approach.

### Model B: Logistic Regression
Purpose:
- Provide an alternative classification model.
- Compare classification performance.
- Support probability-based prediction outputs.

### Training workflow

1. Load cleaned dataset.
2. Separate input text and target labels.
3. Split into training and testing sets.
4. Fit TF-IDF on training text.
5. Transform training and testing text.
6. Train both algorithms.
7. Generate predictions.
8. Evaluate model performance.
9. Compare evaluation metrics.
10. Save the selected model and vectorizer.

Select the final model based on evaluation results, not assumptions.

### Model evaluation metrics

Display:
- Accuracy
- Precision
- Recall
- F1-score
- Confusion matrix
- Classification report

Use macro-F1 alongside accuracy to understand performance across different categories.

If the dataset is imbalanced, discuss the limitations of accuracy.

## Module 5: Ticket Classification Engine

This is the main application functionality.

### User workflow

1. User enters a customer support message.
2. System validates the input.
3. Text preprocessing is performed.
4. Saved TF-IDF vectorizer transforms the message.
5. Trained classifier predicts the ticket category.
6. Model probability is displayed where supported.
7. Priority assessment is performed.
8. Results are displayed to the user.

### Supported ticket categories

Use the actual category labels available in the selected dataset.

The preferred categories, where supported, are:

- Billing & Payment
- Technical Support
- Account & Login
- Order & Delivery
- Product Issues
- General Inquiry

Do not fabricate predictions for classes the model was not trained on.

### Prediction output

Display:

- Original ticket message.
- Predicted category.
- Classification confidence.
- Priority assessment.
- Processing status.

The confidence value must come from the trained model's probability output. Clearly identify it as model confidence, not a guarantee of correctness.

If the model does not support probability prediction, do not display a fabricated percentage.

## Module 6: Priority Assessment

Implement an independent, transparent rule-based priority engine for the MVP.

This module is separate from the supervised category classifier.

### Priority levels

**High**
- Payment deducted but order not confirmed.
- Account locked or inaccessible.
- Critical service outage.
- Explicit urgent requests.

**Medium**
- Delayed delivery.
- Product malfunction.
- Repeated service problems.
- Issues preventing normal usage.

**Low**
- General questions.
- Product information requests.
- Feature suggestions.
- Non-urgent inquiries.

### Implementation requirements

- Create a configurable keyword/rule mapping.
- Consider urgency indicators and issue context.
- Return priority and matched reason.
- Display the reason behind the priority assessment.
- Allow manual priority correction in the interface.

Do not claim that priority assessment is an ML prediction unless a separate labelled priority model is trained and evaluated.

## Module 7: Analytics Dashboard

Create an interactive analytics dashboard.

### Dashboard KPI cards

- Total Tickets
- Billing Tickets
- Technical Tickets
- High Priority Tickets
- Model Accuracy

Calculate values from the actual dataset and evaluation results.

### Visualizations

1. Ticket distribution by category.
2. Ticket distribution by priority.
3. Ticket volume over time, when dates are available.
4. Category-wise ticket comparison.
5. Model performance comparison.
6. Confusion matrix.

Use Plotly for interactive charts where suitable.

### Filters

- Category.
- Priority.
- Date range, when date data exists.

Ensure dashboard metrics update when filters are applied.

## Module 8: Ticket History

Implement a lightweight local ticket history.

Requirements:
- Store submitted ticket text.
- Store predicted category.
- Store priority.
- Store prediction confidence where available.
- Store submission timestamp.
- Display historical tickets.
- Allow category and priority filtering.

Use SQLite for persistent local storage.

This is an MVP history store, not a production ticket-management backend.

# 6. Application Pages and Navigation

Create the following pages using Streamlit multi-page navigation.

## Page 1: Overview Dashboard

Purpose: Provide an overview of the support ticket system.

Components:
- Application name and introduction.
- KPI cards.
- Ticket category chart.
- Priority distribution chart.
- Recent ticket activity.
- Model status.

## Page 2: Analyze Ticket

Purpose: Classify incoming support messages.

Components:
- Customer ticket text area.
- Analyze button.
- Predicted category.
- Confidence indicator.
- Priority indicator.
- Priority explanation.
- Processing result.

Provide an example ticket button to demonstrate the system.

## Page 3: Ticket Explorer

Purpose: Browse historical tickets.

Components:
- Ticket table.
- Category filter.
- Priority filter.
- Search by ticket text.
- Ticket detail view.

## Page 4: Model Performance

Purpose: Demonstrate actual machine learning experimentation.

Components:
- Dataset information.
- Training and testing sample counts.
- Algorithm comparison.
- Accuracy.
- Precision.
- Recall.
- F1-score.
- Confusion matrix.
- Classification report.

Include a short explanation of why the final model was selected.

## Page 5: About

Purpose: Explain the project and technical implementation.

Include:
- Problem statement.
- Solution overview.
- Technology stack.
- ML workflow.
- Model information.
- Project limitations.

# 7. User Interface and Design Requirements

Create a polished, modern SaaS-style analytics interface.

### Design direction

- Minimalist professional dashboard.
- Light theme.
- White and subtle grey backgrounds.
- Teal or deep blue accent color.
- Clean typography.
- Rounded cards.
- Subtle borders and shadows.
- Consistent spacing.
- Responsive layout.

Avoid:
- Neon colors.
- Excessive gradients.
- Unnecessary animations.
- Overcrowded dashboard layouts.
- Decorative elements that do not improve usability.

### Layout

Sidebar:
- SignalDesk logo/name.
- Overview.
- Analyze Ticket.
- Ticket Explorer.
- Model Performance.
- About.

Main content:
- Page heading.
- Relevant controls.
- KPI cards.
- Charts and tables.
- Contextual information.

The application should look like a professional data analytics product rather than a basic Streamlit tutorial.

# 8. System Architecture

Implement the following architecture:

Customer Support Message
        |
        v
Streamlit User Interface
        |
        v
Input Validation
        |
        v
Text Preprocessing
        |
        v
Saved TF-IDF Vectorizer
        |
        v
Trained ML Classifier
        |
        v
Category Prediction
        |
        +----------------------+
        |                      |
        v                      v
Priority Rule Engine     Confidence Output
        |                      |
        +-----------+----------+
                    |
                    v
             Result Display
                    |
                    v
              SQLite History
                    |
                    v
             Analytics Dashboard

Separate the training pipeline from the inference pipeline.

The deployed application must load saved model artifacts and must not retrain the model every time the Streamlit application starts.

# 9. Recommended Project Structure

Create a clean and modular structure:

signaldesk/
│
├── app.py
│
├── pages/
│   ├── 1_Dashboard.py
│   ├── 2_Analyze_Ticket.py
│   ├── 3_Ticket_Explorer.py
│   ├── 4_Model_Performance.py
│   └── 5_About.py
│
├── src/
│   ├── data_loader.py
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── train_model.py
│   ├── predict.py
│   ├── priority_engine.py
│   ├── evaluation.py
│   └── database.py
│
├── models/
│   ├── ticket_classifier.joblib
│   ├── tfidf_vectorizer.joblib
│   └── model_metadata.json
│
├── data/
│   ├── raw/
│   └── processed/
│
├── notebooks/
│   └── exploratory_analysis.ipynb
│
├── tests/
│   ├── test_preprocessing.py
│   ├── test_prediction.py
│   └── test_priority.py
│
├── assets/
│   └── logo.png
│
├── requirements.txt
├── README.md
├── .gitignore
└── LICENSE

Keep generated datasets, model artifacts and user-specific database files out of Git where appropriate. Provide a small reproducible dataset or download instructions so another person can run the project.

# 10. Model Metadata

Generate a model_metadata.json file containing:

- Model name.
- Algorithm.
- Dataset name and source.
- Training date.
- Number of training samples.
- Number of testing samples.
- Number of categories.
- Accuracy.
- Precision.
- Recall.
- F1-score.
- Vectorizer configuration.
- Model version.

All metrics must be generated by the actual training pipeline.

# 11. Error Handling

The application must handle:

- Empty ticket input.
- Extremely short messages.
- Invalid dataset format.
- Missing required columns.
- Missing model artifacts.
- Unsupported or unknown category labels.
- Corrupted model files.
- Database errors.
- Insufficient training data.
- Missing optional priority labels.

Display understandable error messages instead of Python tracebacks in the user interface.

# 12. Testing Requirements

Test the following:

1. Dataset loading.
2. Missing-value handling.
3. Text preprocessing.
4. TF-IDF transformation.
5. Model training.
6. Model serialization.
7. Model loading.
8. Ticket classification.
9. Priority assessment.
10. Ticket history storage.
11. Dashboard metric calculations.

Verify that a newly submitted ticket produces a valid category prediction and is stored in ticket history.

# 13. Non-Functional Requirements

### Performance
- Load saved model artifacts efficiently.
- Avoid unnecessary model retraining.
- Keep prediction response time suitable for interactive use.

### Maintainability
- Use modular Python code.
- Keep preprocessing and prediction logic separate.
- Use reusable functions.
- Add meaningful comments and docstrings.

### Reliability
- Validate model artifacts before inference.
- Handle missing and malformed inputs.
- Prevent data leakage during training.

### Reproducibility
- Set random seeds where applicable.
- Document dataset source.
- Document model training procedure.
- Provide dependency versions.

# 14. Out of Scope

Do not implement these features in the initial MVP:

- Real customer authentication.
- WhatsApp integration.
- Email integration.
- Payment processing.
- External LLM integration.
- Production cloud infrastructure.
- Complex multi-agent AI systems.
- Real-time external ticket synchronization.
- Enterprise multi-tenant management.

Focus on a complete and demonstrable ML pipeline.

# 15. Acceptance Criteria

The project is considered complete only when:

- [ ] A dataset can be loaded and inspected.
- [ ] Data cleaning and preprocessing work.
- [ ] TF-IDF vectorization is implemented.
- [ ] At least two ML algorithms are trained and compared.
- [ ] Evaluation metrics are generated from held-out test data.
- [ ] The best-performing model is saved.
- [ ] The application loads the saved model.
- [ ] A new ticket can be classified.
- [ ] Classification confidence is displayed when supported.
- [ ] Priority assessment works independently.
- [ ] Ticket history is saved.
- [ ] Dashboard charts use actual data.
- [ ] Model performance page displays real evaluation results.
- [ ] README includes setup and execution instructions.
- [ ] All major features are tested.
- [ ] The complete application runs locally without errors.

# 16. Development Execution Plan

Prioritize implementation in this order:

**Phase 1 – Foundation**
- Initialize Python environment.
- Install dependencies.
- Obtain dataset.
- Inspect and clean dataset.

**Phase 2 – Machine Learning**
- Implement preprocessing.
- Implement TF-IDF.
- Train Naive Bayes.
- Train Logistic Regression.
- Compare models.
- Save selected artifacts.

**Phase 3 – Backend Integration**
- Implement prediction service.
- Implement priority engine.
- Implement SQLite history.
- Test inference.

**Phase 4 – Frontend**
- Build Streamlit navigation.
- Develop overview dashboard.
- Develop ticket analysis page.
- Develop ticket explorer.
- Develop model performance page.

**Phase 5 – Finalization**
- Run tests.
- Verify predictions.
- Correct UI issues.
- Generate README.
- Prepare GitHub repository.
- Capture application screenshots.

# 17. Final Deliverables

The final project must contain:

1. Fully functional SignalDesk application.
2. Reproducible dataset preparation workflow.
3. Machine learning training pipeline.
4. Two trained and evaluated classification algorithms.
5. Saved final model and TF-IDF vectorizer.
6. Interactive Streamlit dashboard.
7. Ticket prediction functionality.
8. Priority assessment engine.
9. SQLite ticket history.
10. Model evaluation report.
11. README documentation.
12. GitHub-ready source code.

# 18. Important Development Instructions for Antigravity

- Build the actual application, not just a UI prototype.
- Do not use hardcoded prediction results or fabricated model metrics.
- Do not use an external AI API to perform ticket classification.
- Train real machine learning models using the selected dataset.
- Use Scikit-learn for the complete ML workflow.
- Keep the application modular and maintainable.
- Ensure the saved model and vectorizer are used for inference.
- Keep priority assessment separate from ML classification.
- Use actual dataset records for dashboard analytics.
- Do not silently substitute synthetic data for real data.
- If a dataset download fails, document the issue and implement a clearly labelled fallback.
- Test every major feature before considering it complete.
- Do not stop after generating the project structure or frontend.
- Execute the application, inspect errors and fix them.
- Prioritize a working end-to-end MVP over unnecessary features.

**Definition of Done:** A user can open SignalDesk, submit a customer support message, receive a genuine ML-generated category prediction, see a transparent priority assessment, and view the ticket in the analytics and history dashboard.

---

**END OF PRODUCT REQUIREMENTS DOCUMENT**