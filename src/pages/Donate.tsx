import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Info, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/AnimatedTransition';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { saveDonation } from '@/utils/databaseUtils';

const categories = [
  'Books',
  'Clothing',
  'Food (non-perishable)',
  'Toys',
  'Electronics',
  'Furniture',
  'Household Items',
  'Other'
];

const Donate: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    itemTitle: '',
    itemCategory: '',
    itemDescription: '',
    pickupDate: '',
    pickupTimePreference: '',
    specialInstructions: '',
    accepted: false
  });
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateStep = (): boolean => {
    if (formStep === 1) {
      if (!formState.name || !formState.email || !formState.phone || !formState.address || !formState.city || !formState.zipCode) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return false;
      }
      return true;
    } else if (formStep === 2) {
      if (!formState.itemTitle || !formState.itemCategory || !formState.itemDescription) {
        toast({
          title: "Missing Information",
          description: "Please provide details about your donation.",
          variant: "destructive"
        });
        return false;
      }
      return true;
    } else if (formStep === 3) {
      if (!formState.pickupDate || !formState.pickupTimePreference) {
        toast({
          title: "Missing Information",
          description: "Please select pickup date and time preference.",
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setFormStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setFormStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.accepted) {
      toast({
        title: "Terms Not Accepted",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const donationData = saveDonation({
        donorId: 'guest-donor',
        donorName: formState.name,
        donorEmail: formState.email,
        donorPhone: formState.phone,
        address: formState.address,
        city: formState.city,
        zipCode: formState.zipCode,
        itemTitle: formState.itemTitle,
        itemCategory: formState.itemCategory,
        itemDescription: formState.itemDescription,
        status: 'pending',
        pickupDate: formState.pickupDate,
        pickupTimePreference: formState.pickupTimePreference,
        specialInstructions: formState.specialInstructions,
      });

      setReferenceNumber(donationData.referenceNumber);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
        
        setFormState({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          zipCode: '',
          itemTitle: '',
          itemCategory: '',
          itemDescription: '',
          pickupDate: '',
          pickupTimePreference: '',
          specialInstructions: '',
          accepted: false
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Submission Error",
        description: "There was a problem saving your donation. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  };

  if (submitted) {
    return (
      <AnimatedTransition>
        <Header />
        
        <section className="pt-32 pb-20 min-h-screen flex items-center">
          <div className="container max-w-4xl">
            <motion.div 
              className="glass-card p-10 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-medium mb-4">Donation Submitted!</h1>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Thank you for your generosity. A volunteer will review your donation and contact you soon to arrange the pickup.
              </p>
              
              <div className="glass-card p-6 mb-8 max-w-md mx-auto">
                <h3 className="font-medium mb-3">Reference Number</h3>
                <p className="text-lg font-mono tracking-wide text-cause-600">
                  {referenceNumber}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setSubmitted(false)}
                  className="btn btn-primary"
                >
                  Submit Another Donation
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="btn btn-secondary"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        
        <Footer />
      </AnimatedTransition>
    );
  }

  return (
    <AnimatedTransition>
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-medium mb-4">Donate Your Items</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fill out the form below to list your items for donation. Volunteers will review and arrange for pickup.
            </p>
          </div>
          
          <div className="glass-card p-6 md:p-8 mb-8">
            <div className="mb-10">
              <div className="flex justify-between mb-2">
                {['Contact Info', 'Donation Details', 'Pickup Preferences', 'Review & Submit'].map((step, index) => (
                  <div 
                    key={index} 
                    className={`text-sm font-medium ${formStep >= index + 1 ? 'text-cause-600' : 'text-muted-foreground'}`}
                    style={{ width: '25%', textAlign: 'center' }}
                  >
                    {step}
                  </div>
                ))}
              </div>
              
              <div className="w-full bg-cause-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cause-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(formStep / 4) * 100}%` }}
                />
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {formStep === 1 && (
                <motion.div
                  key="step1"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-xl font-medium mb-6">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="glass-input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="glass-input w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      className="glass-input w-full"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="address" className="block text-sm font-medium mb-2">Street Address *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formState.address}
                      onChange={handleChange}
                      className="glass-input w-full"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formState.city}
                        onChange={handleChange}
                        className="glass-input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formState.zipCode}
                        onChange={handleChange}
                        className="glass-input w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="btn btn-primary"
                    >
                      Next Step
                    </button>
                  </div>
                </motion.div>
              )}
              
              {formStep === 2 && (
                <motion.div
                  key="step2"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-xl font-medium mb-6">Donation Details</h2>
                  
                  <div className="mb-6">
                    <label htmlFor="itemTitle" className="block text-sm font-medium mb-2">Item Title *</label>
                    <input
                      type="text"
                      id="itemTitle"
                      name="itemTitle"
                      value={formState.itemTitle}
                      onChange={handleChange}
                      placeholder="e.g., Box of Children's Books"
                      className="glass-input w-full"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="itemCategory" className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      id="itemCategory"
                      name="itemCategory"
                      value={formState.itemCategory}
                      onChange={handleChange}
                      className="glass-input w-full"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="itemDescription" className="block text-sm font-medium mb-2">
                      Description *
                      <span className="text-muted-foreground text-xs font-normal ml-2">
                        (Include quantity, condition, and any relevant details)
                      </span>
                    </label>
                    <textarea
                      id="itemDescription"
                      name="itemDescription"
                      value={formState.itemDescription}
                      onChange={handleChange}
                      rows={4}
                      className="glass-input w-full"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="btn btn-secondary order-2 sm:order-1"
                    >
                      Previous Step
                    </button>
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="btn btn-primary order-1 sm:order-2"
                    >
                      Next Step
                    </button>
                  </div>
                </motion.div>
              )}
              
              {formStep === 3 && (
                <motion.div
                  key="step3"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-xl font-medium mb-6">Pickup Preferences</h2>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <label htmlFor="pickupDate" className="block text-sm font-medium">Preferred Pickup Date *</label>
                      <div className="ml-2 text-cause-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                    <input
                      type="date"
                      id="pickupDate"
                      name="pickupDate"
                      value={formState.pickupDate}
                      onChange={handleChange}
                      className="glass-input w-full"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Please select a date at least 24 hours in advance.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="pickupTimePreference" className="block text-sm font-medium mb-2">Preferred Time *</label>
                    <select
                      id="pickupTimePreference"
                      name="pickupTimePreference"
                      value={formState.pickupTimePreference}
                      onChange={handleChange}
                      className="glass-input w-full"
                      required
                    >
                      <option value="">Select a time</option>
                      <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                      <option value="Afternoon (12PM - 5PM)">Afternoon (12PM - 5PM)</option>
                      <option value="Evening (5PM - 8PM)">Evening (5PM - 8PM)</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="specialInstructions" className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={formState.specialInstructions}
                      onChange={handleChange}
                      placeholder="Parking information, access codes, or other details to help the volunteer"
                      rows={3}
                      className="glass-input w-full"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="btn btn-secondary order-2 sm:order-1"
                    >
                      Previous Step
                    </button>
                    <button 
                      type="button" 
                      onClick={nextStep}
                      className="btn btn-primary order-1 sm:order-2"
                    >
                      Review Donation
                    </button>
                  </div>
                </motion.div>
              )}
              
              {formStep === 4 && (
                <motion.div
                  key="step4"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-xl font-medium mb-6">Review & Submit</h2>
                  
                  <div className="bg-cause-100 rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-sm uppercase text-muted-foreground mb-3">Contact Information</h3>
                        <p className="mb-2">{formState.name}</p>
                        <p className="mb-2">{formState.email}</p>
                        <p className="mb-2">{formState.phone}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-sm uppercase text-muted-foreground mb-3">Pickup Location</h3>
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-cause-400 mt-1 mr-2 flex-shrink-0" />
                          <p>
                            {formState.address}, {formState.city}, {formState.zipCode}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-cause-200 my-4 pt-4">
                      <h3 className="font-medium text-sm uppercase text-muted-foreground mb-3">Donation Details</h3>
                      <p className="font-medium text-lg mb-1">{formState.itemTitle}</p>
                      <p className="inline-block bg-cause-200 text-cause-600 text-xs font-medium px-2 py-1 rounded mb-3">
                        {formState.itemCategory}
                      </p>
                      <p className="mb-3">{formState.itemDescription}</p>
                    </div>
                    
                    <div className="border-t border-cause-200 my-4 pt-4">
                      <h3 className="font-medium text-sm uppercase text-muted-foreground mb-3">Pickup Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-cause-400 mr-2" />
                          <span>{formState.pickupDate}</span>
                        </div>
                        <div>
                          <span>{formState.pickupTimePreference}</span>
                        </div>
                      </div>
                      {formState.specialInstructions && (
                        <div className="mt-3">
                          <div className="flex items-start">
                            <Info className="w-4 h-4 text-cause-400 mt-1 mr-2 flex-shrink-0" />
                            <p className="text-sm">{formState.specialInstructions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="accepted"
                        checked={formState.accepted}
                        onChange={e => setFormState(prev => ({ ...prev, accepted: e.target.checked }))}
                        className="mt-1 mr-3"
                      />
                      <span className="text-sm">
                        I confirm that the information provided is accurate and that I am the rightful owner of the items being donated. I understand that volunteers will contact me to arrange pickup.
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="btn btn-secondary"
                    >
                      Previous Step
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Donation'}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </section>
      
      <Footer />
    </AnimatedTransition>
  );
};

export default Donate;
