

## Project Overview

This is a personal financial control application built with Next.js 15 (App Router) and React 19. The application helps users track monthly income, expenses (obligations and personal spending), and savings across 12 months with bi-weekly (quincenal) detail tracking.

**Project Name**: control-financiero
**Tech Stack**: Next.js 15.5.6, React 19.1.0, Tailwind CSS 4, Lucide React icons

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Architecture

### Application Structure

The app follows Next.js 15 App Router conventions with modular component architecture:

**Main Pages:**
- [src/app/page.js](src/app/page.js) - Home page that renders the main ControlFinanciero component
- [src/app/layout.js](src/app/layout.js) - Root layout with Geist font configuration
- [src/app/globals.css](src/app/globals.css) - Global styles with Tailwind CSS 4 imports

**Components:**
- [src/app/components/Control-financiero.jsx](src/app/components/Control-financiero.jsx) - Main orchestrator component (client-side)
- [src/app/components/hooks/useFinanzas.js](src/app/components/hooks/useFinanzas.js) - Custom hook containing all state management and business logic
- [src/app/components/financiero/](src/app/components/financiero/) - Feature components:
  - `BarraAcciones.jsx` - Action buttons for export/save/load
  - `ResumenMensual.jsx` - Monthly summary table view
  - `DetalleQuincenal.jsx` - Bi-weekly detail view with month selector
  - `FormularioQuincena.jsx` - Form for a single bi-weekly period
  - `SeccionGastos.jsx` - Reusable component for obligation/expense sections
  - `AnalisisAnual.jsx` - Annual analysis dashboard with statistics

### Path Aliasing

The project uses `@/*` path alias configured in [jsconfig.json](jsconfig.json) to reference files from the `src` directory:

```javascript
import Component from '@/app/components/Component'
```

### State Management

The application uses a custom hook [useFinanzas.js](src/app/components/hooks/useFinanzas.js) that encapsulates all state and business logic. The main component [Control-financiero.jsx](src/app/components/Control-financiero.jsx) acts as an orchestrator that consumes this hook and passes data to child components.

**State variables (managed in `useFinanzas` hook):**
- `datosResumen` - Array of 12 months with calculated totals (income, obligations, personal expenses, savings, balance, savings percentage)
- `datosQuincenales` - Array of 12 months, each containing `quincena1` and `quincena2` objects with detailed expense breakdowns
- `mesSeleccionado` - Currently selected month index (0-11) for the bi-weekly detail view
- `activeSheet` - Active tab/view ('resumen', 'quincenal', or 'analisis')

**Functions exposed by hook:**
- State setters: `setMesSeleccionado`, `setActiveSheet`
- Update functions: `actualizarMontoQuincenal`, `actualizarAhorroQuincenal`
- Utility functions: `formatCOP`, `exportarACSV`, `guardarDatos`, `cargarDatos`
- Constants: `MESES`, `INGRESO_MENSUAL`, `INGRESO_QUINCENAL`

### Data Flow

1. User inputs expense amounts in the bi-weekly (quincenal) detail view
2. `actualizarMontoQuincenal` or `actualizarAhorroQuincenal` updates `datosQuincenales` state
3. `useEffect` hook triggers `recalcularResumen` whenever `datosQuincenales` changes
4. `recalcularResumen` calculates totals and updates `datosResumen` state
5. All views reactively update to show new calculated values

### Key Financial Logic

- **Fixed monthly income**: 4,000,000 COP (2,000,000 per quincena)
- **Expense categories**: Obligaciones (fixed obligations) and Gastos Personales (personal expenses)
- **Balance calculation**: Income - Obligations - Personal Expenses - Savings = Balance
- Each month has two quincenas (bi-weekly periods) with separate expense tracking
- Summary view aggregates bi-weekly data into monthly totals
- Analysis view shows annual totals and monthly averages

### Data Persistence

The app provides client-side data import/export:

- **Export to CSV**: `exportarACSV()` - Creates downloadable CSV with summary and bi-weekly details
- **Save JSON backup**: `guardarDatos()` - Downloads full application state as JSON
- **Load JSON backup**: `cargarDatos()` - Restores application state from uploaded JSON file

No backend or database is used; all data is stored in React state and optionally saved/loaded via file download/upload.

### Styling

- Uses Tailwind CSS 4 with the new `@import "tailwindcss"` syntax in [src/app/globals.css](src/app/globals.css)
- Tailwind configuration is inline via `@theme inline` directive in globals.css
- Custom color scheme with dark mode support via `prefers-color-scheme`
- Geist Sans and Geist Mono fonts loaded from Google Fonts
