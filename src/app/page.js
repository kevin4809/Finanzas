import ControlFinanciero from './components/Control-financiero';
import AuthWrapper from './components/AuthWrapper';

export default function Home() {
  return (
    <AuthWrapper>
      <ControlFinanciero />
    </AuthWrapper>
  );
}
