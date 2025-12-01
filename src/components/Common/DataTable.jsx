import React from 'react';

const DataTable = ({ columns = [], data = [], renderRowActions }) => {
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 20px rgba(2,6,23,0.04)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8fafc' }}>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: 'left', padding: '14px 18px', fontSize: 13, color: '#374151' }}>{c.title}</th>
            ))}
            <th style={{ padding: '14px 18px' }}></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} style={{ borderTop: '1px solid #f1f5f9' }}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: '12px 18px', verticalAlign: 'middle' }}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
              <td style={{ padding: '12px 18px', textAlign: 'right' }}>{renderRowActions ? renderRowActions(row) : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

