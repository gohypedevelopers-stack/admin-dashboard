import { useEffect, useState } from 'react';

export const useApiData = (fetcher, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetcher()
      .then((res) => {
        if (!active) return;
        setData(res || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || 'Failed to load data');
        setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error };
};
