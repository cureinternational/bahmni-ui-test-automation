# CATO Client Setup for GitHub Actions

## Overview

CATO (Cato Networks) is a secure remote access client that allows GitHub Actions runners to securely connect to the QA environment.

## Prerequisites

- CATO account credentials
- Access to CATO management portal
- GitHub repository with secrets configured

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository (**Settings → Secrets and variables → Actions**):

| Secret Name | Description | Source |
|-------------|-------------|--------|
| `CATO_USERNAME` | CATO account username | CATO admin portal |
| `CATO_PASSWORD` | CATO account password | CATO admin portal |
| `CATO_API_KEY` | (Optional) CATO API key | CATO admin portal |

**⚠️ IMPORTANT:** Never commit these credentials to the repository. Always use GitHub Secrets.

## Workflow Configuration

The GitHub Actions workflow (`.github/workflows/playwright-tests.yml`) includes:

1. **Download CATO Client** - Downloads RPM package for Linux
2. **Configure and Connect CATO** - Authenticates and establishes tunnel
3. **Verify Connection** - Tests CATO status and QA connectivity
4. **Run Tests** - Executes tests through CATO tunnel

## CATO Connection Flow

```
GitHub Actions Runner
        ↓
   CATO Client (authenticated)
        ↓
   CATO Network
        ↓
   QA Environment (Bahmni instance)
```

## Troubleshooting

### CATO Connection Fails
- Check `CATO_USERNAME` and `CATO_PASSWORD` are correct in GitHub Secrets
- Verify credentials have QA access in CATO portal
- Check workflow logs for specific error messages

### Tests Cannot Reach QA URL
- Run verification step to confirm CATO status
- Ensure `BASE_URL` in secrets points to correct QA instance
- Check network policies allow GitHub Actions to CATO network

### Client Installation Issues (Ubuntu/Linux)
- RPM package requires `rpm` package manager on Linux
- For alternative distributions, use DEB package
- Check system permissions for package installation

## Alternative: Using CATO Certificate

If using certificate-based authentication instead of username/password:

1. Download CATO certificate from admin portal
2. Add to GitHub Secrets as `CATO_CERTIFICATE` (base64 encoded)
3. Update workflow to use certificate authentication

## Local Testing with CATO

To test locally:

```bash
# Download CATO client for your OS
# https://clientdownload.catonetworks.com/

# Install and start CATO client
# Login with credentials
cato-cli login --username <username> --password <password>

# Connect to network
cato-cli connect

# Run tests
npm run test:et
```

## Maintenance

- Rotate CATO credentials periodically
- Monitor CATO connection status in workflow logs
- Update CATO client version in workflow if needed
- Test CATO connectivity after network/infrastructure changes
