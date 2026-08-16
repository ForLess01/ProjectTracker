import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Upload, X, Check, FileSpreadsheet, AlertCircle, RefreshCw, 
  ArrowRight, FileText, Sparkles, HelpCircle, Eye, ChevronDown, 
  Layers, Database, FileUp
} from 'lucide-react';
import { normalizeStatus } from './SheetTableApp.jsx';

const VIEW_SAMPLE_DATA = {
  ideas: `Idea,Contexto,Dónde se aplica,Estado,Notas
"Migración a WebSockets","Mejorar sincronización en tiempo real de filas y cursores","SheetTableApp / Backend","En Progreso","Evaluar latencia con 50 usuarios"
"Diseño de Dashboard KPI","Visualizar métricas de velocidad y cuellos de botella","Hub Principal","Por Hacer","Requiere wireframes de UI"
"Exportación PDF / XLSX","Permitir descargar reportes ejecutivos con gráficas","Módulo de Exportación","Borrador","Solicitado por equipo de operaciones"`,
  bugs: `Problema,Severidad,Módulo,Estado,Notas
"Falla al renderizar imágenes pesadas en modal","Alta","Masonry Gallery","En Corrección","Ocurre en archivos > 5MB"
"El scroll horizontal se congela en safari","Media","SheetTable","Por Investigar","Posible issue con backdrop-filter"
"Error 401 intermitente al refrescar sesión","Crítica","Auth / API","En Pruebas","Revisar expiración de cookie"`,
  optimizaciones: `Mejora,Impacto,Esfuerzo,Estado,Notas
"Virtualización de filas en tablas masivas","Alto","Medio","En Optimización","Permite +10,000 registros a 60fps"
"Compresión WebP automática en subida de capturas","Medio","Bajo","Optimizado","Reduce consumo de ancho de banda 70%"
"Cacheo en memoria para miembros del equipo","Medio","Bajo","Por Optimizar","Acelera render de selector de responsables"`,
  implementaciones: `Funcionalidad,Prioridad,Sprint / Fase,Estado,Notas
"Integración con Webhooks de GitHub","P1","Sprint 3","En Desarrollo","Disparar eventos al hacer push / PR"
"Modo offline con sincronización diferida","P2","Sprint 4","Backlog","Guardar cambios en IndexedDB"
"Filtros avanzados por múltiples condiciones","P1","Sprint 2","Desplegado","Soporta AND/OR en cualquier columna"`
};

const VIEW_COLUMNS_CONFIG = {
  ideas: [
    { key: 'title', label: 'Idea (Título)', aliases: ['idea', 'titulo', 'title', 'nombre', 'name', 'tarea', 'asunto'] },
    { key: 'context', label: 'Contexto', aliases: ['contexto', 'context', 'descripcion', 'description', 'detalle'] },
    { key: 'location', label: 'Dónde se aplica', aliases: ['donde se aplica', 'donde', 'ubicacion', 'location', 'modulo', 'area', 'lugar'] },
    { key: 'status', label: 'Estado', aliases: ['estado', 'status', 'fase', 'etapa'] },
    { key: 'notes', label: 'Notas', aliases: ['notas', 'notes', 'comentarios', 'observaciones'] },
  ],
  bugs: [
    { key: 'title', label: 'Problema (Título)', aliases: ['problema', 'bug', 'issue', 'titulo', 'title', 'nombre', 'error', 'falla'] },
    { key: 'severity', label: 'Severidad', aliases: ['severidad', 'severity', 'gravedad', 'nivel'] },
    { key: 'location', label: 'Módulo', aliases: ['modulo', 'module', 'seccion', 'componente', 'ubicacion', 'location'] },
    { key: 'status', label: 'Estado', aliases: ['estado', 'status'] },
    { key: 'notes', label: 'Notas', aliases: ['notas', 'notes', 'comentarios'] },
  ],
  optimizaciones: [
    { key: 'title', label: 'Mejora (Título)', aliases: ['mejora', 'optimizacion', 'titulo', 'title', 'nombre', 'feature'] },
    { key: 'impact', label: 'Impacto', aliases: ['impacto', 'impact', 'beneficio', 'alcance'] },
    { key: 'effort', label: 'Esfuerzo', aliases: ['esfuerzo', 'effort', 'dificultad', 'costo', 'tiempo'] },
    { key: 'status', label: 'Estado', aliases: ['estado', 'status'] },
    { key: 'notes', label: 'Notas', aliases: ['notas', 'notes', 'comentarios'] },
  ],
  implementaciones: [
    { key: 'title', label: 'Funcionalidad (Título)', aliases: ['funcionalidad', 'feature', 'titulo', 'title', 'tarea', 'item'] },
    { key: 'priority', label: 'Prioridad', aliases: ['prioridad', 'priority', 'p'] },
    { key: 'sprint', label: 'Sprint / Fase', aliases: ['sprint', 'fase', 'etapa', 'milestone', 'version'] },
    { key: 'status', label: 'Estado', aliases: ['estado', 'status'] },
    { key: 'notes', label: 'Notas', aliases: ['notas', 'notes', 'comentarios'] },
  ],
};

