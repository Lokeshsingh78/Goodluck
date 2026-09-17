import React from 'react';
import { useShop } from '../context/ShopContext';

export const WhatsAppButton = () => {
  const { currentView, selectedProductId, products } = useShop();
  const phoneNumber = '919829012345';

  let messageText = 'Hello Good Luck Society! I have a question regarding my order.';
  if (currentView === 'product' && selectedProductId) {
    const currentProd = products.find((p) => p.id === selectedProductId);
    if (currentProd) {
      messageText = `Hi Good Luck Society! I want to inquire about "${currentProd.name}" (${currentProd.price ? `₹${currentProd.price}` : ''}).`;
    }
  }

  const defaultMessage = encodeURIComponent(messageText);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      {/* Official WhatsApp Icon SVG */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.521.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
          fill="#FFFFFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12c0 2.152.68 4.144 1.836 5.776L2 22l4.382-1.81A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.088-1.125l-.293-.174-2.604 1.076 1.077-2.545-.192-.306A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"
          fill="#FFFFFF"
        />
      </svg>
    </a>
  );
};
