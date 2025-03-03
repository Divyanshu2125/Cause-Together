
import React from 'react';
import { format } from 'date-fns';
import { Award, CheckCircle } from 'lucide-react';
import { User } from '@/types/database';

interface VolunteerCertificateProps {
  volunteer: User;
  stats: {
    totalPickups: number;
    totalDistributions: number;
    certificateEligible: boolean;
    certificateIssued: boolean;
    certificateDate?: string;
  };
  onClose: () => void;
}

const VolunteerCertificate = ({ volunteer, stats, onClose }: VolunteerCertificateProps) => {
  const certificateDate = stats.certificateDate 
    ? format(new Date(stats.certificateDate), 'MMMM dd, yyyy')
    : format(new Date(), 'MMMM dd, yyyy');

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-1 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="border-8 border-cause-100 rounded-lg p-8 bg-white">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Award className="h-16 w-16 text-cause-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-cause-800 uppercase tracking-wider mb-1">Certificate of Achievement</h2>
            <p className="text-lg font-medium text-cause-600 mb-6">Volunteer Excellence Award</p>
            
            <div className="my-8 py-6 border-t border-b border-dashed border-cause-200">
              <p className="text-lg text-gray-600 mb-2">This certificate is presented to</p>
              <h3 className="text-3xl font-bold text-cause-900 mb-2">{volunteer.name}</h3>
              <p className="text-lg text-gray-600">
                for outstanding contributions to our donation program
              </p>
            </div>
            
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-cause-700 mb-1">{stats.totalPickups}</div>
                <div className="text-sm uppercase tracking-wider text-gray-500">Items Picked Up</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-cause-700 mb-1">{stats.totalDistributions}</div>
                <div className="text-sm uppercase tracking-wider text-gray-500">Items Distributed</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-green-600">
                Achieved 50+ pickups and 50+ distributions milestone
              </p>
            </div>
            
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500">Issue Date</p>
                <p className="font-medium">{certificateDate}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-40 h-12 border-b border-gray-400 mb-2"></div>
                <p className="text-gray-500">Program Director</p>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-400">
              Certificate ID: CERT-{volunteer.id.substring(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerCertificate;
