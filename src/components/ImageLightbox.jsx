import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

const ImageLightbox = ({ images, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToNext = () => {
    if (images && images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goToPrevious = () => {
    if (images && images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleDownload = () => {
    if (images && images[currentIndex]) {
      const link = document.createElement('a');
      link.href = images[currentIndex];
      link.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!isOpen || !images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <div 
      className="lightbox-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Header Controls */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 3001
        }}
      >
        <div style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: '600',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {currentIndex + 1} / {images.length}
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            <Download size={20} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            style={{
              position: 'absolute',
              left: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3001
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            style={{
              position: 'absolute',
              right: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3001
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Main Image */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {!imageLoaded && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '18px'
          }}>
            <div className="loading" style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
        
        <img
          src={currentImage}
          alt={`Image ${currentIndex + 1}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            transition: 'transform 0.3s ease',
            transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
            opacity: imageLoaded ? 1 : 0
          }}
          onClick={toggleZoom}
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div 
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            background: 'rgba(0,0,0,0.6)',
            padding: '16px 24px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            maxWidth: '80vw',
            overflowX: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) transparent'
          }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'pointer',
                border: index === currentIndex ? '3px solid white' : '3px solid transparent',
                transition: 'all 0.3s ease',
                opacity: index === currentIndex ? 1 : 0.7,
                transform: index === currentIndex ? 'scale(1.1)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.target.style.opacity = '0.7';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .lightbox-overlay::-webkit-scrollbar {
          width: 6px;
        }
        
        .lightbox-overlay::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default ImageLightbox;

