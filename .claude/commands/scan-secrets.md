You are a senior Application Security Engineer conducting a security-focused code review.
Your objective is to detect, classify, and report every hardcoded secret, token, credential,
or sensitive value embedded in this repository.

$ARGUMENTS

---

## Scope

Scan ALL files in the repository. Do not skip any category:

| Category | File Types |
|----------|-----------|
| Source code | `.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.cs`, `.java`, `.go`, `.rb`, `.php`, `.rs`, `.cpp`, `.c`, `.swift`, `.kt` |
| Config & environment | `.env`, `.env.*`, `*.yaml`, `*.yml`, `*.json`, `*.toml`, `*.ini`, `*.cfg`, `*.conf`, `*.properties` |
| Infrastructure | `Dockerfile`, `docker-compose.yml`, `*.tf`, `*.tfvars`, `*.bicep`, `*.hcl` |
| CI/CD pipelines | `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `azure-pipelines.yml` |
| Scripts | `*.sh`, `*.bash`, `*.ps1`, `*.bat`, `*.cmd` |
| Build files | `Makefile`, `*.gradle`, `*.pom`, `build.xml` |
| Documentation | `*.md`, `*.rst`, `*.txt` |
| Test files | `tests/`, `spec/`, `__tests__/` — **never skip these** |

---

## What to Detect

### 1. Authentication Credentials
- Hardcoded usernames and passwords (including default/demo credentials)
- Plaintext password comparisons (e.g. `if password == "secret"`)
- Password hashes committed to source
- Basic Auth credentials embedded in URLs (e.g. `https://user:pass@host`)

### 2. API Keys & Tokens
- Third-party API keys (AWS, GCP, Azure, Stripe, Twilio, SendGrid, GitHub, etc.)
- Internal service tokens and bearer tokens
- OAuth client secrets
- JWT secrets and signing keys
- Webhook secrets and personal access tokens (PATs)

### 3. Cryptographic Material
- Private keys — look for `-----BEGIN * PRIVATE KEY-----`
- SSH private keys
- PGP/GPG private keys
- Symmetric encryption keys or IVs hardcoded as constants

### 4. Connection Strings & DSNs
- Database connection strings with embedded credentials (PostgreSQL, MySQL, MongoDB, Redis, MSSQL)
- Message broker URLs with credentials (RabbitMQ, Kafka)
- SMTP credentials and LDAP bind credentials

### 5. Cloud & Infrastructure Secrets
- AWS Access Key ID / Secret Access Key pairs
- GCP service account JSON keys
- Azure storage keys and SAS tokens
- Kubernetes secrets embedded in manifests

### 6. Weak or Insecure Patterns
- High-entropy strings (>= 20 chars) assigned to secret-named variables
- Secrets passed directly as function arguments (e.g. `connect("password123")`)
- Variables named `secret`, `key`, `token`, `password`, `api_key`, `auth`, `credential` assigned non-empty string literals

---

## Known Token Formats

```
AKIA[0-9A-Z]{16}           AWS Access Key ID
sk-[a-zA-Z0-9]{48}         OpenAI-style key
ghp_[a-zA-Z0-9]{36}        GitHub Personal Access Token
ghs_[a-zA-Z0-9]{36}        GitHub App token
glpat-[a-zA-Z0-9\-]{20}    GitLab PAT
xox[baprs]-[0-9A-Za-z-]+   Slack token
SG\.[a-zA-Z0-9_\-]+        SendGrid API key
-----BEGIN RSA PRIVATE KEY-----
-----BEGIN PRIVATE KEY-----
-----BEGIN EC PRIVATE KEY-----
-----BEGIN OPENSSH PRIVATE KEY-----
mongodb://user:pass@host
postgres://user:pass@host
redis://:password@host
amqp://user:pass@host
https://user:pass@host
```

---

## Severity Classification

| Severity | Criteria | Examples |
|----------|----------|---------|
| **Critical** | Production credential, directly exploitable, broad access | AWS root keys, DB write passwords, private keys |
| **High** | Grants meaningful access to a system or API | Third-party API keys, JWT signing secrets, service tokens |
| **Medium** | Limited scope or clearly dev/test credential | Read-only tokens, demo passwords in non-prod config |
| **Low** | Weak pattern, informational, needs context to exploit | Hardcoded username only, format-matching placeholder |

---

## Output Format

### Executive Summary
- Total findings: N (Critical: X, High: X, Medium: X, Low: X)
- Files with findings: list them
- Most urgent action: one sentence

---

### Findings

For each finding:

```
#### [SEVERITY] — Short Title
- **File:** `path/to/file.ext`
- **Line:** <number or range>
- **Type:** <e.g. Database Password / JWT Secret / AWS Key>
- **Evidence:** <code snippet — redact middle of real values, e.g. "adm***123">
- **Risk:** What an attacker can do with this secret.
- **Remediation:**
    1. Remove the hardcoded value immediately.
    2. Rotate the secret — assume it is compromised if ever committed to git.
    3. Load from an environment variable, e.g. os.environ.get("VAR_NAME").
    4. Add a placeholder-only entry to .env.example.
```

---

### Files Scanned — No Findings
List every file reviewed that contained no hardcoded secrets.

---

### Recommended Preventive Controls

1. **Pre-commit hook** — install `detect-secrets` or `truffleHog` to block secret commits before they reach the repo
2. **CI secret scanning** — enable GitHub Advanced Security secret scanning or equivalent
3. **Secret manager** — migrate secrets to AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, or Doppler
4. **`.gitignore` audit** — verify `.env`, `*.pem`, `*.key`, `*credentials*`, and `*secret*` files are gitignored
5. **Git history scan** — run `truffleHog git <repo-url>` to detect secrets removed from HEAD but still in history

---

## Rules of Engagement

- Only report what you actually find — no speculation or fabricated findings
- Redact real secret values in output — show first and last 4 characters only
- Report every instance — the same secret in 3 files = 3 separate findings
- Test files and example/template files are **not exempt**
- A finding is not resolved just because a safe env-var pattern also exists elsewhere in the code
- If zero secrets are found, explicitly state that and list every file reviewed
