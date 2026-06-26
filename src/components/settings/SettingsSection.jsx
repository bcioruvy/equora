import { Card, CardHeader } from '../ui/Card';
import './SettingsSection.css';

export function SettingsSection({ title, subtitle, icon, children }) {
  return (
    <Card className="eq-settings-section">
      <CardHeader title={title} subtitle={subtitle} icon={icon} />
      <div className="eq-settings-section__body">{children}</div>
    </Card>
  );
}
