
"use client"; // Tambahin ini di baris paling pertama!

import React from 'react';

const TermsConditions = () => {
  return (
    <div style={{ 
      padding: '50px 20px', 
      color: '#fff', 
      backgroundColor: '#121212', 
      minHeight: '100vh', 
      lineHeight: '1.6',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#ff9800' }}>Syarat dan Ketentuan KALLPOLOSTORE</h1>
        <p>Terakhir diperbarui: 12 April 2026</p>
        <hr style={{ borderColor: '#333', marginBottom: '30px' }} />

        {/* ... isi konten lainnya sama seperti sebelumnya ... */}
        
        <section>
          <h3 style={{ color: '#ff9800' }}>HUBUNGI KAMI</h3>
          <p>WhatsApp: +6281310165338</p>
          <p>Email: cs@kallpolostore.id</p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;
