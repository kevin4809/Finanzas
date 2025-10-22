import { Download, Save, Upload } from 'lucide-react';

export default function BarraAcciones({ onExportarCSV, onGuardarDatos, onCargarDatos }) {
  return (
    <div className='flex gap-2 mb-6 flex-wrap'>
      <button
        onClick={onExportarCSV}
        className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition'
      >
        <Download size={20} />
        Exportar CSV
      </button>
      <button
        onClick={onGuardarDatos}
        className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition'
      >
        <Save size={20} />
        Guardar Datos
      </button>
      <label className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer'>
        <Upload size={20} />
        Cargar Datos
        <input type='file' accept='.json' onChange={onCargarDatos} className='hidden' />
      </label>
    </div>
  );
}
