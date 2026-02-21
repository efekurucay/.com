import * as React from 'react';

interface ContactEmailTemplateProps {
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

export function ContactEmailTemplate({ 
  name, 
  email, 
  message, 
  timestamp 
}: ContactEmailTemplateProps) {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderBottom: '1px solid #e0e0e0' 
      }}>
        <h1 style={{ 
          margin: '0', 
          color: '#333333', 
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          📧 Yeni İletişim Mesajı
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          color: '#666666', 
          fontSize: '14px' 
        }}>
          Portfolio sitenizden yeni bir mesaj geldi
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {/* Sender Info */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '16px', 
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            margin: '0 0 12px 0', 
            color: '#333333', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            👤 Gönderen Bilgileri
          </h2>
          <p style={{ margin: '4px 0', color: '#333333', fontSize: '16px' }}>
            <strong>Ad:</strong> {name}
          </p>
          <p style={{ margin: '4px 0', color: '#333333', fontSize: '16px' }}>
            <strong>Email:</strong> 
            <a href={`mailto:${email}`} style={{ 
              color: '#0066cc', 
              textDecoration: 'none',
              marginLeft: '8px'
            }}>
              {email}
            </a>
          </p>
          <p style={{ margin: '4px 0', color: '#666666', fontSize: '14px' }}>
            <strong>Tarih:</strong> {timestamp}
          </p>
        </div>

        {/* Message */}
        <div>
          <h2 style={{ 
            margin: '0 0 12px 0', 
            color: '#333333', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            💬 Mesaj İçeriği
          </h2>
          <div style={{ 
            backgroundColor: '#ffffff', 
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '16px',
            whiteSpace: 'pre-wrap',
            fontSize: '16px',
            lineHeight: '1.5',
            color: '#333333'
          }}>
            {message}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a 
            href={`mailto:${email}?subject=Re: Portfolio İletişim Mesajı&body=Merhaba ${name},%0D%0A%0D%0AMesajınız için teşekkür ederim.%0D%0A%0D%0A`}
            style={{
              display: 'inline-block',
              backgroundColor: '#0066cc',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            📧 Yanıtla
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '16px', 
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center'
      }}>
        <p style={{ 
          margin: '0', 
          color: '#666666', 
          fontSize: '12px' 
        }}>
          Bu email efekurucay.com portfolio sitesinden gönderilmiştir
        </p>
      </div>
    </div>
  );
}