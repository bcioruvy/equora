import { Download, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import './ReportCard.css';

export function ReportCard({ icon, title, description, onExportPDF, onExportCSV, onExportExcel }) {
  return (
    <Card className="eq-report-card">
      <div className="eq-report-card__icon"><FileText size={18} /></div>
      <h3 className="eq-report-card__title">{title}</h3>
      <p className="eq-report-card__desc">{description}</p>
      <div className="eq-report-card__actions">
        <Button size="sm" variant="secondary" onClick={onExportCSV}>CSV</Button>
        <Button size="sm" variant="secondary" onClick={onExportExcel}>Excel</Button>
        <Button size="sm" icon={<Download size={14} />} onClick={onExportPDF}>PDF</Button>
      </div>
    </Card>
  );
}
