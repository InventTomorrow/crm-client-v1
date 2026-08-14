import type { Metadata } from 'next';
import { QualificationFormView } from '@/features/qualification/components/QualificationFormView';

export const metadata: Metadata = {
  title: 'Edit bot questions | AsaanRabta',
  description: 'Configure the questions your bot asks new leads and how their answers score them',
};

export default function QualificationEditPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <QualificationFormView />
    </div>
  );
}
