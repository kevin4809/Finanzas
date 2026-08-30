'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calculator,
  CheckCircle2,
  Info,
  Landmark,
  Loader2,
  PiggyBank,
  RefreshCw,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import InputNumero from './InputNumero';
import {
  calcularCuotaCredito,
  calcularPerfilUsuario,
  evaluarViabilidadCredito,
  generarSugerenciasInversion,
  proyeccionInversion,
} from '@/lib/calculosFinancieros';

function IndicadorCard({ label, valor, sub, fuente, accent = 'indigo' }) {
  const accents = {
    indigo: 'stat-card stat-card-blue',
    green: 'stat-card stat-card-green',
    orange: 'stat-card stat-card-orange',
    red: 'stat-card stat-card-red',
  };

  return (
    <div className={accents[accent] || accents.indigo}>
      <p className='text-xs font-medium opacity-90 relative z-10 uppercase tracking-wide'>{label}</p>
      <p className='text-2xl font-bold font-display relative z-10 mt-1'>{valor}</p>
      {sub && <p className='text-xs opacity-75 relative z-10 mt-1'>{sub}</p>}
      {fuente && <p className='text-[10px] opacity-60 relative z-10 mt-2 leading-tight'>{fuente}</p>}
    </div>
  );
}

export default function PanelInversiones({ datosResumen, formatCOP }) {
  const [indicadores, setIndicadores] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const perfil = useMemo(() => calcularPerfilUsuario(datosResumen), [datosResumen]);

  const [capitalDisponible, setCapitalDisponible] = useState(0);
  const [montoNecesario, setMontoNecesario] = useState(120000000);
  const [plazoMeses, setPlazoMeses] = useState(120);
  const [modalidadCredito, setModalidadCredito] = useState('CONSUMO Y ORDINARIO');
  const [inicializado, setInicializado] = useState(false);

  const cargarIndicadores = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/indicadores');
      if (!res.ok) throw new Error('Error al cargar indicadores');
      const data = await res.json();
      setIndicadores(data);
    } catch {
      setError('No se pudieron cargar los indicadores económicos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarIndicadores();
  }, []);

  useEffect(() => {
    if (!inicializado && perfil.ahorroAcumulado > 0) {
      setCapitalDisponible(Math.round(perfil.ahorroAcumulado));
      setInicializado(true);
    }
  }, [perfil.ahorroAcumulado, inicializado]);

  const tasaSeleccionada = useMemo(() => {
    if (!indicadores?.tasasCredito) return null;
    return indicadores.tasasCredito.find((t) => t.modalidad === modalidadCredito);
  }, [indicadores, modalidadCredito]);

  const montoCredito = Math.max(0, montoNecesario - capitalDisponible);
  const cuotaMensual = tasaSeleccionada
    ? calcularCuotaCredito(montoCredito, tasaSeleccionada.tasa, plazoMeses)
    : 0;
  const totalPagado = cuotaMensual * plazoMeses;
  const totalIntereses = totalPagado - montoCredito;

  const viabilidad = evaluarViabilidadCredito({ cuotaMensual, perfil });

  const sugerencias = useMemo(() => {
    if (!indicadores || capitalDisponible <= 0) return [];
    return generarSugerenciasInversion({ capital: capitalDisponible, indicadores, perfil });
  }, [capitalDisponible, indicadores, perfil]);

  if (cargando) {
    return (
      <div className='flex flex-col items-center justify-center py-16 gap-4'>
        <Loader2 className='w-10 h-10 animate-spin text-indigo-500' />
        <p className='text-muted'>Consultando fuentes oficiales (datos.gov.co, Banco Mundial)...</p>
      </div>
    );
  }

  if (error || !indicadores) {
    return (
      <div className='section-red p-6 rounded-2xl text-center'>
        <AlertTriangle className='w-8 h-8 text-rose-500 mx-auto mb-3' />
        <p className='text-primary font-medium'>{error || 'Error desconocido'}</p>
        <button onClick={cargarIndicadores} className='btn-primary mt-4'>
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  const ibcConsumo = indicadores.tasasCredito?.find((t) => t.modalidad === 'CONSUMO Y ORDINARIO');

  return (
    <div className='space-y-8'>
      {/* Disclaimer */}
      <div className='section-blue p-4 rounded-xl flex gap-3 items-start'>
        <Info size={18} className='text-indigo-500 shrink-0 mt-0.5' />
        <div className='text-sm text-muted'>
          <p className='font-semibold text-primary mb-1'>Información de fuentes públicas oficiales</p>
          <p>{indicadores.disclaimer}</p>
          <p className='mt-1 text-xs opacity-75'>
            Actualizado: {new Date(indicadores.actualizadoEn).toLocaleString('es-CO')}
            {indicadores.errores?.length > 0 && ` · Parcial: ${indicadores.errores.join(', ')}`}
          </p>
        </div>
      </div>

      {/* Contexto económico */}
      <section>
        <h2 className='font-display font-bold text-xl text-primary mb-4 flex items-center gap-2'>
          <Landmark size={20} className='text-indigo-500' />
          Contexto económico Colombia
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {indicadores.trm && (
            <IndicadorCard
              label='TRM (USD/COP)'
              valor={formatCOP(indicadores.trm.valor)}
              sub={`Vigente desde ${new Date(indicadores.trm.vigenciaDesde).toLocaleDateString('es-CO')}`}
              fuente={indicadores.trm.fuente}
              accent='indigo'
            />
          )}
          {indicadores.inflacion && (
            <IndicadorCard
              label={`Inflación anual ${indicadores.inflacion.anio}`}
              valor={`${indicadores.inflacion.valor.toFixed(1)}%`}
              sub='IPC — variación anual'
              fuente={indicadores.inflacion.fuente}
              accent='orange'
            />
          )}
          {indicadores.tpm && (
            <IndicadorCard
              label='Tasa BanRep (TPM)'
              valor={`${indicadores.tpm.valor}% EA`}
              sub={indicadores.tpm.nota}
              fuente={indicadores.tpm.fuente}
              accent='red'
            />
          )}
          {ibcConsumo && (
            <IndicadorCard
              label='IBC Crédito consumo'
              valor={`${ibcConsumo.tasa}% EA`}
              sub={`Usura máx: ${ibcConsumo.tasaUsura}% · Res. ${ibcConsumo.resolucion}`}
              fuente='Superfinanciera — datos.gov.co'
              accent='green'
            />
          )}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4'>
          <div className='card p-4'>
            <p className='text-xs text-muted uppercase tracking-wide'>Salario mínimo {indicadores.smmlv.vigencia}</p>
            <p className='text-lg font-bold text-primary mt-1'>{formatCOP(indicadores.smmlv.valor)}</p>
            <p className='text-xs text-muted mt-1'>+ aux. transporte: {formatCOP(indicadores.smmlv.auxilioTransporte)}</p>
            <p className='text-[10px] text-muted mt-2'>{indicadores.smmlv.fuente}</p>
          </div>
          <div className='card p-4'>
            <p className='text-xs text-muted uppercase tracking-wide'>UVT {indicadores.uvt.vigencia}</p>
            <p className='text-lg font-bold text-primary mt-1'>{formatCOP(indicadores.uvt.valor)}</p>
            <p className='text-xs text-muted mt-1'>580 UVT renta: {formatCOP(indicadores.uvt.valor * 580)}</p>
            <p className='text-[10px] text-muted mt-2'>{indicadores.uvt.fuente}</p>
          </div>
          {indicadores.tasaDeposito && (
            <div className='card p-4'>
              <p className='text-xs text-muted uppercase tracking-wide'>Tasa depósitos {indicadores.tasaDeposito.anio}</p>
              <p className='text-lg font-bold text-primary mt-1'>{indicadores.tasaDeposito.valor.toFixed(2)}% EA</p>
              <p className='text-xs text-muted mt-1'>Referencia para CDT</p>
              <p className='text-[10px] text-muted mt-2'>{indicadores.tasaDeposito.fuente}</p>
            </div>
          )}
        </div>
      </section>

      {/* Tu perfil financiero */}
      <section>
        <h2 className='font-display font-bold text-xl text-primary mb-4 flex items-center gap-2'>
          <PiggyBank size={20} className='text-emerald-500' />
          Tu perfil financiero ({perfil.mesesAnalizados} meses)
        </h2>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
          <div className='card p-4'>
            <p className='text-xs text-muted'>Ingreso promedio</p>
            <p className='font-bold text-primary'>{formatCOP(perfil.promedioIngreso)}</p>
          </div>
          <div className='card p-4'>
            <p className='text-xs text-muted'>Gastos promedio</p>
            <p className='font-bold text-rose-500'>{formatCOP(perfil.promedioGastosTotal)}</p>
          </div>
          <div className='card p-4'>
            <p className='text-xs text-muted'>Ahorro promedio</p>
            <p className={`font-bold ${perfil.promedioAhorro >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatCOP(perfil.promedioAhorro)}
            </p>
          </div>
          <div className='card p-4'>
            <p className='text-xs text-muted'>Ahorro acumulado</p>
            <p className='font-bold text-indigo-500'>{formatCOP(perfil.ahorroAcumulado)}</p>
          </div>
        </div>
        <p className='text-xs text-muted mt-2'>
          Ingreso vs SMMLV: {(perfil.promedioIngreso / indicadores.smmlv.valor).toFixed(1)}x · Tasa ahorro: {perfil.tasaAhorroPromedio.toFixed(1)}%
        </p>
      </section>

      {/* Capital disponible + sugerencias */}
      <section>
        <h2 className='font-display font-bold text-xl text-primary mb-4 flex items-center gap-2'>
          <TrendingUp size={20} className='text-violet-500' />
          Posibilidades de inversión
        </h2>

        <div className='card p-4 mb-4'>
          <label className='font-medium text-primary text-sm'>Capital disponible para invertir</label>
          <div className='flex flex-col sm:flex-row gap-3 mt-2 items-stretch sm:items-center'>
            <InputNumero
              valor={capitalDisponible}
              onChange={setCapitalDisponible}
              className='input-field text-right font-bold flex-1 max-w-xs'
            />
            <button
              type='button'
              onClick={() => setCapitalDisponible(Math.round(perfil.ahorroAcumulado))}
              className='btn-ghost text-sm'
            >
              Usar ahorro acumulado
            </button>
          </div>
        </div>

        {capitalDisponible > 0 && indicadores.tasaDeposito && (
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4'>
            {[6, 12, 24].map((meses) => (
              <div key={meses} className='section-green p-4 rounded-xl border'>
                <p className='text-xs text-muted'>Proyección CDT ref. · {meses} meses</p>
                <p className='text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1'>
                  {formatCOP(proyeccionInversion(capitalDisponible, indicadores.tasaDeposito.valor, meses))}
                </p>
                <p className='text-xs text-muted mt-1'>
                  +{formatCOP(proyeccionInversion(capitalDisponible, indicadores.tasaDeposito.valor, meses) - capitalDisponible)} intereses est.
                </p>
              </div>
            ))}
          </div>
        )}

        <div className='space-y-3'>
          {sugerencias.map((s) => (
            <div key={s.id} className={`${s.color} p-4 rounded-xl border`}>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <span className='text-[10px] font-bold uppercase tracking-wider opacity-60'>{s.prioridad}</span>
                  <h3 className='font-semibold text-primary'>{s.titulo}</h3>
                  <p className='text-sm text-muted mt-1'>{s.descripcion}</p>
                  {s.fuente && <p className='text-[10px] text-muted mt-2'>Fuente: {s.fuente}</p>}
                </div>
                {s.tasaEA != null && (
                  <span className='text-lg font-bold text-indigo-500 shrink-0'>{s.tasaEA.toFixed?.(1) ?? s.tasaEA}% EA</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Calculadora de crédito */}
      <section>
        <h2 className='font-display font-bold text-xl text-primary mb-4 flex items-center gap-2'>
          <Calculator size={20} className='text-amber-500' />
          Calculadora de crédito
        </h2>

        <div className='card p-5 space-y-4'>
          <p className='text-sm text-muted'>
            Ejemplo: tienes capital y necesitas un monto mayor (vivienda, vehículo, etc.). Calculamos cuánto debes pedir prestado y si es viable con tus gastos actuales.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div>
              <label className='text-sm font-medium text-primary'>Capital disponible</label>
              <InputNumero valor={capitalDisponible} onChange={setCapitalDisponible} className='input-field w-full mt-1 text-right' />
            </div>
            <div>
              <label className='text-sm font-medium text-primary'>Monto total necesario</label>
              <InputNumero valor={montoNecesario} onChange={setMontoNecesario} className='input-field w-full mt-1 text-right' />
            </div>
            <div>
              <label className='text-sm font-medium text-primary'>Plazo (meses)</label>
              <select
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(parseInt(e.target.value))}
                className='select-field w-full mt-1'
              >
                <option value={12}>12 meses (1 año)</option>
                <option value={24}>24 meses (2 años)</option>
                <option value={36}>36 meses (3 años)</option>
                <option value={60}>60 meses (5 años)</option>
                <option value={84}>84 meses (7 años)</option>
                <option value={120}>120 meses (10 años)</option>
                <option value={180}>180 meses (15 años)</option>
                <option value={240}>240 meses (20 años)</option>
              </select>
            </div>
            <div>
              <label className='text-sm font-medium text-primary'>Modalidad de crédito</label>
              <select
                value={modalidadCredito}
                onChange={(e) => setModalidadCredito(e.target.value)}
                className='select-field w-full mt-1 text-sm'
              >
                {indicadores.tasasCredito?.map((t) => (
                  <option key={t.modalidad} value={t.modalidad}>
                    {t.modalidad} ({t.tasa}% EA)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {montoCredito > 0 && tasaSeleccionada ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2'>
                <div className='section-blue p-4 rounded-xl'>
                  <p className='text-xs text-muted'>Monto a financiar</p>
                  <p className='text-xl font-bold text-primary'>{formatCOP(montoCredito)}</p>
                  <p className='text-xs text-muted mt-1'>
                    {formatCOP(montoNecesario)} − {formatCOP(capitalDisponible)}
                  </p>
                </div>
                <div className='section-orange p-4 rounded-xl'>
                  <p className='text-xs text-muted'>Cuota mensual estimada</p>
                  <p className='text-xl font-bold text-primary'>{formatCOP(Math.round(cuotaMensual))}</p>
                  <p className='text-xs text-muted mt-1'>IBC {tasaSeleccionada.tasa}% EA · Res. {tasaSeleccionada.resolucion}</p>
                </div>
                <div className='section-red p-4 rounded-xl'>
                  <p className='text-xs text-muted'>Total intereses</p>
                  <p className='text-xl font-bold text-rose-500'>{formatCOP(Math.round(totalIntereses))}</p>
                  <p className='text-xs text-muted mt-1'>Total pagado: {formatCOP(Math.round(totalPagado))}</p>
                </div>
                <div className='section-green p-4 rounded-xl'>
                  <p className='text-xs text-muted'>Cuota / ingreso</p>
                  <p className='text-xl font-bold text-primary'>{viabilidad.cuotaSobreIngreso.toFixed(1)}%</p>
                  <p className='text-xs text-muted mt-1'>Regla práctica: ideal &lt; 30%</p>
                </div>
              </div>

              {/* Viabilidad */}
              <div
                className={`p-5 rounded-2xl border flex gap-4 items-start ${
                  viabilidad.viable ? 'section-green' : 'section-red'
                }`}
              >
                {viabilidad.viable ? (
                  <CheckCircle2 className='w-8 h-8 text-emerald-500 shrink-0' />
                ) : (
                  <XCircle className='w-8 h-8 text-rose-500 shrink-0' />
                )}
                <div className='flex-1'>
                  <h3 className='font-bold text-primary text-lg'>
                    {viabilidad.viable
                      ? viabilidad.nivel === 'comodo'
                        ? 'Crédito viable — margen cómodo'
                        : 'Crédito viable — ajustado'
                      : 'Crédito NO viable con tu perfil actual'}
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted'>Ingreso promedio</span>
                      <span className='font-medium text-primary'>{formatCOP(perfil.promedioIngreso)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted'>Gastos actuales</span>
                      <span className='font-medium text-rose-500'>{formatCOP(perfil.promedioGastosTotal)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted'>+ Cuota crédito</span>
                      <span className='font-medium text-amber-500'>{formatCOP(Math.round(cuotaMensual))}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted'>= Balance mensual</span>
                      <span className={`font-bold ${viabilidad.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {formatCOP(Math.round(viabilidad.balance))}
                      </span>
                    </div>
                  </div>
                  {!viabilidad.viable && (
                    <p className='text-sm text-muted mt-3'>
                      Necesitarías reducir gastos en{' '}
                      <strong>{formatCOP(Math.round(Math.abs(viabilidad.balance) + viabilidad.bufferMinimo))}</strong>{' '}
                      mensuales, o aumentar el plazo / capital inicial, para que sea viable (manteniendo 10% de colchón).
                    </p>
                  )}
                  {viabilidad.viable && viabilidad.nivel === 'ajustado' && (
                    <p className='text-sm text-muted mt-3'>
                      La cuota consume {viabilidad.cuotaSobreIngreso.toFixed(0)}% de tu ingreso. Considera un plazo mayor o más capital inicial para mayor tranquilidad.
                    </p>
                  )}
                </div>
              </div>

              {/* Escenarios de plazo */}
              <div>
                <h4 className='font-semibold text-primary mb-3 text-sm'>Comparar plazos (misma tasa IBC)</h4>
                <div className='overflow-x-auto'>
                  <table className='table-modern text-sm'>
                    <thead>
                      <tr>
                        <th>Plazo</th>
                        <th className='text-right'>Cuota</th>
                        <th className='text-right'>Total intereses</th>
                        <th className='text-right'>Balance</th>
                        <th className='text-center'>¿Viable?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[36, 60, 84, 120, 180, 240].map((meses) => {
                        const cuota = calcularCuotaCredito(montoCredito, tasaSeleccionada.tasa, meses);
                        const intereses = cuota * meses - montoCredito;
                        const viab = evaluarViabilidadCredito({ cuotaMensual: cuota, perfil });
                        return (
                          <tr key={meses} className={meses === plazoMeses ? 'bg-indigo-500/10' : ''}>
                            <td className='font-medium'>{meses} meses ({(meses / 12).toFixed(0)} años)</td>
                            <td className='text-right font-mono'>{formatCOP(Math.round(cuota))}</td>
                            <td className='text-right font-mono text-rose-500'>{formatCOP(Math.round(intereses))}</td>
                            <td className={`text-right font-mono ${viab.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {formatCOP(Math.round(viab.balance))}
                            </td>
                            <td className='text-center'>
                              {viab.viable ? (
                                <ArrowUpRight size={16} className='inline text-emerald-500' />
                              ) : (
                                <ArrowDownRight size={16} className='inline text-rose-500' />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className='section-green p-4 rounded-xl flex items-center gap-3'>
              <Banknote className='text-emerald-500' />
              <p className='text-sm text-primary'>
                {capitalDisponible >= montoNecesario
                  ? `¡Tienes suficiente capital! Te sobran ${formatCOP(capitalDisponible - montoNecesario)}.`
                  : 'Ingresa montos para calcular el crédito necesario.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Tabla tasas vigentes */}
      <section>
        <h2 className='font-display font-bold text-lg text-primary mb-3'>Tasas IBC vigentes (Superfinanciera)</h2>
        <div className='overflow-x-auto'>
          <table className='table-modern text-sm'>
            <thead>
              <tr>
                <th>Modalidad</th>
                <th className='text-right'>IBC (% EA)</th>
                <th className='text-right'>Usura máx. (×1.5)</th>
                <th>Vigencia</th>
              </tr>
            </thead>
            <tbody>
              {indicadores.tasasCredito?.map((t) => (
                <tr key={t.modalidad}>
                  <td className='font-medium'>{t.modalidad}</td>
                  <td className='text-right font-bold text-indigo-500'>{t.tasa}%</td>
                  <td className='text-right text-rose-500'>{t.tasaUsura}%</td>
                  <td className='text-xs text-muted'>
                    {new Date(t.vigenciaDesde).toLocaleDateString('es-CO')} — {new Date(t.vigenciaHasta).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
