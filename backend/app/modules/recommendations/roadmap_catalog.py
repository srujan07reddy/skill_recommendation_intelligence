"""
SSIP roadmap.sh Integration Catalog & Career-Path Gap Mapper
Maps canonical Jeppiaar taxonomy skills to official roadmap.sh learning paths,
role roadmaps, prerequisites, and tier-specific milestone topics.
"""
from typing import Any, Dict, List, Optional


ROADMAP_SKILL_CATALOG: Dict[str, Dict[str, Any]] = {
    "python": {
        "slug": "python",
        "title": "Python Developer Roadmap",
        "roadmap_url": "https://roadmap.sh/python",
        "role_track": "Backend Developer",
        "role_slug": "backend",
        "role_url": "https://roadmap.sh/backend",
        "prerequisites": ["Programming Basics", "Git"],
        "milestones": {
            "BEGINNER": [
                "Basic Syntax, Variables & Data Types",
                "Conditionals, Loops & Functions",
                "Lists, Tuples, Sets & Dictionaries",
                "Virtual Environments (venv) & pip",
            ],
            "INTERMEDIATE": [
                "Object-Oriented Programming & Dataclasses",
                "Exception Handling, File I/O & Modules",
                "List Comprehensions, Generators & Iterators",
                "Unit Testing with pytest & Code Linting",
            ],
            "EXPERT": [
                "Asynchronous Programming (asyncio)",
                "Decorators, Context Managers & Metaclasses",
                "FastAPI / Web API Architecture & Profiling",
                "Concurrency, Multiprocessing & Packaging",
            ],
        },
    },
    "sql": {
        "slug": "sql",
        "title": "SQL & Relational Querying Roadmap",
        "roadmap_url": "https://roadmap.sh/sql",
        "role_track": "Backend Developer",
        "role_slug": "backend",
        "role_url": "https://roadmap.sh/backend",
        "prerequisites": ["Data Modeling Concepts"],
        "milestones": {
            "BEGINNER": [
                "SELECT, WHERE, ORDER BY & Filtering",
                "INSERT, UPDATE, DELETE & DDL Basics",
                "Primary Keys, Foreign Keys & Constraints",
                "Basic Joins (INNER, LEFT, RIGHT)",
            ],
            "INTERMEDIATE": [
                "Aggregate Functions, GROUP BY & HAVING",
                "Subqueries, Common Table Expressions (CTEs)",
                "Normalization (1NF, 2NF, 3NF) & Schema Design",
                "Indexes & Query Performance Basics",
            ],
            "EXPERT": [
                "Window Functions (ROW_NUMBER, RANK, OVER)",
                "Transactions, ACID Properties & Isolation Levels",
                "Query Execution Plans (EXPLAIN ANALYZE)",
                "Stored Procedures, Triggers & Partitioning",
            ],
        },
    },
    "postgresql": {
        "slug": "postgresql",
        "title": "PostgreSQL Database Roadmap",
        "roadmap_url": "https://roadmap.sh/postgresql",
        "role_track": "Backend Developer",
        "role_slug": "backend",
        "role_url": "https://roadmap.sh/backend",
        "prerequisites": ["SQL"],
        "milestones": {
            "BEGINNER": ["PostgreSQL Installation & psql CLI", "Tables, Data Types & Basic Queries"],
            "INTERMEDIATE": ["JSONB Indexing, Constraints & Joins", "pg_dump Backups & Role Permissions"],
            "EXPERT": ["MVCC Internals, Vacuuming & Tuning", "Streaming Replication & Connection Pooling"],
        },
    },
    "react": {
        "slug": "react",
        "title": "React Frontend Roadmap",
        "roadmap_url": "https://roadmap.sh/react",
        "role_track": "Frontend Developer",
        "role_slug": "frontend",
        "role_url": "https://roadmap.sh/frontend",
        "prerequisites": ["JavaScript", "HTML & CSS"],
        "milestones": {
            "BEGINNER": [
                "JSX Syntax, Functional Components & Props",
                "useState Hook & Conditional Rendering",
                "Lists, Keys & Form Event Handling",
            ],
            "INTERMEDIATE": [
                "useEffect Lifecycle & API Fetching",
                "React Router & Client-Side Navigation",
                "Context API, Custom Hooks & TypeScript Props",
            ],
            "EXPERT": [
                "State Management (Zustand / Redux Toolkit)",
                "Performance Optimization (useMemo, Code Splitting)",
                "Testing Library, SSR / Next.js Architecture",
            ],
        },
    },
    "javascript": {
        "slug": "javascript",
        "title": "JavaScript Roadmap",
        "roadmap_url": "https://roadmap.sh/javascript",
        "role_track": "Frontend Developer",
        "role_slug": "frontend",
        "role_url": "https://roadmap.sh/frontend",
        "prerequisites": ["HTML & CSS"],
        "milestones": {
            "BEGINNER": ["Variables (let/const), Scope & Functions", "Arrays, Objects & DOM Manipulation"],
            "INTERMEDIATE": ["Closures, Promises & Async/Await", "Fetch API & ES Modules"],
            "EXPERT": ["Event Loop Internals & Prototypes", "Memory Profiling & Design Patterns"],
        },
    },
    "typescript": {
        "slug": "typescript",
        "title": "TypeScript Roadmap",
        "roadmap_url": "https://roadmap.sh/typescript",
        "role_track": "Frontend Developer",
        "role_slug": "frontend",
        "role_url": "https://roadmap.sh/frontend",
        "prerequisites": ["JavaScript"],
        "milestones": {
            "BEGINNER": ["Primitive Types, Interfaces & Type Aliases", "Compiling with tsc & tsconfig.json"],
            "INTERMEDIATE": ["Unions, Narrowing, Generics & Enums", "Strict Null Checks & Utility Types"],
            "EXPERT": ["Conditional/Mapped Types & Discriminated Unions", "Module Augmentation & Library Typing"],
        },
    },
    "java": {
        "slug": "java",
        "title": "Java Developer Roadmap",
        "roadmap_url": "https://roadmap.sh/java",
        "role_track": "Backend Developer",
        "role_slug": "backend",
        "role_url": "https://roadmap.sh/backend",
        "prerequisites": ["OOP Concepts"],
        "milestones": {
            "BEGINNER": ["JVM Basics, Syntax, Classes & Objects", "Collections Framework (List, Set, Map)"],
            "INTERMEDIATE": ["Exception Handling, Streams API & Lambdas", "Maven/Gradle & JUnit Testing"],
            "EXPERT": ["Spring Boot Microservices & JPA/Hibernate", "JVM GC Tuning & Multithreading"],
        },
    },
    "c++": {
        "slug": "cpp",
        "title": "C++ Systems & DSA Roadmap",
        "roadmap_url": "https://roadmap.sh/cpp",
        "role_track": "Computer Science & DSA",
        "role_slug": "datastructures-and-algorithms",
        "role_url": "https://roadmap.sh/datastructures-and-algorithms",
        "prerequisites": ["Computer Organization Basics"],
        "milestones": {
            "BEGINNER": ["Pointers, References & Memory Layout", "Control Flow, Functions & Arrays"],
            "INTERMEDIATE": ["OOP, Templates & STL Containers/Algorithms", "RAII & Smart Pointers"],
            "EXPERT": ["Move Semantics, Concurrency & Cache Optimization", "Build Systems (CMake) & Profiling"],
        },
    },
    "fastapi": {
        "slug": "backend",
        "title": "FastAPI & Modern Python Backend Roadmap",
        "roadmap_url": "https://roadmap.sh/backend",
        "role_track": "Backend Developer",
        "role_slug": "backend",
        "role_url": "https://roadmap.sh/backend",
        "prerequisites": ["Python", "SQL", "HTTP & REST"],
        "milestones": {
            "BEGINNER": ["REST Routes, Query/Path Params & Pydantic Models", "OpenAPI Docs & Status Codes"],
            "INTERMEDIATE": ["Dependency Injection, JWT Auth & Async SQLAlchemy", "Pytest AsyncClient Testing"],
            "EXPERT": ["Background Workers, Rate Limiting & Zero-Trust Auth", "Production ASGI Deployment"],
        },
    },
    "node.js": {
        "slug": "nodejs",
        "title": "Node.js Developer Roadmap",
        "roadmap_url": "https://roadmap.sh/nodejs",
        "role_track": "Backend Developer",
        "role_slug": "backend",
        "role_url": "https://roadmap.sh/backend",
        "prerequisites": ["JavaScript"],
        "milestones": {
            "BEGINNER": ["CommonJS vs ESM, npm/pnpm & fs/path APIs", "Simple HTTP Server / Express Basics"],
            "INTERMEDIATE": ["Event Loop, Streams, Buffers & Middleware", "REST Auth & Database Drivers"],
            "EXPERT": ["Worker Threads, Clustering & Observability", "Security Hardening & Performance Tuning"],
        },
    },
    "redis": {
        "slug": "backend",
        "title": "In-Memory Caching & Redis Architecture",
        "roadmap_url": "https://roadmap.sh/backend",
        "role_track": "Backend Developer",
        "role_slug": "backend",
        "role_url": "https://roadmap.sh/backend",
        "prerequisites": ["Backend Fundamentals"],
        "milestones": {
            "BEGINNER": ["Key-Value Store Basics, TTLs & Data Types", "Hashes, Lists & Sets"],
            "INTERMEDIATE": ["Cache-Aside Pattern & Session Ephemeral Storage", "Pub/Sub Messaging"],
            "EXPERT": ["Eviction Policies, Redis Cluster & Lua Atomics", "Rate Limiting & Distributed Locks"],
        },
    },
    "pandas": {
        "slug": "ai-data-scientist",
        "title": "Pandas & Data Engineering Roadmap",
        "roadmap_url": "https://roadmap.sh/ai-data-scientist",
        "role_track": "AI & Data Scientist",
        "role_slug": "ai-data-scientist",
        "role_url": "https://roadmap.sh/ai-data-scientist",
        "prerequisites": ["Python"],
        "milestones": {
            "BEGINNER": ["Series, DataFrames & CSV/Excel Ingestion", "Filtering, Slicing & Missing Data Handling"],
            "INTERMEDIATE": ["GroupBy Aggregations, Merging & Pivot Tables", "Time-Series Resampling"],
            "EXPERT": ["Vectorized Performance & Memory Optimization", "Data Cleaning Pipelines for ML"],
        },
    },
    "scikit-learn": {
        "slug": "ai-data-scientist",
        "title": "Machine Learning (Scikit-Learn) Roadmap",
        "roadmap_url": "https://roadmap.sh/ai-data-scientist",
        "role_track": "AI & Data Scientist",
        "role_slug": "ai-data-scientist",
        "role_url": "https://roadmap.sh/ai-data-scientist",
        "prerequisites": ["Python", "Pandas", "Linear Algebra & Statistics"],
        "milestones": {
            "BEGINNER": ["Train/Test Split, Regression & Classification Basics", "Data Scaling & Encoding"],
            "INTERMEDIATE": ["Decision Trees, Random Forests, Cross-Validation", "Confusion Matrix, F1 & ROC-AUC"],
            "EXPERT": ["ColumnTransformers, Pipelines & Hyperparameter Search", "Model Interpretability & Drift"],
        },
    },
    "tensorflow": {
        "slug": "ai-engineer",
        "title": "Deep Learning (TensorFlow) Roadmap",
        "roadmap_url": "https://roadmap.sh/ai-engineer",
        "role_track": "AI & Data Scientist",
        "role_slug": "ai-data-scientist",
        "role_url": "https://roadmap.sh/ai-data-scientist",
        "prerequisites": ["Python", "Scikit-Learn"],
        "milestones": {
            "BEGINNER": ["Tensors, Keras Sequential API & Dense Layers", "Training Loops & Loss Functions"],
            "INTERMEDIATE": ["CNNs, Transfer Learning & Regularization", "tf.data Pipelines & TensorBoard"],
            "EXPERT": ["Custom Training Steps (GradientTape) & Distributed Strategy", "TF Serving / TFLite Export"],
        },
    },
    "pytorch": {
        "slug": "ai-engineer",
        "title": "Deep Learning (PyTorch) Roadmap",
        "roadmap_url": "https://roadmap.sh/ai-engineer",
        "role_track": "AI & Data Scientist",
        "role_slug": "ai-data-scientist",
        "role_url": "https://roadmap.sh/ai-data-scientist",
        "prerequisites": ["Python", "Scikit-Learn"],
        "milestones": {
            "BEGINNER": ["Tensors, Autograd & nn.Module Basics", "Datasets & DataLoaders"],
            "INTERMEDIATE": ["Convolutional & Recurrent Architectures", "Optimizers, Checkpointing & GPU Training"],
            "EXPERT": ["Transformers, Fine-Tuning LLMs & Mixed Precision", "TorchScript / ONNX Deployment"],
        },
    },
    "natural language processing": {
        "slug": "ai-engineer",
        "title": "NLP & Language AI Roadmap",
        "roadmap_url": "https://roadmap.sh/ai-engineer",
        "role_track": "AI & Data Scientist",
        "role_slug": "ai-data-scientist",
        "role_url": "https://roadmap.sh/ai-data-scientist",
        "prerequisites": ["Python", "PyTorch"],
        "milestones": {
            "BEGINNER": ["Tokenization, Stopwords, TF-IDF & Sentiment Analysis"],
            "INTERMEDIATE": ["Word Embeddings, Named Entity Recognition & Hugging Face Pipelines"],
            "EXPERT": ["Transformer Fine-Tuning, RAG & Evaluation Metrics"],
        },
    },
    "docker": {
        "slug": "docker",
        "title": "Docker Containerization Roadmap",
        "roadmap_url": "https://roadmap.sh/docker",
        "role_track": "Cloud & DevOps",
        "role_slug": "devops",
        "role_url": "https://roadmap.sh/devops",
        "prerequisites": ["Linux"],
        "milestones": {
            "BEGINNER": ["Images vs Containers, docker run & Dockerfile Basics", "Port Mapping & Volumes"],
            "INTERMEDIATE": ["Multi-Stage Builds, Docker Compose & Bridge Networks", "Container Registries"],
            "EXPERT": ["Image Security Scanning, Rootless Containers & BuildKit", "Production Orchestration Prep"],
        },
    },
    "kubernetes": {
        "slug": "kubernetes",
        "title": "Kubernetes Orchestration Roadmap",
        "roadmap_url": "https://roadmap.sh/kubernetes",
        "role_track": "Cloud & DevOps",
        "role_slug": "devops",
        "role_url": "https://roadmap.sh/devops",
        "prerequisites": ["Docker", "Linux"],
        "milestones": {
            "BEGINNER": ["Pods, Deployments, Services & kubectl Basics"],
            "INTERMEDIATE": ["ConfigMaps, Secrets, Ingress & Persistent Volumes"],
            "EXPERT": ["Helm Charts, HPA Autoscaling, RBAC & Network Policies"],
        },
    },
    "amazon web services": {
        "slug": "aws",
        "title": "AWS Cloud Architecture Roadmap",
        "roadmap_url": "https://roadmap.sh/aws",
        "role_track": "Cloud & DevOps",
        "role_slug": "devops",
        "role_url": "https://roadmap.sh/devops",
        "prerequisites": ["Linux", "Networking Fundamentals"],
        "milestones": {
            "BEGINNER": ["IAM Users/Roles, EC2 Instances & S3 Buckets"],
            "INTERMEDIATE": ["VPC Subnets, RDS Managed Databases & Load Balancers"],
            "EXPERT": ["ECS/EKS, Lambda Serverless, CloudWatch & Infrastructure as Code"],
        },
    },
    "linux": {
        "slug": "linux",
        "title": "Linux System Administration Roadmap",
        "roadmap_url": "https://roadmap.sh/linux",
        "role_track": "Cloud & DevOps",
        "role_slug": "devops",
        "role_url": "https://roadmap.sh/devops",
        "prerequisites": [],
        "milestones": {
            "BEGINNER": ["Filesystem Navigation, Permissions (chmod/chown) & Shell Basics"],
            "INTERMEDIATE": ["Process Management, Systemd Services, SSH & Bash Scripting"],
            "EXPERT": ["Networking Diagnostics (ss/tcpdump), Firewalls & Kernel Tuning"],
        },
    },
    "git": {
        "slug": "git-github",
        "title": "Git & GitHub Version Control Roadmap",
        "roadmap_url": "https://roadmap.sh/git-github",
        "role_track": "Computer Science & DSA",
        "role_slug": "git-github",
        "role_url": "https://roadmap.sh/git-github",
        "prerequisites": [],
        "milestones": {
            "BEGINNER": ["git init, add, commit, status & Remote Push/Pull"],
            "INTERMEDIATE": ["Branching, Merging, Pull Requests & Resolving Conflicts"],
            "EXPERT": ["Interactive Rebase, Cherry-Pick, Git Hooks & CI/CD Workflows"],
        },
    },
    "network security": {
        "slug": "cyber-security",
        "title": "Cyber Security & Network Defense Roadmap",
        "roadmap_url": "https://roadmap.sh/cyber-security",
        "role_track": "Cyber Security",
        "role_slug": "cyber-security",
        "role_url": "https://roadmap.sh/cyber-security",
        "prerequisites": ["Linux", "Networking Fundamentals"],
        "milestones": {
            "BEGINNER": ["OSI/TCP-IP Security, Firewalls & TLS/HTTPS Fundamentals"],
            "INTERMEDIATE": ["Packet Analysis (Wireshark), IDS/IPS & VPN Architecture"],
            "EXPERT": ["Zero-Trust Segmentation, Incident Response & SIEM Correlation"],
        },
    },
    "ethical hacking": {
        "slug": "cyber-security",
        "title": "Penetration Testing & Ethical Hacking Roadmap",
        "roadmap_url": "https://roadmap.sh/cyber-security",
        "role_track": "Cyber Security",
        "role_slug": "cyber-security",
        "role_url": "https://roadmap.sh/cyber-security",
        "prerequisites": ["Network Security", "Linux"],
        "milestones": {
            "BEGINNER": ["Reconnaissance, Nmap Scanning & OWASP Top 10 Concepts"],
            "INTERMEDIATE": ["Web App Exploitation Labs (Burp Suite) & Privilege Escalation"],
            "EXPERT": ["Red Team Methodologies, Exploit Auditing & Remediation Reports"],
        },
    },
    "data structures": {
        "slug": "datastructures-and-algorithms",
        "title": "Data Structures & Algorithms Roadmap",
        "roadmap_url": "https://roadmap.sh/datastructures-and-algorithms",
        "role_track": "Computer Science & DSA",
        "role_slug": "datastructures-and-algorithms",
        "role_url": "https://roadmap.sh/datastructures-and-algorithms",
        "prerequisites": ["Python", "C++", "Java"],
        "milestones": {
            "BEGINNER": ["Time/Space Complexity (Big-O), Arrays, Strings & Linked Lists"],
            "INTERMEDIATE": ["Stacks, Queues, Hash Maps, Trees & Binary Search"],
            "EXPERT": ["Graphs, Dynamic Programming, Greedy & Competitive Problem Solving"],
        },
    },
}


