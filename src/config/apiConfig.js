// API Configuration for Real Event Providers
// Follow the setup instructions below to integrate with real APIs

export const API_CONFIG = {
  // Eventbrite API (Recommended)
  EVENTBRITE: {
    BASE_URL: 'https://www.eventbriteapi.com/v3',
    // Get your token from: https://www.eventbrite.com/platform/api-keys
    TOKEN: process.env.EXPO_PUBLIC_EVENTBRITE_TOKEN || 'YOUR_EVENTBRITE_TOKEN_HERE',
    ENDPOINTS: {
      SEARCH_EVENTS: '/events/search',
      EVENT_DETAILS: '/events/:id',
      CATEGORIES: '/categories'
    }
  },

  // Ticketmaster Discovery API
  TICKETMASTER: {
    BASE_URL: 'https://app.ticketmaster.com/discovery/v2',
    // Get your API key from: https://developer.ticketmaster.com/products-and-docs/apis/getting-started/
    API_KEY: process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY || 'YOUR_TICKETMASTER_KEY_HERE',
    ENDPOINTS: {
      SEARCH_EVENTS: '/events.json',
      EVENT_DETAILS: '/events/:id.json',
      VENUES: '/venues.json'
    }
  },

  // Meetup API (Requires subscription)
  MEETUP: {
    BASE_URL: 'https://api.meetup.com',
    // Get your access token from: https://www.meetup.com/api/oauth/
    ACCESS_TOKEN: process.env.EXPO_PUBLIC_MEETUP_TOKEN || 'YOUR_MEETUP_TOKEN_HERE',
    ENDPOINTS: {
      FIND_EVENTS: '/find/events',
      EVENT_DETAILS: '/events/:id',
      GROUPS: '/find/groups'
    }
  },

  // PredictHQ Events API
  PREDICTHQ: {
    BASE_URL: 'https://api.predicthq.com/v1',
    // Get your token from: https://www.predicthq.com/api
    ACCESS_TOKEN: process.env.EXPO_PUBLIC_PREDICTHQ_TOKEN || 'YOUR_PREDICTHQ_TOKEN_HERE',
    ENDPOINTS: {
      EVENTS: '/events',
      CATEGORIES: '/events/categories'
    }
  }
};

// Default location settings
// Change this to your preferred default location
export const DEFAULT_LOCATION = {
  city: 'New York', // Default city for event searches (change to your city)
  state: 'NY',
  country: 'US',
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060
  },
  radius: '25mi' // Search radius
};

// Event categories mapping
export const EVENT_CATEGORIES = {
  TECHNOLOGY: ['technology', 'programming', 'coding', 'AI', 'machine learning'],
  BUSINESS: ['business', 'networking', 'entrepreneurship', 'startup', 'marketing'],
  ARTS: ['arts', 'music', 'theater', 'photography', 'design'],
  SPORTS: ['sports', 'fitness', 'running', 'yoga', 'cycling'],
  SOCIAL: ['social', 'meetup', 'party', 'dining', 'wine'],
  OUTDOOR: ['outdoor', 'hiking', 'adventure', 'nature', 'camping']
};

/*
🚀 SETUP INSTRUCTIONS:

1. EVENTBRITE API (FREE - Recommended)
   - Go to: https://www.eventbrite.com/platform/api-keys
   - Create an account and get your Private Token
   - Add to your .env file: EXPO_PUBLIC_EVENTBRITE_TOKEN=your_token_here
   - Rate limit: 50 requests per minute

2. TICKETMASTER API (FREE)
   - Go to: https://developer.ticketmaster.com/products-and-docs/apis/getting-started/
   - Create an account and get your API Key
   - Add to your .env file: EXPO_PUBLIC_TICKETMASTER_API_KEY=your_key_here
   - Rate limit: 5000 requests per day

3. MEETUP API (PAID)
   - Go to: https://www.meetup.com/api/
   - Subscribe to a plan ($2/month minimum)
   - Get your OAuth token
   - Add to your .env file: EXPO_PUBLIC_MEETUP_TOKEN=your_token_here

4. PREDICTHQ API (FREE TIER)
   - Go to: https://www.predicthq.com/api
   - Create an account and get your Access Token
   - Add to your .env file: EXPO_PUBLIC_PREDICTHQ_TOKEN=your_token_here
   - Rate limit: 1000 requests per month

📁 CREATE .env FILE:
Create a file called `.env` in your project root with:

EXPO_PUBLIC_EVENTBRITE_TOKEN=your_eventbrite_token_here
EXPO_PUBLIC_TICKETMASTER_API_KEY=your_ticketmaster_key_here
EXPO_PUBLIC_MEETUP_TOKEN=your_meetup_token_here
EXPO_PUBLIC_PREDICTHQ_TOKEN=your_predicthq_token_here

🔧 INSTALL ENVIRONMENT VARIABLES:
npm install react-native-dotenv

Then add to your babel.config.js:
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

💡 TIPS:
- Start with Eventbrite (free and reliable)
- Use Ticketmaster for concerts/sports
- Combine multiple APIs for better coverage
- Always implement fallback data
- Add proper error handling
- Cache responses to reduce API calls
*/

export default API_CONFIG; 