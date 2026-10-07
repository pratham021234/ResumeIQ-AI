import re
from typing import List, Dict, Set, Tuple, Any

# Synonyms and alias mappings
KEYWORD_SYNONYMS = {
    "javascript": ["js", "ecmascript"],
    "typescript": ["ts"],
    "python": ["py"],
    "postgresql": ["postgres", "pgsql", "psql"],
    "kubernetes": ["k8s"],
    "rest apis": ["restful apis", "rest api", "restful api", "rest", "restful web services"],
    "fastapi": ["fast api"],
    "react": ["reactjs", "react.js"],
    "next.js": ["nextjs", "next"],
    "node.js": ["nodejs", "node"],
    "vue.js": ["vuejs", "vue"],
    "amazon web services": ["aws"],
    "google cloud platform": ["gcp", "google cloud"],
    "microsoft azure": ["azure"],
    "ci/cd": ["cicd", "continuous integration", "continuous deployment"],
    "docker": ["containerization", "containers", "docker engine"],
    "mongodb": ["mongo"],
    "graphql": ["gql"],
    "machine learning": ["ml"],
    "artificial intelligence": ["ai"],
    "deep learning": ["dl"],
    "natural language processing": ["nlp"],
    "large language models": ["llm", "llms"],
    "relational database": ["rdbms", "sql"],
    "nosql": ["document database"],
    "microservices": ["distributed systems", "service-oriented architecture", "microservice architecture"],
    "unit testing": ["tdd", "automated testing", "jest", "pytest"]
}

TECH_KEYWORDS_CATALOG = {
    # Languages
    "python": "Technologies", "javascript": "Technologies", "typescript": "Technologies",
    "go": "Technologies", "golang": "Technologies", "rust": "Technologies", "java": "Technologies",
    "c++": "Technologies", "c#": "Technologies", "ruby": "Technologies", "php": "Technologies",
    "swift": "Technologies", "kotlin": "Technologies", "sql": "Technologies", "html": "Technologies",
    "css": "Technologies",

    # Frameworks & Libraries
    "fastapi": "Frameworks", "django": "Frameworks", "flask": "Frameworks",
    "react": "Frameworks", "next.js": "Frameworks", "vue.js": "Frameworks", "angular": "Frameworks",
    "node.js": "Frameworks", "express": "Frameworks", "nestjs": "Frameworks",
    "spring boot": "Frameworks", "ruby on rails": "Frameworks", "asp.net": "Frameworks",
    "pytorch": "Frameworks", "tensorflow": "Frameworks", "scikit-learn": "Frameworks",
    "pandas": "Frameworks", "numpy": "Frameworks", "tailwind css": "Frameworks",

    # Databases & Caching
    "postgresql": "Tools", "mysql": "Tools", "mongodb": "Tools", "redis": "Tools",
    "elasticsearch": "Tools", "dynamodb": "Tools", "sqlite": "Tools", "cassandra": "Tools",
    "neo4j": "Tools", "firebase": "Tools", "supabase": "Tools",

    # Cloud & DevOps & Infra
    "docker": "Tools", "kubernetes": "Tools", "aws": "Tools", "azure": "Tools", "gcp": "Tools",
    "ci/cd": "Tools", "terraform": "Tools", "github actions": "Tools", "jenkins": "Tools",
    "linux": "Tools", "git": "Tools", "nginx": "Tools", "kafka": "Tools", "rabbitmq": "Tools",

    # Concepts / Domain
    "rest apis": "Responsibilities", "graphql": "Responsibilities", "microservices": "Responsibilities",
    "system design": "Responsibilities", "data modeling": "Responsibilities",
    "api security": "Responsibilities", "performance optimization": "Responsibilities",
    "unit testing": "Responsibilities", "agile": "Responsibilities", "scrum": "Responsibilities",
    "prompt engineering": "Domain Keywords", "embeddings": "Domain Keywords", "rag": "Domain Keywords",
    "distributed systems": "Domain Keywords",

    # Soft Skills
    "leadership": "Soft Skills", "communication": "Soft Skills", "collaboration": "Soft Skills",
    "mentorship": "Soft Skills", "cross-functional": "Soft Skills", "problem solving": "Soft Skills",
    "critical thinking": "Soft Skills", "ownership": "Soft Skills", "adaptability": "Soft Skills"
}

def normalize_token(text: str) -> str:
    cleaned = re.sub(r'[^\w\s\.\+\#\/\-]', ' ', text.lower())
    return " ".join(cleaned.split())

def match_keyword_in_text(keyword: str, text_normalized: str) -> bool:
    kw_norm = normalize_token(keyword)
    
    # Direct search with word boundary
    pattern = r'\b' + re.escape(kw_norm) + r'\b'
    if re.search(pattern, text_normalized):
        return True
    
    # Check aliases and synonyms
    aliases = KEYWORD_SYNONYMS.get(kw_norm, [])
    # Also check reverse mapping
    for canonical, syn_list in KEYWORD_SYNONYMS.items():
        if kw_norm in syn_list:
            aliases.append(canonical)
            aliases.extend([s for s in syn_list if s != kw_norm])

    for alias in aliases:
        alias_norm = normalize_token(alias)
        pattern = r'\b' + re.escape(alias_norm) + r'\b'
        if re.search(pattern, text_normalized):
            return True
            
    return False

def extract_keywords_from_jd(jd_text: str) -> List[Dict[str, Any]]:
    jd_normalized = normalize_token(jd_text)
    found_keywords = []

    # Check each known catalog keyword
    for kw, cat in TECH_KEYWORDS_CATALOG.items():
        if match_keyword_in_text(kw, jd_normalized):
            # Determine prominence by occurrence count
            count = len(re.findall(r'\b' + re.escape(kw) + r'\b', jd_normalized))
            relevance = "high" if count >= 2 else "medium"
            found_keywords.append({
                "keyword": kw.title() if len(kw) > 3 else kw.upper(),
                "category": cat,
                "relevance": relevance,
                "count": max(1, count)
            })

    # Sort high relevance first
    found_keywords.sort(key=lambda x: (x["relevance"] == "high", x["count"]), reverse=True)
    return found_keywords
