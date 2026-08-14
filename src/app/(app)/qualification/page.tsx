import type { Metadata } from 'next';
import { QualificationPreviewView } from '@/features/qualification/components/QualificationPreviewView';

export const metadata: Metadata = {
  title: 'Bot questions | AsaanRabta',
  description: 'Review the questions your bot asks new leads and how their answers score them',
};

export default function QualificationPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <QualificationPreviewView />
    </div>
  );
}
