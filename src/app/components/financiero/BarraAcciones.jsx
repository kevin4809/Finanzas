import { Download, Save, Upload, CloudUpload } from 'lucide-react';

export default function BarraAcciones({ onExportarCSV, onGuardarDatos, onCargarDatos, onGuardarManual }) {
  return (
    <div className='flex gap-2 mb-6 flex-wrap'>
      <button onClick={onExportarCSV} className='btn-success'>
        <Download size={18} />
        Exportar CSV
      </button>
      {onGuardarManual && (
        <button onClick={onGuardarManual} className='btn-indigo' title='Ctrl+S'>
          <CloudUpload size={18} />
          Guardar ahora
        </button>
      )}
      <button onClick={onGuardarDatos} className='btn-primary'>
        <Save size={18} />
        Backup JSON
      </button>
      <label className='btn-ghost cursor-pointer'>
        <Upload size={18} />
        Cargar Datos
        <input type='file' accept='.json' onChange={onCargarDatos} className='hidden' />
      </label>
    </div>
  );
}
