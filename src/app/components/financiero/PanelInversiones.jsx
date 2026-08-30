'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calculator,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
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
import {
  GLOSARIO,
  TIPOS_CREDITO,
  PRIORIDAD_LABEL,
  SECCIONES_AYUDA,
  nombreCreditoAmigable,
  formatearTasaAnual,
} from '@/lib/glosarioFinanciero';

function AyudaTermino({ termino, variant = 'default' }) {
  const info = GLOSARIO[termino];
  if (!info) return null;

  const onColor = variant === 'onColor';
  const triggerClass = onColor ? 'ayuda-trigger-on-color' : 'ayuda-trigger';
  const contenidoClass = onColor ? 'ayuda-contenido-on-color' : 'ayuda-contenido';
  const labelClass = onColor ? 'ayuda-label-on-color' : 'ayuda-label';

  const contenido = (
    <div className={contenidoClass}>
      <div>
        <p className={labelClass}>¿Qué es?</p>
        <p>{info.queEs ?? info.explicacion}</p>
      </div>
      {info.porQueImporta && (
        <div>
          <p className={labelClass}>¿Por qué te importa?</p>
          <p>{info.porQueImporta}</p>
        </div>
      )}
    </div>
  );

  return (
    <details className='group mt-1'>
      <summary className={triggerClass}>
        <HelpCircle size={12} />
        ¿Qué es {info.titulo}?
      </summary>
      {contenido}
    </details>
  );
}

function AyudaTipoCredito({ modalidad }) {
  const info = TIPOS_CREDITO[modalidad];
  if (!info) return null;

  return (
    <details className='group mt-1'>
      <summary className='ayuda-trigger'>
        <HelpCircle size={12} />
        ¿Para qué sirve este tipo de crédito?
      </summary>
      <div className='ayuda-contenido'>
        <div>
          <p className='ayuda-label'>¿Qué es?</p>
          <p>{info.queEs}</p>
        </div>
        <div>
          <p className='ayuda-label'>¿Por qué te importa?</p>
          <p>{info.porQueImporta}</p>
        </div>
      </div>
    </details>
  );
}

function NotaSeccion({ seccion }) {
  const info = SECCIONES_AYUDA[seccion];
  if (!info) return null;
  return (
    <div className='nota-seccion'>
      <p className='nota-seccion-titulo'>
        <Info size={13} className='text-indigo-500 dark:text-indigo-300' />
        ¿Por qué ver esto?
      </p>
      <p className='nota-seccion-texto'>{info.porQueImporta}</p>
    </div>
  );
}

function TarjetaPerfil({ label, valor, valorClass = 'text-primary', ayudaTermino }) {
  return (
    <div className='card p-4'>
      <p className='text-xs text-muted'>{label}</p>
      <p className={`font-bold ${valorClass}`}>{valor}</p>
      {ayudaTermino && <AyudaTermino termino={ayudaTermino} />}
    </div>
  );
}

function IndicadorCard({ label, valor, sub, ayudaTermino, accent = 'indigo' }) {
  const accents = {
    indigo: 'stat-card stat-card-blue',
    green: 'stat-card stat-card-green',
    orange: 'stat-card stat-card-orange',
    red: 'stat-card stat-card-red',
  };

  return (
    <div className={accents[accent] || accents.indigo}>
      <p className='text-xs font-medium opacity-90 relative z-10'>{label}</p>
      <p className='text-2xl font-bold font-display relative z-10 mt-1'>{valor}</p>
      {sub && <p className='text-xs opacity-75 relative z-10 mt-1'>{sub}</p>}
      {ayudaTermino && (
        <div className='relative z-10 mt-2'>
          <AyudaTermino termino={ayudaTermino} variant='onColor' />
        </div>
      )}
    </div>
  );
}