// Robust RFC 4180 CSV parser supporting custom delimiter, quotes, newlines, escaped quotes
function parseCsvContent(rawText, delimiter = ',', hasHeaders = true) {
  if (!rawText || !rawText.trim()) {
    return { headers: [], rows: [] };
  }

  const effectiveDelimiter = delimiter === '\\t' ? '\t' : delimiter;
  const lines = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    const nextChar = rawText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === effectiveDelimiter) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // Ignore carriage return
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Push remaining cell
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  if (hasHeaders && lines.length > 0) {
    const headers = lines[0].map((h, idx) => (h && h.trim() ? h.trim() : `Columna ${idx + 1}`));
    const rows = lines.slice(1);
    return { headers, rows };
  } else {
    const maxCols = Math.max(...lines.map(l => l.length), 1);
    const headers = Array.from({ length: maxCols }, (_, idx) => `Columna ${idx + 1}`);
    return { headers, rows: lines };
  }
}

export default function CsvImportModal({
  isOpen,
  onClose,
  currentView = 'ideas',
  onImportSuccess,
  showToast
}) {
  const [csvText, setCsvText] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [customDelimiter, setCustomDelimiter] = useState('');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [columnMapping, setColumnMapping] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef(null);

  const availableViewColumns = useMemo(() => {
    return VIEW_COLUMNS_CONFIG[currentView] || VIEW_COLUMNS_CONFIG.ideas;
  }, [currentView]);

  const activeDelimiter = delimiter === 'custom' ? (customDelimiter || ',') : delimiter;

  // Parse CSV
  const { headers, rows } = useMemo(() => {
    return parseCsvContent(csvText, activeDelimiter, hasHeaders);
  }, [csvText, activeDelimiter, hasHeaders]);

  // Auto-map columns when headers or view change
  useEffect(() => {
    if (!headers || headers.length === 0) {
      setColumnMapping({});
      return;
    }

    const mapping = {};
    headers.forEach((hdr, colIdx) => {
      const normalizedHeader = hdr.toLowerCase().trim();
      const matchedCol = availableViewColumns.find(vCol => {
        return vCol.key === normalizedHeader || 
               vCol.aliases.some(alias => normalizedHeader.includes(alias) || alias.includes(normalizedHeader));
      });

      if (matchedCol) {
        mapping[colIdx] = matchedCol.key;
      } else if (colIdx < availableViewColumns.length) {
        mapping[colIdx] = availableViewColumns[colIdx].key;
      } else {
        mapping[colIdx] = 'ignore';
      }
    });

    setColumnMapping(mapping);
  }, [headers, availableViewColumns]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 280);
  };

  const handleLoadSample = () => {
    const sample = VIEW_SAMPLE_DATA[currentView] || VIEW_SAMPLE_DATA.ideas;
    setCsvText(sample);
    setDelimiter(',');
    setHasHeaders(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCsvText(content);
        // Auto-detect delimiter from first line
        const firstLine = content.split('\n')[0] || '';
        if (firstLine.includes(';') && !firstLine.includes(',')) {
          setDelimiter(';');
        } else if (firstLine.includes('\t')) {
          setDelimiter('\\t');
        } else if (firstLine.includes('|')) {
          setDelimiter('|');
        } else {
          setDelimiter(',');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const handleColumnMapChange = (colIdx, targetFieldKey) => {
    setColumnMapping(prev => ({
      ...prev,
      [colIdx]: targetFieldKey
    }));
  };

  // Convert parsed rows to item objects
  const preparedItems = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    return rows.map((rowCells, rIdx) => {
      const itemData = {
        viewType: currentView,
        title: '',
        context: '',
        location: '',
        severity: 'Media',
        impact: 'Medio',
        effort: 'Medio',
        priority: 'P2',
        sprint: 'Sprint 1',
        status: 'backlog',
        notes: '',
      };

      rowCells.forEach((cellVal, colIdx) => {
        const fieldKey = columnMapping[colIdx];
        if (!fieldKey || fieldKey === 'ignore') return;

        if (fieldKey === 'status') {
          itemData.status = normalizeStatus(cellVal);
        } else {
          itemData[fieldKey] = cellVal;
        }
      });

      // Guarantee non-empty title
      if (!itemData.title || !itemData.title.trim()) {
        itemData.title = `Fila importada #${rIdx + 1}`;
      }

      return itemData;
    });
  }, [rows, columnMapping, currentView]);

  const handleImportSubmit = async () => {
    if (preparedItems.length === 0) {
      showToast?.('No hay filas válidas para importar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewType: currentView,
          items: preparedItems
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const count = data.count || preparedItems.length;
      showToast?.(`✨ ¡Se importaron ${count} filas con éxito a ${currentView}!`);
      
      if (onImportSuccess) {
        onImportSuccess();
      }
      handleClose();
    } catch (err) {
      console.error('Error importing CSV items:', err);
      showToast?.('Error al importar filas. Revisa el formato del archivo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  const modalContent = (
    <div 
      className={`csv-modal-backdrop ${isClosing ? 'is-closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`csv-modal-container ${isClosing ? 'is-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="csv-modal-header">
          <div className="csv-modal-identity">
            <div className="csv-modal-icon-badge">
              <Upload className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="csv-modal-title">Subir e Importar CSV</h2>
                <span className="csv-modal-view-tag">Vista: {currentView}</span>
              </div>
              <p className="csv-modal-subtitle">
                Pega tu código CSV o sube un archivo para insertar filas masivamente en la tabla.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="csv-modal-btn-close"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="csv-modal-body">
          
          {/* Controls Bar: Delimiter + Header Toggle + Sample */}
          <div className="csv-controls-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Delimiter Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-300">Separador / Delimitador:</span>
                <div className="csv-delimiter-selector">
                  {[
                    { id: ',', label: 'Coma (,)' },
                    { id: ';', label: 'Punto y coma (;)' },
                    { id: '\\t', label: 'Tab (\\t)' },
                    { id: '|', label: 'Pipe (|)' },
                    { id: ' ', label: 'Espacio ( )' },
                    { id: 'custom', label: 'Otro' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDelimiter(item.id)}
                      className={`csv-delimiter-btn ${delimiter === item.id ? 'is-active' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {delimiter === 'custom' && (
                  <input
                    type="text"
                    maxLength={3}
                    value={customDelimiter}
                    onChange={(e) => setCustomDelimiter(e.target.value)}
                    placeholder="Ej: :"
                    className="csv-custom-delimiter-input"
                    autoFocus
                  />
                )}
              </div>

              {/* Quick Actions: Sample + Headers Check */}
              <div className="flex items-center gap-4">
                <label className="csv-checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasHeaders}
                    onChange={(e) => setHasHeaders(e.target.checked)}
                    className="csv-checkbox-input"
                  />
                  <span>1ra fila son encabezados</span>
                </label>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="csv-btn-sample"
                  title="Cargar texto de ejemplo para esta vista"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cargar Ejemplo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Text Area & Drag-Drop Zone */}
          <div 
            className={`csv-editor-zone ${isDragging ? 'is-dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="csv-editor-top-bar">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Código CSV / Texto plano</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.txt,.tsv"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="csv-btn-file-select"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Seleccionar archivo .csv / .txt</span>
                </button>
              </div>
            </div>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Pega aquí el código CSV con separador "${activeDelimiter === '\t' ? 'Tab' : activeDelimiter}" o arrastra tu archivo...`}
              className="csv-textarea-editor"
              rows={6}
              spellCheck={false}
            />
          </div>

          {/* Live Preview Section */}
          {rows && rows.length > 0 ? (
            <div className="csv-preview-section">
              <div className="csv-preview-header">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Vista Previa de Filas a Insertar ({preparedItems.length})
                  </span>
                </div>
                <span className="csv-preview-badge">
                  {headers.length} columnas detectadas
                </span>
              </div>

              {/* Table Preview */}
              <div className="csv-preview-table-wrapper">
                <table className="csv-preview-table">
                  <thead>
                    <tr>
                      <th className="csv-th-index">#</th>
                      {headers.map((hdr, colIdx) => (
                        <th key={colIdx} className="csv-th-col">
                          <div className="flex flex-col gap-1.5">
                            <span className="csv-header-raw-name" title={hdr}>{hdr}</span>
                            <div className="csv-mapping-select-wrapper">
                              <select
                                value={columnMapping[colIdx] || 'ignore'}
                                onChange={(e) => handleColumnMapChange(colIdx, e.target.value)}
                                className="csv-mapping-select"
                              >
                                <option value="ignore">❌ Ignorar columna</option>
                                <optgroup label={`Campos de ${currentView}`}>
                                  {availableViewColumns.map(col => (
                                    <option key={col.key} value={col.key}>
                                      👉 {col.label}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                              <ChevronDown className="csv-select-arrow" />
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((rowCells, rIdx) => (
                      <tr key={rIdx} className="csv-preview-tr">
                        <td className="csv-td-index">{rIdx + 1}</td>
                        {headers.map((_, colIdx) => (
                          <td key={colIdx} className="csv-td-cell">
                            {rowCells[colIdx] !== undefined && rowCells[colIdx] !== '' ? (
                              <span className="csv-cell-text">{rowCells[colIdx]}</span>
                            ) : (
                              <span className="csv-cell-empty">(vacío)</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > 5 && (
                <div className="csv-preview-footer-note">
                  Mostrando las primeras 5 filas de un total de {rows.length} registros que se añadirán a la base de datos.
                </div>
              )}
            </div>
          ) : csvText.trim() ? (
            <div className="csv-empty-preview-warning">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>No se detectaron filas válidas con el separador seleccionado. Prueba cambiando el delimitador.</span>
            </div>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="csv-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            className="csv-btn-cancel"
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={isSubmitting || preparedItems.length === 0}
            className="csv-btn-submit"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Importando {preparedItems.length} filas...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Insertar {preparedItems.length} {preparedItems.length === 1 ? 'Fila' : 'Filas'} en {currentView}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
