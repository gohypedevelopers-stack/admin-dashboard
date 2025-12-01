import React, { useMemo } from 'react';
import AdminTable from '../../components/Common/AdminTable';
import { apiRequest } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'type', label: 'Type', type: 'text' },
  { key: 'published', label: 'Published', type: 'text' },
];

const ContentManager = () => {
  const { data, loading, error } = useApiData(async () => {
    const [articlesRes, faqsRes] = await Promise.all([
      apiRequest('/api/admin/content/articles'),
      apiRequest('/api/admin/content/faqs'),
    ]);

    const normalizeList = (payload, type) => {
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.faqs)
          ? payload.faqs
          : Array.isArray(payload?.articles)
            ? payload.articles
            : Array.isArray(payload)
              ? payload
              : [];
      return list.map((item, idx) => ({
        id: item._id || item.id || `${type}-${idx + 1}`,
        title: item.title || item.question || '-',
        type,
        published: item.updatedAt
          ? item.updatedAt.slice(0, 10)
          : item.createdAt
            ? item.createdAt.slice(0, 10)
            : '-',
      }));
    };

    return [...normalizeList(articlesRes, 'Article'), ...normalizeList(faqsRes, 'FAQ')];
  }, []);

  const tableData = useMemo(() => data, [data]);

  return (
    <div style={{ padding: '20px' }}>
      {error && <div style={errorStyle}>{error}</div>}
      {loading ? (
        <div style={{ padding: '12px 0', color: '#475569' }}>Loading content...</div>
      ) : (
        <AdminTable title="Content Management" columns={COLUMNS} initialData={tableData} />
      )}
    </div>
  );
};

const errorStyle = {
  padding: '10px 12px',
  border: '1px solid #fecaca',
  borderRadius: 6,
  background: '#fee2e2',
  color: '#991b1b',
  marginBottom: 12,
  fontSize: 14
};

export default ContentManager;

