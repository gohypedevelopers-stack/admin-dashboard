import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Trash2, Save, X } from 'lucide-react';
import './admin-table.css';

const AdminTable = ({ title, columns, initialData }) => {
  const [data, setData] = useState(initialData);
  const [mode, setMode] = useState('view'); // view, edit, delete
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const itemsPerPage = 15;

  // Search filter
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const searchLower = searchTerm.toLowerCase();
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  // Handlers
  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditData({ ...row });
  };

  const handleSave = () => {
    setData(data.map((row) => (row.id === editingId ? editData : row)));
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    setData(data.filter((row) => row.id !== deleteId));
    setDeleteId(null);
  };

  const handleFieldChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  useEffect(() => {
    setData(initialData);
    setCurrentPage(1);
  }, [initialData]);

  return (
    <div className="admin-table-container">
      <div className="table-header">
        <h2>{title}</h2>
        <div className="table-mode-tabs">
          <button
            className={`mode-tab ${mode === 'view' ? 'active' : ''}`}
            onClick={() => setMode('view')}
          >
            View
          </button>
          <button
            className={`mode-tab ${mode === 'edit' ? 'active' : ''}`}
            onClick={() => setMode('edit')}
          >
            Edit
          </button>
          <button
            className={`mode-tab ${mode === 'delete' ? 'active' : ''}`}
            onClick={() => setMode('delete')}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {mode !== 'view' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (mode !== 'view' ? 1 : 0)} className="empty-state">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className={deleteId === row.id ? 'delete-hover' : ''}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {mode === 'view' || editingId !== row.id ? (
                        <span>{row[col.key]}</span>
                      ) : (
                        <input
                          type={col.type || 'text'}
                          value={editData[col.key] || ''}
                          onChange={(e) => handleFieldChange(col.key, e.target.value)}
                          className="edit-input"
                        />
                      )}
                    </td>
                  ))}

                  {mode === 'edit' && (
                    <td className="action-cell">
                      {editingId === row.id ? (
                        <div className="action-buttons">
                          <button className="btn-save" onClick={handleSave} title="Save">
                            <Save size={16} />
                          </button>
                          <button className="btn-cancel" onClick={handleCancel} title="Cancel">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(row)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  )}

                  {mode === 'delete' && (
                    <td className="action-cell">
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="pagination-info">
          Showing {paginatedData.length > 0 ? startIdx + 1 : 0} to{' '}
          {Math.min(startIdx + itemsPerPage, filteredData.length)} of {filteredData.length}
        </span>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="page-indicator">
            {currentPage} of {Math.max(1, totalPages)}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {deleteId && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn-cancel-modal" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
