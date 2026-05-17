# 🚀 Calotes Vintage Deployment Checklist

Follow this checklist to successfully deploy the platform to Vercel and ensure everything works in production.

## 1. Pre-Deployment Preparation
- [ ] **Database**: Ensure MongoDB Atlas allows access from all IPs (`0.0.0.0/0`) since Vercel IPs change dynamically.
- [ ] **Payments**: Move Razorpay from Test Mode to Live Mode and get Live API keys.
- [ ] **OAuth**: Update Google Cloud OAuth consent screen with production domain (`https://calotesvintage.com`).
- [ ] **OAuth**: Add `https://calotesvintage.com/api/auth/callback/google` to authorized redirect URIs in Google Cloud Console.

## 2. Vercel Configuration
- [ ] Connect your GitHub repository to Vercel.
- [ ] Ensure the framework preset is set to **Next.js**.
- [ ] Add the following Environment Variables in Vercel Settings BEFORE the first build:
  ```env
  MONGODB_URI=...
  NEXTAUTH_SECRET=... (Generate a strong random string)
  NEXTAUTH_URL=https://calotesvintage.com
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  RAZORPAY_KEY_ID=...
  RAZORPAY_KEY_SECRET=...
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
  RESEND_API_KEY=...
  ```

## 3. Domain Setup
- [ ] In Vercel Project Settings > Domains, add `calotesvintage.com` and `www.calotesvintage.com`.
- [ ] Update your domain registrar (GoDaddy, Namecheap, etc.) DNS settings to point to Vercel (using the provided A Record or Nameservers).

## 4. Post-Deployment Testing (The Final Check)
- [ ] **Authentication**: Log in with Google and ensure sessions persist across page reloads.
- [ ] **Browsing**: Test filters, sorting, and infinite scroll/pagination on the Shop page.
- [ ] **Cart**: Add items to the cart, ensure the count updates, and the drawer opens correctly.
- [ ] **Checkout**: Complete a test purchase (if Razorpay is in test mode) or a ₹1 real transaction (if live).
- [ ] **Emails**: Verify that the Welcome and Order Confirmation emails are received (check spam).
- [ ] **Admin Dashboard**: Log in as an admin and ensure you can update order statuses.

## 5. SEO & Monitoring
- [ ] Verify `https://calotesvintage.com/sitemap.xml` generates correctly.
- [ ] Verify `https://calotesvintage.com/robots.txt` generates correctly.
- [ ] Submit the sitemap to Google Search Console.
- [ ] (Optional) Set up Vercel Web Analytics to track visitors.