export default function PanelInversiones({ datosResumen, formatCOP }) {
  const [indicadores, setIndicadores] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarDetallesTecnicos, setMostrarDetallesTecnicos] = useState(false);

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
      setIndicadores(await res.json());
    } catch {
      setError('No pudimos cargar la información del país. Intenta de nuevo.');
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
        <p className='text-muted'>Cargando información del país...</p>
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

  const mensajeViabilidad = () => {
    if (!viabilidad.viable) return 'Con tus ingresos y gastos actuales, este crédito quedaría muy apretado';
    if (viabilidad.nivel === 'comodo') return '¡Sí te alcanza! Te sobraría dinero cada mes';
    return 'Te alcanza, pero quedarías con poco margen';
  };

  return (
    <div className='space-y-8'>
      {/* Intro amigable */}
      <div className='section-blue p-5 rounded-xl'>
        <h2 className='font-display font-bold text-lg text-primary mb-2'>¿Para qué sirve esto?</h2>
        <p className='text-sm text-muted leading-relaxed'>
          Aquí ves cómo va la economía del país, cuánto podrías ganar con tu ahorro y si un crédito te quedaría
          cómodo de pagar. Los números vienen de fuentes oficiales (gobierno y bancos).{' '}
          <strong className='text-primary'>No es asesoría financiera</strong> — úsalo como guía y confirma todo con tu banco.
        </p>
      </div>

      {/* Panorama del país */}
      <section>
        <h2 className='font-display font-bold text-xl text-primary mb-1 flex items-center gap-2'>
          <Landmark size={20} className='text-indigo-500' />
          Cómo va la economía
        </h2>
        <p className='text-sm text-muted mb-4'>Datos generales que afectan tu bolsillo</p>
        <NotaSeccion seccion='economia' />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {indicadores.trm && (
            <IndicadorCard
              label='Precio del dólar hoy'
              valor={formatCOP(indicadores.trm.valor)}
              sub='1 USD en pesos colombianos'
              ayudaTermino='trm'
              accent='indigo'
            />
          )}
          {indicadores.inflacion && (
            <IndicadorCard
              label={`Subida de precios (${indicadores.inflacion.anio})`}
              valor={`${indicadores.inflacion.valor.toFixed(1)}%`}
              sub='Cuánto subió el costo de vida en promedio'
              ayudaTermino='inflacion'
              accent='orange'
            />
          )}
          {indicadores.tpm && (
            <IndicadorCard
              label='Tasa del Banco de la República'
              valor={formatearTasaAnual(indicadores.tpm.valor)}
              sub='Referencia para créditos y ahorros'
              ayudaTermino='tpm'
              accent='red'
            />
          )}
          {ibcConsumo && (
            <IndicadorCard
              label='Interés promedio crédito personal'
              valor={formatearTasaAnual(ibcConsumo.tasa)}
              sub={`Máximo legal: ${formatearTasaAnual(ibcConsumo.tasaUsura)}`}
              ayudaTermino='ibc'
              accent='green'
            />
          )}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4'>
          <div className='card p-4'>
            <p className='text-sm text-muted'>Salario mínimo {indicadores.smmlv.vigencia}</p>
            <p className='text-lg font-bold text-primary mt-1'>{formatCOP(indicadores.smmlv.valor)}</p>
            <p className='text-xs text-muted mt-1'>+ transporte: {formatCOP(indicadores.smmlv.auxilioTransporte)}</p>
            <AyudaTermino termino='salarioMinimo' />
          </div>
          {indicadores.tasaDeposito && (
            <div className='card p-4'>
              <p className='text-sm text-muted'>Lo que paga un ahorro en banco</p>
              <p className='text-lg font-bold text-primary mt-1'>{formatearTasaAnual(indicadores.tasaDeposito.valor.toFixed(2))}</p>
              <p className='text-xs text-muted mt-1'>Referencia para CDT</p>
              <AyudaTermino termino='tasaDeposito' />
            </div>
          )}
          <div className='card p-4'>
            <p className='text-sm text-muted'>Tu ingreso vs salario mínimo</p>
            <p className='text-lg font-bold text-primary mt-1'>
              {(perfil.promedioIngreso / indicadores.smmlv.valor).toFixed(1)} veces el mínimo
            </p>
            <p className='text-xs text-muted mt-1'>
              Ganas {formatCOP(perfil.promedioIngreso)} en promedio
            </p>
            <AyudaTermino termino='ingresoPromedio' />
          </div>
        </div>
      </section>

      {/* Tu situación */}
      <section>
        <h2 className='font-display font-bold text-xl text-primary mb-1 flex items-center gap-2'>
          <PiggyBank size={20} className='text-emerald-500' />
          Tu situación de dinero
        </h2>
        <p className='text-sm text-muted mb-4'>Basado en lo que has registrado ({perfil.mesesAnalizados} meses)</p>
        <NotaSeccion seccion='perfil' />

        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
          <TarjetaPerfil
            label='Lo que ganas al mes'
            valor={formatCOP(perfil.promedioIngreso)}
            ayudaTermino='ingresoPromedio'
          />
          <TarjetaPerfil
            label='Lo que gastas al mes'
            valor={formatCOP(perfil.promedioGastosTotal)}
            valorClass='text-rose-500'
            ayudaTermino='gastosPromedio'
          />
          <TarjetaPerfil
            label='Lo que te sobra al mes'
            valor={formatCOP(perfil.promedioAhorro)}
            valorClass={perfil.promedioAhorro >= 0 ? 'text-emerald-500' : 'text-rose-500'}
            ayudaTermino='ahorroMensual'
          />
          <TarjetaPerfil
            label='Total ahorrado este año'
            valor={formatCOP(perfil.ahorroAcumulado)}
            valorClass='text-indigo-500'
            ayudaTermino='ahorroAcumulado'
          />
        </div>
      </section>

      {/* Inversiones */}
      <section>
        <h2 className='font-display font-bold text-xl text-primary mb-1 flex items-center gap-2'>
          <TrendingUp size={20} className='text-violet-500' />
          ¿Qué puedo hacer con mi ahorro?
        </h2>
        <p className='text-sm text-muted mb-4'>Ideas según cuánto dinero tienes disponible</p>
        <NotaSeccion seccion='inversion' />

        <div className='card p-4 mb-4'>
          <label className='font-medium text-primary text-sm'>¿Cuánto dinero tienes para invertir?</label>
          <p className='text-xs text-muted mt-0.5'>Puede ser lo que tienes ahorrado o un monto que planees juntar</p>
          <AyudaTermino termino='capitalInvertir' />
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
              Usar mi ahorro del año
            </button>
          </div>
        </div>

        {capitalDisponible > 0 && indicadores.tasaDeposito && (
          <div className='mb-4'>
            <p className='text-sm font-medium text-primary mb-2'>Si lo pones en un CDT del banco, podrías tener:</p>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {[6, 12, 24].map((meses) => {
                const total = proyeccionInversion(capitalDisponible, indicadores.tasaDeposito.valor, meses);
                const ganancia = total - capitalDisponible;
                return (
                  <div key={meses} className='section-green p-4 rounded-xl border'>
                    <p className='text-xs text-muted'>En {meses} meses</p>
                    <p className='text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1'>{formatCOP(total)}</p>
                    <p className='text-xs text-muted mt-1'>Ganarías ~{formatCOP(ganancia)} de intereses</p>
                  </div>
                );
              })}
            </div>
            <p className='text-xs text-muted mt-2'>* Estimación con tasa promedio del país. Tu banco puede ofrecer otra.</p>
            <AyudaTermino termino='cdt' />
          </div>
        )}

        <div className='space-y-3'>
          {sugerencias.map((s) => (
            <div key={s.id} className={`${s.color} p-4 rounded-xl border`}>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <span className='text-[10px] font-bold uppercase tracking-wider opacity-60'>
                    {PRIORIDAD_LABEL[s.prioridad] ?? s.prioridad}
                  </span>
                  <h3 className='font-semibold text-primary'>{s.titulo}</h3>
                  <p className='text-sm text-muted mt-1 leading-relaxed'>{s.descripcion}</p>
                </div>
                {s.tasaEA != null && (
                  <span className='text-sm font-bold text-indigo-500 shrink-0 text-right'>
                    {formatearTasaAnual(typeof s.tasaEA === 'number' ? s.tasaEA.toFixed(1) : s.tasaEA)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Calculadora crédito */}
      <section>
        <h2 className='font-display font-bold text-xl text-primary mb-1 flex items-center gap-2'>
          <Calculator size={20} className='text-amber-500' />
          ¿Me alcanza para un crédito?
        </h2>
        <p className='text-sm text-muted mb-4'>
          Ejemplo: tienes $30 millones y necesitas $120 millones para algo. ¿Cuánto pagarías al mes? ¿Te alcanza?
        </p>
        <NotaSeccion seccion='credito' />

        <div className='card p-5 space-y-4'>
          <AyudaTermino termino='credito' />
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div>
              <label className='text-sm font-medium text-primary'>Dinero que ya tienes</label>
              <p className='text-xs text-muted'>Cuota inicial, ahorros, etc.</p>
              <InputNumero valor={capitalDisponible} onChange={setCapitalDisponible} className='input-field w-full mt-1 text-right' />
              <AyudaTermino termino='cuotaInicial' />
            </div>
            <div>
              <label className='text-sm font-medium text-primary'>Cuánto necesitas en total</label>
              <p className='text-xs text-muted'>Precio de la casa, carro, etc.</p>
              <InputNumero valor={montoNecesario} onChange={setMontoNecesario} className='input-field w-full mt-1 text-right' />
            </div>
            <div>
              <label className='text-sm font-medium text-primary'>Tiempo para pagar</label>
              <select
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(parseInt(e.target.value))}
                className='select-field w-full mt-1'
              >
                <option value={12}>1 año</option>
                <option value={24}>2 años</option>
                <option value={36}>3 años</option>
                <option value={60}>5 años</option>
                <option value={84}>7 años</option>
                <option value={120}>10 años</option>
                <option value={180}>15 años</option>
                <option value={240}>20 años</option>
              </select>
              <AyudaTermino termino='plazo' />
            </div>
            <div>
              <label className='text-sm font-medium text-primary'>Tipo de crédito</label>
              <select
                value={modalidadCredito}
                onChange={(e) => setModalidadCredito(e.target.value)}
                className='select-field w-full mt-1 text-sm'
              >
                {indicadores.tasasCredito?.map((t) => (
                  <option key={t.modalidad} value={t.modalidad}>
                    {nombreCreditoAmigable(t.modalidad)} ({t.tasa}%/año)
                  </option>
                ))}
              </select>
              {TIPOS_CREDITO[modalidadCredito] && (
                <div className='mt-1'>
                  <p className='text-xs text-muted'>Ej: {TIPOS_CREDITO[modalidadCredito].ejemplos}</p>
                  <AyudaTipoCredito modalidad={modalidadCredito} />
                </div>
              )}
            </div>
          </div>

          {montoCredito > 0 && tasaSeleccionada ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2'>
                <div className='section-blue p-4 rounded-xl'>
                  <p className='text-xs text-muted'>Debes pedir prestado</p>
                  <p className='text-xl font-bold text-primary'>{formatCOP(montoCredito)}</p>
                  <p className='text-xs text-muted mt-1'>
                    {formatCOP(montoNecesario)} − {formatCOP(capitalDisponible)}
                  </p>
                </div>
                <div className='section-orange p-4 rounded-xl'>
                  <p className='text-xs text-muted'>Pagarías al mes (aprox.)</p>
                  <p className='text-xl font-bold text-primary'>{formatCOP(Math.round(cuotaMensual))}</p>
                  <p className='text-xs text-muted mt-1'>Interés ref: {formatearTasaAnual(tasaSeleccionada.tasa)}</p>
                  <AyudaTermino termino='cuotaMensual' />
                </div>
                <div className='section-red p-4 rounded-xl'>
                  <p className='text-xs text-muted'>Extra que pagas por intereses</p>
                  <p className='text-xl font-bold text-rose-500'>{formatCOP(Math.round(totalIntereses))}</p>
                  <p className='text-xs text-muted mt-1'>Total al final: {formatCOP(Math.round(totalPagado))}</p>
                  <AyudaTermino termino='intereses' />
                </div>
                <div className='section-green p-4 rounded-xl'>
                  <p className='text-xs text-muted'>La cuota es el…</p>
                  <p className='text-xl font-bold text-primary'>{viabilidad.cuotaSobreIngreso.toFixed(0)}%</p>
                  <p className='text-xs text-muted mt-1'>de lo que ganas. Lo ideal: menos del 30%</p>
                  <AyudaTermino termino='cuotaSobreIngreso' />
                </div>
              </div>

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
                  <h3 className='font-bold text-primary text-lg'>{mensajeViabilidad()}</h3>
                  <p className='text-sm text-muted mt-2 leading-relaxed'>
                    Cada mes ganarías {formatCOP(perfil.promedioIngreso)}, gastas {formatCOP(perfil.promedioGastosTotal)} y
                    la cuota sería {formatCOP(Math.round(cuotaMensual))}.{' '}
                    {viabilidad.viable ? (
                      <>
                        Te quedarían <strong className='text-emerald-600'>{formatCOP(Math.round(viabilidad.balance))}</strong> libres.
                      </>
                    ) : (
                      <>
                        Te faltarían <strong className='text-rose-600'>{formatCOP(Math.round(Math.abs(viabilidad.balance)))}</strong> al mes.
                      </>
                    )}
                  </p>
                  {!viabilidad.viable && (
                    <p className='text-sm text-muted mt-3'>
                      Opciones: pedir menos dinero, pagar en más tiempo, juntar más cuota inicial, o reducir gastos en{' '}
                      <strong>{formatCOP(Math.round(Math.abs(viabilidad.balance) + viabilidad.bufferMinimo))}</strong>/mes.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className='font-semibold text-primary mb-1 text-sm'>¿Qué pasa si cambio el tiempo de pago?</h4>
                <p className='text-xs text-muted mb-3'>Más tiempo = cuota más baja, pero pagas más intereses</p>
                <div className='overflow-x-auto'>
                  <table className='table-modern text-sm'>
                    <thead>
                      <tr>
                        <th>Tiempo</th>
                        <th className='text-right'>Cuota/mes</th>
                        <th className='text-right'>Intereses totales</th>
                        <th className='text-right'>Te sobra/mes</th>
                        <th className='text-center'>¿Alcanza?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[36, 60, 84, 120, 180, 240].map((meses) => {
                        const cuota = calcularCuotaCredito(montoCredito, tasaSeleccionada.tasa, meses);
                        const intereses = cuota * meses - montoCredito;
                        const viab = evaluarViabilidadCredito({ cuotaMensual: cuota, perfil });
                        return (
                          <tr key={meses} className={meses === plazoMeses ? 'bg-indigo-500/10' : ''}>
                            <td className='font-medium'>{meses / 12} años</td>
                            <td className='text-right font-mono'>{formatCOP(Math.round(cuota))}</td>
                            <td className='text-right font-mono text-rose-500'>{formatCOP(Math.round(intereses))}</td>
                            <td className={`text-right font-mono ${viab.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {formatCOP(Math.round(viab.balance))}
                            </td>
                            <td className='text-center'>
                              {viab.viable ? (
                                <ArrowUpRight size={16} className='inline text-emerald-500' title='Sí alcanza' />
                              ) : (
                                <ArrowDownRight size={16} className='inline text-rose-500' title='No alcanza' />
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
              <Banknote className='text-emerald-500 shrink-0' />
              <p className='text-sm text-primary'>
                {capitalDisponible >= montoNecesario
                  ? `¡Ya tienes suficiente! Te sobran ${formatCOP(capitalDisponible - montoNecesario)}.`
                  : 'Completa los montos arriba para ver cuánto pagarías.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Detalles técnicos colapsables */}
      <section>
        <button
          type='button'
          onClick={() => setMostrarDetallesTecnicos(!mostrarDetallesTecnicos)}
          className='flex items-center gap-2 text-sm text-muted hover:text-primary transition w-full'
        >
          <ChevronDown size={16} className={`transition-transform ${mostrarDetallesTecnicos ? 'rotate-180' : ''}`} />
          {mostrarDetallesTecnicos ? 'Ocultar' : 'Ver'} detalles técnicos (tasas oficiales completas)
        </button>

        {mostrarDetallesTecnicos && (
          <div className='mt-4 space-y-4'>
            <div className='section-blue p-4 rounded-xl flex gap-2 items-start text-xs text-muted'>
              <Info size={14} className='shrink-0 mt-0.5' />
              <p>
                Esta tabla es la versión oficial de la Superfinanciera. IBC = Interés Bancario Corriente.
                Usura = interés máximo que puede cobrar legalmente un banco (1.5× el IBC).
                Actualizado: {new Date(indicadores.actualizadoEn).toLocaleString('es-CO')}
              </p>
            </div>
            <div className='overflow-x-auto'>
              <table className='table-modern text-sm'>
                <thead>
                  <tr>
                    <th>Tipo de crédito</th>
                    <th className='text-right'>Tasa promedio</th>
                    <th className='text-right'>Máximo legal</th>
                    <th>Vigencia</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.tasasCredito?.map((t) => (
                    <tr key={t.modalidad}>
                      <td>
                        <span className='font-medium'>{nombreCreditoAmigable(t.modalidad)}</span>
                        <span className='block text-xs text-muted'>{t.modalidad}</span>
                      </td>
                      <td className='text-right font-bold text-indigo-500'>{t.tasa}%/año</td>
                      <td className='text-right text-rose-500'>{t.tasaUsura}%/año</td>
                      <td className='text-xs text-muted'>
                        {new Date(t.vigenciaDesde).toLocaleDateString('es-CO')} — {new Date(t.vigenciaHasta).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
