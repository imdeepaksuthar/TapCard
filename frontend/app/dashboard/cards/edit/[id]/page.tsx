'use client';

import { useParams } from 'next/navigation';
import CardForm from '../../CardForm';

export default function EditCardPage() {
  const params = useParams();
  const id = params.id as string;
  
  return <CardForm id={id} />;
}
