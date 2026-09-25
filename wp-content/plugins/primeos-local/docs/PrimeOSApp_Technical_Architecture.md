# PrimeOSApp — Technical Architecture

**Version:** 1.0
**Scope:** Full microservices architecture covering the 9 Business Model Canvas systems + Integration Layer + Marketing/Finance/Ops/Sales overlays

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App - React/Next.js]
        MOB[Mobile App - React Native]
    end

    subgraph "Edge Layer"
        CDN[CDN / Static Assets]
        GW[API Gateway - Kong]
        AUTH[Auth Service - Keycloak / OAuth2]
    end

    subgraph "Core BMC Microservices"
        CRX[CRM-X]
        SEGX[SEG-X]
        CHANX[CHAN-X]
        COSTX[COST-X]
        ACTX[ACT-X]
        PARTX[PART-X]
        RESX[RES-X]
        REVX[REV-X]
        VALUEX[VALUE-X]
    end

    subgraph "Overlay Departments"
        MKT[Marketing Service]
        FIN[Finance Service]
        OPS[Operations Service]
        SALES[Sales Service]
    end

    subgraph "Integration Layer"
        BUS[Event Bus - Kafka]
        ORCH[Orchestration Hub]
        INTG[3rd-Party Integration Adapters]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL Cluster)]
        MONGO[(MongoDB Cluster)]
        MYSQL[(MySQL)]
        REDIS[(Redis Cache)]
        DW[(Analytics Warehouse - BigQuery/Snowflake)]
    end

    WEB --> CDN --> GW
    MOB --> GW
    GW --> AUTH
    GW --> CRX & SEGX & CHANX & COSTX & ACTX & PARTX & RESX & REVX & VALUEX
    GW --> MKT & FIN & OPS & SALES

    CRX & SEGX & CHANX & COSTX & ACTX & PARTX & RESX & REVX & VALUEX --> BUS
    MKT & FIN & OPS & SALES --> BUS
    BUS --> ORCH
    ORCH --> DW
    INTG --> BUS

    CRX --> PG
    ACTX --> PG
    COSTX --> PG
    PARTX --> PG
    RESX --> PG
    REVX --> PG
    REVX --> REDIS
    SEGX --> MONGO
    VALUEX --> MONGO
    CHANX --> MYSQL
```

**Key design decisions:**
- **Polyglot persistence** is intentional — relational systems (finance, cost, revenue, activities, partners, resources) use PostgreSQL for transactional integrity; segmentation and value proposition (semi-structured, evolving schemas) use MongoDB; channels use MySQL for compatibility with common marketing-stack integrations.
- **Kafka event bus** is the nervous system: any state change in one BMC block (e.g., new customer in CRM-X) fires an event that SEG-X, REV-X, and the Analytics Warehouse can subscribe to, without services calling each other directly.
- **API Gateway (Kong)** is the single entry point — handles rate limiting, auth token validation, and request routing so frontends never talk to microservices directly.

---

## 2. Integration & Orchestration Layer (Detail)

```mermaid
graph LR
    subgraph "Event Producers"
        CRX2[CRM-X]
        SALES2[Sales Service]
        REVX2[REV-X]
    end

    subgraph "Kafka Topics"
        T1[customer.created]
        T2[deal.closed]
        T3[invoice.paid]
        T4[activity.completed]
    end

    subgraph "Event Consumers"
        SEGX2[SEG-X: re-cluster]
        REVX3[REV-X: record revenue]
        FIN2[Finance: reconcile]
        MKT2[Marketing: trigger campaign]
        DW2[Warehouse: ETL sync]
    end

    CRX2 -->|publish| T1
    SALES2 -->|publish| T2
    REVX2 -->|publish| T3

    T1 --> SEGX2
    T1 --> MKT2
    T2 --> REVX3
    T2 --> FIN2
    T3 --> FIN2
    T3 --> DW2
    T4 --> DW2
