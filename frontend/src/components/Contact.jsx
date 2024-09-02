import React from 'react';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-nfl-blue mb-6">Contact Us</h2>
          <div className="space-y-6">
            <ContactItem 
              icon={<FaPhone className="text-nfl-gold" />}
              title="Phone"
              content="(619) 627-1629"
            />
            <ContactItem 
              icon={<FaEnvelope className="text-nfl-gold" />}
              title="Email"
              content="info@footballeliminator.com"
            />
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">You can also reach us via WhatsApp:</p>
              <div className="inline-block bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition duration-300">
                <a href="https://wa.me/17609103762" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <FaWhatsapp className="mr-2" />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, title, content }) {
  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-nfl-blue">{title}</h3>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  );
}

export default Contact;