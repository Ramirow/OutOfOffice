# 🎉 Real Event API Integration Guide

Your app now supports **real event data** from multiple providers! Here's how to set it up:

## 🚀 Quick Start (5 minutes)

### Step 1: Get Free API Keys

**Eventbrite** (Recommended - Free & Easy)
1. Go to [eventbrite.com/platform/api-keys](https://www.eventbrite.com/platform/api-keys)
2. Create free account
3. Copy your **Private Token**

**Ticketmaster** (Free - Good for concerts/sports)
1. Go to [developer.ticketmaster.com](https://developer.ticketmaster.com/products-and-docs/apis/getting-started/)
2. Create account
3. Copy your **API Key**

### Step 2: Install Environment Variables

```bash
npm install react-native-dotenv
```

### Step 3: Create .env File

Create `.env` file in your project root:

```
EXPO_PUBLIC_EVENTBRITE_TOKEN=your_token_here
EXPO_PUBLIC_TICKETMASTER_API_KEY=your_key_here
```

### Step 4: Update babel.config.js

```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true
    }]
  ]
};
```

### Step 5: Restart Your App

```bash
npx expo start --clear
```

## ✨ What You Get

### With API Keys:
- ✅ **Real events** from Eventbrite and Ticketmaster
- ✅ **Live data** with real venues, times, prices
- ✅ **Actual event links** to buy tickets
- ✅ **Rich event details** including organizers
- ✅ **Search & filtering** across real events

### Without API Keys:
- ✅ **Enhanced mock events** (better than before)
- ✅ **Realistic sample data** for testing
- ✅ **All app features work** normally

## 📊 API Features Comparison

| Provider | Free Tier | Events | Best For | Rate Limit |
|----------|-----------|--------|----------|------------|
| **Eventbrite** | ✅ Yes | Conferences, workshops | Tech/Business events | 50/min |
| **Ticketmaster** | ✅ Yes | Concerts, sports | Entertainment | 5000/day |
| **Meetup** | ❌ Paid | Social meetups | Networking | Varies |
| **PredictHQ** | ✅ Limited | All types | Event intelligence | 1000/month |

## 🛠️ Advanced Configuration

### Custom Location
Edit `src/config/apiConfig.js`:
```javascript
export const DEFAULT_LOCATION = {
  city: 'San Francisco', // Your city
  state: 'CA',
  country: 'US',
  radius: '25mi'
};
```

### Category Mapping
Customize event categories in `apiConfig.js`:
```javascript
export const EVENT_CATEGORIES = {
  TECHNOLOGY: ['tech', 'AI', 'programming'],
  // Add your categories
};
```

## 🔧 Troubleshooting

### Events Not Loading?
1. Check your `.env` file syntax
2. Restart app with `--clear` flag
3. Verify API keys are correct
4. Check console for error messages

### API Rate Limits?
- App automatically falls back to mock data
- Implement caching for production use
- Consider multiple API providers

### Mock Data Still Showing?
- Verify environment variables are loaded
- Check API key format (no extra spaces)
- Ensure babel.config.js is updated

## 📱 Testing

### Debug API Status
The app shows API status in the events list:
- **🔴 LIVE** = Real API data
- **🟢 NEW** = Custom events
- No badge = Mock/fallback data

### Test Queries
Try searching for:
- "tech" - Technology events
- "music" - Concert events  
- "business" - Networking events

## 🚀 Production Tips

### Performance
```javascript
// Add caching
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let eventCache = { data: null, timestamp: 0 };

// Rate limiting
const API_DELAY = 1000; // 1 second between calls
```

### Error Handling
```javascript
// Retry failed requests
const maxRetries = 3;
const retryDelay = 2000;
```

### User Experience
- Show loading states
- Graceful fallbacks
- Offline mode support
- Location permissions

## 📈 Scaling Up

### Multiple APIs
- Combine Eventbrite + Ticketmaster for coverage
- Add Meetup for social events
- Use PredictHQ for event intelligence

### Features to Add
- **Geolocation**: Auto-detect user location
- **Caching**: Store events locally
- **Favorites**: Save preferred events
- **Notifications**: Event reminders
- **Social**: Share events with friends

## 💡 API Key Security

### Development
- Use `.env` files (never commit)
- Rotate keys regularly
- Monitor usage dashboards

### Production
- Use Expo Secrets for deployment
- Implement server-side API calls
- Add authentication layers

## 🎯 Next Steps

1. **Start with Eventbrite** (easiest setup)
2. **Add location detection** for local events
3. **Implement caching** for better performance
4. **Add more event providers** for variety
5. **Build recommendation system** based on user preferences

---

## ⚡ Live Demo

Your app now automatically:
- Fetches real events when API keys are configured
- Falls back to enhanced mock data otherwise
- Supports search, filtering, and categorization
- Shows API status with badges
- Handles errors gracefully

**Happy coding!** 🎉

---

*Need help? Check the console logs for detailed API status and error messages.* 