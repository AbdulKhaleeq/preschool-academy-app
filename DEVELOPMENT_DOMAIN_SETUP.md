# Development Domain Setup for Better OTP Messages

## Quick Setup (Recommended)

1. **Add to your hosts file**:
   ```bash
   sudo nano /etc/hosts
   ```
   
   Add this line:
   ```
   127.0.0.1 preschool.local
   ```

2. **Add to Firebase Authorized Domains**:
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Click "Add domain"
   - Add: `preschool.local`

3. **Access your app via**:
   ```
   http://preschool.local:3000
   ```

## Result
Your OTP messages will now show:
```
"342314 is your verification code for preschool.local"
```

This looks much more professional!

## Alternative Domains You Could Use
- `preschool.dev`
- `academy.local`
- `wellington.dev`
- `myapp.local`

## For Production
When you deploy to production, the OTP messages will automatically show your production domain name.