export default function ResumenMensual({ datosResumen, formatCOP }) {
  return (
    <div className='overflow-x-auto -mx-4 sm:-mx-6'>
      <div className='px-4 sm:px-6'>
        <table className='table-modern'>
          <thead>
            <tr>
              <th>Mes</th>
              <th className='text-right'>Ingreso Total</th>
              <th className='text-right'>Obligaciones</th>
              <th className='text-right'>Gastos Personales</th>
              <th className='text-right'>Ahorro Total</th>
              <th className='text-right'>% Ahorro</th>
            </tr>
          </thead>
          <tbody>
            {datosResumen.map((row, idx) => (
              <tr key={idx}>
                <td className='font-semibold text-primary'>{row.mes}</td>
                <td className='text-right font-mono text-sm text-primary'>{formatCOP(row.ingresoTotal)}</td>
                <td className='text-right font-mono text-sm text-rose-500'>{formatCOP(row.obligaciones)}</td>
                <td className='text-right font-mono text-sm text-amber-500'>{formatCOP(row.gastosPersonales)}</td>
                <td className={`text-right font-mono text-sm font-bold ${row.ahorroEnCuenta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {formatCOP(row.ahorroEnCuenta)}
                </td>
                <td className='text-right font-bold text-indigo-500'>{row.porcentajeAhorro}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
