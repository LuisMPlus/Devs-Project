import React from 'react';
import { notFound } from 'next/navigation';
import { getSimulatorById } from '@/features/physics-simulators/simulators';
import { SimulatorWorkbench } from '@/features/physics-simulators/components/SimulatorWorkbench';

interface SimulatorPageProps {
  params: Promise<{
    topic: string;
    simulatorId: string;
  }>;
}

export async function generateMetadata({ params }: SimulatorPageProps) {
  const { simulatorId } = await params;
  const sim = getSimulatorById(simulatorId);
  return {
    title: sim ? `${sim.title} | Simuladores de Física` : 'Simulador no encontrado',
    description: sim?.description,
  };
}

export default async function SimulatorDetailPage({ params }: SimulatorPageProps) {
  const { simulatorId } = await params;
  const sim = getSimulatorById(simulatorId);

  if (!sim) {
    notFound();
  }

  return <SimulatorWorkbench simulatorId={simulatorId} />;
}

