# Security Policy

## Overview

The Direct Booking Health Score is a static hotel technology audit tool. It contains no user accounts, no payment processing, and no personal data storage. This policy outlines the security practices relevant to this project.

---

## Supported Versions

| Version | Supported |
|---|---|
| Latest (main branch) | ✅ Yes |
| Any previous deployment | ❌ No — always update to latest |

---

## API Key Protection

The only sensitive asset in this project is the Google Gemini API key.

**Rules:**
- The API key must always be stored in a `.env` file in the project root
- The `.env` file is listed in `.gitignore` and must **never** be committed to GitHub
- The API key must never be hardcoded into any source file
- The API key must never be logged, printed, or exposed in the browser console
- If you suspect the API key has been exposed, regenerate it immediately at: https://aistudio.google.com

---

## GitHub Repository Access

- Only authorised Bookassist team members should have write access to this repository
- Access is managed via GitHub repository settings under **Settings > Collaborators**
- Review collaborator access regularly and remove anyone who no longer requires it
- All changes to the live website are made via commits to the `main` branch — only trusted contributors should have this access

---

## Dependency Security

This project uses npm packages. Vulnerabilities in dependencies should be checked regularly.

To check for known vulnerabilities, run:
```bash
npm audit
```

To automatically fix low-risk vulnerabilities:
```bash
npm audit fix
```

Keep dependencies up to date by reviewing and updating `package.json` periodically.

---

## Scope

The following are **in scope** for security concerns:

- Exposure of the Gemini API key
- Unauthorised write access to the GitHub repository
- Malicious code introduced via a compromised dependency
- Unintended data exposure via the Gemini API prompt

The following are **out of scope:**

- User data breaches (no user data is collected or stored)
- Payment security (no payment processing exists in this tool)
- Authentication vulnerabilities (no login system exists)

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, send a private email to:

**dpo@bookassist.com**

Please include:
- A description of the vulnerability
- Steps to reproduce it
- The potential impact
- Any suggested fixes if known

We will acknowledge your report within 5 business days and aim to resolve confirmed vulnerabilities as quickly as possible.

---

*This policy applies to the Direct Booking Health Score tool maintained by Bookassist.*