ROLE_TRACKS: List[Dict[str, Any]] = [
    {
        "role_track": "Backend Developer",
        "slug": "backend",
        "url": "https://roadmap.sh/backend",
        "description": "Server-side languages, relational databases, REST APIs, caching, and system reliability.",
        "skills": ["Python", "FastAPI", "Java", "Node.js", "SQL", "PostgreSQL", "Redis", "Git"],
    },
    {
        "role_track": "Frontend Developer",
        "slug": "frontend",
        "url": "https://roadmap.sh/frontend",
        "description": "Modern browser engineering, TypeScript safety, declarative React UIs, and accessibility.",
        "skills": ["JavaScript", "TypeScript", "React", "Git"],
    },
    {
        "role_track": "AI & Data Scientist",
        "slug": "ai-data-scientist",
        "url": "https://roadmap.sh/ai-data-scientist",
        "description": "Data wrangling, statistical modeling, classical machine learning, and deep neural architectures.",
        "skills": ["Python", "SQL", "Pandas", "Scikit-Learn", "TensorFlow", "PyTorch", "Natural Language Processing"],
    },
    {
        "role_track": "Cloud & DevOps",
        "slug": "devops",
        "url": "https://roadmap.sh/devops",
        "description": "Linux fundamentals, containerization, orchestration, and scalable cloud infrastructure.",
        "skills": ["Linux", "Docker", "Kubernetes", "Amazon Web Services", "Git"],
    },
    {
        "role_track": "Cyber Security",
        "slug": "cyber-security",
        "url": "https://roadmap.sh/cyber-security",
        "description": "Defensive network security, vulnerability assessment, and ethical penetration testing.",
        "skills": ["Linux", "Network Security", "Ethical Hacking"],
    },
    {
        "role_track": "Computer Science & DSA",
        "slug": "datastructures-and-algorithms",
        "url": "https://roadmap.sh/datastructures-and-algorithms",
        "description": "Algorithmic complexity, foundational computer science problem solving, and version control.",
        "skills": ["C++", "Java", "Python", "Git"],
    },
]


