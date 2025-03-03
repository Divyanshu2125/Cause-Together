
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Truck, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedTransition from '@/components/AnimatedTransition';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const statsData = [
  { number: '2,500+', label: 'Items Donated' },
  { number: '1,200+', label: 'Volunteer Pickups' },
  { number: '500+', label: 'Active Volunteers' },
  { number: '50+', label: 'Communities Served' },
];

const serviceSteps = [
  {
    icon: Gift,
    title: 'List Your Donation',
    description: 'Fill out our simple form to list items you wish to donate.',
  },
  {
    icon: Users,
    title: 'Get Matched',
    description: 'Our volunteers review your items and arrange for pickup.',
  },
  {
    icon: Truck,
    title: 'Easy Pickup',
    description: 'Volunteers come to your location at your preferred time.',
  },
  {
    icon: CheckCircle,
    title: 'Make an Impact',
    description: 'Your items find new homes and help those in need.',
  },
];

const testimonials = [
  {
    quote: "Cause Together made it so easy to donate my old books. The volunteer was friendly and the pickup was seamless.",
    author: "Sarah J.",
    role: "Donor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    quote: "As a volunteer, I get to connect with amazing donors while helping distribute resources to those who need them most.",
    author: "Michael T.",
    role: "Volunteer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  },
  {
    quote: "The platform is intuitive and makes coordinating pickups efficient. I can easily find donations in my neighborhood.",
    author: "Jessica R.",
    role: "Volunteer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
  }
];

const Index: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    })
  };

  return (
    <AnimatedTransition>
      <Header />
      
      {/* Hero section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        <div className="absolute top-0 inset-0 bg-gradient-to-br from-cause-100 to-cause-200 -z-10" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 tracking-tight">
                Connect, Donate, <span className="text-cause-500">Make a Difference</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Cause Together bridges the gap between donors and volunteers, making it easy to donate items and arrange pickups for a more sustainable, compassionate community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/donate" className="btn btn-primary text-base">
                  Donate Items
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link to="/volunteer-login" className="btn btn-secondary text-base">
                  Volunteer Login
                </Link>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1617450365226-9bf28c04e130?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
                alt="People volunteering together" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-full h-full border-4 border-white rounded-xl -z-10 opacity-70 translate-x-5 translate-y-5" />
          </motion.div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-cause-600 mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-cause-100">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">How It Works</h2>
            <p className="text-muted-foreground">Our simple four-step process makes donating and volunteering seamless.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceSteps.map((step, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                className="glass-card p-8 text-center h-full flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-cause-200 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-cause-500" />
                </div>
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">What People Say</h2>
            <p className="text-muted-foreground">
              Donors and volunteers share their experiences with Cause Together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                className="glass-card p-8 relative"
              >
                <div className="mb-6">
                  <svg width="45" height="36" className="text-cause-300" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 0C6.04501 0 0 6.04501 0 13.5C0 20.955 6.04501 27 13.5 27C18.5175 27 22.8675 24.0975 25.0425 19.89C25.0425 19.89 25.065 20.9025 25.065 22.5C25.065 29.43 19.4625 32.6925 19.4625 32.6925C19.4625 32.6925 25.65 31.095 29.25 24.8175C30.69 22.4325 31.5 17.7975 31.5 14.22C31.5 6.35999 25.6725 0 13.5 0ZM40.5 0C33.045 0 27 6.04501 27 13.5C27 20.955 33.045 27 40.5 27C45.5175 27 49.8675 24.0975 52.0425 19.89C52.0425 19.89 52.065 20.9025 52.065 22.5C52.065 29.43 46.4625 32.6925 46.4625 32.6925C46.4625 32.6925 52.65 31.095 56.25 24.8175C57.69 22.4325 58.5 17.7975 58.5 14.22C58.5 6.35999 52.6725 0 40.5 0Z" fill="currentColor"/>
                  </svg>
                </div>

                <blockquote className="mb-4 text-lg">"{testimonial.quote}"</blockquote>
                
                <div className="flex items-center mt-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cause-600 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Ready to Make a Difference?</h2>
            <p className="text-lg opacity-90 mb-8">
              Join our community of donors and volunteers today and be part of the positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate" className="btn bg-white text-cause-600 hover:bg-white/90 text-base">
                Donate Items
              </Link>
              <Link to="/volunteer-login" className="btn bg-transparent border-2 border-white hover:bg-white/10 text-base">
                Become a Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </AnimatedTransition>
  );
};

export default Index;
