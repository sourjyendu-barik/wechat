import { useCallback, useEffect, useRef, useState } from "react";

const useAxios = (apiResult) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const apiRef = useRef(apiResult); //creating a reference
  apiRef.current = apiResult; //stored the whole function in ref object

  const isMounted = useRef(false);
  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRef.current();
      if (isMounted.current) {
        setData(res?.data);
      }
    } catch (error) {
      if (isMounted.current) {
        setError(error?.response?.data || error?.message || "Unknown error");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    isMounted.current = true;
    execute();
    return () => {
      isMounted.current = false;
    };
  }, [execute]);

  return { loading, data, error, refetch: execute };
};

export default useAxios;
