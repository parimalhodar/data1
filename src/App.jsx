import React, { useState } from 'react';
import CourtCaseProcessor from './components/Processor';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const processor = new CourtCaseProcessor();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSummary(null);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const data = await processor.readExcelFile(file, (percent) => {
        setProgress(percent);
      });

      const processedData = processor.processData(data);
      const summaryData = processor.generateSummary(processedData);
      setSummary(summaryData);

      // Download the processed Excel file
      processor.downloadExcel(processedData, 'processed_data.xlsx');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Court Case Processor</h1>
      </header>

      <main className="App-main">
        <div className="file-upload">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={processing}
          />
          <button
            onClick={handleProcess}
            disabled={!file || processing}
          >
            {processing ? 'Processing...' : 'Process File'}
          </button>
        </div>

        {progress > 0 && progress < 100 && (
          <div className="progress">
            <progress value={progress} max="100" />
            <span>{progress}%</span>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {summary && (
          <div className="summary">
            <h2>Processing Summary</h2>
            <ul>
              <li>Total Records: {summary.totalRecordsProcessed}</li>
              <li>Pending Cases: {summary.pendingCases}</li>
              <li>Disposed Cases: {summary.disposedCases}</li>
              <li>Civil Cases: {summary.civilCases}</li>
              <li>Criminal Cases: {summary.criminalCases}</li>
              <li>Average Age of Pending Cases: {summary.avgAgePending} years</li>
              <li>Duplicates Found: {summary.duplicatesFound}</li>
              <li>Duplicates Removed: {summary.duplicatesRemoved}</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 