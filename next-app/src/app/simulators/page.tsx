import { TopicCatalog } from '@/features/physics-simulators/components/TopicCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simuladores de Física | Devs-Project',
  description: 'Módulo interactivo de simuladores de física para aprendizaje visual de cinemática y dinámica.',
};

export default function SimulatorsPage() {
  return <TopicCatalog />;
}
