// Frontend_Altatech/src/api.js
const API_BASE_URL = 'http://localhost:8000/api';
const BACKEND_BASE_URL = 'http://localhost:8000';

class ApiService {
    // Helper function to get full image URL
    static getImageUrl(imagePath) {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${BACKEND_BASE_URL}${imagePath}`;
    }

    static getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // Authentication
    static async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            if (!response.ok) {
                throw new Error('Login failed');
            }
            
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('API Login Error:', error);
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Register Error:', error);
            throw error;
        }
    }

    // Candidates
    static async fetchCandidates() {
        try {
            const response = await fetch(`${API_BASE_URL}/candidates`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch candidates');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Fetch Candidates Error:', error);
            throw error;
        }
    }

    // Voting
    static async canVote() {
        try {
            const response = await fetch(`${API_BASE_URL}/votes/can-vote`, {
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to check voting status');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Can Vote Check Error:', error);
            throw error;
        }
    }

    static async castVote(voteData) {
        try {
            const response = await fetch(`${API_BASE_URL}/votes`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(voteData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Vote failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Vote Error:', error);
            throw error;
        }
    }

    static async getVoteHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/votes/history`, {
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch vote history');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Vote History Error:', error);
            throw error;
        }
    }

    static async purchaseVotes(purchaseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/votes/purchase`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(purchaseData)
            });
            
            if (!response.ok) {
                throw new Error('Purchase failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Purchase Error:', error);
            throw error;
        }
    }

    // Results
    static async getResults() {
        try {
            const response = await fetch(`${API_BASE_URL}/results`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Results Error:', error);
            throw error;
        }
    }

    // Get vote counts for a specific candidate
    static async getCandidateVotes(candidateId) {
        try {
            const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/votes`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch candidate votes');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Candidate Votes Error:', error);
            throw error;
        }
    }

    // Admin functions
    static async createCandidate(candidateData) {
        try {
            const headers = this.getAuthHeaders();
            console.log('Creating candidate with headers:', headers);
            console.log('Candidate data:', candidateData);
            
            const response = await fetch(`${API_BASE_URL}/candidates`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(candidateData)
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`Failed to create candidate: ${response.status} ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Response result:', result);
            return result;
        } catch (error) {
            console.error('API Create Candidate Error:', error);
            throw error;
        }
    }

    static async updateCandidate(id, candidateData) {
        try {
            const headers = this.getAuthHeaders();
            console.log('Updating candidate with headers:', headers);
            console.log('Candidate data:', candidateData);
            
            const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(candidateData)
            });
            
            console.log('Update response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update response error:', errorText);
                throw new Error(`Failed to update candidate: ${response.status} ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Update response result:', result);
            return result;
        } catch (error) {
            console.error('API Update Candidate Error:', error);
            throw error;
        }
    }

    static async updateCandidateWithImage(id, formData) {
        try {
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
                // Don't set Content-Type for FormData - browser will set it automatically
            };
            
            console.log('Updating candidate with image, headers:', headers);
            console.log('FormData:', formData);
            
            const response = await fetch(`${API_BASE_URL}/candidates/${id}/image`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            console.log('Image update response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Image update response error:', errorText);
                throw new Error(`Failed to update candidate image: ${response.status} ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Image update response result:', result);
            return result;
        } catch (error) {
            console.error('API Update Candidate Image Error:', error);
            throw error;
        }
    }

    static async deleteCandidate(id) {
        try {
            const headers = this.getAuthHeaders();
            console.log('Deleting candidate with headers:', headers);
            
            const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            
            console.log('Delete response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete response error:', errorText);
                throw new Error(`Failed to delete candidate: ${response.status} ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Delete response result:', result);
            return result;
        } catch (error) {
            console.error('API Delete Candidate Error:', error);
            throw error;
        }
    }

    static async getAdminVotes() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/votes`, {
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch admin votes');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Admin Votes Error:', error);
            throw error;
        }
    }

    // Utility function to check if backend is available
    static async checkBackendConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/candidates`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

export default ApiService;