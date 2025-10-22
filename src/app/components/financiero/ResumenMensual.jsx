export default function ResumenMensual({ datosResumen, formatCOP }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full border-collapse border border-gray-300'>
        <thead className='bg-blue-600 text-white'>
          <tr>
            <th className='border border-gray-300 p-3'>Mes</th>
            <th className='border border-gray-300 p-3'>Ingreso Total</th>
            <th className='border border-gray-300 p-3'>Obligaciones</th>
            <th className='border border-gray-300 p-3'>Gastos Personales</th>
            <th className='border border-gray-300 p-3'>Ahorro Total</th>
            <th className='border border-gray-300 p-3'>% Ahorro</th>
          </tr>
        </thead>
        <tbody>
          {datosResumen.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className='border border-gray-300 p-3 font-medium text-black'>{row.mes}</td>
              <td className='border border-gray-300 p-3 text-right text-black'>{formatCOP(row.ingresoTotal)}</td>
              <td className='border border-gray-300 p-3 text-right text-red-600'>{formatCOP(row.obligaciones)}</td>
              <td className='border border-gray-300 p-3 text-right text-orange-600'>{formatCOP(row.gastosPersonales)}</td>
              <td className={`border border-gray-300 p-3 text-right font-bold ${row.ahorroEnCuenta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCOP(row.ahorroEnCuenta)}
              </td>
              <td className='border border-gray-300 p-3 text-right font-bold text-blue-600'>{row.porcentajeAhorro}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
