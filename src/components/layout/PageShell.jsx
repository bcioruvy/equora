import { useOutletContext } from 'react-router-dom';
import { TopBar } from './TopBar';
import { VerificationBanner } from '../auth/VerificationBanner';

export function PageShell({ title, subtitle, actions, children }) {
  const { onOpenMobileMenu } = useOutletContext() || {};
  return (
    <>
      <VerificationBanner />
      <TopBar title={title} subtitle={subtitle} actions={actions} onOpenMobileMenu={onOpenMobileMenu} />
      <div className="eq-page">{children}</div>
    </>
  );
}
