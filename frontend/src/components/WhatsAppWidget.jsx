import React, { useEffect } from 'react';

const WhatsAppWidget = () => {
  useEffect(() => {
    // Load the script
    const script = document.createElement('script');
    script.src = 'https://d2mpatx37cqexb.cloudfront.net/delightchat-whatsapp-widget/embeds/embed.min.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize the widget once the script is loaded
    script.onload = () => {
      if (window._waEmbed) {
        window._waEmbed({
          btnColor: "#8b5cf6",
          ctaText: "WhatsApp Us",
          cornerRadius: 40,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
          btnPosition: "right",
          whatsAppNumber: "17609103762",
          welcomeMessage: "Send a message to us",
          zIndex: 999999,
          btnColorScheme: "light"
        });
      }
    };

    // Cleanup function to remove the script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return null; // This component doesn't render anything itself
};

export default WhatsAppWidget;