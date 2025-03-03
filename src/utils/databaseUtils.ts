import { User, DonationItem, PickupLocation } from '@/types/database';

// Generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate a reference number for donations
export const generateReferenceNumber = () => {
  return `DN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

// User related functions
export const saveUser = (user: Omit<User, 'id' | 'registeredAt'>): User => {
  // Get existing users
  const users = getUsers();
  
  // Create new user with ID and timestamp
  const newUser: User = {
    ...user,
    id: generateId(),
    registeredAt: new Date().toISOString(),
    achievements: {
      totalPickups: 0,
      totalDistributions: 0,
      certificateIssued: false
    }
  };
  
  // Add to users array and save back to localStorage
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  return newUser;
};

export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : [];
};

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

export const authenticateUser = (email: string, password: string): User | null => {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

// New function to update user details
export const updateUserDetails = (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'registeredAt' | 'achievements'>>
): User | null => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index === -1) return null;
  
  // Update the user details
  users[index] = {
    ...users[index],
    ...updates,
  };
  
  localStorage.setItem('users', JSON.stringify(users));
  
  return users[index];
};

// New function to update profile picture
export const updateProfilePicture = (
  userId: string,
  profilePicture: string
): User | null => {
  return updateUserDetails(userId, { profilePicture });
};

// Donation related functions
export const saveDonation = (donation: Omit<DonationItem, 'id' | 'referenceNumber' | 'createdAt'>): DonationItem => {
  // Get existing donations
  const donations = getDonations();
  
  // Create new donation with ID, reference number, and timestamp
  const newDonation: DonationItem = {
    ...donation,
    id: generateId(),
    referenceNumber: generateReferenceNumber(),
    createdAt: new Date().toISOString(),
  };
  
  // Add to donations array and save back to localStorage
  donations.push(newDonation);
  localStorage.setItem('donations', JSON.stringify(donations));
  
  return newDonation;
};

export const getDonations = (): DonationItem[] => {
  const donationsJson = localStorage.getItem('donations');
  return donationsJson ? JSON.parse(donationsJson) : [];
};

export const getDonationsByDonorId = (donorId: string): DonationItem[] => {
  const donations = getDonations();
  return donations.filter(donation => donation.donorId === donorId);
};

export const getDonationByReferenceNumber = (referenceNumber: string): DonationItem | undefined => {
  const donations = getDonations();
  return donations.find(donation => donation.referenceNumber === referenceNumber);
};

export const updateDonationStatus = (
  id: string, 
  status: DonationItem['status'], 
  volunteerId?: string,
  distributionLocationId?: string
): DonationItem | null => {
  const donations = getDonations();
  const index = donations.findIndex(donation => donation.id === id);
  
  if (index === -1) return null;
  
  const oldStatus = donations[index].status;
  donations[index].status = status;
  
  // Update volunteer stats if provided
  if (volunteerId) {
    if (status === 'picked-up' && oldStatus !== 'picked-up') {
      donations[index].pickedUpBy = volunteerId;
      donations[index].pickedUpAt = new Date().toISOString();
      updateVolunteerPickupCount(volunteerId);
    } else if (status === 'distributed' && oldStatus !== 'distributed') {
      donations[index].distributedBy = volunteerId;
      donations[index].distributedAt = new Date().toISOString();
      
      if (distributionLocationId) {
        donations[index].distributionLocation = distributionLocationId;
      }
      
      updateVolunteerDistributionCount(volunteerId);
    }
  }
  
  localStorage.setItem('donations', JSON.stringify(donations));
  
  return donations[index];
};

// Track volunteer achievements
export const updateVolunteerPickupCount = (volunteerId: string): User | null => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === volunteerId);
  
  if (index === -1) return null;
  
  // Initialize achievements if not present
  if (!users[index].achievements) {
    users[index].achievements = {
      totalPickups: 0,
      totalDistributions: 0,
      certificateIssued: false
    };
  }
  
  // Increment pickup count
  users[index].achievements.totalPickups = (users[index].achievements.totalPickups || 0) + 1;
  
  // Check if volunteer qualifies for certificate
  checkVolunteerCertificateEligibility(users[index]);
  
  localStorage.setItem('users', JSON.stringify(users));
  
  return users[index];
};

export const updateVolunteerDistributionCount = (volunteerId: string): User | null => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === volunteerId);
  
  if (index === -1) return null;
  
  // Initialize achievements if not present
  if (!users[index].achievements) {
    users[index].achievements = {
      totalPickups: 0,
      totalDistributions: 0,
      certificateIssued: false
    };
  }
  
  // Increment distribution count
  users[index].achievements.totalDistributions = (users[index].achievements.totalDistributions || 0) + 1;
  
  // Check if volunteer qualifies for certificate
  checkVolunteerCertificateEligibility(users[index]);
  
  localStorage.setItem('users', JSON.stringify(users));
  
  return users[index];
};

export const checkVolunteerCertificateEligibility = (user: User): boolean => {
  if (!user.achievements) return false;
  
  // Check if volunteer has already received a certificate
  if (user.achievements.certificateIssued) return true;
  
  // Check if volunteer qualifies for a certificate (50 pickups and 50 distributions)
  const qualifies = 
    (user.achievements.totalPickups || 0) >= 50 && 
    (user.achievements.totalDistributions || 0) >= 50;
  
  if (qualifies && !user.achievements.certificateIssued) {
    // Issue certificate
    user.achievements.certificateIssued = true;
    user.achievements.certificateDate = new Date().toISOString();
    
    // Update user in storage
    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
  
  return qualifies;
};

export const getVolunteerStats = (volunteerId: string): { 
  totalPickups: number; 
  totalDistributions: number;
  certificateEligible: boolean;
  certificateIssued: boolean;
  certificateDate?: string;
} | null => {
  const user = getUserById(volunteerId);
  
  if (!user) return null;
  
  if (!user.achievements) {
    return {
      totalPickups: 0,
      totalDistributions: 0,
      certificateEligible: false,
      certificateIssued: false
    };
  }
  
  return {
    totalPickups: user.achievements.totalPickups || 0,
    totalDistributions: user.achievements.totalDistributions || 0,
    certificateEligible: 
      (user.achievements.totalPickups || 0) >= 50 && 
      (user.achievements.totalDistributions || 0) >= 50,
    certificateIssued: user.achievements.certificateIssued || false,
    certificateDate: user.achievements.certificateDate
  };
};

// Pickup locations
export const savePickupLocation = (location: Omit<PickupLocation, 'id'>): PickupLocation => {
  // Get existing locations
  const locations = getPickupLocations();
  
  // Create new location with ID
  const newLocation: PickupLocation = {
    ...location,
    id: generateId(),
  };
  
  // Add to locations array and save back to localStorage
  locations.push(newLocation);
  localStorage.setItem('pickupLocations', JSON.stringify(locations));
  
  return newLocation;
};

export const getPickupLocations = (): PickupLocation[] => {
  const locationsJson = localStorage.getItem('pickupLocations');
  return locationsJson ? JSON.parse(locationsJson) : [];
};

// Get donations that match a volunteer's zip code
export const getDonationsByZipCode = (zipCode: string): DonationItem[] => {
  const donations = getDonations();
  return donations.filter(donation => 
    donation.zipCode === zipCode && 
    (donation.status === 'pending' || donation.status === 'approved')
  );
};

// Get pending or approved donations regardless of zip code
export const getAvailableDonations = (): DonationItem[] => {
  const donations = getDonations();
  return donations.filter(donation => 
    donation.status === 'pending' || donation.status === 'approved'
  );
};

// Get donations that have been picked up but not yet distributed
export const getPickedUpDonations = (volunteerId?: string): DonationItem[] => {
  const donations = getDonations();
  return donations.filter(donation => 
    donation.status === 'picked-up' && 
    (!volunteerId || donation.pickedUpBy === volunteerId)
  );
};

// Initialize database with sample data if empty
export const initializeDatabase = () => {
  // Only initialize if no data exists yet
  if (getUsers().length === 0 && getDonations().length === 0 && getPickupLocations().length === 0) {
    // Add sample volunteer
    const sampleUser: User = {
      id: 'sample-user-1',
      name: 'John Volunteer',
      email: 'volunteer@example.com',
      phone: '555-123-4567',
      address: '456 Volunteer St',
      city: 'Anytown',
      zipCode: '12345',
      password: 'password123', // In a real app, this would be hashed
      registeredAt: new Date().toISOString(),
      achievements: {
        totalPickups: 45,
        totalDistributions: 40,
        certificateIssued: false
      }
    };
    
    localStorage.setItem('users', JSON.stringify([sampleUser]));
    
    // Add sample pickup locations
    const sampleLocations: PickupLocation[] = [
      {
        id: 'loc-1',
        name: 'Downtown Distribution Center',
        address: '123 Main St',
        city: 'Anytown',
        zipCode: '12345',
        contactPerson: 'Jane Manager',
        contactPhone: '555-111-2222',
      },
      {
        id: 'loc-2',
        name: 'Westside Donation Hub',
        address: '456 Oak Ave',
        city: 'Anytown',
        zipCode: '12346',
        contactPerson: 'Bob Director',
        contactPhone: '555-333-4444',
      },
    ];
    
    localStorage.setItem('pickupLocations', JSON.stringify(sampleLocations));
    
    // Add sample donations
    const sampleDonations: DonationItem[] = [
      {
        id: 'don-1',
        referenceNumber: 'DN-ABC123XYZ',
        donorId: 'donor-1',
        donorName: 'Sarah Donor',
        donorEmail: 'sarah@example.com',
        donorPhone: '555-555-5555',
        address: '789 Pine St',
        city: 'Anytown',
        zipCode: '12345',
        itemTitle: 'Children\'s Books Collection',
        itemCategory: 'Books',
        itemDescription: '25 gently used children\'s books for ages 3-10',
        status: 'pending',
        pickupDate: '2023-11-15',
        pickupTimePreference: 'Morning (9AM - 12PM)',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'don-2',
        referenceNumber: 'DN-DEF456UVW',
        donorId: 'donor-2',
        donorName: 'Mike Contributor',
        donorEmail: 'mike@example.com',
        donorPhone: '555-666-7777',
        address: '101 Maple Dr',
        city: 'Anytown',
        zipCode: '12346',
        itemTitle: 'Winter Clothing Bundle',
        itemCategory: 'Clothing',
        itemDescription: '10 winter jackets, 15 scarves, 20 pairs of gloves - all in good condition',
        status: 'approved',
        pickupDate: '2023-11-18',
        pickupTimePreference: 'Afternoon (12PM - 5PM)',
        createdAt: new Date().toISOString(),
      },
    ];
    
    localStorage.setItem('donations', JSON.stringify(sampleDonations));
    
    console.log('Database initialized with sample data');
  }
};
