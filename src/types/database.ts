
// Type definitions for our database entities

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zipCode?: string;
  registeredAt: string;
  password: string; // In a real app, this would be hashed on the server
  profilePicture?: string; // New field for profile picture
  achievements?: {
    totalPickups: number;
    totalDistributions: number;
    certificateIssued: boolean;
    certificateDate?: string;
  };
}

export interface DonationItem {
  id: string;
  referenceNumber: string;
  donorId: string;
  itemTitle: string;
  itemCategory: string;
  itemDescription: string;
  status: 'pending' | 'approved' | 'picked-up' | 'distributed';
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  address: string;
  city: string;
  zipCode: string;
  pickupDate: string;
  pickupTimePreference: string;
  specialInstructions?: string;
  createdAt: string;
  pickedUpBy?: string;
  pickedUpAt?: string; // New field to track when item was picked up
  distributedBy?: string;
  distributedAt?: string; // New field to track when item was distributed
  distributionLocation?: string; // New field to track where item was distributed
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  contactPerson: string;
  contactPhone: string;
}
