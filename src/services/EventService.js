// EventService.js - Service for fetching real events from external APIs
import { API_CONFIG, DEFAULT_LOCATION } from '../config/apiConfig';

class EventService {
  // Check if we have valid API configuration
  static hasValidAPIConfig() {
    return (
      API_CONFIG.EVENTBRITE.TOKEN !== 'YOUR_EVENTBRITE_TOKEN_HERE' ||
      API_CONFIG.TICKETMASTER.API_KEY !== 'YOUR_TICKETMASTER_KEY_HERE'
    );
  }

  // Fetch events from multiple sources
  static async fetchEvents(location = DEFAULT_LOCATION.city, category = '') {
    try {
      console.log('Fetching events for:', location, category);
      
      if (this.hasValidAPIConfig()) {
        // Try to fetch from real APIs
        const events = await this.fetchFromAPIs(location, category);
        if (events.length > 0) {
          return events;
        }
      }
      
      // Fallback to enhanced mock events
      console.log('Using mock events (no API keys configured)');
      return this.getEnhancedMockEvents(location, category);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Always fallback to mock events on error
      return this.getEnhancedMockEvents(location, category);
    }
  }

  // Fetch from real APIs (when configured)
  static async fetchFromAPIs(location, category) {
    const events = [];
    
    try {
      // Try Eventbrite API
      if (API_CONFIG.EVENTBRITE.TOKEN !== 'YOUR_EVENTBRITE_TOKEN_HERE') {
        const eventbriteEvents = await this.fetchFromEventbrite(location, category);
        events.push(...eventbriteEvents);
      }

      // Try Ticketmaster API
      if (API_CONFIG.TICKETMASTER.API_KEY !== 'YOUR_TICKETMASTER_KEY_HERE') {
        const ticketmasterEvents = await this.fetchFromTicketmaster(location, category);
        events.push(...ticketmasterEvents);
      }

      return events;
    } catch (error) {
      console.error('API fetch error:', error);
      return [];
    }
  }