def _pick_tier_key(target_proficiency: Optional[float], current_proficiency: Optional[float]) -> str:
    """Selects roadmap milestone tier matching the learner's next progression step."""
    if current_proficiency is None or current_proficiency == 0.0:
        return "BEGINNER"
    if target_proficiency and target_proficiency >= 2.5:
        return "EXPERT"
    if current_proficiency < 2.0:
        return "INTERMEDIATE"
    return "EXPERT"


def resolve_roadmap_for_skill(
    skill_name: str,
    current_proficiency: Optional[float] = None,
    target_proficiency: Optional[float] = None,
) -> Dict[str, Any]:
    """Resolves a taxonomy skill to its roadmap.sh curriculum track and targeted milestones."""
    key = skill_name.strip().lower()
    entry = ROADMAP_SKILL_CATALOG.get(key)

    # Alias/substring lookup if not exact key
    if not entry:
        alias_map = {
            "aws": "amazon web services",
            "nlp": "natural language processing",
            "cpp": "c++",
            "nodejs": "node.js",
            "dsa": "data structures",
            "ai": "scikit-learn",
            "ml": "scikit-learn",
            "github": "git",
        }
        mapped_key = alias_map.get(key)
        if mapped_key:
            entry = ROADMAP_SKILL_CATALOG.get(mapped_key)

    if not entry:
        # Clean universal fallback to roadmap.sh search/general track
        clean_slug = key.replace(" ", "-")
        return {
            "slug": clean_slug,
            "title": f"{skill_name} Learning Roadmap",
            "roadmap_url": f"https://roadmap.sh/{clean_slug}",
            "role_track": "Software Engineering",
            "role_slug": "backend",
            "role_url": "https://roadmap.sh",
            "prerequisites": [],
            "target_tier": _pick_tier_key(target_proficiency, current_proficiency),
            "milestones": [
                f"Core syntax & fundamentals of {skill_name}",
                f"Applied projects and best practices in {skill_name}",
                f"Production optimization and evaluation in {skill_name}",
            ],
        }

    tier_key = _pick_tier_key(target_proficiency, current_proficiency)
    tier_topics = entry["milestones"].get(tier_key) or entry["milestones"].get("BEGINNER", [])

    return {
        "slug": entry["slug"],
        "title": entry["title"],
        "roadmap_url": entry["roadmap_url"],
        "role_track": entry["role_track"],
        "role_slug": entry["role_slug"],
        "role_url": entry["role_url"],
        "prerequisites": entry["prerequisites"],
        "target_tier": tier_key,
        "milestones": tier_topics,
        "all_tiers": entry["milestones"],
    }

