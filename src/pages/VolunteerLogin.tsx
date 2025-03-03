
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/AnimatedTransition';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { authenticateUser, saveUser, getUserByEmail, initializeDatabase } from '@/utils/databaseUtils';

const VolunteerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  // Initialize database with sample data
  useEffect(() => {
    initializeDatabase();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    });
  };

  const validateForm = (): boolean => {
    if (isLogin) {
      if (!formData.email || !formData.password) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      if (!formData.name || !formData.email || !formData.phone || !formData.address || 
          !formData.city || !formData.zipCode || !formData.password || !formData.confirmPassword) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      if (!formData.agreeTerms) {
        toast({
          title: "Terms Not Accepted",
          description: "Please accept the terms and conditions to register.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      if (isLogin) {
        // Authenticate user
        const authenticatedUser = authenticateUser(formData.email, formData.password);
        
        if (authenticatedUser) {
          // Store user ID in localStorage for "session" management
          localStorage.setItem('currentUserId', authenticatedUser.id);
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${authenticatedUser.name}!`,
          });
          navigate('/volunteer-dashboard');
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Check if email already exists
        const existingUser = getUserByEmail(formData.email);
        
        if (existingUser) {
          toast({
            title: "Registration Failed",
            description: "An account with this email already exists.",
            variant: "destructive",
          });
          return;
        }
        
        // Register new user
        const newUser = saveUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          password: formData.password,
        });
        
        toast({
          title: "Registration Successful",
          description: "Your volunteer account has been created. You can now log in.",
        });
        
        setIsLogin(true);
        setFormData({
          ...formData,
          password: '',
          confirmPassword: '',
        });
      }
    }, 1000);
  };

  return (
    <AnimatedTransition>
      <Header />
      
      <section className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-cause-100">
        <div className="container max-w-md">
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 border border-cause-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium mb-2 text-cause-900">
                {isLogin ? 'Volunteer Login' : 'Become a Volunteer'}
              </h1>
              <p className="text-muted-foreground">
                {isLogin 
                  ? 'Sign in to access your volunteer dashboard' 
                  : 'Create an account to start helping your community'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="w-5 h-5 text-cause-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-md pl-10 w-full p-2 focus:ring-2 focus:ring-cause-400 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-cause-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-md pl-10 w-full p-2 focus:ring-2 focus:ring-cause-400 focus:border-transparent"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium mb-1">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md w-full p-2 focus:ring-2 focus:ring-cause-400 focus:border-transparent"
                      placeholder="Your street address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-md w-full p-2 focus:ring-2 focus:ring-cause-400 focus:border-transparent"
                        placeholder="Your city"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded-md w-full p-2 focus:ring-2 focus:ring-cause-400 focus:border-transparent"
                        placeholder="Your ZIP code"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-cause-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md pl-10 w-full p-2 focus:ring-2 focus:ring-cause-400 focus:border-transparent"
                    placeholder="Your email"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-cause-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md pl-10 pr-10 w-full p-2 focus:ring-2 focus:ring-cause-400 focus:border-transparent"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="w-5 h-5 text-cause-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md pl-10 w-full p-2 focus:ring-2 focus:ring-cause-400 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}
              
              {isLogin ? (
                <div className="flex justify-end mb-4">
                  <a href="#" className="text-sm text-cause-500 hover:text-cause-600">
                    Forgot password?
                  </a>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      className="mt-1 mr-2"
                    />
                    <span className="text-sm text-muted-foreground">
                      I agree to the <a href="#" className="text-cause-500 hover:text-cause-600">Terms of Service</a> and <a href="#" className="text-cause-500 hover:text-cause-600">Privacy Policy</a>
                    </span>
                  </label>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${loading 
                  ? 'bg-cause-400 cursor-not-allowed' 
                  : 'bg-cause-600 hover:bg-cause-500'}`}
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-sm text-cause-500 hover:text-cause-600"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </AnimatedTransition>
  );
};

export default VolunteerLogin;
