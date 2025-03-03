
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Edit, Upload, BadgeCheck } from 'lucide-react';
import { getUserById, getVolunteerStats, updateUserDetails, updateProfilePicture } from '@/utils/databaseUtils';
import { User as UserType } from '@/types/database';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getVolunteerStats>>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  // Load user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('volunteer');
    if (!storedUser) {
      navigate('/volunteer-login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const userDetails = getUserById(parsedUser.id);
    
    if (userDetails) {
      setUser(userDetails);
      setFormData({
        name: userDetails.name || '',
        email: userDetails.email || '',
        phone: userDetails.phone || '',
        address: userDetails.address || '',
        city: userDetails.city || '',
        zipCode: userDetails.zipCode || '',
      });
      
      const volunteerStats = getVolunteerStats(userDetails.id);
      setStats(volunteerStats);
    } else {
      navigate('/volunteer-login');
    }
  }, [navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    if (!user) return;
    
    const updatedUser = updateUserDetails(user.id, formData);
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('volunteer', JSON.stringify(updatedUser));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleProfilePictureUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const updatedUser = updateProfilePicture(user.id, event.target.result);
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem('volunteer', JSON.stringify(updatedUser));
          toast.success('Profile picture updated!');
        } else {
          toast.error('Failed to update profile picture. Please try again.');
        }
      }
    };
    
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto">
          <Card>
            <CardContent className="py-10 flex items-center justify-center">
              <p>Loading profile...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column: Profile summary */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-cause-100">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback className="text-3xl bg-cause-100 text-cause-500">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0">
                      <label htmlFor="profile-picture" className="cursor-pointer">
                        <div className="bg-cause-500 text-white p-2 rounded-full hover:bg-cause-600 transition-colors">
                          <Upload size={16} />
                        </div>
                        <input 
                          type="file" 
                          id="profile-picture" 
                          accept="image/*" 
                          className="hidden"
                          onChange={handleProfilePictureUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription>Volunteer since {new Date(user.registeredAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pickups:</span>
                      <span className="font-medium">{stats?.totalPickups || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Distributions:</span>
                      <span className="font-medium">{stats?.totalDistributions || 0}</span>
                    </div>
                    {stats?.certificateIssued && (
                      <div className="flex items-center justify-between text-cause-500 mt-2">
                        <span className="text-sm font-medium">Certificate Earned!</span>
                        <BadgeCheck size={20} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column: Edit profile */}
          <div className="md:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User size={16} />
                  Profile Details
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                  <BadgeCheck size={16} />
                  Achievements
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-1"
                      >
                        <Edit size={16} />
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                          id="address"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input 
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {isEditing && (
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSaveChanges}>
                        Save Changes
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Achievements</CardTitle>
                    <CardDescription>Track your volunteer journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">Donation Milestones</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4">
                            <div className="text-4xl font-bold text-cause-500">{stats?.totalPickups || 0}</div>
                            <div className="text-sm text-muted-foreground">Items Picked Up</div>
                            {stats?.totalPickups && stats.totalPickups >= 50 ? (
                              <div className="mt-2 text-xs text-cause-500 flex items-center gap-1">
                                <BadgeCheck size={14} />
                                <span>50+ Pickups Achievement</span>
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {50 - (stats?.totalPickups || 0)} more to reach 50
                              </div>
                            )}
                          </Card>
                          <Card className="p-4">
                            <div className="text-4xl font-bold text-cause-500">{stats?.totalDistributions || 0}</div>
                            <div className="text-sm text-muted-foreground">Items Distributed</div>
                            {stats?.totalDistributions && stats.totalDistributions >= 50 ? (
                              <div className="mt-2 text-xs text-cause-500 flex items-center gap-1">
                                <BadgeCheck size={14} />
                                <span>50+ Distributions Achievement</span>
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {50 - (stats?.totalDistributions || 0)} more to reach 50
                              </div>
                            )}
                          </Card>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">Certificates</h3>
                        <Card className="p-6 bg-gradient-to-br from-cause-50 to-white">
                          {stats?.certificateIssued ? (
                            <div className="text-center space-y-4">
                              <div className="inline-flex items-center justify-center p-3 bg-cause-100 rounded-full text-cause-700">
                                <BadgeCheck size={32} />
                              </div>
                              <h4 className="text-xl font-bold">Volunteer Excellence Certificate</h4>
                              <p className="text-sm text-muted-foreground">
                                Awarded on {stats.certificateDate ? new Date(stats.certificateDate).toLocaleDateString() : 'Unknown Date'}
                              </p>
                              <Button>Download Certificate</Button>
                            </div>
                          ) : (
                            <div className="text-center space-y-4">
                              <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full text-gray-400">
                                <BadgeCheck size={32} />
                              </div>
                              <h4 className="text-xl font-bold text-gray-500">Volunteer Excellence Certificate</h4>
                              <p className="text-sm text-muted-foreground">
                                Complete 50 pickups and 50 distributions to earn this certificate
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-cause-500 h-2.5 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(
                                      100, 
                                      ((stats?.totalPickups || 0) + (stats?.totalDistributions || 0)) / 100 * 100
                                    )}%` 
                                  }}
                                ></div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {((stats?.totalPickups || 0) + (stats?.totalDistributions || 0))}/100 total actions
                              </p>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
