// import { HfInference } from "@huggingface/inference";
import { Client } from "@gradio/client";

// Service to handle election data and API calls
class ElectionService {
  constructor() {
    // Use relative API base in production (served by Flask), localhost in dev
    // this.baseUrl = (process.env.NODE_ENV === 'production') ? '' : 'http://localhost:8000';
    // this.inference = new HfInference(process.env.HF_TOKEN);
    this.initializeGradioClient();
  }

  async initializeGradioClient() {
    try {
      this.client = await Client.connect("akann0/basic-word-vectorization");
      console.log("Gradio client initialized successfully");
    } catch (error) {
      console.error('Error initializing Gradio client:', error);
      this.client = null; // Ensure client is null if initialization fails
    }
  }

  // Fetch election results from backend
  async getElectionResults() {
    try {
      const response = await fetch(`${this.baseUrl}/election-results`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Election results fetched successfully");
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching election results:', error);
      // Return mock data for development
      return this.getMockElectionData();
    }
  }

  // Combined analysis: Google Trends + Sentiment Analysis
  async compareChoices(choice1, choice2) {
    try {
      console.log(`Comparing ${choice1} vs ${choice2} with combined analysis...`);
      
      // Check if client is initialized
      if (!this.client) {
        throw new Error('Gradio client not initialized');
      }
      
      const response = await this.client.predict("/predict", { 		
        choices: JSON.stringify([choice1, choice2]), 
      });
      
      // Gradio client responses don't have .ok property, check for data instead
      if (!response || !response.data) {
        throw new Error(`Combined analysis failed: No data received from Gradio client`);
      }
      
      let combinedResults = response.data;
      
      // Handle case where Gradio returns data as an array
      if (Array.isArray(combinedResults) && combinedResults.length > 0) {
        combinedResults = combinedResults[0];
      }
      
      console.log('Processed Gradio response:', combinedResults);
      return combinedResults;
    } catch (error) {
      console.error('Error in combined analysis:', error);
      
      // Provide specific error messages based on error type
      if (!this.client) {
        console.warn('Falling back to mock data: Gradio client not initialized');
      } else if (error.message.includes('No data received')) {
        console.warn('Falling back to mock data: Gradio API returned empty response');
      } else {
        console.warn('Falling back to mock data: Unexpected error in Gradio client');
      }
      
      // Return mock comparison data for development
      return {
        state_colors: this.getMockComparisonData(choice1, choice2),
        state_winners: {},
        electoral_tally: {},
        search_data: {},
        sentiment_summary: {},
        demographic_breakdown: {},
        metadata: {}
      };
    }
  }

  // Compare Google Trends for two search terms (legacy function)
  async compareGoogleTrends(choice1, choice2) {
    try {
      console.log(`Comparing trends for: ${choice1} vs ${choice2}`);
      const response = await fetch(`${this.baseUrl}/google-trends/${encodeURIComponent(choice1)}/${encodeURIComponent(choice2)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Comparison results:', data);
      return data.state_colors;
    } catch (error) {
      console.error('Error comparing Google Trends:', error);
      // Return mock comparison data for development
      return this.getMockComparisonData(choice1, choice2);
    }
  }

  // Mock comparison data for development/testing
  getMockComparisonData(choice1, choice2) {
    const states = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
    ];
    
    const stateColors = {};
    
    states.forEach(state => {
      // Simple mock logic: alternate between choices based on state name
      const stateIndex = states.indexOf(state);
      if (stateIndex % 2 === 0) {
        stateColors[state] = '#F44336'; // Red for choice1
      } else {
        stateColors[state] = '#2196F3'; // Blue for choice2
      }
    });
    
    return stateColors;
  }

  // Mock election data for development/testing
  getMockElectionData() {
    return {
      states: {
        'CA': { winner: 'Democrat', votes: { Democrat: 11110250, Republican: 6006429 }, electoral_votes: 54 },
        'TX': { winner: 'Republican', votes: { Democrat: 5259126, Republican: 5890347 }, electoral_votes: 40 },
        'FL': { winner: 'Republican', votes: { Democrat: 5297045, Republican: 5668731 }, electoral_votes: 30 },
        'NY': { winner: 'Democrat', votes: { Democrat: 5244886, Republican: 3244798 }, electoral_votes: 28 },
        'PA': { winner: 'Republican', votes: { Democrat: 3458229, Republican: 3377674 }, electoral_votes: 19 },
        'IL': { winner: 'Democrat', votes: { Democrat: 3471133, Republican: 2446891 }, electoral_votes: 19 },
        'OH': { winner: 'Republican', votes: { Democrat: 2940044, Republican: 3154834 }, electoral_votes: 17 },
        'GA': { winner: 'Republican', votes: { Democrat: 2473633, Republican: 2661405 }, electoral_votes: 16 },
        'NC': { winner: 'Republican', votes: { Democrat: 2684292, Republican: 2758775 }, electoral_votes: 16 },
        'MI': { winner: 'Republican', votes: { Democrat: 2804040, Republican: 2649852 }, electoral_votes: 15 }
      },
      summary: {
        total_electoral_votes: 538,
        democrat_electoral: 226,
        republican_electoral: 312,
        winner: 'Republican'
      },
      last_updated: new Date().toISOString()
    };
  }

  // Get color for state based on election results
  getStateColor(stateCode, electionData) {
    if (!electionData || !electionData.states || !electionData.states[stateCode]) {
      return '#e0e0e0'; // Default gray for no data
    }

    const stateResult = electionData.states[stateCode];
    switch (stateResult.winner) {
      case 'Democrat':
        return '#2196F3'; // Blue
      case 'Republican':
        return '#F44336'; // Red
      case 'Independent':
        return '#9C27B0'; // Purple
      default:
        return '#e0e0e0'; // Gray
    }
  }

  // Calculate vote margin percentage
  getVoteMargin(stateCode, electionData) {
    if (!electionData || !electionData.states || !electionData.states[stateCode]) {
      return 0;
    }

    const stateResult = electionData.states[stateCode];
    const votes = stateResult.votes;
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    
    if (totalVotes === 0) return 0;

    const sortedVotes = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    const margin = ((sortedVotes[0][1] - sortedVotes[1][1]) / totalVotes) * 100;
    
    return Math.round(margin * 100) / 100; // Round to 2 decimal places
  }

  // Format vote counts for display
  formatVoteCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'K';
    }
    return count.toString();
  }

  // Generate random state colors from backend
  async generateRandomColors() {
    try {
      const response = await fetch(`${this.baseUrl}/google-trends/pizza/burger`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.state_colors;
    } catch (error) {
      console.error('Error generating random colors:', error);
      // Return mock random colors for development
      return this.getMockRandomColors();
    }
  }

  // Mock random colors for development/testing
  getMockRandomColors() {
    const states = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
    ];
    
    const colors = ['#F44336', '#2196F3', '#e0e0e0'];
    const stateColors = {};
    
    states.forEach(state => {
      stateColors[state] = colors[Math.floor(Math.random() * colors.length)];
    });
    
    return stateColors;
  }
}

const electionService = new ElectionService();
export default electionService;
