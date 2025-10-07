# Vercel Deployment Guide

This guide explains how to deploy Stella AI to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com)
2. A GitHub account with the repository connected to Vercel
3. A Groq API key (get one at https://console.groq.com)

## Deployment Steps

### 1. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository or connect your GitHub account if not already connected
4. Select the repository for Stella AI

### 2. Configure Project Settings

During the import process, Vercel should automatically detect the Next.js framework and set the following:

- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

These settings are already configured in your `vercel.json` file.

### 3. Set Environment Variables

In the Vercel project settings, add the following environment variable:

1. Go to your project in the Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add the following variable:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your actual Groq API key from https://console.groq.com

### 4. Deploy

1. Click "Deploy" to start the deployment process
2. Vercel will automatically build and deploy your application
3. Once deployment is complete, you'll receive a URL for your live application

## Environment Variables

The following environment variables are required:

- `GROQ_API_KEY`: Your Groq API key for AI model access

## Custom Domain (Optional)

To use a custom domain:

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions provided by Vercel

## Monitoring and Logs

Vercel provides built-in monitoring and logging:

1. Visit your project dashboard
2. Click "Analytics" for performance metrics
3. Click "Logs" for deployment and runtime logs

## Redeployment

Vercel automatically redeploys when you push changes to your connected Git repository:

1. Push changes to your GitHub repository
2. Vercel detects the changes and starts a new deployment
3. Monitor the deployment progress in your Vercel dashboard

## Troubleshooting

### Build Issues
- Check the build logs in the Vercel dashboard
- Ensure all dependencies are correctly listed in package.json
- Verify environment variables are set correctly

### Runtime Issues
- Check the runtime logs in the Vercel dashboard
- Ensure the GROQ_API_KEY is correctly set
- Verify the application works locally before deploying

### Performance Issues
- Check the analytics in the Vercel dashboard
- Optimize images and static assets
- Consider using Vercel's Edge Network for global distribution

## Scaling

Vercel automatically scales your application based on traffic. For most use cases, the default settings are sufficient.

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/nextjs)
- [Environment Variables in Vercel](https://vercel.com/docs/environment-variables)

This deployment setup ensures that Stella AI runs smoothly on Vercel with proper environment configuration and automatic scaling.