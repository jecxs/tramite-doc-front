// src/app/pdf-test/page.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Importar react-pdf dinámicamente SIN SSR
const Document = dynamic(() => import('react-pdf').then((mod) => mod.Document), { ssr: false });

const Page = dynamic(() => import('react-pdf').then((mod) => mod.Page), { ssr: false });

if (typeof window !== 'undefined') {
  import('react-pdf').then(({ pdfjs }) => {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  });
}

export default function SimplePDFTest() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoadPDF = async () => {
    if (!documentId.trim()) {
      setError('Debes ingresar un ID de documento');
      return;
    }

    setLoading(true);
    setError('');
    setPdfUrl('');

    try {
      const token = localStorage.getItem('access_token');
      const proxyUrl = `http://localhost:3000/api/documentos/${documentId}/content`;

      console.log('🔄 Cargando PDF desde proxy...');
      console.log('📍 URL:', proxyUrl);

      const response = await fetch(proxyUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      console.log('✅ Blob recibido:', {
        size: blob.size,
        type: blob.type,
      });

      // Verificar que sea un PDF
      if (!blob.type.includes('pdf')) {
        throw new Error(`Tipo de archivo incorrecto: ${blob.type}`);
      }

      const url = URL.createObjectURL(blob);
      console.log('📦 Blob URL creado:', url);

      setPdfUrl(url);
      setLoading(false);
    } catch (err: unknown) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message || 'Error desconocido' : 'Error desconocido');
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('✅ PDF cargado:', numPages, 'páginas');
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('❌ Error cargando PDF:', error);
    setError(error.message);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>🧪 Prueba Simple de React-PDF</h1>

      <div
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <label style={{ display: 'block', marginBottom: '15px' }}>
          <strong>ID del Documento:</strong>
          <input
            type='text'
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLoadPDF()}
            style={{
              display: 'block',
              marginTop: '8px',
              padding: '10px',
              width: '100%',
              maxWidth: '400px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
            placeholder='Ej: 123e4567-e89b-12d3-a456-426614174000'
          />
        </label>

        <button
          onClick={handleLoadPDF}
          disabled={loading || !documentId.trim()}
          style={{
            padding: '10px 24px',
            backgroundColor: loading || !documentId.trim() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || !documentId.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {loading ? '⏳ Cargando...' : '📄 Cargar PDF'}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            marginBottom: '20px',
            color: '#991b1b',
          }}
        >
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {pdfUrl && !error && (
        <div>
          <div
            style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
              border: '1px solid #bfdbfe',
            }}
          >
            <p style={{ margin: '5px 0' }}>
              <strong>✅ Estado:</strong> PDF cargado correctamente
            </p>
            {numPages && (
              <p style={{ margin: '5px 0' }}>
                <strong>📚 Páginas:</strong> {numPages}
              </p>
            )}
          </div>

          <div
            style={{
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                  <div>Renderizando PDF...</div>
                </div>
              }
              error={
                <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                  <div>Error al renderizar PDF</div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 100 : 800)}
              />
            </Document>

            {numPages && numPages > 0 && (
              <div
                style={{
                  marginTop: '20px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
              >
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: pageNumber <= 1 ? '#f3f4f6' : 'white',
                    cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  ← Anterior
                </button>

                <span style={{ padding: '0 16px', fontSize: '14px', fontWeight: '500' }}>
                  Página {pageNumber} de {numPages}
                </span>

                <button
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber >= numPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: pageNumber >= numPages ? '#f3f4f6' : 'white',
                    cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fcd34d',
        }}
      >
        <h3 style={{ marginTop: 0 }}>📋 Instrucciones:</h3>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Obtén un ID de documento válido desde el backend</li>
          <li>Pégalo en el campo de arriba</li>
          <li>Haz clic en &quot;Cargar PDF&quot; o presiona Enter</li>
          <li>Observa la consola del navegador para ver los logs detallados</li>
          <li>Si funciona, verás el PDF renderizado con navegación de páginas</li>
        </ol>

        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fff7ed',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <strong>💡 Tip:</strong> Asegúrate de estar logueado y tener permisos para ver el
          documento
        </div>
      </div>
    </div>
  );
}
