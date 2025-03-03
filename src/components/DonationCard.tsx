
import React from 'react';
import { Calendar, Map, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export interface DonationItem {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  image?: string;
  status: 'available' | 'claimed' | 'completed';
}

interface DonationCardProps {
  donation: DonationItem;
  onClaim?: (id: string) => void;
  isVolunteer?: boolean;
}

const DonationCard: React.FC<DonationCardProps> = ({ 
  donation, 
  onClaim,
  isVolunteer = false
}) => {
  const { id, title, category, description, location, date, image, status } = donation;
  
  const statusStyles = {
    available: 'bg-green-100 text-green-800',
    claimed: 'bg-orange-100 text-orange-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  return (
    <motion.div 
      className="glass-card overflow-hidden"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      {image && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cause-100 text-cause-600 mb-2">
              {category}
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Map className="mr-2 h-4 w-4 text-cause-400" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 text-cause-400" />
            <span>{date}</span>
          </div>
        </div>
        {isVolunteer && status === 'available' && (
          <button
            onClick={() => onClaim && onClaim(id)}
            className="w-full btn btn-primary mt-2 group"
          >
            <Package className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            Claim for Pickup
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DonationCard;
