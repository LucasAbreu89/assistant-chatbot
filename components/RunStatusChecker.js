// components/RunStatusChecker.js
import { useState } from 'react';

const RunStatusChecker = ({ threadId, runId, setRunStatus = (status) => console.log('Dummy status:', status) }) => {
  // console.log({ threadId, runId, setRunStatus }); // Verifique as props aqui
  // console.log('RunStatusChecker props:', { threadId, runId, setRunStatus });

  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkRunStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkRun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId, runId }),
      });
      const data = await res.json();

      setCheckResult(data);
      if (data && data.status) {
        setRunStatus(data.status);}
        console.log("Run Status:", data.status);
        console.log(setRunStatus); // Isto deve mostrar a função, não 'undefined'


    } catch (error) {
      console.error("Error checking run status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={checkRunStatus} disabled={loading}>
        {loading ? 'Checking...' : 'Check Status'}
      </button>
      {/* {checkResult && <div><pre>{JSON.stringify(checkResult, null, 2)}</pre></div>} */}
      {checkResult && <div>Status: {checkResult.status}</div>}
    </div>
  );
  }
export default RunStatusChecker;
