# JOY BANGLA - Web and Mobile Deployment Guide

## Quick Start

This project supports both web and Android mobile deployments.

### What's Included
- **Web App**: Full-featured React + Express SPA, responsive for all devices
- **Android App**: Native Android APK built with Capacitor
- **Admin Features**: Built-in admin panel for management

---

## Web Deployment

### Netlify (Recommended)

1. **Connect GitHub Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select GitHub and authorize
   - Choose your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist/spa`
   - Base directory: (leave empty)

3. **Deploy**
   - Netlify will automatically build and deploy on push to main branch
   - Custom domain can be added in Site settings

### Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub

2. **Configure**
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist/spa`

3. **Deploy**
   - Click "Deploy"
   - Vercel handles everything automatically

### Environment Variables for Web
Set these in your hosting platform:
- `VITE_API_URL`: API endpoint (if using separate API)
- Other custom variables as needed

---

## Android Mobile Deployment

### Prerequisites
- Java Development Kit (JDK) 11+
- Android SDK
- Android Studio (optional but recommended)
- Capacitor CLI: `npm install -g @capacitor/cli`

### Local APK Build

1. **Build Web Assets**
   ```bash
   npm run build
   ```

2. **Initialize Capacitor** (if first time)
   ```bash
   npx cap init
   ```

3. **Add Android Platform** (if first time)
   ```bash
   npx cap add android
   ```

4. **Sync and Build**
   ```bash
   npm run apk:build
   ```

5. **Output Location**
   - Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release APK: `android/app/build/outputs/apk/release/app-release.apk`

### Automated Release via GitHub Actions

1. **Create Release Key**
   ```bash
   keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release
   ```

2. **Add GitHub Secrets**
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `KEYSTORE_BASE64`: `base64 -i release.jks | tr -d '\n'` output
     - `KEYSTORE_PASSWORD`: Your password
     - `KEY_ALIAS`: release
     - `KEY_PASSWORD`: Your password

3. **Create Release Tag**
   ```bash
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0
   ```

4. **Monitor Build**
   - Go to Actions tab in GitHub
   - Watch the build progress
   - APK will be available in Releases when complete

### Distribute APK

**For Users**
- Download APK from GitHub Releases
- On Android: Settings → Security → Allow Unknown Sources
- Install APK file

**For Google Play Store**
- Create Google Play Developer account ($25 one-time)
- Build signed APK using release key
- Upload AAB (Android App Bundle) to Play Console
- Complete app listing and submit for review

---

## Project Structure

```
joy-bangla/
├── client/              # React frontend
│   ├── pages/          # Page components
│   ├── components/     # UI components
│   ├── lib/            # Utilities
│   └── App.tsx         # Main app
├── server/             # Express backend
├── public/             # Static assets
├── index.html          # Entry point
├── vite.config.ts      # Vite configuration
├── capacitor.config.ts # Mobile app config
├── package.json        # Dependencies
└── .github/
    └── workflows/      # GitHub Actions
```

---

## Configuration

### App Branding
Edit `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.joybangla.app',
  appName: 'Joy Bangla',
  // ... other config
};
```

### Theme Colors
- Primary Blue: `#006bb6` (Bangladesh flag)
- Secondary Red: `#ce1126`
- Update in component styles as needed

### Version Updates
Update version in:
1. `capacitor.config.ts`
2. `android/app/build.gradle` (versionCode, versionName)
3. `package.json`

---

## Environment Setup

### Development
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type checking
npm run typecheck

# Format code
npm run format.fix
```

### Production Build
```bash
# Build for web
npm run build

# Build APK
npm run apk:build

# Both platforms
npm run build && npm run cap:sync
```

---

## Monitoring and Updates

### Web Updates
- Automatic deployment on push to main
- Check Netlify/Vercel dashboard for build status
- Rollback available in hosting dashboard

### Mobile Updates
- Users must download and install new APK
- Consider using Capacitor app version management
- Update version before creating release tag

---

## Support Resources

- **Capacitor Docs**: https://capacitorjs.com
- **Android Docs**: https://developer.android.com
- **GitHub Actions**: https://docs.github.com/actions
- **Netlify Docs**: https://docs.netlify.com
- **Vercel Docs**: https://vercel.com/docs

---

## Troubleshooting

### Web Deployment Issues
- Clear Netlify/Vercel cache and redeploy
- Check build logs for errors
- Verify environment variables are set

### APK Build Issues
- Run `npm install` to ensure dependencies
- Clear gradle cache: `cd android && ./gradlew clean`
- Update Android SDK: `sdkmanager --update`
- Check Java version: `java -version` (should be 11+)

### APK Installation Issues
- Enable "Unknown Sources" in device settings
- Uninstall previous version first
- Check device has Android API 21+ (most phones do)
- Try connecting to computer with ADB

### GitHub Actions Failures
- Check workflow logs in Actions tab
- Verify secrets are correctly set
- Ensure Java and Android SDK are available
- Check gradle build files for syntax errors

---

## Security

- Never commit `.jks` files or signing keys
- Use GitHub Secrets for sensitive credentials
- Regularly update dependencies: `npm outdated`
- Review code before deploying to production

---

## Next Steps

1. Set up web hosting (Netlify/Vercel)
2. Test web deployment
3. Build and test APK locally
4. Set up GitHub release key
5. Add GitHub Secrets
6. Tag a release to trigger automated build
7. Download and test APK on device
8. Share APK link or submit to Play Store
