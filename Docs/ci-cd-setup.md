# 🚀 CI/CD Setup Guide

This document explains how to set up the CI/CD pipeline for TrustFundMe-FE project.

---

## 📋 Overview

Our CI/CD pipeline consists of two workflows:

1. **CI (Continuous Integration)** - Runs on every push and PR
   - Linting with ESLint
   - Type checking with TypeScript
   - Building the application
   
2. **CD (Continuous Deployment)** - Runs after CI passes on `main` branch
   - Deploys to Vercel production environment

---

## 🔐 Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### How to Add Secrets:

1. Go to: https://github.com/TrustFundMe/TrustFundMe-FE/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each of the following secrets:

### Secret 1: VERCEL_TOKEN

**Value:** `f6rfI14eJCkVgqBsapA0TOQn`

**How to get it:**
- Already provided above
- Or create new one at: https://vercel.com/account/tokens
- Scope: **Full Access** or **Deploy**

---

### Secret 2: VERCEL_ORG_ID

**Value:** `team_imnDUtX5fnbg9dwdqgN3TeAt`

**How to get it:**
- Already provided above (Team ID)
- Or find it in Vercel Team Settings: https://vercel.com/trustfundme/settings

---

### Secret 3: VERCEL_PROJECT_ID

**Value:** `prj_8zBwZQXA6FbYEq7ITJLM36I4RxU8`

**How to get it:**
- Already provided above
- Or find it in Project Settings: https://vercel.com/trustfundme/trustfundme-fe/settings

---

## ✅ Setup Checklist

- [ ] Add `VERCEL_TOKEN` to GitHub Secrets
- [ ] Add `VERCEL_ORG_ID` to GitHub Secrets  
- [ ] Add `VERCEL_PROJECT_ID` to GitHub Secrets
- [ ] Install dependencies: `npm install`
- [ ] Test lint: `npm run lint`
- [ ] Test type-check: `npm run type-check`
- [ ] Test build: `npm run build`
- [ ] Commit and push to trigger CI/CD

---

## 🔄 Workflow Details

### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- On push to `main` or `master` branches
- On pull requests

**Jobs:**
1. **Lint & Type Check**
   - Install dependencies
   - Run ESLint
   - Run TypeScript type checking

2. **Build Application**
   - Install dependencies
   - Build with Next.js
   - Upload build artifacts

---

### CD Workflow (`.github/workflows/cd.yml`)

**Triggers:**
- On push to `main` branch
- After CI workflow completes successfully

**Jobs:**
1. **Deploy to Vercel**
   - Pull Vercel environment info
   - Build project with Vercel CLI
   - Deploy to production
   - Comment deployment URL (on PRs)

**Environment:**
- Name: `production`
- URL: https://trustfundme.vercel.app

---

## 🧪 Testing the Pipeline

### 1. Test Locally First

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build application
npm run build
```

### 2. Commit and Push

```bash
# Stage your changes
git add .

# Commit with proper message
git commit -m "Chore: setup CI/CD pipeline with Vercel integration"

# Push to main branch
git push origin main
```

### 3. Monitor Workflows

1. Go to: https://github.com/TrustFundMe/TrustFundMe-FE/actions
2. Watch the **CI** workflow run first
3. If CI passes, **CD** workflow will trigger automatically
4. Check deployment at: https://trustfundme.vercel.app

---

## 🚨 Troubleshooting

### CI Workflow Fails

**Problem:** Linting errors
```bash
# Fix automatically
npm run lint:fix

# Or fix manually based on error messages
```

**Problem:** Type errors
```bash
# Check errors
npm run type-check

# Fix TypeScript errors in the code
```

**Problem:** Build fails
```bash
# Test build locally
npm run build

# Check error logs and fix issues
```

---

### CD Workflow Fails

**Problem:** Missing secrets
- **Error:** `Error: No value found for VERCEL_TOKEN`
- **Solution:** Add all 3 secrets to GitHub (see above)

**Problem:** Vercel authentication failed
- **Error:** `Error: Authentication failed`
- **Solution:** Check if token is valid and has correct permissions

**Problem:** Vercel project not found
- **Error:** `Error: Project not found`
- **Solution:** Verify `VERCEL_PROJECT_ID` is correct

**Problem:** Deployment timeout
- **Error:** `Error: Build exceeded maximum duration`
- **Solution:** Check Vercel plan limits and optimize build

---

## 📊 Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Developer pushes code to main branch                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: CI Workflow                            │
├─────────────────────────────────────────────────────────┤
│  1. Checkout code                                       │
│  2. Setup Node.js                                       │
│  3. Install dependencies                                │
│  4. Run ESLint                                          │
│  5. Run Type Check                                      │
│  6. Build application                                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
                 ┌────────┐
                 │ Passed? │
                 └───┬────┘
                     │ Yes
                     ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: CD Workflow                            │
├─────────────────────────────────────────────────────────┤
│  1. Checkout code                                       │
│  2. Setup Node.js                                       │
│  3. Install Vercel CLI                                  │
│  4. Pull Vercel environment                             │
│  5. Build with Vercel                                   │
│  6. Deploy to production                                │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  🎉 Live on https://trustfundme.vercel.app              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Store all sensitive tokens in GitHub Secrets
- Use `httpOnly` cookies for JWT tokens
- Enable Vercel security headers (already configured)
- Review deployment logs for sensitive data exposure
- Rotate tokens periodically

❌ **DON'T:**
- Commit tokens or secrets to the repository
- Share tokens in chat or documentation
- Use same token across multiple projects
- Disable security checks in CI

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel GitHub Integration](https://vercel.com/docs/deployments/git/vercel-for-github)

---

## 🆘 Need Help?

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Verify all secrets are added correctly
3. Test locally before pushing
4. Check Vercel dashboard for deployment status
5. Review this guide's troubleshooting section

---

**Last Updated:** 2026-01-09  
**Maintained by:** TrustFundMe Team