  // Fetch from Eventbrite API
  static async fetchFromEventbrite(location, category) {
    try {
      const url = `${API_CONFIG.EVENTBRITE.BASE_URL}/events/search/`;
      const params = new URLSearchParams({
        'location.address': location,
        'expand': 'venue,organizer,ticket_availability',
        'sort_by': 'date',
        'page_size': '20'
      });

      if (category && category !== 'All') {
        // Map category to Eventbrite category IDs
        const categoryMap = {
          'Technology': '102',
          'Business': '101',
          'Arts': '105',
          'Sports': '108',
          'Social': '103'
        };
        if (categoryMap[category]) {
          params.append('categories', categoryMap[category]);
        }
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.EVENTBRITE.TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Eventbrite API error: ${response.status}`);
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Eventbrite fetch error:', error);
      return [];
    }
  }

  // Fetch from Ticketmaster API
  static async fetchFromTicketmaster(location, category) {
    try {
      const url = `${API_CONFIG.TICKETMASTER.BASE_URL}/events.json`;
      const params = new URLSearchParams({
        'apikey': API_CONFIG.TICKETMASTER.API_KEY,
        'city': location,
        'size': '20',
        'sort': 'date,asc'
      });

      if (category && category !== 'All') {
        // Map category to Ticketmaster classification
        const categoryMap = {
          'Arts': 'Arts & Theatre',
          'Sports': 'Sports',
          'Technology': 'Miscellaneous'
        };
        if (categoryMap[category]) {
          params.append('classificationName', categoryMap[category]);
        }
      }

      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        throw new Error(`Ticketmaster API error: ${response.status}`);
      }

      const data = await response.json();
      return data._embedded?.events || [];
    } catch (error) {
      console.error('Ticketmaster fetch error:', error);
      return [];
    }
  }

  // Enhanced mock events with more variety and realistic data
  static getEnhancedMockEvents(location, category) {
    const baseEvents = [
      {
        id: 'mock_tech_1',
        name: 'AI & Machine Learning Symposium 2024',
        description: 'Join leading experts in AI and ML for a day of cutting-edge presentations, workshops, and networking. Learn about the latest developments in neural networks, computer vision, and natural language processing.',
        start: {
          local: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          timezone: 'America/New_York'
        },
        venue: {
          name: 'Tech Conference Center',
          address: {
            address_1: '100 Innovation Drive',
            city: location || 'New York',
            region: 'NY',
            postal_code: '10001'
          }
        },
        ticket_availability: {
          has_available_tickets: true,
          minimum_ticket_price: { currency: 'USD', value: 12500, display: '$125.00' }
        },
        category: 'Technology',
        subcategory: 'AI/ML',
        logo: { url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop' },
        organizer: { name: 'Tech Innovation Group' }
      },
      {
        id: 'mock_business_1',
        name: 'Startup Founder Meetup',
        description: 'Connect with fellow entrepreneurs, share experiences, and learn from successful founders. Includes pitch sessions, investor meetings, and networking opportunities.',
        start: {
          local: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          timezone: 'America/New_York'
        },
        venue: {
          name: 'Innovation Hub',
          address: {
            address_1: '250 Startup Lane',
            city: location || 'New York',
            region: 'NY',
            postal_code: '10002'
          }
        },
        ticket_availability: {
          has_available_tickets: true,
          minimum_ticket_price: { currency: 'USD', value: 0, display: 'Free' }
        },
        category: 'Business',
        subcategory: 'Startups',
        logo: { url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop' },
        organizer: { name: 'Entrepreneur Network' }
      },
      {
        id: 'mock_arts_1',
        name: 'Digital Art Exhibition & Workshop',
        description: 'Explore the intersection of technology and art. View stunning digital artworks and participate in hands-on workshops using VR, AR, and digital painting tools.',
        start: {
          local: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          timezone: 'America/New_York'
        },
        venue: {
          name: 'Modern Art Gallery',
          address: {
            address_1: '300 Creative Avenue',
            city: location || 'New York',
            region: 'NY',
            postal_code: '10003'
          }
        },
        ticket_availability: {
          has_available_tickets: true,
          minimum_ticket_price: { currency: 'USD', value: 3500, display: '$35.00' }
        },
        category: 'Arts',
        subcategory: 'Digital Art',
        logo: { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop' },
        organizer: { name: 'Digital Arts Collective' }
      },
      {
        id: 'mock_outdoor_1',
        name: 'Urban Photography Walk',
        description: 'Discover hidden gems in the city while improving your photography skills. Professional photographer will guide the group through scenic locations and provide tips.',
        start: {
          local: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          timezone: 'America/New_York'
        },
        venue: {
          name: 'Central Park Meeting Point',
          address: {
            address_1: 'Central Park South',
            city: location || 'New York',
            region: 'NY',
            postal_code: '10019'
          }
        },
        ticket_availability: {
          has_available_tickets: true,
          minimum_ticket_price: { currency: 'USD', value: 2000, display: '$20.00' }
        },
        category: 'Outdoor',
        subcategory: 'Photography',
        logo: { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop' },
        organizer: { name: 'City Photography Club' }
      },
      {
        id: 'mock_social_1',
        name: 'Wine & Networking Evening',
        description: 'Join professionals from various industries for an elegant evening of wine tasting and meaningful connections. Sommelier-guided tasting of 6 premium wines.',
        start: {
          local: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          timezone: 'America/New_York'
        },
        venue: {
          name: 'Skyline Wine Bar',
          address: {
            address_1: '400 High Street',
            city: location || 'New York',
            region: 'NY',
            postal_code: '10004'
          }
        },
        ticket_availability: {
          has_available_tickets: true,
          minimum_ticket_price: { currency: 'USD', value: 8500, display: '$85.00' }
        },
        category: 'Social',
        subcategory: 'Networking',
        logo: { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop' },
        organizer: { name: 'Professional Network Society' }
      },
      {
        id: 'mock_sports_1',
        name: 'Morning Yoga in the Park',
        description: 'Start your day with energizing yoga practice in beautiful outdoor setting. Suitable for all levels. Bring your own mat or rent one at the venue.',
        start: {
          local: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          timezone: 'America/New_York'
        },
        venue: {
          name: 'Riverside Park',
          address: {
            address_1: 'Riverside Drive',
            city: location || 'New York',
            region: 'NY',
            postal_code: '10025'
          }
        },
        ticket_availability: {
          has_available_tickets: true,
          minimum_ticket_price: { currency: 'USD', value: 1500, display: '$15.00' }
        },
        category: 'Sports',
        subcategory: 'Yoga',
        logo: { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
        organizer: { name: 'Outdoor Fitness Group' }
      }
    ];

    // Filter by category if specified
    if (category && category !== 'All') {
      return baseEvents.filter(event => 
        event.category.toLowerCase().includes(category.toLowerCase()) ||
        event.subcategory.toLowerCase().includes(category.toLowerCase())
      );
    }

    return baseEvents;
  }

  // Convert any API response to our app's event format
  static normalizeEvent(apiEvent) {
    // Handle different API response formats
    if (apiEvent.name) {
      // Eventbrite format
      return this.normalizeEventbriteEvent(apiEvent);
    } else if (apiEvent.title) {
      // Our mock format or other APIs
      return apiEvent;
    } else {
      // Ticketmaster format
      return this.normalizeTicketmasterEvent(apiEvent);
    }
  }

  // Normalize Eventbrite event
  static normalizeEventbriteEvent(event) {
    return {
      id: event.id,
      title: event.name.text || event.name,
      description: event.description?.text || event.description || 'No description available',
      date: new Date(event.start.local).toLocaleDateString(),
      time: new Date(event.start.local).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      location: event.venue ? 
        `${event.venue.name}, ${event.venue.address.city}` : 
        'Location TBD',
      category: event.category || 'General',
      price: event.ticket_availability?.minimum_ticket_price?.display || 'Free',
      image: event.logo?.url || 'https://via.placeholder.com/400x300?text=Event+Image',
      attendees: Math.floor(Math.random() * 100) + 20,
      maxAttendees: event.capacity || Math.floor(Math.random() * 200) + 100,
      organizer: event.organizer?.name || 'Event Organizer',
      url: event.url,
      isFromAPI: true,
      rawData: event
    };
  }

  // Normalize Ticketmaster event
  static normalizeTicketmasterEvent(event) {
    return {
      id: event.id,
      title: event.name,
      description: event.info || event.pleaseNote || 'No description available',
      date: new Date(event.dates.start.localDate).toLocaleDateString(),
      time: event.dates.start.localTime || 'TBD',
      location: event._embedded?.venues?.[0] ? 
        `${event._embedded.venues[0].name}, ${event._embedded.venues[0].city.name}` : 
        'Location TBD',
      category: event.classifications?.[0]?.segment?.name || 'General',
      price: event.priceRanges?.[0] ? 
        `$${event.priceRanges[0].min} - $${event.priceRanges[0].max}` : 
        'Price TBD',
      image: event.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=Event+Image',
      attendees: Math.floor(Math.random() * 100) + 20,
      maxAttendees: Math.floor(Math.random() * 200) + 100,
      organizer: event._embedded?.attractions?.[0]?.name || 'Event Organizer',
      url: event.url,
      isFromAPI: true,
      rawData: event
    };
  }

  // Get events by category
  static async getEventsByCategory(category, location = DEFAULT_LOCATION.city) {
    const allEvents = await this.fetchEvents(location, category);
    return allEvents.map(event => this.normalizeEvent(event));
  }

  // Search events by keyword
  static async searchEvents(keyword, location = DEFAULT_LOCATION.city) {
    const allEvents = await this.fetchEvents(location);
    const normalizedEvents = allEvents.map(event => this.normalizeEvent(event));
    
    return normalizedEvents.filter(event =>
      event.title.toLowerCase().includes(keyword.toLowerCase()) ||
      event.description.toLowerCase().includes(keyword.toLowerCase()) ||
      event.category.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Get API status for debugging
  static getAPIStatus() {
    return {
      hasEventbrite: API_CONFIG.EVENTBRITE.TOKEN !== 'YOUR_EVENTBRITE_TOKEN_HERE',
      hasTicketmaster: API_CONFIG.TICKETMASTER.API_KEY !== 'YOUR_TICKETMASTER_KEY_HERE',
      hasMeetup: API_CONFIG.MEETUP.ACCESS_TOKEN !== 'YOUR_MEETUP_TOKEN_HERE',
      hasPredictHQ: API_CONFIG.PREDICTHQ.ACCESS_TOKEN !== 'YOUR_PREDICTHQ_TOKEN_HERE',
      usingMockData: !this.hasValidAPIConfig()
    };
  }
}

export default EventService; 