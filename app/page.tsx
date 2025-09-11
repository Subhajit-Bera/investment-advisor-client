"use client";
import { useState, useEffect } from 'react';
import apiClient from './lib/apiClient';
import { debounce } from 'lodash';

interface Company {
  id: number;
  name: string;
  ticker_symbol: string;
}

interface AnalysisResult {
  final_recommendation: string;
  recommendation_summary: string;
  pros: string[];
  cons: string[];
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = debounce(async (query: string) => {
    if (query.length > 2) {
      try {
        const response = await apiClient.get(`/api/data/search-companies?query=${query}`);
        setCompanies(response.data);
      } catch (err) {
        console.error("Failed to search companies", err);
      }
    } else {
      setCompanies([]);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleAnalyze = async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const startRes = await apiClient.post(`/api/analysis/start-analysis?ticker=${selectedCompany.ticker_symbol}`);
      setAnalysisId(startRes.data.analysis_id);
    } catch (err) {
      setError("Failed to start analysis.");
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!analysisId) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await apiClient.get(`/api/analysis/analysis-status/${analysisId}`);
        if (statusRes.data.status === 'completed') {
          setAnalysisResult(statusRes.data.result);
          setIsLoading(false);
          clearInterval(interval);
        } else if (statusRes.data.status === 'failed') {
          setError('Analysis failed.');
          setIsLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        setError('Could not fetch analysis status.');
        setIsLoading(false);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [analysisId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-cyan-400">AI Investment Advisor</h1>
      </header>

      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a company (e.g., AAPL)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
          {companies.length > 0 && (
            <ul className="absolute z-10 w-full bg-gray-700 mt-1 rounded-lg">
              {companies.map((c) => (
                <li
                  key={c.id}
                  onClick={() => {
                    setSelectedCompany(c);
                    setSearchTerm(c.name);
                    setCompanies([]);
                  }}
                  className="p-3 hover:bg-gray-600 cursor-pointer"
                >
                  {c.name} ({c.ticker_symbol})
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleAnalyze}
          disabled={!selectedCompany || isLoading}
          className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 font-bold py-3 rounded-lg disabled:bg-gray-500"
        >
          {isLoading ? 'Analyzing...' : 'Analyze for Investment'}
        </button>
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      </div>

      {analysisResult && (
        <div className="mt-12 max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl">
          <h2 className="text-3xl font-bold text-center mb-6">Analysis for: {selectedCompany?.name}</h2>
          <div className={`text-center p-4 rounded-lg mb-6 ${analysisResult.final_recommendation === 'Invest' ? 'bg-green-900' : 'bg-red-900'}`}>
            <h3 className="text-2xl font-bold">{analysisResult.final_recommendation}</h3>
            <p className="mt-1">{analysisResult.recommendation_summary}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-3 text-green-400">Pros</h4>
              <ul className="list-disc list-inside space-y-2">
                {analysisResult.pros.map((pro: string, i) => <li key={i}>{pro}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-3 text-red-400">Cons</h4>
              <ul className="list-disc list-inside space-y-2">
                {analysisResult.cons.map((con: string, i) => <li key={i}>{con}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}