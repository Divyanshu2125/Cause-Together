import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, Truck, CheckCircle, Calendar, Clock, MapPin, 
  User as UserIcon, Mail, Phone, FileText, Tag, Info, ArrowRight, Award
} from 'lucide-react';
import AnimatedTransition from '@/components/AnimatedTransition';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VolunteerCertificate from '@/components/VolunteerCertificate';
import { 
  getUserById, getDonations, updateDonationStatus, 
  getPickupLocations, getDonationsByZipCode, getAvailableDonations,
  getVolunteerStats, getPickedUpDonations
} from '@/utils/databaseUtils';
import { DonationItem, PickupLocation, User } from '@/types/database';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allDonations, setAllDonations] = useState<DonationItem[]>([]);
  const [matchedDonations, setMatchedDonations] = useState<DonationItem[]>([]);
  const [assignedPickups, setAssignedPickups] = useState<DonationItem[]>([]);
  const [pickedUpItems, setPickedUpItems] = useState<DonationItem[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [volunteerStats, setVolunteerStats] = useState<ReturnType<typeof getVolunteerStats>>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
      navigate('/volunteer-login');
      return;
    }
    
    const user = getUserById(userId);
    if (!user) {
      localStorage.removeItem('currentUserId');
      navigate('/volunteer-login');
      return;
    }
    
    setCurrentUser(user);
    
    const stats = getVolunteerStats(userId);
    setVolunteerStats(stats);
    
    const donations = getDonations();
    const locations = getPickupLocations();
    
    const assigned = donations.filter(d => d.status === 'approved');
    setAssignedPickups(assigned);
    
    const pickedUp = donations.filter(d => 
      d.status === 'picked-up' && d.pickedUpBy === userId
    );
    setPickedUpItems(pickedUp);
    
    if (user.zipCode) {
      const matched = getDonationsByZipCode(user.zipCode);
      setMatchedDonations(matched);
    } else {
      setMatchedDonations(getAvailableDonations());
    }
    
    setAllDonations(donations);
    setPickupLocations(locations);
    setIsLoading(false);
  }, [navigate]);

  const handleStatusUpdate = (donationId: string, newStatus: DonationItem['status']) => {
    const userId = currentUser?.id;
    const updatedDonation = updateDonationStatus(
      donationId, 
      newStatus, 
      userId,
      newStatus === 'distributed' ? selectedLocation : undefined
    );
    
    if (updatedDonation) {
      setAllDonations(prev => prev.map(d => d.id === donationId ? updatedDonation : d));
      setMatchedDonations(prev => prev.filter(d => d.id !== donationId));
      
      if (newStatus === 'approved') {
        setAssignedPickups(prev => [...prev, updatedDonation]);
      } else if (newStatus === 'picked-up') {
        setAssignedPickups(prev => prev.filter(d => d.id !== donationId));
        setPickedUpItems(prev => [...prev, updatedDonation]);
        
        toast({
          title: "Item Picked Up",
          description: `You can now distribute ${updatedDonation.itemTitle} to a distribution center.`,
        });
      } else if (newStatus === 'distributed') {
        setAssignedPickups(prev => prev.filter(d => d.id !== donationId));
        setPickedUpItems(prev => prev.filter(d => d.id !== donationId));
        
        toast({
          title: "Item Distributed",
          description: `Thank you for distributing ${updatedDonation.itemTitle}!`,
        });
      }
      
      if (userId) {
        const updatedStats = getVolunteerStats(userId);
        setVolunteerStats(updatedStats);
        
        if (updatedStats?.certificateEligible && !updatedStats?.certificateIssued) {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: "You've reached 50 pickups and 50 distributions! View your certificate.",
          });
          setShowCertificate(true);
        }
      }
      
      toast({
        title: "Status Updated",
        description: `Donation ${updatedDonation.referenceNumber} is now ${newStatus.replace('-', ' ')}`,
      });
    }
  };

  const getTotalPickedUp = () => {
    if (!currentUser) return 0;
    return allDonations.filter(d => 
      (d.status === 'picked-up' || d.status === 'distributed') && 
      d.pickedUpBy === currentUser.id
    ).length;
  };
  
  const getTotalDistributed = () => {
    if (!currentUser) return 0;
    return allDonations.filter(d => 
      d.status === 'distributed' && 
      d.distributedBy === currentUser.id
    ).length;
  };
  
  const getPickupProgress = () => {
    if (!currentUser) return 0;
    
    const totalApproved = allDonations.filter(d => 
      (d.status === 'approved' || d.status === 'picked-up' || d.status === 'distributed') &&
      (d.status === 'approved' || d.pickedUpBy === currentUser.id)
    ).length;
    
    const totalPickedUp = allDonations.filter(d => 
      (d.status === 'picked-up' || d.status === 'distributed') && 
      d.pickedUpBy === currentUser.id
    ).length;
    
    return totalApproved > 0 ? Math.round((totalPickedUp / totalApproved) * 100) : 0;
  };
  
  const getDistributionProgress = () => {
    if (!currentUser) return 0;
    
    const totalPickedUp = allDonations.filter(d => 
      (d.status === 'picked-up' || d.status === 'distributed') && 
      d.pickedUpBy === currentUser.id
    ).length;
    
    const totalDistributed = allDonations.filter(d => 
      d.status === 'distributed' && 
      d.distributedBy === currentUser.id
    ).length;
    
    return totalPickedUp > 0 ? Math.round((totalDistributed / totalPickedUp) * 100) : 0;
  };
  
  const getZipCodeStats = () => {
    if (!currentUser?.zipCode) return null;
    
    const matchedCount = matchedDonations.length;
    const allAvailableCount = getAvailableDonations().length;
    
    return {
      zipCode: currentUser.zipCode,
      matchedCount,
      percentage: allAvailableCount > 0 ? Math.round((matchedCount / allAvailableCount) * 100) : 0
    };
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cause-600"></div>
      </div>
    );
  }

  const zipCodeStats = getZipCodeStats();

  return (
    <AnimatedTransition>
      <Header />
      
      <section className="pt-24 pb-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-3xl font-medium mb-2">Volunteer Dashboard</h1>
            {currentUser && (
              <p className="text-muted-foreground">
                Welcome back, {currentUser.name} | {currentUser.email}
              </p>
            )}
          </div>
          
          {volunteerStats && (
            <div className="glass-card p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-5 h-5 text-cause-600" />
                <h3 className="font-medium">Your Achievements</h3>
                
                {volunteerStats.certificateIssued && (
                  <span className="ml-auto bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Certificate Issued
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-medium text-cause-700 mb-1">
                      {volunteerStats.totalPickups}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Items Picked Up
                    </div>
                    <div className="mt-2 bg-gray-200 h-2 rounded-full w-32">
                      <div 
                        className="bg-cause-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (volunteerStats.totalPickups / 50) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs mt-1 text-right">
                      {Math.min(100, (volunteerStats.totalPickups / 50) * 100).toFixed(0)}% to goal
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-medium text-cause-700 mb-1">
                      {volunteerStats.totalDistributions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Items Distributed
                    </div>
                    <div className="mt-2 bg-gray-200 h-2 rounded-full w-32">
                      <div 
                        className="bg-cause-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (volunteerStats.totalDistributions / 50) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs mt-1 text-right">
                      {Math.min(100, (volunteerStats.totalDistributions / 50) * 100).toFixed(0)}% to goal
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 flex items-center justify-end">
                  <div className="flex-1">
                    {volunteerStats.certificateEligible ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="font-medium text-green-800">
                            Congratulations! You've reached the milestone.
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          You've successfully completed 50+ pickups and 50+ distributions.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-700">
                          Complete 50 pickups and 50 distributions to earn your Volunteer Certificate.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <button 
                      onClick={() => setShowCertificate(true)}
                      disabled={!volunteerStats.certificateEligible}
                      className={`px-4 py-2 rounded-md flex items-center text-sm font-medium ${
                        volunteerStats.certificateEligible 
                          ? 'bg-cause-600 text-white hover:bg-cause-700' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Award className="w-4 h-4 mr-1" />
                      View Certificate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="font-medium">Total Pickups</div>
                <div className="bg-cause-100 p-2 rounded-full">
                  <Truck className="w-5 h-5 text-cause-600" />
                </div>
              </div>
              <div className="text-3xl font-medium mb-1">{getTotalPickedUp()}</div>
              <div className="text-sm text-muted-foreground">Items collected</div>
              <div className="mt-4 bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-cause-500 h-2 rounded-full" 
                  style={{ width: `${getPickupProgress()}%` }}
                />
              </div>
              <div className="text-xs mt-1 text-right">{getPickupProgress()}% completion</div>
            </div>
            
            <div className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="font-medium">Distributed</div>
                <div className="bg-cause-100 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-cause-600" />
                </div>
              </div>
              <div className="text-3xl font-medium mb-1">{getTotalDistributed()}</div>
              <div className="text-sm text-muted-foreground">Items distributed</div>
              <div className="mt-4 bg-gray-200 h-2 rounded-full">
                <div 
                  className="bg-cause-500 h-2 rounded-full" 
                  style={{ width: `${getDistributionProgress()}%` }}
                />
              </div>
              <div className="text-xs mt-1 text-right">{getDistributionProgress()}% of picked up</div>
            </div>
            
            <div className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="font-medium">Pending Pickups</div>
                <div className="bg-cause-100 p-2 rounded-full">
                  <Package className="w-5 h-5 text-cause-600" />
                </div>
              </div>
              <div className="text-3xl font-medium mb-1">{matchedDonations.length}</div>
              <div className="text-sm text-muted-foreground">
                {currentUser?.zipCode ? 
                  `In your area (${currentUser.zipCode})` : 
                  'Available for pickup'}
              </div>
              {zipCodeStats && (
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <div className="text-muted-foreground">ZIP match rate:</div>
                    <div className="font-medium">{zipCodeStats.percentage}%</div>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full">
                    <div 
                      className="bg-cause-500 h-2 rounded-full" 
                      style={{ width: `${zipCodeStats.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="font-medium">Distribution Centers</div>
                <div className="bg-cause-100 p-2 rounded-full">
                  <MapPin className="w-5 h-5 text-cause-600" />
                </div>
              </div>
              <div className="text-3xl font-medium mb-1">{pickupLocations.length}</div>
              <div className="text-sm text-muted-foreground">Available centers</div>
              <div className="mt-4">
                {pickupLocations.slice(0, 2).map((location, index) => (
                  <div key={index} className="flex items-center mt-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-cause-500 mr-2"></div>
                    <div className="truncate">{location.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {currentUser?.zipCode && (
            <div className="glass-card p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-cause-600" />
                <h3 className="font-medium">Your Service Area</h3>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm">
                    You are assigned to handle donations in ZIP code: <span className="font-medium">{currentUser.zipCode}</span>
                  </p>
                  {zipCodeStats && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently {zipCodeStats.matchedCount} pending donation(s) match your ZIP code
                    </p>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <div className="bg-cause-100 text-cause-700 rounded-md px-3 py-1 text-sm inline-flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {currentUser.city}, {currentUser.zipCode}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Tabs defaultValue="matched">
            <TabsList className="mb-6">
              <TabsTrigger value="matched">
                {currentUser?.zipCode ? 'Matched Pickups' : 'Available Pickups'}
              </TabsTrigger>
              <TabsTrigger value="assigned">Assigned Pickups</TabsTrigger>
              <TabsTrigger value="distribution">Ready for Distribution</TabsTrigger>
              <TabsTrigger value="centers">Distribution Centers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="matched">
              <div className="space-y-5">
                <h2 className="text-xl font-medium">
                  {currentUser?.zipCode 
                    ? `Donations in Your Area (${currentUser.zipCode})` 
                    : 'Available Donations for Pickup'}
                </h2>
                
                {matchedDonations.length > 0 ? (
                  matchedDonations.map((donation) => (
                    <div key={donation.id} className="glass-card p-6 hover:border-cause-300 transition-colors">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-md ${
                              donation.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-cyan-100 text-cyan-700'
                            }`}>
                              <Package className="w-6 h-6" />
                            </div>
                            
                            <div>
                              <div className="text-lg font-medium mb-1">
                                {donation.itemTitle}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="bg-cause-100 text-cause-700 px-2 py-0.5 rounded">
                                  {donation.itemCategory}
                                </span>
                                <span className="text-muted-foreground">
                                  Ref: {donation.referenceNumber}
                                </span>
                                <span className={`capitalize px-2 py-0.5 rounded text-white ${
                                  donation.status === 'pending' ? 'bg-orange-500' : 'bg-cyan-500'
                                }`}>
                                  {donation.status.replace('-', ' ')}
                                </span>
                              </div>
                              
                              <p className="text-muted-foreground mt-3 text-sm">
                                {donation.itemDescription}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex gap-2 text-sm items-center">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Pickup Date:</span>
                              <span className="font-medium">{donation.pickupDate}</span>
                              <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                              <span>{donation.pickupTimePreference}</span>
                            </div>
                            
                            <div className="flex gap-2 text-sm items-start">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <span className="font-medium">
                                  {donation.address}
                                </span>
                                <div>
                                  {donation.city}, <span className="text-cause-600 font-semibold">{donation.zipCode}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-200 my-4"></div>
                          
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium">Donor Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                <span>{donation.donorName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{donation.donorPhone}</span>
                              </div>
                              <div className="flex items-center gap-2 md:col-span-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{donation.donorEmail}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-48 flex flex-row md:flex-col gap-2 justify-end md:border-l md:border-gray-200 md:pl-6">
                          {donation.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(donation.id, 'approved')}
                              className="btn btn-primary w-full"
                            >
                              Approve & Assign
                            </button>
                          )}
                          {donation.status === 'approved' && (
                            <button 
                              onClick={() => handleStatusUpdate(donation.id, 'picked-up')}
                              className="btn btn-primary w-full"
                            >
                              Mark as Picked Up
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card py-12 flex flex-col items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Matched Donations</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      {currentUser?.zipCode 
                        ? `There are currently no donations pending in your ZIP code (${currentUser.zipCode}).` 
                        : 'There are currently no donations available for pickup.'}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="assigned">
              <div className="space-y-5">
                <h2 className="text-xl font-medium">Your Assigned Pickups</h2>
                
                {assignedPickups.length > 0 ? (
                  assignedPickups.map((donation) => (
                    <div key={donation.id} className="glass-card p-6 hover:border-cause-300 transition-colors">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="p-3 rounded-md bg-cyan-100 text-cyan-700">
                              <Truck className="w-6 h-6" />
                            </div>
                            
                            <div>
                              <div className="text-lg font-medium mb-1">
                                {donation.itemTitle}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="bg-cause-100 text-cause-700 px-2 py-0.5 rounded">
                                  {donation.itemCategory}
                                </span>
                                <span className="text-muted-foreground">
                                  Ref: {donation.referenceNumber}
                                </span>
                                <span className="capitalize px-2 py-0.5 rounded text-white bg-cyan-500">
                                  {donation.status.replace('-', ' ')}
                                </span>
                              </div>
                              
                              <p className="text-muted-foreground mt-3 text-sm">
                                {donation.itemDescription}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex gap-2 text-sm items-center">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Pickup Date:</span>
                              <span className="font-medium">{donation.pickupDate}</span>
                              <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                              <span>{donation.pickupTimePreference}</span>
                            </div>
                            
                            <div className="flex gap-2 text-sm items-start">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <span className="font-medium">
                                  {donation.address}
                                </span>
                                <div>
                                  {donation.city}, <span className="text-cause-600 font-semibold">{donation.zipCode}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-200 my-4"></div>
                          
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium">Donor Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                <span>{donation.donorName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{donation.donorPhone}</span>
                              </div>
                              <div className="flex items-center gap-2 md:col-span-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{donation.donorEmail}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-48 flex flex-row md:flex-col gap-2 justify-end md:border-l md:border-gray-200 md:pl-6">
                          <button 
                            onClick={() => handleStatusUpdate(donation.id, 'picked-up')}
                            className="btn btn-primary w-full"
                          >
                            Mark as Picked Up
                          </button>
                          
                          <button 
                            onClick={() => handleStatusUpdate(donation.id, 'distributed')}
                            className="btn btn-outline btn-muted w-full"
                          >
                            Mark as Distributed
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card py-12 flex flex-col items-center justify-center">
                    <Truck className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Assigned Pickups</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      You don't have any assigned pickups at the moment. Approve donations to start picking up items.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="distribution">
              <div className="space-y-5">
                <h2 className="text-xl font-medium">Items Ready for Distribution</h2>
                
                {pickedUpItems.length > 0 ? (
                  pickedUpItems.map((donation) => (
                    <div key={donation.id} className="glass-card p-6 hover:border-cause-300 transition-colors">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="p-3 rounded-md bg-green-100 text-green-700">
                              <Package className="w-6 h-6" />
                            </div>
                            
                            <div>
                              <div className="text-lg font-medium mb-1">
                                {donation.itemTitle}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="bg-cause-100 text-cause-700 px-2 py-0.5 rounded">
                                  {donation.itemCategory}
                                </span>
                                <span className="text-muted-foreground">
                                  Ref: {donation.referenceNumber}
                                </span>
                                <span className="capitalize px-2 py-0.5 rounded text-white bg-green-500">
                                  Picked Up
                                </span>
                              </div>
                              
                              <p className="text-muted-foreground mt-3 text-sm">
                                {donation.itemDescription}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex gap-2 text-sm items-center">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Picked up on:</span>
                              <span className="font-medium">
                                {donation.pickedUpAt ? new Date(donation.pickedUpAt).toLocaleDateString() : "Unknown date"}
                              </span>
                            </div>
                            
                            <div className="flex gap-2 text-sm items-start">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <span className="font-medium">
                                  Original pickup location:
                                </span>
                                <div>
                                  {donation.address}, {donation.city}, {donation.zipCode}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-200 my-4"></div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium">Select Distribution Center</h4>
                            <select 
                              className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                              value={selectedLocation}
                              onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                              <option value="">Select a distribution center</option>
                              {pickupLocations.map(location => (
                                <option key={location.id} value={location.id}>
                                  {location.name} - {location.address}, {location.city}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="md:w-48 flex flex-row md:flex-col gap-2 justify-end md:border-l md:border-gray-200 md:pl-6">
                          <button 
                            onClick={() => handleStatusUpdate(donation.id, 'distributed')}
                            className="btn btn-primary w-full"
                            disabled={!selectedLocation}
                          >
                            Mark as Distributed
                          </button>
                          
                          <button 
                            className="btn btn-outline btn-muted w-full"
                            onClick={() => {
                              const location = pickupLocations.find(l => l.id === selectedLocation);
                              if (location) {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.address}, ${location.city}`)}`, '_blank');
                              } else {
                                toast({
                                  title: "Please Select a Center",
                                  description: "Please select a distribution center first.",
                                });
                              }
                            }}
                            disabled={!selectedLocation}
                          >
                            Get Directions
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card py-12 flex flex-col items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Items Ready for Distribution</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      You don't have any items ready for distribution. Pick up items to prepare them for distribution.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="centers">
              <div className="space-y-5">
                <h2 className="text-xl font-medium">Distribution Centers</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pickupLocations.map((location) => (
                    <div key={location.id} className="glass-card p-6 hover:border-cause-300 transition-colors">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-3 rounded-md bg-cause-100 text-cause-700">
                          <MapPin className="w-6 h-6" />
                        </div>
                        
                        <div>
                          <div className="text-lg font-medium mb-1">
                            {location.name}
                          </div>
                          
                          <div className="bg-cause-100 text-cause-700 px-2 py-0.5 rounded text-sm inline-block">
                            {location.zipCode}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2 items-start">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="font-medium">
                              {location.address}
                            </span>
                            <div>{location.city}, {location.zipCode}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-muted-foreground" />
                          <span>{location.contactPerson}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{location.contactPhone}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <button className="btn btn-outline btn-cause w-full">
                          <span>Get Directions</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {showCertificate && currentUser && volunteerStats && (
        <VolunteerCertificate 
          volunteer={currentUser}
          stats={volunteerStats}
          onClose={() => setShowCertificate(false)}
        />
      )}
      
      <Footer />
    </AnimatedTransition>
  );
};

export default VolunteerDashboard;