```

**Third-party integration adapters** (normalized via the Integration Layer, not hardcoded into each microservice):
| Category | Examples |
|---|---|
| Accounting | QuickBooks, SAP, Xero |
| Payments | Stripe, PayPal, Mercado Pago |
| Marketing | HubSpot, Meta Ads, Google Ads, Mailchimp |
| E-commerce | Shopify, WooCommerce, VTEX |
| Communication | WhatsApp Business API, Twilio, SendGrid |
| Productivity | Slack, Google Workspace, Microsoft 365 |

Each adapter implements a shared `IntegrationAdapter` interface (`sync()`, `webhook()`, `authenticate()`) so new integrations plug into the Event Bus without touching core services.

---

## 3. Database ER Diagrams

### 3.1 CRM-X (PostgreSQL)
```mermaid
erDiagram
    CUSTOMERS ||--o{ INTERACTIONS : has
    CUSTOMERS ||--o{ TICKETS : opens
    CUSTOMERS ||--o{ LOYALTY_POINTS : earns
    CUSTOMERS ||--o{ FOLLOW_UPS : scheduled

    CUSTOMERS {
        uuid id PK
        string name
        string email
        string phone
        string segment_id FK
        timestamp created_at
    }
    INTERACTIONS {
        uuid id PK
        uuid customer_id FK
        string channel
        text notes
        timestamp occurred_at
    }
    TICKETS {
        uuid id PK
        uuid customer_id FK
        string status
        string priority
        timestamp created_at
        timestamp resolved_at
    }
    LOYALTY_POINTS {
        uuid id PK
        uuid customer_id FK
        int points
        string reason
        timestamp created_at
    }
    FOLLOW_UPS {
        uuid id PK
        uuid customer_id FK
        timestamp due_at
        string status
    }
```

### 3.2 REV-X (PostgreSQL + Redis)
```mermaid
erDiagram
    REVENUE_STREAMS ||--o{ TRANSACTIONS : generates
    REVENUE_STREAMS ||--o{ SUBSCRIPTIONS : includes
    REVENUE_STREAMS ||--o{ PRICING_RULES : governed_by

    REVENUE_STREAMS {
        uuid id PK
        string name
        string type
        string currency
    }
    TRANSACTIONS {
        uuid id PK
        uuid stream_id FK
        uuid customer_id FK
        decimal amount
        timestamp paid_at
    }
    SUBSCRIPTIONS {
        uuid id PK
        uuid customer_id FK
        uuid stream_id FK
        string plan
        string status
        date renewal_date
    }
    PRICING_RULES {
        uuid id PK
        uuid stream_id FK
        string tier
        decimal price
    }
```

### 3.3 COST-X (PostgreSQL)
```mermaid
erDiagram
    COST_CATEGORIES ||--o{ EXPENSES : contains
    BUDGETS ||--o{ FORECASTS : projects

    COST_CATEGORIES {
        uuid id PK
        string name
        string type "fixed/variable"
    }
    EXPENSES {
        uuid id PK
        uuid category_id FK
        decimal amount
        date incurred_on
        string status
    }
    BUDGETS {
        uuid id PK
        uuid category_id FK
        decimal planned_amount
        string period
    }
    FORECASTS {
        uuid id PK
        uuid budget_id FK
        decimal projected_amount
        date projection_date
    }
```

### 3.4 SEG-X / VALUE-X (MongoDB — document schema, not ER)
```json
// segments collection
{
  "_id": "ObjectId",
  "name": "High-value repeat buyers",
  "rules": [{ "field": "purchase_count", "op": ">", "value": 5 }],
  "customer_ids": ["uuid", "uuid"],
  "created_at": "ISODate"
}

// value_props collection
{
  "_id": "ObjectId",
  "segment_id": "ObjectId",
  "pains": ["too many disconnected tools"],
  "gains": ["single source of truth"],
  "jobs_to_be_done": ["run the business without chaos"],
  "features_mapped": ["unified dashboard", "event-driven sync"]
}
```

### 3.5 Cross-System Relational Map
```mermaid
erDiagram
    CUSTOMERS ||--o{ TRANSACTIONS : "buys via REV-X"
    CUSTOMERS ||--o{ SEGMENTS : "classified by SEG-X"
    CUSTOMERS ||--o{ TICKETS : "supported via CRM-X"
    ACTIVITIES ||--o{ EXPENSES : "consumes budget via COST-X"
    PARTNERS ||--o{ ACTIVITIES : "supports via PART-X"
    RESOURCES ||--o{ ACTIVITIES : "allocated to via RES-X"
```
> Note: this cross-system map is logical, not physical — the actual foreign keys live within each service's own database. Cross-service consistency is handled via the Event Bus, not shared-database joins (each microservice owns its data — a core rule to avoid tight coupling).

---

## 4. Deployment Plan

### 4.1 Environment Strategy
| Environment | Purpose | Infra |
|---|---|---|
| **Dev** | Local development | Docker Compose |
| **Staging** | Pre-prod QA, integration testing | Kubernetes (single cluster, namespace-isolated) |
| **Production** | Live traffic | Kubernetes (multi-zone, autoscaled) |

### 4.2 Docker Compose (Local Dev)
```yaml
version: "3.9"
services:
  api-gateway:
    image: kong:3.6
    ports: ["8000:8000", "8443:8443"]
    depends_on: [postgres, mongo, mysql]

  crm-x:
    build: ./services/crm-x
    environment:
      - DATABASE_URL=postgres://user:pass@postgres:5432/crmx
    depends_on: [postgres, kafka]

  seg-x:
    build: ./services/seg-x
    environment:
      - MONGO_URL=mongodb://mongo:27017/segx
    depends_on: [mongo, kafka]

  rev-x:
    build: ./services/rev-x
    environment:
      - DATABASE_URL=postgres://user:pass@postgres:5432/revx
      - REDIS_URL=redis://redis:6379
    depends_on: [postgres, redis, kafka]

  cost-x:
    build: ./services/cost-x
    environment:
      - DATABASE_URL=postgres://user:pass@postgres:5432/costx
    depends_on: [postgres, kafka]

  kafka:
    image: bitnami/kafka:3.7
    ports: ["9092:9092"]

  postgres:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=pass
    ports: ["5432:5432"]

  mongo:
    image: mongo:7
    ports: ["27017:27017"]

  mysql:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=pass
    ports: ["3306:3306"]

  redis:
    image: redis:7
    ports: ["6379:6379"]
```

### 4.3 Kubernetes (Production) — Example: REV-X Service
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rev-x
  namespace: primeos-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rev-x
  template:
    metadata:
      labels:
        app: rev-x
    spec:
      containers:
        - name: rev-x
          image: registry.primeos.app/rev-x:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef: { name: rev-x-secrets, key: db-url }
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: rev-x-hpa
  namespace: primeos-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: rev-x
  minReplicas: 3
  maxReplicas: 12
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 65 }
---
apiVersion: v1
kind: Service
metadata:
  name: rev-x-svc
  namespace: primeos-prod
spec:
  selector: { app: rev-x }
  ports:
    - port: 80
      targetPort: 3000
```
Repeat this Deployment/HPA/Service pattern per microservice, each with its own namespace-scoped secrets and independently tunable replica counts (CRM-X and Sales will typically need higher baseline replicas than PART-X or RES-X, which see lower traffic).

### 4.3 Cluster Topology
```mermaid
graph TB
    subgraph "Kubernetes Cluster (multi-zone)"
        subgraph "Namespace: gateway"
            ING[Ingress Controller]
            KONG[Kong Gateway]
        end
        subgraph "Namespace: core-services"
            SVC1[CRM-X pods x3]
            SVC2[REV-X pods x3-12 HPA]
            SVC3[COST-X pods x3]
            SVCN[... 6 more services]
        end
        subgraph "Namespace: data"
            PGOP[Postgres Operator/StatefulSet]
            MONGOOP[Mongo Operator]
            KAFKACL[Kafka Cluster]
        end
        subgraph "Namespace: observability"
            PROM[Prometheus]
            GRAF[Grafana]
            LOKI[Loki - logs]
        end
    end
    ING --> KONG --> SVC1 & SVC2 & SVC3 & SVCN
    SVC1 & SVC2 & SVC3 & SVCN --> PGOP & MONGOOP
    SVC1 & SVC2 & SVC3 & SVCN --> KAFKACL
    PROM --> SVC1 & SVC2 & SVC3 & SVCN
```

### 4.4 CI/CD Pipeline
```mermaid
graph LR
    A[Git Push] --> B[Lint + Unit Tests]
    B --> C[Build Docker Image]
    C --> D[Push to Registry]
    D --> E[Deploy to Staging]
    E --> F[Integration Tests]
    F --> G{Manual Approval}
    G -->|Approved| H[Deploy to Prod - Canary]
    H --> I[Full Rollout]
```
Recommended tooling: GitHub Actions or GitLab CI for the pipeline, Argo CD for GitOps-based Kubernetes deployment, and canary rollout via Kong's traffic-splitting to catch regressions before full release.

---

## 5. Auth & Security

- **Identity provider:** Keycloak (self-hosted) or Auth0, issuing OAuth2/OIDC tokens.
- **Single sign-on** across all 9 frontends + department dashboards via a shared token, validated at the API Gateway (services never re-implement auth).
- **Role-based access control (RBAC):** roles like `owner`, `finance_admin`, `sales_rep`, `marketing_manager` mapped to scopes per microservice endpoint.
- **Secrets management:** HashiCorp Vault or Kubernetes Secrets + sealed-secrets for GitOps-safe storage.
- **Data isolation:** multi-tenant architecture — every table/collection carries a `tenant_id` (or `company_id`), enforced at the ORM/query layer so one business owner's data is never visible to another's, even though they share infrastructure.

---

## 6. Suggested Build Order (Phased Rollout)

| Phase | Systems | Rationale |
|---|---|---|
| **1 — Foundation** | Auth, API Gateway, CRM-X, COST-X | Every other module depends on customer identity + cost visibility |
| **2 — Revenue Core** | REV-X, Sales Service | Ties directly to cash flow — proves value fastest |
| **3 — Growth** | SEG-X, CHAN-X, Marketing Service | Needs Phase 1-2 data to be useful |
| **4 — Operations** | ACT-X, RES-X, PART-X, Operations Service | Internal efficiency layer |
| **5 — Strategy** | VALUE-X, Analytics Warehouse, full Event Bus orchestration | Ties everything into the "master BMC dashboard" |

This order lets you ship a usable product (CRM + costs + revenue) well before the full nine-system architecture is complete — important for getting real business owners using it early rather than building for a year before first feedback.
