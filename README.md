# Moodify - Deployment Guide

This guide will walk you through deploying Moodify using EAS (Expo Application Services).

## Prerequisites

1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Install project dependencies:
```bash
npm install
```

## Configuration Steps

1. Initialize EAS in your project:
```bash
eas init
```

2. Create or update `eas.json` in your project root:
```json
{
  "cli": {
    "version": ">= 3.13.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Environment Setup

1. Create a `.env` file in your project root (if not exists):
```plaintext
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Update `app.config.js` or `app.json` with your app's information:
```json
{
  "expo": {
    "name": "Moodify",
    "slug": "moodify",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

## Deployment Steps

### 1. Build Preview Version (Testing)

```bash
# Build for Android (APK)
eas build -p android --profile preview

# Build for iOS (Simulator)
eas build -p ios --profile preview
```

### 2. Build Production Version

```bash
# Configure your project
eas configure

# Build for Android Production
eas build -p android --profile production

# Build for iOS Production
eas build -p ios --profile production
```

### 3. Submit to App Stores

1. **For Android (Google Play)**:
```bash
eas submit -p android
```

2. **For iOS (App Store)**:
```bash
eas submit -p ios
```

## Common Issues and Solutions

### Android Build Issues

1. **Gradle Build Failures**
   - Clean your project:
   ```bash
   cd android
   ./gradlew clean
   ```

2. **Version Code Issues**
   - Increment the version code in `app.json`:
   ```json
   {
     "expo": {
       "android": {
         "versionCode": 2
       }
     }
   }
   ```

### iOS Build Issues

1. **Provisioning Profile Issues**
   - Ensure you have the correct certificates:
   ```bash
   eas credentials
   ```

2. **Build Number Issues**
   - Increment the build number in `app.json`:
   ```json
   {
     "expo": {
       "ios": {
         "buildNumber": "2"
       }
     }
   }
   ```

## Testing Before Deployment

1. Test the preview build thoroughly:
```bash
# Install development client
eas build:run -p android
# or
eas build:run -p ios
```

2. Verify all features work:
   - User authentication
   - Mood tracking
   - Data persistence
   - Notifications
   - Theme changes
   - All navigation flows

## Post-Deployment

1. Monitor crash reports and analytics through your Expo dashboard

2. Keep your Supabase backend running and monitored

3. Set up monitoring for:
   - App performance
   - User engagement
   - Error rates
   - API response times

## Updating Your App

1. Make your code changes

2. Update version numbers in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    },
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

3. Build and submit new version:
```bash
eas build --auto-submit
```

## Support

For additional help:
- Expo Documentation: https://docs.expo.dev/
- EAS Documentation: https://docs.expo.dev/eas/
- Supabase Documentation: https://supabase.com/docs

## Security Checklist

Before deploying:
- [ ] Remove all console.log statements with sensitive information
- [ ] Ensure environment variables are properly set
- [ ] Check all API endpoints are secure
- [ ] Verify authentication flows
- [ ] Test data persistence
- [ ] Validate error handling
- [ ] Check performance on different devices
- [ ] Verify deep linking works correctly
- [ ] Test offline functionality
- [ ] Ensure proper data encryption

## Backup Procedures

1. Export your Supabase database
2. Backup all environment configurations
3. Store app signing keys securely
4. Document all custom configurations

Remember to keep your development and production environments separate and maintain proper version control throughout the deployment process.
