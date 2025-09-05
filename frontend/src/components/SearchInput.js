import React from 'react';

const SearchInput = ({ placeholder = 'Search...', onChange }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }}>🔍</span>
      <input
        placeholder={placeholder}
        onChange={onChange}
        style={{
          padding: '10px 12px 10px 34px',
          borderRadius: 9999,
          border: '2px solid #e0e0e0',
          outline: 'none'
        }}
      />
    </div>
  );
};

export default SearchInput;


