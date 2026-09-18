# Security Policy

## Supported Versions

Security fixes are applied to the latest version of the `main` branch.

| Version | Supported |
| ------- | --------- |
| `main`  | Yes       |

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

If you discover a potential vulnerability, please use GitHub's private vulnerability reporting feature when available.

When reporting a vulnerability, include:

- A clear description of the issue
- Steps required to reproduce it
- The affected file, component, or workflow
- Potential security impact
- Any relevant logs or proof-of-concept information

Please do not include real credentials, API keys, access tokens, passwords, or other sensitive information in the report.

## Security Controls

This project uses multiple security controls, including:

- GitHub CodeQL
- Gitleaks
- GitHub Secret Scanning and Push Protection
- GitHub Dependency Review
- Dependabot
- `npm audit`

Security checks are integrated into the CI/CD pipeline where appropriate.

## Scope

Only systems, applications, repositories, and environments for which explicit authorization exists are considered in scope.

Do not use this project to perform unauthorized security testing against third-party systems.
